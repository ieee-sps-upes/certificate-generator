from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from io import BytesIO
from urllib.parse import unquote
from login import student_login_route
from generator import generate_certificate_image
from email_handler import send_otp_email
from config import PORT
import uuid
import time
import random

app = Flask(__name__)
CORS(app)

from database import get_db

@app.route('/api/login', methods=['POST'])
def login():
    return student_login_route()

@app.route('/api/send-otp', methods=['POST'])
def send_otp():
    try:
        data   = request.json
        email  = (data.get("email")  or "").strip()
        name   = (data.get("name")   or "").strip()
        sap_id = (data.get("sap_id") or "").strip()

        if not name:
            return jsonify({"error": "Name is required"}), 400
        if sap_id and not sap_id.isdigit():
            return jsonify({"error": "SAP ID must contain numbers only"}), 400

        import re
        def esc(s):
            return re.escape(s)

        db = get_db()
        participant     = None
        recipient_email = None

        # ── RULE A: Name + Email ──────────────────────────────────────────────
        if email:
            participant = db["ieee_participants"].find_one({
                "email": {"$regex": f"^{esc(email)}$", "$options": "i"},
                "name":  {"$regex": f"^{esc(name)}$",  "$options": "i"},
            })
            if participant:
                recipient_email = participant["email"]

        # ── RULE B: Name + SAP ID (only for participants with no email in DB) ─
        if not participant:
            if not sap_id:
                return jsonify({"error": "Please check your details, user not found."}), 404

            sap_match = db["ieee_participants"].find_one({
                "sap_id": sap_id,
                "name":   {"$regex": f"^{esc(name)}$", "$options": "i"},
            })

            if not sap_match:
                return jsonify({"error": "Please check your details, user not found."}), 404

            if sap_match.get("email"):
                return jsonify({"error": "Please check your details, user not found."}), 400

            if not email:
                return jsonify({"error": "Please check your details, user not found."}), 400

            participant     = sap_match
            recipient_email = email


        # ─────────────────────────────────────────────────────────────────────
        # Common: generate & send OTP
        # ─────────────────────────────────────────────────────────────────────
        otp = str(random.randint(100000, 999999))

        db["otp_store"].update_one(
            {"email": recipient_email},
            {"$set": {
                "otp": otp,
                "expires_at": int(time.time()) + 600,
                "participant_id": str(participant["_id"])  # store so generate-certificate can find participant regardless of email
            }},
            upsert=True
        )

        success = send_otp_email(recipient_email, otp)
        if success:
            at_idx  = recipient_email.index("@")
            visible = recipient_email[:2]
            masked  = visible + ("*" * (at_idx - 2)) + recipient_email[at_idx:]
            return jsonify({
                "message":    "OTP sent successfully",
                "email_hint": masked,
                "email":      recipient_email
            }), 200
        else:
            return jsonify({"error": "Failed to send OTP email"}), 500

    except Exception as e:
        import traceback
        print(f"Error in send_otp: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


@app.route('/api/generate-certificate', methods=['POST'])
def generate_certificate_endpoint():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400

        email = data.get("email")
        otp = data.get("otp")
        
        # We can hardcode or default event_name and team_id if not provided
        event_name = data.get("event_name", "IEEE Event")
        team_id = data.get("team_id", "IEEE")

        if not email or not otp:
            return jsonify({
                "error": "email and otp are required"
            }), 400

        db = get_db()

        # Verify OTP
        otp_record = db["otp_store"].find_one({"email": email})
        if not otp_record or otp_record.get("otp") != otp:
            return jsonify({"error": "Invalid OTP"}), 400
            
        if otp_record.get("expires_at", 0) < int(time.time()):
            return jsonify({"error": "OTP has expired"}), 400

        # Retrieve participant — prefer lookup by stored participant_id (handles no-email-in-DB case)
        from bson import ObjectId
        participant_id = otp_record.get("participant_id")
        if participant_id:
            participant = db["ieee_participants"].find_one({"_id": ObjectId(participant_id)})
        else:
            participant = db["ieee_participants"].find_one({"email": email})
        if not participant:
            return jsonify({"error": "Participant not found"}), 404

        participant_name = participant["name"]

        # Clear OTP after successful use
        db["otp_store"].delete_one({"email": email})

        # Generate cert_id
        cert_id = str(uuid.uuid4())
        
        # Save to DB
        certificate_doc = {
            "cert_id": cert_id,
            "name": participant_name,
            "event_name": event_name,
            "team_id": team_id,
            "created_at": int(time.time())
        }

        existing = db["workshop_certificate"].find_one({
            "name": participant_name,
            "event_name": event_name,
            "team_id": team_id
        })

        if not existing:
            db["workshop_certificate"].insert_one(certificate_doc)
        else:
            cert_id = existing.get("cert_id")
            if not cert_id:
                cert_id = str(uuid.uuid4())
                db["workshop_certificate"].update_one({"_id": existing["_id"]}, {"$set": {"cert_id": cert_id}})

        return jsonify({
            "message": "Certificate metadata saved successfully",
            "data": {
                "cert_id": cert_id,
                "participant_name": participant_name,
                "event_name": event_name,
                "team_id": team_id,
                "download_url": f"/api/download-certificate/{cert_id}"
            }
        }), 200

    except Exception as e:
        import traceback
        print(f"Error in generate_certificate_endpoint: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/api/download-certificate/<path:certificate_id>')
def download_certificate(certificate_id):
    try:
        # URL decode the certificate_id to handle encoded slashes
        decoded_id = unquote(certificate_id)
        
        print(f"Attempting to download certificate with ID: {decoded_id}")
        # Get certificate info from database using the certificate ID
        db = get_db()
        certificate_doc = db['workshop_certificate'].find_one({"$or": [{"cert_id": decoded_id}, {"s3_key": decoded_id}]})
        
        if not certificate_doc:
            print(f"Certificate not found for ID: {decoded_id}")
            return jsonify({"error": "Certificate not found"}), 404
        
        participant_name = certificate_doc.get("name")
        if not participant_name:
            return jsonify({"error": "Participant name not found in record"}), 500

        # Generate on the fly
        img_io = generate_certificate_image(participant_name)
        
        filename = f"certificate_{participant_name.replace(' ', '_')}.png"
        
        print(f"Successfully generated and serving certificate: {filename}")
        return send_file(
            img_io,
            mimetype='image/png',
            as_attachment=True,
            download_name=filename
        )
        
    except Exception as e:
        import traceback
        print(f"Error in download_certificate: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/api/certificates/<team_id>', methods=['GET'])
def get_certificates(team_id):
    try:
        if not team_id:
            return jsonify({"error": "Team ID is required"}), 400
            
        # Logic to retrieve certificates for a specific team
        db = get_db()
        certificates_collection = db['workshop_certificate']
        
        certificates = list(certificates_collection.find(
            {"team_id": team_id},
            {"_id": 0}
        ))
        
        # Add download URLs to each certificate
        for cert in certificates:
            cert_id = cert.get('cert_id') or cert.get('s3_key')
            cert['download_url'] = f"/api/download-certificate/{cert_id}"
        
        return jsonify({
            "certificates": certificates,
            "count": len(certificates)
        }), 200
        
    except Exception as e:
        import traceback
        print(f"Error in get_certificates: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        "status": "Backend is running"
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=PORT)