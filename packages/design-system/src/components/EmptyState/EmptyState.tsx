import React from 'react';
import './EmptyState.css';

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon,
  className = '',
}) => {
  return (
    <div className={['vdbus-empty-state', className].filter(Boolean).join(' ')}>
      {icon && <div className="vdbus-empty-state__icon">{icon}</div>}
      <h4 className="vdbus-empty-state__title">{title}</h4>
      {description && <p className="vdbus-empty-state__description">{description}</p>}
      {action && <div className="vdbus-empty-state__action">{action}</div>}
    </div>
  );
};
