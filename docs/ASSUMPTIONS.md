# VDBus Logistics Platform - Technical & Business Assumptions

Tài liệu này ghi nhận toàn bộ các giả định kỹ thuật và nghiệp vụ được áp dụng trong quá trình phát triển hệ thống.

---

## 1. Giả định về Quy định Pháp lý & Cấu hình Động
- **Khung giờ cấm tải nội đô (Hà Nội, TP.HCM, Đà Nẵng...)**:
  - *Giả định*: Các khung giờ cấm tải, tuyến đường cấm và trọng tải giới hạn có thể thay đổi theo quyết định của từng địa phương tại từng thời điểm.
  - *Cơ chế*: Không hardcode trong mã nguồn. Toàn bộ được cấu hình qua bảng `RegulationRule` do Admin quản lý, có lưu lịch sử thay đổi và trường `SourceReference` (ví dụ: Quyết định 24/2020/QĐ-UBND).
  - *Lưu ý pháp lý*: Mọi văn bản quy định và mức phạt hiển thị trên hệ thống đều ghi kèm chú thích "Cần chuyên gia pháp lý xác nhận trước khi áp dụng chính thức".
- **Quy định giờ lái xe (HOS - Hours of Service)**:
  - *Giả định*: Mặc định cấu hình cảnh báo theo quy định Luật Giao thông Đường bộ (lái xe liên tục không quá 4 giờ, tổng thời gian lái xe trong ngày không quá 10 giờ).
  - *Cơ chế*: Ngưỡng thời gian và biên cảnh báo sớm (ví dụ: cảnh báo trước 30 phút) được lưu trong cấu hình của từng Tenant, cho phép điều chỉnh theo hợp đồng lao động hoặc quy định đặc thù.

---

## 2. Giả định về Tích hợp & Dữ liệu Mô phỏng (Mock Data)
- **VETC / ePass (Thu phí không dừng)**:
  - *Giả định*: API thực tế của đơn vị thu phí cần tài khoản doanh nghiệp và kết nối kênh riêng VPN/Leased line.
  - *Cơ chế*: Môi trường phát triển và demo sử dụng `MockVetcProvider`. Mọi giao dịch sinh ra có trường `IsSimulated = true`, UI gắn nhãn "Dữ liệu mô phỏng".
- **Dữ liệu GPS & Cảm biến IoT (Telematics)**:
  - *Giả định*: Thiết bị gửi tọa độ, tốc độ, áp suất lốp (TPMS), nhiệt độ thùng lạnh qua giao thức MQTT/HTTP.
  - *Cơ chế*: Trình giả lập (Simulator) sinh dữ liệu bám theo các tuyến quốc lộ thực tế của Việt Nam (ví dụ QL1A, Cao tốc Bắc - Nam). Trong bản phát hành Production của App Tài xế, module giả lập GPS bị gỡ bỏ hoàn toàn.
- **Tính toán tiêu hao nhiên liệu & Vi phạm**:
  - *Giả định*: Lượng nhiên liệu tiêu hao chịu ảnh hưởng bởi địa hình, tải trọng thực tế, chất lượng đường và cách lái.
  - *Cơ chế*: Hệ thống không đưa ra kết luận gian lận tuyệt đối mà chỉ đưa ra "Cảnh báo vượt ngưỡng định mức" kèm tỷ lệ sai lệch và mức độ tin cậy được tính toán từ dữ liệu cảm biến đo mức dầu kết hợp GPS.

---

## 3. Giả định về Hạ tầng & Bảo mật
- **Múi giờ & Định dạng số liệu**:
  - *Giả định*: Múi giờ mặc định cho thị trường Việt Nam là `Asia/Ho_Chi_Minh` (UTC+7). Mọi mốc thời gian trong cơ sở dữ liệu đều lưu chuẩn UTC (`timestamptz`). Tiền tệ mặc định là VND (định dạng `tabular-nums` căn phải, phân cách hàng nghìn bằng dấu chấm hoặc theo locale cấu hình).
- **Cách ly Đa thuê bao**:
  - *Giả định*: 1 tổ chức doanh nghiệp vận tải tương ứng với 1 `Tenant`. Mỗi người dùng khi đăng nhập sẽ gắn với 1 `TenantId` duy nhất trong JWT Token. Trường hợp hỗ trợ người dùng đa công ty sẽ mở rộng ở giai đoạn sau.
