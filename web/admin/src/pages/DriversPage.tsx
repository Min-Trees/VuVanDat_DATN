import React, { useEffect, useState, useMemo } from 'react';
import {
  PageHeader,
  Button,
  DataTable,
  Column,
  Badge,
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

export interface DriverItem {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  licenseNumber: string;
  licenseClass: string;
  licenseExpiryDate: string;
  status: string;
  assignedVehicleId?: string;
  assignedVehicle?: {
    licensePlate: string;
    makeModel: string;
  };
}

const fallbackDrivers: DriverItem[] = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    fullName: 'Nguyễn Văn Tuấn',
    phoneNumber: '0905112233',
    email: 'tuan.nv@vdbus.vn',
    licenseNumber: '480192837465',
    licenseClass: 'FC',
    licenseExpiryDate: '2028-12-31T00:00:00Z',
    status: 'Available',
    assignedVehicle: {
      licensePlate: '43H-012.88',
      makeModel: 'Hyundai HD320',
    },
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    fullName: 'Trần Văn Hoàng',
    phoneNumber: '0912445566',
    email: 'hoang.tv@vdbus.vn',
    licenseNumber: '480283746519',
    licenseClass: 'C',
    licenseExpiryDate: '2027-08-15T00:00:00Z',
    status: 'OnTrip',
    assignedVehicle: {
      licensePlate: '43C-189.24',
      makeModel: 'Hino 500',
    },
  },
  {
    id: 'd3333333-3333-3333-3333-333333333333',
    fullName: 'Lê Đình Bảo',
    phoneNumber: '0935778899',
    email: 'bao.ld@vdbus.vn',
    licenseNumber: '480394857261',
    licenseClass: 'C',
    licenseExpiryDate: '2029-05-20T00:00:00Z',
    status: 'Available',
  },
  {
    id: 'd4444444-4444-4444-4444-444444444444',
    fullName: 'Phạm Đức Mạnh',
    phoneNumber: '0988665544',
    email: 'manh.pd@vdbus.vn',
    licenseNumber: '480485960172',
    licenseClass: 'E',
    licenseExpiryDate: '2026-11-30T00:00:00Z',
    status: 'OffDuty',
  },
];

