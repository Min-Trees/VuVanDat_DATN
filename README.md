# VuVanDat_DATN

## VDBus Logistics Platform - Enterprise B2B SaaS TMS
### Đồ Án Tốt Nghiệp: Nền tảng Quản trị Vận tải Đa thuê bao & Ứng dụng Di động Buồng lái Tài xế

[![Quality Gate](https://img.shields.io/badge/Quality%20Gate-11%2F11%20Passed-success)](#)
[![Backend](https://img.shields.io/badge/.NET-8.0%20LTS-blue)](#)
[![Mobile](https://img.shields.io/badge/Flutter-3.24%2B%20%2F%20Dart%203.5-02569B)](#)
[![Web](https://img.shields.io/badge/React-18%20%7C%20TypeScript-61DAFB)](#)
[![Database](https://img.shields.io/badge/PostgreSQL-17-336791)](#)
[![Enterprise Rules](https://img.shields.io/badge/Enterprise%20Design-0%20Emoji%20%7C%20Tokens%20Only-brightgreen)](#)

---

## 📌 GIỚI THIỆU TỔNG QUAN

**VDBus Logistics Platform** là giải pháp phần mềm Quản lý Vận tải B2B (Transportation Management System - TMS) đa thuê bao (Multi-tenancy), hướng tới giải quyết bài toán điều vận container, xe tải đông lạnh và vận tải hàng hóa nặng đường dài tại thị trường Việt Nam (tuyến trục Đà Nẵng, Dung Quất, Hải Vân, Quy Nhơn, TP.HCM, Hà Nội).

Hệ sinh thái bao gồm:
1. **Core Backend API**: Xây dựng trên nền tảng **.NET 8 Clean Architecture**, hỗ trợ đa thuê bao phân lập dữ liệu, phân quyền RBAC/ABAC, quản lý chuyến đi, trạm BOT, telematics xe thời gian thực.
2. **Web Admin Portal**: Cổng thông tin điều vận trung tâm, bản đồ giám sát đội xe Leaflet/OpenStreetMap, quản lý đơn hàng, kho bãi và tài chính.
3. **Web Shipper Portal**: Cổng thông tin tự phục vụ dành cho chủ hàng (tạo đơn vận tải, theo dõi trạng thái lô hàng, tra cứu định vị xe thời gian thực).
4. **Mobile Driver App (Flutter)**: Ứng dụng di động chuyên biệt cho tài xế xe tải buồng lái (Android/iOS/Web), công thái học thao tác 1 tay, chế độ ban đêm, hỗ trợ ngoại tuyến khi mất sóng, bảng ký nhận ePOD và đồng hồ cảnh báo giờ lái xe liên tục (HOS).
5. **Driver Mobile Standalone Prototype (`driver-prototype.html`)**: Bản nguyên mẫu hoàn chỉnh trong MỘT file HTML/CSS/JS thuần, tích hợp bản đồ dẫn đường vector SVG heading-up bám xe, mô phỏng nhận đơn Grab 15s và hàng đợi ngoại tuyến.

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY NHANH CHO AGENT VÀ DEVELOPER

> 📖 **Xem hướng dẫn chi tiết từng bước:** [AGENT_SETUP_GUIDE.md](AGENT_SETUP_GUIDE.md)

### 1. Yêu cầu môi trường
- **.NET SDK 8.0+**
- **Node.js 20+ & npm 10+**
- **PostgreSQL 17** (Cổng mặc định: `5432`, Database: `vdbus_tms`, User: `postgres`, Pass: `password`)
- **Flutter SDK 3.24+ / 3.35+** & **Android Studio** (AVD Pixel 5 / API 34+)

---

### 2. Khởi chạy từng thành phần

#### A. Cơ sở dữ liệu (PostgreSQL)
```powershell
# Chạy script khởi tạo cơ sở dữ liệu và nạp dữ liệu mẫu
$env:PGPASSWORD="password"
psql -h localhost -p 5432 -U postgres -f scripts/setup-local-db.sql
psql -h localhost -p 5432 -U postgres -d vdbus_tms -f scripts/seed-production-logistics.sql
```

#### B. Backend API (.NET 8)
```powershell
dotnet restore backend/VDBus.slnx
dotnet build backend/VDBus.slnx
dotnet run --project backend/src/VDBus.Api/VDBus.Api.csproj --urls "http://localhost:5000"
```
- **Swagger Documentation:** [http://localhost:5000/swagger](http://localhost:5000/swagger)

#### C. Web Admin & Shipper Portals (Vite Monorepo)
```powershell
# Cài đặt thư viện:
npm install

# Khởi chạy Web Admin (Port 3000):
npm run dev --workspace=@vdbus/web-admin

# Khởi chạy Web Shipper (Port 3001):
npm run dev --workspace=@vdbus/web-shipper
```

#### D. Mobile Driver App (Flutter)
```powershell
cd mobile
flutter pub get

# 1. Chạy trên máy ảo Android (Pixel 5):
# Đảm bảo đã bật cầu nối mạng sang backend:
adb reverse tcp:5000 tcp:5000
flutter run -d emulator-5554

# 2. Hoặc chạy trên Web Server (không cần máy ảo):
flutter run -d web-server --web-port 3002 --web-hostname 0.0.0.0
# Truy cập: http://localhost:3002
```

#### E. Chạy Prototype Di động Độc lập (HTML/CSS/JS thuần)
Mở trực tiếp file `driver-prototype.html` trên trình duyệt:
```powershell
Start-Process "driver-prototype.html"
```

---

## 🧪 KIỂM TRA CHẤT LƯỢNG TOÀN DIỆN (QUALITY GATES)

Hệ thống được trang bị bộ kiểm định chất lượng tự động đạt chuẩn Enterprise:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify-all.ps1
```

- `[1/11]` .NET 8 Backend Build: **PASS**
- `[2/11]` .NET 8 Unit & Integration Tests (58 tests): **PASS**
- `[3/11]` Enterprise B2B Design Linter (0 Emoji, 0 Hardcoded Colors): **PASS**
- `[4/11]` TypeScript Typecheck Monorepo: **PASS**
- `[5/11]` Web Vitest Unit Tests (28 tests): **PASS**
- `[6/11]` Web Production Build Bundles: **PASS**
- `[7/11]` Flutter Analyze & 10 Widget Tests: **PASS**
- `[8/11]` Phase 1 Master Data Validation: **PASS**
- `[9/11]` Phase 2 Dispatch Validation: **PASS**
- `[10/11]` Phase 3 Telematics & Alert Validation: **PASS**
- `[11/11]` Benchmark 1,000 xe gửi telematics đồng thời: **PASS**

---

## 📂 CẤU TRÚC THƯ MỤC DỰ ÁN

```
VuVanDat_DATN/
├── AGENT_SETUP_GUIDE.md        # Hướng dẫn chi tiết cho Agent & Lập trình viên
├── README.md                   # Giới thiệu đồ án và tổng quan hệ thống
├── driver-prototype.html       # Prototype di động độc lập (HTML5/CSS3/Vanilla JS)
├── backend/                    # .NET 8 Clean Architecture Web API
│   ├── src/
│   │   ├── VDBus.Api/          # Controllers, Program.cs, Middleware, SignalR
│   │   ├── VDBus.Application/  # DTOs, Services, Interfaces, CQRS
│   │   ├── VDBus.Domain/       # Entities, Value Objects, Enums
│   │   └── VDBus.Infrastructure/# EF Core, DbContext, PostgreSQL, Repositories
│   └── tests/                  # Unit & Integration Tests (58 tests)
├── packages/
│   └── design-system/          # React Enterprise B2B Design Tokens & Components
├── web/
│   ├── admin/                  # React Vite Admin Portal (Port 3000)
│   └── shipper/                # React Vite Shipper Portal (Port 3001)
├── mobile/                     # Flutter Driver App (Android/iOS/Web)
│   ├── lib/
│   │   ├── screens/            # Màn hình: Cockpit, Chuyến, ePOD, Ví xe, Đăng nhập
│   │   ├── services/           # ApiService, TokenStorage, OfflineService
│   │   └── widgets/            # SignaturePad, StatusBadge, MetricGauge
│   ├── test/                   # Flutter Widget & Screen Tests
│   └── android/                # Android Gradle Project Configuration
├── scripts/                    # Scripts tự động hóa: verify-all, seed data, linter
└── docs/                       # Tài liệu thiết kế hệ thống, ADRs, báo cáo
```

---

## 👨‍💻 TÁC GIẢ & THÔNG TIN ĐỒ ÁN
- **Đồ Án Tốt Nghiệp**: Vũ Văn Đạt
- **Repository**: [https://github.com/Min-Trees/VuVanDat_DATN.git](https://github.com/Min-Trees/VuVanDat_DATN.git)
- **Năm thực hiện**: 2026
