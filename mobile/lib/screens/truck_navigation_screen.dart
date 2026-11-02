import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../core/theme/theme.dart';

class TruckNavigationScreen extends StatefulWidget {
  final VoidCallback onFinishToEpod;

  const TruckNavigationScreen({
    super.key,
    required this.onFinishToEpod,
  });

  @override
  State<TruckNavigationScreen> createState() => _TruckNavigationScreenState();
}

class _TruckNavigationScreenState extends State<TruckNavigationScreen> {
  int _currentLeg = 1; // 1: Đến kho lấy (Dung Quất), 2: Đến kho giao (Vinamilk)
  double _vehicleSpeed = 48.0;
  final double _speedLimit = 60.0;
  double _distanceRemainingKm = 14.2;
  int _minutesRemaining = 18;
  double _headingDegrees = 45.0;
  bool _isNearDestination = false;
  bool _isFastForwarding = false;
  Timer? _simTimer;

  // Tọa độ các điểm trên tuyến
  LatLng _vehiclePosition = const LatLng(15.3500, 108.7800); // Gần Dung Quất
  final LatLng _stage1Target = const LatLng(15.4050, 108.7950); // Kho Hòa Phát Dung Quất
  final LatLng _stage2Target = const LatLng(16.0350, 108.2200); // Kho Vinamilk Đà Nẵng

  final MapController _mapController = MapController();

  @override
  void initState() {
    super.initState();
    _startSimulation();
  }

  @override
  void dispose() {
    _simTimer?.cancel();
    super.dispose();
  }

  void _startSimulation() {
    _simTimer = Timer.periodic(const Duration(milliseconds: 800), (timer) {
      if (!mounted) return;
      if (_distanceRemainingKm > 0.4) {
        setState(() {
          final step = _isFastForwarding ? 1.8 : 0.2;
          _distanceRemainingKm = (_distanceRemainingKm - step).clamp(0.2, 50.0);
          _minutesRemaining = (_distanceRemainingKm * 1.5).ceil();

          // Di chuyển xe nhẹ nhàng tiến về điểm đích
          final target = _currentLeg == 1 ? _stage1Target : _stage2Target;
          _vehiclePosition = LatLng(
            _vehiclePosition.latitude + (target.latitude - _vehiclePosition.latitude) * 0.08,
            _vehiclePosition.longitude + (target.longitude - _vehiclePosition.longitude) * 0.08,
          );

          if (_distanceRemainingKm <= 0.8) {
            _isNearDestination = true;
          }
        });
      } else {
        setState(() {
          _isNearDestination = true;
          _distanceRemainingKm = 0.1;
          _minutesRemaining = 1;
        });
      }
    });
  }

  void _confirmArrival() {
    if (_currentLeg == 1) {
      // Chuyển sang Chặng 2 (Điểm giao Vinamilk)
      setState(() {
        _currentLeg = 2;
        _distanceRemainingKm = 22.6;
        _minutesRemaining = 32;
        _isNearDestination = false;
        _vehiclePosition = const LatLng(15.8500, 108.3500); // Bắt đầu vào địa phận Quảng Nam - Đà Nẵng
        _headingDegrees = 330.0;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Đã xác nhận đến Kho lấy hàng Hòa Phát! Tự động chuyển lộ trình sang Điểm giao 2: Kho Vinamilk Đà Nẵng.'),
          backgroundColor: VDBusColors.primary,
          duration: Duration(seconds: 3),
        ),
      );
    } else {
      // Đã đến điểm cuối cùng -> Chuyển sang màn hình ký nhận ePOD
      _simTimer?.cancel();
      Navigator.of(context).pop();
      widget.onFinishToEpod();
    }
  }

  void _toggleFastForward() {
    setState(() {
      _isFastForwarding = !_isFastForwarding;
      _vehicleSpeed = _isFastForwarding ? 68.0 : 48.0;
    });
  }

