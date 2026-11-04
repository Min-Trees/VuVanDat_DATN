@echo off
setlocal
title VDBUS TMS - Nap Du Lieu Mau (Seed Data)
echo =============================================================================
echo  [VDBUS TMS] Dang khoi chay script nap du lieu mau CSDL PostgreSQL...
echo =============================================================================
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0scripts\seed-all-data.ps1"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [LOI] Nap du lieu that bai! Ma loi: %ERRORLEVEL%
    pause
    exit /b %ERRORLEVEL%
)
echo.
echo [HOAN TAT] Bam phim bat ky de thoat...
pause >nul
