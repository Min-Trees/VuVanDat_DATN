@echo off
setlocal
title VDBUS LOGISTICS PLATFORM - KHOI CHAY TOAN BO HE THONG
echo =============================================================================
echo  [VDBUS TMS] Dang khoi chay toan bo he thong (API, Admin, Shipper, Mobile)...
echo =============================================================================
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0scripts\start-all.ps1"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [CANH BAO] Tien trinh ket thuc voi ma loi: %ERRORLEVEL%
    pause
)
