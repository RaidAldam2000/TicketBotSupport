@echo off
title Discord Bot Setup ⚙️
echo Setting up your Discord bot environment...
echo.

REM تأكد من وجود package.json
if not exist package.json (
  echo Initializing npm...
  npm init -y
)

echo.
echo Installing dependencies...
npm install discord.js@14

echo.
echo Setup complete ✅
echo You can now start the bot using: start.cmd
pause
