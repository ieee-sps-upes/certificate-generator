🌌 Hypervision Certification Vault
A state-of-the-art, 3D-interactive certification portal designed for secure retrieval, verification, and social sharing of student achievements. Built with a high-performance React frontend and a robust Python/Flask backend.

🛠️ Tech Stack
Component	Technology
Frontend	React.js, CSS3 (3D Perspective/Holographic effects)
Backend	Python, Flask
Database	MongoDB (Motor for Async I/O)
Imaging	Pillow (PIL)



🚀 Installation & Setup
1. Prerequisites
Node.js & npm
Python 3.8+
MongoDB (Running locally on port 27017)
2. Backend Setup
Bash
# Navigate to backend folder
cd backend

# Install dependencies
pip install flask flask-cors pillow motor pydantic pydantic-settings python-jose passlib

# Initialize database (Seed data)
python seed_data.py

# Start the Flask server
python app.py
The server will start at: http://localhost:5000

3. Frontend Setup
Bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start the application
npm start
The application will launch at: http://localhost:3000

📁 Repository Structure
Plaintext
├── backend/
│   ├── certs/               # Generated certificate storage
│   ├── app.py               # Central Flask Entry Point
│   ├── generator.py         # Pillow Imaging Logic
│   ├── session.py           # MongoDB Connection Management
│   ├── template.png         # Master Certificate Template
│   └── auth_service.py      # JWT & Encryption logic
├── src/
│   ├── components/
│   │   ├── Login.jsx        # 3D Entry Gateway
│   │   └── Vault.jsx        # Interactive Dashboard
│   └── App.css              # Responsive Holographic Styles
└── README.md