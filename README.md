# Intelligent Customer Complaint & Support Analysis System

An enterprise-ready, AI-powered customer support and complaint analysis web application. Designed with a modern dark-blue theme color scheme, the system features role-based access controls, automatic NLP-based category/priority ticket routing, bilingual language support (English/Tamil), an interactive FAQ AI chatbot, notifications telemetry, multi-format report exports (CSV/PDF), and Google OAuth authentication with fallback mock support.

---

## 🚀 Key Features

* **Intelligent NLP Ticket Classifier**: Scans complaint descriptions in real-time as users type to predict the category and severity priority of the issue.
* **Role-Based Access Shielding**: Strict enforcement of privileges between standard customers and system administrators.
* **Google OAuth Authentication**: Secure OAuth 2.0 integration with automatic user provisioning and a developer mock bypass for instant offline grading.
* **Bento Grid Dashboard Architecture**: Modern analytical bento-box grid layouts featuring customized Chart.js graphs, status cards, and live metrics.
* **Interactive FAQ AI Chatbot**: Allows customers to ask general questions, check support guidelines, and track real-time ticket details from the database.
* **Interactive Timeline Log**: Renders a vertical step-by-step visual progression of ticket statuses from submission to resolution and closure.
* **Persistent Settings (Theme & Language)**: Switch seamlessly between Dark/Light mode and English/Tamil interfaces across all pages and tables.
* **Customer Feedback & CSAT**: Star rating review mechanism to capture customer satisfaction once tickets are resolved.
* **Notifications Center**: Active unread polling notifications alerting customers on ticket assignment and status changes.
* **Administrative Analytics Panel**: Beautiful KPI widgets and Chart.js graphics showing resolution rates, CSAT distributions, category breakdowns, and resolution duration.
* **Advanced Reports Exporter**: Generate custom filtered CSV logs and ReportLab-designed PDF documents showing operational KPIs.

---

## 🛠️ Technology Stack

### Frontend
* HTML5, CSS3 Custom Properties (Variables)
* Bootstrap 5 (Customized Dark/Light stylesheets)
* Bootstrap Icons
* Chart.js (Interactive analytical canvas charts)
* Native JavaScript (AJAX, debounce timers, event listener hooks)

### Backend
* Python 3.11+
* Flask (Jinja2 templates injection)
* Werkzeug (Security password encryption & hashing)
* Requests (OAuth token exchange)
* ReportLab (PDF generation)
* Pandas & NumPy (Data analytics & aggregation)

### Database
* SQLite3 (Local development database)
* MySQL 8 (Production-ready database connector)

### Seeding & Testing
* Unittest (Verification mock suites)
* Raw SQL schemas (`schema.sql` and `sample_data.sql`)

---

## 📁 Project Folder Directory

```text
Support-Analysis-System/
├── frontend/
│   ├── templates/
│   │   ├── common/
│   │   │   ├── base.html
│   │   │   ├── splash.html
│   │   │   └── error.html
│   │   ├── auth/
│   │   │   ├── login.html
│   │   │   ├── register.html
│   │   │   └── forgot_password.html
│   │   ├── user/
│   │   │   ├── dashboard.html
│   │   │   ├── submit_complaint.html
│   │   │   ├── my_complaints.html
│   │   │   ├── complaint_details.html
│   │   │   ├── notifications.html
│   │   │   ├── chatbot.html
│   │   │   ├── feedback.html
│   │   │   └── profile.html
│   │   └── admin/
│   │       ├── dashboard.html
│   │       ├── complaints.html
│   │       ├── complaint_details.html
│   │       ├── users.html
│   │       ├── categories.html
│   │       ├── analytics.html
│   │       ├── reports.html
│   │       └── settings.html
│   └── static/
│       ├── css/
│       │   ├── variables.css
│       │   ├── global.css
│       │   ├── theme.css
│       │   ├── auth.css
│       │   ├── user.css
│       │   ├── admin.css
│       │   └── responsive.css
│       ├── js/
│       │   ├── theme.js
│       │   ├── language.js
│       │   ├── auth.js
│       │   ├── complaint.js
│       │   ├── dashboard.js
│       │   ├── analytics.js
│       │   ├── notifications.js
│       │   └── chatbot.js
│       ├── images/
│       │   ├── logo.svg
│       │   └── favicon.svg
│       └── uploads/
│
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── extensions.py
│   ├── routes/
│   │   ├── auth_routes.py
│   │   ├── user_routes.py
│   │   ├── admin_routes.py
│   │   ├── complaint_routes.py
│   │   ├── notification_routes.py
│   │   └── report_routes.py
│   ├── middleware/
│   │   └── auth_middleware.py
│   ├── services/
│   │   ├── intelligent_service.py
│   │   ├── translation_service.py
│   │   └── report_service.py
│   └── utils/
│       ├── db_helper.py
│       └── email_helper.py
│
├── database/
│   ├── schema.sql
│   ├── sample_data.sql
│   ├── init_db.py
│   └── sqlite/
│       └── database.db
│
├── tests/
│   └── test_app.py
│
├── README.md
├── .gitignore
├── .env.example
├── .env
├── requirements.txt
└── run.py
```

---

## ⚙️ Installation & Local Setup

### 1. Prerequisite Packages
Verify Python 3.11+ is installed on your computer.

### 2. Set Up Virtual Environment
Open PowerShell or command line in the project folder and run:
```powershell
python -m venv venv
venv\Scripts\activate
```

### 3. Install Package Dependencies
Install the required packages listed in `requirements.txt`:
```powershell
pip install -r requirements.txt
```

### 4. Initialize Local SQLite Database
Set up tables and seed initial sample data (including credentials and default complaint logs):
```powershell
python database/init_db.py
```

### 5. Run Verification Tests
```powershell
python -m unittest tests/test_app.py
```

### 6. Launch Local Development Server
```powershell
python run.py
```
Open [http://127.0.0.1:5000](http://127.0.0.1:5000) in your web browser. The app starts with a **3-second animated splash screen**, then transitions automatically to the login page.

---

## 🔐 Credentials for Grading / Seeding

You can use the seeded credentials below to access different roles during testing:

### Administrator Account
* **Email**: `admin@support.com`
* **Password**: `Admin@123`

### Customer Account (English)
* **Email**: `user@support.com`
* **Password**: `User@123`

### Customer Account (Tamil)
* **Email**: `anbu@support.com`
* **Password**: `User@123`

---

## 🛡️ Security Features
* **Role Verification**: Admin URLs cannot be bypassed or accessed by standard customer sessions. Unauthorized checks redirect securely.
* **Input Validation**: Custom size limits (Max 5MB) and format locks (PDF, PNG, JPG, JPEG) on uploads.
* **Email Fallback Logging**: Outgoing system alerts fall back to writing structured details directly to `backend/instance/mock_emails.log` if SMTP variables are not set in your `.env` file, allowing easy verification during local tests.
