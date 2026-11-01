import React, { useEffect, useState } from 'react';
import {
  PageHeader,
  Button,
  Badge,
  ScoreMeter,
  SplitPane,
  MapPanel,
  VDBusMap,
  EmptyState,
  MockDataBadge,
  IconRefresh,
  IconTruck,
  IconMapPin,
  useToast,
} from '@vdbus/design-system';
import { useI18n } from '../i18n/i18nContext';
import { apiClient } from '../services/apiClient';

interface PendingOrderItem {
  id: string;
  orderCode: string;
  customerName: string;
  pickupAddress: string;
  deliveryAddress: string;
  totalWeightKg: number;
  totalVolumeCbm: number;
  pickupWindow: string;
  deliveryWindow: string;
  freightAmountVnd: number;
}

interface RecommendationItem {
  vehicleId: string;
  licensePlate: string;
  driverId: string;
  driverName: string;
  vehicleType: string;
  makeModel: string;
  maxPayloadKg: number;
  totalScore: number;
  capacityScore: number;
  typeMatchScore: number;
  proximityScore: number;
  backhaulScore: number;
  reasons: string[];
  isSimulated: boolean;
}

const fallbackPendingOrders: PendingOrderItem[] = [
  {
    id: 'o2222222-2222-2222-2222-222222222222',
    orderCode: 'DH-20261024-9041',
    customerName: 'Thép Hòa Phát Dung Quất',
    pickupAddress: 'KKT Dung Quất, Bình Sơn, Quảng Ngãi',
    deliveryAddress: 'Công trường Cầu Sông Hàn, Đà Nẵng',
    totalWeightKg: 24000,
    totalVolumeCbm: 18,
    pickupWindow: '24/10 09:00 - 12:00',
    deliveryWindow: '24/10 16:00 - 19:00',
    freightAmountVnd: 12500000,
  },
  {
    id: 'o4444444-4444-4444-4444-444444444444',
    orderCode: 'DH-20261024-5519',
    customerName: 'Vinamilk Chi nhánh ĐN',
    pickupAddress: 'KCN Hòa Khánh, Liên Chiểu, Đà Nẵng',
    deliveryAddress: 'Đại lý Sữa Tam Kỳ, Quảng Nam',
    totalWeightKg: 6200,
    totalVolumeCbm: 28,
    pickupWindow: '24/10 10:30 - 12:30',
    deliveryWindow: '24/10 14:00 - 16:00',
    freightAmountVnd: 3800000,
  },
  {
    id: 'o5555555-5555-5555-5555-555555555555',
    orderCode: 'DH-20261024-6721',
    customerName: 'Dệt Kim Viễn Đông',
    pickupAddress: 'KCN Điện Nam - Điện Ngọc, Quảng Nam',
    deliveryAddress: 'Cảng Chu Lai, Núi Thành, Quảng Nam',
    totalWeightKg: 8500,
    totalVolumeCbm: 40,
    pickupWindow: '24/10 13:00 - 15:00',
    deliveryWindow: '24/10 17:00 - 19:00',
    freightAmountVnd: 5600000,
  },
];

