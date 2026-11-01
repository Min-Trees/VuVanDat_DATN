import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PnLPage } from './PnLPage';
import { I18nProvider } from '../i18n/i18nContext';

describe('PnLPage', () => {
  it('renders PnL dashboard overview cards and vehicle breakdown table', async () => {
    render(
      <I18nProvider>
        <PnLPage />
      </I18nProvider>
    );

    expect(await screen.findByText('Báo cáo Lãi lỗ (P&L) đa chiều')).toBeDefined();
    expect(screen.getByText('Tổng Doanh thu gộp')).toBeDefined();
    expect(screen.getByText('Tổng Chi phí trực tiếp')).toBeDefined();
    expect(screen.getByText('Lợi nhuận gộp (Gross Profit)')).toBeDefined();
    expect(screen.getByText('43C-189.24')).toBeDefined();
  });

  it('switches between dimensions correctly', async () => {
    render(
      <I18nProvider>
        <PnLPage />
      </I18nProvider>
    );

    const tripTab = screen.getByText(/Theo Chuyến xe/);
    fireEvent.click(tripTab);
    expect(await screen.findByText('CH-202610-001')).toBeDefined();

    const customerTab = screen.getByText(/Theo Khách hàng/);
    fireEvent.click(customerTab);
    expect(await screen.findByText('Masan Consumer Miền Trung')).toBeDefined();

    const routeTab = screen.getByText(/Theo Tuyến đường/);
    fireEvent.click(routeTab);
    expect(await screen.findByText(/Đà Nẵng \(Hòa Cầm\) → Quảng Nam \(KCN Chu Lai\)/)).toBeDefined();
  });
});
