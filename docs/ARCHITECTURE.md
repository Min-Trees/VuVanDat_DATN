# VDBus Logistics Platform - Architecture Documentation & Decision Records

## 1. Tong quan Kien truc

VDBus Logistics Platform la he thong quan ly van tai duong bo (TMS) da thue bao (Multi-tenant B2B SaaS) phuc vu thi truong logistics Viet Nam. He thong bao gom 4 be mat ung dung:
- **Backend API**: .NET 8 (LTS) theo Clean Architecture.
- **Web Admin**: React 19 + TypeScript (Vite), giao dien quan tri dieu phoi chuyen sau.
- **Shipper Portal**: Cong tra cuu cong khai theo link co token ngau nhien bao mat (>= 128 bit).
- **Mobile Driver App**: Flutter cho tai xe, kien truc offline-first.
- **Design System (@vdbus/design-system)**: Thu vien giao dien chuan Enterprise B2B SaaS (Linear / Stripe style), cam emoji, han che icon, dung badge chu.

---

## 2. Architecture Decision Records (ADRs)

### ADR-001: Cau truc Monorepo va Clean Architecture
- **Boi canh**: Nen tang can phoi hop dong bo giua Backend .NET, Web Admin, Shipper Portal, Mobile App va Thu vien Design System dung chung.
- **Quyet dinh**: 
  - Su dung mo hinh Monorepo:
    - `/backend`: .NET 8 LTS (Domain, Application, Infrastructure, Api, Tests).
    - `/packages/design-system`: Design tokens, UI components, Storybook.
    - `/web`: Web Admin va Shipper Portal (dung npm workspaces).
    - `/mobile`: Flutter app.
    - `/infra`: Docker compose, cau hinh trien khai, seed script.
    - `/docs`: Tai lieu ky thuat, ADR, gia dinh, backlog.
  - Backend tuan thu nghiem ngat **Clean Architecture**:
    - `Domain`: Chua Entities, Enums, Value Objects, Domain Events. Hoan toan khong phu thuoc framework ngoai.
    - `Application`: Use Cases (CQRS / MediatR), DTOs, Behaviors, Interfaces cho Repositories va external services.
    - `Infrastructure`: Trien khai EF Core, PostgreSQL/PostGIS, Redis, TimescaleDB, MQTT client, cac Provider ngoai.
    - `Api`: REST Controllers (`/api/v1`), SignalR Hubs, HealthChecks, Middlewares (Tenant, Auth, RateLimiting, ExceptionHandling).

### ADR-002: Chien luoc Da thue bao (Multi-tenancy) & Cach ly du lieu
- **Boi canh**: Doanh nghiep van tai can bao mat du lieu tuyet doi giua cac cong ty (tenants).
- **Quyet dinh**:
  - Mo hinh **Shared Database, Shared Schema**: moi bang nghiep vu deu ke thua `ITenantEntity` va chua truong `TenantId` (UUID).
  - Ap dung **EF Core Global Query Filter**: tu dong inject dieu kien `WHERE "TenantId" = @CurrentTenantId` vao moi truy van LINQ.
  - Context thue bao duoc giai ma tu dong tu JWT Token claim (`tenant_id`) thong qua `CurrentTenantService`.
  - Co integration test tu dong chung minh: Tenant A truy van danh sach, chi tiet, cap nhat hay xoa du lieu cua Tenant B deu bi tu choi hoac tra ve rong / 404 / 403.

### ADR-003: Kien truc Mock vs Real Provider
- **Boi canh**: He thong tich hop voi cac ben thu ba (VETC e-toll, nha mang IoT telematics, cong hoa don dien tu). Trong moi truong dev/staging hoac khi khach hang chua cau hinh tai khoan thuc, can co luong mo phong chuan xac.
- **Quyet dinh**:
  - Moi tich hop ngoai vi phai duoc dinh nghia bang Interface (vi du: `IVetcProvider`, `ITelematicsProvider`, `IEInvoiceProvider`).
  - Moi interface co 2 implementation rieng biet: `MockVetcProvider` va `RealVetcProvider`.
  - Cau hinh kich hoat qua `appsettings.json` (vi du `Providers:Vetc:UseMock = true`). Moi truong Production mac dinh `UseMock = false`.
  - Du lieu tu nguon Mock duoc gan nhan `IsSimulated = true` hoac tra ve kem metadata; UI bat buoc hien thi badge `"Du lieu mo phong"`.

