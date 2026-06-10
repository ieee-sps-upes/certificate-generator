git init
git remote add origin https://github.com/UPES-SPS/certificate-generator
git branch -M main

# Commit 1
git add .gitignore README.md
git commit -m "chore: Initial commit, setup gitignore and README"

# Commit 2
git add frontend/package* frontend/vite* frontend/index.html
git commit -m "chore: Setup Vite React frontend base"

# Commit 3
git add frontend/src
git commit -m "feat: Implement frontend UI and IEEE Certificate Portal"

# Commit 4
git add backend/app.py backend/config.py backend/database.py
git commit -m "feat: Setup Flask backend core logic and configuration"

# Commit 5
git add backend/email_handler.py backend/login.py
git commit -m "feat: Implement OTP email logic and authentication"

# Commit 6
git add backend/generator.py backend/certs backend/*.ttf backend/*.png
git commit -m "feat: Implement dynamic certificate generation engine"

# Commit 7
git add .
git commit -m "chore: Final polish and project configuration"

# Attempt to push
git push -u origin main