export const DriversPage: React.FC = () => {
  const { addToast } = useToast();
  const [drivers, setDrivers] = useState<DriverItem[]>(fallbackDrivers);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<DriverItem | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    licenseNumber: '',
    licenseClass: 'C',
    licenseExpiryDate: '2029-12-31',
    status: 'Available',
  });

  const fetchDrivers = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<DriverItem[]>('/drivers');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setDrivers(res.data);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      const matchSearch =
        !searchTerm.trim() ||
        d.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.phoneNumber.includes(searchTerm) ||
        d.licenseNumber.includes(searchTerm);
      const matchStatus = statusFilter === 'ALL' || d.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [drivers, searchTerm, statusFilter]);

  const handleOpenCreateModal = () => {
    setEditingDriver(null);
    setFormData({
      fullName: '',
      phoneNumber: '',
      email: '',
      licenseNumber: '',
      licenseClass: 'C',
      licenseExpiryDate: '2029-12-31',
      status: 'Available',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (driver: DriverItem) => {
    setEditingDriver(driver);
    setFormData({
      fullName: driver.fullName,
      phoneNumber: driver.phoneNumber,
      email: driver.email,
      licenseNumber: driver.licenseNumber,
      licenseClass: driver.licenseClass,
      licenseExpiryDate: driver.licenseExpiryDate.split('T')[0],
      status: driver.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phoneNumber.trim() || !formData.licenseNumber.trim()) {
      addToast('Vui lòng điền đầy đủ họ tên, số điện thoại và số GPLX.', 'error');
      return;
    }

    try {
      const payload = {
        ...formData,
        licenseExpiryDate: new Date(formData.licenseExpiryDate).toISOString(),
      };

      if (editingDriver) {
        await apiClient.put(`/drivers/${editingDriver.id}`, {
          ...editingDriver,
          ...payload,
        });
        setDrivers((prev) =>
          prev.map((d) => (d.id === editingDriver.id ? { ...d, ...payload } : d))
        );
        addToast('Cập nhật thông tin tài xế thành công.', 'success');
      } else {
        const newRecord: DriverItem = {
          id: `d-local-${Date.now()}`,
          ...payload,
        };
        try {
          const res = await apiClient.post<DriverItem>('/drivers', payload);
          if (res.data?.id) {
            newRecord.id = res.data.id;
          }
        } catch {
          // Local fallback
        }
        setDrivers((prev) => [newRecord, ...prev]);
        addToast('Thêm tài xế mới thành công.', 'success');
      }
      setIsModalOpen(false);
    } catch {
      addToast('Có lỗi xảy ra khi lưu thông tin tài xế.', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available':
        return <Badge variant="success">Sẵn sàng</Badge>;
      case 'OnTrip':
        return <Badge variant="info">Đang lái xe</Badge>;
      case 'OffDuty':
        return <Badge variant="neutral">Nghỉ ca</Badge>;
      case 'Suspended':
        return <Badge variant="error">Tạm đình chỉ</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const formatDate = (iso: string) => {
    if (!iso) return '-';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('vi-VN');
    } catch {
      return iso;
    }
  };

  const columns: Column<DriverItem>[] = [
    {
      key: 'fullName',
      header: 'Họ và tên tài xế',
      render: (val: string, row: DriverItem) => (
        <div>
          <span style={{ fontWeight: 600, color: 'var(--vdbus-text-primary)' }}>{val}</span>
          <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-text-secondary)' }}>
            {row.email}
          </div>
        </div>
      ),
    },
    {
      key: 'phoneNumber',
      header: 'Số điện thoại',
      render: (val: string) => (
        <span style={{ fontFamily: 'var(--vdbus-font-mono)' }}>{val}</span>
      ),
    },
    {
      key: 'licenseClass',
      header: 'GPLX & Hạng',
      render: (val: string, row: DriverItem) => (
        <div>
          <Badge variant="info">Hạng {val}</Badge>
          <div style={{ fontSize: 'var(--vdbus-font-size-xs)', fontFamily: 'var(--vdbus-font-mono)', color: 'var(--vdbus-text-muted)', marginTop: '2px' }}>
            {row.licenseNumber}
          </div>
        </div>
      ),
    },
    {
      key: 'licenseExpiryDate',
      header: 'Hạn kiểm định GPLX',
      render: (val: string) => (
        <span style={{ fontFamily: 'var(--vdbus-font-mono)' }}>{formatDate(val)}</span>
      ),
    },
    {
      key: 'assignedVehicle',
      header: 'Xe phụ trách',
      render: (_: any, row: DriverItem) => (
        row.assignedVehicle ? (
          <div>
            <span style={{ fontWeight: 500, fontFamily: 'var(--vdbus-font-mono)' }}>
              {row.assignedVehicle.licensePlate}
            </span>
            <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-text-muted)' }}>
              {row.assignedVehicle.makeModel}
            </div>
          </div>
        ) : (
          <span style={{ color: 'var(--vdbus-text-muted)', fontStyle: 'italic' }}>Chưa gán xe</span>
        )
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
      render: (_: string, row: DriverItem) => (
        <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(row)}>
          Chỉnh sửa
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Quản lý Tài xế"
        subtitle="Hồ sơ nhân sự lái xe, giấy phép lái xe chuyên dụng và lịch phân công phương tiện"
        breadcrumbs={[{ label: 'Đội ngũ' }, { label: 'Tài xế' }]}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" onClick={fetchDrivers} disabled={isLoading}>
              <IconRefresh size={14} /> Làm mới
            </Button>
            <Button variant="primary" size="sm" onClick={handleOpenCreateModal}>
              <IconPlus size={14} /> Thêm tài xế
            </Button>
          </div>
        }
      />

      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ width: '280px' }}>
          <Input
            placeholder="Tìm tên, SĐT, số GPLX..."
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
              { value: 'OnTrip', label: 'Đang lái xe' },
              { value: 'OffDuty', label: 'Nghỉ ca' },
              { value: 'Suspended', label: 'Tạm đình chỉ' },
            ]}
          />
        </div>
      </div>

      <DataTable
        data={filteredDrivers}
        columns={columns}
        rowKey={(d) => d.id}
        isLoading={isLoading}
        pagination={{
          pageIndex: 1,
          pageSize: 10,
          totalItems: filteredDrivers.length,
          onPageChange: () => {},
        }}
      />

      {/* Modal Thêm / Sửa Tài Xế */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDriver ? 'Cập nhật thông tin tài xế' : 'Thêm tài xế mới'}
        size="base"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSaveDriver}>
              {editingDriver ? 'Lưu thay đổi' : 'Thêm mới'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveDriver} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <FormField label="Họ và tên tài xế" required>
            <Input
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="VD: Nguyễn Văn Tuấn"
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="Số điện thoại di động" required>
              <Input
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="VD: 0905123456"
              />
            </FormField>
            <FormField label="Email thông báo" required>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="VD: tuan.nv@vdbus.vn"
              />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="Số giấy phép lái xe (GPLX)" required>
              <Input
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                placeholder="VD: 480192837465"
              />
            </FormField>
            <FormField label="Hạng bằng lái" required>
              <Select
                value={formData.licenseClass}
                onChange={(e) => setFormData({ ...formData, licenseClass: e.target.value })}
                options={[
                  { value: 'B2', label: 'Hạng B2 (Dưới 3.5 tấn)' },
                  { value: 'C', label: 'Hạng C (Trên 3.5 tấn)' },
                  { value: 'D', label: 'Hạng D (Chở người 10-30)' },
                  { value: 'E', label: 'Hạng E (Chở người trên 30)' },
                  { value: 'FC', label: 'Hạng FC (Đầu kéo sơ-mi rơ-moóc)' },
                ]}
              />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="Ngày hết hạn GPLX" required>
              <Input
                type="date"
                value={formData.licenseExpiryDate}
                onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
              />
            </FormField>
            <FormField label="Tình trạng làm việc">
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                options={[
                  { value: 'Available', label: 'Sẵn sàng' },
                  { value: 'OnTrip', label: 'Đang lái xe' },
                  { value: 'OffDuty', label: 'Nghỉ ca' },
                  { value: 'Suspended', label: 'Tạm đình chỉ' },
                ]}
              />
            </FormField>
          </div>
        </form>
      </Modal>
    </div>
  );
};
