# ?? Deployment Guide - Intelligent Customer Complaint & Support Analysis System

This application is production-ready and can be deployed in **less than 2 minutes** to free cloud hosting platforms like **Render**, **Railway**, **Heroku**, or accessed instantly via secure public tunneling.

---

## ?? 1. Live Public Demo URL (Active Now)
- **Live Public URL**: [https://dfde94e0b0c769.lhr.life](https://dfde94e0b0c769.lhr.life)
- **Local Host URL**: [http://127.0.0.1:5000/](http://127.0.0.1:5000/)

### Default Login Accounts:
- **Admin**: \dmin@support.com\ / \Admin@123\
- **User (English)**: \user@support.com\ / \User@123\
- **User (Tamil)**: \nbu@support.com\ / \User@123\

---

## ?? 2. Free 1-Click Deployment on Render.com

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New + > Web Service**.
2. Connect your GitHub repository:
   \https://github.com/jchiran010/Intelligent-Customer-Complaint-and-Support-Analysis-System.git\
3. Set the following build settings:
   - **Environment**: \Python 3\
   - **Build Command**: \pip install -r requirements.txt\
   - **Start Command**: \python run.py\
4. Click **Deploy Web Service**.
5. Render will automatically build the app, initialize the database, and assign a free live \https://*.onrender.com\ URL!

---

## ?? 3. Free Deployment on Railway.app

1. Go to [Railway.app](https://railway.app/) and click **New Project > Deploy from GitHub repo**.
2. Select \jchiran010/Intelligent-Customer-Complaint-and-Support-Analysis-System\.
3. Railway automatically detects \Procfile\ and provisions the application.

---

## ?? 4. Running Locally

\\\ash
# 1. Clone the repository
git clone https://github.com/jchiran010/Intelligent-Customer-Complaint-and-Support-Analysis-System.git
cd Intelligent-Customer-Complaint-and-Support-Analysis-System

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the application
python run.py
\\\

Access the system at **http://127.0.0.1:5000/** in your browser.
