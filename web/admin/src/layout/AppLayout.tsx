import React, { useState } from 'react';
import {
  Button,
  Input,
  Badge,
  IconMenu,
  IconLogOut,
  IconSliders,
  IconBuilding,
  IconTruck,
  IconUser,
  IconFileText,
  IconMapPin,
  IconRadio,
  IconClock,
} from '@vdbus/design-system';
import { useAuth } from '../auth/AuthContext';
import { useI18n } from '../i18n/i18nContext';
import './Layout.css';

export interface AppLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

interface NavGroup {
  groupName: string;
  items: {
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }[];
}

export const AppLayout: React.FC<AppLayoutProps> = ({ currentTab, onTabChange, children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAlertMenu, setShowAlertMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const { locale, setLocale, t } = useI18n();

  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // 5 Phân nhóm nghiệp vụ chuẩn Enterprise SaaS TMS
  const navGroups: NavGroup[] = [
    {
      groupName: 'TỔNG QUAN',
      items: [
        { id: 'dashboard', label: t('nav.dashboard') || 'Bàn điều hành', icon: <IconSliders size={16} /> },
      ],
    },
    {
      groupName: 'VẬN HÀNH & ĐIỀU ĐỘ',
      items: [
        { id: 'orders', label: t('nav.orders') || 'Đơn hàng vận tải', icon: <IconFileText size={16} />, badge: '12' },
        { id: 'dispatch', label: t('nav.dispatch') || 'Bàn điều độ gom chuyến', icon: <IconSliders size={16} />, badge: 'Mới' },
        { id: 'fleet-map', label: t('nav.fleetMap') || 'Bản đồ giám sát xe', icon: <IconMapPin size={16} /> },
        { id: 'axle-load', label: t('nav.axleLoad') || 'Kiểm soát tải trọng trục', icon: <IconTruck size={16} /> },
      ],
    },
    {
      groupName: 'AN TOÀN & GIÁM SÁT IOT',
      items: [
        { id: 'telematics', label: t('nav.telematics') || 'Chuỗi lạnh & Lốp TPMS', icon: <IconRadio size={16} />, badge: 'Cảnh báo' },
        { id: 'hos-detention', label: t('nav.hosDetention') || 'Giờ lái HOS & Dừng chờ', icon: <IconClock size={16} /> },
        { id: 'regulations', label: t('nav.regulations') || 'Luật & Giờ cấm tải', icon: <IconSliders size={16} /> },
      ],
    },
    {
      groupName: 'ĐỘI XE & TÀI SẢN',
      items: [
        { id: 'vehicles', label: t('nav.vehicles') || 'Hồ sơ Xe & Rơ-moóc', icon: <IconTruck size={16} /> },
        { id: 'drivers', label: t('nav.drivers') || 'Danh sách Tài xế', icon: <IconUser size={16} /> },
        { id: 'fuel', label: t('nav.fuel') || 'Nhiên liệu & Bảo dưỡng', icon: <IconSliders size={16} /> },
      ],
    },
    {
      groupName: 'TÀI CHÍNH & KHÁCH HÀNG',
      items: [
        { id: 'customers', label: t('nav.customers') || 'Khách hàng & Chủ hàng', icon: <IconBuilding size={16} /> },
        { id: 'vetc', label: t('nav.vetc') || 'Đối soát Trạm BOT', icon: <IconSliders size={16} /> },
        { id: 'invoices', label: t('nav.invoices') || 'Hóa đơn & Doanh thu', icon: <IconFileText size={16} /> },
        { id: 'pnl', label: t('nav.pnl') || 'Lãi lỗ theo Chuyến (P&L)', icon: <IconFileText size={16} /> },
        { id: 'subscriptions', label: t('nav.subscriptions') || 'Đa thuê bao & Gói cước', icon: <IconBuilding size={16} /> },
      ],
    },
  ];

  // Danh mục cảnh báo khẩn cấp hệ thống
  const activeAlerts = [
    { id: 1, type: 'error', text: 'Xe 43C-189.24: Nhiệt độ khoang lạnh -14.2°C (Vượt ngưỡng an toàn -16°C)' },
    { id: 2, type: 'warning', text: 'Tài xế Nguyễn Văn Tuấn: Lái xe liên tục 3h48m (Sắp chạm ngưỡng tối đa 4h)' },
    { id: 3, type: 'warning', text: 'Xe 29H-882.19: Sắp vào giờ cấm tải nội đô Đà Nẵng (16:30 - 19:00)' },
    { id: 4, type: 'info', text: 'Trạm BOT Điện Bàn: Đã ghi nhận trừ phí tự động ePass 76.000 đ' },
  ];

  return (
    <div className="vdbus-app">
      {/* Sidebar Doanh nghiệp Phân nhóm */}
      <aside className={`vdbus-sidebar ${isCollapsed ? 'vdbus-sidebar--collapsed' : ''}`}>
        <div className="vdbus-sidebar__brand">
          {!isCollapsed && (
            <div className="vdbus-sidebar__logo-container">
              <span className="vdbus-sidebar__logo">VDBUS TMS</span>
              <span className="vdbus-sidebar__tagline">Enterprise Logistics</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          >
            <IconMenu size={16} />
          </Button>
        </div>

        <nav className="vdbus-sidebar__nav" aria-label="Menu điều hướng chính">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="vdbus-sidebar__group">
              {!isCollapsed && (
                <div className="vdbus-sidebar__group-title">{group.groupName}</div>
              )}
              {group.items.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    className={`vdbus-sidebar__link ${isActive ? 'vdbus-sidebar__link--active' : ''}`}
                    onClick={() => onTabChange(item.id)}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <span className="vdbus-sidebar__icon">{item.icon}</span>
                    {!isCollapsed && (
                      <span className="vdbus-sidebar__link-text">{item.label}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span className={`vdbus-sidebar__badge ${item.badge === 'Cảnh báo' ? 'vdbus-sidebar__badge--alert' : ''}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Sidebar với thông tin phiên bản */}
        {!isCollapsed && (
          <div className="vdbus-sidebar__footer">
            <span className="vdbus-sidebar__version">Phiên bản 2.4.0-Enterprise</span>
            <span className="vdbus-sidebar__status-dot" title="Hệ thống trực tuyến 99.98%">Hoạt động</span>
          </div>
        )}
      </aside>

      {/* Vùng làm việc chính */}
      <div className="vdbus-main-area">
        {/* Header Cấp Doanh nghiệp */}
        <header className="vdbus-header">
          <div className="vdbus-header__left">
            <div className="vdbus-header__tenant" title="Tổ chức / Chi nhánh vận tải">
              <IconBuilding size={16} />
              <span className="vdbus-header__tenant-name">{user?.tenantName || 'Chi nhánh Đà Nẵng - Miền Trung'}</span>
              <Badge variant="info">Đa thuê bao</Badge>
            </div>
            <div className="vdbus-header__search">
              <Input
                placeholder="Tra cứu biển số xe, mã chuyến, mã đơn hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="sm"
              />
            </div>
          </div>

          <div className="vdbus-header__right">
            {/* Trung tâm Cảnh báo khẩn cấp */}
            <div className="vdbus-header__alert-wrapper">
              <button
                className="vdbus-header__alert-btn"
                onClick={() => setShowAlertMenu(!showAlertMenu)}
                title="Cảnh báo vận hành & an toàn"
              >
                <IconClock size={16} />
                <span className="vdbus-header__alert-count">3</span>
              </button>

              {showAlertMenu && (
                <div className="vdbus-alert-dropdown">
                  <div className="vdbus-alert-dropdown__header">
                    <strong>CẢNH BÁO VẬN HÀNH THỜI GIAN THỰC</strong>
                    <Badge variant="error">3 Khẩn cấp</Badge>
                  </div>
                  <div className="vdbus-alert-dropdown__body">
                    {activeAlerts.map((alert) => (
                      <div key={alert.id} className={`vdbus-alert-item vdbus-alert-item--${alert.type}`}>
                        <span className="vdbus-alert-item__bullet" />
                        <span className="vdbus-alert-item__text">{alert.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Chuyển đổi giao diện Sáng / Tối */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              aria-label="Chuyển đổi giao diện Sáng/Tối"
            >
              Giao diện
            </Button>

            {/* Chuyển đổi Ngôn ngữ */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocale(locale === 'vi' ? 'en' : 'vi')}
              aria-label="Chuyển đổi ngôn ngữ"
            >
              {locale.toUpperCase()}
            </Button>

            {/* Hồ sơ Người dùng */}
            <div className="vdbus-header__user">
              <div className="vdbus-header__avatar">
                {(user?.fullName || 'Điều vận viên').charAt(0)}
              </div>
              <div className="vdbus-header__user-info">
                <span className="vdbus-header__username">{user?.fullName || 'Vũ Văn Đạt'}</span>
                <span className="vdbus-header__role">Giám đốc Điều vận TMS</span>
              </div>
            </div>

            {/* Nút Đăng xuất */}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              aria-label="Đăng xuất khỏi hệ thống"
              title="Đăng xuất"
            >
              <IconLogOut size={16} />
            </Button>
          </div>
        </header>

        {/* Nội dung trang nghiệp vụ */}
        <main className="vdbus-content-area" role="main">
          {children}
        </main>
      </div>
    </div>
  );
};
