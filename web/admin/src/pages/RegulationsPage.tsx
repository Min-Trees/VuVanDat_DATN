import { useState } from 'react';
import {
  PageHeader,
  Button,
  DataTable,
  Column,
  Badge,
  Banner,
  Modal,
  FormField,
  Input,
  Select,
  IconPlus,
} from '@vdbus/design-system';
import { useI18n } from '../i18n/i18nContext';

interface RegulationItem {
  id: string;
  provinceCode: string;
  routeName: string;
  vehicleType: string;
  timeWindow: string;
  maxWeightTons: number;
  sourceReference: string;
  legalNote: string;
}

const mockRegulations: RegulationItem[] = [
  {
    id: '1',
    provinceCode: 'HN',
    routeName: 'Vành đai 3 trên cao',
    vehicleType: 'Xe tải trên 2.5 tấn',
    timeWindow: '06:00 - 09:00, 16:30 - 19:30',
    maxWeightTons: 2.5,
    sourceReference: 'Quyết định số 24/2020/QĐ-UBND Hà Nội',
    legalNote: 'Cần chuyên gia pháp lý xác nhận trước khi áp dụng chính thức',
  },
  {
    id: '2',
    provinceCode: 'HCM',
    routeName: 'Khu vực nội đô TP. Hồ Chí Minh',
    vehicleType: 'Xe tải nặng & Container',
    timeWindow: '06:00 - 22:00',
    maxWeightTons: 5.0,
    sourceReference: 'Quyết định số 23/2018/QĐ-UBND TP.HCM',
    legalNote: 'Cần chuyên gia pháp lý xác nhận trước khi áp dụng chính thức',
  },
];

export const RegulationsPage = () => {
  const { t } = useI18n();
  const [rules] = useState<RegulationItem[]>(mockRegulations);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns: Column<RegulationItem>[] = [
    { key: 'provinceCode', header: 'Tỉnh/Thành', width: 100 },
    { key: 'routeName', header: 'Tuyến đường / Khu vực' },
    { key: 'vehicleType', header: 'Loại phương tiện' },
    { key: 'timeWindow', header: 'Khung giờ hạn chế' },
    {
      key: 'maxWeightTons',
      header: 'Tải trọng tối đa (Tấn)',
      isNumeric: true,
      render: (val: number) => val.toFixed(1),
    },
    { key: 'sourceReference', header: 'Văn bản căn cứ' },
    {
      key: 'legalNote',
      header: 'Ghi chú pháp lý',
      render: (note: string) => <Badge variant="warning">{note}</Badge>,
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('nav.regulations')}
        subtitle="Quản lý cấu hình quy định cấm giờ, cấm tải và hạn mức lưu thông đường bộ"
        breadcrumbs={[{ label: 'Cấu hình' }, { label: t('nav.regulations') }]}
        actions={
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <IconPlus size={14} /> Thêm quy định mới
          </Button>
        }
      />

      <div style={{ marginBottom: '16px' }}>
        <Banner variant="info" title="Lưu ý về căn cứ pháp lý">
          Các quy định cấm giờ và tải trọng được lưu trữ dưới dạng cấu hình động do quản trị viên thiết lập.
          Hệ thống không tự ý đưa ra kết luận pháp lý; mọi quyết định vận hành cần được chuyên gia pháp lý xác nhận.
        </Banner>
      </div>

      <DataTable
        data={rules}
        columns={columns}
        rowKey={(r) => r.id}
        pagination={{
          pageIndex: 1,
          pageSize: 10,
          totalItems: rules.length,
          onPageChange: () => {},
        }}
      />

      {/* Modal Thêm Quy định */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Thêm quy định hạn chế giao thông"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              Lưu quy định
            </Button>
          </>
        }
      >
        <FormField label="Tỉnh / Thành phố" required>
          <Select
            options={[
              { value: 'HN', label: 'Hà Nội' },
              { value: 'HCM', label: 'TP. Hồ Chí Minh' },
              { value: 'DN', label: 'Đà Nẵng' },
              { value: 'HP', label: 'Hải Phòng' },
            ]}
          />
        </FormField>

        <FormField label="Tuyến đường / Khu vực áp dụng" required>
          <Input placeholder="Ví dụ: Đường Vành đai 3, Quốc lộ 1A..." />
        </FormField>

        <FormField label="Tải trọng giới hạn (Tấn)" required>
          <Input type="number" step="0.5" placeholder="Ví dụ: 2.5" isTabular />
        </FormField>

        <FormField
          label="Văn bản căn cứ (Nguồn văn bản)"
          helperText="Ghi rõ số hiệu văn bản quyết định của cơ quan nhà nước có thẩm quyền"
          required
        >
          <Input placeholder="Ví dụ: Quyết định số 24/2020/QĐ-UBND" />
        </FormField>
      </Modal>
    </div>
  );
};
