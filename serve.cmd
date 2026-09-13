@echo off
setlocal
cd /d "%~dp0"
start "i CUBE TEST" cmd /c "timeout /t 2 /nobreak >nul & start http://127.0.0.1:5173/"
npm run dev -- --host 127.0.0.1
