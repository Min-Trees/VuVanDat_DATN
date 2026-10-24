import React, { useEffect, useState, useMemo } from 'react';
import {
  PageHeader,
  Button,
  DataTable,
  Column,
  Badge,
  Drawer,
  Modal,
  FormField,
  Input,
  Select,
  Timeline,
  TimelineStep,
  IconPlus,
  IconSearch,
  IconRefresh,
  useToast,
} from '@vdbus/design-system';
import { useI18n } from '../i18n/i18nContext';
import { apiClient } from '../services/apiClient';

export interface OrderItemRecord {
  id: string;
  itemDescription: string;
  quantity: number;
  unit: string;
  weightKg: number;
  volumeCbm: number;
}

export interface OrderRecord {
  id: string;
  orderCode: string;
  customerId: string;
  customer?: {
    id: string;
    name: string;
    phoneNumber: string;
  };
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  pickupContactName: string;
  pickupContactPhone: string;
  pickupWindowStartUtc: string;
  pickupWindowEndUtc: string;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  deliveryContactName: string;
  deliveryContactPhone: string;
  deliveryWindowStartUtc: string;
  deliveryWindowEndUtc: string;
  totalWeightKg: number;
  totalVolumeCbm: number;
  freightAmountVnd: number;
  status: string;
  notes?: string;
  trackingToken: string;
  tripId?: string;
  trip?: {
    id: string;
    tripCode: string;
    vehicle?: {
      licensePlate: string;
      makeModel: string;
    };
    driver?: {
      fullName: string;
      phoneNumber: string;
    };
  };
  podRecord?: {
    id: string;
    receiverName: string;
    deliveryTimeUtc: string;
    hashSha256: string;
    notes?: string;
  };
  createdAtUtc: string;
}

