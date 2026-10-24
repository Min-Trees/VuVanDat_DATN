import React, { useState } from 'react';
import {
  Button,
  Input,
  Badge,
  IconSearch,
  IconMenu,
  IconLogOut,
  IconSliders,
  IconBuilding,
} from '@vdbus/design-system';
import { useAuth } from '../auth/AuthContext';
import { useI18n } from '../i18n/i18nContext';
import './Layout.css';

export interface AppLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ currentTab, onTabChange, children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { locale, setLocale, t } = useI18n();

  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: <IconSliders size={16} /> },
    { id: 'regulations', label: t('nav.regulations'), icon: <IconSliders size={16} /> },
    { id: 'vetc', label: t('nav.vetc'), icon: <IconSliders size={16} /> },
  ];

  return (
    <div className="vdbus-app">
      {/* Sidebar */}
      <aside className={`vdbus-sidebar ${isCollapsed ? 'vdbus-sidebar--collapsed' : ''}`}>
        <div className="vdbus-sidebar__brand">
          {!isCollapsed && <span className="vdbus-sidebar__logo">VDBus TMS</span>}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          >
            <IconMenu size={16} />
          </Button>
        </div>

        <nav className="vdbus-sidebar__nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`vdbus-sidebar__link ${currentTab === item.id ? 'vdbus-sidebar__link--active' : ''}`}
              onClick={() => onTabChange(item.id)}
              title={isCollapsed ? item.label : undefined}
            >
              {item.icon}
              {!isCollapsed && <span className="vdbus-sidebar__link-text">{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Area */}
      <div className="vdbus-main-area">
        {/* Header */}
        <header className="vdbus-header">
          <div className="vdbus-header__left">
            <div className="vdbus-header__tenant">
              <IconBuilding size={16} />
              <span>{user?.tenantName || 'VDBus Logistics'}</span>
              <Badge variant="info">Doanh nghiệp</Badge>
            </div>
            <div className="vdbus-header__search">
              <Input
                size="sm"
                placeholder={t('common.search')}
                prefixElement={<IconSearch size={14} />}
              />
            </div>
          </div>

          <div className="vdbus-header__right">
            {/* Locale Selector */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocale(locale === 'vi' ? 'en' : 'vi')}
              title="Đổi ngôn ngữ"
            >
              {locale.toUpperCase()}
            </Button>

            {/* Dark/Light Mode */}
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              Giao diện
            </Button>

            {/* User Profile */}
            <div className="vdbus-header__user">
              <span>{user?.fullName || 'Điều phối viên'}</span>
              <Badge variant="neutral">{user?.roleName || 'Dispatcher'}</Badge>
            </div>

            {/* Logout */}
            <Button variant="ghost" size="sm" onClick={logout} title={t('auth.logout')}>
              <IconLogOut size={16} />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="vdbus-content">{children}</main>
      </div>
    </div>
  );
};
