# VDBus Logistics Platform - Product Backlog & Phase Delivery Status

Tài liệu này ghi nhận hiện trạng bàn giao các giai đoạn phát triển và danh mục kế hoạch mở rộng thương mại tương lai.

---

## 1. Hiện trạng Bàn giao các Giai đoạn (Delivery Status)

### Giai đoạn 0: Khung Kiến trúc, Đa thuê bao & Design System
- **Trạng thái**: HOÀN TẤT 100% (Bàn giao tại `phase-0-report.md`).
- **Phạm vi**: Khởi tạo Monorepo, .NET 8 Clean Architecture, Thư viện Design System B2B SaaS token (`var(--vdbus-*)`), Đa thuê bao EF Core Global Query Filter, Xác thực JWT & Phân quyền RBAC, Nhật ký kiểm toán bất biến `AuditLogs`.

### Giai đoạn 1: Quản trị Vận tải Cốt lõi & Điều phối Cơ bản
- **Trạng thái**: HOÀN TẤT 100% (Bàn giao tại `phase-1-report.md`).
- **Phạm vi**: Máy trạng thái đơn hàng (Draft -> InTransit -> Delivered -> Reconciled), CRUD Đội xe, Tài xế, Khách hàng, Bàn điều phối chia đôi kèm gợi ý xe minh bạch, Mobile Driver App ePOD ký số SHA-256, Cổng tra cứu chủ hàng (Shipper Portal) bảo mật bằng Token >= 128 bit, Hóa đơn và đối soát cước cơ bản.

### Giai đoạn 2: Telematics & Pipeline IoT Realtime, Tối ưu Hóa
- **Trạng thái**: HOÀN TẤT 100% (Bàn giao tại `phase-2-report.md`).
- **Phạm vi**: Pipeline thu nhận MQTT Telematics, Bản đồ giám sát SignalR realtime, Giám sát nhiệt độ chuỗi lạnh & Áp suất lốp TPMS, Luật giờ lái HOS 4h liên tục, Neo xe (Geofence Detention), Tích hợp đối soát BOT VETC tự động, Định tuyến tối ưu VRPTW và Quy định cấm giờ nội đô, Phân bổ tải trọng trục xe theo công thức mô-men tĩnh học.

### Giai đoạn 3: Offline-First Hoàn chỉnh, Báo cáo & Tài chính Nâng cao
- **Trạng thái**: HOÀN TẤT 100% (Bàn giao tại `phase-3-report.md`).
- **Phạm vi**: 
  - Hàng đợi ngoại tuyến `SyncQueueService` với mã khóa chống lặp `idempotencyKey` và bộ lọc GPS khi xe đứng yên.
  - Ví hồ sơ giấy tờ số và theo dõi hạn đăng kiểm phương tiện.
  - Thuật toán định mức nhiên liệu và phát hiện bất thường phao dầu IoT.
  - Động cơ tính toán P&L đa chiều (Xe, Chuyến, Khách hàng, Tuyến đường).
  - Cổng thanh toán VietQR động NAPAS 247 và Webhook ngân hàng tự động đối soát.
  - Nhà cung cấp hóa đơn điện tử VAT CQT ký số XMLDSig.
  - Quản trị hạn mức thuê bao doanh nghiệp (Tenant Metering Quotas).
  - Trợ lý AI Copilot phân tích vận hành thời gian thực có trích dẫn dữ liệu.
  - Hạ tầng Docker Compose end-to-end cho 6 dịch vụ.
  - Kiểm thử tải 1.000 xe đồng thời (p95 = 16.44 ms, 0% lỗi).
  - Sổ tay vận hành `RUNBOOK.md` (RPO < 1h, RTO < 15m).

---

## 2. Kế hoạch Mở rộng Tương lai (Post-Commercial Backlog)

Các hạng mục nghiên cứu và mở rộng giá trị gia tăng sau khi hệ thống đi vào vận hành sản xuất ổn định:

1. **Vận tải Đa phương thức (Intermodal Logistics)**:
   - Kết nối dữ liệu theo dõi container đường sắt (Đường sắt Bắc - Nam) và cảng biển (Tân Cảng Sài Gòn, Cảng Hải Phòng, Cảng Tiên Sa).
   - Tối ưu hóa việc chuyển giao phương thức vận tải giữa xe tải sơ-mi rơ-moóc và tàu container.

2. **Dự báo Nhu cầu & Tự động Định giá Cước Động (Dynamic Freight Pricing)**:
   - Mô hình học máy dự báo xu hướng nhu cầu vận tải theo mùa vụ nông sản và chu kỳ tiêu dùng.
   - Gợi ý bảng giá cước biến thiên theo giá dầu diesel thế giới và biến động phụ phí cao điểm.

3. **Tích hợp Trực tiếp Thiết bị Giám sát Hành trình theo QCVN 31:2014/BGTVT**:
   - Mở rộng giao thức kết nối trực tiếp thiết bị định vị hợp chuẩn truyền dữ liệu về Cục Đường bộ Việt Nam.

4. **Tự động Hiệu chỉnh Cảm biến Phao dầu (Auto-calibration)**:
   - Thuật toán tự học biên độ nghiêng của thùng xe khi lên/xuống dốc để loại bỏ biến động ảo của mức xăng dầu trong bình.
