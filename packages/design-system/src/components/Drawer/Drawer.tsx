import React, { useEffect } from 'react';
import { IconClose } from '../../icons';
import './Drawer.css';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string | number;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  width = 460,
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
    <div className="vdbus-drawer-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="vdbus-drawer"
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="vdbus-drawer__header">
          <h3 className="vdbus-drawer__title">{title}</h3>
          <button className="vdbus-drawer__close-btn" onClick={onClose} aria-label="Đóng bảng trượt">
            <IconClose size={16} />
          </button>
        </div>
        <div className="vdbus-drawer__body">{children}</div>
        {footer && <div className="vdbus-drawer__footer">{footer}</div>}
      </div>
    </div>
  );
};
