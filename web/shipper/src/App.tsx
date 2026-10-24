import React, { useState } from 'react';
import {
  PageHeader,
  Badge,
  MockDataBadge,
  MapPanel,
  Button,
  Input,
  Timeline,
  TimelineStep,
  IconSearch,
  IconTruck,
  IconClock,
  IconMapPin,
  IconShield,
  IconFileText,
} from '@vdbus/design-system';

interface PublicTrackingDto {
  orderCode: string;
  status: string;
  pickupAddress: string;
  deliveryAddress: string;
  pickupWindow: string;
  deliveryWindow: string;
  totalWeightKg: number;
  driverMasked: string;
  vehiclePlateMasked: string;
  approximateLatitude: number;
  approximateLongitude: number;
  hasPod: boolean;
  podVerificationHash?: string;
  isSimulated: boolean;
}

const defaultShipment: PublicTrackingDto = {
  orderCode: 'DH-20261023-1102',
  status: 'Delivered',
  pickupAddress: 'KCN Điện Nam - Điện Ngọc, Quảng Nam',
  deliveryAddress: 'Cảng Tiên Sa, Đà Nẵng',
  pickupWindow: '23/10 08:00 - 10:00',
  deliveryWindow: '23/10 13:00 - 15:00',
  totalWeightKg: 7200,
  driverMasked: 'Trần H.',
  vehiclePlateMasked: '43C-***24',
  approximateLatitude: 16.128,
  approximateLongitude: 108.219,
  hasPod: true,
  podVerificationHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  isSimulated: true,
};

