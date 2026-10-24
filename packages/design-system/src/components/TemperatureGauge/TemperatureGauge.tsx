import React from 'react';
import { Badge } from '../Badge/Badge';
import { MockDataBadge } from '../MockDataBadge/MockDataBadge';
import './TemperatureGauge.css';

export interface TemperatureGaugeProps {
  temperature: number; // e.g. -18.2
  targetMin?: number; // e.g. -20
  targetMax?: number; // e.g. -16
  label?: string;
  isSimulated?: boolean;
  className?: string;
}

export const TemperatureGauge: React.FC<TemperatureGaugeProps> = ({
  temperature,
  targetMin,
  targetMax,
  label = 'Nhiệt độ thùng hàng',
  isSimulated = false,
  className = '',
}) => {
  let statusVariant: 'normal' | 'warning' | 'critical' = 'normal';
  let badgeVariant: 'success' | 'warning' | 'error' = 'success';
  let statusText = 'Đạt chuẩn';

  if (targetMin !== undefined && targetMax !== undefined) {
    if (temperature < targetMin - 2 || temperature > targetMax + 2) {
      statusVariant = 'critical';
      badgeVariant = 'error';
      statusText = 'Vượt ngưỡng nghiêm trọng';
    } else if (temperature < targetMin || temperature > targetMax) {
      statusVariant = 'warning';
      badgeVariant = 'warning';
      statusText = 'Cảnh báo lệch dải';
    }
  }

  const formattedTemp = temperature > 0 ? `+${temperature.toFixed(1)}` : temperature.toFixed(1);

  return (
    <div
      className={['vdbus-temperature-gauge', `vdbus-temperature-gauge--${statusVariant}`, className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="vdbus-temperature-gauge__header">
        <span className="vdbus-temperature-gauge__label">{label}</span>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {isSimulated && <MockDataBadge />}
          <Badge variant={badgeVariant}>{statusText}</Badge>
        </div>
      </div>

      <div className="vdbus-temperature-gauge__value-row">
        <span className="vdbus-temperature-gauge__temp tabular-nums">{formattedTemp}</span>
        <span className="vdbus-temperature-gauge__unit">°C</span>
      </div>

      {targetMin !== undefined && targetMax !== undefined && (
        <div className="vdbus-temperature-gauge__range">
          Dải mục tiêu: {targetMin}°C đến {targetMax}°C
        </div>
      )}
    </div>
  );
};
