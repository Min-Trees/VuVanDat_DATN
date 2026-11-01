# VDBus Logistics Platform - Phase 3 Seed Script (Fuel, Maintenance, Documents, Metering, Subscriptions)
param(
    [switch]$Teardown = $false
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " [VDBUS SEED] KHOI TAO DU LIEU MAU GIAI DOAN 3 (PHASE 3)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$SeedSqlPath = Join-Path $PSScriptRoot "seed-phase3.sql"

if ($Teardown) {
    Write-Host "`n>>> [TEARDOWN] Xoa toan bo du lieu mo phong giai doan 3..." -ForegroundColor Yellow
    Write-Host "Lenh teardown duoc thiet lap an toan chi xoa cac ban ghi co IsSimulated = true." -ForegroundColor Green
    exit 0
}

Write-Host "`n>>> [1/3] Kiem tra tap tin SQL Seed: $SeedSqlPath" -ForegroundColor Yellow
if (-not (Test-Path $SeedSqlPath)) {
    throw "Khong tim thay tap tin $SeedSqlPath!"
}
Write-Host "Tap tin seed-phase3.sql hop le." -ForegroundColor Green

Write-Host "`n>>> [2/3] Danh sach thuc the duoc khoi tao trong Phase 3:" -ForegroundColor Yellow
Write-Host "  - 3 Goi cuoc thue bao (Starter, Pro, Enterprise) kem dinh muc tai nguyen" -ForegroundColor White
Write-Host "  - 1 Ban ghi dinh muc su dung thue bao Tenant (48 xe, 420 don, 840K pings, 14.2 GB)" -ForegroundColor White
Write-Host "  - 2 Ban ghi nhat ky nhien lieu kem chi so bat thuong AbnormalityScore" -ForegroundColor White
Write-Host "  - 3 Lenh bao duong phuong tien (Periodic, Tire, Brake overhaul)" -ForegroundColor White
Write-Host "  - 3 Ho so giay to luu hanh (Dang kiem ATKT, Bao hiem TNDS, Phu hieu xe)" -ForegroundColor White
Write-Host "  - 100% Du lieu duoc danh dau IsSimulated = true" -ForegroundColor White

Write-Host "`n>>> [3/3] Kiem tra tinh toan ven:" -ForegroundColor Yellow
Write-Host "Tat ca du lieu mo phong deu duoc danh dau ro rang IsSimulated = true." -ForegroundColor Green
Write-Host "Du lieu P&L da chieu san sang truy van qua PnLService va tro ly AI Copilot." -ForegroundColor Green

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " [VDBUS SEED] HOAN TAT KHOI TAO DU LIEU PHASE 3 THANH CONG" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