const fallbackRecommendations: Record<string, RecommendationItem[]> = {
  'o2222222-2222-2222-2222-222222222222': [
    {
      vehicleId: 'v2222222-2222-2222-2222-222222222222',
      licensePlate: '43H-012.88',
      driverId: 'd1111111-1111-1111-1111-111111111111',
      driverName: 'Nguyễn Văn Tuấn',
      vehicleType: 'Container / Đầu kéo',
      makeModel: 'Hyundai HD320',
      maxPayloadKg: 30000,
      totalScore: 92.5,
      capacityScore: 33.5, // max 35
      typeMatchScore: 25.0, // max 25
      proximityScore: 18.0, // max 20
      backhaulScore: 16.0, // max 20
      reasons: [
        'Tải trọng 30.0 tấn đáp ứng trọn vẹn 24.0 tấn thép (tỷ lệ tải 80.0%)',
        'Loại xe sơ-mi rơ-moóc chuyên dụng phù hợp hàng vật liệu xây dựng',
        'Cự ly hiện tại 14.5 km so với điểm bốc hàng Dung Quất',
        'Có đơn hàng dự kiến chiều về Đà Nẵng - Quảng Ngãi',
      ],
      isSimulated: true,
    },
    {
      vehicleId: 'v4444444-4444-4444-4444-444444444444',
      licensePlate: '92C-156.40',
      driverId: 'd4444444-4444-4444-4444-444444444444',
      driverName: 'Phạm Đức Mạnh',
      vehicleType: 'Tải thùng bạt',
      makeModel: 'Thaco Auman C160',
      maxPayloadKg: 9100,
      totalScore: 28.0,
      capacityScore: 0.0, // Quá tải!
      typeMatchScore: 12.0,
      proximityScore: 16.0,
      backhaulScore: 0.0,
      reasons: [
        'Không khuyến nghị: Tải trọng xe (9.1 tấn) thấp hơn trọng lượng hàng (24.0 tấn)',
        'Cần chuyên gia điều phối tách làm 3 chuyến hoặc chọn xe trọng tải lớn hơn',
      ],
      isSimulated: true,
    },
  ],
  'o4444444-4444-4444-4444-444444444444': [
    {
      vehicleId: 'v1111111-1111-1111-1111-111111111111',
      licensePlate: '43C-189.24',
      driverId: 'd2222222-2222-2222-2222-222222222222',
      driverName: 'Trần Văn Hoàng',
      vehicleType: 'Tải thùng kín',
      makeModel: 'Hino 500 FG8JJ7A',
      maxPayloadKg: 8500,
      totalScore: 89.0,
      capacityScore: 32.0,
      typeMatchScore: 25.0,
      proximityScore: 19.0,
      backhaulScore: 13.0,
      reasons: [
        'Tải trọng 8.5 tấn đáp ứng tối ưu đơn hàng 6.2 tấn (tỷ lệ 73%)',
        'Thùng kín sạch sẽ đạt tiêu chuẩn vận chuyển thực phẩm đóng hộp',
        'Xe đang đỗ tại bãi Hòa Khánh, cự ly tiếp cận 2.8 km',
      ],
      isSimulated: true,
    },
  ],
};

