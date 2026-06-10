from database import get_db
from flask import request, jsonify

db = get_db()

def student_login_route():
    data = request.json or {}

    hypeid = data.get("hypeid", "").strip()
    sapid = data.get("password", "").strip()  # sapid only for attendance

    if not hypeid:
        return jsonify({"error": "hypeid required"}), 400

    # 1️⃣ TRY ATTENDANCE LOGIN (hypeid + sapid)
    if sapid:
        try:
            sapid_int = int(sapid)
        except ValueError:
            return jsonify({"error": "Invalid SAP ID format"}), 400

        attendance = db["attendance"].find_one({
            "hypId": hypeid,
            "sapId": sapid_int
        })

        if attendance:
            return jsonify({
                "message": "Login successful",
                "source": "attendance",
                "hypeid": hypeid,
                "user_data": {
                    "name": attendance.get("name", ""),
                    "hypId": attendance.get("hypId", ""),
                    "sapId": attendance.get("sapId", ""),
                }
            }), 200

    # 2️⃣ TRY WORKSHOP_FEEDBACK LOGIN (hypeid ONLY)
    workshop_user = db["Workshop_feedback"].find_one({
        "hypeid": hypeid   # ⚠️ correct column name
    })

    if workshop_user:
        return jsonify({
            "message": "Login successful",
            "source": "workshop_feedback",
            "hypeid": hypeid,
            "user_data": {
                "name": workshop_user.get("name", ""),
                "hypeid": workshop_user.get("hypeid", ""),
            }
        }), 200

    # 3️⃣ NOTHING MATCHED
    return jsonify({"error": "Invalid credentials"}), 401
