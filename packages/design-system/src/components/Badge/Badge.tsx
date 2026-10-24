import React from 'react';
import './Badge.css';

export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'mock';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children, className = '', ...props }) => {
  return (
    <span className={['vdbus-badge', `vdbus-badge--${variant}`, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </span>
  );
};
