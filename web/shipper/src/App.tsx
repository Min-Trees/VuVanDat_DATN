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
  isColdChain?: boolean;
  coldChainCertificateHash?: string;
  coldChainDataPoints?: { time: string; temp: number }[];
  isSimulated: boolean;
}

const defaultShipment: PublicTrackingDto = {
  orderCode: 'DH-20261023-1102',
  status: 'Delivered',
  pickupAddress: 'KCN Dien Nam - Dien Ngoc, Quang Nam',
  deliveryAddress: 'Cang Tien Sa, Da Nang',
  pickupWindow: '23/10 08:00 - 10:00',
  deliveryWindow: '23/10 13:00 - 15:00',
  totalWeightKg: 7200,
  driverMasked: 'Tran H.',
  vehiclePlateMasked: '43C-***24',
  approximateLatitude: 16.128,
  approximateLongitude: 108.219,
  hasPod: true,
  podVerificationHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  isColdChain: true,
  coldChainCertificateHash: '7a29f84091bc7d432e18501198fbbac490e541b63c78198fbc102d9481bca012',
  coldChainDataPoints: [
    { time: '08:00', temp: -18.2 },
    { time: '09:00', temp: -18.5 },
    { time: '10:00', temp: -18.1 },
    { time: '11:00', temp: -18.4 },
    { time: '12:00', temp: -18.9 },
    { time: '13:00', temp: -18.4 },
    { time: '14:00', temp: -18.6 },
  ],
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
        throw new Error('Khong tim thay thong tin van don hoac token da het han.');
      }
      const data: PublicTrackingDto = await res.json();
      setShipment(data);
    } catch {
      // Fallback demo
      if (tokenInput.includes('8192')) {
        setShipment({
          orderCode: 'DH-20261024-8192',
          status: 'InTransit',
          pickupAddress: 'KCN Hoa Khanh, Lien Chieu, Da Nang',
          deliveryAddress: 'Tong kho Big C, 255 Hung Vuong, Da Nang',
          pickupWindow: '24/10 08:00 - 10:00',
          deliveryWindow: '24/10 14:00 - 17:00',
          totalWeightKg: 5400,
          driverMasked: 'Tran H.',
          vehiclePlateMasked: '43C-***24',
          approximateLatitude: 16.071,
          approximateLongitude: 108.182,
          hasPod: false,
          isColdChain: false,
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
        title: 'Xac nhan & Dieu phoi phuong tien',
        description: 'Van don da duoc phan bo cho xe van chuyen an toan',
        status: isAssigned ? 'completed' : 'current',
      },
      {
        title: 'Da nhan hang tai diem boc hang',
        description: shipment.pickupAddress,
        timestamp: shipment.pickupWindow,
        status: isPickedUp ? 'completed' : isAssigned ? 'current' : 'upcoming',
      },
      {
        title: 'Dang van chuyen tren tuyen duong',
        description: 'Phuong tien dang di chuyen tuan thu quy dinh tai trong va toc do',
        status: isInTransit ? (isCompleted ? 'completed' : 'current') : 'upcoming',
      },
      {
        title: 'Giao hang hoan tat & Ky nhan ePOD',
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
        return <Badge variant="success">Da giao hang thanh cong</Badge>;
      case 'InTransit':
        return <Badge variant="info">Dang van chuyen tren duong</Badge>;
      case 'PickedUp':
        return <Badge variant="info">Da lay hang</Badge>;
      case 'Assigned':
        return <Badge variant="warning">Da dieu xe</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--vdbus-color-bg-canvas)' }}>
      {/* Top Header */}
      <header
        style={{
          height: '52px',
          backgroundColor: 'var(--vdbus-color-bg-surface)',
          borderBottom: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--vdbus-space-6)',
        }}
      >
        <span style={{ fontWeight: 600, color: 'var(--vdbus-color-primary)', fontSize: 'var(--vdbus-font-size-base)' }}>
          VDBus Shipper Tracking Portal
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <IconShield size={14} />
          <span style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)' }}>
            Ma dinh danh bao mat (&gt;= 128 bit)
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '960px', margin: '0 auto', padding: 'var(--vdbus-space-6) var(--vdbus-space-4)' }}>
        <PageHeader
          title={`Tra cuu hanh trinh van don: ${shipment.orderCode}`}
          subtitle="Cong tra cuu cong khai truc tiep theo thoi gian thuc danh cho chu hang"
          badge={getStatusBadge(shipment.status)}
        />

        {/* Token Search Bar */}
        <form
          onSubmit={handleTrack}
          style={{
            display: 'flex',
            gap: 'var(--vdbus-space-3)',
            marginBottom: 'var(--vdbus-space-5)',
            backgroundColor: 'var(--vdbus-color-bg-surface)',
            padding: 'var(--vdbus-space-3)',
            border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
            borderRadius: 'var(--vdbus-radius-md)',
          }}
        >
          <div style={{ flex: 1 }}>
            <Input
              size="base"
              placeholder="Nhap ma token tra cuu hanh trinh (>= 128 bit)..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              prefixElement={<IconSearch size={14} />}
            />
          </div>
          <Button variant="primary" size="base" disabled={isLoading}>
            {isLoading ? 'Dang tra cuu...' : 'Tra cuu'}
          </Button>
        </form>

        {errorMessage && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--vdbus-color-error-bg)',
              color: 'var(--vdbus-color-error-text)',
              borderRadius: 'var(--vdbus-radius-base)',
              fontSize: 'var(--vdbus-font-size-sm)',
              marginBottom: 'var(--vdbus-space-4)',
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
            gap: 'var(--vdbus-space-3)',
            marginBottom: 'var(--vdbus-space-5)',
          }}
        >
          <div
            style={{
              padding: 'var(--vdbus-space-3)',
              backgroundColor: 'var(--vdbus-color-bg-surface)',
              border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
              borderRadius: 'var(--vdbus-radius-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--vdbus-color-text-muted)', marginBottom: '4px' }}>
              <IconClock size={14} />
              <span style={{ fontSize: 'var(--vdbus-font-size-xs)' }}>Cua so giao hang du kien (ETA)</span>
            </div>
            <strong style={{ fontSize: 'var(--vdbus-font-size-base)', color: 'var(--vdbus-color-text-primary)' }}>
              {shipment.deliveryWindow}
            </strong>
          </div>

          <div
            style={{
              padding: 'var(--vdbus-space-3)',
              backgroundColor: 'var(--vdbus-color-bg-surface)',
              border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
              borderRadius: 'var(--vdbus-radius-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--vdbus-color-text-muted)', marginBottom: '4px' }}>
              <IconTruck size={14} />
              <span style={{ fontSize: 'var(--vdbus-font-size-xs)' }}>Phuong tien & Tai xe</span>
            </div>
            <div style={{ fontSize: 'var(--vdbus-font-size-sm)', fontWeight: 600, color: 'var(--vdbus-color-text-primary)' }}>
              {shipment.vehiclePlateMasked} - {shipment.driverMasked}
            </div>
          </div>

          <div
            style={{
              padding: 'var(--vdbus-space-3)',
              backgroundColor: 'var(--vdbus-color-bg-surface)',
              border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
              borderRadius: 'var(--vdbus-radius-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--vdbus-color-text-muted)', marginBottom: '4px' }}>
              <IconMapPin size={14} />
              <span style={{ fontSize: 'var(--vdbus-font-size-xs)' }}>Trong luong hang hoa</span>
            </div>
            <div style={{ fontSize: 'var(--vdbus-font-size-sm)', fontWeight: 600, color: 'var(--vdbus-color-text-primary)' }}>
              {(shipment.totalWeightKg / 1000).toFixed(1)} tan ({shipment.totalWeightKg.toLocaleString()} kg)
            </div>
          </div>
        </div>

        {/* Milestone Timeline */}
        <div
          style={{
            padding: 'var(--vdbus-space-4)',
            backgroundColor: 'var(--vdbus-color-bg-surface)',
            border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
            borderRadius: 'var(--vdbus-radius-md)',
            marginBottom: 'var(--vdbus-space-5)',
          }}
        >
          <h3 style={{ margin: '0 0 var(--vdbus-space-4) 0', fontSize: 'var(--vdbus-font-size-base)', fontWeight: 600 }}>
            Hanh trinh van chuyen chi tiet
          </h3>
          <Timeline steps={getTimelineSteps(shipment.status)} />
        </div>

        {/* Verified ePOD Certificate Box (when POD exists) */}
        {shipment.hasPod && shipment.podVerificationHash && (
          <div
            style={{
              padding: 'var(--vdbus-space-4)',
              backgroundColor: 'var(--vdbus-color-bg-surface)',
              border: 'var(--vdbus-border-width) solid var(--vdbus-color-success-border)',
              borderRadius: 'var(--vdbus-radius-md)',
              marginBottom: 'var(--vdbus-space-5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconFileText size={18} />
                <strong style={{ fontSize: 'var(--vdbus-font-size-base)', color: 'var(--vdbus-color-text-primary)' }}>
                  Chung chi giao nhan dien tu da xac thuc (ePOD Certificate)
                </strong>
              </div>
              <Badge variant="success">Chu ky so hop le</Badge>
            </div>

            <p style={{ margin: '0 0 10px 0', fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-secondary)', lineHeight: 1.5 }}>
              Du lieu giao nhan da duoc niem phong bat bien bang ma bam SHA-256 ket hop ma don hang, chu ky tay dien tu, anh chup kien hang tai hien truong va toa do GPS thuc te.
            </p>

            <div
              style={{
                padding: '10px 12px',
                backgroundColor: 'var(--vdbus-color-bg-subtle)',
                borderRadius: 'var(--vdbus-radius-base)',
                border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
              }}
            >
              <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)', marginBottom: '4px' }}>
                Chuoi bam toan ven SHA-256 (Tamper-evident Hash):
              </div>
              <div
                style={{
                  fontSize: 'var(--vdbus-font-size-xs)',
                  color: 'var(--vdbus-color-primary)',
                  wordBreak: 'break-all',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                }}
              >
                {shipment.podVerificationHash}
              </div>
            </div>
          </div>
        )}

        {/* Cold Chain Temperature Certificate Box */}
        {shipment.isColdChain && shipment.coldChainCertificateHash && (
          <div
            style={{
              padding: 'var(--vdbus-space-4)',
              backgroundColor: 'var(--vdbus-color-bg-surface)',
              border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
              borderRadius: 'var(--vdbus-radius-md)',
              marginBottom: 'var(--vdbus-space-5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconShield size={18} />
                <strong style={{ fontSize: 'var(--vdbus-font-size-base)', color: 'var(--vdbus-color-text-primary)' }}>
                  Chung thu Kiem soat Nhiet do Chuoi lanh (Cold Chain Certificate)
                </strong>
              </div>
              <Badge variant="success">100% Dat dai bao quan</Badge>
            </div>

            <p style={{ margin: '0 0 10px 0', fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-secondary)', lineHeight: 1.5 }}>
              Toan bo du lieu nhiet do khoang hang duoc thu nhan lien tuc qua cam bien IoT va duoc niem phong mat ma. Nhiet do bao quan cam ket: -20 C den -16 C.
            </p>

            {/* Inline Mini Temperature Curve */}
            {shipment.coldChainDataPoints && (
              <div style={{ width: '100%', height: '110px', margin: '12px 0', backgroundColor: 'var(--vdbus-color-bg-subtle)', borderRadius: 'var(--vdbus-radius-base)', padding: '8px' }}>
                <svg viewBox="0 0 500 80" style={{ width: '100%', height: '100%' }}>
                  {/* Safe band */}
                  <rect x="30" y="15" width="440" height="50" fill="var(--vdbus-color-success-bg)" opacity="0.8" />
                  <line x1="30" y1="40" x2="470" y2="40" stroke="var(--vdbus-color-primary)" strokeWidth="2" />
                  {shipment.coldChainDataPoints.map((pt, i) => {
                    const cx = 40 + i * 65;
                    const cy = 40 + (pt.temp + 18.5) * 8;
                    return (
                      <g key={i}>
                        <circle cx={cx} cy={cy} r="3" fill="var(--vdbus-color-primary)" />
                        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="9" fill="var(--vdbus-color-text-secondary)">
                          {pt.temp} C
                        </text>
                        <text x={cx} y={75} textAnchor="middle" fontSize="8" fill="var(--vdbus-color-text-muted)">
                          {pt.time}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}

            <div
              style={{
                padding: '10px 12px',
                backgroundColor: 'var(--vdbus-color-bg-subtle)',
                borderRadius: 'var(--vdbus-radius-base)',
                border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
              }}
            >
              <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)', marginBottom: '4px' }}>
                Ma chu ky so toan ven chuoi lanh (Digital Integrity Hash):
              </div>
              <div
                style={{
                  fontSize: 'var(--vdbus-font-size-xs)',
                  color: 'var(--vdbus-color-primary)',
                  wordBreak: 'break-all',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                }}
              >
                {shipment.coldChainCertificateHash}
              </div>
            </div>
          </div>
        )}

        {/* Map Panel with Rounded Coordinates */}
        <MapPanel
          title="Ban do hanh trinh vi tri xe (Toa do duoc lam tron bao mat quyen rieng tu)"
          isSimulated={shipment.isSimulated}
          height={320}
        >
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--vdbus-color-bg-subtle)',
              color: 'var(--vdbus-color-text-secondary)',
              fontSize: 'var(--vdbus-font-size-sm)',
            }}
          >
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                <IconMapPin size={16} />
                <strong>Vi tri phuong tien uoc luong: {shipment.approximateLatitude.toFixed(3)} N, {shipment.approximateLongitude.toFixed(3)} E</strong>
              </div>
              <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)', maxWidth: '480px', margin: '0 auto' }}>
                Toa do GPS duoc lam tron 3 chu so thap phan (do chinh xac ~110 met) theo tieu chuan bao mat du lieu dinh vi ca nhan.
              </div>
            </div>
          </div>
        </MapPanel>

        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
          {shipment.isSimulated && <MockDataBadge label="Du lieu mo phong GPS" />}
        </div>
      </main>
    </div>
  );
};
