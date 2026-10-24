import { useState } from 'react';
import { ToastProvider } from '@vdbus/design-system';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { I18nProvider } from './i18n/i18nContext';
import { LoginForm } from './auth/LoginForm';
import { AppLayout } from './layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { OrdersPage } from './pages/OrdersPage';
import { DispatchConsolePage } from './pages/DispatchConsolePage';
import { InvoicesPage } from './pages/InvoicesPage';
import { RegulationsPage } from './pages/RegulationsPage';
import { VetcTollPage } from './pages/VetcTollPage';
import { CustomersPage } from './pages/CustomersPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { DriversPage } from './pages/DriversPage';
import { FleetMapPage } from './pages/FleetMapPage';
import { ColdChainTpmsPage } from './pages/ColdChainTpmsPage';
import { HosDetentionPage } from './pages/HosDetentionPage';
import { AxleLoadPage } from './pages/AxleLoadPage';

const MainContent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <span>Đang xác thực thông tin...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <AppLayout currentTab={currentTab} onTabChange={setCurrentTab}>
      {currentTab === 'dashboard' && <DashboardPage />}
      {currentTab === 'orders' && <OrdersPage />}
      {currentTab === 'dispatch' && <DispatchConsolePage />}
      {currentTab === 'fleet-map' && <FleetMapPage />}
      {currentTab === 'telematics' && <ColdChainTpmsPage />}
      {currentTab === 'hos-detention' && <HosDetentionPage />}
      {currentTab === 'axle-load' && <AxleLoadPage />}
      {currentTab === 'customers' && <CustomersPage />}
      {currentTab === 'vehicles' && <VehiclesPage />}
      {currentTab === 'drivers' && <DriversPage />}
      {currentTab === 'invoices' && <InvoicesPage />}
      {currentTab === 'regulations' && <RegulationsPage />}
      {currentTab === 'vetc' && <VetcTollPage />}
    </AppLayout>
  );
};

export const App = () => {
  return (
    <I18nProvider>
      <AuthProvider>
        <ToastProvider>
          <MainContent />
        </ToastProvider>
      </AuthProvider>
    </I18nProvider>
  );
};
