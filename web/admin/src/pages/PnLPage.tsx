import React, { useState, useMemo } from 'react';
import {
  PageHeader,
  Button,
  Badge,
  MockDataBadge,
  Select,
  Input,
  Banner,
} from '@vdbus/design-system';

export interface PnLSummaryData {
  fromUtc: string;
  toUtc: string;
  freightRevenueVnd: number;
  detentionRevenueVnd: number;
  totalRevenueVnd: number;
  fuelCostVnd: number;
  tollCostVnd: number;
  driverWageCostVnd: number;
  maintenanceCostVnd: number;
  totalCostVnd: number;
  grossProfitVnd: number;
  grossMarginPercentage: number;
  totalTripsCompleted: number;
  totalDistanceKm: number;
}

export interface VehiclePnLItem {
  vehicleId: string;
  licensePlate: string;
  makeModel: string;
  tripCount: number;
  totalDistanceKm: number;
  revenueVnd: number;
  fuelCostVnd: number;
  tollCostVnd: number;
  driverWageVnd: number;
  maintenanceCostVnd: number;
  totalCostVnd: number;
  netProfitVnd: number;
  marginPercentage: number;
}

export interface TripPnLItem {
  tripId: string;
  tripCode: string;
  licensePlate: string;
  driverName: string;
  routeSummary: string;
  completedAtUtc: string;
  revenueVnd: number;
  fuelCostVnd: number;
  tollCostVnd: number;
  driverWageVnd: number;
  totalCostVnd: number;
  netProfitVnd: number;
  marginPercentage: number;
}

export interface CustomerPnLItem {
  customerId: string;
  customerCode: string;
  customerName: string;
  orderCount: number;
  totalRevenueVnd: number;
  allocatedCostVnd: number;
  grossProfitVnd: number;
  marginPercentage: number;
}

export interface RoutePnLItem {
  routeKey: string;
  originHub: string;
  destinationHub: string;
  tripCount: number;
  avgDistanceKm: number;
  totalRevenueVnd: number;
  avgRevenuePerTripVnd: number;
  totalCostVnd: number;
  avgCostPerTripVnd: number;
  grossProfitVnd: number;
  marginPercentage: number;
}

const mockSummary: PnLSummaryData = {
  fromUtc: '2026-10-01T00:00:00Z',
  toUtc: '2026-10-31T23:59:59Z',
  freightRevenueVnd: 485000000,
  detentionRevenueVnd: 18500000,
  totalRevenueVnd: 503500000,
  fuelCostVnd: 162400000,
  tollCostVnd: 46800000,
  driverWageCostVnd: 98000000,
  maintenanceCostVnd: 34200000,
  totalCostVnd: 341400000,
  grossProfitVnd: 162100000,
  grossMarginPercentage: 32.2,
  totalTripsCompleted: 78,
  totalDistanceKm: 42150,
};