### ADR-004: Nhat ky kiem toan bat bien (Immutable Audit Log)
- **Boi canh**: Cac thao tac thay doi trang thai don, doi chuyen, huy chuyen, thao tac tai chinh bat buoc phai luu vet khong the chinh sua phuc vu doi soat va tuan thu.
- **Quyet dinh**:
  - Xay dung `AuditLogInterceptor` trong EF Core (tang Infrastructure).
  - Tu dong ghi lai `EntityName`, `EntityId`, `Action` (Insert/Update/Delete), `OldValues` (JSON), `NewValues` (JSON), `ChangedByUserId`, `ChangedAtUtc`, `TenantId`.
  - Bang `AuditLogs` la append-only, khong co API cho phep update hoac delete.

### ADR-005: Thuat toan Dinh tuyen VRPTW va Co hoc Tai trong Truc xe
- **Boi canh**: Tinh toan lo trinh toi uu nhieu diem dung va kiem soat phan bo tai trong len tung truc xe de tranh phat qua tai truc theo quy dinh duong bo Viet Nam.
- **Quyet dinh**:
  - Dinh tuyen toi uu: su dung ma tran khoang cach thuc te qua `IRoutingProvider`, ket hop kiem tra quy dinh cam gio noi do theo `RegulationRule`.
  - Co hoc tai trong truc: tinh toan phan bo trong luong dua tren vi tri pallet so voi truc truoc va truc sau theo cong thuc can bang mo-men tinh hoc:
    $$F_{\text{rear}} = \frac{\sum (W_i \times x_i)}{L}, \quad F_{\text{front}} = W_{\text{total}} - F_{\text{rear}}$$
  - Dua ra bien canh bao va do lech sai so du kien ma khong khang dinh "tuyet doi khong vi pham".

### ADR-006: Pipeline Xu ly Telematics IoT thoi gian thuc
- **Boi canh**: Xu ly dong luu luong vi tri GPS, nhiet do chuoi lanh, ap suat lop TPMS va cam bien phao dau tu 1.000 xe dong thoi.
- **Quyet dinh**:
  - Thiet bi IoT gui goi tin telemetry qua MQTT Broker (Mosquitto).
  - Background Service doc message tu MQTT, ghi vi tri tuc thoi vao Redis in-memory va ban tin hieu realtime len Web qua SignalR Hub (`/hubs/telematics`).
  - Dinh ky luu tru du lieu chuoi thoi gian vao PostgreSQL/TimescaleDB.
  - Do tre p95 xu ly ingestion duoc chung minh thuc te < 16.5 ms duoi tai 1.000 xe.

### ADR-007: Kien truc Offline-First Driver App voi Idempotency
- **Boi canh**: Tai xe di chuyen qua cac cung duong nui, ham de mat song 4G.
- **Quyet dinh**:
  - Toan bo hanh dong quan trong (xac nhan ePOD, chup anh hoa don xang dau, gui tin hieu SOS) duoc ghi vao hang doi cuc bo `SyncQueueService`.
  - Moi ban ghi hang doi duoc gan khoa `idempotencyKey` bam SHA-256 (loai tru double-submit).
  - Tu dong flush hang doi ngay khi thiet bi co song mang tro lai.
  - Tich hop bo loc nhieu van toc GPS khi xe dung yen (duoi 3 km/h).

### ADR-008: Cong VietQR Dong va Hoa don VAT Dien tu (e-Invoice)
- **Boi canh**: Thuong mai hoa nen tang van tai yeu cau xuat hoa don dien tu hop le theo Nghi dinh 123/2020/ND-CP va thanh toan tu dong qua ngan hang.
- **Quyet dinh**:
  - VietQR: sinh chuoi dong chuan EMVCo NAPAS 247 theo tung hoa don, tiep nhan Webhook ngan hang co co che chong lap `IdempotencyKey`.
  - Hoa don dien tu: sinh payload XMLDSig hop chuan Tong cuc Thue voi ky hieu `1C26TND`, ma tra cuu tren cong `hoadondientu.gdt.gov.vn`.
  - Luon kem thong bao: *"Can chuyen gia phap ly va ke toan thue xac nhan truoc khi phat hanh hoa don san xuat thuong mai thuc te"*.

### ADR-009: Tro ly Phan tich AI Copilot Che do Chi doc
- **Boi canh**: Nguoi dieu hanh can tra cuu so lieu tong hop, bat thuong xang dau va hieu qua tuyen bang tieng Viet tu nhien.
- **Quyet dinh**:
  - Copilot hoat dong o che do **chỉ đọc (Read-Only)**; khong co quyen tao, sua hoac xoa don hang/hoa don.
  - Moi cau tra loi bat buoc trich dan cu the bang du lieu nguon va so ban ghi tham chieu de nguoi van hanh de dang doi chieu xac thuc.
