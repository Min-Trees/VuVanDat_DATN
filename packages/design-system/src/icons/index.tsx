import React from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronsUpDown,
  AlertTriangle,
  AlertCircle,
  X,
  Check,
  Menu,
  MoreHorizontal,
  RefreshCw,
  LogOut,
  MapPin,
  Truck,
  Building,
  User,
  Shield,
  FileText,
  Sliders,
  Radio,
  Clock,
  Download,
  Plus,
} from 'lucide-react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
  'aria-label'?: string;
}

const DEFAULT_ICON_SIZE = 16;
const DEFAULT_STROKE_WIDTH = 1.75;

function createIcon(Component: React.ComponentType<any>, defaultAriaLabel: string) {
  return React.forwardRef<SVGSVGElement, IconProps>(({ size = DEFAULT_ICON_SIZE, className, 'aria-label': ariaLabel = defaultAriaLabel, ...props }, ref) => (
    <Component
      ref={ref}
      size={size}
      strokeWidth={DEFAULT_STROKE_WIDTH}
      className={className}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, color: 'currentColor' }}
      {...props}
    />
  ));
}

export const IconSearch = createIcon(Search, 'Tìm kiếm');
export const IconFilter = createIcon(Filter, 'Bộ lọc');
export const IconChevronDown = createIcon(ChevronDown, 'Mở rộng');
export const IconChevronRight = createIcon(ChevronRight, 'Tiếp tục');
export const IconChevronLeft = createIcon(ChevronLeft, 'Quay lại');
export const IconChevronUp = createIcon(ChevronUp, 'Thu gọn');
export const IconChevronsUpDown = createIcon(ChevronsUpDown, 'Sắp xếp');
export const IconAlertTriangle = createIcon(AlertTriangle, 'Cảnh báo');
export const IconAlertCircle = createIcon(AlertCircle, 'Thông tin lỗi');
export const IconClose = createIcon(X, 'Đóng');
export const IconCheck = createIcon(Check, 'Thành công');
export const IconMenu = createIcon(Menu, 'Trình đơn');
export const IconMoreHorizontal = createIcon(MoreHorizontal, 'Thao tác khác');
export const IconRefresh = createIcon(RefreshCw, 'Làm mới');
export const IconLogOut = createIcon(LogOut, 'Đăng xuất');
export const IconMapPin = createIcon(MapPin, 'Tọa độ');
export const IconTruck = createIcon(Truck, 'Xe vận tải');
export const IconBuilding = createIcon(Building, 'Doanh nghiệp');
export const IconUser = createIcon(User, 'Người dùng');
export const IconShield = createIcon(Shield, 'Bảo mật');
export const IconFileText = createIcon(FileText, 'Tài liệu');
export const IconSliders = createIcon(Sliders, 'Cấu hình');
export const IconRadio = createIcon(Radio, 'Tín hiệu kết nối');
export const IconClock = createIcon(Clock, 'Thời gian');
export const IconDownload = createIcon(Download, 'Tải xuống');
export const IconPlus = createIcon(Plus, 'Thêm mới');
