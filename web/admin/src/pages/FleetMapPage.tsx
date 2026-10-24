import React, { useEffect, useState, useMemo, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import {
  PageHeader,
  Button,
  Badge,
  MockDataBadge,
  Input,
  Select,
  MapPanel,
  TemperatureGauge,
  AxleSchema,
  AxleInfo,
  IconSearch,
  IconRefresh,
  IconTruck,
  IconRadio,
  IconClock,
  IconAlertTriangle,
} from '@vdbus/design-system';

export interface VehicleTelemetryItem {
  id: string;
  licensePlate: string;
  vehicleType: string;
  makeModel: string;
  driverName: string;
  latitude: number;
  longitude: number;
  speedKmh: number;
  headingDegrees: number;
  status: 'Moving' | 'Stopped' | 'Offline';
  temperatureCelsius?: number;
  humidityPercentage?: number;
  fuelLevelPercentage?: number;
  isDoorOpen?: boolean;
  axleCount: number;
  axles: AxleInfo[];
  lastUpdatedUtc: string;
  isSimulated: boolean;
}

interface GeofenceMarker {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

const initialGeofences: GeofenceMarker[] = [
  { id: 'geo-1', name: 'Kho Tổng Miền Bắc (Hà Nội)', type: 'Warehouse', latitude: 21.0185, longitude: 105.8442, radiusMeters: 500 },
  { id: 'geo-2', name: 'Cảng Cát Lái (TP. Hồ Chí Minh)', type: 'Port', latitude: 10.7626, longitude: 106.7744, radiusMeters: 1000 },
  { id: 'geo-3', name: 'Kho Hòa Cầm (Đà Nẵng)', type: 'Warehouse', latitude: 16.0244, longitude: 108.1822, radiusMeters: 400 },
  { id: 'geo-4', name: 'Trạm BOT Pháp Vân - Cầu Giẽ', type: 'TollBooth', latitude: 20.8931, longitude: 105.8821, radiusMeters: 200 },
  { id: 'geo-5', name: 'Cảng Đình Vũ (Hải Phòng)', type: 'Port', latitude: 20.8449, longitude: 106.7581, radiusMeters: 800 },
];

const initialVehicles: VehicleTelemetryItem[] = [
  {
    id: 'v1111111-1111-1111-1111-111111111111',
    licensePlate: '43C-189.24',
    vehicleType: 'DryBox',
    makeModel: 'Hino 500 FG8JJ7A (8.5 tấn)',
    driverName: 'Nguyễn Văn Tuấn',
    latitude: 20.8521,
    longitude: 105.9124,
    speedKmh: 64.2,
    headingDegrees: 185,
    status: 'Moving',
    temperatureCelsius: 26.5,
    humidityPercentage: 65,
    fuelLevelPercentage: 78,
    isDoorOpen: false,
    axleCount: 2,
    axles: [
      {
        axleIndex: 1,
        axleType: 'front',
        loadKg: 3400,
        limitKg: 6000,
        tires: [
          { position: 'FL', pressurePsi: 115, tempCelsius: 48, status: 'normal' },
          { position: 'FR', pressurePsi: 116, tempCelsius: 49, status: 'normal' },
        ],
      },
      {
        axleIndex: 2,
        axleType: 'rear',
        loadKg: 6800,
        limitKg: 10000,
        tires: [
          { position: 'RL1', pressurePsi: 118, tempCelsius: 52, status: 'normal' },
          { position: 'RL2', pressurePsi: 117, tempCelsius: 51, status: 'normal' },
          { position: 'RR2', pressurePsi: 118, tempCelsius: 53, status: 'normal' },
          { position: 'RR1', pressurePsi: 117, tempCelsius: 52, status: 'normal' },
        ],
      },
    ],
    lastUpdatedUtc: new Date().toISOString(),
    isSimulated: true,
  },
  {
    id: 'v2222222-2222-2222-2222-222222222222',
    licensePlate: '43H-012.88',
    vehicleType: 'Container',
    makeModel: 'Hyundai HD320 Đầu kéo (30 tấn)',
    driverName: 'Trần Đình Trọng',
    latitude: 16.0355,
    longitude: 108.1950,
    speedKmh: 0.0,
    headingDegrees: 90,
    status: 'Stopped',
    temperatureCelsius: 28.0,
    humidityPercentage: 72,
    fuelLevelPercentage: 54,
    isDoorOpen: true,
    axleCount: 3,
    axles: [
      {
        axleIndex: 1,
        axleType: 'front',
        loadKg: 4200,
        limitKg: 6000,
        tires: [
          { position: 'FL', pressurePsi: 114, tempCelsius: 38, status: 'normal' },
          { position: 'FR', pressurePsi: 113, tempCelsius: 38, status: 'normal' },
        ],
      },
      {
        axleIndex: 2,
        axleType: 'rear',
        loadKg: 8500,
        limitKg: 10000,
        tires: [
          { position: 'RL1', pressurePsi: 98, tempCelsius: 42, status: 'warning' },
          { position: 'RL2', pressurePsi: 116, tempCelsius: 41, status: 'normal' },
          { position: 'RR2', pressurePsi: 115, tempCelsius: 41, status: 'normal' },
          { position: 'RR1', pressurePsi: 116, tempCelsius: 40, status: 'normal' },
        ],
      },
      {
        axleIndex: 3,
        axleType: 'rear',
        loadKg: 8200,
        limitKg: 10000,
        tires: [
          { position: 'R2L1', pressurePsi: 115, tempCelsius: 41, status: 'normal' },
          { position: 'R2L2', pressurePsi: 116, tempCelsius: 40, status: 'normal' },
          { position: 'R2R2', pressurePsi: 116, tempCelsius: 40, status: 'normal' },
          { position: 'R2R1', pressurePsi: 115, tempCelsius: 41, status: 'normal' },
        ],
      },
    ],
    lastUpdatedUtc: new Date().toISOString(),
    isSimulated: true,
  },
  {
    id: 'v3333333-3333-3333-3333-333333333333',
    licensePlate: '43C-225.19',
    vehicleType: 'Refrigerated',
    makeModel: 'Isuzu FVR 900 Thùng lạnh (7.8 tấn)',
    driverName: 'Lê Hoàng Nam',
    latitude: 11.1255,
    longitude: 106.8421,
    speedKmh: 72.8,
    headingDegrees: 210,
    status: 'Moving',
    temperatureCelsius: -19.4,
    humidityPercentage: 88,
    fuelLevelPercentage: 62,
    isDoorOpen: false,
    axleCount: 2,
    axles: [
      {
        axleIndex: 1,
        axleType: 'front',
        loadKg: 3100,
        limitKg: 6000,
        tires: [
          { position: 'FL', pressurePsi: 116, tempCelsius: 44, status: 'normal' },
          { position: 'FR', pressurePsi: 117, tempCelsius: 45, status: 'normal' },
        ],
      },
      {
        axleIndex: 2,
        axleType: 'rear',
        loadKg: 6200,
        limitKg: 10000,
        tires: [
          { position: 'RL1', pressurePsi: 119, tempCelsius: 48, status: 'normal' },
          { position: 'RL2', pressurePsi: 118, tempCelsius: 47, status: 'normal' },
          { position: 'RR2', pressurePsi: 119, tempCelsius: 48, status: 'normal' },
          { position: 'RR1', pressurePsi: 118, tempCelsius: 47, status: 'normal' },
        ],
      },
    ],
    lastUpdatedUtc: new Date().toISOString(),
    isSimulated: true,
  },
  {
    id: 'v4444444-4444-4444-4444-444444444444',
    licensePlate: '92C-156.40',
    vehicleType: 'Refrigerated',
    makeModel: 'Thaco Auman C160 Thùng lạnh (9.1 tấn)',
    driverName: 'Phạm Đức Long',
    latitude: 14.3541,
    longitude: 108.9854,
    speedKmh: 58.5,
    headingDegrees: 170,
    status: 'Moving',
    temperatureCelsius: -13.8, // Warning: higher than -15°C threshold
    humidityPercentage: 82,
    fuelLevelPercentage: 41,
    isDoorOpen: false,
    axleCount: 2,
    axles: [
      {
        axleIndex: 1,
        axleType: 'front',
        loadKg: 3500,
        limitKg: 6000,
        tires: [
          { position: 'FL', pressurePsi: 115, tempCelsius: 47, status: 'normal' },
          { position: 'FR', pressurePsi: 114, tempCelsius: 46, status: 'normal' },
        ],
      },
      {
        axleIndex: 2,
        axleType: 'rear',
        loadKg: 7900,
        limitKg: 10000,
        tires: [
          { position: 'RL1', pressurePsi: 121, tempCelsius: 72, status: 'critical' },
          { position: 'RL2', pressurePsi: 118, tempCelsius: 50, status: 'normal' },
          { position: 'RR2', pressurePsi: 117, tempCelsius: 50, status: 'normal' },
          { position: 'RR1', pressurePsi: 118, tempCelsius: 49, status: 'normal' },
        ],
      },
    ],
    lastUpdatedUtc: new Date().toISOString(),
    isSimulated: true,
  },
];

export const FleetMapPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleTelemetryItem[]>(initialVehicles);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(initialVehicles[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [tempFilter, setTempFilter] = useState('ALL');
  const [isSignalRConnected, setIsSignalRConnected] = useState(false);
  const [lastPingTime, setLastPingTime] = useState<Date>(new Date());
  const hubConnectionRef = useRef<signalR.HubConnection | null>(null);

  // Setup SignalR Hub connection with fallback simulator
  useEffect(() => {
    let isMounted = true;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    const hubUrl = apiUrl.replace(/\/api\/v1\/?$/, '') + '/hubs/telematics';

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => localStorage.getItem('vdbus_access_token') || '',
      })
      .withAutomaticReconnect()
      .build();

    hubConnectionRef.current = connection;

    connection.on('ReceiveTelemetryUpdate', (telemetry: any) => {
      if (!isMounted) return;
      setLastPingTime(new Date());
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.licensePlate.toUpperCase() === telemetry.licensePlate?.toUpperCase() || v.id === telemetry.vehicleId) {
            return {
              ...v,
              latitude: telemetry.latitude ?? v.latitude,
              longitude: telemetry.longitude ?? v.longitude,
              speedKmh: telemetry.speedKmh ?? v.speedKmh,
              headingDegrees: telemetry.headingDegrees ?? v.headingDegrees,
              temperatureCelsius: telemetry.temperatureCelsius ?? v.temperatureCelsius,
              humidityPercentage: telemetry.humidityPercentage ?? v.humidityPercentage,
              fuelLevelPercentage: telemetry.fuelLevelPercentage ?? v.fuelLevelPercentage,
              isDoorOpen: telemetry.isDoorOpen ?? v.isDoorOpen,
              status: (telemetry.speedKmh ?? v.speedKmh) > 2 ? 'Moving' : 'Stopped',
              lastUpdatedUtc: telemetry.recordedAtUtc || new Date().toISOString(),
            };
          }
          return v;
        })
      );
    });

    connection
      .start()
      .then(() => {
        if (!isMounted) return;
        setIsSignalRConnected(true);
        // Join tenant fleet
        const tenantId = '00000000-0000-0000-0000-000000000001';
        connection.invoke('JoinTenantFleet', tenantId).catch(() => {});
      })
      .catch(() => {
        if (!isMounted) return;
        setIsSignalRConnected(false);
      });

    // Fallback Telematics simulator loop (updates coordinates and parameters smoothly)
    const intervalId = setInterval(() => {
      if (!isMounted) return;
      setLastPingTime(new Date());
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.status === 'Moving') {
            // Small GPS jitter along North-South direction
            const dLat = (Math.random() - 0.48) * 0.005;
            const dLng = (Math.random() - 0.5) * 0.003;
            const newSpeed = Math.max(30, Math.min(85, v.speedKmh + (Math.random() - 0.5) * 4));
            const newTemp = v.temperatureCelsius !== undefined
              ? Number((v.temperatureCelsius + (Math.random() - 0.5) * 0.2).toFixed(1))
              : undefined;

            return {
              ...v,
              latitude: Number((v.latitude + dLat).toFixed(6)),
              longitude: Number((v.longitude + dLng).toFixed(6)),
              speedKmh: Number(newSpeed.toFixed(1)),
              temperatureCelsius: newTemp,
              lastUpdatedUtc: new Date().toISOString(),
            };
          }
          return v;
        })
      );
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      if (hubConnectionRef.current) {
        hubConnectionRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Filter vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchSearch =
        v.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.makeModel.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'MOVING' && v.status === 'Moving') ||
        (statusFilter === 'STOPPED' && v.status === 'Stopped');

      let matchTemp = true;
      if (tempFilter === 'FROZEN') {
        matchTemp = v.temperatureCelsius !== undefined && v.temperatureCelsius <= -18;
      } else if (tempFilter === 'CHILLED') {
        matchTemp = v.temperatureCelsius !== undefined && v.temperatureCelsius > -18 && v.temperatureCelsius <= 5;
      } else if (tempFilter === 'WARNING') {
        matchTemp = v.temperatureCelsius !== undefined && v.temperatureCelsius > -15 && v.vehicleType === 'Refrigerated';
      }

      return matchSearch && matchStatus && matchTemp;
    });
  }, [vehicles, searchQuery, statusFilter, tempFilter]);

  const selectedVehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
  }, [vehicles, selectedVehicleId]);

  // Map coordinate projection: converts Vietnam Lat (9.5 to 22.5) & Lng (104.0 to 109.5) to SVG (800x480)
  const mapWidth = 800;
  const mapHeight = 480;
  const projectCoords = (lat: number, lng: number) => {
    const minLat = 9.5;
    const maxLat = 22.5;
    const minLng = 104.0;
    const maxLng = 109.5;
    const x = ((lng - minLng) / (maxLng - minLng)) * (mapWidth - 80) + 40;
    const y = (1 - (lat - minLat) / (maxLat - minLat)) * (mapHeight - 80) + 40;
    return {
      x: Math.max(30, Math.min(mapWidth - 30, x)),
      y: Math.max(30, Math.min(mapHeight - 30, y)),
    };
  };

  return (
    <div style={{ padding: 'var(--vdbus-space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--vdbus-space-4)' }}>
      {/* Page Header */}
      <PageHeader
        title="Bản đồ Giám sát Đội xe Realtime"
        subtitle="Giám sát vị trí GPS, vận tốc, nhiệt độ chuỗi lạnh và tình trạng áp suất lốp theo thời gian thực"
        badge={<MockDataBadge />}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--vdbus-space-2)' }}>
            <Badge variant={isSignalRConnected ? 'success' : 'neutral'}>
              <IconRadio size={12} />
              {isSignalRConnected ? 'SignalR: Trực tuyến' : 'SignalR: Mô phỏng cục bộ'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setVehicles(initialVehicles);
                setLastPingTime(new Date());
              }}
            >
              <IconRefresh size={14} />
              Làm mới
            </Button>
          </div>
        }
      />

      {/* Filter and Query Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--vdbus-space-3)',
          alignItems: 'center',
          backgroundColor: 'var(--vdbus-color-bg-surface)',
          padding: 'var(--vdbus-space-3)',
          borderRadius: 'var(--vdbus-radius-md)',
          border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
        }}
      >
        <div style={{ width: '260px' }}>
          <Input
            size="sm"
            placeholder="Tìm biển số, tài xế..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            prefixElement={<IconSearch size={14} />}
          />
        </div>

        <div style={{ width: '180px' }}>
          <Select
            size="sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'Tất cả trạng thái' },
              { value: 'MOVING', label: 'Đang di chuyển' },
              { value: 'STOPPED', label: 'Đang dừng đỗ' },
            ]}
          />
        </div>

        <div style={{ width: '220px' }}>
          <Select
            size="sm"
            value={tempFilter}
            onChange={(e) => setTempFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'Tất cả chuỗi lạnh' },
              { value: 'FROZEN', label: 'Đông lạnh (<= -18 C)' },
              { value: 'CHILLED', label: 'Hàng mát (0 - 5 C)' },
              { value: 'WARNING', label: 'Cảnh báo nhiệt độ' },
            ]}
          />
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--vdbus-space-2)', fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)' }}>
          <IconClock size={12} />
          <span>Cập nhật: {lastPingTime.toLocaleTimeString('vi-VN')}</span>
          <Badge variant="info">{filteredVehicles.length} phương tiện</Badge>
        </div>
      </div>

      {/* Main Split Layout: Left Vehicle List & Right Map + Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 'var(--vdbus-space-4)', minHeight: '680px' }}>
        {/* Left Side: Fleet Vehicle List */}
        <div
          style={{
            backgroundColor: 'var(--vdbus-color-bg-surface)',
            borderRadius: 'var(--vdbus-radius-md)',
            border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: 'var(--vdbus-space-3)',
              borderBottom: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
              backgroundColor: 'var(--vdbus-color-bg-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <strong style={{ fontSize: 'var(--vdbus-font-size-sm)', color: 'var(--vdbus-color-text-primary)' }}>
              Danh sách phương tiện ({filteredVehicles.length})
            </strong>
          </div>

          <div style={{ overflowY: 'auto', flex: 1, padding: 'var(--vdbus-space-2)', display: 'flex', flexDirection: 'column', gap: 'var(--vdbus-space-2)' }}>
            {filteredVehicles.map((vehicle) => {
              const isSelected = vehicle.id === selectedVehicle?.id;
              const hasTempWarning = vehicle.vehicleType === 'Refrigerated' && vehicle.temperatureCelsius !== undefined && vehicle.temperatureCelsius > -15;
              const hasTireWarning = vehicle.axles.some((a) => a.tires.some((t) => t.status && t.status !== 'normal'));

              return (
                <div
                  key={vehicle.id}
                  onClick={() => setSelectedVehicleId(vehicle.id)}
                  style={{
                    padding: 'var(--vdbus-space-3)',
                    borderRadius: 'var(--vdbus-radius-base)',
                    border: `var(--vdbus-border-width) solid ${isSelected ? 'var(--vdbus-color-primary)' : 'var(--vdbus-color-border-subtle)'}`,
                    backgroundColor: isSelected ? 'var(--vdbus-color-primary-subtle)' : 'var(--vdbus-color-bg-surface)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--vdbus-space-1)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: 'var(--vdbus-font-size-sm)', color: 'var(--vdbus-color-text-primary)' }}>
                      {vehicle.licensePlate}
                    </strong>
                    <Badge variant={vehicle.status === 'Moving' ? 'success' : 'neutral'}>
                      {vehicle.status === 'Moving' ? `${vehicle.speedKmh} km/h` : 'Dừng đỗ'}
                    </Badge>
                  </div>

                  <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)' }}>
                    {vehicle.makeModel}
                  </div>

                  <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-secondary)', display: 'flex', justifyContent: 'space-between', marginTop: 'var(--vdbus-space-1)' }}>
                    <span>Tài xế: {vehicle.driverName}</span>
                    {vehicle.temperatureCelsius !== undefined && (
                      <span style={{ fontWeight: 'var(--vdbus-font-weight-medium)', color: hasTempWarning ? 'var(--vdbus-color-error-text)' : 'var(--vdbus-color-text-primary)' }}>
                        Lạnh: {vehicle.temperatureCelsius} C
                      </span>
                    )}
                  </div>

                  {/* Warning badges */}
                  {(hasTempWarning || hasTireWarning) && (
                    <div style={{ display: 'flex', gap: 'var(--vdbus-space-1)', marginTop: 'var(--vdbus-space-1)' }}>
                      {hasTempWarning && (
                        <Badge variant="error">
                          <IconAlertTriangle size={10} />
                          Nhiệt độ cao
                        </Badge>
                      )}
                      {hasTireWarning && (
                        <Badge variant="warning">
                          <IconAlertTriangle size={10} />
                          Cảnh báo lốp TPMS
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Map & Telemetry Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vdbus-space-4)' }}>
          {/* Realtime GIS / Vector Map View */}
          <MapPanel
            title="Bản đồ GIS Định vị Đội xe Toàn quốc (Hành lang Bắc - Nam)"
            isSimulated={true}
            height={380}
          >
            <svg
              viewBox={`0 0 ${mapWidth} ${mapHeight}`}
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'var(--vdbus-color-bg-subtle)',
                userSelect: 'none',
              }}
            >
              {/* Grid Lines */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--vdbus-color-border-subtle)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Simplified North-South Highway Corridor Line (QL1A & Cao tốc Bắc Nam) */}
              <polyline
                points="210,50 220,120 280,210 330,290 350,380 340,430"
                fill="none"
                stroke="var(--vdbus-color-border-strong)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* Geofences Zones */}
              {initialGeofences.map((geo) => {
                const pt = projectCoords(geo.latitude, geo.longitude);
                return (
                  <g key={geo.id}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="18"
                      fill="var(--vdbus-color-info-bg)"
                      stroke="var(--vdbus-color-info-border)"
                      strokeWidth="1.5"
                      opacity="0.75"
                    />
                    <text
                      x={pt.x}
                      y={pt.y + 28}
                      textAnchor="middle"
                      fontSize="10"
                      fill="var(--vdbus-color-text-secondary)"
                      fontFamily="sans-serif"
                    >
                      {geo.name}
                    </text>
                  </g>
                );
              })}

              {/* Vehicles Pins on Map */}
              {vehicles.map((v) => {
                const pt = projectCoords(v.latitude, v.longitude);
                const isSelected = v.id === selectedVehicle?.id;
                const isMoving = v.status === 'Moving';

                return (
                  <g
                    key={v.id}
                    onClick={() => setSelectedVehicleId(v.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Selected vehicle pulsing ring */}
                    {isSelected && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="18"
                        fill="none"
                        stroke="var(--vdbus-color-primary)"
                        strokeWidth="2"
                        strokeDasharray="2 2"
                      />
                    )}

                    {/* Marker circle */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="10"
                      fill={isMoving ? 'var(--vdbus-color-success-text)' : 'var(--vdbus-color-text-muted)'}
                      stroke="var(--vdbus-color-bg-surface)"
                      strokeWidth="2"
                    />

                    {/* Inner direction dot */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="3"
                      fill="var(--vdbus-color-bg-surface)"
                    />

                    {/* License Plate Label Callout */}
                    <rect
                      x={pt.x - 36}
                      y={pt.y - 28}
                      width="72"
                      height="16"
                      rx="3"
                      fill="var(--vdbus-color-bg-surface)"
                      stroke={isSelected ? 'var(--vdbus-color-primary)' : 'var(--vdbus-color-border-default)'}
                      strokeWidth="1"
                    />
                    <text
                      x={pt.x}
                      y={pt.y - 16}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="bold"
                      fill={isSelected ? 'var(--vdbus-color-primary)' : 'var(--vdbus-color-text-primary)'}
                      fontFamily="monospace"
                    >
                      {v.licensePlate}
                    </text>
                  </g>
                );
              })}
            </svg>
          </MapPanel>

          {/* Selected Vehicle Telemetry Card */}
          {selectedVehicle && (
            <div
              style={{
                backgroundColor: 'var(--vdbus-color-bg-surface)',
                borderRadius: 'var(--vdbus-radius-md)',
                border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
                padding: 'var(--vdbus-space-4)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--vdbus-space-4)',
              }}
            >
              {/* Telemetry Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
                  paddingBottom: 'var(--vdbus-space-3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--vdbus-space-2)' }}>
                  <IconTruck size={20} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: 'var(--vdbus-font-size-md)', color: 'var(--vdbus-color-text-primary)' }}>
                      {selectedVehicle.licensePlate} - {selectedVehicle.makeModel}
                    </h3>
                    <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)' }}>
                      Tài xế: {selectedVehicle.driverName} | Tọa độ: {selectedVehicle.latitude.toFixed(4)} N, {selectedVehicle.longitude.toFixed(4)} E
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--vdbus-space-2)' }}>
                  <Badge variant={selectedVehicle.status === 'Moving' ? 'success' : 'neutral'}>
                    {selectedVehicle.status === 'Moving' ? 'Đang chạy trên đường' : 'Đang dừng / đỗ xe'}
                  </Badge>
                  <MockDataBadge />
                </div>
              </div>

              {/* Metrics Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 'var(--vdbus-space-3)',
                }}
              >
                <div
                  style={{
                    padding: 'var(--vdbus-space-3)',
                    backgroundColor: 'var(--vdbus-color-bg-subtle)',
                    borderRadius: 'var(--vdbus-radius-base)',
                  }}
                >
                  <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)' }}>Vận tốc GPS</div>
                  <div style={{ fontSize: 'var(--vdbus-font-size-lg)', fontWeight: 'var(--vdbus-font-weight-semibold)', color: 'var(--vdbus-color-text-primary)' }}>
                    {selectedVehicle.speedKmh} <span style={{ fontSize: 'var(--vdbus-font-size-xs)' }}>km/h</span>
                  </div>
                </div>

                <div
                  style={{
                    padding: 'var(--vdbus-space-3)',
                    backgroundColor: 'var(--vdbus-color-bg-subtle)',
                    borderRadius: 'var(--vdbus-radius-base)',
                  }}
                >
                  <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)' }}>Mức nhiên liệu</div>
                  <div style={{ fontSize: 'var(--vdbus-font-size-lg)', fontWeight: 'var(--vdbus-font-weight-semibold)', color: 'var(--vdbus-color-text-primary)' }}>
                    {selectedVehicle.fuelLevelPercentage}%
                  </div>
                </div>

                <div
                  style={{
                    padding: 'var(--vdbus-space-3)',
                    backgroundColor: 'var(--vdbus-color-bg-subtle)',
                    borderRadius: 'var(--vdbus-radius-base)',
                  }}
                >
                  <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)' }}>Cảm biến cửa thùng</div>
                  <div style={{ fontSize: 'var(--vdbus-font-size-lg)', fontWeight: 'var(--vdbus-font-weight-semibold)', color: selectedVehicle.isDoorOpen ? 'var(--vdbus-color-warning-text)' : 'var(--vdbus-color-success-text)' }}>
                    {selectedVehicle.isDoorOpen ? 'ĐANG MỞ' : 'ĐÃ ĐÓNG'}
                  </div>
                </div>

                <div
                  style={{
                    padding: 'var(--vdbus-space-3)',
                    backgroundColor: 'var(--vdbus-color-bg-subtle)',
                    borderRadius: 'var(--vdbus-radius-base)',
                  }}
                >
                  <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)' }}>Hướng di chuyển</div>
                  <div style={{ fontSize: 'var(--vdbus-font-size-lg)', fontWeight: 'var(--vdbus-font-weight-semibold)', color: 'var(--vdbus-color-text-primary)' }}>
                    {selectedVehicle.headingDegrees} deg
                  </div>
                </div>
              </div>

              {/* Advanced IoT Gauges: Cold Chain & Axle TPMS Schema */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: selectedVehicle.temperatureCelsius !== undefined ? '1fr 1.6fr' : '1fr',
                  gap: 'var(--vdbus-space-4)',
                  alignItems: 'start',
                }}
              >
                {/* Cold Chain Gauge (if applicable) */}
                {selectedVehicle.temperatureCelsius !== undefined && (
                  <div
                    style={{
                      border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
                      borderRadius: 'var(--vdbus-radius-md)',
                      padding: 'var(--vdbus-space-3)',
                    }}
                  >
                    <TemperatureGauge
                      temperature={selectedVehicle.temperatureCelsius}
                      targetMin={-20}
                      targetMax={-16}
                      isSimulated={selectedVehicle.isSimulated}
                    />
                  </div>
                )}

                {/* Tire Pressure & Temperature (TPMS) Axle Schema */}
                <div
                  style={{
                    border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
                    borderRadius: 'var(--vdbus-radius-md)',
                    padding: 'var(--vdbus-space-3)',
                  }}
                >
                  <AxleSchema
                    axleCount={selectedVehicle.axleCount}
                    axles={selectedVehicle.axles}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
