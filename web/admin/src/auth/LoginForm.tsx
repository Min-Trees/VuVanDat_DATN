import React, { useState } from 'react';
import { Button, Input, FormField, Banner } from '@vdbus/design-system';
import { useAuth } from './AuthContext';
import { useI18n } from '../i18n/i18nContext';

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const { t } = useI18n();

  const [email, setEmail] = useState('admin@vdbus.vn');
  const [password, setPassword] = useState('AdminPassword123!');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--vdbus-color-bg-canvas)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          padding: 'var(--vdbus-space-6)',
          backgroundColor: 'var(--vdbus-color-bg-surface)',
          border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
          borderRadius: 'var(--vdbus-radius-md)',
          boxShadow: 'var(--vdbus-shadow-md)',
        }}
      >
        <div style={{ marginBottom: 'var(--vdbus-space-5)', textAlign: 'left' }}>
          <h2
            style={{
              margin: '0 0 var(--vdbus-space-1) 0',
              fontSize: 'var(--vdbus-font-size-lg)',
              fontWeight: 'var(--vdbus-font-weight-semibold)',
              color: 'var(--vdbus-color-text-primary)',
            }}
          >
            {t('app.title')}
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 'var(--vdbus-font-size-sm)',
              color: 'var(--vdbus-color-text-secondary)',
            }}
          >
            {t('app.subtitle')}
          </p>
        </div>

        {error && (
          <div style={{ marginBottom: 'var(--vdbus-space-4)' }}>
            <Banner variant="error">{error}</Banner>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <FormField label={t('auth.email')} required>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ten@doanhnghiep.vn"
              required
            />
          </FormField>

          <FormField label={t('auth.password')} required>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
            />
          </FormField>

          <div style={{ marginTop: 'var(--vdbus-space-5)' }}>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              style={{ width: '100%' }}
            >
              {t('auth.login')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
