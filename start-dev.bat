@echo off
set ROOT_DIR=%~dp0

start "ZubeVision Backend 8015" cmd /k "cd /d ""%ROOT_DIR%backend"" && .\venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8015"
start "ZubeVision Frontend 3015" cmd /k "cd /d ""%ROOT_DIR%frontend"" && npm.cmd run dev"

echo Backend:  http://127.0.0.1:8015
echo Frontend: http://127.0.0.1:3015
