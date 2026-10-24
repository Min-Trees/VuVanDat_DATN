# VDBus Logistics Platform - Architecture Documentation & Decision Records

## 1. Tổng quan Kiến trúc

VDBus Logistics Platform là hệ thống quản lý vận tải đường bộ (TMS) đa thuê bao (Multi-tenant B2B SaaS) phục vụ thị trường logistics Việt Nam. Hệ thống bao gồm 4 bề mặt ứng dụng:
- **Backend API**: .NET 8 (LTS) theo Clean Architecture.
- **Web Admin**: React + TypeScript (Vite), giao diện quản trị điều phối chuyên sâu.
- **Shipper Portal**: Cổng tra cứu công khai theo link có token ngẫu nhiên bảo mật (>= 128 bit).
- **Mobile Driver App**: Flutter cho tài xế, offline-first.
- **Design System (@vdbus/design-system)**: Thư viện giao diện chuẩn Enterprise B2B SaaS (Linear / Stripe style), cấm emoji, hạn chế icon, dùng badge chữ.

---

## 2. Architecture Decision Records (ADRs)

### ADR-001: Cấu trúc Monorepo và Clean Architecture
- **Bối cảnh**: Nền tảng cần phối hợp đồng bộ giữa Backend .NET, Web Admin, Shipper Portal, Mobile App và Thư viện Design System dùng chung.
- **Quyết định**: 
  - Sử dụng mô hình Monorepo:
    - `/backend`: .NET 8 LTS (Domain, Application, Infrastructure, Api, Tests).
    - `/packages/design-system`: Design tokens, UI components, Storybook.
    - `/web`: Web Admin và Shipper Portal (dùng npm workspaces).
    - `/mobile`: Flutter app.
    - `/infra`: Docker compose, cấu hình triển khai, seed script.
    - `/docs`: Tài liệu kỹ thuật, ADR, giả định, backlog.
  - Backend tuân thủ nghiêm ngặt **Clean Architecture**:
    - `Domain`: Chứa Entities, Enums, Value Objects, Domain Events. Hoàn toàn không phụ thuộc framework ngoài.
    - `Application`: Use Cases (CQRS / MediatR), DTOs, Behaviors, Interfaces cho Repositories và external services.
    - `Infrastructure`: Triển khai EF Core, PostgreSQL/PostGIS, Redis, TimescaleDB, MQTT client, các Provider ngoài.
    - `Api`: REST Controllers (`/api/v1`), SignalR Hubs, HealthChecks, Middlewares (Tenant, Auth, RateLimiting, ExceptionHandling).

### ADR-002: Chiến lược Đa thuê bao (Multi-tenancy) & Cách ly dữ liệu
- **Bối cảnh**: Doanh nghiệp vận tải cần bảo mật dữ liệu tuyệt đối giữa các công ty (tenants).
- **Quyết định**:
  - Mô hình **Shared Database, Shared Schema**: mọi bảng nghiệp vụ đều kế thừa `ITenantEntity` và chứa trường `TenantId` (UUID).
  - Áp dụng **EF Core Global Query Filter**: tự động inject điều kiện `WHERE "TenantId" = @CurrentTenantId` vào mọi truy vấn LINQ.
  - Context thuê bao được giải mã tự động từ JWT Token claim (`tenant_id`) thông qua `CurrentTenantService`.
  - Có integration test tự động chứng minh: Tenant A truy vấn danh sách, chi tiết, cập nhật hay xóa dữ liệu của Tenant B đều bị từ chối hoặc trả về rỗng / 404 / 403.

### ADR-003: Kiến trúc Mock vs Real Provider
- **Bối cảnh**: Hệ thống tích hợp với các bên thứ ba (VETC e-toll, nhà mạng IoT telematics, cổng hóa đơn điện tử). Trong môi trường dev/staging hoặc khi khách hàng chưa cấu hình tài khoản thực, cần có luồng mô phỏng chuẩn xác.
- **Quyết định**:
  - Mọi tích hợp ngoại vi phải được định nghĩa bằng Interface (ví dụ: `IVetcProvider`, `ITelematicsProvider`, `IEInvoiceProvider`).
  - Mỗi interface có 2 implementation riêng biệt: `MockVetcProvider` và `RealVetcProvider`.
  - Cấu hình kích hoạt qua `appsettings.json` (ví dụ `Providers:Vetc:UseMock = true`). Môi trường Production mặc định `UseMock = false`.
  - Dữ liệu từ nguồn Mock được gắn nhãn `IsSimulated = true` hoặc trả về kèm metadata; UI bắt buộc hiển thị badge `"Dữ liệu mô phỏng"`.

### ADR-004: Nhật ký kiểm toán bất biến (Immutable Audit Log)
- **Bối cảnh**: Các thao tác thay đổi trạng thái đơn, đổi chuyến, hủy chuyến, thao tác tài chính bắt buộc phải lưu vết không thể chỉnh sửa phục vụ đối soát và tuân thủ.
- **Quyết định**:
  - Xây dựng `AuditLogInterceptor` trong EF Core (tầng Infrastructure).
  - Tự động ghi lại `EntityName`, `EntityId`, `Action` (Insert/Update/Delete), `OldValues` (JSON), `NewValues` (JSON), `ChangedByUserId`, `ChangedAtUtc`, `TenantId`.
  - Bảng `AuditLogs` là append-only, không có API cho phép update hoặc delete.
