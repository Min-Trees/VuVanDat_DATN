# VDBus Logistics Platform - Operational Runbook & Disaster Recovery

## 1. Tong quan Kien truc & Danh muc Dich vu

He thong VDBus Logistics Platform bao gom 6 khoi dich vu chinh duoc dieu phoi qua Docker Compose va Kubernetes:

1. **vdbus-backend-api** (.NET 8 Web API): Cong giao tiep RESTful API, xu ly nghiep vu dieu phoi, tinh toan P&L, ky so hoa don VAT, quan ly han muc metering va WebSocket SignalR.
2. **vdbus-web-admin** (React 19 + Vite + Nginx): Ban dieu phoi tap trung (Dispatcher Console), giam sat doi xe, chuoi lanh, TPMS, tai trong truc, P&L da chieu va AI Copilot.
3. **vdbus-web-shipper** (React 19 + Vite + Nginx): Cong tra cuu hanh trinh va giam sat don hang danh cho chu hang (Shipper Tracking Portal).
4. **vdbus-postgres** (PostgreSQL 16 + PostGIS): Co so du lieu quan he da thue bao luu tru thong tin don hang, khach hang, phuong tien, hoa don va geofences.
5. **vdbus-redis** (Redis 7 Alpine): Bo nho dem in-memory luu tru phien dang nhap, vi tri telematics tuc thoi va hang doi xu ly.
6. **vdbus-mqtt** (Eclipse Mosquitto): Message Broker nhan ban tin GPS va cam bien tu thiet bi IoT tren xe voi giao thuc MQTT.

---

## 2. Quy trinh Trien khai San xuat (Production Deployment)

### 2.1. Yeu cau He thong Toi thieu
- CPU: 4 Cores (khuyen nghi 8 Cores cho 1.000 xe).
- RAM: 8 GB (khuyen nghi 16 GB).
- O dia: SSD NVMe 100 GB tro len.
- Docker Engine 24.0+ va Docker Compose v2.20+.

### 2.2. Khoi dong He thong
```bash
# Di chuyen vao thu muc ha tang
cd infra

# Sao chep bien moi truong
cp .env.example .env

# Khoi dong toan bo cac container chay nen
docker compose up -d --build

# Kiem tra trang thai healthcheck cua cac container
docker compose ps
```

---

## 3. Quy trinh Sao luu & Phuc hoi Co so Du lieu (Backup & Restore Rehearsal)

### 3.1. Muc tieu Phuc hoi (Recovery Objectives)
- **RPO (Recovery Point Objective)**: < 1 gio (Toi da mat mat du lieu trong vong 60 phut truoc thoi diem gap su co).
- **RTO (Recovery Time Objective)**: < 15 phut (Toan bo he thong san sang tiep nhan lai luu luong trong vong 15 phut sau khi kich hoat phuc hoi).

### 3.2. Sao luu Tu dong (Automated Backup via pg_dump)
Chay lenh sao luu co so du lieu dinh ky 1 gio / lan qua Cron job tren may chu co so du lieu:
```bash
# Sao luu co so du lieu dinh dang custom nen (compressed)
docker exec -t vdbus-postgres pg_dump \
  -U vdbus_admin \
  -d vdbus_logistics \
  -F c \
  -b -v \
  -f /var/lib/postgresql/data/backups/vdbus_backup_$(date +%Y%m%d_%H%M%S).dump

# Day ban sao luu len S3 / Cloud Storage an toan
aws s3 cp /var/lib/postgresql/data/backups/ s3://vdbus-prod-backups/db/ --recursive
```

### 3.3. Dien tap Phuc hoi (Restore Rehearsal Procedure)
Quy trinh phuc hoi tu ban sao luu moi nhat da duoc kiem nghiem:
```bash
# 1. Dung backend api de ngan chan ghi du lieu moi
docker stop vdbus-backend-api

# 2. Xoa co so du lieu cu va tao co so du lieu moi
docker exec -it vdbus-postgres psql -U vdbus_admin -c "DROP DATABASE IF EXISTS vdbus_logistics_restore;"
docker exec -it vdbus-postgres psql -U vdbus_admin -c "CREATE DATABASE vdbus_logistics_restore WITH OWNER vdbus_admin;"

# 3. Phuc hoi du lieu tu ban dump
docker exec -it vdbus-postgres pg_restore \
  -U vdbus_admin \
  -d vdbus_logistics_restore \
  -v /var/lib/postgresql/data/backups/latest.dump

# 4. Kiem tra tinh toan ven bang cach dem so ban ghi
docker exec -it vdbus-postgres psql -U vdbus_admin -d vdbus_logistics_restore -c "SELECT count(*) FROM \"Vehicles\";"
docker exec -it vdbus-postgres psql -U vdbus_admin -d vdbus_logistics_restore -c "SELECT count(*) FROM \"Orders\";"

# 5. Khoi dong lai backend api ket noi toi co so du lieu da phuc hoi
docker start vdbus-backend-api
```

---

## 4. Kich ban Xu ly Su co Khan cap (Incident Response Playbooks)

### 4.1. Su co 1: Nghen hang doi Telematics Ingestion (High Ingestion Lag)
- **Dau hieu**: Thoi gian phan hoi vi tri tren ban do cham > 10 giay, CPU tren container Redis tang cao > 80%.
- **Nguyen nhan**: Luu luong dot bien tu hon 1.000 xe hoac mat ket noi mang 4G tam thoi dan den hang loat xe dong loat re-sync.
- **Cac buoc xu ly**:
  1. Kiem tra so luong ban tin trong hang doi Redis:
     `docker exec -it vdbus-redis redis-cli -a <password> LLEN telematics_stream`
  2. Tang so luong worker xu ly nen bang cach mo rong container `backend-api`:
     `docker compose up -d --scale backend-api=3`
  3. Kiem tra logs he thong de loai tru loi timeout ghi vao PostgreSQL:
     `docker logs --tail 100 vdbus-backend-api`

### 4.2. Su co 2: Timeout Webhook Ngan hang VietQR
- **Dau hieu**: Khach hang da chuyen khoan thanh cong qua NAPAS 247 nhung hoa don tren he thong van o trang thai `Pending`.
- **Cac buoc xu ly**:
  1. Kiem tra nhat ky webhook trong `AuditLogs`:
     `SELECT * FROM "AuditLogs" WHERE "Action" = 'BANKING_WEBHOOK_RECEIVED' ORDER BY "CreatedAtUtc" DESC LIMIT 10;`
  2. Nho co co che **Idempotency Key**, he thong ngan chan trung lap. Ke toan co the kich hoat lai Webhook Replay tu giao dien InvoicesPage hoac go lenh API:
     `POST /api/v1/payments/vietqr/webhook` voi payload giao dich tu ngan hang.
  3. Hoa don se tu dong doi sang trang thai `Paid` va tao but toan P&L ma khong gay sai lech so du.

### 4.3. Su co 3: He thong Ky so Hoa don Dien tu (CQT) Bi gian doan
- **Dau hieu**: Lenh xuat hoa don tra ve ma loi tu cong Tong cuc Thue.
- **Cac buoc xu ly**:
  1. He thong tu dong bat co che `IsSimulated = true` voi nha cung cap du phong (`MockEInvoiceProvider`).
  2. Hoa don duoc dua vao hang doi `PendingSigningQueue` de tu dong ky lai khi cong CQT hoat dong binh thuong.
  3. Hien thi thong bao ro rang: *"Can chuyen gia phap ly va ke toan thue xac nhan truoc khi phat hanh hoa don san xuat thuong mai thuc te"*.
