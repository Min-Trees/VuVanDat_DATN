-- VDBus Logistics Platform - Phase 1 Seed Data (Idempotent)
-- All seed items are tagged with IsSimulated = true

-- 1. Tenant
INSERT INTO "Tenants" ("Id", "Name", "TaxCode", "IsActive", "CreatedAtUtc")
VALUES ('11111111-1111-1111-1111-111111111111', 'VDBus Da Nang Logistics', '0402198834', true, NOW())
ON CONFLICT ("Id") DO NOTHING;

-- 2. Customers
INSERT INTO "Customers" ("Id", "TenantId", "Name", "TaxCode", "ContactPerson", "PhoneNumber", "Email", "Address", "CreditLimitVnd", "PaymentTermDays", "IsActive", "CreatedAtUtc")
VALUES 
('c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Vinamilk Chi nhanh Da Nang', '0300588569', 'Nguyen Van Hung', '0905123456', 'hung.nv@vinamilk.vn', 'KCN Hoa Khanh, Lien Chieu, Da Nang', 500000000, 30, true, NOW()),
('c2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Tap doan Thep Hoa Phat Dung Quat', '0102774390', 'Tran Dinh Trong', '0912345678', 'trong.td@hoaphat.vn', 'KKT Dung Quat, Binh Son, Quang Ngai', 1200000000, 45, true, NOW()),
('c3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Det Kim Vien Dong', '0401889922', 'Le Thi Mai', '0988776655', 'mai.lt@viendong.vn', 'KCN Dien Nam - Dien Ngoc, Quang Nam', 300000000, 15, true, NOW()),
('c4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Cong ty Bia Heineken Quang Nam', '0400102345', 'Pham Quoc Bao', '0935112233', 'bao.pq@heineken.vn', 'KCN Dien Nam, Quang Nam', 800000000, 30, true, NOW()),
('c5555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Thuy san Da Nang (Danifoods)', '0400234567', 'Doan Thi Hoa', '0905998877', 'hoa.dt@danifoods.vn', 'KCN Thuy San Tho Quang, Da Nang', 400000000, 20, true, NOW())
ON CONFLICT ("Id") DO NOTHING;

-- 3. Vehicles (10 vehicles)
INSERT INTO "Vehicles" ("Id", "TenantId", "LicensePlate", "Type", "MakeModel", "MaxPayloadKg", "CargoVolumeCbm", "LengthMm", "WidthMm", "HeightMm", "AxleCount", "FuelConsumptionLitrePer100Km", "Status", "CurrentLocationLat", "CurrentLocationLng", "IsSimulated", "CreatedAtUtc")
VALUES
('v1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '43C-189.24', 'DryBox', 'Hino 500 FG8JJ7A', 8500, 42, 7400, 2350, 2400, 2, 18.5, 'Available', 16.074, 108.153, true, NOW()),
('v2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '43H-012.88', 'Container', 'Hyundai HD320 Dau keo', 30000, 75, 12200, 2500, 2600, 4, 32.0, 'OnTrip', 15.342, 108.784, true, NOW()),
('v3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '43C-225.19', 'Refrigerated', 'Isuzu FVR 900 Thung lanh', 7800, 38, 6800, 2300, 2350, 2, 21.0, 'Available', 16.095, 108.241, true, NOW()),
('v4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', '92C-156.40', 'Tarpaulin', 'Thaco Auman C160', 9100, 45, 7600, 2350, 2500, 2, 19.0, 'Available', 15.932, 108.278, true, NOW()),
('v5555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', '43C-311.90', 'DryBox', 'Isuzu QKR 270', 2800, 16, 4380, 1860, 1870, 2, 12.0, 'Available', 16.054, 108.203, true, NOW()),
('v6666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', '43H-099.12', 'Container', 'Daewoo Novus CL4TF', 32000, 80, 12500, 2500, 2700, 4, 34.0, 'Available', 16.128, 108.219, true, NOW()),
('v7777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', '92C-201.88', 'Refrigerated', 'Hino 300 Series XZU', 4500, 22, 5200, 2050, 2100, 2, 15.5, 'Maintenance', 15.567, 108.478, true, NOW()),
('v8888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', '43C-145.72', 'Tarpaulin', 'Thaco Ollin 700B', 7000, 35, 6200, 2200, 2300, 2, 16.0, 'Available', 16.068, 108.198, true, NOW()),
('v9999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', '92H-045.67', 'Flatbed', 'Dongfeng 4 Chan', 17900, 50, 9500, 2500, 2500, 4, 28.0, 'Available', 15.890, 108.312, true, NOW()),
('vaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '43C-556.78', 'DryBox', 'Kia K250 Thung kin', 2490, 14, 3500, 1670, 1700, 2, 10.5, 'Available', 16.060, 108.210, true, NOW())
ON CONFLICT ("Id") DO NOTHING;

-- 4. Drivers (10 drivers)
INSERT INTO "Drivers" ("Id", "TenantId", "FullName", "PhoneNumber", "Email", "LicenseNumber", "LicenseClass", "LicenseExpiryDate", "Status", "AssignedVehicleId", "CreatedAtUtc")
VALUES
('d1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Nguyen Van Tuan', '0905112233', 'tuan.nv@vdbus.vn', '480192837465', 'FC', '2028-12-31', 'OnTrip', 'v2222222-2222-2222-2222-222222222222', NOW()),
('d2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Tran Van Hoang', '0912445566', 'hoang.tv@vdbus.vn', '480283746519', 'C', '2027-08-15', 'Available', 'v1111111-1111-1111-1111-111111111111', NOW()),
('d3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Le Dinh Bao', '0935778899', 'bao.ld@vdbus.vn', '480394857261', 'C', '2029-05-20', 'Available', 'v3333333-3333-3333-3333-333333333333', NOW()),
('d4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Pham Duc Manh', '0988665544', 'manh.pd@vdbus.vn', '480485960172', 'C', '2026-11-30', 'Available', 'v4444444-4444-4444-4444-444444444444', NOW()),
('d5555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Vo Thanh Dat', '0905223344', 'dat.vt@vdbus.vn', '480576849201', 'B2', '2030-01-10', 'Available', 'v5555555-5555-5555-5555-555555555555', NOW()),
('d6666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'Hoang Quoc Viet', '0912334455', 'viet.hq@vdbus.vn', '480687950312', 'FC', '2028-09-14', 'Available', 'v6666666-6666-6666-6666-666666666666', NOW()),
('d7777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', 'Dang Dinh Chinh', '0935445566', 'chinh.dd@vdbus.vn', '480798061423', 'C', '2027-04-18', 'Available', 'v7777777-7777-7777-7777-777777777777', NOW()),
('d8888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', 'Bui Xuan Truong', '0988113355', 'truong.bx@vdbus.vn', '480809172534', 'C', '2029-10-25', 'Available', 'v8888888-8888-8888-8888-888888888888', NOW()),
('d9999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', 'Nguyen Huu Thang', '0905667788', 'thang.nh@vdbus.vn', '480910283645', 'FC', '2028-03-30', 'Available', 'v9999999-9999-9999-9999-999999999999', NOW()),
('daaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Phan Thanh Tung', '0912889900', 'tung.pt@vdbus.vn', '481021394756', 'B2', '2030-07-22', 'Available', 'vaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW())
ON CONFLICT ("Id") DO NOTHING;
