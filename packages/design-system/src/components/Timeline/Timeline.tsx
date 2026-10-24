import React from 'react';
import './Timeline.css';

export interface TimelineStep {
  title: string;
  description?: string;
  timestamp?: string;
  status: 'completed' | 'current' | 'upcoming' | 'rejected';
}

export interface TimelineProps {
  steps: TimelineStep[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ steps, className = '' }) => {
  return (
    <div className={['vdbus-timeline', className].filter(Boolean).join(' ')}>
      {steps.map((step, idx) => (
        <div
          key={idx}
          className={[
            'vdbus-timeline-item',
            `vdbus-timeline-item--${step.status}`,
            idx === steps.length - 1 ? 'vdbus-timeline-item--last' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div className="vdbus-timeline-node">
            <span className="vdbus-timeline-dot" />
            {idx < steps.length - 1 && <span className="vdbus-timeline-line" />}
          </div>
          <div className="vdbus-timeline-content">
            <div className="vdbus-timeline-header">
              <strong className="vdbus-timeline-title">{step.title}</strong>
              {step.timestamp && (
                <span className="vdbus-timeline-time tabular-nums">{step.timestamp}</span>
              )}
            </div>
            {step.description && <p className="vdbus-timeline-desc">{step.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};
