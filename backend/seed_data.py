import sys
from database import get_db

def seed_user():
    print("=== IEEE Certificate Portal - Add User ===")
    
    # Get user input
    name = input("Enter participant's Full Name: ").strip()
    email = input("Enter participant's Email Address: ").strip()
    
    if not name or not email:
        print("Error: Both Name and Email are required!")
        sys.exit(1)
        
    db = get_db()
    
    # Create the user document
    user = {
        "name": name,
        "email": email
    }
    
    # Check if the email already exists
    existing = db["ieee_participants"].find_one({"email": email})
    
    if existing:
        print(f"\nUser with email '{email}' already exists.")
        print("Updating their name in the database...")
        db["ieee_participants"].update_one(
            {"email": email}, 
            {"$set": {"name": name}}
        )
        print("✅ Successfully updated!")
    else:
        result = db["ieee_participants"].insert_one(user)
        print(f"\n✅ Successfully added {name} to the database!")

if __name__ == "__main__":
    try:
        seed_user()
    except Exception as e:
        print(f"An error occurred: {e}")
        print("Please make sure your MongoDB server is running locally on port 27017.")
