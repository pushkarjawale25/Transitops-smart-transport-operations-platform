@echo off
echo ===================================================
echo Starting TransitOps Fleet Management Platform...
echo ===================================================

echo.
echo Starting Backend API Server (Port 5000)...
start cmd /k "cd backend && npm run dev"

echo.
echo Starting Frontend React App (Port 5173)...
start cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo Both servers are starting in separate windows!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo ===================================================
pause
