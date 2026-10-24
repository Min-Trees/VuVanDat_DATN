# VDBus Logistics Platform - Product Backlog

Tài liệu này ghi nhận các hạng mục công việc được phân bổ theo từng giai đoạn phát triển nhằm đảm bảo kiểm soát chặt chẽ phạm vi (scope) và chất lượng (quality gate).

---

## Giai đoạn 1: Quản trị Vận tải Cốt lõi & Điều phối Cơ bản
- **Đơn hàng & Chuyến xe**:
  - Máy trạng thái đơn hàng (State machine): Nháp, Chờ điều xe, Đã gán, Tài xế đã nhận, Đang lấy hàng, Đang giao, Đã giao, Đã đối soát, Hủy.
  - CRUD Quản lý xe (thông số trục, tải trọng, định mức nhiên liệu), tài xế, khách hàng.
  - Bàn điều phối chia đôi: Danh sách đơn chờ + Chi tiết & Gợi ý xe khả dụng.
  - Gợi ý xe dựa trên công thức minh bạch: khoảng cách, loại thùng, tải trọng, khả năng ghép chuyến chiều về kèm lý do chi tiết.
- **ePOD & App Tài xế cơ bản**:
  - App tài xế nhận chuyến, cập nhật trạng thái lấy/giao hàng.
  - Chụp ảnh bằng chứng giao hàng, ký nhận điện tử, gắn hash SHA-256 kèm tọa độ và dấu thời gian.
- **Cổng Tra cứu Chủ hàng (Shipper Portal) cơ bản**:
  - Tra cứu trạng thái đơn và lộ trình rút gọn qua token ngẫu nhiên bảo mật (>= 128 bit).
  - Che mờ dữ liệu nhạy cảm (biển số rút gọn, tên tài xế rút gọn, làm tròn tọa độ gần điểm giao).
- **Tài chính cơ bản**:
  - Hóa đơn cước vận tải, đối soát chuyến xe, công nợ khách hàng.

---

## Giai đoạn 2: Telematics & Pipeline IoT Realtime, Tối ưu Hóa
- **Pipeline Thu nhận IoT**:
  - MQTT broker nhận dữ liệu GPS, TPMS (áp suất/nhiệt độ lốp), cảm biến nhiệt độ chuỗi lạnh, cảm biến mức dầu.
  - Lưu trữ dữ liệu chuỗi thời gian bằng TimescaleDB / Hypertable.
  - Đẩy tọa độ xe realtime lên bản đồ qua SignalR.
- **Giám sát An toàn & Giờ lái**:
  - Tính điểm an toàn lái xe theo thuật toán công khai (phanh gấp, tăng tốc đột ngột, quá tốc độ).
  - Theo dõi giờ lái xe liên tục (HOS) và giờ lái lũy kế ngày, cảnh báo đạt ngưỡng cấu hình.
- **Neo xe (Detention) & Tự động Tính phí**:
  - Phát hiện xe vào/ra geofence kho bãi.
  - Tính thời gian chờ thực tế so với định mức miễn phí trong hợp đồng khách hàng, tự động sinh chứng từ tính phí neo xe.
- **Định tuyến Nâng cao & Tối ưu Đa điểm dừng (VRPTW)**:
  - Tích hợp solver tối ưu (OR-Tools / VROOM) với ma trận khoảng cách đường bộ thực tế qua `IRoutingProvider` (OSRM/GraphHopper).
  - Kiểm tra vi phạm khung giờ cấm tải nội đô theo `RegulationRule`.
- **Xếp hàng 3D & Phân bổ Tải trọng Trục**:
  - Thuật toán xếp 3D (LIFO, dễ vỡ, tải sàn).
  - Tính toán trọng tâm và tải trọng phân bổ lên từng trục xe dựa trên thông số kỹ thuật xe; đưa ra cảnh báo nguy cơ vượt tải trục kèm biên sai số.

---

## Giai đoạn 3: Offline-First Hoàn chỉnh, Báo cáo & Tài chính Nâng cao
- **Offline-First App Tài xế**:
  - Hàng đợi đồng bộ dữ liệu cục bộ (Local Sync Queue) với tính năng idempotency và cơ chế giải quyết xung đột khi mất sóng.
  - GPS nền (Foreground Service) với thuật toán lọc nhiễu khi xe đứng yên (không cộng dồn km giả mạo).
- **Tài chính Nâng cao & Hóa đơn Điện tử**:
  - Tích hợp cổng VietQR động tự động sinh mã kèm webhook đối soát biến động số dư ngân hàng.
  - Tích hợp hóa đơn điện tử qua `IEInvoiceProvider`.
  - Báo cáo P&L đa chiều theo từng xe, từng chuyến, từng tuyến đường và từng khách hàng.
- **Trợ lý Phân tích AI Copilot**:
  - Hỏi đáp dữ liệu bằng tiếng Việt trên phạm vi dữ liệu của chính Tenant, chỉ đọc, trích nguồn bảng biểu minh bạch, không thực hiện thao tác ghi.
- **Bảo mật & Tải cao**:
  - Kiểm thử tải mô phỏng 1.000 xe gửi điểm mỗi 5 đến 10 giây với báo cáo độ trễ p95 thực tế.
  - Cơ chế đồng ý và xóa dữ liệu tài xế theo quy định bảo vệ dữ liệu cá nhân hiện hành (cần chuyên gia pháp lý xác nhận).
