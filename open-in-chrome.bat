@echo off
set "URL=%~1"
if "%URL%"=="" set "URL=http://localhost:3333/control-panel.html"

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" "%URL%"
    exit /b 0
)

if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
    start "" "%LocalAppData%\Google\Chrome\Application\chrome.exe" "%URL%"
    exit /b 0
)

echo Chrome not found - opening your default browser instead.
rundll32 url.dll,FileProtocolHandler "%URL%"
exit /b 0
