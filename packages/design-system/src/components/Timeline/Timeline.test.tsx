import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Timeline, TimelineStep } from './Timeline';

describe('Timeline Component', () => {
  it('renders all step titles and times', () => {
    const steps: TimelineStep[] = [
      { title: 'Tạo đơn hàng', timestamp: '08:00', status: 'completed' },
      { title: 'Đã gán xe', timestamp: '08:30', status: 'completed' },
      { title: 'Đang giao hàng', timestamp: '09:15', status: 'current' },
      { title: 'Đã giao thành công', status: 'upcoming' },
    ];

    render(<Timeline steps={steps} />);

    expect(screen.getByText('Tạo đơn hàng')).toBeDefined();
    expect(screen.getByText('Đang giao hàng')).toBeDefined();
    expect(screen.getByText('Đã giao thành công')).toBeDefined();
    expect(screen.getByText('08:00')).toBeDefined();
  });
});
