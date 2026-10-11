@echo off
echo ========================================================
echo Starting Intelligent Customer Complaint & Support System
echo ========================================================
cd /d "%~dp0backend"
"C:\Users\CHIRANJEEVI\maven\apache-maven-3.9.6\bin\mvn.cmd" spring-boot:run
pause
