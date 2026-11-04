# =============================================================================
# VDBUS LOGISTICS PLATFORM - START ALL SERVICES SCRIPT (PowerShell)
# Khởi chạy một chạm toàn bộ hệ thống TMS B2B đa thuê bao:
# - CSDL PostgreSQL 17 (Port 5432)
# - Backend Web API .NET 8 (Port 5000)
# - Web Admin Portal React Vite (Port 3000)
# - Web Shipper Portal React Vite (Port 3001)
# - Mobile Driver App Flutter Web (Port 3002)
# - Tự động định tuyến ADB Reverse cho Android Emulator (emulator-5554)
# =============================================================================

[CmdletBinding()]
param(
    [switch]$NoBrowser,
    [switch]$SkipSeed
)

$ErrorActionPreference = "Continue"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir

# Chuyen den thu muc goc cua repo
Set-Location $RootDir

Write-Host "=============================================================================" -ForegroundColor Cyan
Write-Host "           VDBUS LOGISTICS PLATFORM - HE THONG TMS B2B ENTERPRISE" -ForegroundColor Cyan
Write-Host "                KHOI CHAY TOAN BO HE THONG MOT CHAM (ONE-CLICK)" -ForegroundColor Cyan
Write-Host "=============================================================================" -ForegroundColor Cyan

# 1. Don dep cac tien trinh cu dang chiem port
Write-Host "[BUOC 1/6] Don dep cac port cu (5000, 3000, 3001, 3002)..." -ForegroundColor Yellow
& "$ScriptDir\stop-all.ps1" | Out-Null
Start-Sleep -Seconds 1

