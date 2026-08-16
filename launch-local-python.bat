@echo off
cd /d "%~dp0"
set PORT=3333
set URL=http://localhost:%PORT%/control-panel.html

echo.
echo  Cannon Art - local preview (Python)
echo  ==================================
echo.

where py >nul 2>&1
if not errorlevel 1 (
    start "Cannon Art local server" cmd /k "cd /d ""%~dp0"" && py -m http.server %PORT%"
    goto wait
)

where python >nul 2>&1
if not errorlevel 1 (
    start "Cannon Art local server" cmd /k "cd /d ""%~dp0"" && python -m http.server %PORT%"
    goto wait
)

echo ERROR: Python not found. Install from https://python.org/
pause
exit /b 1

:wait
echo Waiting for server on port %PORT%...
set /a N=0
:waitloop
set /a N+=1
powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri '%URL%' -UseBasicParsing -TimeoutSec 2; exit ([int]($r.StatusCode -ne 200)) } catch { exit 1 }" >nul 2>&1
if not errorlevel 1 goto open
if %N% geq 25 goto open
timeout /t 1 /nobreak >nul
goto waitloop

:open
call "%~dp0open-in-chrome.bat" "%URL%"
echo.
echo  If Chrome did not open, paste this into the address bar:
echo  %URL%
echo.
pause
exit /b 0
