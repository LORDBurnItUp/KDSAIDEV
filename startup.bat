@echo off
REM SWAGCLAW Startup Script
REM Place in %APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup for auto-start

echo Starting SWAGCLAW services...

REM Check for Ollama installation
set OLLAMA_PATH=%LOCALAPPDATA%\Programs\Ollama

REM Start Ollama if installed
if exist "%OLLAMA_PATH%\ollama.exe" (
    echo Starting Ollama...
    start /B "Ollama" cmd /c "cd /d "%OLLAMA_PATH%" && ollama serve"
    REM Wait for Ollama to start
    timeout /t 5 /nobreak >nul
) else (
    echo Warning: Ollama not found at %OLLAMA_PATH%
    echo Install from https://ollama.ai or update OLLAMA_PATH in startup.bat
)

REM Start SWAGCLAW
echo Starting SWAGCLAW...
cd /d "%~dp0"
npm start

pause
