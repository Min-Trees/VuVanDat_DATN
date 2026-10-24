import { useState } from 'react';
import { DataTable, Column } from './DataTable';
import { Badge } from '../Badge/Badge';

export default {
  title: 'Components/DataTable',
  component: DataTable,
};

interface ShipmentDemo {
  id: string;
  code: string;
  customer: string;
  driver: string;
  vehicle: string;
  status: 'pending' | 'in_transit' | 'delivered';
  weightKg: number;
}

const mockShipments: ShipmentDemo[] = [
  { id: '1', code: 'DH-2026-001', customer: 'Vinamilk Logistics', driver: 'Nguyễn Văn An', vehicle: '29C-123.45', status: 'in_transit', weightKg: 8500 },
  { id: '2', code: 'DH-2026-002', customer: 'Masan Consumer', driver: 'Trần Văn Bình', vehicle: '51D-987.65', status: 'pending', weightKg: 12000 },
  { id: '3', code: 'DH-2026-003', customer: 'Unilever VN', driver: 'Lê Văn Cường', vehicle: '43C-555.22', status: 'delivered', weightKg: 4200 },
];

export const Default = () => {
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['1']);

  const columns: Column<ShipmentDemo>[] = [
    { key: 'code', header: 'Mã đơn', width: 140 },
    { key: 'customer', header: 'Khách hàng' },
    { key: 'driver', header: 'Tài xế' },
    { key: 'vehicle', header: 'Biển số xe' },
    {
      key: 'weightKg',
      header: 'Tải trọng (kg)',
      isNumeric: true,
      render: (val: number) => val.toLocaleString('vi-VN'),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (status: ShipmentDemo['status']) => {
        if (status === 'in_transit') return <Badge variant="info">Đang chạy</Badge>;
        if (status === 'pending') return <Badge variant="neutral">Chờ điều xe</Badge>;
        return <Badge variant="success">Đã giao</Badge>;
      },
    },
  ];

  return (
    <DataTable
      data={mockShipments}
      columns={columns}
      rowKey={(r) => r.id}
      selectedRowKeys={selectedKeys}
      onSelectRow={(key, selected) => {
        setSelectedKeys((prev) => (selected ? [...prev, key] : prev.filter((k) => k !== key)));
      }}
      onSelectAll={(selected) => {
        setSelectedKeys(selected ? mockShipments.map((r) => r.id) : []);
      }}
      pagination={{
        pageIndex: 1,
        pageSize: 10,
        totalItems: 3,
        onPageChange: () => {},
      }}
    />
  );
};
