@echo off
chcp 65001 > nul
title Painel Artezian
set PATH=C:\Program Files\nodejs;%PATH%
cd /d "%~dp0"

echo.
echo   Painel Artezian
echo   ---------------
echo   Abrindo em http://localhost:3131
echo.
echo   Deixe esta janela aberta enquanto usa o painel.
echo   Para encerrar: feche a janela ou tecle Ctrl+C.
echo.

start "" http://localhost:3131
node server.js
