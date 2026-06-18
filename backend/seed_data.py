import sys
from database import get_db


def seed_user():
    print("=== IEEE Certificate Portal - Add User ===")

    # Get user input
    name = input("Enter participant's Full Name: ").strip()
    email = input("Enter participant's Email Address: ").strip()
    while True:
        sap_id = input("Enter participant's SAP ID (press Enter to skip): ").strip()
        if sap_id == '' or sap_id.isdigit():
            break
        print("  Error: SAP ID must contain numbers only. Please try again.")

    if not name or not email:
        print("Error: Both Name and Email are required!")
        sys.exit(1)

    db = get_db()

    # Build user document
    user = {
        "name":  name,
        "email": email,
    }
    if sap_id:
        user["sap_id"] = sap_id

    # Check if the email already exists
    existing = db["ieee_participants"].find_one({"email": email})

    if existing:
        print(f"\nUser with email '{email}' already exists.")
        print("Updating their record in the database...")
        update_fields = {"name": name, "email": email}
        if sap_id:
            update_fields["sap_id"] = sap_id
        db["ieee_participants"].update_one(
            {"email": email},
            {"$set": update_fields}
        )
        print("✅ Successfully updated!")
    else:
        db["ieee_participants"].insert_one(user)
        print(f"\n✅ Successfully added {name} to the database!")


if __name__ == "__main__":
    try:
        seed_user()
    except Exception as e:
        print(f"An error occurred: {e}")
        print("Please make sure your MongoDB server is running locally on port 27017.")