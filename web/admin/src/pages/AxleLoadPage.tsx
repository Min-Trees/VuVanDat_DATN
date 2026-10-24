import React, { useState, useMemo } from 'react';
import {
  PageHeader,
  Button,
  Badge,
  MockDataBadge,
  Select,
  Input,
  Banner,
  AxleSchema,
  AxleInfo,
} from '@vdbus/design-system';

export interface PalletItem {
  id: string;
  name: string;
  weightKg: number;
  positionMmFromFront: number; // distance from front of cargo bed
  lengthMm: number;
}

interface TruckPreset {
  id: string;
  name: string;
  makeModel: string;
  licensePlate: string;
  axleCount: number;
  wheelbaseMm: number;
  distanceFrontAxleToBodyMm: number;
  bodyLengthMm: number;
  emptyFrontKg: number;
  emptyRearKg: number;
  frontLimitKg: number;
  rearLimitKg: number;
  maxPayloadKg: number;
}

const truckPresets: TruckPreset[] = [
  {
    id: 'trk-1',
    name: 'Xe tải 2 trục 8.5 tấn (Hino 500 FG)',
    makeModel: 'Hino 500 FG8JJ7A',
    licensePlate: '43C-189.24',
    axleCount: 2,
    wheelbaseMm: 5500,
    distanceFrontAxleToBodyMm: 1200,
    bodyLengthMm: 7400,
    emptyFrontKg: 3200,
    emptyRearKg: 2800,
    frontLimitKg: 6000,
    rearLimitKg: 10000,
    maxPayloadKg: 8500,
  },
  {
    id: 'trk-2',
    name: 'Xe tải 3 trục 15 tấn (Isuzu GIGA 6x2)',
    makeModel: 'Isuzu GIGA 6x2 3 chân',
    licensePlate: '43H-012.88',
    axleCount: 3,
    wheelbaseMm: 6200,
    distanceFrontAxleToBodyMm: 1300,
    bodyLengthMm: 9600,
    emptyFrontKg: 4500,
    emptyRearKg: 5500,
    frontLimitKg: 6500,
    rearLimitKg: 18000,
    maxPayloadKg: 15000,
  },
];

const initialPallets: PalletItem[] = [
  { id: 'p-1', name: 'Pallet Sữa Hộp #01', weightKg: 1800, positionMmFromFront: 400, lengthMm: 1200 },
  { id: 'p-2', name: 'Pallet Nước Ngọt #02', weightKg: 2100, positionMmFromFront: 1800, lengthMm: 1200 },
  { id: 'p-3', name: 'Pallet Dầu Ăn #03', weightKg: 2200, positionMmFromFront: 3200, lengthMm: 1200 },
  { id: 'p-4', name: 'Pallet Bột Mì #04', weightKg: 1900, positionMmFromFront: 4600, lengthMm: 1200 },
];

