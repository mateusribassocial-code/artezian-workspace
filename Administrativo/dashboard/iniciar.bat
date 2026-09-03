@echo off
chcp 65001 > nul
title Painel Artezian
cd /d "%~dp0"

REM Ja esta rodando? Entao so traz o navegador pra frente.
netstat -ano | findstr ":3131" | findstr "LISTENING" > nul 2>&1
if %errorlevel%==0 (
  start "" http://localhost:3131
  exit /b
)

set PATH=C:\Program Files\nodejs;%PATH%

where node > nul 2>&1
if errorlevel 1 (
  echo.
  echo   Node.js nao encontrado.
  echo   Instale em https://nodejs.org e abra este atalho de novo.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo.
  echo   Primeira execucao: instalando dependencias...
  echo.
  call npm install --omit=dev
)

echo.
echo   Painel Artezian
echo   ---------------
echo   http://localhost:3131
echo.
echo   Deixe esta janela aberta enquanto usa o painel.
echo   Para encerrar: feche a janela.
echo.

REM Abre o navegador so depois que o servidor responder.
start "" /b cmd /c "for /l %%i in (1,1,40) do (curl -s -o nul http://localhost:3131 && (start "" http://localhost:3131 & exit) || ping -n 2 127.0.0.1 > nul)"

node server.js
