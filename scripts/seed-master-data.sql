-- =============================================================================
-- VDBUS LOGISTICS PLATFORM - MASTER DATA SEED SCRIPT
-- Dữ liệu mẫu chuẩn Doanh nghiệp TMS B2B Đa thuê bao cho Báo Cáo & Demo Hệ Thống
-- Tất cả UUID đều là chuỗi Hex hợp lệ (0-9, a-f)
-- =============================================================================

DO $$
DECLARE
    v_tenant_id uuid := 'a4ceaf50-97d3-48b6-9da9-5b1f1a4581b0';
    v_now timestamptz := NOW();
    v_pwd text := '$2a$11$nUdZtvdzM51IpKLCPvgPg.IYaUiHK0kjCoP5PaKDqG34fKMRNOvKy'; -- Password: AdminPassword123!
BEGIN

    -- 1. TENANT
    INSERT INTO "Tenants" ("Id", "Name", "Code", "TaxCode", "Plan", "IsActive", "ContactEmail", "ContactPhone", "CreatedAtUtc", "UpdatedAtUtc")
    VALUES 
        (v_tenant_id, 'Cong ty CP Logistics VDBus Da Nang', 'VDBUS-DAD', '0402198822', 'Enterprise', true, 'contact@vdbus.vn', '0905189240', v_now, v_now)
    ON CONFLICT ("Id") DO UPDATE SET "Name" = EXCLUDED."Name", "IsActive" = EXCLUDED."IsActive";

    -- 2. SUBSCRIPTION PLANS
    INSERT INTO "SubscriptionPlans" ("Id", "Name", "Tier", "MonthlyPriceVnd", "MaxVehicles", "MaxOrdersPerMonth", "MaxIoTEventsPerDay", "MaxStorageMb", "IsActive", "FeatureSummary", "CreatedAtUtc", "UpdatedAtUtc")
    VALUES
        ('10000000-0000-0000-0000-000000000001', 'Goi Khoi Nghiep (Starter)', 1, 3500000, 10, 200, 5000, 2048, true, 'Quan ly doi xe co ban, dinh vi GPS thoi gian thuc, ePOD di dong', v_now, v_now),
        ('10000000-0000-0000-0000-000000000002', 'Goi Doanh Nghiep (Professional)', 2, 8500000, 30, 1000, 25000, 10240, true, 'Ban dieu do thong minh, cam bien chuoi lanh, doi soat BOT VETC tu dong, phan tich PnL', v_now, v_now),
        ('10000000-0000-0000-0000-000000000003', 'Goi Tap Doan (Enterprise)', 3, 18000000, 100, 5000, 100000, 51200, true, 'Tich hop ERP, toi uu hoa tuyen duong da diem, giam sat ap suat lop TPMS, SLA 99.99%', v_now, v_now)
    ON CONFLICT ("Id") DO NOTHING;

    -- 3. USERS (Roles: 1=Admin, 2=Dispatcher, 3=Accountant, 4=Shipper, 5=Driver)
    INSERT INTO "Users" ("Id", "TenantId", "Email", "PasswordHash", "FullName", "PhoneNumber", "Role", "IsActive", "CreatedAtUtc", "UpdatedAtUtc")
    VALUES 
        ('20000000-0000-0000-0000-000000000001', v_tenant_id, 'admin@vdbus.vn', v_pwd, 'Vu Van Dat (Giam doc Dieu hanh)', '0905189240', 1, true, v_now, v_now),
        ('20000000-0000-0000-0000-000000000002', v_tenant_id, 'dieupk@vdbus.vn', v_pwd, 'Nguyen Quoc Diep (Truong phong Dieu do)', '0905999888', 2, true, v_now, v_now),
        ('20000000-0000-0000-0000-000000000003', v_tenant_id, 'ketoan@vdbus.vn', v_pwd, 'Tran Thi Thu Hang (Ke toan Truong)', '0905777666', 3, true, v_now, v_now),
        ('20000000-0000-0000-0000-000000000004', v_tenant_id, 'driver.tuan@vdbus.vn', v_pwd, 'Nguyen Van Tuan (Tai xe FC)', '0905112233', 5, true, v_now, v_now),
        ('20000000-0000-0000-0000-000000000005', v_tenant_id, 'driver.hoang@vdbus.vn', v_pwd, 'Tran Van Hoang (Tai xe C)', '0912445566', 5, true, v_now, v_now),
        ('20000000-0000-0000-0000-000000000006', v_tenant_id, 'driver.bao@vdbus.vn', v_pwd, 'Le Dinh Bao (Tai xe C)', '0935778899', 5, true, v_now, v_now),
        ('20000000-0000-0000-0000-000000000007', v_tenant_id, 'driver.manh@vdbus.vn', v_pwd, 'Pham Duc Manh (Tai xe C)', '0988665544', 5, true, v_now, v_now)
    ON CONFLICT ("TenantId", "Email") DO UPDATE SET 
        "Role" = EXCLUDED."Role", 
        "PasswordHash" = EXCLUDED."PasswordHash",
        "FullName" = EXCLUDED."FullName";

    -- 4. CUSTOMERS (Enterprise Shippers)
    INSERT INTO "Customers" ("Id", "TenantId", "Name", "Code", "TaxCode", "ContactPerson", "PhoneNumber", "Email", "Address", "CreditLimitVnd", "PaymentTermDays", "IsActive", "CreatedAtUtc", "UpdatedAtUtc")
    VALUES 
        ('c1000000-0000-0000-0000-000000000001', v_tenant_id, 'Vinamilk Chi nhanh Da Nang', 'CUST-VINAMILK', '0300588569', 'Nguyen Van Hung', '0905123456', 'hung.nv@vinamilk.vn', 'KCN Hoa Khanh, Lien Chieu, Da Nang', 500000000, 30, true, v_now, v_now),
        ('c1000000-0000-0000-0000-000000000002', v_tenant_id, 'Tap doan Thep Hoa Phat Dung Quat', 'CUST-HOAPHAT', '0102774390', 'Tran Dinh Trong', '0912345678', 'trong.td@hoaphat.vn', 'KKT Dung Quat, Binh Son, Quang Ngai', 1500000000, 45, true, v_now, v_now),
        ('c1000000-0000-0000-0000-000000000003', v_tenant_id, 'Det Kim Vien Dong', 'CUST-VIENDONG', '0401889922', 'Le Thi Mai', '0988776655', 'mai.lt@viendong.vn', 'KCN Dien Nam - Dien Ngoc, Quang Nam', 300000000, 15, true, v_now, v_now),
        ('c1000000-0000-0000-0000-000000000004', v_tenant_id, 'Cong ty Bia Heineken Quang Nam', 'CUST-HEINEKEN', '0400102345', 'Pham Quoc Bao', '0935112233', 'bao.pq@heineken.vn', 'KCN Dien Nam, Dien Ban, Quang Nam', 800000000, 30, true, v_now, v_now),
        ('c1000000-0000-0000-0000-000000000005', v_tenant_id, 'Thuy san Da Nang (Danifoods)', 'CUST-DANIFOODS', '0400234567', 'Doan Thi Hoa', '0905998877', 'hoa.dt@danifoods.vn', 'KCN Thuy San Tho Quang, Son Tra, Da Nang', 600000000, 20, true, v_now, v_now)
    ON CONFLICT ("TenantId", "Code") DO UPDATE SET "Name" = EXCLUDED."Name", "CreditLimitVnd" = EXCLUDED."CreditLimitVnd";

    -- 5. VEHICLES (Truck Fleet)
    INSERT INTO "Vehicles" ("Id", "TenantId", "LicensePlate", "Type", "MakeModel", "MaxPayloadKg", "CargoVolumeCbm", "LengthMm", "WidthMm", "HeightMm", "AxleCount", "FuelConsumptionLitrePer100Km", "Status", "CurrentLocationLat", "CurrentLocationLng", "LastLocationUpdateUtc", "IsSimulated", "CreatedAtUtc", "UpdatedAtUtc")
    VALUES
        ('e1000000-0000-0000-0000-000000000001', v_tenant_id, '43C-189.24', 2, 'Hino 500 FG8JJ7A Thung kin', 8500, 42, 7400, 2350, 2400, 2, 18.5, 'OnTrip', 16.0745, 108.1630, v_now, false, v_now, v_now),
        ('e1000000-0000-0000-0000-000000000002', v_tenant_id, '43H-012.88', 5, 'Hyundai HD320 Dau keo 4 truc', 30000, 75, 12200, 2500, 2600, 4, 32.0, 'Available', 15.3421, 108.7845, v_now, false, v_now, v_now),
        ('e1000000-0000-0000-0000-000000000003', v_tenant_id, '43C-225.19', 4, 'Isuzu FVR 900 Thung lanh (-20C)', 7800, 38, 6800, 2300, 2350, 2, 21.0, 'OnTrip', 16.1050, 108.2310, v_now, false, v_now, v_now),
        ('e1000000-0000-0000-0000-000000000004', v_tenant_id, '92C-156.40', 3, 'Thaco Auman C160 Mui bat', 9100, 45, 7600, 2350, 2500, 2, 19.0, 'Available', 15.9320, 108.2780, v_now, false, v_now, v_now),
        ('e1000000-0000-0000-0000-000000000005', v_tenant_id, '43C-311.90', 1, 'Isuzu QKR 270 Thung kin', 2800, 16, 4380, 1860, 1870, 2, 12.0, 'Available', 16.0540, 108.2030, v_now, false, v_now, v_now),
        ('e1000000-0000-0000-0000-000000000006', v_tenant_id, '43H-099.12', 5, 'Daewoo Novus CL4TF 5 truc', 32000, 80, 12500, 2500, 2700, 5, 34.0, 'Available', 16.1280, 108.2190, v_now, false, v_now, v_now),
        ('e1000000-0000-0000-0000-000000000007', v_tenant_id, '92C-201.88', 4, 'Hino 300 Series XZU Thung lanh', 4500, 22, 5200, 2050, 2100, 2, 15.5, 'Maintenance', 15.5670, 108.4780, v_now, false, v_now, v_now),
        ('e1000000-0000-0000-0000-000000000008', v_tenant_id, '43C-145.72', 2, 'Thaco Ollin 700B Mui bat', 7000, 35, 6200, 2200, 2300, 2, 16.0, 'Available', 16.0680, 108.1980, v_now, false, v_now, v_now),
        ('e1000000-0000-0000-0000-000000000009', v_tenant_id, '92H-045.67', 3, 'Dongfeng 4 Chan San phang', 17900, 50, 9500, 2500, 2500, 4, 28.0, 'Available', 15.8900, 108.3120, v_now, false, v_now, v_now),
        ('e1000000-0000-0000-0000-000000000010', v_tenant_id, '43C-556.78', 1, 'Kia K250 Thung kin', 2490, 14, 3500, 1670, 1700, 2, 10.5, 'Available', 16.0600, 108.2100, v_now, false, v_now, v_now)
    ON CONFLICT ("TenantId", "LicensePlate") DO UPDATE SET "Status" = EXCLUDED."Status", "CurrentLocationLat" = EXCLUDED."CurrentLocationLat", "CurrentLocationLng" = EXCLUDED."CurrentLocationLng";

    -- 6. DRIVERS
    INSERT INTO "Drivers" ("Id", "TenantId", "FullName", "PhoneNumber", "Email", "LicenseNumber", "LicenseClass", "LicenseExpiryDate", "Status", "AssignedVehicleId", "IsSimulated", "CreatedAtUtc", "UpdatedAtUtc")
    VALUES
        ('d1000000-0000-0000-0000-000000000001', v_tenant_id, 'Nguyen Van Tuan', '0905112233', 'driver.tuan@vdbus.vn', '480192837465', 'FC', '2028-12-31 00:00:00+07', 'OnTrip', 'e1000000-0000-0000-0000-000000000001', false, v_now, v_now),
        ('d1000000-0000-0000-0000-000000000002', v_tenant_id, 'Tran Van Hoang', '0912445566', 'driver.hoang@vdbus.vn', '480283746519', 'C', '2027-08-15 00:00:00+07', 'Available', 'e1000000-0000-0000-0000-000000000002', false, v_now, v_now),
        ('d1000000-0000-0000-0000-000000000003', v_tenant_id, 'Le Dinh Bao', '0935778899', 'driver.bao@vdbus.vn', '480394857261', 'C', '2029-05-20 00:00:00+07', 'OnTrip', 'e1000000-0000-0000-0000-000000000003', false, v_now, v_now),
        ('d1000000-0000-0000-0000-000000000004', v_tenant_id, 'Pham Duc Manh', '0988665544', 'driver.manh@vdbus.vn', '480485960172', 'C', '2026-11-30 00:00:00+07', 'Available', 'e1000000-0000-0000-0000-000000000004', false, v_now, v_now),
        ('d1000000-0000-0000-0000-000000000005', v_tenant_id, 'Vo Thanh Dat', '0905223344', 'driver.dat@vdbus.vn', '480576849201', 'B2', '2030-01-10 00:00:00+07', 'Available', 'e1000000-0000-0000-0000-000000000005', false, v_now, v_now),
        ('d1000000-0000-0000-0000-000000000006', v_tenant_id, 'Hoang Quoc Viet', '0912334455', 'driver.viet@vdbus.vn', '480687950312', 'FC', '2028-09-14 00:00:00+07', 'Available', 'e1000000-0000-0000-0000-000000000006', false, v_now, v_now),
        ('d1000000-0000-0000-0000-000000000007', v_tenant_id, 'Dang Dinh Chinh', '0935445566', 'driver.chinh@vdbus.vn', '480798061423', 'C', '2027-04-18 00:00:00+07', 'Available', 'e1000000-0000-0000-0000-000000000007', false, v_now, v_now),
        ('d1000000-0000-0000-0000-000000000008', v_tenant_id, 'Bui Xuan Truong', '0988113355', 'driver.truong@vdbus.vn', '480809172534', 'C', '2029-10-25 00:00:00+07', 'Available', 'e1000000-0000-0000-0000-000000000008', false, v_now, v_now),
        ('d1000000-0000-0000-0000-000000000009', v_tenant_id, 'Nguyen Huu Thang', '0905667788', 'driver.thang@vdbus.vn', '480910283645', 'FC', '2028-03-30 00:00:00+07', 'Available', 'e1000000-0000-0000-0000-000000000009', false, v_now, v_now),
        ('d1000000-0000-0000-0000-000000000010', v_tenant_id, 'Phan Thanh Tung', '0912889900', 'driver.tung@vdbus.vn', '481021394756', 'B2', '2030-07-22 00:00:00+07', 'Available', 'e1000000-0000-0000-0000-000000000010', false, v_now, v_now)
    ON CONFLICT ("Id") DO NOTHING;

    -- 7. GEOFENCES (Kho bãi, Cảng biển, Trạm BOT)
    -- GeofenceType: 0=Warehouse, 1=Port, 2=TollBooth, 3=RestStop
    INSERT INTO "Geofences" ("Id", "TenantId", "Name", "GeofenceType", "CustomerId", "CenterLatitude", "CenterLongitude", "RadiusMeters", "FreeTimeMinutes", "DetentionRatePerHourVnd", "IsActive", "CreatedAtUtc", "UpdatedAtUtc")
    VALUES
        ('6e000000-0000-0000-0000-000000000001', v_tenant_id, 'Kho Tong Vinamilk Da Nang', 0, 'c1000000-0000-0000-0000-000000000001', 16.0752, 108.1524, 450, 60, 150000, true, v_now, v_now),
        ('6e000000-0000-0000-0000-000000000002', v_tenant_id, 'Cang Thep Hoa Phat Dung Quat', 1, 'c1000000-0000-0000-0000-000000000002', 15.3456, 108.7920, 800, 120, 250000, true, v_now, v_now),
        ('6e000000-0000-0000-0000-000000000003', v_tenant_id, 'Nha may Bia Heineken Dien Ban', 0, 'c1000000-0000-0000-0000-000000000004', 15.9124, 108.2815, 500, 90, 180000, true, v_now, v_now),
        ('6e000000-0000-0000-0000-000000000004', v_tenant_id, 'Tram Thu phi BOT Dien Ban (Km 943)', 2, NULL, 15.8920, 108.2670, 250, 15, 0, true, v_now, v_now),
        ('6e000000-0000-0000-0000-000000000005', v_tenant_id, 'Tram Thu phi BOT Nam Hai Van', 2, NULL, 16.1420, 108.1210, 250, 15, 0, true, v_now, v_now),
        ('6e000000-0000-0000-0000-000000000006', v_tenant_id, 'Cang Tien Sa Da Nang', 1, NULL, 16.1285, 108.2215, 1200, 180, 300000, true, v_now, v_now)
    ON CONFLICT ("Id") DO NOTHING;

    -- 8. REGULATION RULES (Quy định cấm tải nội đô & Cầu tải trọng)
    INSERT INTO "RegulationRules" ("Id", "TenantId", "ProvinceCode", "RouteName", "VehicleType", "StartTime", "EndTime", "MaxWeightTons", "EstimatedFineVnd", "SourceReference", "LegalNote", "IsActive", "CreatedAtUtc", "UpdatedAtUtc")
    VALUES
        ('ba000000-0000-0000-0000-000000000001', v_tenant_id, '43', 'Duong Nguyen Tat Thanh (Doan Tu Cau Thuan Phuoc - Nguyen Sinh Sac)', 'HeavyTruck', '06:00:00'::interval, '08:30:00'::interval, 2.5, 3500000, 'Quyet dinh 15/2023/QD-UBND Da Nang', 'Cam xe tai tong tai trong tren 2.5 tan gio cao diem buoi sang', true, v_now, v_now),
        ('ba000000-0000-0000-0000-000000000002', v_tenant_id, '43', 'Duong Nguyen Tat Thanh (Doan Tu Cau Thuan Phuoc - Nguyen Sinh Sac)', 'HeavyTruck', '16:30:00'::interval, '19:00:00'::interval, 2.5, 3500000, 'Quyet dinh 15/2023/QD-UBND Da Nang', 'Cam xe tai tong tai trong tren 2.5 tan gio cao diem buoi chieu', true, v_now, v_now),
        ('ba000000-0000-0000-0000-000000000003', v_tenant_id, '43', 'Cau Song Han', 'AllTrucks', '00:00:00'::interval, '23:59:59'::interval, 1.5, 5000000, 'Bien bao cau giao thong so 01-SH', 'Cam xe tai co tong tai trong tren 1.5 tan luu thong qua cau 24/24', true, v_now, v_now),
        ('ba000000-0000-0000-0000-000000000004', v_tenant_id, '92', 'Quoc lo 1A qua Thi xa Dien Ban', 'Container', '11:00:00'::interval, '13:00:00'::interval, 30.0, 4000000, 'Thong bao 88/TB-SGTVT Quang Nam', 'Khuyen nghi giam toc va han che xe dau keo container gio trua', true, v_now, v_now)
    ON CONFLICT ("Id") DO NOTHING;

    -- 9. TRIPS (Chuyến xe thực tế)
    -- Status: 1=Draft, 2=Assigned, 3=InTransit, 4=Completed, 5=Cancelled
    INSERT INTO "Trips" ("Id", "TenantId", "TripCode", "VehicleId", "DriverId", "Status", "StartTimeUtc", "EndTimeUtc", "TotalDistanceKm", "EstimatedFuelLitre", "TotalTollAmountVnd", "Notes", "CreatedAtUtc", "UpdatedAtUtc")
    VALUES
        ('b1000000-0000-0000-0000-000000000001', v_tenant_id, 'TRIP-DAD-20261101-01', 'e1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 3, v_now - INTERVAL '3 hours', NULL, 138.5, 25.6, 186000, 'Chuyen hang sua dong hop Vinamilk Lien Chieu di Dung Quat', v_now, v_now),
        ('b1000000-0000-0000-0000-000000000002', v_tenant_id, 'TRIP-DAD-20261101-02', 'e1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000003', 3, v_now - INTERVAL '1 hours', NULL, 48.2, 10.1, 76000, 'Chuyen thuc pham dong lanh Thuy san Danifoods di Sieu thi GO Da Nang', v_now, v_now),
        ('b1000000-0000-0000-0000-000000000003', v_tenant_id, 'TRIP-DAD-20261031-01', 'e1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000002', 4, v_now - INTERVAL '28 hours', v_now - INTERVAL '16 hours', 245.0, 78.4, 380000, 'Chuyen thep cuon Hoa Phat Dung Quat giao KCN Hoa Khanh Da Nang - Da hoan tat', v_now - INTERVAL '28 hours', v_now - INTERVAL '16 hours')
    ON CONFLICT ("TenantId", "TripCode") DO UPDATE SET "Status" = EXCLUDED."Status";

    -- 10. STOPS (Điểm dừng lộ trình của Chuyến)
    INSERT INTO "Stops" ("Id", "TenantId", "TripId", "StopOrder", "StopType", "Address", "Latitude", "Longitude", "ScheduledArrivalUtc", "ActualArrivalUtc", "ActualDepartureUtc", "ContactPerson", "ContactPhone", "Status", "Notes", "CreatedAtUtc", "UpdatedAtUtc")
    VALUES
        ('5a000000-0000-0000-0000-000000000001', v_tenant_id, 'b1000000-0000-0000-0000-000000000001', 1, 'Pickup', 'Kho Vinamilk Hoa Khanh, Lien Chieu, Da Nang', 16.0752, 108.1524, v_now - INTERVAL '3 hours', v_now - INTERVAL '3 hours', v_now - INTERVAL '2 hours 15 mins', 'Anh Tuan Kho 1', '0905123456', 'Completed', 'Boc xep 240 thung sua', v_now, v_now),
        ('5a000000-0000-0000-0000-000000000002', v_tenant_id, 'b1000000-0000-0000-0000-000000000001', 2, 'Delivery', 'Kho NPP Sua Binh Son, KKT Dung Quat, Quang Ngai', 15.3456, 108.7920, v_now + INTERVAL '2 hours', NULL, NULL, 'Chi Lan Thu Kho', '0912445588', 'Pending', 'Giao hang va ky ePOD', v_now, v_now),
        ('5a000000-0000-0000-0000-000000000003', v_tenant_id, 'b1000000-0000-0000-0000-000000000002', 1, 'Pickup', 'Kho Thuy san Danifoods Tho Quang, Son Tra, Da Nang', 16.1050, 108.2310, v_now - INTERVAL '1 hours', v_now - INTERVAL '1 hours', v_now - INTERVAL '40 mins', 'Anh Hai Dieu do', '0905998877', 'Completed', 'Lay 1.5 tan ca basa fillet dong lanh', v_now, v_now),
        ('5a000000-0000-0000-0000-000000000004', v_tenant_id, 'b1000000-0000-0000-0000-000000000002', 2, 'Delivery', 'Kho Lanh Sieu thi GO Da Nang, Thanh Khe', 16.0640, 108.2045, v_now + INTERVAL '45 mins', NULL, NULL, 'Anh Cuong Nhan hang', '0988665511', 'Pending', 'Kiem tra nhiet do truoc khi do hang', v_now, v_now)
    ON CONFLICT ("Id") DO NOTHING;

    -- 11. ORDERS (Đơn hàng B2B gắn liền chuyến)
    -- Status: 1=Created, 2=Confirmed, 3=Assigned, 4=InTransit, 5=Delivered, 6=Cancelled
    INSERT INTO "Orders" ("Id", "TenantId", "OrderCode", "CustomerId", "Status", "RequiredVehicleType", "TotalWeightKg", "TotalVolumeCbm", "PickupAddress", "PickupLat", "PickupLng", "PickupWindowStartUtc", "PickupWindowEndUtc", "PickupContactName", "PickupContactPhone", "DeliveryAddress", "DeliveryLat", "DeliveryLng", "DeliveryWindowStartUtc", "DeliveryWindowEndUtc", "DeliveryContactName", "DeliveryContactPhone", "FreightAmountVnd", "Notes", "TrackingToken", "TripId", "CreatedAtUtc", "UpdatedAtUtc")
    VALUES
        ('0a000000-0000-0000-0000-000000000001', v_tenant_id, 'ORD-VNM-20261101-001', 'c1000000-0000-0000-0000-000000000001', 4, 2, 7200, 32, 'KCN Hoa Khanh, Lien Chieu, Da Nang', 16.0752, 108.1524, v_now - INTERVAL '4 hours', v_now - INTERVAL '2 hours', 'Nguyen Van Hung', '0905123456', 'KKT Dung Quat, Binh Son, Quang Ngai', 15.3456, 108.7920, v_now + INTERVAL '1 hours', v_now + INTERVAL '4 hours', 'Tran Dinh Trong', '0912345678', 8500000, 'Hang de vo, bao quan kho rao, dung pallet go tieu chuan', 'TRK-VNM-20261101001', 'b1000000-0000-0000-0000-000000000001', v_now, v_now),
        ('0a000000-0000-0000-0000-000000000002', v_tenant_id, 'ORD-DNF-20261101-002', 'c1000000-0000-0000-0000-000000000005', 4, 4, 1500, 8, 'KCN Thuy San Tho Quang, Son Tra, Da Nang', 16.1050, 108.2310, v_now - INTERVAL '2 hours', v_now, 'Doan Thi Hoa', '0905998877', 'Kho GO Da Nang, Thanh Khe, Da Nang', 16.0640, 108.2045, v_now + INTERVAL '30 mins', v_now + INTERVAL '2 hours', 'Le Van Phuc', '0935112244', 3200000, 'Nhiet do thung lanh bat buoc giu tu -20C den -16C trong suot qua trinh van chuyen', 'TRK-DNF-20261101002', 'b1000000-0000-0000-0000-000000000002', v_now, v_now),
        ('0a000000-0000-0000-0000-000000000003', v_tenant_id, 'ORD-HPQ-20261031-001', 'c1000000-0000-0000-0000-000000000002', 5, 5, 28500, 22, 'Cang Thep Hoa Phat Dung Quat, Quang Ngai', 15.3456, 108.7920, v_now - INTERVAL '30 hours', v_now - INTERVAL '26 hours', 'Tran Dinh Trong', '0912345678', 'Cong trinh KCN Hoa Khanh, Da Nang', 16.0752, 108.1524, v_now - INTERVAL '18 hours', v_now - INTERVAL '15 hours', 'Kysu Truong Nguyen Phuc', '0905778899', 18500000, 'Van chuyen thep cuon xay dung, bat buoc chang buoc xich 4 goc', 'TRK-HPQ-20261031001', 'b1000000-0000-0000-0000-000000000003', v_now - INTERVAL '32 hours', v_now - INTERVAL '16 hours')
    ON CONFLICT ("TenantId", "OrderCode") DO UPDATE SET "Status" = EXCLUDED."Status";

    -- 12. ORDER ITEMS
    INSERT INTO "OrderItems" ("Id", "TenantId", "OrderId", "ItemName", "Quantity", "Unit", "WeightKg", "VolumeCbm", "IsFragile", "Notes", "CreatedAtUtc", "UpdatedAtUtc")
    VALUES
        ('0b000000-0000-0000-0000-000000000001', v_tenant_id, '0a000000-0000-0000-0000-000000000001', 'Sua tuoi tiet trung Vinamilk 100% 1L (Thung 12 hop)', 120, 'Thung', 3600, 16, true, 'Hang chuan xuat kho', v_now, v_now),
        ('0b000000-0000-0000-0000-000000000002', v_tenant_id, '0a000000-0000-0000-0000-000000000001', 'Sua dac Co Ong Tho Hop Thiec 380g (Thung 48 hop)', 120, 'Thung', 3600, 16, false, 'Dong thung carton tieu chuan', v_now, v_now),
        ('0b000000-0000-0000-0000-000000000003', v_tenant_id, '0a000000-0000-0000-0000-000000000002', 'Ca Basa Fillet dong lanh xuat khau Danifoods', 150, 'Thung', 1500, 8, false, 'Nhiet do bao quan -18 do C', v_now, v_now),
        ('0b000000-0000-0000-0000-000000000004', v_tenant_id, '0a000000-0000-0000-0000-000000000003', 'Thep cuon xay dung Hoa Phat Phi 10 (Cuon 1.5 tan)', 19, 'Cuon', 28500, 22, false, 'Thep mac CB300-T', v_now - INTERVAL '32 hours', v_now - INTERVAL '32 hours')
    ON CONFLICT ("Id") DO NOTHING;

    -- 13. POD RECORDS (Xác nhận giao nhận điện tử ePOD)
    INSERT INTO "PodRecords" ("Id", "TenantId", "OrderId", "TripId", "RecipientName", "RecipientPhone", "SignatureBase64", "PhotoUrl", "Latitude", "Longitude", "TimestampUtc", "HashSha256", "IsVerified", "Notes", "CreatedAtUtc", "UpdatedAtUtc")
    VALUES
        ('0c000000-0000-0000-0000-000000000001', v_tenant_id, '0a000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003', 'Ky su Truong Nguyen Phuc', '0905778899', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80"><path d="M10 50 Q 50 10, 100 50 T 190 40" stroke="%231E3A8A" stroke-width="3" fill="none"/></svg>', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80', 16.0752, 108.1524, v_now - INTERVAL '16 hours', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', true, 'Giao nhan du 19 cuon thep, khong tray xuoc, CO/CQ day du', v_now - INTERVAL '16 hours', v_now - INTERVAL '16 hours')
    ON CONFLICT ("TenantId", "OrderId") DO NOTHING;

    -- 14. VEHICLE DOCUMENTS (Hồ sơ giấy tờ xe tải)
    -- DocumentType: 1=Registration, 2=Inspection, 3=Insurance, 4=TransportBadge, 5=DrivingLicense
    INSERT INTO "VehicleDocuments" ("Id", "TenantId", "VehicleId", "DocumentType", "DocumentNumber", "Issuer", "IssuedDateUtc", "ExpiryDateUtc", "AlertBeforeDays", "IsAlertActive", "FileScanUrl", "Notes", "IsSimulated", "CreatedAtUtc", "UpdatedAtUtc")
    VALUES
        ('0d000000-0000-0000-0000-000000000001', v_tenant_id, 'e1000000-0000-0000-0000-000000000001', 1, 'DKX-43C18924', 'Phong CSGT Cong an TP Da Nang', v_now - INTERVAL '730 days', v_now + INTERVAL '1000 days', 30, false, '/docs/dkx-43c18924.pdf', 'Chung nhan dang ky xe o to tai', false, v_now, v_now),
        ('0d000000-0000-0000-0000-000000000002', v_tenant_id, 'e1000000-0000-0000-0000-000000000001', 2, 'KD-4301S-8924', 'Trung tam Dang kiem 43-01S Da Nang', v_now - INTERVAL '180 days', v_now + INTERVAL '25 days', 30, true, '/docs/dangkiem-43c18924.pdf', 'Sap het han dang kiem trong vong 25 ngay toi', false, v_now, v_now),
        ('0d000000-0000-0000-0000-000000000003', v_tenant_id, 'e1000000-0000-0000-0000-000000000001', 3, 'BH-BVI-992104', 'Tong cong ty Bao hiem Bao Viet', v_now - INTERVAL '200 days', v_now + INTERVAL '165 days', 15, false, '/docs/baohiem-43c18924.pdf', 'Bao hiem TNDS bat buoc va vat chat xe co gioi', false, v_now, v_now),
        ('0d000000-0000-0000-0000-000000000004', v_tenant_id, 'e1000000-0000-0000-0000-000000000003', 2, 'KD-4302S-2251', 'Trung tam Dang kiem 43-02S Da Nang', v_now - INTERVAL '300 days', v_now + INTERVAL '65 days', 30, false, '/docs/dangkiem-43c22519.pdf', 'Kiem dinh an toan ky thuat thung xe dong lanh', false, v_now, v_now)
    ON CONFLICT ("Id") DO NOTHING;

    -- 15. DEVICES (Thiết bị định vị GPS & Cảm biến nhiệt độ IoT)
    -- DeviceType: 0=GPS Tracker, 1=Temperature Sensor, 2=TPMS, 3=Dashcam
    INSERT INTO "Devices" ("Id", "TenantId", "SerialNumber", "Name", "DeviceType", "VehicleId", "BatteryPercentage", "LastHeartbeatUtc", "IsActive", "FirmwareVersion", "IsSimulated", "CreatedAtUtc", "UpdatedAtUtc")
    VALUES
        ('0e000000-0000-0000-0000-000000000001', v_tenant_id, 'IOT-GPS-43C18924', 'Dinh vi GPS 4G Hino 500', 0, 'e1000000-0000-0000-0000-000000000001', 98, v_now, true, 'v3.2.1-prod', false, v_now, v_now),
        ('0e000000-0000-0000-0000-000000000002', v_tenant_id, 'IOT-TEMP-43C22519', 'Cam bien Nhiet do Thung Lanh Ble', 1, 'e1000000-0000-0000-0000-000000000003', 92, v_now, true, 'v2.0.8-prod', false, v_now, v_now),
        ('0e000000-0000-0000-0000-000000000003', v_tenant_id, 'IOT-TPMS-43H01288', 'Giam sat Ap suat Lop TPMS 4 Truc', 2, 'e1000000-0000-0000-0000-000000000002', 88, v_now, true, 'v1.4.0-prod', false, v_now, v_now)
    ON CONFLICT ("TenantId", "SerialNumber") DO NOTHING;

    -- 16. TOLL TRANSACTIONS (Giao dịch BOT tự động VETC/ePass)
    INSERT INTO "TollTransactions" ("Id", "TenantId", "TransactionCode", "StationName", "TollProvider", "VehicleId", "TripId", "AmountVnd", "PassedAtUtc", "IsReconciled", "IsSimulated", "Notes", "CreatedAtUtc", "UpdatedAtUtc")
    VALUES
        ('0f000000-0000-0000-0000-000000000001', v_tenant_id, 'VETC-20261101-08912', 'Tram Thu phi BOT Dien Ban (Km 943)', 'VETC', 'e1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 76000, v_now - INTERVAL '2 hours 10 mins', true, false, 'Tru truc tiep tu tai khoan giao thong VDBus', v_now, v_now),
        ('0f000000-0000-0000-0000-000000000002', v_tenant_id, 'EPASS-20261101-09415', 'Tram Thu phi BOT Tam Ky', 'ePass', 'e1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 110000, v_now - INTERVAL '1 hours 15 mins', true, false, 'Giao dich quet the tu dong thanh cong', v_now, v_now),
        ('0f000000-0000-0000-0000-000000000003', v_tenant_id, 'VETC-20261031-07119', 'Tram Thu phi BOT Nam Hai Van', 'VETC', 'e1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003', 190000, v_now - INTERVAL '24 hours', true, false, 'Doi soat khop ma the va bien so xe 43H-012.88', v_now - INTERVAL '24 hours', v_now - INTERVAL '24 hours')
    ON CONFLICT ("TenantId", "TransactionCode") DO NOTHING;

    -- 17. FUEL RECORDS (Phiếu đổ dầu Diesel)
    INSERT INTO "FuelRecords" ("Id", "TenantId", "VehicleId", "DriverId", "TripId", "OdometerKm", "FuelLitre", "UnitPriceVnd", "TotalAmountVnd", "StationName", "SensorLitreBeforeRefuel", "SensorLitreAfterRefuel", "AbnormalityScore", "AbnormalityReason", "ConfidenceRating", "PurchasedAtUtc", "ReceiptPhotoUrl", "Notes", "IsSimulated", "CreatedAtUtc", "UpdatedAtUtc")
    VALUES
        ('f1000000-0000-0000-0000-000000000001', v_tenant_id, 'e1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 142850, 65.5, 21850, 1431175, 'CHXD Petrolimex So 12 Da Nang', 35.0, 100.5, 0.02, 'Binh thuong, sai lech cam bien duoi 1.5%', 0.98, v_now - INTERVAL '2 hours 45 mins', 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80', 'Do dau Diesel 0.05S truoc gio xuat phat', false, v_now, v_now),
        ('f1000000-0000-0000-0000-000000000002', v_tenant_id, 'e1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003', 285400, 120.0, 21850, 2622000, 'CHXD PV Oil Dung Quat', 50.0, 170.0, 0.01, 'Khop hoan toan du lieu the nhien lieu', 0.99, v_now - INTERVAL '25 hours', 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80', 'Do day binh xe dau keo sau khi lay thep', false, v_now - INTERVAL '25 hours', v_now - INTERVAL '25 hours')
    ON CONFLICT ("Id") DO NOTHING;

    -- 18. INVOICES (Hóa đơn cước vận tải B2B)
    -- Status: 1=Draft, 2=Issued, 3=Paid, 4=Overdue, 5=Cancelled
    INSERT INTO "Invoices" ("Id", "TenantId", "InvoiceCode", "CustomerId", "OrderId", "SubtotalVnd", "TaxPercent", "TaxAmountVnd", "TotalAmountVnd", "Status", "IssuedDateUtc", "DueDateUtc", "PaymentDateUtc", "PaymentReference", "Notes", "CreatedAtUtc", "UpdatedAtUtc")
    VALUES
        ('f2000000-0000-0000-0000-000000000001', v_tenant_id, 'INV-202610-0089', 'c1000000-0000-0000-0000-000000000002', '0a000000-0000-0000-0000-000000000003', 18500000, 8.0, 1480000, 19980000, 3, v_now - INTERVAL '15 hours', v_now + INTERVAL '30 days', v_now - INTERVAL '10 hours', 'UNC-VCB-88391024', 'Thanh toan cuoc van chuyen thep cuon Hoa Phat', v_now - INTERVAL '15 hours', v_now - INTERVAL '10 hours'),
        ('f2000000-0000-0000-0000-000000000002', v_tenant_id, 'INV-202611-0001', 'c1000000-0000-0000-0000-000000000001', '0a000000-0000-0000-0000-000000000001', 8500000, 8.0, 680000, 9180000, 2, v_now, v_now + INTERVAL '30 days', NULL, '', 'Hoa don tam tinh chuyen sua Vinamilk', v_now, v_now)
    ON CONFLICT ("TenantId", "InvoiceCode") DO NOTHING;

END $$;
