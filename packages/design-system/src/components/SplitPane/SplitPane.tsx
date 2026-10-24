import React from 'react';
import './SplitPane.css';

export interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  leftWidth?: string | number;
  className?: string;
}

export const SplitPane: React.FC<SplitPaneProps> = ({
  left,
  right,
  leftWidth = '420px',
  className = '',
}) => {
  return (
    <div className={['vdbus-splitpane', className].filter(Boolean).join(' ')}>
      <div
        className="vdbus-splitpane__left"
        style={{ width: typeof leftWidth === 'number' ? `${leftWidth}px` : leftWidth }}
      >
        {left}
      </div>
      <div className="vdbus-splitpane__divider" />
      <div className="vdbus-splitpane__right">{right}</div>
    </div>
  );
};
