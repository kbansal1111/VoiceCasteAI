@echo off
echo =======================================================
echo VoiceCast AI Backend - Production Starter (Windows)
echo =======================================================
echo.
echo Starting FastAPI with 4 Uvicorn Workers...
echo This will allow the application to handle up to 100 concurrent users.
echo Assuming local ML models will lazy-load to prevent memory exhaustion.
echo.

set RAILWAY_ENVIRONMENT=production
set DB_MAX_CONNECTIONS=100
uvicorn main:app --host 0.0.0.0 --port 8001 --workers 4
