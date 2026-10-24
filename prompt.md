# 1. VAI TRÒ VÀ MỤC TIÊU

Bạn là Principal Engineer kiêm Product Designer, chuyên về TMS (Transport Management System) B2B SaaS đa thuê bao. Hãy xây dựng LẠI TỪ ĐẦU nền tảng "VDBus Logistics Platform" trong một thư mục dự án mới. Không sao chép code cũ; chỉ dùng đặc tả này.

Mục tiêu: sản phẩm sẵn sàng thương mại cho doanh nghiệp vận tải hàng hóa đường bộ tại Việt Nam, gồm 4 bề mặt:
  A. Backend API (.NET, Clean Architecture)
  B. Web Admin (React + TypeScript)
  C. App tài xế (Flutter)
  D. Cổng tra cứu công khai cho chủ hàng (Shipper Portal)

Tiêu chí thành công: chạy được end-to-end bằng một lệnh docker compose, có test tự động, dữ liệu mô phỏng được gắn nhãn rõ, giao diện nhất quán chuẩn doanh nghiệp.

# 2. NGUYÊN TẮC LÀM VIỆC (BẮT BUỘC)

1. Khảo sát và lập kế hoạch trước, CHỜ tôi xác nhận rồi mới viết code của mỗi giai đoạn.
2. Làm theo vertical slice nhỏ, mỗi slice chạy được và có test. Commit nhỏ theo Conventional Commits.
3. Sau mỗi slice chạy: dotnet build, dotnet test, npm run lint, npm run typecheck, npm run test, npm run build, flutter analyze, flutter test (lệnh nào áp dụng được). Báo cáo kết quả THỰC TẾ, không suy đoán.
4. Trung thực về dữ liệu: mọi nguồn giả lập (cảm biến, VETC, GPS mô phỏng) nằm sau interface, có implementation Mock và Real tách biệt, bật bằng cấu hình. Production mặc định không dùng mock. UI hiển thị nhãn "Dữ liệu mô phỏng" khi nguồn là mock.
5. Không bịa số liệu hiệu quả (%, km tiết kiệm, điểm số). Mọi con số hiển thị phải được tính từ dữ liệu. Dữ liệu seed phải sinh bằng script, có thể xóa.
6. Không dùng ngôn ngữ tuyệt đối trong UI hoặc tài liệu ("100% đạt chuẩn", "loại bỏ triệt để"). Dùng "đạt ngưỡng cấu hình", "cảnh báo vượt ngưỡng", kèm điều kiện.
7. Quy định pháp lý (tải trọng, giờ lái xe, cấm giờ nội đô, mức phạt) là DỮ LIỆU CẤU HÌNH do admin chỉnh được, có lịch sử thay đổi và ghi chú nguồn. Không hardcode. Không tự khẳng định căn cứ pháp lý; ghi "cần chuyên gia pháp lý xác nhận".
8. Bảo mật mặc định: không commit secret, validate đầu vào, không log dữ liệu cá nhân.
9. Gặp điểm mơ hồ có đánh đổi lớn: nêu 2 đến 3 phương án kèm khuyến nghị rồi hỏi tôi. Việc nhỏ thì tự quyết và ghi giả định vào docs/ASSUMPTIONS.md.
10. Chỉ làm đúng phạm vi giai đoạn hiện tại. Việc ngoài phạm vi ghi vào docs/BACKLOG.md.

# 3. KIẾN TRÚC VÀ CÔNG NGHỆ

Monorepo:
  /backend       .NET (bản LTS mới nhất ổn định), Clean Architecture: Domain, Application, Infrastructure, Api
  /web           React + TypeScript + Vite (Web Admin và Shipper Portal là hai app trong cùng workspace, dùng chung thư viện design system)
  /mobile        Flutter (Android và iOS)
  /packages/design-system   token và component dùng chung cho web
  /infra         docker-compose, Dockerfile, script seed, cấu hình môi trường
  /docs          kiến trúc (ADR), ASSUMPTIONS, BACKLOG, hướng dẫn vận hành

Hạ tầng: PostgreSQL (có PostGIS), Redis (cache, SignalR backplane), TimescaleDB (hoặc extension tương đương) cho dữ liệu GPS/IoT chuỗi thời gian, MQTT broker cho thiết bị, job nền (Hangfire hoặc Quartz).
Giao tiếp: REST có versioning /api/v1, OpenAPI đầy đủ; SignalR cho realtime; webhook cho tích hợp ngoài.
Đa thuê bao: shared database, mọi bảng nghiệp vụ có TenantId, global query filter theo tenant từ claim JWT, thêm Row-Level Security nếu khả thi. Có integration test chứng minh tenant A không đọc, sửa, xóa được dữ liệu tenant B.
Xác thực: OIDC/JWT ngắn hạn, refresh token xoay vòng, RBAC theo vai trò, MFA cho admin, rate limiting, audit log bất biến.
Quan sát: OpenTelemetry (trace, metric, log), health check sâu (DB, Redis, broker, SignalR).

