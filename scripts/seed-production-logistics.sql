-- =============================================================================
-- VDBUS LOGISTICS PLATFORM - PRODUCTION-READY MASTER DATA SEED
-- Tenant: Cong ty CP Logistics VDBus Da Nang (TenantCode: VDBUS-DAD)
-- TenantId: a4ceaf50-97d3-48b6-9da9-5b1f1a4581b0
-- =============================================================================

DO $$
DECLARE
    v_tenant_id uuid := 'a4ceaf50-97d3-48b6-9da9-5b1f1a4581b0';
    v_now timestamptz := NOW();
    v_driver_pwd text := '$2a$11$nUdZtvdzM51IpKLCPvgPg.IYaUiHK0kjCoP5PaKDqG34fKMRNOvKy'; -- AdminPassword123!
BEGIN

    -- 1. USERS: Dispatcher, Accountant, Drivers
    INSERT INTO "Users" ("Id", "TenantId", "Email", "PasswordHash", "FullName", "PhoneNumber", "Role", "IsActive", "CreatedAtUtc")
    VALUES 
        ('20000000-0000-0000-0000-000000000002', v_tenant_id, 'dieupk@vdbus.vn', v_driver_pwd, 'Nguyen Quoc Diep (Dieu Phoi)', '0905999888', 2, true, v_now),
        ('20000000-0000-0000-0000-000000000003', v_tenant_id, 'ketoan@vdbus.vn', v_driver_pwd, 'Tran Thi Thu Hang (Ke Toan)', '0905777666', 3, true, v_now),
        ('20000000-0000-0000-0000-000000000004', v_tenant_id, 'driver.tuan@vdbus.vn', v_driver_pwd, 'Nguyen Van Tuan', '0905112233', 5, true, v_now),
        ('20000000-0000-0000-0000-000000000005', v_tenant_id, 'driver.hoang@vdbus.vn', v_driver_pwd, 'Tran Van Hoang', '0912445566', 5, true, v_now),
        ('20000000-0000-0000-0000-000000000006', v_tenant_id, 'driver.bao@vdbus.vn', v_driver_pwd, 'Le Dinh Bao', '0935778899', 5, true, v_now),
        ('20000000-0000-0000-0000-000000000007', v_tenant_id, 'driver.manh@vdbus.vn', v_driver_pwd, 'Pham Duc Manh', '0988665544', 5, true, v_now)
    ON CONFLICT ("Id") DO UPDATE SET "Role" = EXCLUDED."Role", "PasswordHash" = EXCLUDED."PasswordHash";

    -- 2. CUSTOMERS (B2B Enterprise Shippers in Vietnam)
    INSERT INTO "Customers" ("Id", "TenantId", "Name", "Code", "TaxCode", "ContactPerson", "PhoneNumber", "Email", "Address", "CreditLimitVnd", "PaymentTermDays", "IsActive", "CreatedAtUtc")
    VALUES 
        ('c1000000-0000-0000-0000-000000000001', v_tenant_id, 'Vinamilk Chi nhanh Da Nang', 'CUST-VINAMILK', '0300588569', 'Nguyen Van Hung', '0905123456', 'hung.nv@vinamilk.vn', 'KCN Hoa Khanh, Lien Chieu, Da Nang', 500000000, 30, true, v_now),
        ('c1000000-0000-0000-0000-000000000002', v_tenant_id, 'Tap doan Thep Hoa Phat Dung Quat', 'CUST-HOAPHAT', '0102774390', 'Tran Dinh Trong', '0912345678', 'trong.td@hoaphat.vn', 'KKT Dung Quat, Binh Son, Quang Ngai', 1500000000, 45, true, v_now),
        ('c1000000-0000-0000-0000-000000000003', v_tenant_id, 'Det Kim Vien Dong', 'CUST-VIENDONG', '0401889922', 'Le Thi Mai', '0988776655', 'mai.lt@viendong.vn', 'KCN Dien Nam - Dien Ngoc, Quang Nam', 300000000, 15, true, v_now),
        ('c1000000-0000-0000-0000-000000000004', v_tenant_id, 'Cong ty Bia Heineken Quang Nam', 'CUST-HEINEKEN', '0400102345', 'Pham Quoc Bao', '0935112233', 'bao.pq@heineken.vn', 'KCN Dien Nam, Dien Ban, Quang Nam', 800000000, 30, true, v_now),
        ('c1000000-0000-0000-0000-000000000005', v_tenant_id, 'Thuy san Da Nang (Danifoods)', 'CUST-DANIFOODS', '0400234567', 'Doan Thi Hoa', '0905998877', 'hoa.dt@danifoods.vn', 'KCN Thuy San Tho Quang, Son Tra, Da Nang', 600000000, 20, true, v_now)
    ON CONFLICT ("Id") DO NOTHING;

    -- 3. VEHICLES (Real truck specs, axled models, GPS coordinates)
    -- Type enum: 1=LightTruck, 2=MediumTruck, 3=HeavyTruck, 4=Refrigerated, 5=Container
    INSERT INTO "Vehicles" ("Id", "TenantId", "LicensePlate", "Type", "MakeModel", "MaxPayloadKg", "CargoVolumeCbm", "LengthMm", "WidthMm", "HeightMm", "AxleCount", "FuelConsumptionLitrePer100Km", "Status", "CurrentLocationLat", "CurrentLocationLng", "LastLocationUpdateUtc", "IsSimulated", "CreatedAtUtc")
    VALUES
        ('e1000000-0000-0000-0000-000000000001', v_tenant_id, '43C-189.24', 2, 'Hino 500 FG8JJ7A Thung kin', 8500, 42, 7400, 2350, 2400, 2, 18.5, 'OnTrip', 16.0745, 108.1630, v_now, false, v_now),
        ('e1000000-0000-0000-0000-000000000002', v_tenant_id, '43H-012.88', 5, 'Hyundai HD320 Dau keo 4 truc', 30000, 75, 12200, 2500, 2600, 4, 32.0, 'Available', 15.3421, 108.7845, v_now, false, v_now),
        ('e1000000-0000-0000-0000-000000000003', v_tenant_id, '43C-225.19', 4, 'Isuzu FVR 900 Thung lanh (-20C)', 7800, 38, 6800, 2300, 2350, 2, 21.0, 'OnTrip', 16.1050, 108.2310, v_now, false, v_now),
        ('e1000000-0000-0000-0000-000000000004', v_tenant_id, '92C-156.40', 3, 'Thaco Auman C160 Mui bat', 9100, 45, 7600, 2350, 2500, 2, 19.0, 'Available', 15.9320, 108.2780, v_now, false, v_now),
        ('e1000000-0000-0000-0000-000000000005', v_tenant_id, '43C-311.90', 1, 'Isuzu QKR 270 Thung kin', 2800, 16, 4380, 1860, 1870, 2, 12.0, 'Available', 16.0540, 108.2030, v_now, false, v_now),
        ('e1000000-0000-0000-0000-000000000006', v_tenant_id, '43H-099.12', 5, 'Daewoo Novus CL4TF 5 truc', 32000, 80, 12500, 2500, 2700, 5, 34.0, 'Available', 16.1280, 108.2190, v_now, false, v_now),
        ('e1000000-0000-0000-0000-000000000007', v_tenant_id, '92C-201.88', 4, 'Hino 300 Series XZU Thung lanh', 4500, 22, 5200, 2050, 2100, 2, 15.5, 'Maintenance', 15.5670, 108.4780, v_now, false, v_now),
        ('e1000000-0000-0000-0000-000000000008', v_tenant_id, '43C-145.72', 2, 'Thaco Ollin 700B Mui bat', 7000, 35, 6200, 2200, 2300, 2, 16.0, 'Available', 16.0680, 108.1980, v_now, false, v_now),
        ('e1000000-0000-0000-0000-000000000009', v_tenant_id, '92H-045.67', 3, 'Dongfeng 4 Chan San phang', 17900, 50, 9500, 2500, 2500, 4, 28.0, 'Available', 15.8900, 108.3120, v_now, false, v_now),
        ('e1000000-0000-0000-0000-000000000010', v_tenant_id, '43C-556.78', 1, 'Kia K250 Thung kin', 2490, 14, 3500, 1670, 1700, 2, 10.5, 'Available', 16.0600, 108.2100, v_now, false, v_now)
    ON CONFLICT ("Id") DO UPDATE SET "Status" = EXCLUDED."Status", "CurrentLocationLat" = EXCLUDED."CurrentLocationLat", "CurrentLocationLng" = EXCLUDED."CurrentLocationLng";

    -- 4. DRIVERS (10 drivers with real licenses, linked to vehicles)
    INSERT INTO "Drivers" ("Id", "TenantId", "FullName", "PhoneNumber", "Email", "LicenseNumber", "LicenseClass", "LicenseExpiryDate", "Status", "AssignedVehicleId", "IsSimulated", "CreatedAtUtc")
    VALUES
        ('d1000000-0000-0000-0000-000000000001', v_tenant_id, 'Nguyen Van Tuan', '0905112233', 'driver.tuan@vdbus.vn', '480192837465', 'FC', '2028-12-31', 'OnTrip', 'e1000000-0000-0000-0000-000000000001', false, v_now),
        ('d1000000-0000-0000-0000-000000000002', v_tenant_id, 'Tran Van Hoang', '0912445566', 'driver.hoang@vdbus.vn', '480283746519', 'C', '2027-08-15', 'Available', 'e1000000-0000-0000-0000-000000000002', false, v_now),
        ('d1000000-0000-0000-0000-000000000003', v_tenant_id, 'Le Dinh Bao', '0935778899', 'driver.bao@vdbus.vn', '480394857261', 'C', '2029-05-20', 'OnTrip', 'e1000000-0000-0000-0000-000000000003', false, v_now),
        ('d1000000-0000-0000-0000-000000000004', v_tenant_id, 'Pham Duc Manh', '0988665544', 'driver.manh@vdbus.vn', '480485960172', 'C', '2026-11-30', 'Available', 'e1000000-0000-0000-0000-000000000004', false, v_now),
        ('d1000000-0000-0000-0000-000000000005', v_tenant_id, 'Vo Thanh Dat', '0905223344', 'driver.dat@vdbus.vn', '480576849201', 'B2', '2030-01-10', 'Available', 'e1000000-0000-0000-0000-000000000005', false, v_now),
        ('d1000000-0000-0000-0000-000000000006', v_tenant_id, 'Hoang Quoc Viet', '0912334455', 'driver.viet@vdbus.vn', '480687950312', 'FC', '2028-09-14', 'Available', 'e1000000-0000-0000-0000-000000000006', false, v_now),
        ('d1000000-0000-0000-0000-000000000007', v_tenant_id, 'Dang Dinh Chinh', '0935445566', 'driver.chinh@vdbus.vn', '480798061423', 'C', '2027-04-18', 'Available', 'e1000000-0000-0000-0000-000000000007', false, v_now),
        ('d1000000-0000-0000-0000-000000000008', v_tenant_id, 'Bui Xuan Truong', '0988113355', 'driver.truong@vdbus.vn', '480809172534', 'C', '2029-10-25', 'Available', 'e1000000-0000-0000-0000-000000000008', false, v_now),
        ('d1000000-0000-0000-0000-000000000009', v_tenant_id, 'Nguyen Huu Thang', '0905667788', 'driver.thang@vdbus.vn', '480910283645', 'FC', '2028-03-30', 'Available', 'e1000000-0000-0000-0000-000000000009', false, v_now),
        ('d1000000-0000-0000-0000-000000000010', v_tenant_id, 'Phan Thanh Tung', '0912889900', 'driver.tung@vdbus.vn', '481021394756', 'B2', '2030-07-22', 'Available', 'e1000000-0000-0000-0000-000000000010', false, v_now)
    ON CONFLICT ("Id") DO UPDATE SET "Status" = EXCLUDED."Status", "AssignedVehicleId" = EXCLUDED."AssignedVehicleId";

    -- 5. TRIPS & ORDERS
    INSERT INTO "Trips" ("Id", "TenantId", "TripCode", "VehicleId", "DriverId", "Status", "StartTimeUtc", "EndTimeUtc", "TotalDistanceKm", "EstimatedFuelLitre", "TotalTollAmountVnd", "Notes", "CreatedAtUtc")
    VALUES 
        ('a1000000-0000-0000-0000-000000000001', v_tenant_id, 'CH-20261101-0881', 'e1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 2, v_now - interval '1 hour', null, 38.5, 7.2, 35000, 'Van chuyen sua tuoi thanh trung Vinamilk tu KCN Hoa Khanh ve Tong kho Big C', v_now),
        ('a1000000-0000-0000-0000-000000000002', v_tenant_id, 'CH-20261101-0945', 'e1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000003', 2, v_now - interval '2 hour', null, 24.0, 5.0, 0, 'Van chuyen tom dong lanh Danifoods xuat khau Cang Tien Sa', v_now),
        ('a1000000-0000-0000-0000-000000000003', v_tenant_id, 'CH-20261031-0120', 'e1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000002', 3, v_now - interval '24 hour', v_now - interval '18 hour', 145.0, 46.4, 210000, 'Van chuyen thep cuon Hoa Phat Dung Quat ve Cang Ky Ha - Da hoan tat ePOD', v_now)
    ON CONFLICT ("Id") DO NOTHING;

    -- Orders linked to trips
    INSERT INTO "Orders" ("Id", "TenantId", "OrderCode", "CustomerId", "Status", "RequiredVehicleType", "TotalWeightKg", "TotalVolumeCbm", "PickupAddress", "PickupLat", "PickupLng", "PickupWindowStartUtc", "PickupWindowEndUtc", "PickupContactName", "PickupContactPhone", "DeliveryAddress", "DeliveryLat", "DeliveryLng", "DeliveryWindowStartUtc", "DeliveryWindowEndUtc", "DeliveryContactName", "DeliveryContactPhone", "FreightAmountVnd", "Notes", "TrackingToken", "TripId", "CreatedAtUtc")
    VALUES
        ('b1000000-0000-0000-0000-000000000001', v_tenant_id, 'DH-20261101-8192', 'c1000000-0000-0000-0000-000000000001', 7, 2, 5400, 26.0, 'KCN Hoa Khanh, Lien Chieu, Da Nang', 16.0740, 108.1530, v_now - interval '2 hour', v_now + interval '1 hour', 'Kho Vinamilk Da Nang', '0905123456', 'Tong kho Big C, 255 Hung Vuong, Da Nang', 16.0680, 108.2120, v_now + interval '1 hour', v_now + interval '4 hour', 'Nhan vien Kho Big C', '0905333444', 4500000, 'Bao quan nhiet do duoi 5 do C, xep toi da 4 lop thung', 'vdbus_trk_f91a82b4c73d9e018a4bc7102e3f49ab', 'a1000000-0000-0000-0000-000000000001', v_now),
        ('b1000000-0000-0000-0000-000000000002', v_tenant_id, 'DH-20261101-1102', 'c1000000-0000-0000-0000-000000000005', 7, 4, 7200, 35.0, 'KCN Thuy San Tho Quang, Son Tra, Da Nang', 16.0950, 108.2410, v_now - interval '3 hour', v_now, 'Kho Danifoods', '0905998877', 'Cang Tien Sa, Son Tra, Da Nang', 16.1280, 108.2190, v_now + interval '1 hour', v_now + interval '3 hour', 'Kiem hoa Cang Tien Sa', '0905888999', 6800000, 'Hang thuy san dong lanh bat buoc duy tri am 20 do C, co chung thu so', 'vdbus_trk_78bc3410a92de4f76201bda829c4ef01', 'a1000000-0000-0000-0000-000000000002', v_now),
        ('b1000000-0000-0000-0000-000000000003', v_tenant_id, 'DH-20261031-4012', 'c1000000-0000-0000-0000-000000000002', 8, 5, 28000, 12.0, 'KKT Dung Quat, Binh Son, Quang Ngai', 15.3421, 108.7845, v_now - interval '26 hour', v_now - interval '24 hour', 'Kho Thep Hoa Phat', '0912345678', 'Cang Ky Ha, Nui Thanh, Quang Nam', 15.4670, 108.6810, v_now - interval '20 hour', v_now - interval '18 hour', 'Dieu do Cang Ky Ha', '0912999000', 14200000, 'Thep cuon D10-D20 buoc cap xich an toan theo quy chuan giao thong', 'vdbus_trk_hoaphat_steel_dungquat_20261101', 'a1000000-0000-0000-0000-000000000003', v_now),
        ('b1000000-0000-0000-0000-000000000004', v_tenant_id, 'DH-20261101-5501', 'c1000000-0000-0000-0000-000000000004', 2, 3, 8500, 40.0, 'KCN Dien Nam, Dien Ban, Quang Nam', 15.9320, 108.2780, v_now + interval '2 hour', v_now + interval '5 hour', 'Kho Heineken Quang Nam', '0935112233', 'Tong dai ly Bia Da Nang, 120 Cach Mang Thang 8, Cam Le', 16.0310, 108.2050, v_now + interval '6 hour', v_now + interval '10 hour', 'Dai ly Bia Cam Le', '0935444555', 5200000, 'Hang de vo, che chan mua nang can than', 'vdbus_trk_heineken_dn_20261101_5501', null, v_now),
        ('b1000000-0000-0000-0000-000000000005', v_tenant_id, 'DH-20261101-7720', 'c1000000-0000-0000-0000-000000000003', 2, 1, 2400, 15.0, 'KCN Dien Nam - Dien Ngoc, Quang Nam', 15.9400, 108.2850, v_now + interval '3 hour', v_now + interval '6 hour', 'Xuong Det Vien Dong', '0988776655', 'Cang Tien Sa (Kho CFS), Son Tra, Da Nang', 16.1280, 108.2190, v_now + interval '7 hour', v_now + interval '11 hour', 'Giao nhan CFS Tien Sa', '0988333222', 2800000, 'Hang det may dong goi thung carton, giu kho rao tuyet doi', 'vdbus_trk_viendong_textile_20261101', null, v_now)
    ON CONFLICT ("Id") DO NOTHING;

    -- POD Record for Completed Order 3
    INSERT INTO "PodRecords" ("Id", "TenantId", "OrderId", "TripId", "RecipientName", "RecipientPhone", "SignatureBase64", "PhotoUrl", "Latitude", "Longitude", "TimestampUtc", "HashSha256", "IsVerified", "Notes", "CreatedAtUtc")
    VALUES
        ('f1000000-0000-0000-0000-000000000001', v_tenant_id, 'b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 'Nguyen Van Long (Dieu do Cang Ky Ha)', '0912999000', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', '/storage/pod/dh-20261031-4012.jpg', 15.4670, 108.6810, v_now - interval '18 hour', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', true, 'Giao du 28 tan thep cuon nguyen dai kien, khong bi tray xuoc', v_now)
    ON CONFLICT ("Id") DO NOTHING;

    -- 6. GEOFENCES (Real Ports, Logistics Depots, Toll Plazas)
    INSERT INTO "Geofences" ("Id", "TenantId", "Name", "GeofenceType", "CenterLatitude", "CenterLongitude", "RadiusMeters", "FreeTimeMinutes", "DetentionRatePerHourVnd", "IsActive", "CreatedAtUtc")
    VALUES
        ('80000000-0000-0000-0000-000000000001', v_tenant_id, 'KCN Hoa Khanh (Tong kho Vinamilk)', 0, 16.0740, 108.1530, 600.0, 60, 150000.0, true, v_now),
        ('80000000-0000-0000-0000-000000000002', v_tenant_id, 'Cang Quoc te Tien Sa Da Nang', 1, 16.1280, 108.2190, 1000.0, 120, 250000.0, true, v_now),
        ('80000000-0000-0000-0000-000000000003', v_tenant_id, 'Kho Trung Chuyen Hoa Cam Da Nang', 0, 16.0244, 108.1822, 500.0, 60, 120000.0, true, v_now),
        ('80000000-0000-0000-0000-000000000004', v_tenant_id, 'Tram BOT Dien Ban (Quang Nam)', 2, 15.8920, 108.2450, 300.0, 15, 0.0, true, v_now),
        ('80000000-0000-0000-0000-000000000005', v_tenant_id, 'KKT Dung Quat (Thep Hoa Phat)', 0, 15.3421, 108.7845, 1200.0, 90, 200000.0, true, v_now)
    ON CONFLICT ("Id") DO NOTHING;

    -- 7. VEHICLE DOCUMENTS (Registration, Inspection, Insurance, Badges)
    INSERT INTO "VehicleDocuments" ("Id", "TenantId", "VehicleId", "DocumentType", "DocumentNumber", "Issuer", "IssuedDateUtc", "ExpiryDateUtc", "AlertBeforeDays", "IsAlertActive", "FileScanUrl", "Notes", "IsSimulated", "CreatedAtUtc")
    VALUES
        ('90000000-0000-0000-0000-000000000001', v_tenant_id, 'e1000000-0000-0000-0000-000000000001', 1, 'DK-43C18924-2025', 'Trung tam Dang kiem 43-01S Da Nang', v_now - interval '6 month', v_now + interval '6 month', 30, false, '/documents/dk-43c18924.pdf', 'Chung nhan kiem dinh an toan ky thuat va bao ve moi truong', false, v_now),
        ('90000000-0000-0000-0000-000000000002', v_tenant_id, 'e1000000-0000-0000-0000-000000000001', 2, 'BH-BAM-43C-99881', 'Tong Cong ty Bao hiem Bao Viet', v_now - interval '8 month', v_now + interval '4 month', 30, false, '/documents/bh-43c18924.pdf', 'Bao hiem TNDS chu xe co gioi bat buoc', false, v_now),
        ('90000000-0000-0000-0000-000000000003', v_tenant_id, 'e1000000-0000-0000-0000-000000000003', 1, 'DK-43C22519-2025', 'Trung tam Dang kiem 43-02S Da Nang', v_now - interval '11 month', v_now + interval '15 day', 30, true, '/documents/dk-43c22519.pdf', 'Canh bao: Dang kiem xe dong lanh sap het han sau 15 ngay', false, v_now)
    ON CONFLICT ("Id") DO NOTHING;

    -- 8. IOT TELEMETRY DEVICES
    INSERT INTO "Devices" ("Id", "TenantId", "SerialNumber", "Name", "DeviceType", "VehicleId", "BatteryPercentage", "LastHeartbeatUtc", "IsActive", "FirmwareVersion", "IsSimulated", "CreatedAtUtc")
    VALUES
        ('70000000-0000-0000-0000-000000000001', v_tenant_id, 'IOT-GPS-43C-18924', 'Dinh vi GPS 43C-189.24', 0, 'e1000000-0000-0000-0000-000000000001', 98, v_now, true, 'v2.4.1', false, v_now),
        ('70000000-0000-0000-0000-000000000002', v_tenant_id, 'IOT-GPS-43H-01288', 'Dinh vi GPS 43H-012.88', 0, 'e1000000-0000-0000-0000-000000000002', 95, v_now, true, 'v2.4.1', false, v_now),
        ('70000000-0000-0000-0000-000000000003', v_tenant_id, 'IOT-COLD-43C-22519', 'Cam bien Thung lanh 43C-225.19', 1, 'e1000000-0000-0000-0000-000000000003', 100, v_now, true, 'v3.1.0', false, v_now)
    ON CONFLICT ("Id") DO NOTHING;

    -- 9. TOLL TRANSACTIONS (VETC Reconciliation)
    INSERT INTO "TollTransactions" ("Id", "TenantId", "TransactionCode", "StationName", "TollProvider", "VehicleId", "TripId", "AmountVnd", "PassedAtUtc", "IsReconciled", "IsSimulated", "Notes", "CreatedAtUtc")
    VALUES
        ('60000000-0000-0000-0000-000000000001', v_tenant_id, 'VETC-DAD-20261101-01', 'Tram BOT Dien Ban (Quang Nam)', 'VETC', 'e1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 35000.0, v_now - interval '30 minute', true, false, 'Qua lan ETC khong dung tu dong tru tai khoan', v_now),
        ('60000000-0000-0000-0000-000000000002', v_tenant_id, 'VETC-QNG-20261031-02', 'Tram BOT Tu Nghia (Quang Ngai)', 'VETC', 'e1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003', 140000.0, v_now - interval '20 hour', true, false, 'Dau keo 4 truc tren cao toc Da Nang - Quang Ngai', v_now)
    ON CONFLICT ("Id") DO NOTHING;

    -- 10. FUEL RECORDS
    INSERT INTO "FuelRecords" ("Id", "TenantId", "VehicleId", "DriverId", "OdometerKm", "FuelLitre", "UnitPriceVnd", "TotalAmountVnd", "StationName", "PurchasedAtUtc", "ReceiptPhotoUrl", "AbnormalityScore", "AbnormalityReason", "ConfidenceRating", "Notes", "IsSimulated", "CreatedAtUtc")
    VALUES
        ('50000000-0000-0000-0000-000000000001', v_tenant_id, 'e1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 48210, 65.5, 21500, 1408250, 'Cua hang Xang dau Petrolimex So 12 Da Nang', v_now - interval '5 hour', '/storage/fuel/fr-43c18924.jpg', 0.05, 'Tieu hao 18.2 L/100km sat voi dinh muc 18.5 L/100km', 0.95, 'Do dau dinh ky', false, v_now),
        ('50000000-0000-0000-0000-000000000002', v_tenant_id, 'e1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000002', 112050, 150.0, 21500, 3225000, 'Tram Xang dau PV OIL Dung Quat', v_now - interval '25 hour', '/storage/fuel/fr-43h01288.jpg', 0.08, 'Tieu hao dau keo hop le tren cao toc', 0.92, 'Do dau chieu di Dung Quat', false, v_now)
    ON CONFLICT ("Id") DO NOTHING;

    -- 11. INVOICES
    INSERT INTO "Invoices" ("Id", "TenantId", "InvoiceCode", "OrderId", "CustomerId", "SubtotalVnd", "TaxPercent", "TaxAmountVnd", "TotalAmountVnd", "Status", "IssuedDateUtc", "DueDateUtc", "PaymentReference", "Notes", "CreatedAtUtc")
    VALUES
        ('40000000-0000-0000-0000-000000000001', v_tenant_id, 'HD-202611-0081', 'b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', 14200000, 8.0, 1136000, 15336000, 1, v_now - interval '12 hour', v_now + interval '33 day', 'VQR-HD202611-0081', 'Hoa don van chuyen thep cuon Hoa Phat da ky dien tu', v_now)
    ON CONFLICT ("Id") DO NOTHING;

END $$;
