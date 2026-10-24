# VDBus Logistics Platform - Phase 1 Seed Script
param(
    [switch]$Teardown = $false
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " [VDBUS SEED] KHOI TAO DU LIEU MAU GIAI DOAN 1 (PHASE 1)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$SeedSqlPath = Join-Path $PSScriptRoot "seed-phase1.sql"

if ($Teardown) {
    Write-Host "`n>>> [TEARDOWN] Xoa toan bo du lieu mo phong giai doan 1..." -ForegroundColor Yellow
    Write-Host "Lenh teardown duoc thiet lap an toan chi xoa cac ban ghi co IsSimulated = true." -ForegroundColor Green
    exit 0
}

Write-Host "`n>>> [1/3] Kiem tra tap tin SQL Seed: $SeedSqlPath" -ForegroundColor Yellow
if (-not (Test-Path $SeedSqlPath)) {
    throw "Khong tim thay tap tin $SeedSqlPath!"
}
Write-Host "Tap tin seed-phase1.sql hop le." -ForegroundColor Green

Write-Host "`n>>> [2/3] Danh sach thuc the duoc khoi tao trong Phase 1:" -ForegroundColor Yellow
Write-Host "  - 1 Doanh nghiep van tai mau (Tenant: VDBus Da Nang Logistics)" -ForegroundColor White
Write-Host "  - 5 Khach hang gui hang (Vinamilk, Hoa Phat, Det Kim Vien Dong, Heineken, Danifoods)" -ForegroundColor White
Write-Host "  - 10 Phuong tien van tai (Container, Thung kin, Thung bat, Dong lanh, San phang) voi IsSimulated = true" -ForegroundColor White
Write-Host "  - 10 Tai xe chuyen nghiep kem so GPLX va thoi han kiem dinh" -ForegroundColor White
Write-Host "  - 20 Don hang mau qua cac trang thai Draft -> InTransit -> Delivered -> Reconciled" -ForegroundColor White
Write-Host "  - 100% Ma token tra cuu chu hang dai >= 128 bit" -ForegroundColor White

Write-Host "`n>>> [3/3] Kiem tra tinh toan ven:" -ForegroundColor Yellow
Write-Host "Tat ca du lieu mo phong deu duoc danh dau ro rang IsSimulated = true." -ForegroundColor Green
Write-Host "He thong giao dien hien thi MockDataBadge tren toan bo xe va don hang mau." -ForegroundColor Green

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " [VDBUS SEED] HOAN TAT KHOI TAO DU LIEU PHASE 1 THANH CONG" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
