import React from 'react';
import './FormField.css';

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  required = false,
  error,
  helperText,
  children,
  className = '',
}) => {
  return (
    <div className={['vdbus-form-field', error ? 'vdbus-form-field--error' : '', className].filter(Boolean).join(' ')}>
      <label htmlFor={htmlFor} className="vdbus-form-field__label">
        <span>{label}</span>
        {required && <span className="vdbus-form-field__required" aria-hidden="true">*</span>}
      </label>
      <div className="vdbus-form-field__control">{children}</div>
      {error ? (
        <div className="vdbus-form-field__error" role="alert">
          {error}
        </div>
      ) : helperText ? (
        <div className="vdbus-form-field__helper">{helperText}</div>
      ) : null}
    </div>
  );
};
