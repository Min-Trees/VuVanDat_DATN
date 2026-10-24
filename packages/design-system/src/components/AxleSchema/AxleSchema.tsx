import React from 'react';
import { Badge } from '../Badge/Badge';
import './AxleSchema.css';

export interface TireData {
  position: string; // e.g. "FL", "FR", "RL1", "RR1", "RL2", "RR2"
  pressurePsi: number;
  tempCelsius: number;
  status?: 'normal' | 'warning' | 'critical';
}

export interface AxleInfo {
  axleIndex: number; // 1: Front, 2: Rear 1, 3: Rear 2, etc.
  axleType: 'front' | 'rear';
  loadKg?: number;
  limitKg?: number;
  tires: TireData[];
}

export interface AxleSchemaProps {
  axleCount?: number; // 2, 3, or 4
  axles: AxleInfo[];
  title?: string;
  className?: string;
}

export const AxleSchema: React.FC<AxleSchemaProps> = ({
  axles,
  title = 'Sơ đồ trục & Giám sát áp suất lốp (TPMS)',
  className = '',
}) => {
  return (
    <div className={['vdbus-axle-schema', className].filter(Boolean).join(' ')}>
      <div className="vdbus-axle-schema__header">
        <span className="vdbus-axle-schema__title">{title}</span>
        <Badge variant="info">{axles.length} trục</Badge>
      </div>

      <div className="vdbus-axle-schema__diagram">
        {axles.map((axle) => {
          const isOverloaded =
            axle.loadKg !== undefined && axle.limitKg !== undefined && axle.loadKg > axle.limitKg;

          // Split left and right tires
          const half = Math.ceil(axle.tires.length / 2);
          const leftTires = axle.tires.slice(0, half);
          const rightTires = axle.tires.slice(half);

          return (
            <div key={axle.axleIndex} className="vdbus-axle-row">
              {/* Left Tires */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {leftTires.map((t) => (
                  <div
                    key={t.position}
                    className={[
                      'vdbus-tire',
                      `vdbus-tire--${t.status || 'normal'}`,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    title={`Vị trí: ${t.position}`}
                  >
                    <span className="vdbus-tire__pressure tabular-nums">{t.pressurePsi} PSI</span>
                    <span className="vdbus-tire__temp tabular-nums">{t.tempCelsius}°C</span>
                  </div>
                ))}
              </div>

              {/* Axle connecting bar */}
              <div className="vdbus-axle-bar">
                {axle.loadKg !== undefined && (
                  <span className="vdbus-axle-load-badge">
                    {axle.axleType === 'front' ? 'Trục lái: ' : 'Trục tải: '}
                    {(axle.loadKg / 1000).toFixed(1)}t
                    {axle.limitKg !== undefined && ` / ${(axle.limitKg / 1000).toFixed(1)}t`}
                    {isOverloaded && (
                      <span style={{ color: 'var(--vdbus-color-error-600)', marginLeft: '4px' }}>
                        (Quá tải)
                      </span>
                    )}
                  </span>
                )}
              </div>

              {/* Right Tires */}
              <div style={{ display: 'flex', gap: '4px' }}>
                {rightTires.map((t) => (
                  <div
                    key={t.position}
                    className={[
                      'vdbus-tire',
                      `vdbus-tire--${t.status || 'normal'}`,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    title={`Vị trí: ${t.position}`}
                  >
                    <span className="vdbus-tire__pressure tabular-nums">{t.pressurePsi} PSI</span>
                    <span className="vdbus-tire__temp tabular-nums">{t.tempCelsius}°C</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
