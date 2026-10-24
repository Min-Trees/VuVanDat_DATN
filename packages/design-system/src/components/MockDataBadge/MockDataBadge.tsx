import React from 'react';
import { Badge } from '../Badge/Badge';

export interface MockDataBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  label?: string;
}

export const MockDataBadge: React.FC<MockDataBadgeProps> = ({ label = 'Dữ liệu mô phỏng', className = '', ...props }) => {
  return (
    <Badge variant="mock" className={className} title="Dữ liệu này được sinh từ bộ giả lập, không phải từ thiết bị thực tế" {...props}>
      {label}
    </Badge>
  );
};