const mockVehiclePnL: VehiclePnLItem[] = [
  {
    vehicleId: 'v-1',
    licensePlate: '43C-189.24',
    makeModel: 'Hino 500 FG8JJ7A (8.5T)',
    tripCount: 16,
    totalDistanceKm: 8420,
    revenueVnd: 98500000,
    fuelCostVnd: 31200000,
    tollCostVnd: 9400000,
    driverWageVnd: 19200000,
    maintenanceCostVnd: 4500000,
    totalCostVnd: 64300000,
    netProfitVnd: 34200000,
    marginPercentage: 34.7,
  },
  {
    vehicleId: 'v-2',
    licensePlate: '43H-012.88',
    makeModel: 'Isuzu GIGA 6x2 (15T)',
    tripCount: 14,
    totalDistanceKm: 9800,
    revenueVnd: 145000000,
    fuelCostVnd: 48500000,
    tollCostVnd: 14200000,
    driverWageVnd: 28000000,
    maintenanceCostVnd: 11200000,
    totalCostVnd: 101900000,
    netProfitVnd: 43100000,
    marginPercentage: 29.7,
  },
  {
    vehicleId: 'v-3',
    licensePlate: '29H-882.11',
    makeModel: 'Hyundai HD320 4 chân (18T)',
    tripCount: 12,
    totalDistanceKm: 8900,
    revenueVnd: 132000000,
    fuelCostVnd: 44200000,
    tollCostVnd: 12800000,
    driverWageVnd: 24000000,
    maintenanceCostVnd: 8500000,
    totalCostVnd: 89500000,
    netProfitVnd: 42500000,
    marginPercentage: 32.2,
  },
  {
    vehicleId: 'v-4',
    licensePlate: '50H-918.44',
    makeModel: 'Thaco Auman C160 (9T)',
    tripCount: 18,
    totalDistanceKm: 7600,
    revenueVnd: 72000000,
    fuelCostVnd: 23500000,
    tollCostVnd: 6800000,
    driverWageVnd: 15600000,
    maintenanceCostVnd: 6000000,
    totalCostVnd: 51900000,
    netProfitVnd: 20100000,
    marginPercentage: 27.9,
  },
  {
    vehicleId: 'v-5',
    licensePlate: '43C-221.90',
    makeModel: 'Kia K250 (2.4T Đô thị)',
    tripCount: 18,
    totalDistanceKm: 7430,
    revenueVnd: 56000000,
    fuelCostVnd: 15000000,
    tollCostVnd: 3600000,
    driverWageVnd: 11200000,
    maintenanceCostVnd: 4000000,
    totalCostVnd: 33800000,
    netProfitVnd: 22200000,
    marginPercentage: 39.6,
  },
];

const mockTripPnL: TripPnLItem[] = [
  {
    tripId: 'trip-101',
    tripCode: 'CH-202610-001',
    licensePlate: '43C-189.24',
    driverName: 'Nguyen Van Hai',
    routeSummary: 'Kho Hòa Cầm -> KCN Chu Lai',
    completedAtUtc: '2026-10-22T14:30:00Z',
    revenueVnd: 6800000,
    fuelCostVnd: 2150000,
    tollCostVnd: 560000,
    driverWageVnd: 1200000,
    totalCostVnd: 3910000,
    netProfitVnd: 2890000,
    marginPercentage: 42.5,
  },
  {
    tripId: 'trip-102',
    tripCode: 'CH-202610-002',
    licensePlate: '43H-012.88',
    driverName: 'Tran Dinh Trong',
    routeSummary: 'Đà Nẵng -> KCN Dung Quất -> Quy Nhơn',
    completedAtUtc: '2026-10-23T18:00:00Z',
    revenueVnd: 14200000,
    fuelCostVnd: 4600000,
    tollCostVnd: 1400000,
    driverWageVnd: 2600000,
    totalCostVnd: 8600000,
    netProfitVnd: 5600000,
    marginPercentage: 39.4,
  },
  {
    tripId: 'trip-103',
    tripCode: 'CH-202610-003',
    licensePlate: '29H-882.11',
    driverName: 'Le Van Minh',
    routeSummary: 'Hà Nội -> Thanh Hóa -> Vinh',
    completedAtUtc: '2026-10-24T11:20:00Z',
    revenueVnd: 12500000,
    fuelCostVnd: 4100000,
    tollCostVnd: 1100000,
    driverWageVnd: 2200000,
    totalCostVnd: 7400000,
    netProfitVnd: 5100000,
    marginPercentage: 40.8,
  },
];