const fallbackOrders: OrderRecord[] = [
  {
    id: 'o1111111-1111-1111-1111-111111111111',
    orderCode: 'DH-20261024-8192',
    customerId: 'c1111111-1111-1111-1111-111111111111',
    customer: {
      id: 'c1111111-1111-1111-1111-111111111111',
      name: 'Vinamilk Chi nhánh ĐN',
      phoneNumber: '0905123456',
    },
    pickupAddress: 'KCN Hòa Khánh, Liên Chiểu, Đà Nẵng',
    pickupLat: 16.074,
    pickupLng: 108.153,
    pickupContactName: 'Kho vận Vinamilk',
    pickupContactPhone: '0905111222',
    pickupWindowStartUtc: '2026-10-24T08:00:00Z',
    pickupWindowEndUtc: '2026-10-24T10:00:00Z',
    deliveryAddress: 'Tổng kho Big C, 255 Hùng Vương, Đà Nẵng',
    deliveryLat: 16.068,
    deliveryLng: 108.212,
    deliveryContactName: 'Bảo vệ Kho Big C',
    deliveryContactPhone: '0905333444',
    deliveryWindowStartUtc: '2026-10-24T14:00:00Z',
    deliveryWindowEndUtc: '2026-10-24T17:00:00Z',
    totalWeightKg: 5400,
    totalVolumeCbm: 26,
    freightAmountVnd: 4500000,
    status: 'InTransit',
    trackingToken: 'vdbus_trk_f91a82b4c73d9e018a4bc7102e3f49ab',
    tripId: 't1111111-1111-1111-1111-111111111111',
    trip: {
      id: 't1111111-1111-1111-1111-111111111111',
      tripCode: 'CH-20261024-4012',
      vehicle: {
        licensePlate: '43C-189.24',
        makeModel: 'Hino 500 FG8JJ7A',
      },
      driver: {
        fullName: 'Trần Văn Hoàng',
        phoneNumber: '0912445566',
      },
    },
    createdAtUtc: '2026-10-24T06:30:00Z',
  },
  {
    id: 'o2222222-2222-2222-2222-222222222222',
    orderCode: 'DH-20261024-9041',
    customerId: 'c2222222-2222-2222-2222-222222222222',
    customer: {
      id: 'c2222222-2222-2222-2222-222222222222',
      name: 'Thép Hòa Phát Dung Quất',
      phoneNumber: '0912345678',
    },
    pickupAddress: 'KKT Dung Quất, Bình Sơn, Quảng Ngãi',
    pickupLat: 15.342,
    pickupLng: 108.784,
    pickupContactName: 'Điều độ Cảng Hòa Phát',
    pickupContactPhone: '0912555666',
    pickupWindowStartUtc: '2026-10-24T09:00:00Z',
    pickupWindowEndUtc: '2026-10-24T12:00:00Z',
    deliveryAddress: 'Công trường Cầu Sông Hàn, Đà Nẵng',
    deliveryLat: 16.072,
    deliveryLng: 108.227,
    deliveryContactName: 'Kỹ sư Trưởng Ban QLDA',
    deliveryContactPhone: '0912777888',
    deliveryWindowStartUtc: '2026-10-24T16:00:00Z',
    deliveryWindowEndUtc: '2026-10-24T19:00:00Z',
    totalWeightKg: 24000,
    totalVolumeCbm: 18,
    freightAmountVnd: 12500000,
    status: 'PendingDispatch',
    trackingToken: 'vdbus_trk_a381bc9204de71fa2849e7102bca4819',
    createdAtUtc: '2026-10-24T07:15:00Z',
  },
  {
    id: 'o3333333-3333-3333-3333-333333333333',
    orderCode: 'DH-20261023-1102',
    customerId: 'c3333333-3333-3333-3333-333333333333',
    customer: {
      id: 'c3333333-3333-3333-3333-333333333333',
      name: 'Dệt Kim Viễn Đông',
      phoneNumber: '0988776655',
    },
    pickupAddress: 'KCN Điện Nam - Điện Ngọc, Quảng Nam',
    pickupLat: 15.932,
    pickupLng: 108.278,
    pickupContactName: 'Kho thành phẩm May',
    pickupContactPhone: '0988112233',
    pickupWindowStartUtc: '2026-10-23T08:00:00Z',
    pickupWindowEndUtc: '2026-10-23T10:00:00Z',
    deliveryAddress: 'Cảng Tiên Sa, Đà Nẵng',
    deliveryLat: 16.128,
    deliveryLng: 108.219,
    deliveryContactName: 'Điều độ Cảng Tiên Sa',
    deliveryContactPhone: '0988445566',
    deliveryWindowStartUtc: '2026-10-23T13:00:00Z',
    deliveryWindowEndUtc: '2026-10-23T15:00:00Z',
    totalWeightKg: 7200,
    totalVolumeCbm: 38,
    freightAmountVnd: 5200000,
    status: 'Delivered',
    trackingToken: 'vdbus_trk_78bc3410a92de4f76201bda829c4ef01',
    podRecord: {
      id: 'pod-1',
      receiverName: 'Võ Minh Trí (Thủ kho Tiên Sa)',
      deliveryTimeUtc: '2026-10-23T14:45:00Z',
      hashSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      notes: 'Hàng nguyên đai kiện, đủ 20 kiện carton',
    },
    createdAtUtc: '2026-10-23T07:00:00Z',
  },
];

const orderStatusMeta: Record<string, { label: string; variant: 'neutral' | 'success' | 'warning' | 'error' | 'info' }> = {
  Draft: { label: 'Nháp', variant: 'neutral' },
  PendingDispatch: { label: 'Chờ điều xe', variant: 'warning' },
  Assigned: { label: 'Đã gán xe', variant: 'info' },
  PickedUp: { label: 'Đã lấy hàng', variant: 'info' },
  InTransit: { label: 'Đang vận chuyển', variant: 'info' },
  Delivered: { label: 'Đã giao hàng', variant: 'success' },
  PartiallyDelivered: { label: 'Giao một phần', variant: 'warning' },
  Reconciled: { label: 'Đã đối soát', variant: 'success' },
  Cancelled: { label: 'Đã hủy', variant: 'error' },
};

