@echo off
REM Start ParkSmart Backend Server
REM This script runs Spring Boot application on port 8080

cd /d "%~dp0parksmart-backend\demo"

echo.
echo ========================================
echo Starting ParkSmart Backend...
echo ========================================
echo.

call mvnw.cmd spring-boot:run

pause
