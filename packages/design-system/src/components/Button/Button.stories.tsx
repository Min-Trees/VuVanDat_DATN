import { Button } from './Button';

export default {
  title: 'Components/Button',
  component: Button,
};

export const Variants = () => (
  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
    <Button variant="primary">Lưu thay đổi</Button>
    <Button variant="secondary">Hủy bỏ</Button>
    <Button variant="outline">Xuất dữ liệu</Button>
    <Button variant="danger">Hủy chuyến xe</Button>
    <Button variant="ghost">Thu gọn</Button>
  </div>
);

export const Sizes = () => (
  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
    <Button size="sm">Cỡ nhỏ 28px</Button>
    <Button size="base">Chuẩn 32px</Button>
    <Button size="md">Cỡ trung 36px</Button>
  </div>
);

export const Loading = () => (
  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
    <Button variant="primary" isLoading>
      Đang xử lý
    </Button>
    <Button variant="secondary" isLoading>
      Đang tải
    </Button>
  </div>
);
