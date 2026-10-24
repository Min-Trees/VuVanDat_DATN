import React, { useEffect } from 'react';
import { IconClose } from '../../icons';
import './Modal.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'base' | 'lg';
  isDangerous?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'base',
  isDangerous = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="vdbus-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div
        className={['vdbus-modal', `vdbus-modal--${size}`, isDangerous ? 'vdbus-modal--dangerous' : '']
          .filter(Boolean)
          .join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="vdbus-modal__header">
          <h3 id="modal-title" className="vdbus-modal__title">
            {title}
          </h3>
          <button className="vdbus-modal__close-btn" onClick={onClose} aria-label="Đóng hộp thoại">
            <IconClose size={16} />
          </button>
        </div>
        <div className="vdbus-modal__body">{children}</div>
        {footer && <div className="vdbus-modal__footer">{footer}</div>}
      </div>
    </div>
  );
};
