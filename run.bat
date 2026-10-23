@echo off
echo ========================================================
echo Starting Intelligent Customer Complaint & Support System
echo ========================================================
cd /d "%~dp0backend"
where mvn >nul 2>nul
if %errorlevel% equ 0 (
    mvn spring-boot:run
) else (
    "C:\Users\CHIRANJEEVI\maven\apache-maven-3.9.6\bin\mvn.cmd" spring-boot:run
)
pause
