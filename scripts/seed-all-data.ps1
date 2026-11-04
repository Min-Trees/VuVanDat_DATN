# =============================================================================
# VDBUS LOGISTICS PLATFORM - SEED ALL MASTER DATA SCRIPT (PowerShell)
# Nạp toàn bộ dữ liệu mẫu chuẩn Doanh nghiệp cho TMS B2B Đa thuê bao
# =============================================================================

[CmdletBinding()]
param(
    [string]$DbHost = "localhost",
    [int]$DbPort = 5432,
    [string]$DbUser = "vdbus_admin",
    [string]$DbPassword = "vdbus_secret_password_change_in_prod",
    [string]$DbName = "vdbus_logistics"
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir

Write-Host "=============================================================================" -ForegroundColor Cyan
Write-Host " [VDBUS TMS] KHOI DONG NAP DU LIEU MAU CHUAN DOANH NGHIEP (MASTER SEED)" -ForegroundColor Cyan
Write-Host "=============================================================================" -ForegroundColor Cyan

# 1. Kiem tra cong PostgreSQL 5432
Write-Host "[1/4] Kiem tra ket noi PostgreSQL port $DbPort..." -ForegroundColor Yellow
$tcpTest = Test-NetConnection -ComputerName $DbHost -Port $DbPort -WarningAction SilentlyContinue
if (-not $tcpTest.TcpTestSucceeded) {
    Write-Host "[INFO] Cong $DbPort chua mo. Thu khoi dong Windows Service PostgreSQL..." -ForegroundColor Yellow
    $pgService = Get-Service -Name "postgresql-x64-*" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($pgService) {
        Start-Service -Name $pgService.Name
        Start-Sleep -Seconds 2
        Write-Host "[OK] Da khoi dong service $($pgService.DisplayName)." -ForegroundColor Green
    } else {
        Write-Error "[LOI] Khong the ket noi toi PostgreSQL tai ${DbHost}:${DbPort}. Vui long bat dich vu PostgreSQL!"
        exit 1
    }
} else {
    Write-Host "[OK] Ket noi thanh cong toi PostgreSQL port $DbPort." -ForegroundColor Green
}

# 2. Tim kiem psql.exe
Write-Host "[2/4] Dinh vi tien ich PostgreSQL psql.exe..." -ForegroundColor Yellow
$psqlPath = $null
$candidatePaths = @(
    "C:\Program Files\PostgreSQL\17\bin\psql.exe",
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    (Get-Command psql.exe -ErrorAction SilentlyContinue).Source
)

foreach ($path in $candidatePaths) {
    if ($path -and (Test-Path $path)) {
        $psqlPath = $path
        break
    }
}

if (-not $psqlPath) {
    Write-Error "[LOI] Khong tim thay psql.exe tren he thong. Vui long cai dat PostgreSQL hoac them vao bien moi truong PATH!"
    exit 1
}
Write-Host "[OK] Da tim thay: $psqlPath" -ForegroundColor Green

# 3. Kiem tra role va database, sau do nap seed-master-data.sql
Write-Host "[3/4] Dang thuc thi nap du lieu mau tu scripts/seed-master-data.sql..." -ForegroundColor Yellow
$env:PGPASSWORD = $DbPassword
$seedSqlFile = Join-Path $ScriptDir "seed-master-data.sql"

if (-not (Test-Path $seedSqlFile)) {
    Write-Error "[LOI] Khong tim thay tap tin $seedSqlFile!"
    exit 1
}

$seedResult = & $psqlPath -h $DbHost -p $DbPort -U $DbUser -d $DbName -f $seedSqlFile 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[CANH BAO] Xay ra loi khi nap bang vdbus_admin. Thu lai bang script setup-local-db..." -ForegroundColor Yellow
    $setupDbFile = Join-Path $ScriptDir "setup-local-db.sql"
    if (Test-Path $setupDbFile) {
        $env:PGPASSWORD = "postgres"
        & $psqlPath -h $DbHost -p $DbPort -U "postgres" -f $setupDbFile 2>&1 | Out-Null
    }
    $env:PGPASSWORD = $DbPassword
    $seedResult = & $psqlPath -h $DbHost -p $DbPort -U $DbUser -d $DbName -f $seedSqlFile 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error "[LOI] Nap du lieu that bai: $seedResult"
        exit 1
    }
}
Write-Host "[OK] Da thuc thi thanh cong tap tin seed-master-data.sql." -ForegroundColor Green

# 4. Kiem tra so luong ban ghi va in bao cao tong ket
Write-Host "[4/4] Tong hop so luong ban ghi trong co so du lieu vdbus_logistics:" -ForegroundColor Yellow
$checkCountsFile = Join-Path $ScriptDir "check-counts.sql"
$countsOutput = & $psqlPath -h $DbHost -p $DbPort -U $DbUser -d $DbName -f $checkCountsFile 2>&1

Write-Host "-----------------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "$countsOutput" -ForegroundColor White
Write-Host "-----------------------------------------------------------------------------" -ForegroundColor DarkGray

Write-Host "=============================================================================" -ForegroundColor Cyan
Write-Host " [THANH CONG] NAP DU LIEU MAU HOAN TAT 100%!" -ForegroundColor Green
Write-Host "=============================================================================" -ForegroundColor Cyan
Write-Host " DANH SACH TAI KHOAN DANG NHAP HE THONG (Password chung: AdminPassword123!):" -ForegroundColor Yellow
Write-Host " 1. Admin Tong (Giam doc):         admin@vdbus.vn        (Role: Admin)" -ForegroundColor White
Write-Host " 2. Truong phong Dieu do:         dieupk@vdbus.vn       (Role: Dispatcher)" -ForegroundColor White
Write-Host " 3. Ke toan Truong:               ketoan@vdbus.vn       (Role: Accountant)" -ForegroundColor White
Write-Host " 4. Tai xe FC (Nguyen Van Tuan):  driver.tuan@vdbus.vn  (Role: Driver)" -ForegroundColor White
Write-Host " 5. Tai xe C  (Tran Van Hoang):   driver.hoang@vdbus.vn (Role: Driver)" -ForegroundColor White
Write-Host "=============================================================================" -ForegroundColor Cyan
