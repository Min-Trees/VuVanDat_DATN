import React, { useEffect, useState, useMemo } from 'react';
import {
  PageHeader,
  Button,
  DataTable,
  Column,
  Badge,
  MockDataBadge,
  Modal,
  FormField,
  Input,
  Select,
  IconPlus,
  IconSearch,
  IconRefresh,
  useToast,
} from '@vdbus/design-system';
import { apiClient } from '../services/apiClient';

export interface VehicleItem {
  id: string;
  licensePlate: string;
  type: string;
  makeModel: string;
  maxPayloadKg: number;
  cargoVolumeCbm: number;
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  axleCount: number;
  fuelConsumptionLitrePer100Km: number;
  status: string;
  currentLocationLat?: number;
  currentLocationLng?: number;
  isSimulated: boolean;
}

const fallbackVehicles: VehicleItem[] = [
  {
    id: 'v1111111-1111-1111-1111-111111111111',
    licensePlate: '43C-189.24',
    type: 'DryBox',
    makeModel: 'Hino 500 FG8JJ7A',
    maxPayloadKg: 8500,
    cargoVolumeCbm: 42,
    lengthMm: 7400,
    widthMm: 2350,
    heightMm: 2400,
    axleCount: 2,
    fuelConsumptionLitrePer100Km: 18.5,
    status: 'Available',
    isSimulated: true,
  },
  {
    id: 'v2222222-2222-2222-2222-222222222222',
    licensePlate: '43H-012.88',
    type: 'Container',
    makeModel: 'Hyundai HD320 Đầu kéo',
    maxPayloadKg: 30000,
    cargoVolumeCbm: 75,
    lengthMm: 12200,
    widthMm: 2500,
    heightMm: 2600,
    axleCount: 4,
    fuelConsumptionLitrePer100Km: 32.0,
    status: 'OnTrip',
    isSimulated: true,
  },
  {
    id: 'v3333333-3333-3333-3333-333333333333',
    licensePlate: '43C-225.19',
    type: 'Refrigerated',
    makeModel: 'Isuzu FVR 900 Thùng lạnh',
    maxPayloadKg: 7800,
    cargoVolumeCbm: 38,
    lengthMm: 6800,
    widthMm: 2300,
    heightMm: 2350,
    axleCount: 2,
    fuelConsumptionLitrePer100Km: 21.0,
    status: 'Available',
    isSimulated: true,
  },
  {
    id: 'v4444444-4444-4444-4444-444444444444',
    licensePlate: '92C-156.40',
    type: 'Tarpaulin',
    makeModel: 'Thaco Auman C160',
    maxPayloadKg: 9100,
    cargoVolumeCbm: 45,
    lengthMm: 7600,
    widthMm: 2350,
    heightMm: 2500,
    axleCount: 2,
    fuelConsumptionLitrePer100Km: 19.0,
    status: 'Maintenance',
    isSimulated: true,
  },
];

const vehicleTypeLabels: Record<string, string> = {
  DryBox: 'Tải thùng kín',
  Tarpaulin: 'Tải thùng bạt',
  Container: 'Xe Container',
  Refrigerated: 'Xe đông lạnh',
  Flatbed: 'Xe sàn phẳng',
};

