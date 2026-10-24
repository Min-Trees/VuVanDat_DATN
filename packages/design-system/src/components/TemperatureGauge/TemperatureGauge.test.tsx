import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TemperatureGauge } from './TemperatureGauge';

describe('TemperatureGauge Component', () => {
  it('renders temperature and normal status within target range', () => {
    render(<TemperatureGauge temperature={-18.2} targetMin={-20} targetMax={-16} label="Thùng đông lạnh" />);
    expect(screen.getByText('-18.2')).toBeDefined();
    expect(screen.getByText('Thùng đông lạnh')).toBeDefined();
    expect(screen.getByText('Đạt chuẩn')).toBeDefined();
  });

  it('renders critical badge when temperature severely deviates', () => {
    render(<TemperatureGauge temperature={-10.0} targetMin={-20} targetMax={-16} />);
    expect(screen.getByText('-10.0')).toBeDefined();
    expect(screen.getByText('Vượt ngưỡng nghiêm trọng')).toBeDefined();
  });
});
