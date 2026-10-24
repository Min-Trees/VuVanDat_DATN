import React from 'react';
import { IconChevronDown } from '../../icons';
import './Select.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[];
  size?: 'sm' | 'base' | 'md';
  isInvalid?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, size = 'base', isInvalid = false, className = '', disabled, ...props }, ref) => {
    return (
      <div
        className={[
          'vdbus-select-container',
          `vdbus-select-container--${size}`,
          isInvalid ? 'vdbus-select-container--invalid' : '',
          disabled ? 'vdbus-select-container--disabled' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <select ref={ref} className="vdbus-select" disabled={disabled} {...props}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="vdbus-select__arrow" aria-hidden="true">
          <IconChevronDown size={14} />
        </span>
      </div>
    );
  }
);

Select.displayName = 'Select';