export const VehiclesPage: React.FC = () => {
  const { addToast } = useToast();
  const [vehicles, setVehicles] = useState<VehicleItem[]>(fallbackVehicles);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleItem | null>(null);

  const [formData, setFormData] = useState({
    licensePlate: '',
    type: 'DryBox',
    makeModel: '',
    maxPayloadKg: 8000,
    cargoVolumeCbm: 40,
    lengthMm: 7200,
    widthMm: 2300,
    heightMm: 2400,
    axleCount: 2,
    fuelConsumptionLitrePer100Km: 18.0,
    status: 'Available',
  });

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<VehicleItem[]>('/vehicles');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setVehicles(res.data);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchSearch =
        !searchTerm.trim() ||
        v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.makeModel.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || v.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [vehicles, searchTerm, statusFilter]);

  const handleOpenCreateModal = () => {
    setEditingVehicle(null);
    setFormData({
      licensePlate: '',
      type: 'DryBox',
      makeModel: '',
      maxPayloadKg: 8000,
      cargoVolumeCbm: 40,
      lengthMm: 7200,
      widthMm: 2300,
      heightMm: 2400,
      axleCount: 2,
      fuelConsumptionLitrePer100Km: 18.0,
      status: 'Available',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (vehicle: VehicleItem) => {
    setEditingVehicle(vehicle);
    setFormData({
      licensePlate: vehicle.licensePlate,
      type: vehicle.type,
      makeModel: vehicle.makeModel,
      maxPayloadKg: vehicle.maxPayloadKg,
      cargoVolumeCbm: vehicle.cargoVolumeCbm,
      lengthMm: vehicle.lengthMm,
      widthMm: vehicle.widthMm,
      heightMm: vehicle.heightMm,
      axleCount: vehicle.axleCount,
      fuelConsumptionLitrePer100Km: vehicle.fuelConsumptionLitrePer100Km,
      status: vehicle.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.licensePlate.trim() || !formData.makeModel.trim()) {
      addToast('Vui lòng nhập biển số và hãng xe.', 'error');
      return;
    }

    try {
      if (editingVehicle) {
        await apiClient.put(`/vehicles/${editingVehicle.id}`, {
          ...editingVehicle,
          ...formData,
        });
        setVehicles((prev) =>
          prev.map((v) => (v.id === editingVehicle.id ? { ...v, ...formData } : v))
        );
        addToast('Cập nhật phương tiện thành công.', 'success');
      } else {
        const newRecord: VehicleItem = {
          id: `v-local-${Date.now()}`,
          ...formData,
          isSimulated: true,
        };
        try {
          const res = await apiClient.post<VehicleItem>('/vehicles', {
            ...formData,
            isSimulated: true,
          });
          if (res.data?.id) {
            newRecord.id = res.data.id;
          }
        } catch {
          // Lưu local state
        }
        setVehicles((prev) => [newRecord, ...prev]);
        addToast('Thêm phương tiện mới thành công.', 'success');
      }
      setIsModalOpen(false);
    } catch {
      addToast('Có lỗi xảy ra khi lưu phương tiện.', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available':
        return <Badge variant="success">Sẵn sàng</Badge>;
      case 'OnTrip':
        return <Badge variant="info">Đang chạy</Badge>;
      case 'Maintenance':
        return <Badge variant="warning">Bảo dưỡng</Badge>;
      default:
        return <Badge variant="neutral">Không hoạt động</Badge>;
    }
  };

  const columns: Column<VehicleItem>[] = [
    {
      key: 'licensePlate',
      header: 'Biển số / Phương tiện',
      render: (val: string, row: VehicleItem) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 600, fontFamily: 'var(--vdbus-font-mono)' }}>{val}</span>
            {row.isSimulated && <MockDataBadge />}
          </div>
          <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-text-secondary)' }}>
            {row.makeModel}
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Loại xe',
      render: (val: string) => <span>{vehicleTypeLabels[val] || val}</span>,
    },
    {
      key: 'maxPayloadKg',
      header: 'Tải trọng tối đa',
      isNumeric: true,
      render: (val: number) => (
        <span style={{ fontFamily: 'var(--vdbus-font-mono)' }}>
          {(val / 1000).toFixed(1)} tấn ({val.toLocaleString()} kg)
        </span>
      ),
    },
    {
      key: 'cargoVolumeCbm',
      header: 'Thể tích thùng',
      isNumeric: true,
      render: (val: number, row: VehicleItem) => (
        <div>
          <span style={{ fontFamily: 'var(--vdbus-font-mono)' }}>{val} m³</span>
          <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-text-muted)' }}>
            {(row.lengthMm / 1000).toFixed(1)} x {(row.widthMm / 1000).toFixed(1)} x {(row.heightMm / 1000).toFixed(1)} m
          </div>
        </div>
      ),
    },
    {
      key: 'fuelConsumptionLitrePer100Km',
      header: 'Tiêu hao định mức',
      isNumeric: true,
      render: (val: number, row: VehicleItem) => (
        <div>
          <span style={{ fontFamily: 'var(--vdbus-font-mono)' }}>{val} L/100km</span>
          <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-text-muted)' }}>
            {row.axleCount} trục
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (val: string) => getStatusBadge(val),
    },
    {
      key: 'id',
      header: 'Thao tác',
      render: (_: string, row: VehicleItem) => (
        <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(row)}>
          Chỉnh sửa
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Quản lý Đội xe"
        subtitle="Theo dõi tải trọng, thể tích, định mức tiêu hao và tình trạng vận hành của đoàn xe"
        breadcrumbs={[{ label: 'Đội xe' }, { label: 'Phương tiện' }]}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" onClick={fetchVehicles} disabled={isLoading}>
              <IconRefresh size={14} /> Làm mới
            </Button>
            <Button variant="primary" size="sm" onClick={handleOpenCreateModal}>
              <IconPlus size={14} /> Thêm phương tiện
            </Button>
          </div>
        }
      />

      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ width: '280px' }}>
          <Input
            placeholder="Tìm biển số, hãng xe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            prefixElement={<IconSearch size={14} />}
            size="sm"
          />
        </div>
        <div style={{ width: '180px' }}>
          <Select
            size="sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'Tất cả trạng thái' },
              { value: 'Available', label: 'Sẵn sàng' },
              { value: 'OnTrip', label: 'Đang chạy' },
              { value: 'Maintenance', label: 'Bảo dưỡng' },
              { value: 'Inactive', label: 'Không hoạt động' },
            ]}
          />
        </div>
      </div>

      <DataTable
        data={filteredVehicles}
        columns={columns}
        rowKey={(v) => v.id}
        isLoading={isLoading}
        pagination={{
          pageIndex: 1,
          pageSize: 10,
          totalItems: filteredVehicles.length,
          onPageChange: () => {},
        }}
      />

      {/* Modal Thêm / Sửa Xe */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVehicle ? 'Cập nhật thông tin phương tiện' : 'Thêm phương tiện mới'}
        size="base"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSaveVehicle}>
              {editingVehicle ? 'Lưu thay đổi' : 'Thêm mới'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveVehicle} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="Biển kiểm soát" required>
              <Input
                value={formData.licensePlate}
                onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                placeholder="VD: 43C-123.45"
              />
            </FormField>
            <FormField label="Loại phương tiện" required>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                options={[
                  { value: 'DryBox', label: 'Tải thùng kín' },
                  { value: 'Tarpaulin', label: 'Tải thùng bạt' },
                  { value: 'Container', label: 'Xe Container' },
                  { value: 'Refrigerated', label: 'Xe đông lạnh' },
                ]}
              />
            </FormField>
          </div>

          <FormField label="Hãng sản xuất & Kiểu loại" required>
            <Input
              value={formData.makeModel}
              onChange={(e) => setFormData({ ...formData, makeModel: e.target.value })}
              placeholder="VD: Hino 500 Series FG8JJ7A"
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="Tải trọng tối đa (Kg)" required>
              <Input
                type="number"
                value={formData.maxPayloadKg}
                onChange={(e) =>
                  setFormData({ ...formData, maxPayloadKg: Number(e.target.value) || 0 })
                }
              />
            </FormField>
            <FormField label="Thể tích thùng (m³)" required>
              <Input
                type="number"
                value={formData.cargoVolumeCbm}
                onChange={(e) =>
                  setFormData({ ...formData, cargoVolumeCbm: Number(e.target.value) || 0 })
                }
              />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <FormField label="Dài (mm)">
              <Input
                type="number"
                value={formData.lengthMm}
                onChange={(e) =>
                  setFormData({ ...formData, lengthMm: Number(e.target.value) || 0 })
                }
              />
            </FormField>
            <FormField label="Rộng (mm)">
              <Input
                type="number"
                value={formData.widthMm}
                onChange={(e) =>
                  setFormData({ ...formData, widthMm: Number(e.target.value) || 0 })
                }
              />
            </FormField>
            <FormField label="Cao (mm)">
              <Input
                type="number"
                value={formData.heightMm}
                onChange={(e) =>
                  setFormData({ ...formData, heightMm: Number(e.target.value) || 0 })
                }
              />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <FormField label="Số trục">
              <Input
                type="number"
                value={formData.axleCount}
                onChange={(e) =>
                  setFormData({ ...formData, axleCount: Number(e.target.value) || 2 })
                }
              />
            </FormField>
            <FormField label="Tiêu hao (L/100km)">
              <Input
                type="number"
                step="0.1"
                value={formData.fuelConsumptionLitrePer100Km}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fuelConsumptionLitrePer100Km: Number(e.target.value) || 0,
                  })
                }
              />
            </FormField>
            <FormField label="Trạng thái">
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                options={[
                  { value: 'Available', label: 'Sẵn sàng' },
                  { value: 'OnTrip', label: 'Đang chạy' },
                  { value: 'Maintenance', label: 'Bảo dưỡng' },
                  { value: 'Inactive', label: 'Không hoạt động' },
                ]}
              />
            </FormField>
          </div>
        </form>
      </Modal>
    </div>
  );
};
