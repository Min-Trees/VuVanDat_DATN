import React, { createContext, useContext, useState, useCallback } from 'react';

export type Locale = 'vi' | 'en';

const translations: Record<Locale, Record<string, string>> = {
  vi: {
    'app.title': 'VDBus Logistics Platform',
    'app.subtitle': 'Quản trị Điều phối Vận tải Đa thuê bao',
    'nav.dashboard': 'Tổng quan',
    'nav.orders': 'Đơn hàng',
    'nav.dispatch': 'Bàn điều phối',
    'nav.fleet': 'Đội xe & Thiết bị',
    'nav.regulations': 'Quy định cấm giờ',
    'nav.vetc': 'Thu phí tự động (VETC)',
    'nav.audit': 'Nhật ký kiểm toán',
    'nav.settings': 'Cấu hình hệ thống',
    'auth.login': 'Đăng nhập',
    'auth.logout': 'Đăng xuất',
    'auth.email': 'Email tài khoản',
    'auth.password': 'Mật khẩu',
    'auth.tenant': 'Doanh nghiệp',
    'common.save': 'Lưu thay đổi',
    'common.cancel': 'Hủy',
    'common.search': 'Tìm kiếm',
    'common.filter': 'Bộ lọc',
    'common.export': 'Xuất báo cáo',
    'common.simulatedData': 'Dữ liệu mô phỏng',
    'common.refresh': 'Làm mới',
  },
  en: {
    'app.title': 'VDBus Logistics Platform',
    'app.subtitle': 'Enterprise Multi-tenant TMS',
    'nav.dashboard': 'Overview',
    'nav.orders': 'Orders',
    'nav.dispatch': 'Dispatch Console',
    'nav.fleet': 'Fleet & Devices',
    'nav.regulations': 'Traffic Regulations',
    'nav.vetc': 'Electronic Toll Collection',
    'nav.audit': 'Audit Logs',
    'nav.settings': 'System Settings',
    'auth.login': 'Sign in',
    'auth.logout': 'Sign out',
    'auth.email': 'Account Email',
    'auth.password': 'Password',
    'auth.tenant': 'Company',
    'common.save': 'Save Changes',
    'common.cancel': 'Cancel',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.simulatedData': 'Simulated Data',
    'common.refresh': 'Refresh',
  },
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  formatCurrencyVnd: (amount: number) => string;
  formatDateTime: (date: Date | string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>('vi');

  const t = useCallback(
    (key: string): string => {
      return translations[locale]?.[key] || key;
    },
    [locale]
  );

  const formatCurrencyVnd = useCallback((amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }, []);

  const formatDateTime = useCallback(
    (date: Date | string): string => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(d);
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, formatCurrencyVnd, formatDateTime }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};
