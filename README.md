# IEEE Certificate Generator Portal

Welcome to the IEEE Certificate Generator! This is a complete, production-ready system that allows participants to enter their email, receive a secure OTP, and instantly generate a beautifully branded IEEE participation certificate.

---

## 🛠️ Prerequisites

Before you start, make sure you have the following installed on your computer:
1. **Python 3.8+** (for the backend server)
2. **Node.js & npm** (for the frontend React app)
3. **MongoDB Compass / MongoDB Server** (Your local database)

---

## 🚀 Step 1: Environment Setup

You need to create configuration files so the app knows how to talk to the database and send emails.

### Backend Setup
1. Open the `backend/` folder.
2. Open the file named `.env` in a text editor.
3. Update the `SMTP_USERNAME` to your real Gmail address.
4. Update the `SMTP_PASSWORD` to your **Google App Password**. 
   *(Note: You cannot use your normal Gmail password. Go to your Google Account > Security > 2-Step Verification > App Passwords, and generate a 16-letter App Password).*

If you don't configure the email right away, **the app will still work!** It will simply print the OTP directly into your backend terminal instead of sending an email.

---

## 💾 Step 2: Add Users to the Database

Before someone can download a certificate, they must exist in the database. We've included a simple tool to add them.

1. Ensure your local **MongoDB server is running** (Open MongoDB Compass and click Connect to the default `mongodb://localhost:27017/`).
2. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
3. Install the required Python packages (you only have to do this once):
   ```bash
   pip install -r requirements.txt
   # (If requirements.txt is missing, run: pip install flask pymongo flask-cors python-dotenv pillow requests)
   ```
4. Run the data entry script:
   ```bash
   python seed_data.py
   ```
5. It will ask you for a Name and Email. Type them in and press Enter. The user is now in the database!

---

## ⚙️ Step 3: Start the Backend Server

Keep your terminal open in the `backend` folder, and start the Flask server:

```bash
python app.py
```
*You should see a message saying the server is running on port `5001`. Leave this terminal window open.*

---

## 🎨 Step 4: Start the Frontend UI

Open a **NEW terminal window**, and navigate to the `frontend` folder:

```bash
cd frontend
```

1. Install the required Node packages (you only have to do this once):
   ```bash
   npm install
   ```
2. Start the React development server:
   ```bash
   npm run dev
   ```

**You're all set!** 
The terminal will give you a local link (usually `http://localhost:5173`). Click it to open the stunning IEEE Certificate Portal in your browser. Enter the email you added in Step 2, grab the OTP, and get your certificate!