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
  IconPlus,
  IconSearch,
  IconRefresh,
  useToast,
} from '@vdbus/design-system';
import { useI18n } from '../i18n/i18nContext';
import { apiClient } from '../services/apiClient';

export interface CustomerItem {
  id: string;
  name: string;
  taxCode: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  address: string;
  creditLimitVnd: number;
  paymentTermDays: number;
  isActive: boolean;
}

const fallbackCustomers: CustomerItem[] = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Công ty Cổ phần Sữa Việt Nam (Vinamilk Chi nhánh ĐN)',
    taxCode: '0300588569',
    contactPerson: 'Nguyễn Văn Hùng',
    phoneNumber: '0905123456',
    email: 'hung.nv@vinamilk-mock.vn',
    address: 'KCN Hòa Khánh, Liên Chiểu, Đà Nẵng',
    creditLimitVnd: 500000000,
    paymentTermDays: 30,
    isActive: true,
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    name: 'Tập đoàn Thép Hòa Phát (Dung Quất)',
    taxCode: '0102774390',
    contactPerson: 'Trần Đình Trọng',
    phoneNumber: '0912345678',
    email: 'trong.td@hoaphat-mock.vn',
    address: 'KKT Dung Quất, Bình Sơn, Quảng Ngãi',
    creditLimitVnd: 1200000000,
    paymentTermDays: 45,
    isActive: true,
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Công ty TNHH May Mặc Dệt Kim Viễn Đông',
    taxCode: '0401889922',
    contactPerson: 'Lê Thị Mai',
    phoneNumber: '0988776655',
    email: 'mai.lt@viendongtextile-mock.vn',
    address: 'KCN Điện Nam - Điện Ngọc, Quảng Nam',
    creditLimitVnd: 300000000,
    paymentTermDays: 15,
    isActive: true,
  },
];