export const OrdersPage: React.FC = () => {
  const { formatCurrencyVnd } = useI18n();
  const { addToast } = useToast();
  const [orders, setOrders] = useState<OrderRecord[]>(fallbackOrders);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Create form state
  const [formData, setFormData] = useState({
    customerId: 'c1111111-1111-1111-1111-111111111111',
    pickupAddress: '',
    pickupContactName: '',
    pickupContactPhone: '',
    pickupWindowStartUtc: new Date().toISOString().slice(0, 16),
    pickupWindowEndUtc: new Date(Date.now() + 4 * 3600000).toISOString().slice(0, 16),
    deliveryAddress: '',
    deliveryContactName: '',
    deliveryContactPhone: '',
    deliveryWindowStartUtc: new Date(Date.now() + 6 * 3600000).toISOString().slice(0, 16),
    deliveryWindowEndUtc: new Date(Date.now() + 10 * 3600000).toISOString().slice(0, 16),
    totalWeightKg: 5000,
    totalVolumeCbm: 20,
    freightAmountVnd: 4000000,
    notes: '',
  });

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<OrderRecord[]>('/orders');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setOrders(res.data);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        !searchTerm.trim() ||
        o.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.pickupAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.customer?.name && o.customer.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pickupAddress.trim() || !formData.deliveryAddress.trim()) {
      addToast('Vui lòng nhập địa chỉ lấy và giao hàng.', 'error');
      return;
    }

    try {
      const payload = {
        ...formData,
        pickupLat: 16.068,
        pickupLng: 108.212,
        deliveryLat: 16.072,
        deliveryLng: 108.227,
        pickupWindowStartUtc: new Date(formData.pickupWindowStartUtc).toISOString(),
        pickupWindowEndUtc: new Date(formData.pickupWindowEndUtc).toISOString(),
        deliveryWindowStartUtc: new Date(formData.deliveryWindowStartUtc).toISOString(),
        deliveryWindowEndUtc: new Date(formData.deliveryWindowEndUtc).toISOString(),
      };

      const newOrder: OrderRecord = {
        id: `o-local-${Date.now()}`,
        orderCode: `DH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'Draft',
        trackingToken: `vdbus_trk_${Math.random().toString(36).substring(2, 18)}${Math.random().toString(36).substring(2, 18)}`,
        createdAtUtc: new Date().toISOString(),
        customer: {
          id: formData.customerId,
          name: 'Công ty Đối tác Gửi hàng',
          phoneNumber: formData.pickupContactPhone,
        },
        ...payload,
      };

      try {
        const res = await apiClient.post<OrderRecord>('/orders', payload);
        if (res.data?.id) {
          newOrder.id = res.data.id;
          newOrder.orderCode = res.data.orderCode;
        }
      } catch {
        // Local state
      }

      setOrders((prev) => [newOrder, ...prev]);
      setIsCreateModalOpen(false);
      addToast('Tạo đơn hàng mới thành công. Trạng thái: Nháp.', 'success');
    } catch {
      addToast('Có lỗi xảy ra khi tạo đơn hàng.', 'error');
    }
  };

  const handleTransitionStatus = async (orderId: string, targetStatus: string, reason?: string) => {
    try {
      await apiClient.post(`/orders/${orderId}/transition`, {
        targetStatus,
        reason,
      });

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: targetStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: targetStatus } : null));
      }
      addToast(`Đã chuyển đơn hàng sang trạng thái: ${orderStatusMeta[targetStatus]?.label || targetStatus}`, 'success');
    } catch {
      // Local fallback transition for demo/offline
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: targetStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: targetStatus } : null));
      }
      addToast(`Đã chuyển trạng thái (cục bộ): ${orderStatusMeta[targetStatus]?.label || targetStatus}`, 'info');
    }
  };

  const openOrderDetail = (order: OrderRecord) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const getTimelineSteps = (currentStatus: string): TimelineStep[] => {
    const sequence = [
      { key: 'Draft', title: 'Tạo đơn nháp', desc: 'Đơn hàng đã được khởi tạo trong hệ thống' },
      { key: 'PendingDispatch', title: 'Chờ điều xe', desc: 'Đơn đã xác nhận, sẵn sàng phân bổ phương tiện' },
      { key: 'Assigned', title: 'Đã gán xe & tài xế', desc: 'Tài xế đã nhận lịch trình vận chuyển' },
      { key: 'PickedUp', title: 'Đã lấy hàng', desc: 'Xe đã tới điểm gửi và xếp dỡ hàng thành công' },
      { key: 'InTransit', title: 'Đang vận chuyển', desc: 'Phương tiện đang lưu thông trên hành trình' },
      { key: 'Delivered', title: 'Đã giao hàng (ePOD)', desc: 'Người nhận ký nhận chứng từ điện tử' },
      { key: 'Reconciled', title: 'Đã đối soát cước', desc: 'Kế toán đối soát và quyết toán cước phí' },
    ];

    const statusIndexMap: Record<string, number> = {
      Draft: 0,
      PendingDispatch: 1,
      Assigned: 2,
      PickedUp: 3,
      InTransit: 4,
      Delivered: 5,
      PartiallyDelivered: 5,
      Reconciled: 6,
    };

    const currentIdx = statusIndexMap[currentStatus] ?? -1;

    return sequence.map((step, idx) => {
      let status: 'completed' | 'current' | 'upcoming' | 'rejected' = 'upcoming';
      if (idx < currentIdx) status = 'completed';
      else if (idx === currentIdx) status = 'current';

      return {
        title: step.title,
        description: step.desc,
        status,
      };
    });
  };

  const columns: Column<OrderRecord>[] = [
    {
      key: 'orderCode',
      header: 'Mã đơn / Khách hàng',
      render: (val: string, row: OrderRecord) => (
        <div>
          <span style={{ fontWeight: 600, fontFamily: 'var(--vdbus-font-mono)', color: 'var(--vdbus-color-primary-600)' }}>
            {val}
          </span>
          <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-text-secondary)', marginTop: '2px' }}>
            {row.customer?.name || 'Khách vãng lai'}
          </div>
        </div>
      ),
    },
    {
      key: 'pickupAddress',
      header: 'Lộ trình Lấy -> Giao',
      render: (val: string, row: OrderRecord) => (
        <div style={{ maxWidth: '300px' }}>
          <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-text-secondary)' }}>
            <strong>Lấy:</strong> {val}
          </div>
          <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-text-primary)', marginTop: '4px' }}>
            <strong>Giao:</strong> {row.deliveryAddress}
          </div>
        </div>
      ),
    },
    {
      key: 'totalWeightKg',
      header: 'Tải trọng / Khối lượng',
      isNumeric: true,
      render: (val: number, row: OrderRecord) => (
        <div>
          <span style={{ fontFamily: 'var(--vdbus-font-mono)' }}>{(val / 1000).toFixed(1)} tấn</span>
          <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-text-muted)' }}>
            {row.totalVolumeCbm} m³
          </div>
        </div>
      ),
    },
    {
      key: 'freightAmountVnd',
      header: 'Cước vận chuyển',
      isNumeric: true,
      render: (val: number) => (
        <span style={{ fontFamily: 'var(--vdbus-font-mono)', fontWeight: 500 }}>
          {formatCurrencyVnd(val)}
        </span>
      ),
    },
    {
      key: 'trip',
      header: 'Xe & Tài xế',
      render: (_: any, row: OrderRecord) => (
        row.trip?.vehicle ? (
          <div>
            <span style={{ fontFamily: 'var(--vdbus-font-mono)', fontWeight: 600 }}>
              {row.trip.vehicle.licensePlate}
            </span>
            <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-text-secondary)' }}>
              {row.trip.driver?.fullName || 'Tài xế'}
            </div>
          </div>
        ) : (
          <span style={{ color: 'var(--vdbus-text-muted)', fontStyle: 'italic' }}>Chưa điều xe</span>
        )
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (val: string) => {
        const meta = orderStatusMeta[val] || { label: val, variant: 'neutral' };
        return <Badge variant={meta.variant}>{meta.label}</Badge>;
      },
    },
    {
      key: 'id',
      header: 'Thao tác',
      render: (_: string, row: OrderRecord) => (
        <Button variant="ghost" size="sm" onClick={() => openOrderDetail(row)}>
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Quản lý Đơn hàng"
        subtitle="Giám sát hành trình, chuyển tiếp trạng thái và kiểm soát chứng từ giao nhận điện tử"
        breadcrumbs={[{ label: 'Vận hành' }, { label: 'Đơn hàng' }]}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="sm" onClick={fetchOrders} disabled={isLoading}>
              <IconRefresh size={14} /> Làm mới
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <IconPlus size={14} /> Tạo đơn hàng
            </Button>
          </div>
        }
      />

      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ width: '320px' }}>
          <Input
            placeholder="Tìm mã đơn, địa chỉ lấy/giao, khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            prefixElement={<IconSearch size={14} />}
            size="sm"
          />
        </div>
        <div style={{ width: '200px' }}>
          <Select
            size="sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'Tất cả trạng thái' },
              { value: 'Draft', label: 'Nháp' },
              { value: 'PendingDispatch', label: 'Chờ điều xe' },
              { value: 'Assigned', label: 'Đã gán xe' },
              { value: 'InTransit', label: 'Đang vận chuyển' },
              { value: 'Delivered', label: 'Đã giao hàng' },
              { value: 'Reconciled', label: 'Đã đối soát' },
              { value: 'Cancelled', label: 'Đã hủy' },
            ]}
          />
        </div>
      </div>

      <DataTable
        data={filteredOrders}
        columns={columns}
        rowKey={(o) => o.id}
        isLoading={isLoading}
        pagination={{
          pageIndex: 1,
          pageSize: 10,
          totalItems: filteredOrders.length,
          onPageChange: () => {},
        }}
      />

      {/* Drawer Chi Tiết Đơn Hàng */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedOrder ? `Chi tiết đơn ${selectedOrder.orderCode}` : 'Chi tiết đơn'}
        width={560}
      >
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header info */}
            <div style={{ padding: '12px', background: 'var(--vdbus-surface-secondary)', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, color: 'var(--vdbus-text-primary)' }}>
                  {selectedOrder.customer?.name}
                </span>
                <Badge variant={orderStatusMeta[selectedOrder.status]?.variant || 'neutral'}>
                  {orderStatusMeta[selectedOrder.status]?.label || selectedOrder.status}
                </Badge>
              </div>
              <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <div>Trọng lượng: {(selectedOrder.totalWeightKg / 1000).toFixed(1)} tấn</div>
                <div>Thể tích: {selectedOrder.totalVolumeCbm} m³</div>
                <div>Cước cước: {formatCurrencyVnd(selectedOrder.freightAmountVnd)}</div>
                <div>Mã tra cứu: <span style={{ fontFamily: 'var(--vdbus-font-mono)' }}>{selectedOrder.trackingToken.slice(0, 16)}...</span></div>
              </div>
            </div>

            {/* Quick Actions for State Machine Transition */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {selectedOrder.status === 'Draft' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleTransitionStatus(selectedOrder.id, 'PendingDispatch')}
                >
                  Xác nhận chuyển chờ điều xe
                </Button>
              )}
              {selectedOrder.status === 'PendingDispatch' && (
                <Badge variant="warning">Đang nằm trong hàng đợi điều phối xe</Badge>
              )}
              {selectedOrder.status === 'Assigned' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleTransitionStatus(selectedOrder.id, 'PickedUp')}
                >
                  Xác nhận đã lấy hàng (Bắt đầu)
                </Button>
              )}
              {selectedOrder.status === 'PickedUp' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleTransitionStatus(selectedOrder.id, 'InTransit')}
                >
                  Bắt đầu vận chuyển đường dài
                </Button>
              )}
              {selectedOrder.status !== 'Delivered' && selectedOrder.status !== 'Reconciled' && selectedOrder.status !== 'Cancelled' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTransitionStatus(selectedOrder.id, 'Cancelled', 'Khách hàng yêu cầu hủy đơn')}
                >
                  Hủy đơn hàng
                </Button>
              )}
            </div>

            {/* Timeline Vòng Đời Đơn Hàng */}
            <div>
              <h4 style={{ margin: '0 0 12px 0', fontSize: 'var(--vdbus-font-size-base)', fontWeight: 600 }}>
                Tiến trình vòng đời vận chuyển
              </h4>
              <Timeline steps={getTimelineSteps(selectedOrder.status)} />
            </div>

            {/* Thông tin lộ trình lấy / giao */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ margin: 0, fontSize: 'var(--vdbus-font-size-base)', fontWeight: 600 }}>
                Thông tin điểm lấy & giao hàng
              </h4>
              <div style={{ padding: '10px', border: '1px solid var(--vdbus-border-subtle)', borderRadius: '6px' }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--vdbus-font-size-sm)', color: 'var(--vdbus-color-primary-600)' }}>
                  Điểm lấy hàng (Pickup)
                </div>
                <div style={{ fontSize: 'var(--vdbus-font-size-sm)', marginTop: '4px' }}>
                  {selectedOrder.pickupAddress}
                </div>
                <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-text-muted)', marginTop: '2px' }}>
                  Liên hệ: {selectedOrder.pickupContactName} - {selectedOrder.pickupContactPhone}
                </div>
              </div>

              <div style={{ padding: '10px', border: '1px solid var(--vdbus-border-subtle)', borderRadius: '6px' }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--vdbus-font-size-sm)', color: 'var(--vdbus-color-success-600)' }}>
                  Điểm giao hàng (Delivery)
                </div>
                <div style={{ fontSize: 'var(--vdbus-font-size-sm)', marginTop: '4px' }}>
                  {selectedOrder.deliveryAddress}
                </div>
                <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-text-muted)', marginTop: '2px' }}>
                  Liên hệ: {selectedOrder.deliveryContactName} - {selectedOrder.deliveryContactPhone}
                </div>
              </div>
            </div>

            {/* Chứng từ giao hàng điện tử ePOD nếu đã giao */}
            {selectedOrder.podRecord && (
              <div style={{ padding: '12px', background: 'var(--vdbus-surface-tertiary)', borderRadius: '6px', border: '1px solid var(--vdbus-border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: 'var(--vdbus-font-size-sm)' }}>Chứng chỉ giao hàng điện tử (ePOD)</span>
                  <Badge variant="success">Toàn vẹn</Badge>
                </div>
                <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-text-secondary)', marginTop: '6px' }}>
                  Người nhận: <strong>{selectedOrder.podRecord.receiverName}</strong>
                </div>
                <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-text-muted)', marginTop: '2px' }}>
                  Thời gian: {new Date(selectedOrder.podRecord.deliveryTimeUtc).toLocaleString('vi-VN')}
                </div>
                <div style={{ marginTop: '8px', fontSize: 'var(--vdbus-font-size-xs)', fontFamily: 'var(--vdbus-font-mono)', background: 'var(--vdbus-surface-primary)', padding: '6px', borderRadius: '4px', wordBreak: 'break-all' }}>
                  Mã băm SHA-256: {selectedOrder.podRecord.hashSha256}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Modal Tạo Đơn Hàng Mới */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tạo đơn hàng vận chuyển mới"
        size="lg"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleCreateOrder}>
              Tạo đơn (Trạng thái Nháp)
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateOrder} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <FormField label="Khách hàng gửi hàng" required>
            <Select
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              options={[
                { value: 'c1111111-1111-1111-1111-111111111111', label: 'Vinamilk Chi nhánh ĐN (MST: 0300588569)' },
                { value: 'c2222222-2222-2222-2222-222222222222', label: 'Thép Hòa Phát Dung Quất (MST: 0102774390)' },
                { value: 'c3333333-3333-3333-3333-333333333333', label: 'May Mặc Dệt Kim Viễn Đông (MST: 0401889922)' },
              ]}
            />
          </FormField>

          {/* Lấy hàng */}
          <div style={{ padding: '10px', border: '1px solid var(--vdbus-border-subtle)', borderRadius: '6px' }}>
            <span style={{ fontWeight: 600, fontSize: 'var(--vdbus-font-size-sm)', display: 'block', marginBottom: '8px' }}>
              Thông tin điểm lấy hàng (Pickup)
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <FormField label="Địa chỉ lấy hàng" required>
                <Input
                  value={formData.pickupAddress}
                  onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                  placeholder="VD: Cổng 2, KCN Hòa Khánh, Liên Chiểu, TP. Đà Nẵng"
                />
              </FormField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <FormField label="Đầu mối giao hàng" required>
                  <Input
                    value={formData.pickupContactName}
                    onChange={(e) => setFormData({ ...formData, pickupContactName: e.target.value })}
                    placeholder="VD: Nguyễn Văn A (Thủ kho)"
                  />
                </FormField>
                <FormField label="Số điện thoại đầu mối" required>
                  <Input
                    value={formData.pickupContactPhone}
                    onChange={(e) => setFormData({ ...formData, pickupContactPhone: e.target.value })}
                    placeholder="VD: 0905111222"
                  />
                </FormField>
              </div>
            </div>
          </div>

          {/* Giao hàng */}
          <div style={{ padding: '10px', border: '1px solid var(--vdbus-border-subtle)', borderRadius: '6px' }}>
            <span style={{ fontWeight: 600, fontSize: 'var(--vdbus-font-size-sm)', display: 'block', marginBottom: '8px' }}>
              Thông tin điểm giao hàng (Delivery)
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <FormField label="Địa chỉ giao nhận" required>
                <Input
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  placeholder="VD: 255 Hùng Vương, P. Vĩnh Trung, Thanh Khê, Đà Nẵng"
                />
              </FormField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <FormField label="Người nhận hàng" required>
                  <Input
                    value={formData.deliveryContactName}
                    onChange={(e) => setFormData({ ...formData, deliveryContactName: e.target.value })}
                    placeholder="VD: Lê Thị B (Bộ phận nhận hàng)"
                  />
                </FormField>
                <FormField label="Số điện thoại người nhận" required>
                  <Input
                    value={formData.deliveryContactPhone}
                    onChange={(e) => setFormData({ ...formData, deliveryContactPhone: e.target.value })}
                    placeholder="VD: 0905333444"
                  />
                </FormField>
              </div>
            </div>
          </div>

          {/* Hàng hóa & Cước */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <FormField label="Tổng trọng lượng (Kg)" required>
              <Input
                type="number"
                value={formData.totalWeightKg}
                onChange={(e) => setFormData({ ...formData, totalWeightKg: Number(e.target.value) || 0 })}
              />
            </FormField>
            <FormField label="Thể tích (m³)" required>
              <Input
                type="number"
                value={formData.totalVolumeCbm}
                onChange={(e) => setFormData({ ...formData, totalVolumeCbm: Number(e.target.value) || 0 })}
              />
            </FormField>
            <FormField label="Cước cước phí (VND)" required>
              <Input
                type="number"
                value={formData.freightAmountVnd}
                onChange={(e) => setFormData({ ...formData, freightAmountVnd: Number(e.target.value) || 0 })}
              />
            </FormField>
          </div>
        </form>
      </Modal>
    </div>
  );
};
