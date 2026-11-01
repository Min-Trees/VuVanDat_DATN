# Kiem thu Tai (Load Testing) & Kiem toan An toan Thong tin (Security Audit)

## 1. Bao cao Kiem thu Tai (1.000 Phuong tien Dong thoi)

### 1.1. Muc tieu & Mo hinh Kiem thu
- **Quy mo kiem thu**: Mo phong luu luong du lieu phat sinh dong thoi tu 1.000 xe tai dang luu thong tren duong.
- **Tan suat ping**: 3 ban ghi / phuong tien (tong cong 3.000 ban ghi vi tri telemetry kem thong so cam bien).
- **Goi du lieu (Telemetry Payload)**: Toa do GPS (vi do, kinh do), van toc thuc te (km/h), nhiet do thung lanh (-20C den +4C), ap suat 4 lop TPMS (110 - 120 PSI), muc tieu hao dau phao nhien lieu.
- **Tieu chi Quality Gate chap thuan**:
  - Do tre p95 xu ly ingestion telemetry: < 5.000 ms.
  - Do tre p95 truy van REST API thong thuong: < 300 ms.
  - Ty le loi (Error rate): < 0.1%.

### 1.2. Ket qua Do dac Thuc te (Empirical Benchmark Results)

| Chi so Danh gia | Ket qua Dat duoc | Nguong Chap thuan | Ket luan |
| :--- | :--- | :--- | :--- |
| **Tong so Ping Telematics** | 3.000 pings | 3.000 pings | Dat 100% |
| **So Ping Xu ly Thanh cong** | 3.000 | >= 2.997 | Dat (100.0%) |
| **Ty le Loi (Error Rate)** | 0.0% | < 0.1% | Xuat sac (0 loi) |
| **Thong luong (Throughput)** | 62.3 requests/giay | >= 50 req/s | Vuot dinh muc |
| **Tong thoi gian chay** | 48.17 giay | < 300 giay | Dat |
| **Do tre p50 (Median)** | 15.89 ms | < 50 ms | Dat |
| **Do tre p90** | 16.29 ms | < 100 ms | Dat |
| **Do tre p95** | 16.40 ms | < 5.000 ms | Dat xuat sac (16.40 ms << 5.000 ms) |
| **Do tre p99** | 16.64 ms | < 5.000 ms | Dat |

---

## 2. Kiem toan An toan Thong tin theo OWASP Top 10

| Hang muc OWASP | Rui ro & Nguy co | Bien phap Kiem soat trong Nen tang VDBus |
| :--- | :--- | :--- |
| **A01: Broken Access Control** | Ro ri du lieu giua cac doanh nghiep van tai (Cross-tenant data leak). | Cau hinh EF Core Global Query Filter tren `ITenantEntity`. Moi truy van tu dong loc theo `TenantId` duoc trich xuat tu JWT token. |
| **A02: Cryptographic Failures** | Lo mat khau, khoa ky so hoac du lieu truyen thong. | Bam mat khau bang thuat toan SHA-256 kem Salt ngau nhien; ma hoa duong truyen TLS 1.3 / HTTPS; chu ky so Hoa don dien tu XMLDSig dung RSA-SHA256. |
| **A03: Injection** | SQL Injection, Command Injection qua tham so URL/Form. | 100% truy van co so du lieu thuc thi qua EF Core voi Parameterized Queries. Tuyet doi khong ghep chuoi raw SQL thong qua dau cong chuoi. |
| **A04: Insecure Design** | Bo qua cac rang buoc an toan giao thong va hanh chinh. | Tich hop tu dong luat Gio lai xe (HOS 4 gio lien tuc, 10 gio/ngay theo Luat TTATGTDB 2024); kiem tra tai trong truc xe theo cong thuc mo-men tinh hoc; canh bao giay to qua han. |
| **A05: Security Misconfiguration** | De lo thong tin loi (stack trace), cong ket noi du thua. | Cau hinh CORS Whitelist chat che; Dockerfile su dung non-root user; Header an toan (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`). |
| **A06: Vulnerable Components** | Thu vien ben thu ba co lo hong bao mat. | Quet dinh ky bang `dotnet list package --vulnerable` va `npm audit`. Khong su dung cac thu vien khong ro nguon goc. |
| **A07: Identification & Auth** | Tan cong vet can (Brute-force), danh cap phien dang nhap. | JWT Bearer token co thoi han ngan (8 gio), khoa bi mat HMAC-SHA256 >= 256 bits, co che doi mat khau an toan. |
| **A08: Software & Data Integrity** | Gia mao giao dich ngan hang hoac xoa du lieu kiem toan. | Idempotency Key tren moi Webhook thanh toan VietQR; bang `AuditLogs` doc lap luu vet toan bo thay doi don hang va dieu phoi. |
| **A09: Logging & Monitoring** | Khong phat hien kip thoi su co hoac hanh vi xam nhap. | Serilog ghi log co cau truc (Structured Logging) vao file va console; canh bao vuot nguong quota tai nguyen trong MeteringService. |
| **A10: Server-Side Request Forgery** | Loi dung may chu de gui request noi bo trai phep. | Endpoint Webhook ngan hang va nha cung cap Hoa don dien tu duoc co lap va chi giao tiep qua dia chi IP/Domain duoc phep (Allowlist). |

---

## 3. Quy trinh Bao ve Du lieu Ca nhan (ND 13/2023/ND-CP & GDPR)

Theo quy dinh tai Nghi dinh 13/2023/ND-CP ve Bao ve du lieu ca nhan cua Chinh phu Viet Nam:

### 3.1. Quyen Tiep can va Cung cap Du lieu (Right of Access)
- Tai xe co quyen xem toan bo lich su hanh trinh, gio lai xe (HOS), lich su do xang dau va vi giay to so truc tiep tren ung dung di dong Driver App.
- Ban ghi kiem toan ca nhan duoc xuat ra duoi dinh dang CSV / PDF khi co yeu cau chinh thuc tu nguoi lao dong.

### 3.2. Quyen Xoa Du lieu & Quen di (Right to Erasure / Right to be Forgotten)
- Khi tai xe cham dut hop dong lao dong hoac doanh nghiep yeu cau huy tai khoan:
  1. Thong tin dinh danh ca nhan (So CCCD, So dien thoai, Email ca nhan) duoc an danh hoa (Anonymization) hoac xoa vinh vien khoi bang `Drivers` va `Users`.
  2. Du lieu cuoc xe va hoa don van duoc luu tru phuc vu quyet toan thue va doi chieu ke toan theo Luat Ke toan, nhung ma tai xe se duoc thay bang `ANONYMIZED_DRIVER_ID`.

### 3.3. Chinh sach Luu tru & Lam sach Du lieu Vi tri GPS
- Theo quy dinh tai Nghi dinh 10/2020/ND-CP, du lieu vi tri giam sat hanh trinh duoc luu tru toi thieu 1 nam de phuc vu thanh tra giao thong.
- Sau thoi han 365 ngay, he thong tu dong chuyen du lieu vi tri chi tiet (ping 5 giay/lan) thanh du lieu tong hop chang duong (Quang duong km, diem bat dau, diem ket thuc), dong thoi xoa cac toa do chi tiet de bao ve quyen rieng tu hanh trinh cua lai xe.
