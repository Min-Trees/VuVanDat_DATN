@echo off
setlocal
title VDBUS TMS - Tat Toan Bo He Thong (Stop All)
echo =============================================================================
echo  [VDBUS TMS] Dang dung toan bo cac tien trinh dang chay...
echo =============================================================================
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0scripts\stop-all.ps1"
echo.
echo [HOAN TAT] Bam phim bat ky de thoat...
pause >nul
