import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FleetMapPage } from './FleetMapPage';
import { I18nProvider } from '../i18n/i18nContext';

// Mock SignalR
vi.mock('@microsoft/signalr', () => {
  return {
    HubConnectionBuilder: vi.fn().mockImplementation(() => ({
      withUrl: vi.fn().mockReturnThis(),
      withAutomaticReconnect: vi.fn().mockReturnThis(),
      build: vi.fn().mockReturnValue({
        on: vi.fn(),
        start: vi.fn().mockResolvedValue(undefined),
        invoke: vi.fn().mockResolvedValue(undefined),
        stop: vi.fn().mockResolvedValue(undefined),
      }),
    })),
  };
});

describe('FleetMapPage', () => {
  it('renders page header, vehicles list and telematics inspector', async () => {
    render(
      <I18nProvider>
        <FleetMapPage />
      </I18nProvider>
    );

    expect(await screen.findByText('Bản đồ Giám sát Đội xe Realtime')).toBeDefined();
    expect(screen.getAllByText('43C-189.24').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Kho Tổng Miền Bắc (Hà Nội)')).toBeDefined();
    expect(screen.getByText('Vận tốc GPS')).toBeDefined();
  });
});
