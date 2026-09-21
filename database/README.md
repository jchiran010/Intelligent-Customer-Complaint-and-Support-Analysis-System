# Database Setup & Configuration Guide

## System: Intelligent Customer Complaint & Support Analysis System
**RDBMS:** MySQL 8.0+  
**Database Name:** `complaint_db`

---

## 1. Quick Setup via MySQL CLI

Ensure MySQL Server is running, then execute the following commands:

```bash
# 1. Login to MySQL
mysql -u root -p

# 2. Run the schema creation script
source /path/to/database/schema.sql;

# 3. Seed demo data (accounts, categories, complaints, tickets)
source /path/to/database/data.sql;
```

---

## 2. Docker Setup (Alternative)

If you prefer running MySQL in a Docker container:

```bash
docker run --name mysql-complaints \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=complaint_db \
  -p 3306:3306 -d mysql:8.0
```

Then load the SQL files into the container:

```bash
docker exec -i mysql-complaints mysql -uroot -proot complaint_db < database/schema.sql
docker exec -i mysql-complaints mysql -uroot -proot complaint_db < database/data.sql
```

---

## 3. Demo Credentials

| Role | Email | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@complaintsystem.com` | `Admin@123` | `/admin/login` |
| **Support Staff Lead** | `sarah.support@complaintsystem.com` | `Admin@123` | `/admin/login` |
| **Customer User** | `john.doe@example.com` | `User@123` | `/user/login` |
| **Customer User** | `jane.smith@example.com` | `User@123` | `/user/login` |

---

## 4. Tables Structure

- `users`: Core authentication, roles (`ROLE_ADMIN`, `ROLE_USER`), status, department.
- `categories`: Complaint classifications with configurable SLA response targets.
- `complaints`: User complaints, sentiment analysis score, priority, status lifecycle.
- `tickets`: Support tracking unit linked to each complaint.
- `feedbacks`: Customer satisfaction rating (1-5 stars) and reviews.
- `notifications`: User and Admin real-time alerts.