# 2. Kiem tra PostgreSQL
Write-Host "[BUOC 2/6] Kiem tra ket noi PostgreSQL port 5432..." -ForegroundColor Yellow
$tcpPg = Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue
if (-not $tcpPg.TcpTestSucceeded) {
    Write-Host "[INFO] Thu khoi dong dich vu PostgreSQL tren Windows..." -ForegroundColor Yellow
    $pgService = Get-Service -Name "postgresql-x64-*" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($pgService) {
        Start-Service -Name $pgService.Name -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
}
$tcpPg = Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue
if ($tcpPg.TcpTestSucceeded) {
    Write-Host "[OK] CSDL PostgreSQL 17 dang hoat dong san sang (Port 5432)." -ForegroundColor Green
} else {
    Write-Host "[CANH BAO] Chua khoi dong duoc PostgreSQL. API co the gap loi ket noi CSDL!" -ForegroundColor Magenta
}

# 3. Kiem tra va nap du lieu mau (Seed Data)
if (-not $SkipSeed) {
    Write-Host "[BUOC 3/6] Kiem tra du lieu mau trong CSDL..." -ForegroundColor Yellow
    & "$ScriptDir\seed-all-data.ps1"
} else {
    Write-Host "[BUOC 3/6] Bo qua buoc nap du lieu mau theo yeu cau (-SkipSeed)." -ForegroundColor DarkGray
}

# 4. Kiem tra va thiet lap ADB Reverse cho Android Emulator neu co
Write-Host "[BUOC 4/6] Kiem tra thiet bi / May ao Android (ADB)..." -ForegroundColor Yellow
$adbPath = $null
$adbCandidates = @(
    "C:\Users\npmin\AppData\Local\Android\Sdk\platform-tools\adb.exe",
    "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe",
    (Get-Command adb.exe -ErrorAction SilentlyContinue).Source
)
foreach ($c in $adbCandidates) {
    if ($c -and (Test-Path $c)) {
        $adbPath = $c
        break
    }
}

if ($adbPath) {
    $adbDevicesOutput = & $adbPath devices 2>&1
    if ($adbDevicesOutput -match "emulator-\d+\s+device") {
        Write-Host "[OK] Phat hien May ao Android dang chay. Thiet lap adb reverse tcp:5000..." -ForegroundColor Green
        & $adbPath reverse tcp:5000 tcp:5000 | Out-Null
        Write-Host "[OK] Da ket noi Port 5000 tu May ao Android toi Backend Host API." -ForegroundColor Green
    } else {
        Write-Host "[INFO] Khong co may ao Android nao dang ket noi. Mobile se chay che do Web." -ForegroundColor DarkGray
    }
}

# 5. Khoi chay 4 dich vu he thong trong cac cua so doc lap
Write-Host "[BUOC 5/6] Dang khoi chay cac tien trinh he thong..." -ForegroundColor Yellow

# 5.1 Backend .NET 8 Web API (Port 5000)
Write-Host "  -> Khoi chay [Backend API] tren port 5000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle = '[VDBUS API :5000]'; Set-Location '$RootDir\backend\src\VDBus.Api'; dotnet run --launch-profile http"

# 5.2 Web Admin Portal (Port 3000)
Write-Host "  -> Khoi chay [Web Admin] tren port 3000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle = '[VDBUS WEB ADMIN :3000]'; Set-Location '$RootDir\web\admin'; npm run dev"

# 5.3 Web Shipper Portal (Port 3001)
Write-Host "  -> Khoi chay [Web Shipper] tren port 3001..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle = '[VDBUS WEB SHIPPER :3001]'; Set-Location '$RootDir\web\shipper'; npm run dev"

# 5.4 Mobile Driver Flutter Web (Port 3002)
Write-Host "  -> Khoi chay [Mobile Driver App] tren port 3002..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle = '[VDBUS MOBILE DRIVER :3002]'; Set-Location '$RootDir\mobile'; flutter run -d web-server --web-port 3002 --web-hostname 0.0.0.0"

# 6. Kiem tra trang thai online cua cac dich vu
Write-Host "[BUOC 6/6] Cho cac dich vu khoi dong hoan tat..." -ForegroundColor Yellow

function Wait-PortListening([int]$port, [string]$name, [int]$maxWaitSec = 45) {
    $waited = 0
    Write-Host "  Cho $name (Port $port) san sang..." -NoNewline -ForegroundColor DarkGray
    while ($waited -lt $maxWaitSec) {
        $conn = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
        if ($conn.TcpTestSucceeded) {
            Write-Host " [SAN SANG]" -ForegroundColor Green
            return $true
        }
        Start-Sleep -Seconds 2
        $waited += 2
        Write-Host "." -NoNewline -ForegroundColor DarkGray
    }
    Write-Host " [DANG KHOI DONG NEN]" -ForegroundColor Yellow
    return $false
}

Wait-PortListening 5000 "Backend API" 30 | Out-Null
Wait-PortListening 3000 "Web Admin" 20 | Out-Null
Wait-PortListening 3001 "Web Shipper" 20 | Out-Null
Wait-PortListening 3002 "Mobile Driver" 40 | Out-Null

# Mo trinh duyet neu khong co co -NoBrowser
if (-not $NoBrowser) {
    Write-Host "[INFO] Dang mo cac tab giao dien tren trinh duyet..." -ForegroundColor Yellow
    Start-Process "http://localhost:3000"
    Start-Process "http://localhost:3002"
    Start-Process "http://localhost:5000/swagger"
}

# 7. Bang dieu khien trung tam tuong tac (Interactive CLI Dashboard)
while ($true) {
    Clear-Host
    Write-Host "=============================================================================" -ForegroundColor Cyan
    Write-Host "       BANG DIEU KHIEN TRUNG TAM HE THONG VDBUS LOGISTICS PLATFORM" -ForegroundColor Cyan
    Write-Host "=============================================================================" -ForegroundColor Cyan
    
    # Kiem tra nhanh trang thai cac port
    $s5000 = (Test-NetConnection -ComputerName localhost -Port 5000 -WarningAction SilentlyContinue).TcpTestSucceeded
    $s3000 = (Test-NetConnection -ComputerName localhost -Port 3000 -WarningAction SilentlyContinue).TcpTestSucceeded
    $s3001 = (Test-NetConnection -ComputerName localhost -Port 3001 -WarningAction SilentlyContinue).TcpTestSucceeded
    $s3002 = (Test-NetConnection -ComputerName localhost -Port 3002 -WarningAction SilentlyContinue).TcpTestSucceeded

    function Format-Status([bool]$isUp) {
        if ($isUp) { return "[ONLINE]" } else { return "[OFFLINE]" }
    }

    Write-Host " [DICH VU HE THONG]" -ForegroundColor Yellow
    Write-Host " 1. Backend API (Swagger):   http://localhost:5000/swagger   $(Format-Status $s5000)" -ForegroundColor $(if ($s5000) { "Green" } else { "Red" })
    Write-Host " 2. Web Admin Portal:       http://localhost:3000           $(Format-Status $s3000)" -ForegroundColor $(if ($s3000) { "Green" } else { "Red" })
    Write-Host " 3. Web Shipper Portal:     http://localhost:3001           $(Format-Status $s3001)" -ForegroundColor $(if ($s3001) { "Green" } else { "Red" })
    Write-Host " 4. Mobile Driver App Web:  http://localhost:3002           $(Format-Status $s3002)" -ForegroundColor $(if ($s3002) { "Green" } else { "Red" })
    Write-Host "-----------------------------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host " [TAI KHOAN TEST] Password chung: AdminPassword123!" -ForegroundColor Yellow
    Write-Host " - Admin:       admin@vdbus.vn        (Role: Admin)" -ForegroundColor White
    Write-Host " - Dispatcher:  dieupk@vdbus.vn       (Role: Dispatcher)" -ForegroundColor White
    Write-Host " - Accountant:  ketoan@vdbus.vn       (Role: Accountant)" -ForegroundColor White
    Write-Host " - Driver:      driver.tuan@vdbus.vn  (Role: Driver)" -ForegroundColor White
    Write-Host "-----------------------------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host " [PHIM CHUC NANG DIEU KHIEN]" -ForegroundColor Yellow
    Write-Host " [1] Mo Web Admin Portal trong trinh duyet" -ForegroundColor White
    Write-Host " [2] Mo Web Shipper Portal trong trinh duyet" -ForegroundColor White
    Write-Host " [3] Mo Mobile Driver App Web trong trinh duyet" -ForegroundColor White
    Write-Host " [4] Mo Tai lieu Swagger Web API" -ForegroundColor White
    Write-Host " [5] Chay Mobile Driver App tren May ao Android (emulator-5554)" -ForegroundColor White
    Write-Host " [R] Nap lai du lieu mau (Re-seed Master Data)" -ForegroundColor White
    Write-Host " [Q] Tat toan bo cac dich vu va thoat he thong" -ForegroundColor Yellow
    Write-Host "=============================================================================" -ForegroundColor Cyan
    Write-Host "Nhap lua chon cua ban [1-5, R, Q]: " -NoNewline -ForegroundColor Green

    $key = [Console]::ReadLine()
    if ($null -eq $key) { break }
    $choice = $key.Trim().ToUpper()

    switch ($choice) {
        "1" { Start-Process "http://localhost:3000" }
        "2" { Start-Process "http://localhost:3001" }
        "3" { Start-Process "http://localhost:3002" }
        "4" { Start-Process "http://localhost:5000/swagger" }
        "5" { 
            Write-Host "Dang khoi chay Flutter tren Android Emulator..." -ForegroundColor Cyan
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle = '[VDBUS MOBILE ANDROID]'; Set-Location '$RootDir\mobile'; flutter run -d emulator-5554"
        }
        "R" {
            Write-Host "Dang nap lai du lieu mau..." -ForegroundColor Cyan
            & "$ScriptDir\seed-all-data.ps1"
            Write-Host "Nhan Enter de tiep tuc..." -ForegroundColor Yellow
            [Console]::ReadLine() | Out-Null
        }
        "Q" {
            Write-Host "Dang tat toan bo he thong..." -ForegroundColor Yellow
            & "$ScriptDir\stop-all.ps1"
            Write-Host "He thong da tat an toan. Tam biet!" -ForegroundColor Green
            exit 0
        }
    }
}
