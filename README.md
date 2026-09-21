# Intelligent Customer Complaint & Support Analysis System

[![Java](https://img.shields.io/badge/Java-21-orange.svg?logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.3-brightgreen.svg?logo=springboot)](https://spring.io/projects/spring-boot)
[![Spring Security](https://img.shields.io/badge/Spring%20Security-6.2-blue.svg?logo=springsecurity)](https://spring.io/projects/spring-security)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg?logo=mysql)](https://www.mysql.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple.svg?logo=bootstrap)](https://getbootstrap.com/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.4-ff6384.svg?logo=chartdotjs)](https://www.chartjs.org/)

An enterprise-grade, production-style web application unifying customer self-service, real-time ticket tracking, automated NLP sentiment triage, and executive support intelligence in one cohesive system.

---

## 🌟 Key Features

* **🤖 Automated NLP Sentiment & Urgency Triage**:
  * Real-time lexical analysis detecting emotional polarity (`POSITIVE`, `NEUTRAL`, `NEGATIVE`, `VERY_NEGATIVE`).
  * Automated severity and urgency calculation with auto-tagging (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
  * Instant routing to specialized departments (e.g., *Finance & Billing*, *Engineering Support*, *Logistics*).

* **⚡ Dynamic SLA Breach Radar & Auto-Escalation**:
  * Real-time ticking countdown timers on complaints based on priority SLA tiers (12h, 24h, 36h, 48h).
  * Automated multi-tier escalation hierarchy (Tier 1 Support &rarr; Tier 2 Team Lead &rarr; Tier 3 Operations Director).

* **🛡️ Strict Role-Separated Architecture**:
  * Backed by **Spring Security 6** with BCrypt password hashing.
  * Separate portals and permissions for **Customer (`ROLE_USER`)** and **Administrator (`ROLE_ADMIN`)**.
  * Complete data isolation preventing unauthorized ticket inspection or cross-tenant access.

* **🎨 Unified Modern UI/UX with High-Contrast Themes**:
  * **Light Theme**: High-contrast modern SaaS design with Electric Indigo (`#4f46e5`) and Cyan accents.
  * **Dark Theme**: Deep cosmic slate canvas (`#070b14`) with neon violet/cyan glow and crystal-clear readability.
  * **Collapsible Features Sidebar**: Quick sliding toggle (`---` menu) that smoothly slides the sidebar on both desktop and mobile.
  * **Micro-Interactions**: Eased numeric counter animations (`animateCounter`), card hover lift, pulsing NLP radar badges, and smooth page transitions.

* **🔍 Interactive System Tour & Live AI Simulator**:
  * Live test sandbox on the homepage for simulating realistic complaints (Billing overcharges, App crashes, Damaged deliveries, Contract renewals).
  * Interactive macOS-style UI mockups showcasing the Executive Command Center, NLP Sentiment Radar, SLA Clock, and Customer Stepper.

---

## 🏗️ System Architecture

```
Capstone Project/
├── backend/                  # Spring Boot 3 Java 21 REST API
│   ├── src/main/java/com/complaintsystem/
│   │   ├── config/           # Spring Security, WebMvc, CORS, Password Encoder
│   │   ├── controller/       # REST Controllers (Auth, Admin, User, Complaint, Feedback)
│   │   ├── dto/              # Data Transfer Objects & Requests/Responses
│   │   ├── entity/           # JPA Hibernate Entities (Complaint, User, Category, AuditLog, Feedback)
│   │   ├── exception/        # Global Exception Handler & Custom Errors
│   │   ├── repository/       # Spring Data JPA Repositories
│   │   └── service/          # Business Logic & NLP Sentiment Analysis Engine
│   └── pom.xml               # Maven Project Configuration
├── database/                 # Database Scripts
│   ├── schema.sql            # MySQL 8 Tables, Constraints & Indexes
│   └── data.sql              # Seed Data (Categories, Admin, Customers, Sample Tickets)
└── frontend/                 # Client-Side Application
    ├── index.html            # Redesigned Homepage with Live Simulator & Visual Tour
    ├── app.html              # Unified Single-Page Application (Admin + Customer Portals)
    ├── login.html            # Tabbed Authentication Portal
    ├── css/                  # unified.css & unified-responsive.css
    └── js/                   # unified-app.js & unified-auth.js
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Java**: JDK 17 or JDK 21 (Eclipse Adoptium recommended)
* **Maven**: 3.9+
* **Database**: MySQL Server 8.0+
* **Browser**: Chrome, Firefox, Edge, or Safari

---

### Step 1: Database Setup
1. Open your MySQL client (MySQL Workbench, MySQL Shell, or command line).
2. Execute the initialization scripts in the `database/` folder:
```sql
CREATE DATABASE IF NOT EXISTS complaint_system_db;
USE complaint_system_db;

-- Run schema.sql
SOURCE database/schema.sql;

-- Run data.sql (Seeds demo admin, users, categories, and initial complaints)
SOURCE database/data.sql;
```

---

### Step 2: Configure Database Credentials
Edit `backend/src/main/resources/application.properties` with your MySQL credentials:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/complaint_system_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

---

### Step 3: Run the Application
In your terminal, navigate to the `backend` folder and run:
```bash
cd backend
mvn clean spring-boot:run
```

Once started, the backend server and static frontend will be available at:
👉 **`http://localhost:8080/`**

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@complaintsystem.com` | `Admin@123` | Full administrative control, user management, category management, triage analytics, and CSV exports. |
| **Customer (User)** | `john.doe@example.com` | `User@123` | File complaints, track status with live SLA timeline, receive notifications, and submit 5-star CSAT reviews. |

---

## 🌐 Application Portals

* **Homepage & AI Simulator**: [http://localhost:8080/](http://localhost:8080/)
* **Unified Web App Shell**: [http://localhost:8080/app.html](http://localhost:8080/app.html)
* **Tabbed Sign In**: [http://localhost:8080/login.html](http://localhost:8080/login.html)

---

## 📡 Core API Endpoints

### Authentication
* `POST /api/auth/login` - Authenticate user & establish session
* `POST /api/auth/register` - Customer registration
* `GET  /api/auth/me` - Get current authenticated user details
* `POST /api/auth/logout` - Invalidate session

### Customer APIs (`ROLE_USER`)
* `GET  /api/user/dashboard` - Customer dashboard counters & recent tickets
* `GET  /api/user/complaints` - List customer's tickets
* `POST /api/user/complaints` - Submit complaint (triggers automated NLP sentiment analysis)
* `GET  /api/user/complaints/{id}` - Track ticket details & timeline
* `GET  /api/user/notifications` - Retrieve customer notifications
* `POST /api/feedback` - Submit CSAT rating & review

### Admin APIs (`ROLE_ADMIN`)
* `GET  /api/admin/dashboard` - High-level metrics, status doughnut & sentiment distribution
* `GET  /api/admin/complaints` - View all tickets with filtering & sorting
* `PUT  /api/admin/complaints/{id}/status` - Update ticket status (Pending, In Progress, Resolved, Closed)
* `PUT  /api/admin/complaints/{id}/assign` - Assign ticket to support specialist
* `GET  /api/admin/users` - Directory of registered customers & staff
* `GET  /api/admin/categories` - Complaint categories management
* `GET  /api/admin/analytics` - SLA compliance rates, average resolution times, and CSAT metrics
* `GET  /api/admin/reports/export/csv` - Export audit-ready CSV reports

---

## 📄 License
This project is developed for academic capstone demonstration. All rights reserved.
