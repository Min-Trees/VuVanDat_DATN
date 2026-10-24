import React from 'react';
import { Badge, BadgeVariant } from '../Badge/Badge';

export type GeofenceType =
  | 'CustomerWarehouse'
  | 'DistributionCenter'
  | 'PortTerminal'
  | 'RestStop'
  | 'RestrictedZone';

const geofenceMeta: Record<string, { label: string; variant: BadgeVariant }> = {
  CustomerWarehouse: { label: 'Kho khách hàng', variant: 'info' },
  DistributionCenter: { label: 'Trung tâm phân phối', variant: 'info' },
  PortTerminal: { label: 'Cảng biển / ICD', variant: 'success' },
  RestStop: { label: 'Trạm dừng nghỉ', variant: 'neutral' },
  RestrictedZone: { label: 'Khu vực cấm giờ', variant: 'warning' },
};

export interface GeofenceBadgeProps {
  type: string;
  className?: string;
}

export const GeofenceBadge: React.FC<GeofenceBadgeProps> = ({ type, className = '' }) => {
  const meta = geofenceMeta[type] || { label: type, variant: 'neutral' };
  return (
    <Badge variant={meta.variant} className={className}>
      {meta.label}
    </Badge>
  );
};
