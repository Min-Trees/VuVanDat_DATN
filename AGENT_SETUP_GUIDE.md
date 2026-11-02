# HƯỚNG DẪN THIẾT LẬP MÔI TRƯỜNG VÀ KHỞI CHẠY HỆ THỐNG CHO AGENT / DEVELOPER
## VDBus Logistics Platform - Enterprise B2B SaaS TMS (Đồ Án Tốt Nghiệp)

> Tài liệu này được thiết kế chuyên biệt cho AI Agent và Lập trình viên để tự động hóa toàn bộ quy trình: cài đặt tài nguyên môi trường, thiết lập cơ sở dữ liệu, biên dịch backend, chạy frontend web monorepo, và đặc biệt là thiết lập môi trường di động (Flutter & Android Studio/Emulator).

---

## MỤC LỤC
1. [Tổng quan kiến trúc hệ thống](#1-tổng-quan-kiến-trúc-hệ-thống)
2. [Yêu cầu tiên quyết & Ma trận phiên bản (Prerequisites)](#2-yêu-cầu-tiên-quyết--ma-trận-phiên-bản-prerequisites)
3. [Quy trình cài đặt môi trường chi tiết (Step-by-Step)](#3-quy-trình-cài-đặt-môi-trường-chi-tiết-step-by-step)
   - [Bước 1: Kiểm tra môi trường hệ thống](#bước-1-kiểm-tra-môi-trường-hệ-thống)
   - [Bước 2: Thiết lập Cơ sở dữ liệu PostgreSQL 17](#bước-2-thiết-lập-cơ-sở-dữ-liệu-postgresql-17)
   - [Bước 3: Biên dịch và Khởi chạy Backend .NET 8 Web API](#bước-3-biên-dịch-và-khởi-chạy-backend-net-8-web-api)
   - [Bước 4: Thiết lập và Khởi chạy Web Frontends (Admin & Shipper)](#bước-4-thiết-lập-và-khởi-chạy-web-frontends-admin--shipper)
   - [Bước 5: Thiết lập Môi trường Di động (Flutter & Android Studio Emulator)](#bước-5-thiết-lập-môi-trường-di-động-flutter--android-studio-emulator)
   - [Bước 6: Khởi chạy Prototype Di động Độc lập (driver-prototype.html)](#bước-6-khởi-chạy-prototype-di-động-độc-lập-driver-prototypehtml)
4. [Bộ kiểm định chất lượng tự động (Quality Gates)](#4-bộ-kiểm-định-chất-lượng-tự-động-quality-gates)
5. [Cẩm nang xử lý sự cố thường gặp (Troubleshooting)](#5-cẩm-nang-xử-lý-sự-cố-thường-gặp-troubleshooting)

---

## 1. TỔNG QUAN KIẾN TRÚC HỆ THỐNG

Hệ thống VDBus Logistics Platform gồm 4 tầng công nghệ chính:

```
+------------------------------------------------------------------------------------+
|                                VDBUS LOGISTICS PLATFORM                            |
+------------------------------------------------------------------------------------+
| 1. Mobile Driver App (Flutter 3.24+ / 3.35+) - Android, iOS & Web                  |
|    - Vị trí: /mobile                                                               |
|    - Cổng Web Driver: http://localhost:3002                                        |
|    - Prototype buồng lái độc lập: /driver-prototype.html                           |
+------------------------------------------------------------------------------------+
| 2. Web Portals (React 18 + TypeScript + Vite + Design System)                      |
|    - Web Admin (Điều vận, Đội xe, Giám sát): http://localhost:3000                 |
|    - Web Shipper (Cổng chủ hàng, Tạo đơn, Tra cứu): http://localhost:3001          |
|    - Design System (@vdbus/design-system): Enterprise B2B Tokens & Components      |
+------------------------------------------------------------------------------------+
| 3. Backend Core (.NET 8 Clean Architecture Web API)                                |
|    - Vị trí: /backend                                                              |
|    - API Server: http://localhost:5000 (Swagger: http://localhost:5000/swagger)    |
|    - Đa thuê bao (Multi-tenancy): Tenant ID header / Subdomain isolation           |
+------------------------------------------------------------------------------------+
| 4. Database Layer (PostgreSQL 17)                                                  |
|    - Cổng: 5432 | Database: vdbus_tms | User: postgres                             |
|    - EF Core Code-First Migrations + SQL Production Seed Scripts                   |
+------------------------------------------------------------------------------------+
```

---

## 2. YÊU CẦU TIÊN QUYẾT & MA TRẬN PHIÊN BẢN (PREREQUISITES)

Agent cần kiểm tra và đảm bảo các công cụ sau đã có mặt trong biến môi trường `PATH`:

| Phần mềm / Công cụ | Phiên bản tối thiểu | Lệnh kiểm tra | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Hệ điều hành** | Windows 10/11 x64, Linux, macOS | `cmd /c ver` hoặc `uname -a` | Đang chạy chuẩn trên Windows |
| **.NET SDK** | .NET 8.0.x LTS | `dotnet --version` | Dùng build và chạy Backend API |
| **Node.js & npm** | Node 20.x+ / npm 10.x+ | `node -v` & `npm -v` | Chạy Vite monorepo Web |
| **PostgreSQL** | PostgreSQL 17.x (hoặc 15/16) | `psql --version` | Lưu trữ dữ liệu TMS |
| **Flutter SDK** | Flutter 3.24+ / 3.35+ (Dart 3.5+) | `flutter doctor -v` | Xây dựng Driver Mobile App |
| **Java JDK** | OpenJDK 17 | `java -version` | Phục vụ Android Gradle Build |
| **Android SDK & Tools**| API 34+ / Cmdline-tools | `adb version` | Nền tảng build APK và máy ảo |
| **Android Studio** | Koala / Meerkat / Ladybug | Studio executable | Quản lý AVD Pixel 5 / Emulator |

---

## 3. QUY TRÌNH CÀI ĐẶT MÔI TRƯỜNG CHI TIẾT (STEP-BY-STEP)

### BƯỚC 1: KIỂM TRA MÔI TRƯỜNG HỆ THỐNG
Mở Terminal (PowerShell trên Windows hoặc Bash trên Linux/macOS) tại thư mục gốc dự án:

```powershell
# 1. Kiểm tra .NET SDK
dotnet --version

# 2. Kiểm tra Node.js & npm
node -v
npm -v

# 3. Kiểm tra Flutter & Android toolchain
flutter doctor -v

# 4. Kiểm tra Android ADB và thiết bị/máy ảo sẵn có
adb devices
```

---

### BƯỚC 2: THIẾT LẬP CƠ SỞ DỮ LIỆU POSTGRESQL 17

1. **Khởi động dịch vụ PostgreSQL**:
   - *Trên Windows (Services)*:
     ```powershell
     Start-Service postgresql-x64-17
     # Hoặc kiểm tra:
     Get-Service postgresql*
     ```
   - *Nếu dùng Docker*:
     ```bash
     docker compose up -d postgres
     ```

2. **Tạo Cơ sở dữ liệu và cấu hình phân quyền**:
   Chạy file SQL khởi tạo `scripts/setup-local-db.sql`:
   ```powershell
   $env:PGPASSWORD="password"
   psql -h localhost -p 5432 -U postgres -f scripts/setup-local-db.sql
   ```

3. **Nạp dữ liệu mẫu Production Logistics (Master Data)**:
   Nạp dữ liệu mẫu gồm 4 Tenants, 10 Trạm trung chuyển, 20 Đội xe, 30 Điểm dừng, 12 Trạm BOT (Điện Bàn, Nam Hải Vân...):
   ```powershell
   $env:PGPASSWORD="password"
   psql -h localhost -p 5432 -U postgres -d vdbus_tms -f scripts/seed-production-logistics.sql
   ```

---

### BƯỚC 3: BIÊN DỊCH VÀ KHỞI CHẠY BACKEND .NET 8 WEB API

1. **Khôi phục thư viện và biên dịch Solution**:
   ```powershell
   dotnet restore backend/VDBus.slnx
   dotnet build backend/VDBus.slnx -c Release
   ```

2. **Chạy Unit & Integration Tests**:
   ```powershell
   dotnet test backend/VDBus.slnx --no-build
   ```

3. **Khởi chạy Backend API Server (Port 5000)**:
   ```powershell
   # Chạy trên tiến trình nền hoặc terminal riêng:
   dotnet run --project backend/src/VDBus.Api/VDBus.Api.csproj --urls "http://localhost:5000"
   ```

4. **Kiểm tra trạng thái hoạt động**:
   - Truy cập Swagger API Documentation: [http://localhost:5000/swagger](http://localhost:5000/swagger)
   - Kiểm tra Healthcheck: `http://localhost:5000/api/health`

---

### BƯỚC 4: THIẾT LẬP VÀ KHỞI CHẠY WEB FRONTENDS (ADMIN & SHIPPER)

1. **Cài đặt thư viện npm monorepo**:
   ```powershell
   npm install
   ```

2. **Kiểm tra tuân thủ Enterprise Linter & Typecheck**:
   ```powershell
   npm run lint        # Quét quy tắc Enterprise B2B (0 emoji, 0 hardcoded colors)
   npm run typecheck   # Kiểm tra TypeScript toàn diện
   npm run test        # Chạy 28 unit tests Vitest
   ```

3. **Khởi chạy Web Admin Portal (Port 3000)**:
   ```powershell
   npm run dev --workspace=@vdbus/web-admin
   # Truy cập: http://localhost:3000
   ```

4. **Khởi chạy Web Shipper Portal (Port 3001)**:
   ```powershell
   npm run dev --workspace=@vdbus/web-shipper
   # Truy cập: http://localhost:3001
   ```

---

### BƯỚC 5: THIẾT LẬP MÔI TRƯỜNG DI ĐỘNG (FLUTTER & ANDROID STUDIO EMULATOR)

Đây là phần trọng tâm để thiết lập môi trường mobile cho tài xế xe tải.

#### 5.1. Khắc phục lỗi build Gradle chéo ổ đĩa trên Windows (BẮT BUỘC)
Khi thư mục dự án nằm ở ổ đĩa khác Pub Cache (ví dụ: Code ở `D:\` và Pub Cache ở `C:\Users\...`), Kotlin incremental compiler sẽ báo lỗi `IllegalArgumentException: this and base files have different roots`.
Cần đảm bảo file `mobile/android/gradle.properties` đã cấu hình:
```properties
org.gradle.jvmargs=-Xmx4G -XX:MaxMetaspaceSize=1G -XX:+HeapDumpOnOutOfMemoryError
android.useAndroidX=true
android.enableJetifier=true
kotlin.incremental=false
kotlin.incremental.useClasspathSnapshot=false
```

#### 5.2. Cài đặt dependencies cho Flutter
Di chuyển vào thư mục `mobile`:
```powershell
cd mobile
flutter clean
flutter pub get
```

#### 5.3. Kiểm tra mã nguồn di động
```powershell
flutter analyze
flutter test
```
*(Yêu cầu: 0 warning, 0 error, pass 100% tests)*.

#### 5.4. Khởi chạy Máy ảo Android (Android Virtual Device - AVD)
1. **Khởi chạy máy ảo từ dòng lệnh**:
   ```powershell
   # Liệt kê danh sách máy ảo đã tạo:
   emulator -list-avds

   # Khởi chạy máy ảo Pixel 5:
   & "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -avd Pixel_5 -gpu auto
   ```
2. **Thiết lập cầu nối mạng (Reverse Port Forwarding)**:
   Máy ảo Android chạy trong sandbox mạng riêng. Để app gọi được Backend API đang chạy tại `http://localhost:5000` trên máy chủ, chạy:
   ```powershell
   adb reverse tcp:5000 tcp:5000
   ```
   *(Lưu ý: Mã nguồn `mobile/lib/services/api_service.dart` đã được cấu hình tự động nhận diện `10.0.2.2:5000` làm fallback an toàn)*.

#### 5.5. Cài đặt và chạy App trên Android Emulator
```powershell
# Xem ID thiết bị:
flutter devices

# Chạy app lên máy ảo:
flutter run -d emulator-5554
# Hoặc chế độ release:
flutter run -d emulator-5554 --release
```

#### 5.6. Chạy App Mobile trên Web Server (Tùy chọn không cần máy ảo)
Nếu không có Android Studio hoặc máy yếu không đủ RAM chạy máy ảo, có thể chạy app ngay trên trình duyệt web:
```powershell
flutter run -d web-server --web-port 3002 --web-hostname 0.0.0.0
# Truy cập: http://localhost:3002
```

---

### BƯỚC 6: KHỞI CHẠY PROTOTYPE DI ĐỘNG ĐỘC LẬP (`driver-prototype.html`)

Hệ thống cung cấp một bản Prototype hoàn chỉnh trong **MỘT file duy nhất** tại:
`D:\Job\VuVanDat\driver-prototype.html`

- **Đặc điểm**:
  - Không cần cài đặt bất kỳ server hay thư viện nào.
  - Chạy mượt mà trên mọi trình duyệt web (Google Chrome, Microsoft Edge, Safari).
  - Tích hợp đầy đủ:
    1. Header thông tin chuyến & Chip chuyển đổi ngoại tuyến (Offline Queue).
    2. Tab Chuyến (Hành trình, checklist xe 5 bước, điểm dừng, gọi thủ kho).
    3. Tab Buồng lái (Tốc độ số lớn, vòng đếm giờ HOS 4h, nhiệt độ thùng lạnh -18°C, áp suất 6 lốp, SOS chống bấm nhầm).
    4. Tab Ký nhận ePOD (Canvas cảm ứng, nút xóa ký lại, 3 trạng thái giao hàng, OTP dự phòng).
    5. Tab Ví xe (GPLX FC, Đăng kiểm, Bảo hiểm TNDS, Form đổ dầu Diesel, Trạm BOT).
    6. Màn đề nghị chuyến đếm ngược 15s kiểu Grab.
    7. Dẫn đường Turn-by-Turn 2 chặng bằng bản đồ SVG thuần xoay góc `heading-up` bám xe.
- **Cách mở**:
  ```powershell
  Start-Process "chrome.exe" "D:\Job\VuVanDat\driver-prototype.html"
  # Hoặc mở bằng Edge:
  Start-Process "msedge.exe" "D:\Job\VuVanDat\driver-prototype.html"
  ```

---

## 4. BỘ KIỂM ĐỊNH CHẤT LƯỢNG TỰ ĐỘNG (QUALITY GATES)

Agent có thể chạy toàn bộ 11 bước kiểm tra chất lượng chỉ bằng **MỘT lệnh duy nhất**:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify-all.ps1
```

Kịch bản `verify-all.ps1` sẽ tự động thực hiện:
1. `[1/11]` Build .NET 8 Backend Solution
2. `[2/11]` Chạy 58 Backend Unit & Integration Tests
3. `[3/11]` Quét quy tắc Enterprise B2B Linter (0 Emoji, 0 Hardcoded Colors)
4. `[4/11]` Typecheck TypeScript Web Portals
5. `[5/11]` Chạy 28 Vitest Web Unit Tests
6. `[6/11]` Build production bundle cho Web Admin & Web Shipper
7. `[7/11]` Flutter Analyze & 10 Flutter Widget Tests
8. `[8/11]` Xác thực dữ liệu Seed Phase 1
9. `[9/11]` Xác thực dữ liệu Seed Phase 2
10. `[10/11]` Xác thực dữ liệu Seed Phase 3
11. `[11/11]` Benchmark tải 1,000 xe gửi telematics đồng thời

---

## 5. CẨM NANG XỬ LÝ SỰ CỐ THƯỜNG GẶP (TROUBLESHOOTING)

| Hiện tượng / Mã lỗi | Nguyên nhân | Biện pháp xử lý của Agent |
| :--- | :--- | :--- |
| `Cannot connect to PostgreSQL (port 5432)` | Dịch vụ Postgres chưa bật hoặc Docker daemon chưa khởi động | Chạy `Start-Service postgresql-x64-17` trên Windows hoặc khởi động Docker Desktop. |
| `relation "vehicles" does not exist` | PowerShell tự xóa dấu ngoặc kép phân biệt hoa thường của PostgreSQL | Dùng cú pháp escape `\"Vehicles\"` trong câu lệnh SQL hoặc chạy qua file `.sql`. |
| `IllegalArgumentException: this and base files have different roots` | Kotlin incremental compiler lỗi đường dẫn xuyên ổ đĩa Windows | Thêm `kotlin.incremental=false` vào `mobile/android/gradle.properties`, sau đó chạy `flutter clean` & `flutter pub get`. |
| `SocketException: Connection refused (OS Error: Connection refused, errno = 111)` trên Emulator | Máy ảo Android không kết nối được vào `localhost:5000` của máy tính | Chạy `adb reverse tcp:5000 tcp:5000` hoặc dùng địa chỉ IP máy ảo mặc định `http://10.0.2.2:5000`. |
| `Android SDK licenses not accepted` | Chưa chấp thuận điều khoản bản quyền Android SDK | Chạy lệnh `flutter doctor --android-licenses` và ấn `y` cho tất cả các điều khoản. |
| `Port 5000 or 3000 already in use` | Tiến trình cũ chưa giải phóng cổng | Dùng lệnh `Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force` để giải phóng. |

---
*VDBus Logistics Platform Engineering Team - Bản quyền tài liệu phục vụ Đồ Án Tốt Nghiệp và Phát triển Hệ thống Enterprise B2B SaaS.*
