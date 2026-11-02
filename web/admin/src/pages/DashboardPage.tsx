import { useState } from 'react';
import {
  PageHeader,
  Button,
  DataTable,
  Column,
  Badge,
  MapPanel,
  Banner,
  IconRefresh,
  IconDownload,
  IconTruck,
  IconClock,
  IconRadio,
  IconFileText,
} from '@vdbus/design-system';
import { useI18n } from '../i18n/i18nContext';

interface ShipmentRow {
  id: string;
  code: string;
  route: string;
  vehicle: string;
  driverName: string;
  weightTons: number;
  volumeCbm: number;
  eta: string;
  progressPercent: number;
  status: 'running' | 'dispatching' | 'completed' | 'alert';
}

const initialShipments: ShipmentRow[] = [
  {
    id: '1',
    code: 'CH-2026-0881',
    route: 'KKT Dung Quất -> KCN Hòa Khánh, Đà Nẵng',
    vehicle: '43C-189.24',
    driverName: 'Nguyễn Văn Tuấn',
    weightTons: 18.5,
    volumeCbm: 42.0,
    eta: '14:30 (Đúng hẹn)',
    progressPercent: 65,
    status: 'running',
  },
  {
    id: '2',
    code: 'CH-2026-0882',
    route: 'KCN Điện Nam Điện Ngọc -> Cảng Tiên Sa',
    vehicle: '43H-012.88',
    driverName: 'Lê Hoàng Long',
    weightTons: 24.0,
    volumeCbm: 20.0,
    eta: '16:00 (Nguy cơ trễ)',
    progressPercent: 40,
    status: 'alert',
  },
  {
    id: '3',
    code: 'CH-2026-0883',
    route: 'Tổng kho Vinamilk -> Co.opmart Tam Kỳ',
    vehicle: '92C-551.42',
    driverName: 'Trần Đình Trọng',
    weightTons: 8.5,
    volumeCbm: 32.0,
    eta: '12:15 (Hoàn tất)',
    progressPercent: 100,
    status: 'completed',
  },
  {
    id: '4',
    code: 'CH-2026-0884',
    route: 'Cảng Quy Nhơn -> Kho Hòa Phát Dung Quất',
    vehicle: '77C-099.12',
    driverName: 'Phạm Đức Huy',
    weightTons: 15.0,
    volumeCbm: 25.0,
    eta: '18:45 (Đang xếp hàng)',
    progressPercent: 15,
    status: 'dispatching',
  },
];