export const CustomersPage: React.FC = () => {
  const { formatCurrencyVnd } = useI18n();
  const { addToast } = useToast();
  const [customers, setCustomers] = useState<CustomerItem[]>(fallbackCustomers);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    taxCode: '',
    contactPerson: '',
    phoneNumber: '',
    email: '',
    address: '',
    creditLimitVnd: 200000000,
    paymentTermDays: 30,
  });

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<CustomerItem[]>('/customers');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setCustomers(res.data);
      }
    } catch {
      // Dùng dữ liệu khởi tạo khi đang ngắt kết nối
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customers;
    const term = searchTerm.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.taxCode.toLowerCase().includes(term) ||
        c.contactPerson.toLowerCase().includes(term) ||
        c.phoneNumber.includes(term)
    );
  }, [customers, searchTerm]);

  const handleOpenCreateModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      taxCode: '',
      contactPerson: '',
      phoneNumber: '',
      email: '',
      address: '',
      creditLimitVnd: 200000000,
      paymentTermDays: 30,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (customer: CustomerItem) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      taxCode: customer.taxCode,
      contactPerson: customer.contactPerson,
      phoneNumber: customer.phoneNumber,
      email: customer.email,
      address: customer.address,
      creditLimitVnd: customer.creditLimitVnd,
      paymentTermDays: customer.paymentTermDays,
    });
    setIsModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.taxCode.trim()) {
      addToast('Vui lòng nhập đầy đủ tên và mã số thuế.', 'error');
      return;
    }

    try {
      if (editingCustomer) {
        // Cập nhật
        await apiClient.put(`/customers/${editingCustomer.id}`, {
          ...editingCustomer,
          ...formData,
        });
        setCustomers((prev) =>
          prev.map((c) => (c.id === editingCustomer.id ? { ...c, ...formData } : c))
        );
        addToast('Cập nhật thông tin khách hàng thành công.', 'success');
      } else {
        // Tạo mới
        const newRecord: CustomerItem = {
          id: `c-local-${Date.now()}`,
          ...formData,
          isActive: true,
        };
        try {
          const res = await apiClient.post<CustomerItem>('/customers', formData);
          if (res.data?.id) {
            newRecord.id = res.data.id;
          }
        } catch {
          // Lưu local state nếu API chưa kết nối
        }
        setCustomers((prev) => [newRecord, ...prev]);
        addToast('Thêm khách hàng mới thành công.', 'success');
      }
      setIsModalOpen(false);
    } catch {
      addToast('Có lỗi xảy ra khi lưu thông tin khách hàng.', 'error');
    }
  };

  const columns: Column<CustomerItem>[] = [
    {
      key: 'name',
      header: 'Tên khách hàng / Doanh nghiệp',
      render: (val: string, row: CustomerItem) => (
        <div>
          <span style={{ fontWeight: 600, color: 'var(--vdbus-text-primary)' }}>{val}</span>
          <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-text-secondary)' }}>
            MST: {row.taxCode}
          </div>
        </div>
      ),
    },
    {
      key: 'contactPerson',
      header: 'Đầu mối liên hệ',
      render: (val: string, row: CustomerItem) => (
        <div>
          <div>{val}</div>
          <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-text-muted)' }}>
            {row.phoneNumber}
          </div>
        </div>
      ),
    },
    {
      key: 'creditLimitVnd',
      header: 'Hạn mức tín dụng',
      isNumeric: true,
      render: (val: number) => (
        <span style={{ fontFamily: 'var(--vdbus-font-mono)', fontWeight: 500 }}>
          {formatCurrencyVnd(val)}
        </span>
      ),
    },
    {
      key: 'paymentTermDays',
      header: 'Kỳ hạn công nợ',
      isNumeric: true,
      render: (val: number) => <span>{val} ngày</span>,
    },
    {
      key: 'isActive',
      header: 'Trạng thái',
      render: (val: boolean) => (
        <Badge variant={val ? 'success' : 'neutral'}>
          {val ? 'Hoạt động' : 'Tạm dừng'}
        </Badge>
      ),
    },
    {
      key: 'id',
      header: 'Thao tác',
      render: (_: string, row: CustomerItem) => (
        <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(row)}>
          Chỉnh sửa
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Quản lý Khách hàng"
        subtitle="Hồ sơ đối tác gửi hàng, hạn mức tín dụng và chính sách công nợ vận tải"
        breadcrumbs={[{ label: 'Vận hành' }, { label: 'Khách hàng' }]}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" onClick={fetchCustomers} disabled={isLoading}>
              <IconRefresh size={14} /> Làm mới
            </Button>
            <Button variant="primary" size="sm" onClick={handleOpenCreateModal}>
              <IconPlus size={14} /> Thêm khách hàng
            </Button>
          </div>
        }
      />

      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px' }}>
        <div style={{ width: '320px' }}>
          <Input
            placeholder="Tìm theo tên, MST, người liên hệ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            prefixElement={<IconSearch size={14} />}
            size="sm"
          />
        </div>
      </div>

      <DataTable
        data={filteredCustomers}
        columns={columns}
        rowKey={(c) => c.id}
        isLoading={isLoading}
        pagination={{
          pageIndex: 1,
          pageSize: 10,
          totalItems: filteredCustomers.length,
          onPageChange: () => {},
        }}
      />

      {/* Modal Thêm / Chỉnh sửa */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Cập nhật thông tin khách hàng' : 'Thêm khách hàng mới'}
        size="base"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleSaveCustomer}>
              {editingCustomer ? 'Lưu thay đổi' : 'Thêm mới'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <FormField label="Tên khách hàng / Doanh nghiệp" required>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="VD: Công ty Cổ phần Thép Hòa Phát"
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="Mã số thuế" required>
              <Input
                value={formData.taxCode}
                onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                placeholder="VD: 0102774390"
              />
            </FormField>
            <FormField label="Người liên hệ" required>
              <Input
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="VD: Nguyễn Văn A"
              />
            </FormField>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="Số điện thoại" required>
              <Input
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="VD: 0905123456"
              />
            </FormField>
            <FormField label="Email giao dịch" required>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="VD: contact@doanhnghiep.vn"
              />
            </FormField>
          </div>

          <FormField label="Địa chỉ văn phòng / Kho chính" required>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="VD: KCN Hòa Khánh, Liên Chiểu, TP. Đà Nẵng"
            />
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField label="Hạn mức tín dụng (VND)">
              <Input
                type="number"
                value={formData.creditLimitVnd}
                onChange={(e) =>
                  setFormData({ ...formData, creditLimitVnd: Number(e.target.value) || 0 })
                }
              />
            </FormField>
            <FormField label="Thời hạn công nợ (Ngày)">
              <Input
                type="number"
                value={formData.paymentTermDays}
                onChange={(e) =>
                  setFormData({ ...formData, paymentTermDays: Number(e.target.value) || 0 })
                }
              />
            </FormField>
          </div>
        </form>
      </Modal>
    </div>
  );
};
