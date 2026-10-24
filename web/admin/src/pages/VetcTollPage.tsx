import { useState } from 'react';
import {
  PageHeader,
  Button,
  DataTable,
  Column,
  MockDataBadge,
  Badge,
  Input,
  IconSearch,
  IconRefresh,
} from '@vdbus/design-system';
import { useI18n } from '../i18n/i18nContext';

interface TollTransactionRow {
  id: string;
  transactionCode: string;
  stationName: string;
  licensePlate: string;
  tollAmountVnd: number;
  timestamp: string;
  isSimulated: boolean;
  provider: string;
}

const mockTransactions: TollTransactionRow[] = [
  {
    id: '1',
    transactionCode: 'MOCK-VETC-881923',
    stationName: 'Trạm BOT Pháp Vân - Cầu Giẽ',
    licensePlate: '29C-482.11',
    tollAmountVnd: 75000,
    timestamp: '2026-10-24T06:45:00Z',
    isSimulated: true,
    provider: 'VETC Mock Provider',
  },
  {
    id: '2',
    transactionCode: 'MOCK-VETC-881924',
    stationName: 'Trạm thu phí Cao tốc Cầu Giẽ - Ninh Bình',
    licensePlate: '29C-482.11',
    tollAmountVnd: 110000,
    timestamp: '2026-10-24T07:30:00Z',
    isSimulated: true,
    provider: 'VETC Mock Provider',
  },
  {
    id: '3',
    transactionCode: 'REAL-EPASS-411209',
    stationName: 'Trạm thu phí BOT Long Phước (TP.HCM)',
    licensePlate: '51D-992.34',
    tollAmountVnd: 40000,
    timestamp: '2026-10-24T08:15:00Z',
    isSimulated: false,
    provider: 'ePass Real API',
  },
];

export const VetcTollPage = () => {
  const { t, formatCurrencyVnd, formatDateTime } = useI18n();
  const [transactions] = useState<TollTransactionRow[]>(mockTransactions);
  const [filterPlate, setFilterPlate] = useState('');

  const columns: Column<TollTransactionRow>[] = [
    { key: 'transactionCode', header: 'Mã giao dịch', width: 170 },
    { key: 'stationName', header: 'Trạm thu phí' },
    { key: 'licensePlate', header: 'Biển số xe', width: 130 },
    {
      key: 'tollAmountVnd',
      header: 'Cước phí',
      isNumeric: true,
      render: (amount: number) => formatCurrencyVnd(amount),
    },
    {
      key: 'timestamp',
      header: 'Thời gian qua trạm',
      render: (ts: string) => formatDateTime(ts),
    },
    {
      key: 'isSimulated',
      header: 'Nguồn dữ liệu',
      render: (isSim: boolean) => (isSim ? <MockDataBadge /> : <Badge variant="success">Dữ liệu thực</Badge>),
    },
  ];

  const filtered = transactions.filter((t) =>
    t.licensePlate.toLowerCase().includes(filterPlate.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title={t('nav.vetc')}
        subtitle="Đối soát dữ liệu giao dịch trạm thu phí tự động không dừng (VETC / ePass)"
        breadcrumbs={[{ label: 'Đối soát' }, { label: t('nav.vetc') }]}
        actions={
          <Button variant="outline" size="sm">
            <IconRefresh size={14} /> Làm mới đối soát
          </Button>
        }
      />

      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ width: '240px' }}>
          <Input
            size="sm"
            placeholder="Lọc theo biển số xe..."
            value={filterPlate}
            onChange={(e) => setFilterPlate(e.target.value)}
            prefixElement={<IconSearch size={14} />}
          />
        </div>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        rowKey={(r) => r.id}
        pagination={{
          pageIndex: 1,
          pageSize: 10,
          totalItems: filtered.length,
          onPageChange: () => {},
        }}
      />
    </div>
  );
};
