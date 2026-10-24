import React, { useState } from 'react';
import { IconMapPin, IconChevronUp, IconChevronDown } from '../../icons';
import { MockDataBadge } from '../MockDataBadge/MockDataBadge';
import { Button } from '../Button/Button';
import './MapPanel.css';

export interface MapPanelProps {
  title?: string;
  isSimulated?: boolean;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
  children?: React.ReactNode;
  height?: string | number;
  className?: string;
}

export const MapPanel: React.FC<MapPanelProps> = ({
  title = 'Bản đồ giám sát lộ trình',
  isSimulated = false,
  isCollapsible = true,
  defaultExpanded = true,
  children,
  height = 360,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={['vdbus-map-panel', className].filter(Boolean).join(' ')}>
      <div className="vdbus-map-panel__header">
        <div className="vdbus-map-panel__header-left">
          <IconMapPin size={16} />
          <strong className="vdbus-map-panel__title">{title}</strong>
          {isSimulated && <MockDataBadge />}
        </div>
        <div className="vdbus-map-panel__header-right">
          {isCollapsible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? 'Thu gọn bản đồ' : 'Mở rộng bản đồ'}
            >
              {isExpanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
              {isExpanded ? 'Thu gọn' : 'Mở rộng'}
            </Button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="vdbus-map-panel__body" style={{ height: typeof height === 'number' ? `${height}px` : height }}>
          {children || (
            <div className="vdbus-map-panel__placeholder">
              <span className="vdbus-map-panel__placeholder-text">
                Khu vực hiển thị bản đồ vector / GIS (PostGIS Mapbox/Leaflet Provider)
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
