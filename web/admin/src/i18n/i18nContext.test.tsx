import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { I18nProvider, useI18n } from './i18nContext';

const TestComponent = () => {
  const { t, formatCurrencyVnd } = useI18n();
  return (
    <div>
      <span>{t('app.title')}</span>
      <span>{formatCurrencyVnd(1500000)}</span>
    </div>
  );
};

describe('I18nContext in Web Admin', () => {
  it('translates app.title in Vietnamese by default', () => {
    render(
      <I18nProvider>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByText('VDBus Logistics Platform')).toBeDefined();
    expect(screen.getByText(/1\.500\.000/)).toBeDefined();
  });
});
