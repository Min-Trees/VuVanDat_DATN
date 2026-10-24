# VDBus Logistics Platform - Local Quality Verification Script
$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " [VDBUS QUALITY GATE] BAT DAU KIEM TRA TOAN DIEN HE THONG" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Backend Build & Test
Write-Host "`n>>> [1/7] .NET 8 Backend: Build solution..." -ForegroundColor Yellow
dotnet build backend/VDBus.slnx
if ($LASTEXITCODE -ne 0) { throw "Backend build failed!" }

Write-Host "`n>>> [2/7] .NET 8 Backend: Run unit & integration tests..." -ForegroundColor Yellow
dotnet test backend/VDBus.slnx --no-build
if ($LASTEXITCODE -ne 0) { throw "Backend test failed!" }

# 2. Web & Design System Lint
Write-Host "`n>>> [3/7] Web & Design System: Lint & Enterprise Rules (No Emoji, No Hardcoded Colors)..." -ForegroundColor Yellow
npm run lint
if ($LASTEXITCODE -ne 0) { throw "Lint failed!" }

# 3. Web & Design System Typecheck
Write-Host "`n>>> [4/7] Web & Design System: Typecheck TypeScript..." -ForegroundColor Yellow
npm run typecheck
if ($LASTEXITCODE -ne 0) { throw "Typecheck failed!" }

# 4. Web & Design System Unit Tests
Write-Host "`n>>> [5/7] Web & Design System: Run Vitest unit tests..." -ForegroundColor Yellow
npm run test
if ($LASTEXITCODE -ne 0) { throw "Web unit tests failed!" }

# 5. Web Build
Write-Host "`n>>> [6/7] Web: Build production bundles..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { throw "Web production build failed!" }

# 6. Mobile Driver App
Write-Host "`n>>> [7/7] Mobile: Flutter analyze & unit tests..." -ForegroundColor Yellow
Push-Location mobile
try {
    flutter analyze
    if ($LASTEXITCODE -ne 0) { throw "Flutter analyze failed!" }
    flutter test
    if ($LASTEXITCODE -ne 0) { throw "Flutter test failed!" }
} finally {
    Pop-Location
}

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " [VDBUS QUALITY GATE] TAT CA KIEM TRA XANH 100%! SAN SANG!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