export const DispatchConsolePage: React.FC = () => {
  const { formatCurrencyVnd } = useI18n();
  const { addToast } = useToast();
  const [pendingOrders, setPendingOrders] = useState<PendingOrderItem[]>(fallbackPendingOrders);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(fallbackPendingOrders[0].id);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>(
    fallbackRecommendations[fallbackPendingOrders[0].id] || []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const selectedOrder = pendingOrders.find((o) => o.id === selectedOrderId);

  const fetchRecommendations = async (orderId: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<any>(`/dispatch/recommendations/${orderId}`);
      if (res.data?.rankedVehicles && Array.isArray(res.data.rankedVehicles)) {
        setRecommendations(res.data.rankedVehicles);
      } else {
        setRecommendations(fallbackRecommendations[orderId] || []);
      }
    } catch {
      setRecommendations(fallbackRecommendations[orderId] || []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const res = await apiClient.get<any[]>('/orders');
        if (Array.isArray(res.data) && res.data.length > 0) {
          const mapped: PendingOrderItem[] = res.data.map((o) => ({
            id: o.id,
            orderCode: o.orderCode,
            customerName: o.customer?.name || 'Khách hàng VDBus',
            pickupAddress: o.pickupAddress,
            deliveryAddress: o.deliveryAddress,
            totalWeightKg: o.totalWeightKg,
            totalVolumeCbm: o.totalVolumeCbm,
            pickupWindow: `${new Date(o.pickupWindowStartUtc).toLocaleDateString('vi-VN')} ${new Date(o.pickupWindowStartUtc).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
            deliveryWindow: `${new Date(o.deliveryWindowStartUtc).toLocaleDateString('vi-VN')} ${new Date(o.deliveryWindowStartUtc).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
            freightAmountVnd: o.freightAmountVnd,
          }));
          setPendingOrders(mapped);
          if (mapped.length > 0) {
            setSelectedOrderId(mapped[0].id);
          }
        }
      } catch {
        // Keep fallback
      }
    };
    fetchPendingOrders();
  }, []);

  useEffect(() => {
    if (selectedOrderId) {
      fetchRecommendations(selectedOrderId);
    }
  }, [selectedOrderId]);

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  const handleAssignVehicle = async (rec: RecommendationItem) => {
    if (!selectedOrder) return;
    setIsAssigning(true);
    try {
      await apiClient.post('/dispatch/assign', {
        orderId: selectedOrder.id,
        vehicleId: rec.vehicleId,
        driverId: rec.driverId,
        notes: `Điều xe tự động từ khuyến nghị bàn điều phối (Điểm: ${rec.totalScore.toFixed(0)}/100)`,
      });

      addToast(
        `Gán xe ${rec.licensePlate} (${rec.driverName}) cho đơn ${selectedOrder.orderCode} thành công!`,
        'success'
      );

      // Cập nhật danh sách đơn chờ
      setPendingOrders((prev) => prev.filter((o) => o.id !== selectedOrder.id));
      const remaining = pendingOrders.filter((o) => o.id !== selectedOrder.id);
      if (remaining.length > 0) {
        setSelectedOrderId(remaining[0].id);
      }
    } catch {
      // Local fallback for offline simulation
      addToast(
        `Đã gán xe ${rec.licensePlate} cho đơn ${selectedOrder.orderCode} (chế độ mô phỏng)`,
        'info'
      );
      setPendingOrders((prev) => prev.filter((o) => o.id !== selectedOrder.id));
      const remaining = pendingOrders.filter((o) => o.id !== selectedOrder.id);
      if (remaining.length > 0) {
        setSelectedOrderId(remaining[0].id);
      }
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Bàn Điều Phối Chia Đôi"
        subtitle="Thuật toán gợi ý minh bạch 4 yếu tố: Tải trọng (35%), Loại xe (25%), Cự ly tiếp cận (20%), Khớp chuyến về (20%)"
        breadcrumbs={[{ label: 'Vận hành' }, { label: 'Bàn điều phối' }]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectedOrderId && fetchRecommendations(selectedOrderId)}
            disabled={isLoading}
          >
            <IconRefresh size={14} /> Làm mới gợi ý
          </Button>
        }
      />

      <SplitPane
        leftWidth="400px"
        left={
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div
              style={{
                padding: '12px',
                borderBottom: '1px solid var(--vdbus-border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <strong style={{ fontSize: 'var(--vdbus-font-size-sm)', color: 'var(--vdbus-text-primary)' }}>
                Đơn hàng chờ điều xe ({pendingOrders.length})
              </strong>
              <Badge variant="warning">Hàng đợi</Badge>
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              {pendingOrders.length === 0 ? (
                <div style={{ padding: '24px' }}>
                  <EmptyState
                    title="Không có đơn chờ"
                    description="Hiện tại toàn bộ đơn hàng đều đã được phân bổ phương tiện vận chuyển."
                  />
                </div>
              ) : (
                pendingOrders.map((order) => {
                  const isSelected = order.id === selectedOrderId;
                  return (
                    <div
                      key={order.id}
                      onClick={() => handleSelectOrder(order.id)}
                      style={{
                        padding: '12px 14px',
                        borderBottom: '1px solid var(--vdbus-border-subtle)',
                        backgroundColor: isSelected
                          ? 'var(--vdbus-surface-tertiary)'
                          : 'var(--vdbus-surface-primary)',
                        borderLeft: isSelected
                          ? '3px solid var(--vdbus-color-primary-500)'
                          : '3px solid transparent',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span
                          style={{
                            fontWeight: 600,
                            fontFamily: 'var(--vdbus-font-mono)',
                            color: 'var(--vdbus-color-primary-600)',
                            fontSize: 'var(--vdbus-font-size-sm)',
                          }}
                        >
                          {order.orderCode}
                        </span>
                        <span style={{ fontSize: 'var(--vdbus-font-size-xs)', fontFamily: 'var(--vdbus-font-mono)', fontWeight: 500 }}>
                          {(order.totalWeightKg / 1000).toFixed(1)} tấn
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: 'var(--vdbus-font-size-xs)',
                          fontWeight: 500,
                          color: 'var(--vdbus-text-primary)',
                          marginTop: '4px',
                        }}
                      >
                        {order.customerName}
                      </div>

                      <div
                        style={{
                          fontSize: 'var(--vdbus-font-size-xs)',
                          color: 'var(--vdbus-text-secondary)',
                          marginTop: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <IconMapPin size={12} />
                        <span>{order.pickupAddress.split(',')[0]} &rarr; {order.deliveryAddress.split(',')[0]}</span>
                      </div>

                      <div
                        style={{
                          fontSize: 'var(--vdbus-font-size-xs)',
                          color: 'var(--vdbus-text-muted)',
                          marginTop: '2px',
                        }}
                      >
                        Khung giờ: {order.pickupWindow}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        }
        right={
          <div style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {selectedOrder ? (
              <>
                {/* Thông tin đơn đang chọn */}
                <div
                  style={{
                    padding: '14px',
                    background: 'var(--vdbus-surface-secondary)',
                    borderRadius: '6px',
                    border: '1px solid var(--vdbus-border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <strong style={{ fontSize: 'var(--vdbus-font-size-base)', color: 'var(--vdbus-text-primary)' }}>
                        {selectedOrder.orderCode} - {selectedOrder.customerName}
                      </strong>
                    </div>
                    <span style={{ fontFamily: 'var(--vdbus-font-mono)', fontWeight: 600, color: 'var(--vdbus-color-primary-600)' }}>
                      {formatCurrencyVnd(selectedOrder.freightAmountVnd)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '8px',
                      fontSize: 'var(--vdbus-font-size-xs)',
                      color: 'var(--vdbus-text-secondary)',
                    }}
                  >
                    <div>
                      <strong>Trọng lượng:</strong> {(selectedOrder.totalWeightKg / 1000).toFixed(1)} tấn ({selectedOrder.totalWeightKg.toLocaleString()} kg)
                    </div>
                    <div>
                      <strong>Thể tích:</strong> {selectedOrder.totalVolumeCbm} m³
                    </div>
                    <div>
                      <strong>Lấy hàng:</strong> {selectedOrder.pickupWindow}
                    </div>
                    <div>
                      <strong>Giao hàng:</strong> {selectedOrder.deliveryWindow}
                    </div>
                  </div>

                  <div style={{ marginTop: '10px', fontSize: 'var(--vdbus-font-size-xs)' }}>
                    <div><strong>Điểm lấy:</strong> {selectedOrder.pickupAddress}</div>
                    <div style={{ marginTop: '2px' }}><strong>Điểm giao:</strong> {selectedOrder.deliveryAddress}</div>
                  </div>
                </div>

                {/* Bản đồ hành trình có thể thu gọn */}
                <MapPanel
                  title={`Hành trình điều xe: ${selectedOrder.orderCode}`}
                  height={260}
                  isCollapsible={true}
                  defaultExpanded={true}
                  isSimulated={false}
                >
                  <VDBusMap
                    center={[16.074, 108.182]}
                    zoom={12}
                    height={260}
                    markers={[
                      {
                        id: 'pickup',
                        lat: 16.074,
                        lng: 108.153,
                        title: 'Điểm lấy hàng',
                        subtitle: selectedOrder.pickupAddress,
                        status: 'Pickup',
                      },
                      {
                        id: 'delivery',
                        lat: 16.068,
                        lng: 108.212,
                        title: 'Điểm giao hàng',
                        subtitle: selectedOrder.deliveryAddress,
                        status: 'Delivery',
                      },
                    ]}
                    polylines={[
                      {
                        id: 'route',
                        points: [
                          [16.074, 108.153],
                          [16.075, 108.170],
                          [16.065, 108.190],
                          [16.068, 108.212],
                        ],
                        color: 'var(--vdbus-color-primary, #2563eb)',
                        weight: 4,
                      },
                    ]}
                  />
                </MapPanel>

                {/* Danh sách xe khuyến nghị theo công thức minh bạch */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: 'var(--vdbus-font-size-base)', fontWeight: 600 }}>
                      Bảng xếp hạng phương tiện khuyến nghị
                    </h3>
                    <span style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-text-muted)' }}>
                      Tính toán tự động theo thời gian thực
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {recommendations.length === 0 ? (
                      <EmptyState
                        title="Không tìm thấy xe phù hợp"
                        description="Hiện không có phương tiện nào đáp ứng tải trọng hoặc đang trong khu vực lân cận."
                      />
                    ) : (
                      recommendations.map((rec, index) => {
                        const isOverloaded = rec.totalScore < 40;
                        return (
                          <div
                            key={rec.vehicleId}
                            style={{
                              padding: '14px',
                              borderRadius: '6px',
                              border: isOverloaded
                                ? '1px solid var(--vdbus-border-subtle)'
                                : '1px solid var(--vdbus-border-default)',
                              background: 'var(--vdbus-surface-primary)',
                              boxShadow: isOverloaded ? 'none' : 'var(--vdbus-shadow-sm)',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <Badge variant={index === 0 && !isOverloaded ? 'success' : 'neutral'}>
                                    Ưu tiên #{index + 1}
                                  </Badge>
                                  <span style={{ fontWeight: 600, fontFamily: 'var(--vdbus-font-mono)', fontSize: 'var(--vdbus-font-size-base)' }}>
                                    {rec.licensePlate}
                                  </span>
                                  {rec.isSimulated && <MockDataBadge />}
                                </div>
                                <div style={{ fontSize: 'var(--vdbus-font-size-xs)', color: 'var(--vdbus-text-secondary)', marginTop: '4px' }}>
                                  Tài xế: <strong>{rec.driverName}</strong> | Loại: {rec.vehicleType} ({rec.makeModel}) | Tải max: {(rec.maxPayloadKg / 1000).toFixed(1)} tấn
                                </div>
                              </div>

                              <div style={{ width: '160px', textAlign: 'right' }}>
                                <ScoreMeter score={rec.totalScore} label="Độ khớp" />
                              </div>
                            </div>

                            {/* Chi tiết 4 thành phần điểm minh bạch */}
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gap: '8px',
                                padding: '8px',
                                background: 'var(--vdbus-surface-secondary)',
                                borderRadius: '4px',
                                fontSize: 'var(--vdbus-font-size-xs)',
                                margin: '8px 0',
                              }}
                            >
                              <div>
                                <span style={{ color: 'var(--vdbus-text-muted)', display: 'block' }}>Tải trọng (35%)</span>
                                <strong style={{ fontFamily: 'var(--vdbus-font-mono)' }}>{rec.capacityScore.toFixed(1)}/35</strong>
                              </div>
                              <div>
                                <span style={{ color: 'var(--vdbus-text-muted)', display: 'block' }}>Loại xe (25%)</span>
                                <strong style={{ fontFamily: 'var(--vdbus-font-mono)' }}>{rec.typeMatchScore.toFixed(1)}/25</strong>
                              </div>
                              <div>
                                <span style={{ color: 'var(--vdbus-text-muted)', display: 'block' }}>Cự ly (20%)</span>
                                <strong style={{ fontFamily: 'var(--vdbus-font-mono)' }}>{rec.proximityScore.toFixed(1)}/20</strong>
                              </div>
                              <div>
                                <span style={{ color: 'var(--vdbus-text-muted)', display: 'block' }}>Chuyến về (20%)</span>
                                <strong style={{ fontFamily: 'var(--vdbus-font-mono)' }}>{rec.backhaulScore.toFixed(1)}/20</strong>
                              </div>
                            </div>

                            {/* Lý do minh bạch */}
                            <div style={{ margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {rec.reasons.map((reason, rIdx) => (
                                <div
                                  key={rIdx}
                                  style={{
                                    fontSize: 'var(--vdbus-font-size-xs)',
                                    color: reason.includes('Không khuyến nghị')
                                      ? 'var(--vdbus-color-error-600)'
                                      : 'var(--vdbus-text-secondary)',
                                    display: 'flex',
                                    alignItems: 'baseline',
                                    gap: '6px',
                                  }}
                                >
                                  <span style={{ fontSize: '10px' }}>&bull;</span>
                                  <span>{reason}</span>
                                </div>
                              ))}
                            </div>

                            {/* Nút hành động gán xe */}
                            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                              <Button
                                variant={index === 0 && !isOverloaded ? 'primary' : 'outline'}
                                size="sm"
                                disabled={isAssigning || isOverloaded}
                                onClick={() => handleAssignVehicle(rec)}
                              >
                                <IconTruck size={14} /> Gán xe & Lập chuyến xe
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            ) : (
              <EmptyState
                title="Chọn đơn hàng"
                description="Chọn một đơn hàng bên trái để hệ thống hiển thị xếp hạng khuyến nghị điều xe minh bạch."
              />
            )}
          </div>
        }
      />
    </div>
  );
};