export const AxleLoadPage: React.FC = () => {
  const [selectedTruckId, setSelectedTruckId] = useState<string>(truckPresets[0].id);
  const [pallets, setPallets] = useState<PalletItem[]>(initialPallets);

  const selectedTruck = useMemo(() => {
    return truckPresets.find((t) => t.id === selectedTruckId) || truckPresets[0];
  }, [selectedTruckId]);

  // Static moment mechanics calculation
  const calculation = useMemo(() => {
    const totalCargoWeightKg = pallets.reduce((sum, p) => sum + p.weightKg, 0);

    let cogMmFromFront = selectedTruck.bodyLengthMm / 2;
    if (totalCargoWeightKg > 0) {
      const weightedSum = pallets.reduce(
        (sum, p) => sum + p.weightKg * (p.positionMmFromFront + p.lengthMm / 2),
        0
      );
      cogMmFromFront = Math.round(weightedSum / totalCargoWeightKg);
    }

    // Moment equation around front axle:
    // F_cargo_rear * Wheelbase = CargoWeight * (D_front + CoG)
    const armFromFrontAxleMm = selectedTruck.distanceFrontAxleToBodyMm + cogMmFromFront;
    const cargoRearLoadKg = (totalCargoWeightKg * armFromFrontAxleMm) / selectedTruck.wheelbaseMm;
    const cargoFrontLoadKg = totalCargoWeightKg - cargoRearLoadKg;

    const totalFrontKg = Math.round(selectedTruck.emptyFrontKg + cargoFrontLoadKg);
    const totalRearKg = Math.round(selectedTruck.emptyRearKg + cargoRearLoadKg);
    const grossWeightKg = totalFrontKg + totalRearKg;

    const frontUtilPct = Math.round((totalFrontKg / selectedTruck.frontLimitKg) * 100);
    const rearUtilPct = Math.round((totalRearKg / selectedTruck.rearLimitKg) * 100);
    const isFrontOver = totalFrontKg > selectedTruck.frontLimitKg;
    const isRearOver = totalRearKg > selectedTruck.rearLimitKg;

    // Margin of error (+- 3%)
    const marginKg = Math.round(grossWeightKg * 0.03);

    let statusVariant: 'success' | 'warning' | 'error' = 'success';
    let statusTitle = 'Phân bổ tải trọng đạt chuẩn an toàn';
    let recommendation =
      'Trọng tâm hàng hóa nằm trong dải cân bằng tối ưu giữa trục trước và trục sau. Không có nguy cơ quá tải trục khi qua trạm cân lưu động.';

    if (isFrontOver && isRearOver) {
      statusVariant = 'error';
      statusTitle = 'Quá tải toàn bộ (Gross Overload)';
      recommendation = `Tổng tải trọng vượt quá khả năng chịu tải của cả hai trục xe (+${grossWeightKg - (selectedTruck.frontLimitKg + selectedTruck.rearLimitKg)} kg). Bắt buộc phải hạ tải bớt hàng hóa.`;
    } else if (isRearOver) {
      statusVariant = 'error';
      statusTitle = 'Cảnh báo quá tải trục sau (Rear Axle Overloaded)';
      const excessKg = totalRearKg - selectedTruck.rearLimitKg;
      recommendation = `Trục sau đang chịu tải ${totalRearKg} kg (vượt ${excessKg} kg so với giới hạn ${selectedTruck.rearLimitKg} kg). Khuyến nghị dời các pallet phía đuôi tiến về phía đầu xe khoảng 600 - 900 mm.`;
    } else if (isFrontOver) {
      statusVariant = 'error';
      statusTitle = 'Cảnh báo quá tải trục dẫn hướng (Front Axle Overloaded)';
      const excessKg = totalFrontKg - selectedTruck.frontLimitKg;
      recommendation = `Trục trước đang chịu tải ${totalFrontKg} kg (vượt ${excessKg} kg so với giới hạn ${selectedTruck.frontLimitKg} kg). Cần phân bổ bớt pallet về phía sau để tránh nặng lái và hư hại cầu trước.`;
    } else if (frontUtilPct > 92 || rearUtilPct > 92) {
      statusVariant = 'warning';
      statusTitle = 'Cảnh báo tiệm cận tải trọng tới hạn';
      recommendation =
        'Tải trọng trục đang ở mức trên 92% tải định mức. Cân nhắc dung sai sai số đo lường (+- 3%) có thể dẫn đến rủi ro bị xử phạt khi kiểm tra tải trọng.';
    }

    // Dynamic AxleInfo structure for AxleSchema
    const axles: AxleInfo[] = [
      {
        axleIndex: 1,
        axleType: 'front',
        loadKg: totalFrontKg,
        limitKg: selectedTruck.frontLimitKg,
        tires: [
          { position: 'FL', pressurePsi: 115, tempCelsius: 45, status: isFrontOver ? 'critical' : 'normal' },
          { position: 'FR', pressurePsi: 116, tempCelsius: 45, status: isFrontOver ? 'critical' : 'normal' },
        ],
      },
      {
        axleIndex: 2,
        axleType: 'rear',
        loadKg: totalRearKg,
        limitKg: selectedTruck.rearLimitKg,
        tires: [
          { position: 'RL1', pressurePsi: 118, tempCelsius: 50, status: isRearOver ? 'critical' : 'normal' },
          { position: 'RL2', pressurePsi: 118, tempCelsius: 49, status: isRearOver ? 'critical' : 'normal' },
          { position: 'RR2', pressurePsi: 119, tempCelsius: 51, status: isRearOver ? 'critical' : 'normal' },
          { position: 'RR1', pressurePsi: 118, tempCelsius: 50, status: isRearOver ? 'critical' : 'normal' },
        ],
      },
    ];

    if (selectedTruck.axleCount === 3) {
      axles.push({
        axleIndex: 3,
        axleType: 'rear',
        loadKg: Math.round(totalRearKg / 2),
        limitKg: Math.round(selectedTruck.rearLimitKg / 2),
        tires: [
          { position: 'R2L1', pressurePsi: 116, tempCelsius: 48, status: isRearOver ? 'critical' : 'normal' },
          { position: 'R2L2', pressurePsi: 116, tempCelsius: 48, status: isRearOver ? 'critical' : 'normal' },
          { position: 'R2R2', pressurePsi: 117, tempCelsius: 49, status: isRearOver ? 'critical' : 'normal' },
          { position: 'R2R1', pressurePsi: 116, tempCelsius: 48, status: isRearOver ? 'critical' : 'normal' },
        ],
      });
    }

    return {
      totalCargoWeightKg,
      cogMmFromFront,
      totalFrontKg,
      totalRearKg,
      grossWeightKg,
      frontUtilPct,
      rearUtilPct,
      marginKg,
      statusVariant,
      statusTitle,
      recommendation,
      axles,
    };
  }, [pallets, selectedTruck]);

  // Pallet position handlers
  const handleUpdatePalletWeight = (id: string, weightKg: number) => {
    setPallets((prev) =>
      prev.map((p) => (p.id === id ? { ...p, weightKg: Math.max(0, weightKg) } : p))
    );
  };

  const handleUpdatePalletPosition = (id: string, posMm: number) => {
    const maxPos = selectedTruck.bodyLengthMm - 1200;
    setPallets((prev) =>
      prev.map((p) => (p.id === id ? { ...p, positionMmFromFront: Math.max(0, Math.min(maxPos, posMm)) } : p))
    );
  };

  const handleApplyPreset = (presetType: 'balanced' | 'rearHeavy' | 'frontHeavy') => {
    if (presetType === 'balanced') {
      setPallets([
        { id: 'p-1', name: 'Pallet Sữa #01', weightKg: 1900, positionMmFromFront: 400, lengthMm: 1200 },
        { id: 'p-2', name: 'Pallet Nước #02', weightKg: 2000, positionMmFromFront: 1800, lengthMm: 1200 },
        { id: 'p-3', name: 'Pallet Dầu #03', weightKg: 2000, positionMmFromFront: 3200, lengthMm: 1200 },
        { id: 'p-4', name: 'Pallet Bột #04', weightKg: 1900, positionMmFromFront: 4600, lengthMm: 1200 },
      ]);
    } else if (presetType === 'rearHeavy') {
      setPallets([
        { id: 'p-1', name: 'Pallet Nhẹ #01', weightKg: 800, positionMmFromFront: 400, lengthMm: 1200 },
        { id: 'p-2', name: 'Pallet Nhẹ #02', weightKg: 800, positionMmFromFront: 1800, lengthMm: 1200 },
        { id: 'p-3', name: 'Pallet Nặng #03', weightKg: 3500, positionMmFromFront: 4200, lengthMm: 1200 },
        { id: 'p-4', name: 'Pallet Rất Nặng #04', weightKg: 4200, positionMmFromFront: 5800, lengthMm: 1200 },
      ]);
    } else if (presetType === 'frontHeavy') {
      setPallets([
        { id: 'p-1', name: 'Pallet Nặng #01', weightKg: 4000, positionMmFromFront: 100, lengthMm: 1200 },
        { id: 'p-2', name: 'Pallet Nặng #02', weightKg: 3800, positionMmFromFront: 1400, lengthMm: 1200 },
        { id: 'p-3', name: 'Pallet Nhẹ #03', weightKg: 800, positionMmFromFront: 3800, lengthMm: 1200 },
        { id: 'p-4', name: 'Pallet Nhẹ #04', weightKg: 600, positionMmFromFront: 5200, lengthMm: 1200 },
      ]);
    }
  };

  // Cargo Bed SVG dimensions
  const svgWidth = 720;
  const svgHeight = 220;
  const bedX = 90;
  const bedY = 40;
  const bedWidth = 580;
  const bedHeight = 140;

  // Scale: bedWidth represents selectedTruck.bodyLengthMm
  const scaleMmToPx = bedWidth / selectedTruck.bodyLengthMm;

  return (
    <div style={{ padding: 'var(--vdbus-space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--vdbus-space-4)' }}>
      {/* Page Header */}
      <PageHeader
        title="Bàn Mô phỏng Xếp hàng & Phân bổ Tải trọng Trục (Axle Load)"
        subtitle="Mô phỏng cơ học mô-men tĩnh học: tính toán vị trí trọng tâm hàng hóa (CoG) và lực đè lên trục trước/trục sau kèm khuyến nghị dời hàng"
        badge={<MockDataBadge />}
        actions={
          <div style={{ display: 'flex', gap: 'var(--vdbus-space-2)' }}>
            <Button variant="outline" size="sm" onClick={() => handleApplyPreset('balanced')}>
              Cấu hình: Cân bằng
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleApplyPreset('rearHeavy')}>
              Cấu hình: Lệch đuôi
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleApplyPreset('frontHeavy')}>
              Cấu hình: Lệch đầu
            </Button>
          </div>
        }
      />

      {/* Mechanics Explanation & Regulatory Banner */}
      <Banner
        variant={calculation.statusVariant}
        title={`Kết luận kỹ thuật: ${calculation.statusTitle}`}
      >
        <div>{calculation.recommendation}</div>
        <div style={{ marginTop: 'var(--vdbus-space-1)', fontSize: 'var(--vdbus-font-size-xs)', opacity: 0.9 }}>
          Công thức mô-men tĩnh học: F_rear = [W_cargo * (D_front + CoG) / Wheelbase] + F_empty_rear. Biên sai số ước tính: +/- 3% (+/- {calculation.marginKg} kg). Kết quả tính toán mang tính khuyến cáo chuyên môn, cần đối chiếu quy định đăng kiểm.
        </div>
      </Banner>

      {/* Upper Vehicle Preset Bar */}
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
          Phương tiện mô phỏng:
        </span>
        <div style={{ width: '360px' }}>
          <Select
            size="sm"
            value={selectedTruckId}
            onChange={(e) => setSelectedTruckId(e.target.value)}
            options={truckPresets.map((t) => ({
              value: t.id,
              label: `${t.name} (${t.licensePlate})`,
            }))}
          />
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--vdbus-space-2)', fontSize: 'var(--vdbus-font-size-xs)' }}>
          <Badge variant="info">Chiều dài thùng: {selectedTruck.bodyLengthMm / 1000} m</Badge>
          <Badge variant="info">Chiều dài cơ sở (Wheelbase): {selectedTruck.wheelbaseMm / 1000} m</Badge>
          <Badge variant="neutral">Tải trọng tối đa: {selectedTruck.maxPayloadKg.toLocaleString('vi-VN')} kg</Badge>
        </div>
      </div>

      {/* Main Simulation View: 2D Visual Packing Bed & Axle Load Gauges */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 'var(--vdbus-space-4)' }}>
        {/* Left: Interactive 2D Visual Cargo Bed */}
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
              Mặt bằng bố trí Pallet hàng hóa trong thùng xe (Top-down Visual Floorplan)
            </strong>
            <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)' }}>
              Trọng tâm CoG: <strong>{calculation.cogMmFromFront} mm</strong> từ đầu thùng
            </div>
          </div>

          {/* SVG Cargo Bed */}
          <div style={{ width: '100%', height: '220px', border: '1px solid var(--vdbus-color-border-subtle)', borderRadius: 'var(--vdbus-radius-base)', overflow: 'hidden' }}>
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: '100%', backgroundColor: 'var(--vdbus-color-bg-subtle)' }}>
              {/* Truck Cabin at Left */}
              <rect x="20" y={bedY} width="60" height={bedHeight} rx="8" fill="var(--vdbus-color-border-strong)" opacity="0.8" />
              <text x="50" y={bedY + bedHeight / 2} textAnchor="middle" fontSize="11" fill="var(--vdbus-color-text-inverse)" fontWeight="bold">
                CABIN
              </text>

              {/* Cargo Bed Container */}
              <rect
                x={bedX}
                y={bedY}
                width={bedWidth}
                height={bedHeight}
                rx="4"
                fill="var(--vdbus-color-bg-surface)"
                stroke="var(--vdbus-color-border-strong)"
                strokeWidth="2"
              />

              {/* Bed Dimension Marker Line */}
              <line x1={bedX} y1={bedY - 10} x2={bedX + bedWidth} y2={bedY - 10} stroke="var(--vdbus-color-text-muted)" strokeWidth="1" />
              <text x={bedX + bedWidth / 2} y={bedY - 15} textAnchor="middle" fontSize="10" fill="var(--vdbus-color-text-muted)">
                Chiều dài thùng: {selectedTruck.bodyLengthMm} mm
              </text>

              {/* Front Axle Indicator under Bed */}
              <g>
                <circle cx={bedX - 20} cy={bedY + bedHeight + 16} r="10" fill="var(--vdbus-color-primary)" />
                <text x={bedX - 20} y={bedY + bedHeight + 34} textAnchor="middle" fontSize="9" fill="var(--vdbus-color-text-secondary)">
                  Trục trước
                </text>
              </g>

              {/* Rear Axle Indicator under Bed */}
              <g>
                <circle cx={bedX + bedWidth - 80} cy={bedY + bedHeight + 16} r="10" fill="var(--vdbus-color-primary)" />
                <text x={bedX + bedWidth - 80} y={bedY + bedHeight + 34} textAnchor="middle" fontSize="9" fill="var(--vdbus-color-text-secondary)">
                  Trục sau
                </text>
              </g>

              {/* Pallets placed in cargo bed */}
              {pallets.map((p, idx) => {
                const pxX = bedX + p.positionMmFromFront * scaleMmToPx;
                const pxWidth = p.lengthMm * scaleMmToPx;

                return (
                  <g key={p.id}>
                    <rect
                      x={pxX}
                      y={bedY + 12}
                      width={pxWidth}
                      height={bedHeight - 24}
                      rx="4"
                      fill="var(--vdbus-color-primary-subtle)"
                      stroke="var(--vdbus-color-primary)"
                      strokeWidth="1.5"
                    />
                    <text
                      x={pxX + pxWidth / 2}
                      y={bedY + bedHeight / 2 - 8}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="var(--vdbus-color-primary)"
                    >
                      P{idx + 1}
                    </text>
                    <text
                      x={pxX + pxWidth / 2}
                      y={bedY + bedHeight / 2 + 10}
                      textAnchor="middle"
                      fontSize="9"
                      fill="var(--vdbus-color-text-primary)"
                    >
                      {p.weightKg} kg
                    </text>
                  </g>
                );
              })}

              {/* Center of Gravity (CoG) Marker Line */}
              <line
                x1={bedX + calculation.cogMmFromFront * scaleMmToPx}
                y1={bedY}
                x2={bedX + calculation.cogMmFromFront * scaleMmToPx}
                y2={bedY + bedHeight}
                stroke="var(--vdbus-color-error-text)"
                strokeWidth="2.5"
                strokeDasharray="4 2"
              />
              <circle
                cx={bedX + calculation.cogMmFromFront * scaleMmToPx}
                cy={bedY + bedHeight / 2}
                r="6"
                fill="var(--vdbus-color-error-text)"
              />
              <text
                x={bedX + calculation.cogMmFromFront * scaleMmToPx}
                y={bedY + bedHeight + 14}
                textAnchor="middle"
                fontSize="9"
                fontWeight="bold"
                fill="var(--vdbus-color-error-text)"
              >
                CoG ({calculation.cogMmFromFront} mm)
              </text>
            </svg>
          </div>

          {/* Pallet Configuration Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vdbus-space-2)', marginTop: 'var(--vdbus-space-2)' }}>
            <span style={{ fontSize: 'var(--vdbus-font-size-xs)', fontWeight: 'var(--vdbus-font-weight-medium)', color: 'var(--vdbus-color-text-secondary)' }}>
              Điều chỉnh trọng lượng & vị trí từng Pallet:
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--vdbus-space-3)' }}>
              {pallets.map((p, idx) => (
                <div
                  key={p.id}
                  style={{
                    padding: 'var(--vdbus-space-2) var(--vdbus-space-3)',
                    backgroundColor: 'var(--vdbus-color-bg-subtle)',
                    borderRadius: 'var(--vdbus-radius-base)',
                    border: '1px solid var(--vdbus-color-border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--vdbus-space-1)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--vdbus-font-size-xs)' }}>
                    <strong>Pallet #{idx + 1}: {p.name}</strong>
                    <span>Khoảng cách: {p.positionMmFromFront} mm</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--vdbus-space-2)' }}>
                    <div>
                      <label style={{ fontSize: '10px', color: 'var(--vdbus-color-text-muted)' }}>Khối lượng (kg)</label>
                      <Input
                        type="number"
                        size="sm"
                        value={p.weightKg.toString()}
                        onChange={(e) => handleUpdatePalletWeight(p.id, Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', color: 'var(--vdbus-color-text-muted)' }}>Vị trí từ đầu xe (mm)</label>
                      <Input
                        type="number"
                        size="sm"
                        value={p.positionMmFromFront.toString()}
                        onChange={(e) => handleUpdatePalletPosition(p.id, Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Axle Load Status & Schema */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vdbus-space-4)' }}>
          {/* Summary Metric Cards */}
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
              Kết quả Tải trọng Trục xe & Tổng tải (GVW)
            </strong>

            {/* Front Axle Load Meter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--vdbus-font-size-xs)' }}>
                <span>Trục trước (Dẫn hướng):</span>
                <strong style={{ color: calculation.frontUtilPct > 100 ? 'var(--vdbus-color-error-text)' : 'var(--vdbus-color-text-primary)' }}>
                  {calculation.totalFrontKg.toLocaleString('vi-VN')} kg / {selectedTruck.frontLimitKg.toLocaleString('vi-VN')} kg ({calculation.frontUtilPct}%)
                </strong>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--vdbus-color-bg-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, calculation.frontUtilPct)}%`,
                    height: '100%',
                    backgroundColor: calculation.frontUtilPct > 100 ? 'var(--vdbus-color-error-text)' : calculation.frontUtilPct > 85 ? 'var(--vdbus-color-warning-text)' : 'var(--vdbus-color-primary)',
                  }}
                />
              </div>
            </div>

            {/* Rear Axle Load Meter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--vdbus-font-size-xs)' }}>
                <span>Trục sau (Chịu tải chính):</span>
                <strong style={{ color: calculation.rearUtilPct > 100 ? 'var(--vdbus-color-error-text)' : 'var(--vdbus-color-text-primary)' }}>
                  {calculation.totalRearKg.toLocaleString('vi-VN')} kg / {selectedTruck.rearLimitKg.toLocaleString('vi-VN')} kg ({calculation.rearUtilPct}%)
                </strong>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--vdbus-color-bg-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, calculation.rearUtilPct)}%`,
                    height: '100%',
                    backgroundColor: calculation.rearUtilPct > 100 ? 'var(--vdbus-color-error-text)' : calculation.rearUtilPct > 85 ? 'var(--vdbus-color-warning-text)' : 'var(--vdbus-color-primary)',
                  }}
                />
              </div>
            </div>

            {/* Gross Weight & Payload Total */}
            <div
              style={{
                marginTop: 'var(--vdbus-space-2)',
                padding: 'var(--vdbus-space-3)',
                backgroundColor: 'var(--vdbus-color-bg-subtle)',
                borderRadius: 'var(--vdbus-radius-base)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--vdbus-space-1)',
                fontSize: 'var(--vdbus-font-size-xs)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tổng khối lượng hàng hóa:</span>
                <strong>{calculation.totalCargoWeightKg.toLocaleString('vi-VN')} kg</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tổng tải trọng đoàn xe (GVW):</span>
                <strong style={{ fontSize: 'var(--vdbus-font-size-sm)' }}>{calculation.grossWeightKg.toLocaleString('vi-VN')} kg</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--vdbus-color-text-muted)' }}>
                <span>Biên sai số (+- 3%):</span>
                <span>+/- {calculation.marginKg.toLocaleString('vi-VN')} kg</span>
              </div>
            </div>
          </div>

          {/* Vehicle Axle Schematic */}
          <div
            style={{
              backgroundColor: 'var(--vdbus-color-bg-surface)',
              borderRadius: 'var(--vdbus-radius-md)',
              border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
              padding: 'var(--vdbus-space-4)',
            }}
          >
            <AxleSchema
              axleCount={selectedTruck.axleCount}
              axles={calculation.axles}
              title={`Sơ đồ tải trọng trục: ${selectedTruck.licensePlate}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
