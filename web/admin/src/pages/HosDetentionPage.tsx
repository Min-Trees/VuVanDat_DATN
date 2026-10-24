import React, { useState, useMemo } from 'react';
import {
  PageHeader,
  Button,
  Tabs,
  Badge,
  MockDataBadge,
  Input,
  Select,
  DataTable,
  Column,
  Banner,
  IconSearch,
  IconRefresh,
  IconFileText,
  useToast,
} from '@vdbus/design-system';

export interface DriverHosItem {
  id: string;
  driverName: string;
  vehiclePlate: string;
  continuousDrivingMinutes: number;
  dailyDrivingMinutes: number;
  alertLevel: 'Normal' | 'Warning30Min' | 'Critical15Min' | 'Violation';
  alertMessage: string;
  nextRequiredRestMinutes: number;
  lastRestTime: string;
}

export interface DetentionItem {
  id: string;
  geofenceName: string;
  vehiclePlate: string;
  customerName: string;
  arrivedAt: string;
  departedAt?: string;
  freeTimeMinutes: number;
  detentionMinutes: number;
  detentionFeeVnd: number;
  status: 'Tracking' | 'Billed' | 'Waived';
  notes?: string;
}

const mockHosDrivers: DriverHosItem[] = [
  {
    id: 'd-1',
    driverName: 'Nguyễn Văn Tuấn',
    vehiclePlate: '43C-189.24',
    continuousDrivingMinutes: 145,
    dailyDrivingMinutes: 320,
    alertLevel: 'Normal',
    alertMessage: 'Lái xe trong hạn mức an toàn.',
    nextRequiredRestMinutes: 15,
    lastRestTime: '11:30 (Đã nghỉ 20 phút)',
  },
  {
    id: 'd-2',
    driverName: 'Lê Hoàng Nam',
    vehiclePlate: '43C-225.19',
    continuousDrivingMinutes: 215,
    dailyDrivingMinutes: 510,
    alertLevel: 'Warning30Min',
    alertMessage: 'Còn 25 phút trước khi chạm mốc 4 giờ lái liên tục.',
    nextRequiredRestMinutes: 15,
    lastRestTime: '08:45 (Đã nghỉ 15 phút)',
  },
  {
    id: 'd-3',
    driverName: 'Phạm Đức Long',
    vehiclePlate: '92C-156.40',
    continuousDrivingMinutes: 232,
    dailyDrivingMinutes: 585,
    alertLevel: 'Critical15Min',
    alertMessage: 'Khẩn cấp: Chỉ còn 8 phút trước khi vi phạm giờ lái liên tục!',
    nextRequiredRestMinutes: 15,
    lastRestTime: '07:15 (Đã nghỉ 30 phút)',
  },
  {
    id: 'd-4',
    driverName: 'Trần Đình Trọng',
    vehiclePlate: '43H-012.88',
    continuousDrivingMinutes: 248,
    dailyDrivingMinutes: 615,
    alertLevel: 'Violation',
    alertMessage: 'ĐÃ VI PHẠM: Vượt 8 phút lái liên tục (> 4h) và vượt 15 phút lái ngày (> 10h)!',
    nextRequiredRestMinutes: 45,
    lastRestTime: 'Hôm qua 21:00',
  },
];

