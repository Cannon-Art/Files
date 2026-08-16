@echo off
cd /d "%~dp0"
set PORT=3333
set URL=http://localhost:%PORT%/control-panel.html

echo.
echo  Cannon Art - local preview
echo  ===========================
echo.

where py >nul 2>&1
if not errorlevel 1 goto usepython

where python >nul 2>&1
if not errorlevel 1 goto usepython

where node >nul 2>&1
if not errorlevel 1 goto usenode

echo ERROR: Need Python or Node.js.
echo   Recommended: double-click launch-local-python.bat
pause
exit /b 1

:usepython
echo Starting Python server on port %PORT%...
start "Cannon Art local server" cmd /k "cd /d ""%~dp0"" && py -m http.server %PORT% 2>nul || python -m http.server %PORT%"
goto wait

:usenode
echo Starting npm server on port %PORT% (needs npm network access)...
start "Cannon Art local server" cmd /k "cd /d ""%~dp0"" && npm run serve"
goto wait

:wait
echo Waiting for server...
set /a N=0
:waitloop
set /a N+=1
powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri '%URL%' -UseBasicParsing -TimeoutSec 2; exit ([int]($r.StatusCode -ne 200)) } catch { exit 1 }" >nul 2>&1
if not errorlevel 1 goto open
if %N% geq 30 goto open
timeout /t 1 /nobreak >nul
goto waitloop

:open
call "%~dp0open-in-chrome.bat" "%URL%"
echo.
echo  Control panel: %URL%
echo  Home page:     http://localhost:%PORT%/index.html
echo.
echo  If Chrome did not open, paste the URL above into Chrome manually.
echo  Close the server window when done.
echo.
pause
exit /b 0
