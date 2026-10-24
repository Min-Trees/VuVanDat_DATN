import React from 'react';
import './PageHeader.css';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  badge,
  className = '',
}) => {
  return (
    <div className={['vdbus-page-header', className].filter(Boolean).join(' ')}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="vdbus-page-header__breadcrumbs" aria-label="Đường dẫn trang">
          <ol>
            {breadcrumbs.map((crumb, idx) => (
              <li key={idx}>
                {crumb.href ? <a href={crumb.href}>{crumb.label}</a> : <span>{crumb.label}</span>}
                {idx < breadcrumbs.length - 1 && <span className="vdbus-page-header__separator">/</span>}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="vdbus-page-header__main">
        <div className="vdbus-page-header__title-group">
          <div className="vdbus-page-header__title-row">
            <h1 className="vdbus-page-header__title">{title}</h1>
            {badge && <div className="vdbus-page-header__badge">{badge}</div>}
          </div>
          {subtitle && <p className="vdbus-page-header__subtitle">{subtitle}</p>}
        </div>

        {actions && <div className="vdbus-page-header__actions">{actions}</div>}
      </div>
    </div>
  );
};
