import React, { useState, useMemo } from 'react';
import {
  PageHeader,
  Button,
  Tabs,
  Badge,
  MockDataBadge,
  Select,
  DataTable,
  Column,
  TemperatureGauge,
  AxleSchema,
  AxleInfo,
  IconRefresh,
  IconAlertTriangle,
} from '@vdbus/design-system';

interface ColdChainPoint {
  time: string;
  temperatureCelsius: number;
  humidityPercentage: number;
  isExcursion: boolean;
}

interface ColdChainVehicle {
  id: string;
  licensePlate: string;
  driverName: string;
  vehicleType: string;
  targetMin: number;
  targetMax: number;
  currentTemp: number;
  humidity: number;
  reeferStatus: 'Running' | 'Standby' | 'Defrost';
  sensorId: string;
  dataPoints: ColdChainPoint[];
  excursions: {
    id: string;
    recordedAt: string;
    temperatureCelsius: number;
    threshold: string;
    deviation: string;
    durationMinutes: number;
    status: 'Resolved' | 'Investigating';
  }[];
}

interface TpmsVehicle {
  id: string;
  licensePlate: string;
  makeModel: string;
  driverName: string;
  axleCount: number;
  axles: AxleInfo[];
  alerts: {
    id: string;
    tirePosition: string;
    pressurePsi: number;
    tempCelsius: number;
    alertType: 'LowPressure' | 'HighPressure' | 'HighTemp';
    recordedAt: string;
    status: 'Active' | 'Acknowledged';
  }[];
}

const mockColdChainVehicles: ColdChainVehicle[] = [
  {
    id: 'cc-1',
    licensePlate: '43C-225.19',
    driverName: 'Lê Hoàng Nam',
    vehicleType: 'Isuzu FVR 900 Thùng đông lạnh (-18 C)',
    targetMin: -20,
    targetMax: -16,
    currentTemp: -18.6,
    humidity: 86,
    reeferStatus: 'Running',
    sensorId: 'IOT-SENS-7712',
    dataPoints: [
      { time: '08:00', temperatureCelsius: -18.2, humidityPercentage: 85, isExcursion: false },
      { time: '09:00', temperatureCelsius: -18.5, humidityPercentage: 86, isExcursion: false },
      { time: '10:00', temperatureCelsius: -18.1, humidityPercentage: 84, isExcursion: false },
      { time: '11:00', temperatureCelsius: -17.8, humidityPercentage: 85, isExcursion: false },
      { time: '12:00', temperatureCelsius: -18.9, humidityPercentage: 87, isExcursion: false },
      { time: '13:00', temperatureCelsius: -18.4, humidityPercentage: 86, isExcursion: false },
      { time: '14:00', temperatureCelsius: -18.6, humidityPercentage: 86, isExcursion: false },
    ],
    excursions: [
      {
        id: 'exc-1',
        recordedAt: '2026-10-24 06:15',
        temperatureCelsius: -14.2,
        threshold: '<= -16 C',
        deviation: '+1.8 C',
        durationMinutes: 18,
        status: 'Resolved',
      },
    ],
  },
  {
    id: 'cc-2',
    licensePlate: '92C-156.40',
    driverName: 'Phạm Đức Long',
    vehicleType: 'Thaco Auman C160 Thùng lạnh thịt tươi (-18 C)',
    targetMin: -20,
    targetMax: -16,
    currentTemp: -13.8, // Excursion alert
    humidity: 82,
    reeferStatus: 'Running',
    sensorId: 'IOT-SENS-8890',
    dataPoints: [
      { time: '08:00', temperatureCelsius: -18.0, humidityPercentage: 84, isExcursion: false },
      { time: '09:00', temperatureCelsius: -17.5, humidityPercentage: 83, isExcursion: false },
      { time: '10:00', temperatureCelsius: -16.2, humidityPercentage: 81, isExcursion: false },
      { time: '11:00', temperatureCelsius: -14.8, humidityPercentage: 80, isExcursion: true },
      { time: '12:00', temperatureCelsius: -14.2, humidityPercentage: 81, isExcursion: true },
      { time: '13:00', temperatureCelsius: -13.9, humidityPercentage: 82, isExcursion: true },
      { time: '14:00', temperatureCelsius: -13.8, humidityPercentage: 82, isExcursion: true },
    ],
    excursions: [
      {
        id: 'exc-2',
        recordedAt: '2026-10-24 11:20',
        temperatureCelsius: -13.8,
        threshold: '<= -16 C',
        deviation: '+2.2 C',
        durationMinutes: 160,
        status: 'Investigating',
      },
    ],
  },
];

