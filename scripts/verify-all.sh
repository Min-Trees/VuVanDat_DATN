#!/usr/bin/env bash
set -e

echo "=========================================================="
echo " [VDBUS QUALITY GATE] BAT DAU KIEM TRA TOAN DIEN HE THONG"
echo "=========================================================="

echo -e "\n>>> [1/7] .NET 8 Backend: Build solution..."
dotnet build backend/VDBus.slnx

echo -e "\n>>> [2/7] .NET 8 Backend: Run unit & integration tests..."
dotnet test backend/VDBus.slnx --no-build

echo -e "\n>>> [3/7] Web & Design System: Lint & Enterprise Rules..."
npm run lint

echo -e "\n>>> [4/7] Web & Design System: Typecheck TypeScript..."
npm run typecheck

echo -e "\n>>> [5/7] Web & Design System: Run Vitest unit tests..."
npm run test

echo -e "\n>>> [6/7] Web: Build production bundles..."
npm run build

echo -e "\n>>> [7/7] Mobile: Flutter analyze & unit tests..."
(cd mobile && flutter analyze && flutter test)

echo -e "\n=========================================================="
echo " [VDBUS QUALITY GATE] TAT CA KIEM TRA XANH 100%! SAN SANG!"
echo "=========================================================="
