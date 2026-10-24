import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AxleSchema, AxleInfo } from './AxleSchema';

describe('AxleSchema Component', () => {
  const mockAxles: AxleInfo[] = [
    {
      axleIndex: 1,
      axleType: 'front',
      loadKg: 5200,
      limitKg: 6000,
      tires: [
        { position: 'FL', pressurePsi: 115, tempCelsius: 42, status: 'normal' },
        { position: 'FR', pressurePsi: 114, tempCelsius: 43, status: 'normal' }
      ]
    },
    {
      axleIndex: 2,
      axleType: 'rear',
      loadKg: 9800,
      limitKg: 10000,
      tires: [
        { position: 'RL', pressurePsi: 116, tempCelsius: 45, status: 'normal' },
        { position: 'RR', pressurePsi: 115, tempCelsius: 44, status: 'normal' }
      ]
    }
  ];

  it('renders axles and tire pressures correctly', () => {
    render(<AxleSchema axles={mockAxles} />);
    expect(screen.getByText('2 trục')).toBeDefined();
    expect(screen.getAllByText('115 PSI').length).toBe(2);
    expect(screen.getByText('114 PSI')).toBeDefined();
  });
});
