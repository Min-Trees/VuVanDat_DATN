import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from './Badge';
import { MockDataBadge } from '../MockDataBadge/MockDataBadge';

describe('Badge & MockDataBadge Components', () => {
  it('renders badge with correct text and variant class', () => {
    const { container } = render(<Badge variant="warning">Cảnh báo nhiệt độ</Badge>);
    expect(screen.getByText('Cảnh báo nhiệt độ')).toBeDefined();
    expect(container.firstChild).toHaveProperty('className', expect.stringContaining('vdbus-badge--warning'));
  });

  it('renders MockDataBadge with default simulated data label', () => {
    render(<MockDataBadge />);
    expect(screen.getByText('Dữ liệu mô phỏng')).toBeDefined();
  });
});
