import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HosDetentionPage } from './HosDetentionPage';
import { ToastProvider } from '@vdbus/design-system';
import { I18nProvider } from '../i18n/i18nContext';

describe('HosDetentionPage', () => {
  it('renders HOS banner, metric cards and drivers table', async () => {
    render(
      <ToastProvider>
        <I18nProvider>
          <HosDetentionPage />
        </I18nProvider>
      </ToastProvider>
    );

    expect(await screen.findByText('Giám sát Giờ lái (HOS) & Quản lý Phí neo xe (Detention)')).toBeDefined();
    expect(screen.getByText(/Hạn mức giờ lái được cấu hình theo quy định nội bộ và cần chuyên gia pháp lý xác nhận/)).toBeDefined();
    expect(screen.getByText('Tài xế đang vận hành')).toBeDefined();
    expect(screen.getByText('Nguyễn Văn Tuấn')).toBeDefined();
  });

  it('switches to Detention tab and renders detention records table', async () => {
    render(
      <ToastProvider>
        <I18nProvider>
          <HosDetentionPage />
        </I18nProvider>
      </ToastProvider>
    );

    const detentionTab = screen.getByText(/Phí neo xe kho hàng \(Detention Billing\)/);
    fireEvent.click(detentionTab);

    expect(await screen.findByText('Tổng sự kiện neo xe')).toBeDefined();
    expect(screen.getByText('Kho Tổng Miền Bắc (Hà Nội)')).toBeDefined();
    expect(screen.getByText('Cảng Cát Lái (TP. Hồ Chí Minh)')).toBeDefined();
  });
});
