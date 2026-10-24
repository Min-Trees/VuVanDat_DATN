import { useState } from 'react';
import {
  PageHeader,
  Badge,
  MockDataBadge,
  MapPanel,
  Button,
  Input,
  IconSearch,
  IconTruck,
  IconClock,
  IconMapPin,
  IconShield,
} from '@vdbus/design-system';

interface TrackingData {
  orderCode: string;
  status: string;
  statusVariant: 'info' | 'success' | 'warning';
  eta: string;
  driverMasked: string;
  vehiclePlateMasked: string;
  origin: string;
  destination: string;
  temperatureCelsius?: number;
  isSimulated: boolean;
}

const mockShipmentData: TrackingData = {
  orderCode: 'DH-2026-9921',
  status: 'Đang vận chuyển',
  statusVariant: 'info',
  eta: '14:30 hôm nay (Dự kiến)',
  driverMasked: 'Nguyễn V. A.',
  vehiclePlateMasked: '29C-***.11',
  origin: 'Kho tổng VSIP Bắc Ninh',
  destination: 'Trung tâm phân phối Tân Bình, TP.HCM',
  temperatureCelsius: 3.8,
  isSimulated: true,
};

export const App = () => {
  const [token, setToken] = useState('demo-token-128bit-vdbus-public');
  const [data] = useState<TrackingData>(mockShipmentData);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--vdbus-color-bg-canvas)' }}>
      {/* Top Header */}
      <header
        style={{
          height: '48px',
          backgroundColor: 'var(--vdbus-color-bg-surface)',
          borderBottom: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--vdbus-space-6)',
        }}
      >
        <span style={{ fontWeight: 'var(--vdbus-font-weight-semibold)', color: 'var(--vdbus-color-primary)' }}>
          VDBus Shipper Tracking
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--vdbus-space-2)' }}>
          <IconShield size={14} />
          <span style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)' }}>
            Liên kết bảo mật token (&gt;= 128 bit)
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: 'var(--vdbus-space-6)' }}>
        <PageHeader
          title={`Tra cứu vận đơn: ${data.orderCode}`}
          subtitle="Cổng thông tin hành trình giao hàng công khai dành cho chủ hàng"
          badge={<Badge variant={data.statusVariant}>{data.status}</Badge>}
        />

        {/* Token Search Bar */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--vdbus-space-3)',
            marginBottom: 'var(--vdbus-space-5)',
            backgroundColor: 'var(--vdbus-color-bg-surface)',
            padding: 'var(--vdbus-space-3)',
            border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
            borderRadius: 'var(--vdbus-radius-base)',
          }}
        >
          <div style={{ flex: 1 }}>
            <Input
              size="base"
              placeholder="Nhập mã token tra cứu hành trình..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              prefixElement={<IconSearch size={14} />}
            />
          </div>
          <Button variant="primary" size="base">
            Tra cứu
          </Button>
        </div>

        {/* Summary Info Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--vdbus-space-4)',
            marginBottom: 'var(--vdbus-space-5)',
          }}
        >
          <div
            style={{
              padding: 'var(--vdbus-space-4)',
              backgroundColor: 'var(--vdbus-color-bg-surface)',
              border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
              borderRadius: 'var(--vdbus-radius-base)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--vdbus-color-text-muted)', marginBottom: '4px' }}>
              <IconClock size={14} />
              <span style={{ fontSize: 'var(--vdbus-font-size-xs)' }}>Thời gian dự kiến (ETA)</span>
            </div>
            <strong style={{ fontSize: 'var(--vdbus-font-size-md)', color: 'var(--vdbus-color-text-primary)' }}>
              {data.eta}
            </strong>
          </div>

          <div
            style={{
              padding: 'var(--vdbus-space-4)',
              backgroundColor: 'var(--vdbus-color-bg-surface)',
              border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
              borderRadius: 'var(--vdbus-radius-base)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--vdbus-color-text-muted)', marginBottom: '4px' }}>
              <IconTruck size={14} />
              <span style={{ fontSize: 'var(--vdbus-font-size-xs)' }}>Phương tiện & Tài xế</span>
            </div>
            <div style={{ fontSize: 'var(--vdbus-font-size-sm)', fontWeight: 'var(--vdbus-font-weight-medium)' }}>
              {data.vehiclePlateMasked} - {data.driverMasked}
            </div>
          </div>

          <div
            style={{
              padding: 'var(--vdbus-space-4)',
              backgroundColor: 'var(--vdbus-color-bg-surface)',
              border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
              borderRadius: 'var(--vdbus-radius-base)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--vdbus-color-text-muted)', marginBottom: '4px' }}>
              <IconMapPin size={14} />
              <span style={{ fontSize: 'var(--vdbus-font-size-xs)' }}>Nhiệt độ chuỗi lạnh</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong className="tabular-nums" style={{ fontSize: 'var(--vdbus-font-size-md)' }}>
                +{data.temperatureCelsius}°C
              </strong>
              <Badge variant="success">Đạt chuẩn</Badge>
            </div>
          </div>
        </div>

        {/* Map Panel (with simulated badge and coordinates rounded for privacy) */}
        <MapPanel
          title="Bản đồ hành trình vị trí xe (Tọa độ được làm tròn bảo mật)"
          isSimulated={data.isSimulated}
          height={380}
        />

        <div style={{ marginTop: 'var(--vdbus-space-3)', display: 'flex', justifyContent: 'flex-end' }}>
          {data.isSimulated && <MockDataBadge label="Dữ liệu mô phỏng GPS" />}
        </div>
      </main>
    </div>
  );
};
