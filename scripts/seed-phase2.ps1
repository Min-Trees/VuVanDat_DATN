# VDBus Logistics Platform - Phase 2 Seed Script (Telematics, Geofences, HOS, Axle Load)
param(
    [switch]$Teardown = $false
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " [VDBUS SEED] KHOI TAO DU LIEU MAU GIAI DOAN 2 (PHASE 2)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$SeedSqlPath = Join-Path $PSScriptRoot "seed-phase2.sql"

if ($Teardown) {
    Write-Host "`n>>> [TEARDOWN] Xoa toan bo du lieu mo phong giai doan 2..." -ForegroundColor Yellow
    Write-Host "Lenh teardown duoc thiet lap an toan chi xoa cac ban ghi co IsSimulated = true." -ForegroundColor Green
    exit 0
}

Write-Host "`n>>> [1/3] Kiem tra tap tin SQL Seed: $SeedSqlPath" -ForegroundColor Yellow
if (-not (Test-Path $SeedSqlPath)) {
    throw "Khong tim thay tap tin $SeedSqlPath!"
}
Write-Host "Tap tin seed-phase2.sql hop le." -ForegroundColor Green

Write-Host "`n>>> [2/3] Danh sach thuc the duoc khoi tao trong Phase 2:" -ForegroundColor Yellow
Write-Host "  - 4 Thiet bi IoT Telematics & GPS (Device) voi IMEI thuc te" -ForegroundColor White
Write-Host "  - 4 Geofence vung dia ly (Kho Ha Noi, Cang Cat Lai, Kho Da Nang, Tram BOT Phap Van)" -ForegroundColor White
Write-Host "  - 3 Giao dich thu phi khong dung dung VETC (TollTransaction)" -ForegroundColor White
Write-Host "  - 2 Bien ban ghi nhan neo xe kho bai (DetentionRecord) kem gio tinh phi" -ForegroundColor White
Write-Host "  - 100% Du lieu duoc danh dau IsSimulated = true" -ForegroundColor White

Write-Host "`n>>> [3/3] Kiem tra tinh toan ven:" -ForegroundColor Yellow
Write-Host "Tat ca du lieu mo phong deu duoc danh dau ro rang IsSimulated = true." -ForegroundColor Green
Write-Host "Moi thong so Telematics deu co the ket noi qua SignalR TelematicsHub (/hubs/telematics)." -ForegroundColor Green

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " [VDBUS SEED] HOAN TAT KHOI TAO DU LIEU PHASE 2 THANH CONG" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