  void _showIncidentDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Báo cáo Sự cố Vận hành', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.warning, color: VDBusColors.error),
              title: const Text('Kẹt xe nghiêm trọng / Kẹt hầm'),
              onTap: () {
                Navigator.pop(ctx);
                _showReportSuccess('Đã gửi thông báo kẹt hầm tới Bàn điều độ TMS.');
              },
            ),
            ListTile(
              leading: const Icon(Icons.build, color: VDBusColors.warning),
              title: const Text('Nổ lốp / Hỏng xe đột xuất'),
              onTap: () {
                Navigator.pop(ctx);
                _showReportSuccess('Đã yêu cầu Đội cứu hộ lưu động VDBus.');
              },
            ),
            ListTile(
              leading: const Icon(Icons.ac_unit, color: Colors.blue),
              title: const Text('Sự cố mất nguồn máy lạnh thùng xe'),
              onTap: () {
                Navigator.pop(ctx);
                _showReportSuccess('Đã kích hoạt cảnh báo Chuỗi lạnh khẩn cấp.');
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showReportSuccess(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: VDBusColors.primary),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isSpeeding = _vehicleSpeed > _speedLimit;
    final currentTarget = _currentLeg == 1 ? _stage1Target : _stage2Target;
    final stopTitle = _currentLeg == 1 ? 'ĐIỂM 1: LẤY HÀNG' : 'ĐIỂM 2: GIAO HÀNG';
    final warehouseName = _currentLeg == 1 ? 'Kho Thép Hòa Phát Dung Quất' : 'Kho Vinamilk Hòa Cường Đà Nẵng';
    final warehouseAddress = _currentLeg == 1
        ? 'KKT Dung Quất, Bình Sơn, Quảng Ngãi'
        : 'Số 478 Điện Biên Phủ, Thanh Khê, Đà Nẵng';
    final contactName = _currentLeg == 1 ? 'Thủ kho Nguyễn Văn Hùng' : 'Thủ kho Trần Đình Long';
    final contactPhone = _currentLeg == 1 ? '0905.123.456' : '0905.333.444';

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // 1. Bản đồ dẫn đường Fullscreen xoay góc heading-up
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _vehiclePosition,
              initialZoom: 14.5,
              initialRotation: _headingDegrees,
              interactionOptions: const InteractionOptions(
                flags: InteractiveFlag.all,
              ),
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'vn.vdbus.driver',
              ),
              PolylineLayer(
                polylines: [
                  // Đoạn tuyến còn lại (màu hổ phách rực rỡ)
                  Polyline(
                    points: [
                      _vehiclePosition,
                      LatLng((_vehiclePosition.latitude + currentTarget.latitude) / 2, (_vehiclePosition.longitude + currentTarget.longitude) / 2),
                      currentTarget,
                    ],
                    color: VDBusColors.amberAction,
                    strokeWidth: 6.0,
                  ),
                ],
              ),
              MarkerLayer(
                markers: [
                  // Ghim đích
                  Marker(
                    point: currentTarget,
                    width: 70,
                    height: 70,
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: VDBusColors.primary,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            _currentLeg == 1 ? 'KHO LẤY' : 'KHO GIAO',
                            style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                          ),
                        ),
                        const Icon(Icons.location_on, color: VDBusColors.primary, size: 32),
                      ],
                    ),
                  ),

                  // Biểu tượng xe tải bám góc xoay
                  Marker(
                    point: _vehiclePosition,
                    width: 60,
                    height: 60,
                    child: Transform.rotate(
                      angle: _headingDegrees * (3.14159 / 180),
                      child: Container(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: VDBusColors.primary,
                          border: Border.all(color: Colors.white, width: 3),
                          boxShadow: const [
                            BoxShadow(color: Colors.black45, blurRadius: 8, offset: Offset(0, 3)),
                          ],
                        ),
                        child: const Icon(Icons.navigation, color: Colors.white, size: 30),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),

          // 2. Banner Turn-by-Turn phía trên (Chỉ dẫn ngã rẽ lớn)
          Positioned(
            top: MediaQuery.of(context).padding.top + 8,
            left: 12,
            right: 12,
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: VDBusColors.primary,
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: const [
                      BoxShadow(color: Colors.black38, blurRadius: 10, offset: Offset(0, 4)),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: const Icon(Icons.turn_right, color: Colors.white, size: 36),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _distanceRemainingKm > 1.0 ? 'Còn 450 m' : 'Còn 150 m',
                              style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                            ),
                            Text(
                              _currentLeg == 1
                                  ? 'Rẽ phải vào Cổng số 2 - Cụm Cảng Dung Quất'
                                  : 'Rẽ phải vào Đường Điện Biên Phủ (Hướng Cầu Sông Hàn)',
                              style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w500),
                            ),
                          ],
                        ),
                      ),
                      // Biển báo giới hạn tốc độ (Speed Limit Badge)
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white,
                          border: Border.all(
                            color: isSpeeding ? VDBusColors.error : Colors.red,
                            width: 3.5,
                          ),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          '${_speedLimit.toInt()}',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: isSpeeding ? VDBusColors.error : Colors.black87,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 6),

                // Cảnh báo ngữ cảnh xe tải thực tế
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: VDBusColors.warningBg,
                    border: Border.all(color: VDBusColors.warningBorder),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.info, size: 16, color: VDBusColors.warningText),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _currentLeg == 1
                              ? 'Trạm BOT Điện Bàn phía trước (Phí: 76.000 đ qua ePass)'
                              : 'Lưu ý: Giờ cấm tải nội đô Đà Nẵng từ 16:30 - 19:00 (Xe > 2.5T)',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: VDBusColors.warningText),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // 3. Nút hành động phụ (Thoát, Báo sự cố, Tua nhanh)
          Positioned(
            right: 12,
            top: MediaQuery.of(context).padding.top + 130,
            child: Column(
              children: [
                // Nút Thoát
                FloatingActionButton.small(
                  heroTag: 'nav_exit',
                  backgroundColor: VDBusColors.surface,
                  foregroundColor: VDBusColors.textPrimary,
                  onPressed: () => Navigator.of(context).pop(),
                  tooltip: 'Thoát dẫn đường',
                  child: const Icon(Icons.close),
                ),
                const SizedBox(height: 8),

                // Nút Báo sự cố
                FloatingActionButton.small(
                  heroTag: 'nav_incident',
                  backgroundColor: VDBusColors.surface,
                  foregroundColor: VDBusColors.error,
                  onPressed: _showIncidentDialog,
                  tooltip: 'Báo sự cố',
                  child: const Icon(Icons.warning_amber),
                ),
                const SizedBox(height: 8),

                // Nút Tua nhanh (Mô phỏng xe chạy nhanh)
                FloatingActionButton.small(
                  heroTag: 'nav_fast_forward',
                  backgroundColor: _isFastForwarding ? VDBusColors.amberAction : VDBusColors.surface,
                  foregroundColor: _isFastForwarding ? Colors.white : VDBusColors.textPrimary,
                  onPressed: _toggleFastForward,
                  tooltip: 'Tua nhanh lộ trình',
                  child: const Icon(Icons.fast_forward),
                ),
              ],
            ),
          ),

          // 4. Bottom Sheet thông tin điểm đến & Nút xác nhận Geofence
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              padding: EdgeInsets.fromLTRB(16, 16, 16, MediaQuery.of(context).padding.bottom + 12),
              decoration: const BoxDecoration(
                color: VDBusColors.surface,
                borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                boxShadow: [
                  BoxShadow(color: Colors.black26, blurRadius: 15, offset: Offset(0, -4)),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: _currentLeg == 1 ? VDBusColors.primarySubtle : VDBusColors.amberAction.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          stopTitle,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: _currentLeg == 1 ? VDBusColors.primary : VDBusColors.amberAction,
                          ),
                        ),
                      ),
                      Row(
                        children: [
                          Text(
                            '${_distanceRemainingKm.toStringAsFixed(1)} km',
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: VDBusColors.primary),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            '($_minutesRemaining phút)',
                            style: const TextStyle(fontSize: 13, color: VDBusColors.textSecondary, fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(warehouseName, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                  Text(warehouseAddress, style: const TextStyle(fontSize: 12, color: VDBusColors.textSecondary)),
                  const SizedBox(height: 12),

                  // Nút gọi nhanh thủ kho & Nút xác nhận đến kho
                  Row(
                    children: [
                      OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size(0, 48),
                          side: const BorderSide(color: VDBusColors.borderDefault),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                        ),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Đang gọi thủ kho: $contactName ($contactPhone)...')),
                          );
                        },
                        icon: const Icon(Icons.phone, size: 16, color: VDBusColors.primary),
                        label: const Text('GỌI THỦ KHO', style: TextStyle(color: VDBusColors.primary, fontWeight: FontWeight.bold, fontSize: 12)),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            minimumSize: const Size(0, 48),
                            backgroundColor: _isNearDestination ? VDBusColors.amberAction : VDBusColors.borderDefault,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                            elevation: _isNearDestination ? 2 : 0,
                          ),
                          onPressed: _isNearDestination ? _confirmArrival : null,
                          child: Text(
                            _isNearDestination
                                ? (_currentLeg == 1 ? 'XÁC NHẬN ĐẾN KHO 1' : 'XÁC NHẬN ĐẾN GIAO')
                                : 'ĐANG TIẾN VÀO GEOFENCE (${_distanceRemainingKm.toStringAsFixed(1)} km)',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                              color: _isNearDestination ? Colors.white : VDBusColors.textSecondary,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
