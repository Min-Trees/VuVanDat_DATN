import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SubscriptionsCopilotPage } from './SubscriptionsCopilotPage';
import { I18nProvider } from '../i18n/i18nContext';

describe('SubscriptionsCopilotPage', () => {
  it('renders AI copilot initial greeting and handles sample question click', async () => {
    render(
      <I18nProvider>
        <SubscriptionsCopilotPage />
      </I18nProvider>
    );

    expect(await screen.findByText('Trợ lý AI Copilot & Thuê bao Doanh nghiệp')).toBeDefined();
    expect(screen.getByText(/Chào bạn, tôi là VDBus AI Copilot/)).toBeDefined();

    const sampleBtn = screen.getByText(/Xe nào trong đội xe có mức tiêu hao nhiên liệu bất thường nhất tháng này\?/);
    fireEvent.click(sampleBtn);

    expect(await screen.findByText(/43H-012.88/)).toBeDefined();
    expect(screen.getByText(/Trích dẫn nguồn dữ liệu/)).toBeDefined();
  });

  it('switches to subscriptions tab and shows quota progress', async () => {
    render(
      <I18nProvider>
        <SubscriptionsCopilotPage />
      </I18nProvider>
    );

    const subTab = screen.getByText('Định mức Thuê bao & Quota');
    fireEvent.click(subTab);

    expect(await screen.findByText('48 / 100 xe')).toBeDefined();
    expect(screen.getByText('420 / 2.000 đơn')).toBeDefined();
    expect(screen.getByText('840K / 2.000K pings')).toBeDefined();
    expect(screen.getByText('Gói Doanh Nghiệp (Enterprise)')).toBeDefined();
  });
});