# 4. NGUYÊN TẮC GIAO DIỆN (ENTERPRISE B2B SAAS)

Áp dụng cho Web Admin và Shipper Portal; app Flutter theo cùng token màu và chữ.

4.1 Phong cách
- Phẳng, tiết chế, ưu tiên dữ liệu và tốc độ thao tác. Cảm giác như Linear, Stripe Dashboard, Atlassian: nghiêm túc, đáng tin, mật độ thông tin cao nhưng dễ đọc.
- Không gradient trang trí, không đổ bóng nặng, không hiệu ứng động thừa, không minh họa trang trí, không ảnh nền.
- Bo góc nhỏ: 2 đến 4 px cho input, button, card; không dùng bo tròn lớn hay dạng viên thuốc, trừ avatar.
- Viền mảnh 1 px màu trung tính để phân vùng; dùng khoảng trắng và đường kẻ thay vì khối màu.

4.2 Icon và ký hiệu (HẠN CHẾ)
- KHÔNG dùng emoji ở bất kỳ đâu trong giao diện, thông báo, log hiển thị.
- Mặc định dùng CHỮ thay icon: nhãn nút, tiêu đề cột, menu đều bằng văn bản rõ nghĩa.
- Chỉ cho phép icon trong các trường hợp bắt buộc về chức năng: điều hướng thu gọn (sidebar thu nhỏ), đóng/mở, sắp xếp cột, tìm kiếm, bộ lọc, trạng thái cảnh báo (tam giác, dấu chấm than), trạng thái kết nối. Tối đa một bộ icon thống nhất (Lucide hoặc Phosphor, cùng độ dày nét, một kích thước 16 px), màu theo văn bản, không tô màu riêng từng icon.
- Trạng thái dùng nhãn chữ có màu (badge dạng chữ, nền nhạt, viền mảnh) thay cho icon: Đang chạy, Chờ điều xe, Quá hạn, Cảnh báo, Nghiêm trọng.
- Mọi icon đứng một mình phải có tooltip và aria-label.

4.3 Màu sắc và chữ
- Dùng design token (CSS variables), không hardcode màu trong component.
- Bảng màu: nền trắng và xám rất nhạt; chữ xám đậm; MỘT màu nhấn chính (xanh dương đậm); màu ngữ nghĩa chỉ cho trạng thái: thành công, cảnh báo, lỗi, thông tin. Không dùng màu chỉ để truyền đạt ý nghĩa; luôn kèm nhãn chữ.
- Hỗ trợ giao diện sáng và tối bằng token; tương phản đạt WCAG AA.
- Một font sans-serif hệ thống hoặc Inter; thang cỡ chữ cố định (12, 13, 14, 16, 20, 24); số liệu dùng tabular-nums, căn phải.
- Khoảng cách theo lưới 4 px.

4.4 Bố cục và thành phần
- Khung chuẩn: sidebar trái (thu gọn được), thanh trên (tenant, tìm kiếm toàn cục, người dùng), vùng nội dung, breadcrumb, tiêu đề trang kèm nhóm hành động.
- Bảng dữ liệu là thành phần trung tâm: sắp xếp, lọc, ẩn/hiện cột, phân trang phía server, chọn nhiều dòng, thao tác hàng loạt, xuất CSV/Excel, trạng thái rỗng, trạng thái tải (skeleton), trạng thái lỗi có nút thử lại, mật độ chọn được (thoải mái/gọn).
- Form: nhãn phía trên ô nhập, thông báo lỗi ngay dưới trường, kiểm tra hợp lệ phía client và server, lưu nháp, cảnh báo khi rời trang chưa lưu.
- Thao tác nguy hiểm (xóa, hủy chuyến, đối soát) có hộp thoại xác nhận nêu rõ hậu quả; hoàn tác khi có thể.
- Thông báo: toast ngắn cho thành công, banner cho cảnh báo toàn trang, không dùng alert trình duyệt.
- Bàn điều phối: bố cục chia đôi (danh sách đơn bên trái, chi tiết và gợi ý xe bên phải), phím tắt cho thao tác lặp, bản đồ tách panel có thể thu gọn.
- Hiệu năng: bảng ảo hóa khi trên 200 dòng; bản đồ dùng clustering hoặc vector tiles khi nhiều xe; mục tiêu tương tác dưới 200 ms.
- Trợ năng: điều hướng bằng bàn phím đầy đủ, focus rõ, aria đúng, tôn trọng prefers-reduced-motion.
- Đa ngôn ngữ ngay từ đầu (vi mặc định, en), không viết chuỗi cứng trong component; định dạng ngày giờ theo múi giờ tenant (mặc định Asia/Ho_Chi_Minh), tiền tệ VND.
- Văn phong giao diện: ngắn gọn, trung tính, dùng thuật ngữ nghiệp vụ nhất quán; không dùng dấu chấm than và từ ngữ quảng cáo.

