@echo off
title AeroSense AI - AtomQuest 2026 Master Launcher
echo ======================================================================
echo    Launching AeroSense AI Full Stack Prototype...
echo ======================================================================
start "AeroSense AI Backend" cmd /k "%~dp0start_backend.bat"
echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak >nul
start "AeroSense AI Frontend" cmd /k "%~dp0start_frontend.bat"
echo Services launched! Opening browser at http://localhost:5188...
timeout /t 2 /nobreak >nul
start http://localhost:5188
echo Done! Keep the backend and frontend terminal windows open.
pause
