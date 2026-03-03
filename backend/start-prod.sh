#!/bin/bash
echo "======================================================="
echo "VoiceCast AI Backend - Production Starter (Linux)"
echo "======================================================="
echo ""
echo "Starting FastAPI with 4 Gunicorn Workers (via Uvicorn)..."
echo "This scales the application for 100+ concurrent users."
echo ""

export RAILWAY_ENVIRONMENT=production
export DB_MAX_CONNECTIONS=100

# Gunicorn handles worker process management much better in Linux production environments
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