4.5 Design system
- Xây trước thư viện component trong /packages/design-system (Button, Input, Select, DataTable, Badge, Tabs, Modal, Drawer, Toast, Banner, FormField, EmptyState, Skeleton, PageHeader, Map panel) và tài liệu hóa bằng Storybook. Mọi màn hình chỉ dùng component này.
- Cấm style inline ngoài token. Có lint rule chặn màu hardcode và emoji trong JSX/dart (kiểm tra bằng script trong CI).

4.6 App tài xế (Flutter)
- Cùng token màu và chữ. Nút lớn (tối thiểu 48 dp), chữ lớn, tương phản cao, dùng được một tay và dưới ánh nắng.
- Khi xe đang chạy chỉ hiển thị thông tin tối thiểu; thao tác phức tạp bị khóa; ưu tiên giọng nói.
- Cùng quy tắc: không emoji, icon tối thiểu, trạng thái bằng chữ.

# 5. MÔ HÌNH NGHIỆP VỤ CỐT LÕI

Thực thể chính: Tenant, Subscription, User, Role, Customer (chủ hàng), Order, Shipment/Trip, Stop, Vehicle (loại xe, thông số trục, tải trọng, định mức nhiên liệu), Driver, Device (GPS, nhiệt độ, TPMS, cảm biến cửa, mức dầu), Geofence, Invoice, Payment, FuelRecord, TollTransaction, MaintenanceOrder, Document (đăng kiểm, bảo hiểm, phù hiệu, GPLX), Alert, AuditLog, RegulationRule (quy định cấu hình được).

Máy trạng thái đơn hàng: Nháp, Chờ điều xe, Đã gán, Tài xế đã nhận, Đang lấy hàng, Đang giao, Đã giao, Đã đối soát, Hủy. Mô tả rõ chuyển trạng thái hợp lệ, người được phép thực hiện, và xử lý ngoại lệ (xe hỏng, tài xế từ chối, đổi xe giữa đường, giao một phần). Có test cho mọi chuyển trạng thái.

# 6. CHỨC NĂNG BACKEND

