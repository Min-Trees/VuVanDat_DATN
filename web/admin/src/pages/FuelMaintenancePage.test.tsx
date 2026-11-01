import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FuelMaintenancePage } from './FuelMaintenancePage';
import { I18nProvider } from '../i18n/i18nContext';

describe('FuelMaintenancePage', () => {
  it('renders fuel entries and abnormality status badges', async () => {
    render(
      <I18nProvider>
        <FuelMaintenancePage />
      </I18nProvider>
    );

    expect(await screen.findByText('Quản lý Nhiên liệu & Bảo dưỡng Đội xe')).toBeDefined();
    expect(screen.getByText('43C-189.24')).toBeDefined();
    expect(screen.getByText('Petrolimex Cửa hàng 12 (Hòa Cầm)')).toBeDefined();
    expect(screen.getByText('Cần đối soát')).toBeDefined();
  });

  it('switches to maintenance and document wallet tabs', async () => {
    render(
      <I18nProvider>
        <FuelMaintenancePage />
      </I18nProvider>
    );

    const maintTab = screen.getByText(/Lịch Bảo dưỡng Phương tiện/);
    fireEvent.click(maintTab);
    expect(await screen.findByText('BD-202610-001')).toBeDefined();
    expect(screen.getByText('Xưởng dịch vụ Hino Da Nang')).toBeDefined();

    const docTab = screen.getByText(/Ví Hồ sơ & Hạn Đăng kiểm/);
    fireEvent.click(docTab);
    expect(await screen.findByText('KD-4301S-19284')).toBeDefined();
    expect(screen.getByText('Quá hạn 17 ngày')).toBeDefined();
  });
});