const mockDetentionRecords: DetentionItem[] = [
  {
    id: 'dt-101',
    geofenceName: 'Kho Tổng Miền Bắc (Hà Nội)',
    vehiclePlate: '43C-189.24',
    customerName: 'Công ty Cổ phần Sữa Vinamilk',
    arrivedAt: '2026-10-24 07:30',
    departedAt: '2026-10-24 10:45',
    freeTimeMinutes: 60,
    detentionMinutes: 135,
    detentionFeeVnd: 337500,
    status: 'Billed',
    notes: 'Bốc xếp trễ do kho kẹt bàn nâng hạ thủy lực.',
  },
  {
    id: 'dt-102',
    geofenceName: 'Cảng Cát Lái (TP. Hồ Chí Minh)',
    vehiclePlate: '43H-012.88',
    customerName: 'Tập đoàn Dệt may Phong Phú',
    arrivedAt: '2026-10-24 09:15',
    departedAt: undefined, // Currently inside geofence
    freeTimeMinutes: 120,
    detentionMinutes: 195,
    detentionFeeVnd: 487500,
    status: 'Tracking',
    notes: 'Đang chờ hải quan soi chiếu hàng container tồn bãi.',
  },
  {
    id: 'dt-103',
    geofenceName: 'Kho Trung Chuyển Hòa Cầm (Đà Nẵng)',
    vehiclePlate: '43C-225.19',
    customerName: 'Công ty TNHH Nestlé Việt Nam',
    arrivedAt: '2026-10-24 11:00',
    departedAt: '2026-10-24 11:45',
    freeTimeMinutes: 60,
    detentionMinutes: 0,
    detentionFeeVnd: 0,
    status: 'Waived',
    notes: 'Hoàn tất giao nhận trong khung giờ miễn phí.',
  },
];