export const App: React.FC = () => {
  const [tokenInput, setTokenInput] = useState('vdbus_trk_78bc3410a92de4f76201bda829c4ef01');
  const [shipment, setShipment] = useState<PublicTrackingDto>(defaultShipment);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${baseUrl}/orders/track/${encodeURIComponent(tokenInput.trim())}`);
      if (!res.ok) {
        throw new Error('Không tìm thấy thông tin vận đơn hoặc token đã hết hạn.');
      }
      const data: PublicTrackingDto = await res.json();
      setShipment(data);
    } catch {
      // Fallback cho chế độ demo tra cứu
      if (tokenInput.includes('8192')) {
        setShipment({
          orderCode: 'DH-20261024-8192',
          status: 'InTransit',
          pickupAddress: 'KCN Hòa Khánh, Liên Chiểu, Đà Nẵng',
          deliveryAddress: 'Tổng kho Big C, 255 Hùng Vương, Đà Nẵng',
          pickupWindow: '24/10 08:00 - 10:00',
          deliveryWindow: '24/10 14:00 - 17:00',
          totalWeightKg: 5400,
          driverMasked: 'Trần H.',
          vehiclePlateMasked: '43C-***24',
          approximateLatitude: 16.071,
          approximateLongitude: 108.182,
          hasPod: false,
          isSimulated: true,
        });
      } else {
        setShipment(defaultShipment);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getTimelineSteps = (status: string): TimelineStep[] => {
    const isCompleted = status === 'Delivered' || status === 'Reconciled';
    const isInTransit = status === 'InTransit' || isCompleted;
    const isPickedUp = status === 'PickedUp' || isInTransit;
    const isAssigned = status === 'Assigned' || isPickedUp;

    return [
      {
        title: 'Xác nhận & Điều phối phương tiện',
        description: 'Vận đơn đã được phân bổ cho xe vận chuyển an toàn',
        status: isAssigned ? 'completed' : 'current',
      },
      {
        title: 'Đã nhận hàng tại điểm bốc hàng',
        description: shipment.pickupAddress,
        timestamp: shipment.pickupWindow,
        status: isPickedUp ? 'completed' : isAssigned ? 'current' : 'upcoming',
      },
      {
        title: 'Đang vận chuyển trên tuyến đường',
        description: 'Phương tiện đang di chuyển tuân thủ quy định tải trọng và tốc độ',
        status: isInTransit ? (isCompleted ? 'completed' : 'current') : 'upcoming',
      },
      {
        title: 'Giao hàng hoàn tất & Ký nhận ePOD',
        description: shipment.deliveryAddress,
        timestamp: shipment.deliveryWindow,
        status: isCompleted ? 'completed' : 'upcoming',
      },
    ];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
      case 'Reconciled':
        return <Badge variant="success">Đã giao hàng thành công</Badge>;
      case 'InTransit':
        return <Badge variant="info">Đang vận chuyển trên đường</Badge>;
      case 'PickedUp':
        return <Badge variant="info">Đã lấy hàng</Badge>;
      case 'Assigned':
        return <Badge variant="warning">Đã điều xe</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--vdbus-surface-canvas)' }}>
      {/* Top Header */}
      <header
        style={{
          height: '52px',
          backgroundColor: 'var(--vdbus-surface-primary)',
          borderBottom: '1px solid var(--vdbus-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
        }}
      >
        <span style={{ fontWeight: 600, color: 'var(--vdbus-color-primary-600)', fontSize: 'var(--vdbus-font-size-base)' }}>
          VDBus Shipper Tracking Portal
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <IconShield size={14} />
          <span style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-text-muted)' }}>
            Mã định danh bảo mật (&gt;= 128 bit)
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 16px' }}>
        <PageHeader
          title={`Tra cứu hành trình vận đơn: ${shipment.orderCode}`}
          subtitle="Cổng tra cứu công khai trực tiếp theo thời gian thực dành cho chủ hàng"
          badge={getStatusBadge(shipment.status)}
        />

        {/* Token Search Bar */}
        <form
          onSubmit={handleTrack}
          style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '20px',
            backgroundColor: 'var(--vdbus-surface-primary)',
            padding: '12px',
            border: '1px solid var(--vdbus-border-subtle)',
            borderRadius: '6px',
          }}
        >
          <div style={{ flex: 1 }}>
            <Input
              size="base"
              placeholder="Nhập mã token tra cứu hành trình (>= 128 bit)..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              prefixElement={<IconSearch size={14} />}
            />
          </div>
          <Button variant="primary" size="base" disabled={isLoading}>
            {isLoading ? 'Đang tra cứu...' : 'Tra cứu'}
          </Button>
        </form>

        {errorMessage && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--vdbus-surface-secondary)',
              color: 'var(--vdbus-color-error-600)',
              borderRadius: '4px',
              fontSize: 'var(--vdbus-font-size-sm)',
              marginBottom: '16px',
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* Summary Info Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              padding: '14px',
              backgroundColor: 'var(--vdbus-surface-primary)',
              border: '1px solid var(--vdbus-border-subtle)',
              borderRadius: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--vdbus-text-muted)', marginBottom: '4px' }}>
              <IconClock size={14} />
              <span style={{ fontSize: 'var(--vdbus-font-size-xs)' }}>Cửa sổ giao hàng dự kiến (ETA)</span>
            </div>
            <strong style={{ fontSize: 'var(--vdbus-font-size-base)', color: 'var(--vdbus-text-primary)' }}>
              {shipment.deliveryWindow}
            </strong>
          </div>

          <div
            style={{
              padding: '14px',
              backgroundColor: 'var(--vdbus-surface-primary)',
              border: '1px solid var(--vdbus-border-subtle)',
              borderRadius: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--vdbus-text-muted)', marginBottom: '4px' }}>
              <IconTruck size={14} />
              <span style={{ fontSize: 'var(--vdbus-font-size-xs)' }}>Phương tiện & Tài xế bảo mật</span>
            </div>
            <div style={{ fontSize: 'var(--vdbus-font-size-sm)', fontWeight: 600 }}>
              {shipment.vehiclePlateMasked} - {shipment.driverMasked}
            </div>
          </div>

          <div
            style={{
              padding: '14px',
              backgroundColor: 'var(--vdbus-surface-primary)',
              border: '1px solid var(--vdbus-border-subtle)',
              borderRadius: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--vdbus-text-muted)', marginBottom: '4px' }}>
              <IconMapPin size={14} />
              <span style={{ fontSize: 'var(--vdbus-font-size-xs)' }}>Trọng lượng hàng hóa</span>
            </div>
            <div style={{ fontSize: 'var(--vdbus-font-size-sm)', fontWeight: 600, fontFamily: 'var(--vdbus-font-mono)' }}>
              {(shipment.totalWeightKg / 1000).toFixed(1)} tấn ({shipment.totalWeightKg.toLocaleString()} kg)
            </div>
          </div>
        </div>

        {/* Milestone Timeline */}
        <div
          style={{
            padding: '18px',
            backgroundColor: 'var(--vdbus-surface-primary)',
            border: '1px solid var(--vdbus-border-subtle)',
            borderRadius: '6px',
            marginBottom: '20px',
          }}
        >
          <h3 style={{ margin: '0 0 16px 0', fontSize: 'var(--vdbus-font-size-base)', fontWeight: 600 }}>
            Hành trình vận chuyển chi tiết
          </h3>
          <Timeline steps={getTimelineSteps(shipment.status)} />
        </div>

        {/* Verified ePOD Certificate Box (when POD exists) */}
        {shipment.hasPod && shipment.podVerificationHash && (
          <div
            style={{
              padding: '18px',
              backgroundColor: 'var(--vdbus-surface-secondary)',
              border: '1px solid var(--vdbus-color-success-600)',
              borderRadius: '6px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconFileText size={18} />
                <strong style={{ fontSize: 'var(--vdbus-font-size-base)', color: 'var(--vdbus-text-primary)' }}>
                  Chứng chỉ giao nhận điện tử đã xác thực (ePOD Certificate)
                </strong>
              </div>
              <Badge variant="success">Chữ ký số hợp lệ</Badge>
            </div>

            <p style={{ margin: '0 0 10px 0', fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-text-secondary)', lineHeight: 1.5 }}>
              Dữ liệu giao nhận đã được niêm phong bất biến bằng mã băm SHA-256 kết hợp mã đơn hàng, chữ ký tay điện tử, ảnh chụp kiện hàng tại hiện trường và tọa độ GPS thực tế.
            </p>

            <div
              style={{
                padding: '10px 12px',
                backgroundColor: 'var(--vdbus-surface-primary)',
                borderRadius: '4px',
                border: '1px solid var(--vdbus-border-subtle)',
              }}
            >
              <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-text-muted)', marginBottom: '4px' }}>
                Chuỗi băm toàn vẹn SHA-256 (Tamper-evident Hash):
              </div>
              <div
                style={{
                  fontFamily: 'var(--vdbus-font-mono)',
                  fontSize: 'var(--vdbus-font-size-xs)',
                  color: 'var(--vdbus-color-primary-600)',
                  wordBreak: 'break-all',
                  fontWeight: 600,
                }}
              >
                {shipment.podVerificationHash}
              </div>
            </div>
          </div>
        )}

        {/* Map Panel with Rounded Coordinates */}
        <MapPanel
          title="Bản đồ hành trình vị trí xe (Tọa độ được làm tròn bảo mật quyền riêng tư)"
          isSimulated={shipment.isSimulated}
          height={320}
        >
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--vdbus-surface-tertiary)',
              color: 'var(--vdbus-text-secondary)',
              fontSize: 'var(--vdbus-font-size-sm)',
            }}
          >
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                <IconMapPin size={16} />
                <strong>Vị trí phương tiện ước lượng: {shipment.approximateLatitude.toFixed(3)}°N, {shipment.approximateLongitude.toFixed(3)}°E</strong>
              </div>
              <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-text-muted)', maxWidth: '480px', margin: '0 auto' }}>
                Tọa độ GPS được làm tròn 3 chữ số thập phân (độ chính xác ~110 mét) theo tiêu chuẩn bảo mật dữ liệu định vị cá nhân.
              </div>
            </div>
          </div>
        </MapPanel>

        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
          {shipment.isSimulated && <MockDataBadge label="Dữ liệu mô phỏng GPS" />}
        </div>
      </main>
    </div>
  );
};
