@echo off
chcp 65001 > nul
title Artezian Dashboard
set PATH=C:\Program Files\nodejs;%PATH%
echo.
echo  Iniciando Artezian Dashboard...
echo.
cd /d "%~dp0"
node server.js