const mockCustomerPnL: CustomerPnLItem[] = [
  {
    customerId: 'cust-1',
    customerCode: 'KH-MASAN',
    customerName: 'Masan Consumer Miền Trung',
    orderCount: 32,
    totalRevenueVnd: 198000000,
    allocatedCostVnd: 132000000,
    grossProfitVnd: 66000000,
    marginPercentage: 33.3,
  },
  {
    customerId: 'cust-2',
    customerCode: 'KH-VINAMILK',
    customerName: 'Vinamilk Logistics Da Nang',
    orderCount: 26,
    totalRevenueVnd: 165000000,
    allocatedCostVnd: 109000000,
    grossProfitVnd: 56000000,
    marginPercentage: 33.9,
  },
  {
    customerId: 'cust-3',
    customerCode: 'KH-ACECOOK',
    customerName: 'Acecook Việt Nam Chi nhánh Đà Nẵng',
    orderCount: 20,
    totalRevenueVnd: 140500000,
    allocatedCostVnd: 100400000,
    grossProfitVnd: 40100000,
    marginPercentage: 28.5,
  },
];

const mockRoutePnL: RoutePnLItem[] = [
  {
    routeKey: 'DAD-CHULAI',
    originHub: 'Đà Nẵng (Hòa Cầm)',
    destinationHub: 'Quảng Nam (KCN Chu Lai)',
    tripCount: 28,
    avgDistanceKm: 95,
    totalRevenueVnd: 154000000,
    avgRevenuePerTripVnd: 5500000,
    totalCostVnd: 98000000,
    avgCostPerTripVnd: 3500000,
    grossProfitVnd: 56000000,
    marginPercentage: 36.4,
  },
  {
    routeKey: 'DAD-DUNGQUAT',
    originHub: 'Đà Nẵng (Hòa Cầm)',
    destinationHub: 'Quảng Ngãi (KCN Dung Quất)',
    tripCount: 24,
    avgDistanceKm: 145,
    totalRevenueVnd: 182000000,
    avgRevenuePerTripVnd: 7583000,
    totalCostVnd: 122000000,
    avgCostPerTripVnd: 5083000,
    grossProfitVnd: 60000000,
    marginPercentage: 33.0,
  },
  {
    routeKey: 'HAN-VINH',
    originHub: 'Hà Nội (Gia Lâm)',
    destinationHub: 'Nghệ An (TP. Vinh)',
    tripCount: 26,
    avgDistanceKm: 310,
    totalRevenueVnd: 167500000,
    avgRevenuePerTripVnd: 6442000,
    totalCostVnd: 121400000,
    avgCostPerTripVnd: 4669000,
    grossProfitVnd: 46100000,
    marginPercentage: 27.5,
  },
];

