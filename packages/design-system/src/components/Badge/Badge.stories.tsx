import { Badge } from './Badge';
import { MockDataBadge } from '../MockDataBadge/MockDataBadge';

export default {
  title: 'Components/Badge',
  component: Badge,
};

export const StatusBadges = () => (
  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
    <Badge variant="neutral">Chờ điều xe</Badge>
    <Badge variant="info">Đang lấy hàng</Badge>
    <Badge variant="warning">Cảnh báo nhiệt độ</Badge>
    <Badge variant="error">Quá hạn giao</Badge>
    <Badge variant="success">Đã giao thành công</Badge>
    <MockDataBadge />
  </div>
);
