import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AxleLoadPage } from './AxleLoadPage';
import { I18nProvider } from '../i18n/i18nContext';

describe('AxleLoadPage', () => {
  it('renders axle load simulation header, truck bed SVG and meters', async () => {
    render(
      <I18nProvider>
        <AxleLoadPage />
      </I18nProvider>
    );

    expect(await screen.findByText('Bàn Mô phỏng Xếp hàng & Phân bổ Tải trọng Trục (Axle Load)')).toBeDefined();
    expect(screen.getByText(/Công thức mô-men tĩnh học/)).toBeDefined();
    expect(screen.getByText('Mặt bằng bố trí Pallet hàng hóa trong thùng xe (Top-down Visual Floorplan)')).toBeDefined();
    expect(screen.getByText('Kết quả Tải trọng Trục xe & Tổng tải (GVW)')).toBeDefined();
  });

  it('triggers preset configuration updates correctly', async () => {
    render(
      <I18nProvider>
        <AxleLoadPage />
      </I18nProvider>
    );

    const rearHeavyBtn = screen.getByText('Cấu hình: Lệch đuôi');
    fireEvent.click(rearHeavyBtn);

    expect(await screen.findByText(/Cảnh báo quá tải trục sau/)).toBeDefined();
  });
});