export const PnLPage: React.FC = () => {
  const [activeDimension, setActiveDimension] = useState<'vehicle' | 'trip' | 'customer' | 'route'>('vehicle');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('month');

  const formatVnd = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const handleExportCsv = () => {
    const filename = `VDBus_PnL_Report_${activeDimension}_${new Date().toISOString().slice(0, 10)}.csv`;
    let content = 'data:text/csv;charset=utf-8,';

    if (activeDimension === 'vehicle') {
      content += 'BienSo,DongXe,SoChuyen,QuangDuongKm,DoanhThuVND,NhienLieuVND,PhiBOTVND,LuongVND,BaoDuongVND,TongChiPhiVND,LoiNhuanRongVND,BienLaiPercent\n';
      mockVehiclePnL.forEach(v => {
        content += `${v.licensePlate},"${v.makeModel}",${v.tripCount},${v.totalDistanceKm},${v.revenueVnd},${v.fuelCostVnd},${v.tollCostVnd},${v.driverWageVnd},${v.maintenanceCostVnd},${v.totalCostVnd},${v.netProfitVnd},${v.marginPercentage}%\n`;
      });
    } else if (activeDimension === 'customer') {
      content += 'MaKhachHang,TenKhachHang,SoDonHang,TongDoanhThuVND,ChiPhiPhanBoVND,LoiNhuanGopVND,BienLaiPercent\n';
      mockCustomerPnL.forEach(c => {
        content += `${c.customerCode},"${c.customerName}",${c.orderCount},${c.totalRevenueVnd},${c.allocatedCostVnd},${c.grossProfitVnd},${c.marginPercentage}%\n`;
      });
    } else if (activeDimension === 'trip') {
      content += 'MaChuyen,BienSo,TaiXe,LoTrinh,DoanhThuVND,ChiPhiVND,LoiNhuanRongVND,BienLaiPercent\n';
      mockTripPnL.forEach(t => {
        content += `${t.tripCode},${t.licensePlate},"${t.driverName}","${t.routeSummary}",${t.revenueVnd},${t.totalCostVnd},${t.netProfitVnd},${t.marginPercentage}%\n`;
      });
    } else {
      content += 'MaTuyen,DiemDi,DiemDen,SoChuyen,QuangDuongTBKm,DoanhThuTBVND,ChiPhiTBVND,LoiNhuanGopVND,BienLaiPercent\n';
      mockRoutePnL.forEach(r => {
        content += `${r.routeKey},"${r.originHub}","${r.destinationHub}",${r.tripCount},${r.avgDistanceKm},${r.avgRevenuePerTripVnd},${r.avgCostPerTripVnd},${r.grossProfitVnd},${r.marginPercentage}%\n`;
      });
    }

    const encodedUri = encodeURI(content);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredVehicles = useMemo(() => {
    return mockVehiclePnL.filter(v =>
      v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.makeModel.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const filteredCustomers = useMemo(() => {
    return mockCustomerPnL.filter(c =>
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const filteredTrips = useMemo(() => {
    return mockTripPnL.filter(t =>
      t.tripCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.driverName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const filteredRoutes = useMemo(() => {
    return mockRoutePnL.filter(r =>
      r.originHub.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.destinationHub.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.routeKey.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--vdbus-space-4)' }}>
      <PageHeader
        title="Báo cáo Lãi lỗ (P&L) đa chiều"
        subtitle="Hệ thống tính toán lợi nhuận thời gian thực đối chiếu Doanh thu cước & Chi phí vận hành trực tiếp"
        actions={
          <div style={{ display: 'flex', gap: 'var(--vdbus-space-2)', alignItems: 'center' }}>
            <MockDataBadge />
            <Button variant="secondary" onClick={handleExportCsv}>
              Xuất tệp CSV / Excel
            </Button>
          </div>
        }
      />

      {/* Filter and Period Selection */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--vdbus-color-bg-surface)',
          border: '1px solid var(--vdbus-color-border-subtle)',
          borderRadius: 'var(--vdbus-radius-base)',
          padding: 'var(--vdbus-space-3) var(--vdbus-space-4)',
          flexWrap: 'wrap',
          gap: 'var(--vdbus-space-3)',
        }}
      >
        <div style={{ display: 'flex', gap: 'var(--vdbus-space-3)', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--vdbus-font-size-sm)', color: 'var(--vdbus-color-text-secondary)', fontWeight: 600 }}>
            Kỳ đối soát:
          </span>
          <Select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            options={[
              { value: 'week', label: '7 ngày gần nhất' },
              { value: 'month', label: '30 ngày gần nhất (Tháng 10/2026)' },
              { value: 'quarter', label: 'Quý 4/2026' },
              { value: 'year', label: 'Năm tài chính 2026' },
            ]}
          />
        </div>

        <div style={{ display: 'flex', gap: 'var(--vdbus-space-2)', width: '320px' }}>
          <Input
            placeholder="Tìm theo biển số, khách hàng, mã chuyến..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Overview Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--vdbus-space-3)',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--vdbus-color-bg-surface)',
            border: '1px solid var(--vdbus-color-border-subtle)',
            borderRadius: 'var(--vdbus-radius-base)',
            padding: 'var(--vdbus-space-4)',
          }}
        >
          <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)', marginBottom: 'var(--vdbus-space-1)' }}>
            Tổng Doanh thu gộp
          </div>
          <div style={{ fontSize: 'var(--vdbus-font-size-xl)', fontWeight: 700, color: 'var(--vdbus-color-text-primary)' }}>
            {formatVnd(mockSummary.totalRevenueVnd)}
          </div>
          <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-secondary)', marginTop: 'var(--vdbus-space-1)' }}>
            Gồm {formatVnd(mockSummary.detentionRevenueVnd)} phí lưu ca/neo bãi
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--vdbus-color-bg-surface)',
            border: '1px solid var(--vdbus-color-border-subtle)',
            borderRadius: 'var(--vdbus-radius-base)',
            padding: 'var(--vdbus-space-4)',
          }}
        >
          <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)', marginBottom: 'var(--vdbus-space-1)' }}>
            Tổng Chi phí trực tiếp
          </div>
          <div style={{ fontSize: 'var(--vdbus-font-size-xl)', fontWeight: 700, color: 'var(--vdbus-color-error-text)' }}>
            {formatVnd(mockSummary.totalCostVnd)}
          </div>
          <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-secondary)', marginTop: 'var(--vdbus-space-1)' }}>
            Xăng dầu: {formatVnd(mockSummary.fuelCostVnd)} (47.5%)
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--vdbus-color-bg-surface)',
            border: '1px solid var(--vdbus-color-border-subtle)',
            borderRadius: 'var(--vdbus-radius-base)',
            padding: 'var(--vdbus-space-4)',
          }}
        >
          <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)', marginBottom: 'var(--vdbus-space-1)' }}>
            Lợi nhuận gộp (Gross Profit)
          </div>
          <div style={{ fontSize: 'var(--vdbus-font-size-xl)', fontWeight: 700, color: 'var(--vdbus-color-success-text)' }}>
            {formatVnd(mockSummary.grossProfitVnd)}
          </div>
          <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-secondary)', marginTop: 'var(--vdbus-space-1)' }}>
            Biên lợi nhuận gộp: <strong>{mockSummary.grossMarginPercentage}%</strong>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--vdbus-color-bg-surface)',
            border: '1px solid var(--vdbus-color-border-subtle)',
            borderRadius: 'var(--vdbus-radius-base)',
            padding: 'var(--vdbus-space-4)',
          }}
        >
          <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)', marginBottom: 'var(--vdbus-space-1)' }}>
            Sản lượng vận tải
          </div>
          <div style={{ fontSize: 'var(--vdbus-font-size-xl)', fontWeight: 700, color: 'var(--vdbus-color-text-primary)' }}>
            {mockSummary.totalTripsCompleted} chuyến xe
          </div>
          <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-secondary)', marginTop: 'var(--vdbus-space-1)' }}>
            Tổng cự ly: {mockSummary.totalDistanceKm.toLocaleString()} km
          </div>
        </div>
      </div>

      {/* Cost Breakdown Details */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 'var(--vdbus-space-2)',
          backgroundColor: 'var(--vdbus-color-bg-subtle)',
          borderRadius: 'var(--vdbus-radius-base)',
          padding: 'var(--vdbus-space-3)',
          border: '1px solid var(--vdbus-color-border-subtle)',
        }}
      >
        <div>
          <span style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)' }}>Nhiên liệu:</span>
          <div style={{ fontSize: 'var(--vdbus-font-size-sm)', fontWeight: 600 }}>{formatVnd(mockSummary.fuelCostVnd)}</div>
        </div>
        <div>
          <span style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)' }}>Phí trạm BOT (VETC):</span>
          <div style={{ fontSize: 'var(--vdbus-font-size-sm)', fontWeight: 600 }}>{formatVnd(mockSummary.tollCostVnd)}</div>
        </div>
        <div>
          <span style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)' }}>Lương chuyến tài xế:</span>
          <div style={{ fontSize: 'var(--vdbus-font-size-sm)', fontWeight: 600 }}>{formatVnd(mockSummary.driverWageCostVnd)}</div>
        </div>
        <div>
          <span style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)' }}>Bảo dưỡng định kỳ:</span>
          <div style={{ fontSize: 'var(--vdbus-font-size-sm)', fontWeight: 600 }}>{formatVnd(mockSummary.maintenanceCostVnd)}</div>
        </div>
      </div>

      {/* Dimension Switcher Tabs */}
      <div style={{ display: 'flex', gap: 'var(--vdbus-space-2)', borderBottom: '1px solid var(--vdbus-color-border-subtle)', paddingBottom: 'var(--vdbus-space-2)' }}>
        <button
          onClick={() => setActiveDimension('vehicle')}
          style={{
            padding: 'var(--vdbus-space-2) var(--vdbus-space-4)',
            borderRadius: 'var(--vdbus-radius-base)',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeDimension === 'vehicle' ? 'var(--vdbus-color-primary)' : 'transparent',
            color: activeDimension === 'vehicle' ? 'var(--vdbus-color-bg-canvas)' : 'var(--vdbus-color-text-secondary)',
            fontWeight: 600,
            fontSize: 'var(--vdbus-font-size-sm)',
          }}
        >
          Theo Phương tiện ({mockVehiclePnL.length})
        </button>
        <button
          onClick={() => setActiveDimension('trip')}
          style={{
            padding: 'var(--vdbus-space-2) var(--vdbus-space-4)',
            borderRadius: 'var(--vdbus-radius-base)',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeDimension === 'trip' ? 'var(--vdbus-color-primary)' : 'transparent',
            color: activeDimension === 'trip' ? 'var(--vdbus-color-bg-canvas)' : 'var(--vdbus-color-text-secondary)',
            fontWeight: 600,
            fontSize: 'var(--vdbus-font-size-sm)',
          }}
        >
          Theo Chuyến xe ({mockTripPnL.length})
        </button>
        <button
          onClick={() => setActiveDimension('customer')}
          style={{
            padding: 'var(--vdbus-space-2) var(--vdbus-space-4)',
            borderRadius: 'var(--vdbus-radius-base)',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeDimension === 'customer' ? 'var(--vdbus-color-primary)' : 'transparent',
            color: activeDimension === 'customer' ? 'var(--vdbus-color-bg-canvas)' : 'var(--vdbus-color-text-secondary)',
            fontWeight: 600,
            fontSize: 'var(--vdbus-font-size-sm)',
          }}
        >
          Theo Khách hàng ({mockCustomerPnL.length})
        </button>
        <button
          onClick={() => setActiveDimension('route')}
          style={{
            padding: 'var(--vdbus-space-2) var(--vdbus-space-4)',
            borderRadius: 'var(--vdbus-radius-base)',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: activeDimension === 'route' ? 'var(--vdbus-color-primary)' : 'transparent',
            color: activeDimension === 'route' ? 'var(--vdbus-color-bg-canvas)' : 'var(--vdbus-color-text-secondary)',
            fontWeight: 600,
            fontSize: 'var(--vdbus-font-size-sm)',
          }}
        >
          Theo Tuyến đường ({mockRoutePnL.length})
        </button>
      </div>

      {/* Dimension Table Rendering */}
      <div
        style={{
          backgroundColor: 'var(--vdbus-color-bg-surface)',
          border: '1px solid var(--vdbus-color-border-subtle)',
          borderRadius: 'var(--vdbus-radius-base)',
          overflowX: 'auto',
        }}
      >
        {activeDimension === 'vehicle' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--vdbus-font-size-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--vdbus-color-border-default)', backgroundColor: 'var(--vdbus-color-bg-subtle)' }}>
                <th style={{ padding: 'var(--vdbus-space-3)' }}>Biển số</th>
                <th style={{ padding: 'var(--vdbus-space-3)' }}>Dòng xe</th>
                <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>Số chuyến</th>
                <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>Quãng đường</th>
                <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>Doanh thu</th>
                <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>Nhiên liệu</th>
                <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>Phí BOT</th>
                <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>Lương TX</th>
                <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>Bảo dưỡng</th>
                <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>Tổng chi</th>
                <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>Lợi nhuận ròng</th>
                <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'center' }}>Biên lãi</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map(v => (
                <tr key={v.vehicleId} style={{ borderBottom: '1px solid var(--vdbus-color-border-subtle)' }}>
                  <td style={{ padding: 'var(--vdbus-space-3)', fontWeight: 600 }}>{v.licensePlate}</td>
                  <td style={{ padding: 'var(--vdbus-space-3)', color: 'var(--vdbus-color-text-secondary)' }}>{v.makeModel}</td>
                  <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>{v.tripCount}</td>
                  <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>{v.totalDistanceKm.toLocaleString()} km</td>
                  <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right', fontWeight: 600 }}>{formatVnd(v.revenueVnd)}</td>
                  <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>{formatVnd(v.fuelCostVnd)}</td>
                  <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>{formatVnd(v.tollCostVnd)}</td>
                  <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>{formatVnd(v.driverWageVnd)}</td>
                  <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>{formatVnd(v.maintenanceCostVnd)}</td>
                  <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right', color: 'var(--vdbus-color-error-text)' }}>{formatVnd(v.totalCostVnd)}</td>
                  <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right', fontWeight: 700, color: 'var(--vdbus-color-success-text)' }}>
                    {formatVnd(v.netProfitVnd)}
                  </td>
                  <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'center' }}>
                    <Badge variant={v.marginPercentage >= 30 ? 'success' : 'neutral'}>
                      {v.marginPercentage}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeDimension === 'trip' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--vdbus-font-size-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--vdbus-color-border-default)', backgroundColor: 'var(--vdbus-color-bg-subtle)' }}>
                <th style={{ padding: 'var(--vdbus-space-3)' }}>Mã chuyến</th>
                <th style={{ padding: 'var(--vdbus-space-3)' }}>Biển số</th>
                <th style={{ padding: 'var(--vdbus-space-3)' }}>Tài xế</th>
                <th style={{ padding: 'var(--vdbus-space-3)' }}>Lộ trình tóm tắt</th>
                <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>Doanh thu</th>
                <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>Nhiên liệu</th>
                <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>Phí BOT</th>
                <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>Lương chuyến</th>
                <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>Tổng chi</th>
                <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>Lợi nhuận</th>
                <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'center' }}>Biên lãi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.map(t => (
                <tr key={t.tripId} style={{ borderBottom: '1px solid var(--vdbus-color-border-subtle)' }}>
                  <td style={{ padding: 'var(--vdbus-space-3)', fontWeight: 600 }}>{t.tripCode}</td>
                  <td style={{ padding: 'var(--vdbus-space-3)' }}>{t.licensePlate}</td>
                  <td style={{ padding: 'var(--vdbus-space-3)', color: 'var(--vdbus-color-text-secondary)' }}>{t.driverName}</td>
                  <td style={{ padding: 'var(--vdbus-space-3)' }}>{t.routeSummary}</td>
                  <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right', fontWeight: 600 }}>{formatVnd(t.revenueVnd)}</td>
                  <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>{formatVnd(t.fuelCostVnd)}</td>
                  <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>{formatVnd(t.tollCostVnd)}</td>
                  <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>{formatVnd(t.driverWageVnd)}</td>
                  <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right', color: 'var(--vdbus-color-error-text)' }}>{formatVnd(t.totalCostVnd)}</td>
                  <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right', fontWeight: 700, color: 'var(--vdbus-color-success-text)' }}>
                    {formatVnd(t.netProfitVnd)}
                  </td>
                  <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'center' }}>
                    <Badge variant={t.marginPercentage >= 35 ? 'success' : 'neutral'}>
                      {t.marginPercentage}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeDimension === 'customer' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--vdbus-font-size-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--vdbus-color-border-default)', backgroundColor: 'var(--vdbus-color-bg-subtle)' }}>
                <th style={{ padding: 'var(--vdbus-space-3)' }}>Mã KH</th>
                <th style={{ padding: 'var(--vdbus-space-3)' }}>Tên Khách hàng</th>
                <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>Số đơn hàng</th>
                <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>Tổng Doanh thu</th>
                <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>Chi phí phân bổ</th>
                <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>Lợi nhuận gộp</th>
                <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'center' }}>Tỷ suất lợi nhuận</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(c => (
                <tr key={c.customerId} style={{ borderBottom: '1px solid var(--vdbus-color-border-subtle)' }}>
                  <td style={{ padding: 'var(--vdbus-space-3)', fontWeight: 600 }}>{c.customerCode}</td>
                  <td style={{ padding: 'var(--vdbus-space-3)' }}>{c.customerName}</td>
                  <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>{c.orderCount} đơn</td>
                  <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right', fontWeight: 600 }}>{formatVnd(c.totalRevenueVnd)}</td>
                  <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right', color: 'var(--vdbus-color-error-text)' }}>{formatVnd(c.allocatedCostVnd)}</td>
                  <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right', fontWeight: 700, color: 'var(--vdbus-color-success-text)' }}>
                    {formatVnd(c.grossProfitVnd)}
                  </td>
                  <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'center' }}>
                    <Badge variant={c.marginPercentage >= 30 ? 'success' : 'neutral'}>
                      {c.marginPercentage}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeDimension === 'route' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--vdbus-font-size-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--vdbus-color-border-default)', backgroundColor: 'var(--vdbus-color-bg-subtle)' }}>
                <th style={{ padding: 'var(--vdbus-space-3)' }}>Tuyến vận tải</th>
                <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>Số chuyến</th>
                <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>Cự ly TB</th>
                <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>Tổng Doanh thu</th>
                <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>DT trung bình / chuyến</th>
                <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>Chi phí TB / chuyến</th>
                <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>Lợi nhuận gộp tuyến</th>
                <th style={{ padding: 'var(--vdbus-space-3)', textAlign: 'center' }}>Biên lãi</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoutes.map(r => (
                <tr key={r.routeKey} style={{ borderBottom: '1px solid var(--vdbus-color-border-subtle)' }}>
                  <td style={{ padding: 'var(--vdbus-space-3)' }}>
                    <div style={{ fontWeight: 600 }}>{r.originHub} → {r.destinationHub}</div>
                    <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-color-text-muted)' }}>Mã: {r.routeKey}</div>
                  </td>
                  <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>{r.tripCount}</td>
                  <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>{r.avgDistanceKm} km</td>
                  <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right', fontWeight: 600 }}>{formatVnd(r.totalRevenueVnd)}</td>
                  <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right' }}>{formatVnd(r.avgRevenuePerTripVnd)}</td>
                  <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right', color: 'var(--vdbus-color-error-text)' }}>{formatVnd(r.avgCostPerTripVnd)}</td>
                  <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'right', fontWeight: 700, color: 'var(--vdbus-color-success-text)' }}>
                    {formatVnd(r.grossProfitVnd)}
                  </td>
                  <td style={{ padding: 'var(--vdbus-space-3)', textAlign: 'center' }}>
                    <Badge variant={r.marginPercentage >= 30 ? 'success' : 'neutral'}>
                      {r.marginPercentage}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Banner variant="info" title="Chính sách đối soát và phân bổ chi phí chuẩn xác">
        Dữ liệu chi phí nhiên liệu được lấy từ hóa đơn cây xăng và cảm biến bình dầu; phí trạm đối soát tự động từ VETC; lương tài xế tính theo đơn giá định mức lộ trình vận tải.
      </Banner>
    </div>
  );
};
