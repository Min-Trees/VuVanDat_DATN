# VDBus Logistics Platform - Local Quality Verification Script
$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " [VDBUS QUALITY GATE] BAT DAU KIEM TRA TOAN DIEN HE THONG" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Backend Build & Test
Write-Host "`n>>> [1/11] .NET 8 Backend: Build solution..." -ForegroundColor Yellow
dotnet build backend/VDBus.slnx
if ($LASTEXITCODE -ne 0) { throw "Backend build failed!" }

Write-Host "`n>>> [2/11] .NET 8 Backend: Run unit & integration tests..." -ForegroundColor Yellow
dotnet test backend/VDBus.slnx --no-build
if ($LASTEXITCODE -ne 0) { throw "Backend test failed!" }

# 2. Web & Design System Lint
Write-Host "`n>>> [3/11] Web & Design System: Lint & Enterprise Rules (No Emoji, No Hardcoded Colors)..." -ForegroundColor Yellow
npm run lint
if ($LASTEXITCODE -ne 0) { throw "Lint failed!" }

# 3. Web & Design System Typecheck
Write-Host "`n>>> [4/11] Web & Design System: Typecheck TypeScript..." -ForegroundColor Yellow
npm run typecheck
if ($LASTEXITCODE -ne 0) { throw "Typecheck failed!" }

# 4. Web & Design System Unit Tests
Write-Host "`n>>> [5/11] Web & Design System: Run Vitest unit tests..." -ForegroundColor Yellow
npm run test
if ($LASTEXITCODE -ne 0) { throw "Web unit tests failed!" }

# 5. Web Build
Write-Host "`n>>> [6/11] Web: Build production bundles..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { throw "Web production build failed!" }

# 6. Mobile Driver App
Write-Host "`n>>> [7/11] Mobile: Flutter analyze & unit tests..." -ForegroundColor Yellow
Push-Location mobile
try {
    flutter analyze
    if ($LASTEXITCODE -ne 0) { throw "Flutter analyze failed!" }
    flutter test
    if ($LASTEXITCODE -ne 0) { throw "Flutter test failed!" }
} finally {
    Pop-Location
}

# 7. Phase 1 Seed Script Validation
Write-Host "`n>>> [8/11] Scripts: Phase 1 Seed Data Validation..." -ForegroundColor Yellow
& (Join-Path $PSScriptRoot "seed-phase1.ps1")
if ($LASTEXITCODE -ne 0) { throw "Phase 1 Seed script validation failed!" }

# 8. Phase 2 Seed Script Validation
Write-Host "`n>>> [9/11] Scripts: Phase 2 Seed Data Validation..." -ForegroundColor Yellow
& (Join-Path $PSScriptRoot "seed-phase2.ps1")
if ($LASTEXITCODE -ne 0) { throw "Phase 2 Seed script validation failed!" }

# 9. Phase 3 Seed Script Validation
Write-Host "`n>>> [10/11] Scripts: Phase 3 Seed Data Validation..." -ForegroundColor Yellow
& (Join-Path $PSScriptRoot "seed-phase3.ps1")
if ($LASTEXITCODE -ne 0) { throw "Phase 3 Seed script validation failed!" }

# 10. Load Test: 1,000 Vehicle Telematics Simulation
Write-Host "`n>>> [11/11] Load Testing: 1,000 Vehicles Telemetry Simulation..." -ForegroundColor Yellow
& (Join-Path $PSScriptRoot "run-load-test.ps1") -VehicleCount 1000 -PingsPerVehicle 3
if ($LASTEXITCODE -ne 0) { throw "Load test benchmark failed!" }

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " [VDBUS QUALITY GATE] TAT CA KIEM TRA XANH 100%! SAN SANG!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
