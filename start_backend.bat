@echo off
title AeroSense AI - Backend Server (:8000)
cd /d "%~dp0backend"
echo ======================================================================
echo    AeroSense AI - Intelligent Adaptive Airflow Fan Backend
echo    AtomQuest 2026 | Track 1 - Fan | Theme: Air, Reimagined
echo    Starting FastAPI + WebSocket Server on http://127.0.0.1:8008
echo ======================================================================
python -m uvicorn main:app --host 127.0.0.1 --port 8008 --reload
pause
