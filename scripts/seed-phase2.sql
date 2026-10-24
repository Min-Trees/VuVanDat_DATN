-- VDBus Logistics Platform - Phase 2 Seed Data (Telematics, Geofences, HOS, Tolls, Axle Load)
-- All simulated data is marked with IsSimulated = true

-- 1. IoT Telematics Devices
INSERT INTO "Devices" ("Id", "TenantId", "SerialNumber", "DeviceType", "ImeiNumber", "FirmwareVersion", "VehicleId", "IsActive", "IsSimulated", "CreatedAtUtc")
VALUES 
  ('dev11111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'IOT-GPS-43C-18924', 0, '864201048192841', 'v2.4.1', 'v1111111-1111-1111-1111-111111111111', true, true, NOW()),
  ('dev22222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'IOT-GPS-43H-01288', 0, '864201048192842', 'v2.4.1', 'v2222222-2222-2222-2222-222222222222', true, true, NOW()),
  ('dev33333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'IOT-COLD-43C-22519', 1, '864201048192843', 'v3.1.0', 'v3333333-3333-3333-3333-333333333333', true, true, NOW()),
  ('dev44444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', 'IOT-COLD-92C-15640', 1, '864201048192844', 'v3.1.0', 'v4444444-4444-4444-4444-444444444444', true, true, NOW())
ON CONFLICT ("Id") DO NOTHING;

-- 2. Geofences (Warehouses, Ports, Toll Booths)
INSERT INTO "Geofences" ("Id", "TenantId", "Name", "GeofenceType", "CenterLatitude", "CenterLongitude", "RadiusMeters", "FreeTimeMinutes", "DetentionRatePerHourVnd", "IsActive", "IsSimulated", "CreatedAtUtc")
VALUES
  ('geo11111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Kho Tong Mien Bac (Ha Noi)', 0, 21.0185, 105.8442, 500.0, 60, 150000.0, true, true, NOW()),
  ('geo22222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'Cang Cat Lai (TP. Ho Chi Minh)', 1, 10.7626, 106.7744, 1000.0, 120, 250000.0, true, true, NOW()),
  ('geo33333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'Kho Trung Chuyen Hoa Cam (Da Nang)', 0, 16.0244, 108.1822, 400.0, 60, 120000.0, true, true, NOW()),
  ('geo44444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', 'Tram BOT Phap Van - Cau Gie', 2, 20.8931, 105.8821, 200.0, 15, 0.0, true, true, NOW())
ON CONFLICT ("Id") DO NOTHING;

-- 3. Electronic Toll Transactions (VETC Reconciliation)
INSERT INTO "TollTransactions" ("Id", "TenantId", "TransactionCode", "Provider", "VehicleId", "TollStationName", "AmountVnd", "PassedAtUtc", "IsReconciled", "IsSimulated", "CreatedAtUtc")
VALUES
  ('tol11111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'VETC-TX-20261024-001', 'VETC', 'v1111111-1111-1111-1111-111111111111', 'Tram BOT Phap Van', 75000.0, NOW() - INTERVAL '4 hours', true, true, NOW()),
  ('tol22222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'VETC-TX-20261024-002', 'VETC', 'v1111111-1111-1111-1111-111111111111', 'Tram BOT Cao Bo - Mai Son', 60000.0, NOW() - INTERVAL '2 hours', true, true, NOW()),
  ('tol33333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'VETC-TX-20261024-003', 'VETC', 'v2222222-2222-2222-2222-222222222222', 'Tram BOT Dien Ban (Quang Nam)', 120000.0, NOW() - INTERVAL '1 hours', false, true, NOW())
ON CONFLICT ("Id") DO NOTHING;

-- 4. Detention Records
INSERT INTO "DetentionRecords" ("Id", "TenantId", "GeofenceId", "VehicleId", "ArrivedAtUtc", "DepartedAtUtc", "FreeTimeMinutes", "DetentionMinutes", "DetentionFeeVnd", "Status", "IsSimulated", "CreatedAtUtc")
VALUES
  ('det11111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'geo11111-1111-1111-1111-111111111111', 'v1111111-1111-1111-1111-111111111111', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '2 hours', 60, 120, 300000.0, 'Billed', true, NOW()),
  ('det22222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'geo22222-2222-2222-2222-222222222222', 'v2222222-2222-2222-2222-222222222222', NOW() - INTERVAL '3 hours', NULL, 120, 60, 250000.0, 'Tracking', true, NOW())
ON CONFLICT ("Id") DO NOTHING;
