import React, { useState } from 'react';
import {
  PageHeader,
  Button,
  Badge,
  MockDataBadge,
  Banner,
} from '@vdbus/design-system';

export interface FuelEntry {
  id: string;
  licensePlate: string;
  driverName: string;
  purchasedAt: string;
  stationName: string;
  fuelLitre: number;
  odometerKm: number;
  totalCostVnd: number;
  actualConsumptionLitre100Km: number;
  standardConsumptionLitre100Km: number;
  abnormalityScore: number;
  abnormalityReason: string;
}

export interface MaintenanceItem {
  id: string;
  orderCode: string;
  licensePlate: string;
  type: string;
  garageName: string;
  scheduledDate: string;
  totalCostVnd: number;
  odometerKm: number;
  status: 'Scheduled' | 'InProgress' | 'Completed';
  partsReplaced: string;
}

export interface VehicleDocItem {
  id: string;
  licensePlate: string;
  docType: string;
  docNumber: string;
  issuer: string;
  issuedDate: string;
  expiryDate: string;
  daysRemaining: number;
  status: 'Valid' | 'ExpiringSoon' | 'Expired';
}

const mockFuelEntries: FuelEntry[] = [
  {
    id: 'f-1',
    licensePlate: '43C-189.24',
    driverName: 'Nguyen Van Hai',
    purchasedAt: '2026-10-24 08:30',
    stationName: 'Petrolimex Cửa hàng 12 (Hòa Cầm)',
    fuelLitre: 120,
    odometerKm: 124500,
    totalCostVnd: 2640000,
    actualConsumptionLitre100Km: 18.2,
    standardConsumptionLitre100Km: 18.0,
    abnormalityScore: 0.05,
    abnormalityReason: 'Mức tiêu hao trong biên độ tiêu chuẩn nhà sản xuất (+1.1%)',
  },
  {
    id: 'f-2',
    licensePlate: '43H-012.88',
    driverName: 'Tran Dinh Trong',
    purchasedAt: '2026-10-23 19:15',
    stationName: 'PVOIL Cửa hàng 05 (Chu Lai)',
    fuelLitre: 210,
    odometerKm: 98400,
    totalCostVnd: 4620000,
    actualConsumptionLitre100Km: 28.5,
    standardConsumptionLitre100Km: 24.0,
    abnormalityScore: 0.65,
    abnormalityReason: 'Độ lệch tiêu hao cao hơn định mức 18.75% so với dữ liệu cảm biến bình dầu',
  },
  {
    id: 'f-3',
    licensePlate: '29H-882.11',
    driverName: 'Le Van Minh',
    purchasedAt: '2026-10-24 06:45',
    stationName: 'Petrolimex Cửa hàng 34 (Vinh)',
    fuelLitre: 180,
    odometerKm: 156200,
    totalCostVnd: 3960000,
    actualConsumptionLitre100Km: 26.2,
    standardConsumptionLitre100Km: 26.0,
    abnormalityScore: 0.08,
    abnormalityReason: 'Cảm biến bình dầu khớp 98.5% thể tích trên phiếu thu',
  },
];

const mockMaintenance: MaintenanceItem[] = [
  {
    id: 'm-1',
    orderCode: 'BD-202610-001',
    licensePlate: '43C-189.24',
    type: 'Bảo dưỡng định kỳ cấp 2 (120.000 km)',
    garageName: 'Xưởng dịch vụ Hino Da Nang',
    scheduledDate: '2026-10-18',
    totalCostVnd: 4500000,
    odometerKm: 120400,
    status: 'Completed',
    partsReplaced: 'Nhớt máy 15W40 (20L), Lọc dầu, Lọc gió',
  },
  {
    id: 'm-2',
    orderCode: 'BD-202610-002',
    licensePlate: '43H-012.88',
    type: 'Thay lốp và cân chỉnh thước lái trục dẫn',
    garageName: 'Michelin Hải Phòng - Chi nhánh Đà Nẵng',
    scheduledDate: '2026-10-20',
    totalCostVnd: 11200000,
    odometerKm: 97800,
    status: 'Completed',
    partsReplaced: '02 lốp Michelin 295/80R22.5',
  },
  {
    id: 'm-3',
    orderCode: 'BD-202610-003',
    licensePlate: '50H-918.44',
    type: 'Bảo dưỡng hệ thống phanh khí nén',
    garageName: 'Thaco Auto Chu Lai Service',
    scheduledDate: '2026-11-05',
    totalCostVnd: 3800000,
    odometerKm: 85000,
    status: 'Scheduled',
    partsReplaced: 'Má phanh trước sau, phớt cup-pen',
  },
];