export const HosDetentionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hos' | 'detention'>('hos');
  const [hosSearch, setHosSearch] = useState('');
  const [hosAlertFilter, setHosAlertFilter] = useState('ALL');
  const [detentionSearch, setDetentionSearch] = useState('');
  const [detentionStatusFilter, setDetentionStatusFilter] = useState('ALL');
  const toast = useToast();

  // Filtered HOS Drivers
  const filteredHosDrivers = useMemo(() => {
    return mockHosDrivers.filter((d) => {
      const matchSearch =
        d.driverName.toLowerCase().includes(hosSearch.toLowerCase()) ||
        d.vehiclePlate.toLowerCase().includes(hosSearch.toLowerCase());
      const matchFilter = hosAlertFilter === 'ALL' || d.alertLevel === hosAlertFilter;
      return matchSearch && matchFilter;
    });
  }, [hosSearch, hosAlertFilter]);

  // Filtered Detention Records
  const filteredDetentionRecords = useMemo(() => {
    return mockDetentionRecords.filter((dt) => {
      const matchSearch =
        dt.geofenceName.toLowerCase().includes(detentionSearch.toLowerCase()) ||
        dt.vehiclePlate.toLowerCase().includes(detentionSearch.toLowerCase()) ||
        dt.customerName.toLowerCase().includes(detentionSearch.toLowerCase());
      const matchStatus = detentionStatusFilter === 'ALL' || dt.status === detentionStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [detentionSearch, detentionStatusFilter]);

  const handleSendRestReminder = (driverName: string) => {
    toast.addToast(`Đã gửi tín hiệu nhắc nhở dừng nghỉ an toàn tới buồng lái tài xế ${driverName}.`, 'success');
  };

  const handleExportSettlement = (recordId: string) => {
    toast.addToast(`Đã xuất biên bản quyết toán phí neo xe #${recordId} ra định dạng PDF/Excel.`, 'info');
  };

  // HOS Columns
  const hosColumns: Column<DriverHosItem>[] = [
    {
      key: 'driverName',
      header: 'Tài xế & Xe',
      render: (_, row) => (
        <div>
          <strong style={{ color: 'var(--vdbus-color-text-primary)' }}>{row.driverName}</strong>
          <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)' }}>
            Biển số: {row.vehiclePlate}
          </div>
        </div>
      ),
    },
    {
      key: 'continuousDrivingMinutes',
      header: 'Giờ lái liên tục (Tối đa 240p / 4h)',
      render: (val) => {
        const pct = Math.min(100, Math.round((val / 240) * 100));
        const isOver = val > 240;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '160px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--vdbus-font-size-xs)' }}>
              <span>{Math.floor(val / 60)}h {val % 60}p / 4h</span>
              <strong style={{ color: isOver ? 'var(--vdbus-color-error-text)' : 'inherit' }}>{pct}%</strong>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--vdbus-color-bg-hover)', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  backgroundColor: isOver ? 'var(--vdbus-color-error-text)' : pct > 85 ? 'var(--vdbus-color-warning-text)' : 'var(--vdbus-color-primary)',
                }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'dailyDrivingMinutes',
      header: 'Giờ lái trong ngày (Tối đa 600p / 10h)',
      render: (val) => {
        const pct = Math.min(100, Math.round((val / 600) * 100));
        const isOver = val > 600;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '160px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--vdbus-font-size-xs)' }}>
              <span>{Math.floor(val / 60)}h {val % 60}p / 10h</span>
              <strong style={{ color: isOver ? 'var(--vdbus-color-error-text)' : 'inherit' }}>{pct}%</strong>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--vdbus-color-bg-hover)', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  backgroundColor: isOver ? 'var(--vdbus-color-error-text)' : pct > 85 ? 'var(--vdbus-color-warning-text)' : 'var(--vdbus-color-primary)',
                }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'alertLevel',
      header: 'Mức cảnh báo',
      render: (val) => {
        if (val === 'Normal') return <Badge variant="success">An toàn</Badge>;
        if (val === 'Warning30Min') return <Badge variant="warning">Cảnh báo &lt; 30p</Badge>;
        if (val === 'Critical15Min') return <Badge variant="error">Khẩn cấp &lt; 15p</Badge>;
        return <Badge variant="error">Vi phạm quá giờ</Badge>;
      },
    },
    {
      key: 'alertMessage',
      header: 'Thông điệp an toàn',
      render: (val) => <span style={{ fontSize: 'var(--vdbus-font-size-xs)' }}>{val}</span>,
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (_, row) => (
        <Button
          size="sm"
          variant={row.alertLevel === 'Normal' ? 'ghost' : 'outline'}
          onClick={() => handleSendRestReminder(row.driverName)}
        >
          Nhắc nghỉ ngơi
        </Button>
      ),
    },
  ];

  // Detention Columns
  const detentionColumns: Column<DetentionItem>[] = [
    {
      key: 'geofenceName',
      header: 'Địa điểm & Khách hàng',
      render: (_, row) => (
        <div>
          <strong style={{ color: 'var(--vdbus-color-text-primary)' }}>{row.geofenceName}</strong>
          <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)' }}>
            {row.customerName} | Xe: {row.vehiclePlate}
          </div>
        </div>
      ),
    },
    { key: 'arrivedAt', header: 'Giờ vào kho', width: 130 },
    {
      key: 'departedAt',
      header: 'Giờ ra kho',
      width: 130,
      render: (val) => val || <Badge variant="warning">Đang neo xe tại kho</Badge>,
    },
    {
      key: 'freeTimeMinutes',
      header: 'Miễn phí (phút)',
      width: 110,
      isNumeric: true,
    },
    {
      key: 'detentionMinutes',
      header: 'Neo tính phí (phút)',
      width: 130,
      isNumeric: true,
      render: (val) => <strong style={{ color: val > 0 ? 'var(--vdbus-color-warning-text)' : 'inherit' }}>{val} phút</strong>,
    },
    {
      key: 'detentionFeeVnd',
      header: 'Phí neo xe (VND)',
      width: 140,
      isNumeric: true,
      render: (val) => (
        <strong style={{ color: val > 0 ? 'var(--vdbus-color-error-text)' : 'inherit' }}>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)}
        </strong>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: 120,
      render: (val) => {
        if (val === 'Tracking') return <Badge variant="warning">Đang tính giờ</Badge>;
        if (val === 'Billed') return <Badge variant="info">Đã lập hóa đơn</Badge>;
        return <Badge variant="neutral">Miễn giảm</Badge>;
      },
    },
    {
      key: 'actions',
      header: 'Biên bản',
      render: (_, row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleExportSettlement(row.id)}
        >
          <IconFileText size={12} />
          Biên bản
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 'var(--vdbus-space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--vdbus-space-4)' }}>
      {/* Page Header */}
      <PageHeader
        title="Giám sát Giờ lái (HOS) & Quản lý Phí neo xe (Detention)"
        subtitle="Quản trị an toàn hành trình, kiểm soát mệt mỏi tài xế và tự động lập biên bản tính phí lưu bãi quá giờ tại kho bãi"
        badge={<MockDataBadge />}
        actions={
          <Button variant="outline" size="sm">
            <IconRefresh size={14} />
            Làm mới
          </Button>
        }
      />

      {/* Main Tabs */}
      <Tabs
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as 'hos' | 'detention')}
        items={[
          { id: 'hos', label: 'Giờ lái an toàn (Hours of Service - HOS)', count: mockHosDrivers.length },
          { id: 'detention', label: 'Phí neo xe kho hàng (Detention Billing)', count: mockDetentionRecords.length },
        ]}
      />

      {/* TAB 1: HOURS OF SERVICE (HOS) */}
      {activeTab === 'hos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vdbus-space-4)' }}>
          {/* Regulatory Banner with Mandatory Legal Disclaimer */}
          <Banner
            variant="warning"
            title="Quy định An toàn Giao thông & Giờ làm việc của Tài xế"
          >
            Hạn mức giờ lái được cấu hình theo quy định nội bộ và cần chuyên gia pháp lý xác nhận. Theo Nghị định 10/2020/NĐ-CP và Luật Giao thông đường bộ Việt Nam: Thời gian lái xe liên tục không quá 4 giờ (240 phút); Tổng thời gian làm việc trong ngày không quá 10 giờ (600 phút); Thời gian dừng nghỉ tối thiểu 15 phút giữa các chu kỳ lái xe.
          </Banner>

          {/* Metric Summary Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 'var(--vdbus-space-3)',
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--vdbus-color-bg-surface)',
                borderRadius: 'var(--vdbus-radius-md)',
                padding: 'var(--vdbus-space-3)',
                border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
              }}
            >
              <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)' }}>Tài xế đang vận hành</div>
              <div style={{ fontSize: 'var(--vdbus-font-size-xl)', fontWeight: 'var(--vdbus-font-weight-semibold)', color: 'var(--vdbus-color-text-primary)' }}>
                {mockHosDrivers.length} tài xế
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--vdbus-color-bg-surface)',
                borderRadius: 'var(--vdbus-radius-md)',
                padding: 'var(--vdbus-space-3)',
                border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
              }}
            >
              <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)' }}>An toàn trong hạn mức</div>
              <div style={{ fontSize: 'var(--vdbus-font-size-xl)', fontWeight: 'var(--vdbus-font-weight-semibold)', color: 'var(--vdbus-color-success-text)' }}>
                {mockHosDrivers.filter((d) => d.alertLevel === 'Normal').length} tài xế
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--vdbus-color-bg-surface)',
                borderRadius: 'var(--vdbus-radius-md)',
                padding: 'var(--vdbus-space-3)',
                border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
              }}
            >
              <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)' }}>Sắp chạm ngưỡng (&lt; 30p)</div>
              <div style={{ fontSize: 'var(--vdbus-font-size-xl)', fontWeight: 'var(--vdbus-font-weight-semibold)', color: 'var(--vdbus-color-warning-text)' }}>
                {mockHosDrivers.filter((d) => d.alertLevel === 'Warning30Min' || d.alertLevel === 'Critical15Min').length} tài xế
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--vdbus-color-bg-surface)',
                borderRadius: 'var(--vdbus-radius-md)',
                padding: 'var(--vdbus-space-3)',
                border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
              }}
            >
              <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)' }}>Vi phạm vượt giờ lái</div>
              <div style={{ fontSize: 'var(--vdbus-font-size-xl)', fontWeight: 'var(--vdbus-font-weight-semibold)', color: 'var(--vdbus-color-error-text)' }}>
                {mockHosDrivers.filter((d) => d.alertLevel === 'Violation').length} tài xế
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div
            style={{
              display: 'flex',
              gap: 'var(--vdbus-space-3)',
              alignItems: 'center',
              backgroundColor: 'var(--vdbus-color-bg-surface)',
              padding: 'var(--vdbus-space-3)',
              borderRadius: 'var(--vdbus-radius-md)',
              border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
            }}
          >
            <div style={{ width: '280px' }}>
              <Input
                size="sm"
                placeholder="Tìm tên tài xế, biển số..."
                value={hosSearch}
                onChange={(e) => setHosSearch(e.target.value)}
                prefixElement={<IconSearch size={14} />}
              />
            </div>

            <div style={{ width: '220px' }}>
              <Select
                size="sm"
                value={hosAlertFilter}
                onChange={(e) => setHosAlertFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'Tất cả mức cảnh báo' },
                  { value: 'Normal', label: 'An toàn' },
                  { value: 'Warning30Min', label: 'Cảnh báo 30 phút' },
                  { value: 'Critical15Min', label: 'Khẩn cấp 15 phút' },
                  { value: 'Violation', label: 'Vi phạm quá giờ' },
                ]}
              />
            </div>
          </div>

          {/* HOS Drivers Table */}
          <div
            style={{
              backgroundColor: 'var(--vdbus-color-bg-surface)',
              borderRadius: 'var(--vdbus-radius-md)',
              border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
              padding: 'var(--vdbus-space-4)',
            }}
          >
            <DataTable
              data={filteredHosDrivers}
              columns={hosColumns}
              rowKey={(item) => item.id}
            />
          </div>
        </div>
      )}

      {/* TAB 2: DETENTION BILLING */}
      {activeTab === 'detention' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vdbus-space-4)' }}>
          {/* Summary Metric Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 'var(--vdbus-space-3)',
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--vdbus-color-bg-surface)',
                borderRadius: 'var(--vdbus-radius-md)',
                padding: 'var(--vdbus-space-3)',
                border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
              }}
            >
              <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)' }}>Tổng sự kiện neo xe</div>
              <div style={{ fontSize: 'var(--vdbus-font-size-xl)', fontWeight: 'var(--vdbus-font-weight-semibold)', color: 'var(--vdbus-color-text-primary)' }}>
                {mockDetentionRecords.length} lượt
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--vdbus-color-bg-surface)',
                borderRadius: 'var(--vdbus-radius-md)',
                padding: 'var(--vdbus-space-3)',
                border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
              }}
            >
              <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)' }}>Tổng thời gian neo xe tính phí</div>
              <div style={{ fontSize: 'var(--vdbus-font-size-xl)', fontWeight: 'var(--vdbus-font-weight-semibold)', color: 'var(--vdbus-color-warning-text)' }}>
                330 phút (5.5 giờ)
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--vdbus-color-bg-surface)',
                borderRadius: 'var(--vdbus-radius-md)',
                padding: 'var(--vdbus-space-3)',
                border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
              }}
            >
              <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)' }}>Tổng phí neo xe phát sinh</div>
              <div style={{ fontSize: 'var(--vdbus-font-size-xl)', fontWeight: 'var(--vdbus-font-weight-semibold)', color: 'var(--vdbus-color-error-text)' }}>
                825.000 đ
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div
            style={{
              display: 'flex',
              gap: 'var(--vdbus-space-3)',
              alignItems: 'center',
              backgroundColor: 'var(--vdbus-color-bg-surface)',
              padding: 'var(--vdbus-space-3)',
              borderRadius: 'var(--vdbus-radius-md)',
              border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
            }}
          >
            <div style={{ width: '280px' }}>
              <Input
                size="sm"
                placeholder="Tìm địa điểm kho, biển số..."
                value={detentionSearch}
                onChange={(e) => setDetentionSearch(e.target.value)}
                prefixElement={<IconSearch size={14} />}
              />
            </div>

            <div style={{ width: '220px' }}>
              <Select
                size="sm"
                value={detentionStatusFilter}
                onChange={(e) => setDetentionStatusFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'Tất cả trạng thái' },
                  { value: 'Tracking', label: 'Đang tính giờ neo' },
                  { value: 'Billed', label: 'Đã lập hóa đơn' },
                  { value: 'Waived', label: 'Miễn giảm' },
                ]}
              />
            </div>
          </div>

          {/* Detention Records Table */}
          <div
            style={{
              backgroundColor: 'var(--vdbus-color-bg-surface)',
              borderRadius: 'var(--vdbus-radius-md)',
              border: 'var(--vdbus-border-width) solid var(--vdbus-color-border-subtle)',
              padding: 'var(--vdbus-space-4)',
            }}
          >
            <DataTable
              data={filteredDetentionRecords}
              columns={detentionColumns}
              rowKey={(item) => item.id}
            />
          </div>
        </div>
      )}
    </div>
  );
};
