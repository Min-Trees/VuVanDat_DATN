import React from 'react';
import './Tabs.css';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ items, activeId, onChange, className = '' }) => {
  return (
    <div className={['vdbus-tabs', className].filter(Boolean).join(' ')} role="tablist">
      {items.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            disabled={tab.disabled}
            className={['vdbus-tab-item', isActive ? 'vdbus-tab-item--active' : ''].filter(Boolean).join(' ')}
            onClick={() => onChange(tab.id)}
          >
            <span className="vdbus-tab-item__label">{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span className="vdbus-tab-item__count tabular-nums">{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};