const mockDocuments: VehicleDocItem[] = [
  {
    id: 'd-1',
    licensePlate: '43C-189.24',
    docType: 'Giấy chứng nhận Kiểm định ATKT & BVMT',
    docNumber: 'KD-4301S-19284',
    issuer: 'Trung tâm Đăng kiểm 43-01S',
    issuedDate: '2026-05-10',
    expiryDate: '2026-11-10',
    daysRemaining: 9,
    status: 'ExpiringSoon',
  },
  {
    id: 'd-2',
    licensePlate: '43H-012.88',
    docType: 'Bảo hiểm TNDS bắt buộc chủ xe cơ giới',
    docNumber: 'BH-PTI-847291',
    issuer: 'Bảo hiểm Bưu điện PTI',
    issuedDate: '2026-01-15',
    expiryDate: '2027-01-15',
    daysRemaining: 75,
    status: 'Valid',
  },
  {
    id: 'd-3',
    licensePlate: '29H-882.11',
    docType: 'Phù hiệu xe tải (Container)',
    docNumber: 'PH-HN-2026-0491',
    issuer: 'Sở Giao thông Vận tải Hà Nội',
    issuedDate: '2024-03-20',
    expiryDate: '2031-03-20',
    daysRemaining: 1600,
    status: 'Valid',
  },
  {
    id: 'd-4',
    licensePlate: '50H-918.44',
    docType: 'Giấy chứng nhận Kiểm định ATKT & BVMT',
    docNumber: 'KD-5002S-99120',
    issuer: 'Trung tâm Đăng kiểm 50-02S',
    issuedDate: '2025-10-15',
    expiryDate: '2026-10-15',
    daysRemaining: -17,
    status: 'Expired',
  },
];

