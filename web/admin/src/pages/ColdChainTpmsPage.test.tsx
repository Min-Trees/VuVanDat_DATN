import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ColdChainTpmsPage } from './ColdChainTpmsPage';
import { I18nProvider } from '../i18n/i18nContext';

describe('ColdChainTpmsPage', () => {
  it('renders cold chain page header, gauge and time series chart', async () => {
    render(
      <I18nProvider>
        <ColdChainTpmsPage />
      </I18nProvider>
    );

    expect(await screen.findByText('Giám sát Chuỗi lạnh & Áp suất lốp TPMS')).toBeDefined();
    expect(screen.getByText('Chọn xe đông lạnh:')).toBeDefined();
    expect(screen.getByText('Biểu đồ biến thiên nhiệt độ theo thời gian (Hôm nay)')).toBeDefined();
  });

  it('switches to TPMS tab and renders axle schema', async () => {
    render(
      <I18nProvider>
        <ColdChainTpmsPage />
      </I18nProvider>
    );

    const tpmsTab = screen.getByText(/Áp suất & Nhiệt độ lốp \(TPMS\)/);
    fireEvent.click(tpmsTab);

    expect(await screen.findByText('Chọn xe kiểm tra áp suất lốp:')).toBeDefined();
    expect(screen.getByText(/Quy chuẩn kỹ thuật áp suất & nhiệt độ lốp xe tải/)).toBeDefined();
    expect(screen.getByText('Tổng lốp đang giám sát')).toBeDefined();
  });
});
