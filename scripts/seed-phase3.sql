-- VDBus Logistics Platform - Phase 3 Seed Data (Fuel, Maintenance, Documents, Metering, Subscriptions)
-- All simulated data is marked with IsSimulated = true

-- 1. Subscription Plans
INSERT INTO "SubscriptionPlans" ("Id", "Tier", "Name", "MonthlyPriceVnd", "MaxVehicles", "MaxOrdersPerMonth", "MaxTelematicsPingsPerMonth", "MaxStorageGb", "FeaturesDescription", "IsActive", "CreatedAtUtc")
VALUES
  ('sub11111-1111-1111-1111-111111111111', 0, 'Gói Khởi Nghiệp (Starter)', 0.0, 5, 100, 50000, 5.0, 'TMS cơ bản, GPS đơn giản, 5 xe', true, NOW()),
  ('sub22222-2222-2222-2222-222222222222', 1, 'Gói Chuyên Nghiệp (Pro)', 2900000.0, 30, 1000, 500000, 20.0, 'Chuỗi lạnh, TPMS, VETC BOT, 30 xe', true, NOW()),
  ('sub33333-3333-3333-3333-333333333333', 2, 'Gói Doanh Nghiệp (Enterprise)', 8900000.0, 100, 5000, 2000000, 50.0, 'P&L đa chiều, Hóa đơn điện tử VAT, VietQR, AI Copilot, 100 xe', true, NOW())
ON CONFLICT ("Id") DO NOTHING;

-- 2. Tenant Metering Record
INSERT INTO "TenantMeteringRecords" ("Id", "TenantId", "CurrentTier", "ActiveVehiclesCount", "MonthlyOrdersCount", "MonthlyTelematicsPingsCount", "UsedStorageGb", "BillingCycleStartUtc", "BillingCycleEndUtc", "IsSimulated", "CreatedAtUtc")
VALUES
  ('met11111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 2, 48, 420, 840000, 14.2, DATE_TRUNC('month', NOW()), DATE_TRUNC('month', NOW()) + INTERVAL '1 month', true, NOW())
ON CONFLICT ("Id") DO NOTHING;

-- 3. Fuel Records
INSERT INTO "FuelRecords" ("Id", "TenantId", "VehicleId", "DriverId", "TripId", "OdometerKm", "FuelLitre", "UnitPriceVnd", "TotalAmountVnd", "StationName", "SensorLitreBeforeRefuel", "SensorLitreAfterRefuel", "AbnormalityScore", "AbnormalityReason", "ConfidenceRating", "PurchasedAtUtc", "ReceiptPhotoUrl", "Notes", "IsSimulated", "CreatedAtUtc")
VALUES
  ('fue11111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'v1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'tr111111-1111-1111-1111-111111111111', 124500.0, 120.0, 22000.0, 2640000.0, 'Petrolimex Cửa hàng 12 (Hòa Cầm)', 45.0, 164.5, 0.05, 'Mức tiêu hao trong biên độ tiêu chuẩn (+1.1%)', 0.98, NOW() - INTERVAL '2 days', 'https://mock.storage.vdbus.vn/receipts/rec-001.jpg', 'Đổ dầu trước chuyến đi Chu Lai', true, NOW()),
  ('fue22222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'v2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 'tr222222-2222-2222-2222-222222222222', 98400.0, 210.0, 22000.0, 4620000.0, 'PVOIL Cửa hàng 05 (Chu Lai)', 32.0, 229.0, 0.65, 'Độ lệch tiêu hao cao hơn định mức 18.75% so với cảm biến phao dầu', 0.85, NOW() - INTERVAL '1 days', 'https://mock.storage.vdbus.vn/receipts/rec-002.jpg', 'Cần rà soát đối chiếu phiếu thu', true, NOW())
ON CONFLICT ("Id") DO NOTHING;

-- 4. Maintenance Orders
INSERT INTO "MaintenanceOrders" ("Id", "TenantId", "VehicleId", "OrderCode", "MaintenanceType", "OdometerKm", "TotalCostVnd", "GarageName", "Description", "PartsReplaced", "ScheduledDateUtc", "CompletedDateUtc", "Status", "InvoiceDocumentUrl", "IsSimulated", "CreatedAtUtc")
VALUES
  ('mai11111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'v1111111-1111-1111-1111-111111111111', 'BD-202610-001', 0, 120400.0, 4500000.0, 'Xưởng dịch vụ Hino Da Nang', 'Bảo dưỡng định kỳ cấp 2 (120.000 km)', 'Nhớt máy 15W40 (20L), Lọc dầu, Lọc gió', NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days', 'Completed', 'https://mock.storage.vdbus.vn/invoices/inv-maint-001.pdf', true, NOW()),
  ('mai22222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'v2222222-2222-2222-2222-222222222222', 'BD-202610-002', 1, 97800.0, 11200000.0, 'Michelin Hải Phòng - Chi nhánh Đà Nẵng', 'Thay lốp và cân chỉnh thước lái trục dẫn', '02 lốp Michelin 295/80R22.5', NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', 'Completed', 'https://mock.storage.vdbus.vn/invoices/inv-maint-002.pdf', true, NOW()),
  ('mai33333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'v3333333-3333-3333-3333-333333333333', 'BD-202610-003', 2, 85000.0, 3800000.0, 'Thaco Auto Chu Lai Service', 'Bảo dưỡng hệ thống phanh khí nén', 'Má phanh trước sau, phớt cup-pen', NOW() + INTERVAL '4 days', NULL, 'Scheduled', '', true, NOW())
ON CONFLICT ("Id") DO NOTHING;

-- 5. Vehicle Documents
INSERT INTO "VehicleDocuments" ("Id", "TenantId", "VehicleId", "DocumentType", "DocumentNumber", "Issuer", "IssuedDateUtc", "ExpiryDateUtc", "AlertBeforeDays", "IsAlertActive", "FileScanUrl", "Notes", "IsSimulated", "CreatedAtUtc")
VALUES
  ('doc11111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'v1111111-1111-1111-1111-111111111111', 0, 'KD-4301S-19284', 'Trung tâm Đăng kiểm 43-01S', NOW() - INTERVAL '6 months', NOW() + INTERVAL '9 days', 30, true, 'https://mock.storage.vdbus.vn/docs/kd-43c18924.pdf', 'Sắp hết hạn trong 9 ngày', true, NOW()),
  ('doc22222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'v2222222-2222-2222-2222-222222222222', 2, 'BH-PTI-847291', 'Bảo hiểm Bưu điện PTI', NOW() - INTERVAL '9 months', NOW() + INTERVAL '75 days', 30, false, 'https://mock.storage.vdbus.vn/docs/bh-43h01288.pdf', 'Bảo hiểm TNDS còn hạn', true, NOW()),
  ('doc33333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'v3333333-3333-3333-3333-333333333333', 1, 'PH-43-2026-0812', 'Sở Giao thông Vận tải Đà Nẵng', NOW() - INTERVAL '2 years', NOW() + INTERVAL '5 years', 30, false, 'https://mock.storage.vdbus.vn/docs/ph-43c22519.pdf', 'Phù hiệu xe tải Container', true, NOW())
ON CONFLICT ("Id") DO NOTHING;
