import React from 'react';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'base' | 'md';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'base', isLoading = false, children, disabled, className = '', ...props }, ref) => {
    const classNames = [
      'vdbus-btn',
      `vdbus-btn--${variant}`,
      `vdbus-btn--${size}`,
      isLoading ? 'vdbus-btn--loading' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button ref={ref} className={classNames} disabled={disabled || isLoading} {...props}>
        {isLoading && <span className="vdbus-btn__spinner" aria-hidden="true" />}
        <span className="vdbus-btn__content">{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';
