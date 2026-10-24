import React from 'react';
import './ScoreMeter.css';

export interface ScoreMeterProps {
  score: number; // 0 - 100
  label?: string;
  showBar?: boolean;
  className?: string;
}

export const ScoreMeter: React.FC<ScoreMeterProps> = ({
  score,
  label,
  showBar = true,
  className = '',
}) => {
  const clampedScore = Math.min(100, Math.max(0, score));

  let variant = 'low';
  if (clampedScore >= 80) variant = 'high';
  else if (clampedScore >= 50) variant = 'medium';

  return (
    <div className={['vdbus-scoremeter', `vdbus-scoremeter--${variant}`, className].filter(Boolean).join(' ')}>
      <div className="vdbus-scoremeter__info">
        {label && <span className="vdbus-scoremeter__label">{label}</span>}
        <strong className="vdbus-scoremeter__value tabular-nums">{clampedScore.toFixed(0)}/100</strong>
      </div>
      {showBar && (
        <div className="vdbus-scoremeter__track">
          <div className="vdbus-scoremeter__fill" style={{ width: `${clampedScore}%` }} />
        </div>
      )}
    </div>
  );
};