6.1 Quản trị cốt lõi: Orders, Vehicles, Drivers, Customers, Tenants/Subscription, Maintenance, Documents (nhắc hạn đăng kiểm, bảo hiểm, phù hiệu, GPLX).
6.2 Điều phối: gợi ý xe cho đơn dựa trên khoảng cách, tải trọng, loại xe, khả năng ghép chuyến chiều về (điểm khớp có công thức minh bạch, trả về lý do); tạo, gán, hủy, đổi chuyến; đẩy lệnh xuống app tài xế.
6.3 Định tuyến: tối ưu nhiều điểm dừng có khung giờ (VRPTW) bằng OR-Tools hoặc VROOM, dùng ma trận khoảng cách đường bộ thực qua IRoutingProvider (OSRM/GraphHopper), có ràng buộc tải trọng, nhiều kho, cấm giờ nội đô, giới hạn giờ lái. Trả về lộ trình gốc và tối ưu, km, thời gian, nhiên liệu ước tính kèm giả định.
6.4 Quy định cấm giờ nội đô: bảng RegulationRule theo địa phương, tuyến, loại xe, khung giờ; API kiểm tra lộ trình, trả về cảnh báo và gợi ý đường thay thế.
6.5 Xếp hàng và tải trọng trục: sắp xếp 3D theo ràng buộc xếp chồng, dễ vỡ, thứ tự giao (LIFO), kích thước pallet, tải sàn; tính trọng tâm và tải trọng từng trục theo thông số xe; trả về mức sử dụng, cảnh báo, biên sai số. Không khẳng định "đạt chuẩn tuyệt đối".
6.6 An toàn lái xe: điểm an toàn (công thức công khai, chuẩn hóa theo loại đường và tải), bảng xếp hạng, ghi nhận sự kiện phanh gấp, tăng tốc đột ngột, quá tốc kèm tọa độ.
6.7 Giờ lái (HOS): theo dõi lái liên tục và lũy kế ngày theo ngưỡng cấu hình; cảnh báo sớm theo ngưỡng cấu hình; gợi ý điểm dừng nghỉ.
6.8 Neo xe (Detention): ghi nhận vào/ra geofence, miễn phí và đơn giá cấu hình theo hợp đồng khách hàng, tính phí, sinh chứng từ.
6.9 Telematics: thu nhận GPS và IoT qua MQTT, lưu chuỗi thời gian, vị trí mới nhất trong Redis, đẩy SignalR; chuỗi lạnh (nhiệt độ, độ ẩm, máy nén, cửa, lịch sử), TPMS (áp suất, nhiệt độ từng vị trí lốp theo cấu hình trục), cảnh báo ngưỡng theo tenant có chống báo động giả và leo thang. Quản lý thiết bị: đăng ký, gán xe, pin, mất kết nối, lần cuối thấy.
6.10 Thu phí tự động: IVetcProvider (Mock và Real); lưu giao dịch trạm; đối soát với chuyến; đánh dấu rõ nguồn mô phỏng.
6.11 Tài chính: hóa đơn cước, VietQR kèm webhook đối soát ngân hàng, công nợ và hạn mức, P&L theo xe, tuyến, khách hàng (doanh thu, nhiên liệu, phí cầu đường, lương, bảo dưỡng), IEInvoiceProvider cho hóa đơn điện tử. Giao dịch bất biến sau khi chốt kỳ; thao tác tài chính có idempotency key.
6.12 Nhiên liệu: phiếu đổ dầu, tính tiêu hao thực tế, phát hiện bất thường (so định mức, GPS, cảm biến dầu) chỉ ở mức cảnh báo kèm độ tin cậy, không kết luận gian lận.
6.13 ePOD: nhận chữ ký, ảnh, tọa độ, thời gian; lưu kèm hash; chống trùng; cập nhật trạng thái đơn.
6.14 Cổng công khai: token ngẫu nhiên (>= 128 bit), có hạn, thu hồi được, rate limit; trả dữ liệu rút gọn (che bớt biển số, tên tài xế rút gọn, làm tròn vị trí gần điểm giao).
6.15 Trợ lý phân tích (AI Copilot): hỏi đáp dữ liệu bằng tiếng Việt trên dữ liệu của chính tenant, chỉ đọc, có trích nguồn bảng số liệu, không tự thực hiện thao tác ghi.
6.16 Nền tảng: audit log bất biến, RBAC (Admin, Điều phối viên, Kế toán, Quản lý đội xe, Tài xế, Chủ hàng), metering sử dụng (số xe, đơn, sự kiện IoT, dung lượng), job nền, thông báo (push, email, Zalo/SMS qua interface), nhập hàng loạt CSV/Excel.

# 7. CHỨC NĂNG WEB ADMIN

Màn hình: Tổng quan vận hành, Điều phối, Bản đồ đội xe, Đơn hàng, Chuyến, Đội xe, Tài xế, Khách hàng và công nợ, Telematics (chuỗi lạnh, TPMS, xếp hàng và tải trục), An toàn và giờ lái, Neo xe, Thu phí, Nhiên liệu, Bảo dưỡng, Tài chính và P&L, Báo cáo (tùy biến, xuất, lên lịch), Quy định và cấu hình, Thiết bị IoT, Người dùng và phân quyền, Nhật ký kiểm toán, Thuê bao và hạn mức, Trợ lý phân tích.
Mỗi màn hình phải có: bảng hoặc biểu đồ chuẩn, lọc, xuất dữ liệu, trạng thái rỗng, tải, lỗi, quyền truy cập theo vai trò, và nhãn "Dữ liệu mô phỏng" khi áp dụng.
Biểu đồ: đường và cột đơn giản, trục và đơn vị rõ, không 3D, không hiệu ứng, bảng màu theo token.

# 8. CHỨC NĂNG APP TÀI XẾ

Đăng nhập an toàn, danh sách chuyến, chi tiết chuyến, điều hướng bản đồ với turn-by-turn thật, ePOD (ký, ảnh, hash), điểm an toàn và giờ lái, ví giấy tờ số (kèm cảnh báo hết hạn), phiếu đổ dầu, thông tin thu phí, giám sát chuỗi lạnh và TPMS khi xe có thiết bị, nút SOS gửi tọa độ, thông báo đẩy.
Yêu cầu kỹ thuật: offline-first (hàng đợi đồng bộ cục bộ, idempotency, xử lý xung đột), GPS nền (foreground service, tối ưu pin, lọc nhiễu), chống giả mạo vị trí và giờ thiết bị, bắt buộc cập nhật theo phiên bản tối thiểu. Công cụ mô phỏng GPS chỉ có trong flavor debug/demo, không có trong bản production.
Quy tắc đứng yên: khi tốc độ dưới ngưỡng, không cộng dồn km (lọc nhiễu GPS theo độ chính xác và khoảng cách tối thiểu), có unit test.

