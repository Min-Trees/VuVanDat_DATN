import React from 'react';
import { IconAlertTriangle, IconAlertCircle, IconCheck, IconClose } from '../../icons';
import './Banner.css';

export type BannerVariant = 'info' | 'warning' | 'error' | 'success';

export interface BannerProps {
  variant?: BannerVariant;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Banner: React.FC<BannerProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  let IconComponent = IconCheck;
  if (variant === 'warning') IconComponent = IconAlertTriangle;
  if (variant === 'error') IconComponent = IconAlertCircle;

  return (
    <div className={['vdbus-banner', `vdbus-banner--${variant}`, className].filter(Boolean).join(' ')} role="alert">
      <div className="vdbus-banner__icon">
        <IconComponent size={16} />
      </div>
      <div className="vdbus-banner__content">
        {title && <strong className="vdbus-banner__title">{title}</strong>}
        <div className="vdbus-banner__body">{children}</div>
      </div>
      {onClose && (
        <button className="vdbus-banner__close" onClick={onClose} aria-label="Đóng cảnh báo">
          <IconClose size={14} />
        </button>
      )}
    </div>
  );
};
