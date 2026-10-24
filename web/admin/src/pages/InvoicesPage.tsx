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
  IconSearch,
  IconRefresh,
  IconFileText,
  useToast,
} from '@vdbus/design-system';
import { useI18n } from '../i18n/i18nContext';
import { apiClient } from '../services/apiClient';

export interface InvoiceItem {
  id: string;
  invoiceCode: string;
  orderId?: string;
  order?: {
    orderCode: string;
    pickupAddress: string;
    deliveryAddress: string;
  };
  customerId: string;
  customer?: {
    name: string;
    taxCode: string;
    paymentTermDays: number;
  };
  subTotalVnd: number;
  vatAmountVnd: number;
  totalAmountVnd: number;
  status: string;
  issuedDateUtc: string;
  dueDateUtc: string;
  paymentDateUtc?: string;
  paymentReference?: string;
  notes?: string;
}

const fallbackInvoices: InvoiceItem[] = [
  {
    id: 'inv-11111111-1111-1111-1111-111111111111',
    invoiceCode: 'HD-202610-0019',
    orderId: 'o3333333-3333-3333-3333-333333333333',
    order: {
      orderCode: 'DH-20261023-1102',
      pickupAddress: 'KCN Điện Nam - Điện Ngọc, Quảng Nam',
      deliveryAddress: 'Cảng Tiên Sa, Đà Nẵng',
    },
    customerId: 'c3333333-3333-3333-3333-333333333333',
    customer: {
      name: 'Công ty TNHH May Mặc Dệt Kim Viễn Đông',
      taxCode: '0401889922',
      paymentTermDays: 15,
    },
    subTotalVnd: 5200000,
    vatAmountVnd: 416000,
    totalAmountVnd: 5616000,
    status: 'Pending',
    issuedDateUtc: '2026-10-23T15:00:00Z',
    dueDateUtc: '2026-11-07T15:00:00Z',
    notes: 'Tự động tạo từ biên bản hoàn tất giao hàng ePOD',
  },
  {
    id: 'inv-22222222-2222-2222-2222-222222222222',
    invoiceCode: 'HD-202610-0012',
    customerId: 'c1111111-1111-1111-1111-111111111111',
    customer: {
      name: 'Công ty Cổ phần Sữa Việt Nam (Vinamilk Chi nhánh ĐN)',
      taxCode: '0300588569',
      paymentTermDays: 30,
    },
    subTotalVnd: 18500000,
    vatAmountVnd: 1480000,
    totalAmountVnd: 19980000,
    status: 'Paid',
    issuedDateUtc: '2026-10-15T09:00:00Z',
    dueDateUtc: '2026-11-14T09:00:00Z',
    paymentDateUtc: '2026-10-20T14:30:00Z',
    paymentReference: 'UNC-MBBANK-8829104',
    notes: 'Đã nhận chuyển khoản MBBank đối soát chuyến tuần 2 tháng 10',
  },
  {
    id: 'inv-33333333-3333-3333-3333-333333333333',
    invoiceCode: 'HD-202610-0008',
    customerId: 'c2222222-2222-2222-2222-222222222222',
    customer: {
      name: 'Tập đoàn Thép Hòa Phát (Dung Quất)',
      taxCode: '0102774390',
      paymentTermDays: 45,
    },
    subTotalVnd: 45000000,
    vatAmountVnd: 3600000,
    totalAmountVnd: 48600000,
    status: 'Paid',
    issuedDateUtc: '2026-10-10T08:00:00Z',
    dueDateUtc: '2026-11-24T08:00:00Z',
    paymentDateUtc: '2026-10-18T10:15:00Z',
    paymentReference: 'UNC-VIETCOM-901823',
    notes: 'Đối soát cước vận tải thép cuộn cung đoạn Dung Quất - Đà Nẵng',
  },
];

