import { useState } from 'react';
import {
  PageHeader,
  Button,
  DataTable,
  Column,
  Badge,
  MapPanel,
  IconRefresh,
  IconDownload,
} from '@vdbus/design-system';
import { useI18n } from '../i18n/i18nContext';

interface ShipmentRow {
  id: string;
  code: string;
  route: string;
  vehicle: string;
  weightTons: number;
  status: 'running' | 'dispatching' | 'completed';
}

const initialShipments: ShipmentRow[] = [
  { id: '1', code: 'CH-2026-0881', route: 'Hà Nội - Hải Phòng (QL5B)', vehicle: '29C-482.11', weightTons: 14.5, status: 'running' },
  { id: '2', code: 'CH-2026-0882', route: 'KCN Bắc Ninh - Cảng Cát Lái', vehicle: '51D-992.34', weightTons: 22.0, status: 'dispatching' },
  { id: '3', code: 'CH-2026-0883', route: 'Đà Nẵng - Quy Nhơn (QL1A)', vehicle: '43C-311.02', weightTons: 8.2, status: 'completed' },
];

export const DashboardPage = () => {
  const { t, formatDateTime } = useI18n();
  const [data] = useState<ShipmentRow[]>(initialShipments);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const columns: Column<ShipmentRow>[] = [
    { key: 'code', header: 'Mã chuyến', width: 150 },
    { key: 'route', header: 'Tuyến đường vận chuyển' },
    { key: 'vehicle', header: 'Biển số xe' },
    {
      key: 'weightTons',
      header: 'Tải trọng (Tấn)',
      isNumeric: true,
      render: (val: number) => val.toFixed(1),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (status: ShipmentRow['status']) => {
        if (status === 'running') return <Badge variant="info">Đang chạy</Badge>;
        if (status === 'dispatching') return <Badge variant="neutral">Chờ điều xe</Badge>;
        return <Badge variant="success">Hoàn thành</Badge>;
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('nav.dashboard')}
        subtitle={`Cập nhật lúc ${formatDateTime(new Date())}`}
        breadcrumbs={[
          { label: 'Hệ thống' },
          { label: t('nav.dashboard') },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm">
              <IconRefresh size={14} /> {t('common.refresh')}
            </Button>
            <Button variant="primary" size="sm">
              <IconDownload size={14} /> {t('common.export')}
            </Button>
          </>
        }
      />

      {/* Map Panel with telemetry simulator & Mock Data Badge */}
      <div style={{ marginBottom: '20px' }}>
        <MapPanel
          title="Bản đồ giám sát lộ trình đoàn xe thời gian thực"
          isSimulated={true}
          height={320}
        />
      </div>

      {/* Shipments Table */}
      <DataTable
        data={data}
        columns={columns}
        rowKey={(r) => r.id}
        selectedRowKeys={selectedKeys}
        onSelectRow={(key, sel) => {
          setSelectedKeys((prev) => (sel ? [...prev, key] : prev.filter((k) => k !== key)));
        }}
        onSelectAll={(sel) => {
          setSelectedKeys(sel ? data.map((d) => d.id) : []);
        }}
        pagination={{
          pageIndex: 1,
          pageSize: 10,
          totalItems: data.length,
          onPageChange: () => {},
        }}
      />
    </div>
  );
};