const mockTpmsVehicles: TpmsVehicle[] = [
  {
    id: 'tpms-1',
    licensePlate: '43H-012.88',
    makeModel: 'Hyundai HD320 Đầu kéo (3 trục)',
    driverName: 'Trần Đình Trọng',
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
    alerts: [
      {
        id: 'tpms-alt-1',
        tirePosition: 'Trục 2 - Trái Ngoài (RL1)',
        pressurePsi: 98,
        tempCelsius: 42,
        alertType: 'LowPressure',
        recordedAt: '2026-10-24 13:45',
        status: 'Active',
      },
    ],
  },
  {
    id: 'tpms-2',
    licensePlate: '92C-156.40',
    makeModel: 'Thaco Auman C160 Thùng lạnh (2 trục)',
    driverName: 'Phạm Đức Long',
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
          { position: 'RL1', pressurePsi: 121, tempCelsius: 74, status: 'critical' },
          { position: 'RL2', pressurePsi: 118, tempCelsius: 50, status: 'normal' },
          { position: 'RR2', pressurePsi: 117, tempCelsius: 50, status: 'normal' },
          { position: 'RR1', pressurePsi: 118, tempCelsius: 49, status: 'normal' },
        ],
      },
    ],
    alerts: [
      {
        id: 'tpms-alt-2',
        tirePosition: 'Trục 2 - Trái Ngoài (RL1)',
        pressurePsi: 121,
        tempCelsius: 74,
        alertType: 'HighTemp',
        recordedAt: '2026-10-24 14:10',
        status: 'Active',
      },
    ],
  },
];