export const DashboardPage = () => {
  const { t, formatDateTime } = useI18n();
  const [data] = useState<ShipmentRow[]>(initialShipments);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const columns: Column<ShipmentRow>[] = [
    { key: 'code', header: 'Mã chuyến', width: 140 },
    { key: 'route', header: 'Hành trình vận chuyển' },
    { key: 'vehicle', header: 'Biển số xe', width: 120 },
    { key: 'driverName', header: 'Tài xế phụ trách', width: 160 },
    {
      key: 'weightTons',
      header: 'Tải trọng',
      isNumeric: true,
      width: 110,
      render: (val: number, row: ShipmentRow) => `${val.toFixed(1)} T / ${row.volumeCbm} CBM`,
    },
    { key: 'eta', header: 'ETA Dự kiến', width: 160 },
    {
      key: 'progressPercent',
      header: 'Tiến độ',
      width: 140,
      render: (percent: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              flex: 1,
              height: '6px',
              backgroundColor: 'var(--vdbus-color-bg-subtle)',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${percent}%`,
                height: '100%',
                backgroundColor: percent === 100 ? 'var(--vdbus-color-success)' : 'var(--vdbus-color-primary)',
              }}
            />
          </div>
          <span style={{ fontSize: '11px', fontWeight: 600 }}>{percent}%</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: 130,
      render: (status: ShipmentRow['status']) => {
        if (status === 'running') return <Badge variant="info">Đang vận chuyển</Badge>;
        if (status === 'alert') return <Badge variant="error">Cảnh báo trễ</Badge>;
        if (status === 'dispatching') return <Badge variant="neutral">Chờ xếp hàng</Badge>;
        return <Badge variant="success">Hoàn thành</Badge>;
      },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <PageHeader
        title={t('nav.dashboard')}
        subtitle={`Trung tâm chỉ huy & điều phối TMS B2B - Cập nhật lúc ${formatDateTime(new Date())}`}
        breadcrumbs={[
          { label: 'Hệ thống TMS' },
          { label: 'Bàn điều hành trung tâm' },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm">
              <IconRefresh size={14} /> Làm mới
            </Button>
            <Button variant="primary" size="sm">
              <IconDownload size={14} /> Xuất báo cáo
            </Button>
          </>
        }
      />

      {/* Banner Cảnh báo Vận hành */}
      <Banner
        variant="warning"
        title="Thông báo phân luồng giao thông:"
      >
        Đường tránh Nam Hải Vân đang bảo trì đoạn km 12-15; các xe tải trên 15 tấn cần giảm tốc độ và tuân thủ khoảng cách an toàn 50m.
      </Banner>

      {/* 4 Thẻ KPI Chỉ số Doanh nghiệp (Executive Scorecards) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}
      >
        <div
          style={{
            padding: '16px',
            backgroundColor: 'var(--vdbus-color-bg-surface)',
            border: '1px solid var(--vdbus-color-border-subtle)',
            borderRadius: 'var(--vdbus-radius-md)',
            boxShadow: 'var(--vdbus-shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--vdbus-color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Tỷ lệ giao đúng hẹn (OTIF)
            </span>
            <IconClock size={16} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--vdbus-color-success)' }}>
            97.8%
          </div>
          <div style={{ fontSize: '11px', color: 'var(--vdbus-color-text-secondary)', marginTop: '4px' }}>
            Mục tiêu cam kết SLA: $\ge 95.0\%$ (+1.2% so với tuần trước)
          </div>
        </div>

        <div
          style={{
            padding: '16px',
            backgroundColor: 'var(--vdbus-color-bg-surface)',
            border: '1px solid var(--vdbus-color-border-subtle)',
            borderRadius: 'var(--vdbus-radius-md)',
            boxShadow: 'var(--vdbus-shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--vdbus-color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Công suất đoàn xe hoạt động
            </span>
            <IconTruck size={16} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--vdbus-color-primary)' }}>
            18 / 20 xe
          </div>
          <div style={{ fontSize: '11px', color: 'var(--vdbus-color-text-secondary)', marginTop: '4px' }}>
            Tỷ lệ huy động 90.0% (1 xe bảo dưỡng, 1 xe dự phòng)
          </div>
        </div>

        <div
          style={{
            padding: '16px',
            backgroundColor: 'var(--vdbus-color-bg-surface)',
            border: '1px solid var(--vdbus-color-border-subtle)',
            borderRadius: 'var(--vdbus-radius-md)',
            boxShadow: 'var(--vdbus-shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--vdbus-color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Sản lượng hàng ngày
            </span>
            <IconFileText size={16} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--vdbus-color-text-primary)' }}>
            342.5 Tấn
          </div>
          <div style={{ fontSize: '11px', color: 'var(--vdbus-color-text-secondary)', marginTop: '4px' }}>
            Tổng thể tích: 890 CBM trên 24 chuyến vận chuyển
          </div>
        </div>

        <div
          style={{
            padding: '16px',
            backgroundColor: 'var(--vdbus-color-bg-surface)',
            border: '1px solid var(--vdbus-color-border-subtle)',
            borderRadius: 'var(--vdbus-radius-md)',
            boxShadow: 'var(--vdbus-shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--vdbus-color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Cảnh báo Vận hành & IoT
            </span>
            <IconRadio size={16} />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--vdbus-color-error)' }}>
            3 Mục
          </div>
          <div style={{ fontSize: '11px', color: 'var(--vdbus-color-text-secondary)', marginTop: '4px' }}>
            1 Quá nhiệt thùng lạnh, 1 Giờ lái HOS, 1 Khung giờ cấm
          </div>
        </div>
      </div>

      {/* Bản đồ Giám sát Lộ trình Đoàn xe */}
      <div
        style={{
          backgroundColor: 'var(--vdbus-color-bg-surface)',
          border: '1px solid var(--vdbus-color-border-subtle)',
          borderRadius: 'var(--vdbus-radius-md)',
          padding: '16px',
          boxShadow: 'var(--vdbus-shadow-sm)',
        }}
      >
        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>
              Bản đồ Giám sát Định vị Đoàn xe Thời gian thực (Live GPS & IoT)
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--vdbus-color-text-muted)' }}>
              Đồng bộ dữ liệu cảm biến OBD-II, nhiệt độ chuỗi lạnh và tốc độ hành trình từ hộp đen TMS
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Badge variant="info">Đang chạy: 12</Badge>
            <Badge variant="neutral">Dừng đỗ: 6</Badge>
            <Badge variant="error">Cảnh báo: 2</Badge>
          </div>
        </div>
        <MapPanel
          title="Tuyến trục Quốc lộ 1A - Đường sắt Bắc Nam - Cao tốc La Sơn Túy Loan"
          isSimulated={true}
          height={380}
        />
      </div>

      {/* Bảng Kê Chuyến Xe Vận Chuyển Chi Tiết */}
      <div
        style={{
          backgroundColor: 'var(--vdbus-color-bg-surface)',
          border: '1px solid var(--vdbus-color-border-subtle)',
          borderRadius: 'var(--vdbus-radius-md)',
          padding: '16px',
          boxShadow: 'var(--vdbus-shadow-sm)',
        }}
      >
        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>
              Nhật ký Hành trình & Tiến độ Giao nhận Chuyến xe
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--vdbus-color-text-muted)' }}>
              Theo dõi tiến độ bốc dỡ hàng, ETA cập nhật tự động và tình trạng bàn giao ePOD
            </span>
          </div>
        </div>

        <DataTable
          data={data}
          columns={columns}
          rowKey={(r) => r.id}
          selectedRowKeys={selectedKeys}
          onSelectRow={(key, sel) => {
            setSelectedKeys((prev) => (sel ? [...prev, key] : prev.filter((k) => k !== key)));
          }}
          onSelectAll={(sel) => {
            setSelectedKeys(sel ? data.map((d) => d.id) : []);
          }}
          pagination={{
            pageIndex: 1,
            pageSize: 10,
            totalItems: data.length,
            onPageChange: () => {},
          }}
        />
      </div>
    </div>
  );
};
