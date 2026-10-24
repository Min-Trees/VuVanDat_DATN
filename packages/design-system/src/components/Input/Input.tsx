import React from 'react';
import './Input.css';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'base' | 'md';
  isInvalid?: boolean;
  prefixElement?: React.ReactNode;
  suffixElement?: React.ReactNode;
  isTabular?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ size = 'base', isInvalid = false, prefixElement, suffixElement, isTabular = false, className = '', ...props }, ref) => {
    return (
      <div
        className={[
          'vdbus-input-container',
          `vdbus-input-container--${size}`,
          isInvalid ? 'vdbus-input-container--invalid' : '',
          props.disabled ? 'vdbus-input-container--disabled' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {prefixElement && <div className="vdbus-input__prefix">{prefixElement}</div>}
        <input
          ref={ref}
          className={[
            'vdbus-input',
            isTabular || props.type === 'number' ? 'tabular-nums' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-invalid={isInvalid}
          {...props}
        />
        {suffixElement && <div className="vdbus-input__suffix">{suffixElement}</div>}
      </div>
    );
  }
);

Input.displayName = 'Input';