export const FuelMaintenancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'fuel' | 'maintenance' | 'documents'>('fuel');

  const formatVnd = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vdbus-space-4)' }}>
      <PageHeader
        title="Quản lý Nhiên liệu & Bảo dưỡng Đội xe"
        subtitle="Giám sát tiêu hao định mức, đối chiếu cảm biến bình dầu và theo dõi hạn kiểm định phương tiện"
        actions={
          <div style={{ display: 'flex', gap: 'var(--vdbus-space-2)', alignItems: 'center' }}>
            <MockDataBadge />
            <Button variant="primary">
              Ghi nhận đổ dầu mới
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--vdbus-space-2)', borderBottom: '1px solid var(--vdbus-color-border-subtle)', paddingBottom: 'var(--vdbus-space-2)' }}>
        <button
          onClick={() => setActiveTab('fuel')}
          style={{
            padding: 'var(--vdbus-space-2) var(--vdbus-space-4)',
            borderRadius: 'var(--vdbus-radius-base)',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeTab === 'fuel' ? 'var(--vdbus-color-primary)' : 'transparent',
            color: activeTab === 'fuel' ? 'var(--vdbus-color-bg-canvas)' : 'var(--vdbus-color-text-secondary)',
            fontWeight: 600,
            fontSize: 'var(--vdbus-font-size-sm)',
          }}
        >
          Nhật ký Nhiên liệu & Bất thường ({mockFuelEntries.length})
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          style={{
            padding: 'var(--vdbus-space-2) var(--vdbus-space-4)',
            borderRadius: 'var(--vdbus-radius-base)',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeTab === 'maintenance' ? 'var(--vdbus-color-primary)' : 'transparent',
            color: activeTab === 'maintenance' ? 'var(--vdbus-color-bg-canvas)' : 'var(--vdbus-color-text-secondary)',
            fontWeight: 600,
            fontSize: 'var(--vdbus-font-size-sm)',
          }}
        >
          Lịch Bảo dưỡng Phương tiện ({mockMaintenance.length})
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          style={{
            padding: 'var(--vdbus-space-2) var(--vdbus-space-4)',
            borderRadius: 'var(--vdbus-radius-base)',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeTab === 'documents' ? 'var(--vdbus-color-primary)' : 'transparent',
            color: activeTab === 'documents' ? 'var(--vdbus-color-bg-canvas)' : 'var(--vdbus-color-text-secondary)',
            fontWeight: 600,
            fontSize: 'var(--vdbus-font-size-sm)',
          }}
        >
          Ví Hồ sơ & Hạn Đăng kiểm ({mockDocuments.length})
        </button>
      </div>

      {/* Content Rendering */}
      {activeTab === 'fuel' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vdbus-space-3)' }}>
          <div
            style={{
              backgroundColor: 'var(--vdbus-color-bg-surface)',
              border: '1px solid var(--vdbus-color-border-subtle)',
              borderRadius: 'var(--vdbus-radius-base)',
              overflowX: 'auto',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--vdbus-font-size-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--vdbus-color-border-default)', backgroundColor: 'var(--vdbus-color-bg-subtle)' }}>
                  <th style={{ padding: 'var(--vdbus-space-3)' }}>Biển số</th>
                  <th style={{ padding: 'var(--vdbus-space-3)' }}>Tài xế & Thời gian</th>
                  <th style={{ padding: 'var(--vdbus-space-3)' }}>Trạm xăng dầu</th>
                  <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>Lít</th>
                  <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>Thành tiền</th>
                  <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>Đo được (L/100km)</th>
                  <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>Định mức (L/100km)</th>
                  <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'center' }}>Đánh giá rủi ro</th>
                  <th style={{ padding: 'var(--vdbus-space-3)' }}>Nhận định hệ thống</th>
                </tr>
              </thead>
              <tbody>
                {mockFuelEntries.map(f => (
                  <tr key={f.id} style={{ borderBottom: '1px solid var(--vdbus-color-border-subtle)' }}>
                    <td style={{ padding: 'var(--vdbus-space-3)', fontWeight: 600 }}>{f.licensePlate}</td>
                    <td style={{ padding: 'var(--vdbus-space-3)' }}>
                      <div>{f.driverName}</div>
                      <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)' }}>{f.purchasedAt}</div>
                    </td>
                    <td style={{ padding: 'var(--vdbus-space-3)', color: 'var(--vdbus-color-text-secondary)' }}>{f.stationName}</td>
                    <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right', fontWeight: 600 }}>{f.fuelLitre} L</td>
                    <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right', fontWeight: 600 }}>{formatVnd(f.totalCostVnd)}</td>
                    <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right', fontWeight: 600, color: f.actualConsumptionLitre100Km > f.standardConsumptionLitre100Km ? 'var(--vdbus-color-error-text)' : 'var(--vdbus-color-success-text)' }}>
                      {f.actualConsumptionLitre100Km}
                    </td>
                    <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right', color: 'var(--vdbus-color-text-secondary)' }}>
                      {f.standardConsumptionLitre100Km}
                    </td>
                    <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'center' }}>
                      <Badge variant={f.abnormalityScore > 0.5 ? 'error' : f.abnormalityScore > 0.2 ? 'warning' : 'success'}>
                        {f.abnormalityScore > 0.5 ? 'Cần đối soát' : f.abnormalityScore > 0.2 ? 'Lệch nhẹ' : 'Bình thường'}
                      </Badge>
                    </td>
                    <td style={{ padding: 'var(--vdbus-space-3)', fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-secondary)' }}>
                      {f.abnormalityReason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Banner variant="info" title="Quy tắc đánh giá tiêu hao nhiên liệu">
            Thuật toán đối chiếu tự động giữa số lít trên hóa đơn tài xế nộp và biến thiên mức nhiên liệu thực tế từ cảm biến phao dầu IoT trên bình xe tại thời điểm bơm. Không quy kết tiêu cực mà đưa ra chỉ số rủi ro (Abnormality Score) để quản lý đội xe xem xét.
          </Banner>
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vdbus-space-3)' }}>
          <div
            style={{
              backgroundColor: 'var(--vdbus-color-bg-surface)',
              border: '1px solid var(--vdbus-color-border-subtle)',
              borderRadius: 'var(--vdbus-radius-base)',
              overflowX: 'auto',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--vdbus-font-size-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--vdbus-color-border-default)', backgroundColor: 'var(--vdbus-color-bg-subtle)' }}>
                  <th style={{ padding: 'var(--vdbus-space-3)' }}>Mã lệnh</th>
                  <th style={{ padding: 'var(--vdbus-space-3)' }}>Biển số</th>
                  <th style={{ padding: 'var(--vdbus-space-3)' }}>Nội dung bảo dưỡng</th>
                  <th style={{ padding: 'var(--vdbus-space-3)' }}>Đơn vị thực hiện</th>
                  <th style={{ padding: 'var(--vdbus-space-3)' }}>Vật tư / Phụ tùng thay thế</th>
                  <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>Odometer</th>
                  <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>Chi phí</th>
                  <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'center' }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {mockMaintenance.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--vdbus-color-border-subtle)' }}>
                    <td style={{ padding: 'var(--vdbus-space-3)', fontWeight: 600 }}>{m.orderCode}</td>
                    <td style={{ padding: 'var(--vdbus-space-3)' }}>{m.licensePlate}</td>
                    <td style={{ padding: 'var(--vdbus-space-3)' }}>{m.type}</td>
                    <td style={{ padding: 'var(--vdbus-space-3)', color: 'var(--vdbus-color-text-secondary)' }}>{m.garageName}</td>
                    <td style={{ padding: 'var(--vdbus-space-3)', fontSize: 'var(--vdbus-font-size-xs)' }}>{m.partsReplaced}</td>
                    <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>{m.odometerKm.toLocaleString()} km</td>
                    <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right', fontWeight: 600 }}>{formatVnd(m.totalCostVnd)}</td>
                    <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'center' }}>
                      <Badge variant={m.status === 'Completed' ? 'success' : 'neutral'}>
                        {m.status === 'Completed' ? 'Đã hoàn thành' : 'Đã lên lịch'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vdbus-space-3)' }}>
          <div
            style={{
              backgroundColor: 'var(--vdbus-color-bg-surface)',
              border: '1px solid var(--vdbus-color-border-subtle)',
              borderRadius: 'var(--vdbus-radius-base)',
              overflowX: 'auto',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--vdbus-font-size-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--vdbus-color-border-default)', backgroundColor: 'var(--vdbus-color-bg-subtle)' }}>
                  <th style={{ padding: 'var(--vdbus-space-3)' }}>Biển số</th>
                  <th style={{ padding: 'var(--vdbus-space-3)' }}>Hạng mục hồ sơ</th>
                  <th style={{ padding: 'var(--vdbus-space-3)' }}>Số hiệu văn bản</th>
                  <th style={{ padding: 'var(--vdbus-space-3)' }}>Cơ quan cấp</th>
                  <th style={{ padding: 'var(--vdbus-space-3)' }}>Ngày hiệu lực</th>
                  <th style={{ padding: 'var(--vdbus-space-3)' }}>Ngày hết hạn</th>
                  <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'center' }}>Thời hạn còn lại</th>
                  <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'center' }}>Tình trạng</th>
                </tr>
              </thead>
              <tbody>
                {mockDocuments.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--vdbus-color-border-subtle)' }}>
                    <td style={{ padding: 'var(--vdbus-space-3)', fontWeight: 600 }}>{d.licensePlate}</td>
                    <td style={{ padding: 'var(--vdbus-space-3)' }}>{d.docType}</td>
                    <td style={{ padding: 'var(--vdbus-space-3)', fontFamily: 'monospace' }}>{d.docNumber}</td>
                    <td style={{ padding: 'var(--vdbus-space-3)', color: 'var(--vdbus-color-text-secondary)' }}>{d.issuer}</td>
                    <td style={{ padding: 'var(--vdbus-space-3)' }}>{d.issuedDate}</td>
                    <td style={{ padding: 'var(--vdbus-space-3)', fontWeight: 600 }}>{d.expiryDate}</td>
                    <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'center', fontWeight: 600 }}>
                      {d.daysRemaining > 0 ? `${d.daysRemaining} ngày` : `Quá hạn ${Math.abs(d.daysRemaining)} ngày`}
                    </td>
                    <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'center' }}>
                      <Badge variant={d.status === 'Valid' ? 'success' : d.status === 'ExpiringSoon' ? 'warning' : 'error'}>
                        {d.status === 'Valid' ? 'Đủ điều kiện' : d.status === 'ExpiringSoon' ? 'Sắp hết hạn' : 'Quá hạn'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Banner variant="warning" title="Cảnh báo pháp lý lưu hành đường bộ">
            Phương tiện có Giấy kiểm định hoặc Phù hiệu quá hạn bị hệ thống tự động khóa khỏi bàn điều phối theo quy định tại Nghị định 10/2020/NĐ-CP và Luật Trật tự an toàn giao thông đường bộ 2024. Cần bộ phận pháp chế và đăng kiểm viên xác nhận gia hạn.
          </Banner>
        </div>
      )}
    </div>
  );
};
