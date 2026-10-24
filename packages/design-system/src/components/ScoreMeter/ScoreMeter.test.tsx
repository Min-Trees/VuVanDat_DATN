import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ScoreMeter } from './ScoreMeter';

describe('ScoreMeter Component', () => {
  it('renders score and label correctly', () => {
    render(<ScoreMeter score={88} label="Điểm phù hợp" />);
    expect(screen.getByText('Điểm phù hợp')).toBeDefined();
    expect(screen.getByText('88/100')).toBeDefined();
  });

  it('clamps score within 0 to 100', () => {
    render(<ScoreMeter score={120} />);
    expect(screen.getByText('100/100')).toBeDefined();
  });
});