# 9. CỔNG CHỦ HÀNG

Tra cứu bằng liên kết có token: bản đồ vị trí (đã làm tròn), trạng thái, ETA, nhiệt độ (nếu có thiết bị), thông tin tài xế rút gọn, ePOD sau khi giao, chứng thư nhiệt độ có ký số. Không cần đăng nhập, không lộ dữ liệu nội bộ. Thông báo theo mốc và đánh giá sau giao hàng.

# 10. YÊU CẦU PHI CHỨC NĂNG

- Hiệu năng: API p95 dưới 300 ms cho truy vấn thường; độ trễ vị trí p95 dưới 5 giây; kiểm thử tải mô phỏng 1.000 xe gửi điểm mỗi 5 đến 10 giây và báo cáo kết quả thực đo.
- Sẵn sàng: sao lưu và khôi phục có diễn tập, nêu RPO/RTO đo được.
- Bảo mật: OWASP Top 10, quét phụ thuộc, mã hóa dữ liệu nhạy cảm (GPLX, ảnh, vị trí), nhật ký truy cập dữ liệu cá nhân, cơ chế đồng ý và xóa dữ liệu của tài xế theo quy định bảo vệ dữ liệu cá nhân hiện hành (cần chuyên gia pháp lý xác nhận).
- Kiểm thử: unit test cho mọi thuật toán (VRPTW, xếp hàng, neo xe, HOS, cấm giờ, điểm an toàn, khớp chuyến) gồm ca biên (đúng ngưỡng, vượt 1 phút, qua nửa đêm, múi giờ, dữ liệu rỗng); integration test API với PostgreSQL thật (Testcontainers); E2E bằng Playwright và Flutter integration_test; độ phủ lớp Domain và Application tối thiểu 70%.
- CI/CD: GitHub Actions chạy build, test, lint, quét lỗ hổng, kiểm tra quy tắc giao diện (không emoji, không màu hardcode); Docker cho mọi dịch vụ; môi trường dev, staging, prod tách cấu hình.

# 11. TIÊU CHÍ NGHIỆM THU CHUNG

- docker compose up khởi chạy toàn bộ hệ thống với dữ liệu mẫu có nhãn mô phỏng.
- Toàn bộ test và lint xanh trong CI.
- Không còn emoji; icon chỉ ở các vị trí cho phép; mọi màn hình dùng component từ design system và token.
- Không có endpoint truy cập dữ liệu chéo tenant; mọi endpoint có kiểm tra quyền.
- Không có tuyên bố tuyệt đối trong UI và tài liệu; mọi số liệu hiển thị truy được nguồn.
- Có tài liệu: kiến trúc (ADR), hướng dẫn chạy, API (OpenAPI), danh sách giả định, danh sách điều khoản cần pháp lý xác nhận.

# 12. THỨ TỰ THỰC HIỆN

Giai đoạn 0: khung dự án, CI, Docker, design system và Storybook, khung đa thuê bao, xác thực và RBAC, audit log.
Giai đoạn 1: đơn hàng, đội xe, tài xế, khách hàng, điều phối thủ công, ePOD, app tài xế cơ bản, cổng chủ hàng, tài chính cơ bản.
Giai đoạn 2: telematics và pipeline IoT, bản đồ realtime, chuỗi lạnh, TPMS, HOS, neo xe, thu phí (provider), định tuyến thực và VRPTW, xếp hàng và tải trục.
Giai đoạn 3: offline-first hoàn chỉnh, báo cáo, P&L nâng cao, VietQR webhook, hóa đơn điện tử, metering và thuê bao, trợ lý phân tích, ETA học máy, kiểm thử tải và bảo mật, tài liệu vận hành.

Với MỖI giai đoạn: (A) khảo sát và tóm tắt, (B) kế hoạch task kèm độ phức tạp S/M/L và phụ thuộc, DỪNG chờ tôi duyệt, (C) thực hiện từng task kèm test và commit, (D) báo cáo gồm: đã làm, kết quả chạy lệnh thực tế, chưa làm và lý do, giả định, rủi ro còn lại, cách chạy lại và kiểm chứng.

Bắt đầu bằng Giai đoạn 0, bước A và B.