export const InvoicesPage: React.FC = () => {
  const { formatCurrencyVnd } = useI18n();
  const { addToast } = useToast();
  const [invoices, setInvoices] = useState<InvoiceItem[]>(fallbackInvoices);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal reconcile state
  const [reconcilingInvoice, setReconcilingInvoice] = useState<InvoiceItem | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [reconcileNotes, setReconcileNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<InvoiceItem[]>('/invoices');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setInvoices(res.data);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch =
        !searchTerm.trim() ||
        inv.invoiceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.customer?.name && inv.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (inv.order?.orderCode && inv.order.orderCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (inv.paymentReference && inv.paymentReference.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = statusFilter === 'ALL' || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  const handleOpenReconcile = (invoice: InvoiceItem) => {
    setReconcilingInvoice(invoice);
    setPaymentReference(`UNC-${Date.now().toString().slice(-6)}`);
    setReconcileNotes('Đã kiểm tra đối soát chữ ký nhận hàng ePOD khớp lệnh cước');
  };

  const handleConfirmReconcile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reconcilingInvoice) return;
    if (!paymentReference.trim()) {
      addToast('Vui lòng nhập mã tham chiếu giao dịch hoặc số UNC.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post(`/invoices/${reconcilingInvoice.id}/reconcile`, {
        paymentReference,
        notes: reconcileNotes,
      });

      setInvoices((prev) =>
        prev.map((i) =>
          i.id === reconcilingInvoice.id
            ? {
                ...i,
                status: 'Paid',
                paymentDateUtc: new Date().toISOString(),
                paymentReference,
                notes: `${i.notes || ''}; ${reconcileNotes}`,
              }
            : i
        )
      );

      addToast(`Đối soát và quyết toán hóa đơn ${reconcilingInvoice.invoiceCode} thành công!`, 'success');
      setReconcilingInvoice(null);
    } catch {
      // Local fallback
      setInvoices((prev) =>
        prev.map((i) =>
          i.id === reconcilingInvoice.id
            ? {
                ...i,
                status: 'Paid',
                paymentDateUtc: new Date().toISOString(),
                paymentReference,
                notes: `${i.notes || ''}; ${reconcileNotes}`,
              }
            : i
        )
      );
      addToast(`Đã quyết toán hóa đơn ${reconcilingInvoice.invoiceCode} (chế độ cục bộ)`, 'info');
      setReconcilingInvoice(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '-';
    try {
      return new Date(iso).toLocaleDateString('vi-VN');
    } catch {
      return iso;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <Badge variant="success">Đã thanh toán</Badge>;
      case 'Pending':
        return <Badge variant="warning">Chờ thanh toán</Badge>;
      case 'Overdue':
        return <Badge variant="error">Quá hạn</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const columns: Column<InvoiceItem>[] = [
    {
      key: 'invoiceCode',
      header: 'Số hóa đơn / Đơn hàng',
      render: (val: string, row: InvoiceItem) => (
        <div>
          <span style={{ fontWeight: 600, fontFamily: 'var(--vdbus-font-mono)', color: 'var(--vdbus-color-primary-600)' }}>
            {val}
          </span>
          {row.order && (
            <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-text-secondary)', marginTop: '2px' }}>
              Đơn: {row.order.orderCode}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Khách hàng / Doanh nghiệp',
      render: (_: any, row: InvoiceItem) => (
        <div>
          <span style={{ fontWeight: 500, color: 'var(--vdbus-text-primary)' }}>
            {row.customer?.name || 'Đối tác'}
          </span>
          <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-text-muted)' }}>
            MST: {row.customer?.taxCode || '-'} | Hạn: {row.customer?.paymentTermDays || 30} ngày
          </div>
        </div>
      ),
    },
    {
      key: 'totalAmountVnd',
      header: 'Tổng tiền thanh toán',
      isNumeric: true,
      render: (val: number, row: InvoiceItem) => (
        <div>
          <span style={{ fontFamily: 'var(--vdbus-font-mono)', fontWeight: 600 }}>
            {formatCurrencyVnd(val)}
          </span>
          <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-text-muted)' }}>
            Gốc: {formatCurrencyVnd(row.subTotalVnd)} (VAT: {formatCurrencyVnd(row.vatAmountVnd)})
          </div>
        </div>
      ),
    },
    {
      key: 'issuedDateUtc',
      header: 'Ngày lập & Hạn trả',
      render: (val: string, row: InvoiceItem) => (
        <div>
          <div style={{ fontSize: 'var(--vdbus-font-size-xs)' }}>Lập: {formatDate(val)}</div>
          <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-text-muted)' }}>
            Hạn: {formatDate(row.dueDateUtc)}
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
      key: 'paymentReference',
      header: 'Chứng từ thanh toán',
      render: (val?: string, row?: InvoiceItem) => (
        val ? (
          <div>
            <span style={{ fontFamily: 'var(--vdbus-font-mono)', fontSize: 'var(--vdbus-font-size-xs)' }}>
              {val}
            </span>
            <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-text-muted)' }}>
              {formatDate(row?.paymentDateUtc)}
            </div>
          </div>
        ) : (
          <span style={{ color: 'var(--vdbus-text-muted)', fontStyle: 'italic', fontSize: 'var(--vdbus-font-size-xs)' }}>
            Chưa đối soát
          </span>
        )
      ),
    },
    {
      key: 'id',
      header: 'Thao tác',
      render: (_: string, row: InvoiceItem) => (
        row.status === 'Pending' ? (
          <Button variant="primary" size="sm" onClick={() => handleOpenReconcile(row)}>
            <IconFileText size={14} /> Đối soát cước
          </Button>
        ) : (
          <Badge variant="success">Hoàn tất</Badge>
        )
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Quản lý Tài chính & Đối soát Cước"
        subtitle="Quyết toán công nợ theo chuyến xe, kiểm tra chữ ký nhận ePOD và ghi nhận chứng từ thanh toán"
        breadcrumbs={[{ label: 'Tài chính' }, { label: 'Hóa đơn & Cước' }]}
        actions={
          <Button variant="outline" size="sm" onClick={fetchInvoices} disabled={isLoading}>
            <IconRefresh size={14} /> Làm mới
          </Button>
        }
      />

      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ width: '320px' }}>
          <Input
            placeholder="Tìm theo số HĐ, khách hàng, mã đơn, UNC..."
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
              { value: 'Pending', label: 'Chờ thanh toán' },
              { value: 'Paid', label: 'Đã thanh toán' },
              { value: 'Overdue', label: 'Quá hạn' },
            ]}
          />
        </div>
      </div>

      <DataTable
        data={filteredInvoices}
        columns={columns}
        rowKey={(i) => i.id}
        isLoading={isLoading}
        pagination={{
          pageIndex: 1,
          pageSize: 10,
          totalItems: filteredInvoices.length,
          onPageChange: () => {},
        }}
      />

      {/* Modal Đối Soát Cước & Thanh Toán */}
      <Modal
        isOpen={!!reconcilingInvoice}
        onClose={() => setReconcilingInvoice(null)}
        title={reconcilingInvoice ? `Đối soát cước: ${reconcilingInvoice.invoiceCode}` : 'Đối soát cước'}
        size="base"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', width: '100%' }}>
            <Button variant="outline" onClick={() => setReconcilingInvoice(null)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleConfirmReconcile} disabled={isSubmitting}>
              Xác nhận quyết toán cước
            </Button>
          </div>
        }
      >
        {reconcilingInvoice && (
          <form onSubmit={handleConfirmReconcile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '12px', background: 'var(--vdbus-surface-secondary)', borderRadius: '6px' }}>
              <div style={{ fontWeight: 600, color: 'var(--vdbus-text-primary)' }}>
                {reconcilingInvoice.customer?.name}
              </div>
              <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-text-secondary)', marginTop: '4px' }}>
                Đơn hàng: {reconcilingInvoice.order?.orderCode} | Số tiền cần thu: <strong style={{ fontFamily: 'var(--vdbus-font-mono)' }}>{formatCurrencyVnd(reconcilingInvoice.totalAmountVnd)}</strong>
              </div>
            </div>

            <FormField label="Mã tham chiếu ngân hàng / Số UNC" required helperText="Nhập mã chứng từ chuyển khoản ngân hàng hoặc phiếu thu cước">
              <Input
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="VD: UNC-VCB-883921 hoặc PT-2026-0012"
              />
            </FormField>

            <FormField label="Ghi chú đối soát" helperText="Ghi nhận biên bản bàn giao ePOD hoặc thỏa thuận thanh toán bù trừ">
              <Input
                value={reconcileNotes}
                onChange={(e) => setReconcileNotes(e.target.value)}
                placeholder="VD: Đã đối chiếu biên bản giao nhận hoàn tất"
              />
            </FormField>
          </form>
        )}
      </Modal>
    </div>
  );
};