export const ColdChainTpmsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cold-chain' | 'tpms'>('cold-chain');
  const [selectedCcVehicleId, setSelectedCcVehicleId] = useState<string>(mockColdChainVehicles[0].id);
  const [selectedTpmsVehicleId, setSelectedTpmsVehicleId] = useState<string>(mockTpmsVehicles[0].id);

  const selectedCcVehicle = useMemo(() => {
    return mockColdChainVehicles.find((v) => v.id === selectedCcVehicleId) || mockColdChainVehicles[0];
  }, [selectedCcVehicleId]);

  const selectedTpmsVehicle = useMemo(() => {
    return mockTpmsVehicles.find((v) => v.id === selectedTpmsVehicleId) || mockTpmsVehicles[0];
  }, [selectedTpmsVehicleId]);

  // Excursion table columns
  const excursionColumns: Column<ColdChainVehicle['excursions'][0]>[] = [
    { key: 'recordedAt', header: 'Thời gian', width: 140 },
    {
      key: 'temperatureCelsius',
      header: 'Nhiệt độ ghi nhận',
      render: (val) => <strong style={{ color: 'var(--vdbus-color-error-text)' }}>{val} C</strong>,
    },
    { key: 'threshold', header: 'Ngưỡng quy định', width: 120 },
    { key: 'deviation', header: 'Độ lệch (+/-)', width: 100 },
    { key: 'durationMinutes', header: 'Thời lượng (phút)', width: 120, isNumeric: true },
    {
      key: 'status',
      header: 'Trạng thái xử lý',
      render: (val) => (
        <Badge variant={val === 'Resolved' ? 'success' : 'error'}>
          {val === 'Resolved' ? 'Đã khắc phục' : 'Đang xử lý khẩn'}
        </Badge>
      ),
    },
  ];

  // TPMS alerts table columns
  const tpmsAlertColumns: Column<TpmsVehicle['alerts'][0]>[] = [
    { key: 'recordedAt', header: 'Thời gian', width: 140 },
    { key: 'tirePosition', header: 'Vị trí lốp' },
    {
      key: 'pressurePsi',
      header: 'Áp suất',
      render: (val, row) => (
        <span style={{ color: row.alertType === 'LowPressure' ? 'var(--vdbus-color-warning-text)' : 'inherit', fontWeight: 'var(--vdbus-font-weight-medium)' }}>
          {val} PSI
        </span>
      ),
    },
    {
      key: 'tempCelsius',
      header: 'Nhiệt độ lốp',
      render: (val, row) => (
        <span style={{ color: row.alertType === 'HighTemp' ? 'var(--vdbus-color-error-text)' : 'inherit', fontWeight: 'var(--vdbus-font-weight-medium)' }}>
          {val} C
        </span>
      ),
    },
    {
      key: 'alertType',
      header: 'Loại cảnh báo',
      render: (val) => {
        if (val === 'LowPressure') return <Badge variant="warning">Áp suất thấp (Non hơi)</Badge>;
        if (val === 'HighTemp') return <Badge variant="error">Nhiệt độ lốp quá cao</Badge>;
        return <Badge variant="warning">Áp suất cao</Badge>;
      },
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (val) => (
        <Badge variant={val === 'Active' ? 'error' : 'neutral'}>
          {val === 'Active' ? 'Đang cảnh báo' : 'Đã xác nhận'}
        </Badge>
      ),
    },
  ];

  // SVG Chart Dimensions for Temperature Timeline
  const chartWidth = 640;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  // Compute points for SVG path
  const minChartTemp = -24;
  const maxChartTemp = -10;
  const getSvgY = (temp: number) => {
    const ratio = (temp - minChartTemp) / (maxChartTemp - minChartTemp);
    return chartHeight - paddingY - ratio * (chartHeight - 2 * paddingY);
  };
  const getSvgX = (index: number, total: number) => {
    return paddingX + (index / (total - 1)) * (chartWidth - 2 * paddingX);
  };

  const polylinePoints = selectedCcVehicle.dataPoints
    .map((dp, i) => `${getSvgX(i, selectedCcVehicle.dataPoints.length)},${getSvgY(dp.temperatureCelsius)}`)
    .join(' ');

  const targetBandTop = getSvgY(selectedCcVehicle.targetMax);
  const targetBandBottom = getSvgY(selectedCcVehicle.targetMin);

  return (
    <div style={{ padding: 'var(--vdbus-space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--vdbus-space-4)' }}>
      {/* Header */}
      <PageHeader
        title="Giám sát Chuỗi lạnh & Áp suất lốp TPMS"
        subtitle="Hệ thống phân tích cảm biến IoT: đo lường nhiệt độ thùng hàng đông lạnh và an toàn áp suất/nhiệt độ lốp xe"
        badge={<MockDataBadge />}
        actions={
          <Button variant="outline" size="sm">
            <IconRefresh size={14} />
            Làm mới dữ liệu IoT
          </Button>
        }
      />

      {/* Main Tabs */}
      <Tabs
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as 'cold-chain' | 'tpms')}
        items={[
          { id: 'cold-chain', label: 'Giám sát Chuỗi lạnh (Cold Chain)', count: mockColdChainVehicles.length },
          { id: 'tpms', label: 'Áp suất & Nhiệt độ lốp (TPMS)', count: mockTpmsVehicles.length },
        ]}
      />

      {/* TAB 1: COLD CHAIN VIEW */}
      {activeTab === 'cold-chain' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vdbus-space-4)' }}>
          {/* Vehicle Selector Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--vdbus-space-3)',
              backgroundColor: 'var(--vdbus-color-bg-surface)',
              padding: 'var(--vdbus-space-3)',
              borderRadius: 'var(--vdbus-radius-md)',
              border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
            }}
          >
            <span style={{ fontSize: 'var(--vdbus-font-size-sm)', fontWeight: 'var(--vdbus-font-weight-medium)', color: 'var(--vdbus-color-text-primary)' }}>
              Chọn xe đông lạnh:
            </span>
            <div style={{ width: '320px' }}>
              <Select
                size="sm"
                value={selectedCcVehicleId}
                onChange={(e) => setSelectedCcVehicleId(e.target.value)}
                options={mockColdChainVehicles.map((v) => ({
                  value: v.id,
                  label: `${v.licensePlate} - ${v.driverName} (${v.currentTemp} C)`,
                }))}
              />
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--vdbus-space-2)' }}>
              <Badge variant={selectedCcVehicle.currentTemp > selectedCcVehicle.targetMax ? 'error' : 'success'}>
                {selectedCcVehicle.currentTemp > selectedCcVehicle.targetMax ? 'Vượt ngưỡng an toàn' : 'Nhiệt độ đạt chuẩn'}
              </Badge>
              <Badge variant="info">Mã cảm biến: {selectedCcVehicle.sensorId}</Badge>
            </div>
          </div>

          {/* Upper Grid: Gauge & Live Status Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 'var(--vdbus-space-4)' }}>
            {/* Live Temperature Gauge */}
            <div
              style={{
                backgroundColor: 'var(--vdbus-color-bg-surface)',
                borderRadius: 'var(--vdbus-radius-md)',
                border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
                padding: 'var(--vdbus-space-4)',
              }}
            >
              <TemperatureGauge
                temperature={selectedCcVehicle.currentTemp}
                targetMin={selectedCcVehicle.targetMin}
                targetMax={selectedCcVehicle.targetMax}
                label={`Nhiệt độ thùng xe: ${selectedCcVehicle.licensePlate}`}
                isSimulated={true}
              />

              <div style={{ marginTop: 'var(--vdbus-space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--vdbus-space-2)', fontSize: 'var(--vdbus-font-size-xs)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--vdbus-color-text-secondary)' }}>
                  <span>Dải tiêu chuẩn yêu cầu:</span>
                  <strong style={{ color: 'var(--vdbus-color-text-primary)' }}>{selectedCcVehicle.targetMin} C đến {selectedCcVehicle.targetMax} C</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--vdbus-color-text-secondary)' }}>
                  <span>Độ ẩm khoang lạnh:</span>
                  <strong style={{ color: 'var(--vdbus-color-text-primary)' }}>{selectedCcVehicle.humidity}%</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--vdbus-color-text-secondary)' }}>
                  <span>Trạng thái máy lạnh:</span>
                  <Badge variant="success">Hoạt động bình thường</Badge>
                </div>
              </div>
            </div>

            {/* Time-Series Temperature Chart */}
            <div
              style={{
                backgroundColor: 'var(--vdbus-color-bg-surface)',
                borderRadius: 'var(--vdbus-radius-md)',
                border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
                padding: 'var(--vdbus-space-4)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--vdbus-space-2)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: 'var(--vdbus-font-size-sm)', color: 'var(--vdbus-color-text-primary)' }}>
                  Biểu đồ biến thiên nhiệt độ theo thời gian (Hôm nay)
                </strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--vdbus-space-3)', fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '12px', height: '8px', backgroundColor: 'var(--vdbus-color-success-bg)', border: '1px solid var(--vdbus-color-success-border)' }} />
                    Dải an toàn (-20 C đến -16 C)
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '12px', height: '2px', backgroundColor: 'var(--vdbus-color-primary)' }} />
                    Nhiệt độ thực tế
                  </span>
                </div>
              </div>

              {/* SVG Line Chart */}
              <div style={{ width: '100%', height: '220px', overflow: 'hidden' }}>
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '100%' }}>
                  {/* Grid Lines */}
                  <line x1={paddingX} y1={getSvgY(-16)} x2={chartWidth - paddingX} y2={getSvgY(-16)} stroke="var(--vdbus-color-border-subtle)" strokeDasharray="3 3" />
                  <line x1={paddingX} y1={getSvgY(-20)} x2={chartWidth - paddingX} y2={getSvgY(-20)} stroke="var(--vdbus-color-border-subtle)" strokeDasharray="3 3" />

                  {/* Target Safe Band Rectangle */}
                  <rect
                    x={paddingX}
                    y={targetBandTop}
                    width={chartWidth - 2 * paddingX}
                    height={targetBandBottom - targetBandTop}
                    fill="var(--vdbus-color-success-bg)"
                    opacity="0.65"
                  />

                  {/* Polyline of Temperature */}
                  <polyline
                    fill="none"
                    stroke="var(--vdbus-color-primary)"
                    strokeWidth="2.5"
                    points={polylinePoints}
                  />

                  {/* Data Points */}
                  {selectedCcVehicle.dataPoints.map((dp, i) => {
                    const cx = getSvgX(i, selectedCcVehicle.dataPoints.length);
                    const cy = getSvgY(dp.temperatureCelsius);
                    const isExcursion = dp.temperatureCelsius > selectedCcVehicle.targetMax || dp.temperatureCelsius < selectedCcVehicle.targetMin;

                    return (
                      <g key={i}>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isExcursion ? '5' : '3.5'}
                          fill={isExcursion ? 'var(--vdbus-color-error-text)' : 'var(--vdbus-color-primary)'}
                          stroke="var(--vdbus-color-bg-surface)"
                          strokeWidth="1.5"
                        />
                        <text
                          x={cx}
                          y={chartHeight - 8}
                          textAnchor="middle"
                          fontSize="10"
                          fill="var(--vdbus-color-text-muted)"
                          fontFamily="sans-serif"
                        >
                          {dp.time}
                        </text>
                        <text
                          x={cx}
                          y={cy - 8}
                          textAnchor="middle"
                          fontSize="9"
                          fontWeight="bold"
                          fill={isExcursion ? 'var(--vdbus-color-error-text)' : 'var(--vdbus-color-text-secondary)'}
                          fontFamily="monospace"
                        >
                          {dp.temperatureCelsius} C
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>

          {/* Excursions Log Table */}
          <div
            style={{
              backgroundColor: 'var(--vdbus-color-bg-surface)',
              borderRadius: 'var(--vdbus-radius-md)',
              border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
              padding: 'var(--vdbus-space-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--vdbus-space-3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--vdbus-space-2)' }}>
                <IconAlertTriangle size={16} />
                <strong style={{ fontSize: 'var(--vdbus-font-size-sm)', color: 'var(--vdbus-color-text-primary)' }}>
                  Nhật ký cảnh báo nhiệt độ vượt ngưỡng (Excursion Log)
                </strong>
              </div>
              <Badge variant={selectedCcVehicle.excursions.length > 0 ? 'warning' : 'neutral'}>
                {selectedCcVehicle.excursions.length} sự kiện ghi nhận
              </Badge>
            </div>

            <DataTable
              data={selectedCcVehicle.excursions}
              columns={excursionColumns}
              rowKey={(item) => item.id}
              emptyText="Không có sự kiện vượt ngưỡng nào được ghi nhận cho phương tiện này."
            />
          </div>
        </div>
      )}

      {/* TAB 2: TPMS TIRE PRESSURE & TEMPERATURE VIEW */}
      {activeTab === 'tpms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vdbus-space-4)' }}>
          {/* Fleet TPMS Summary Metric Badges */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 'var(--vdbus-space-3)',
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--vdbus-color-bg-surface)',
                borderRadius: 'var(--vdbus-radius-md)',
                padding: 'var(--vdbus-space-3)',
                border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
              }}
            >
              <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)' }}>Tổng lốp đang giám sát</div>
              <div style={{ fontSize: 'var(--vdbus-font-size-xl)', fontWeight: 'var(--vdbus-font-weight-semibold)', color: 'var(--vdbus-color-text-primary)' }}>
                20 lốp
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--vdbus-color-bg-surface)',
                borderRadius: 'var(--vdbus-radius-md)',
                padding: 'var(--vdbus-space-3)',
                border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
              }}
            >
              <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)' }}>Lốp đạt chuẩn (110 - 120 PSI)</div>
              <div style={{ fontSize: 'var(--vdbus-font-size-xl)', fontWeight: 'var(--vdbus-font-weight-semibold)', color: 'var(--vdbus-color-success-text)' }}>
                18 lốp
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--vdbus-color-bg-surface)',
                borderRadius: 'var(--vdbus-radius-md)',
                padding: 'var(--vdbus-space-3)',
                border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
              }}
            >
              <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)' }}>Lốp non hơi (&lt; 100 PSI)</div>
              <div style={{ fontSize: 'var(--vdbus-font-size-xl)', fontWeight: 'var(--vdbus-font-weight-semibold)', color: 'var(--vdbus-color-warning-text)' }}>
                1 lốp
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--vdbus-color-bg-surface)',
                borderRadius: 'var(--vdbus-radius-md)',
                padding: 'var(--vdbus-space-3)',
                border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
              }}
            >
              <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)' }}>Lốp nhiệt độ cao (&gt; 70 C)</div>
              <div style={{ fontSize: 'var(--vdbus-font-size-xl)', fontWeight: 'var(--vdbus-font-weight-semibold)', color: 'var(--vdbus-color-error-text)' }}>
                1 lốp
              </div>
            </div>
          </div>

          {/* Vehicle Selector Bar for TPMS */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--vdbus-space-3)',
              backgroundColor: 'var(--vdbus-color-bg-surface)',
              padding: 'var(--vdbus-space-3)',
              borderRadius: 'var(--vdbus-radius-md)',
              border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
            }}
          >
            <span style={{ fontSize: 'var(--vdbus-font-size-sm)', fontWeight: 'var(--vdbus-font-weight-medium)', color: 'var(--vdbus-color-text-primary)' }}>
              Chọn xe kiểm tra áp suất lốp:
            </span>
            <div style={{ width: '320px' }}>
              <Select
                size="sm"
                value={selectedTpmsVehicleId}
                onChange={(e) => setSelectedTpmsVehicleId(e.target.value)}
                options={mockTpmsVehicles.map((v) => ({
                  value: v.id,
                  label: `${v.licensePlate} - ${v.makeModel}`,
                }))}
              />
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--vdbus-space-2)' }}>
              <Badge variant={selectedTpmsVehicle.alerts.length > 0 ? 'warning' : 'success'}>
                {selectedTpmsVehicle.alerts.length > 0 ? 'Có cảnh báo lốp' : 'Toàn bộ lốp bình thường'}
              </Badge>
              <Badge variant="info">{selectedTpmsVehicle.axleCount} trục xe</Badge>
            </div>
          </div>

          {/* Axle Schema Diagram and Regulatory Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--vdbus-space-4)' }}>
            {/* Interactive Axle Schema */}
            <div
              style={{
                backgroundColor: 'var(--vdbus-color-bg-surface)',
                borderRadius: 'var(--vdbus-radius-md)',
                border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
                padding: 'var(--vdbus-space-4)',
              }}
            >
              <AxleSchema
                axleCount={selectedTpmsVehicle.axleCount}
                axles={selectedTpmsVehicle.axles}
                title={`Sơ đồ phân bổ lốp & cảm biến TPMS: ${selectedTpmsVehicle.licensePlate}`}
              />
            </div>

            {/* Threshold Standards & Explanations */}
            <div
              style={{
                backgroundColor: 'var(--vdbus-color-bg-surface)',
                borderRadius: 'var(--vdbus-radius-md)',
                border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
                padding: 'var(--vdbus-space-4)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--vdbus-space-3)',
              }}
            >
              <strong style={{ fontSize: 'var(--vdbus-font-size-sm)', color: 'var(--vdbus-color-text-primary)' }}>
                Quy chuẩn kỹ thuật áp suất & nhiệt độ lốp xe tải
              </strong>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vdbus-space-2)', fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-secondary)' }}>
                <div style={{ padding: 'var(--vdbus-space-2)', backgroundColor: 'var(--vdbus-color-bg-subtle)', borderRadius: 'var(--vdbus-radius-base)' }}>
                  <strong style={{ color: 'var(--vdbus-color-text-primary)' }}>Áp suất định mức: 110 - 120 PSI</strong>
                  <div>Duy trì khả năng chịu tải tối đa, chống mòn lốp không đều và tiết kiệm nhiên liệu.</div>
                </div>

                <div style={{ padding: 'var(--vdbus-space-2)', backgroundColor: 'var(--vdbus-color-warning-bg)', border: '1px solid var(--vdbus-color-warning-border)', borderRadius: 'var(--vdbus-radius-base)' }}>
                  <strong style={{ color: 'var(--vdbus-color-warning-text)' }}>Cảnh báo non hơi (&lt; 100 PSI):</strong>
                  <div>Lốp non hơi tăng ma sát với mặt đường, làm nhiệt độ tăng nhanh và có nguy cơ nổ lốp.</div>
                </div>

                <div style={{ padding: 'var(--vdbus-space-2)', backgroundColor: 'var(--vdbus-color-error-bg)', border: '1px solid var(--vdbus-color-error-border)', borderRadius: 'var(--vdbus-radius-base)' }}>
                  <strong style={{ color: 'var(--vdbus-color-error-text)' }}>Cảnh báo nhiệt độ cao (&gt; 70 C):</strong>
                  <div>Dấu hiệu kẹt phanh cơ cấu tang trống hoặc quá nhiệt do ma sát quá mức. Cần dừng kiểm tra ngay.</div>
                </div>
              </div>

              <div style={{ marginTop: 'auto', fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)' }}>
                Lưu ý: Ngưỡng áp suất chuẩn có thể thay đổi tùy theo quy định của nhà sản xuất lốp (Bridgestone/Michelin) và tải trọng thực tế.
              </div>
            </div>
          </div>

          {/* TPMS Alerts Table */}
          <div
            style={{
              backgroundColor: 'var(--vdbus-color-bg-surface)',
              borderRadius: 'var(--vdbus-radius-md)',
              border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
              padding: 'var(--vdbus-space-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--vdbus-space-3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: 'var(--vdbus-font-size-sm)', color: 'var(--vdbus-color-text-primary)' }}>
                Danh sách sự kiện cảnh báo TPMS
              </strong>
              <Badge variant={selectedTpmsVehicle.alerts.length > 0 ? 'error' : 'success'}>
                {selectedTpmsVehicle.alerts.length} cảnh báo
              </Badge>
            </div>

            <DataTable
              data={selectedTpmsVehicle.alerts}
              columns={tpmsAlertColumns}
              rowKey={(item) => item.id}
              emptyText="Không có cảnh báo bất thường nào về áp suất hoặc nhiệt độ lốp."
            />
          </div>
        </div>
      )}
    </div>
  );
};
