import 'package:flutter/material.dart';
import 'package:latlong2/latlong.dart';
import '../core/theme/theme.dart';
import '../models/trip_model.dart';
import '../services/api_service.dart';
import '../widgets/driver_osm_map.dart';
import 'cockpit_screen.dart';
import 'document_wallet_screen.dart';
import 'epod_screen.dart';
import 'fuel_entry_screen.dart';
import 'login_screen.dart';

class DriverMainScreen extends StatefulWidget {
  const DriverMainScreen({super.key});

  @override
  State<DriverMainScreen> createState() => _DriverMainScreenState();
}

class _DriverMainScreenState extends State<DriverMainScreen> {
  int _currentIndex = 0;
  final String _driverName = 'Nguyễn Văn Tuấn';
  String _vehiclePlate = '43C-189.24';
  final String _vehicleModel = 'Hino 500 FG8JJ7A (8.5 tấn)';

  late DriverTrip _trip;
  bool _preTripInspected = true;

  @override
  void initState() {
    super.initState();
    _setupDefaultTrip();
    _fetchActiveTrip();
  }

  void _setupDefaultTrip() {
    _trip = DriverTrip(
      id: 'd0000001-1111-1111-1111-111111111111',
      tripCode: 'CH-2026-0881',
      orderId: 'c1000001-0000-0000-0000-000000000001',
      orderCode: 'DH-20261024-8192',
      vehiclePlate: _vehiclePlate,
      vehicleModel: _vehicleModel,
      totalWeightKg: 8500,
      totalVolumeCbm: 32,
      currentStep: TripStep.scheduled,
      isSimulated: false,
      stops: [
        TripStop(
          order: 1,
          type: 'Pickup',
          address: 'Kho Tổng Vinamilk, KCN Hòa Khánh, Liên Chiểu, Đà Nẵng',
          contactName: 'Nguyễn Văn Hùng (Quản lý kho)',
          contactPhone: '0905123456',
          scheduledTime: DateTime.now().add(const Duration(minutes: 45)),
        ),
        TripStop(
          order: 2,
          type: 'Delivery',
          address: 'Tổng kho Co.opmart Đà Nẵng, 478 Điện Biên Phủ, Thanh Khê, Đà Nẵng',
          contactName: 'Trần Đình Long (Bộ phận giao nhận)',
          contactPhone: '0905333444',
          scheduledTime: DateTime.now().add(const Duration(hours: 3)),
        ),
      ],
    );
  }

  Future<void> _fetchActiveTrip() async {
    try {
      final apiData = await ApiService.getActiveTrip();
      if (apiData != null && mounted) {
        final tripCode = apiData['tripCode'] as String? ?? 'CH-2026-0881';
        final plate = apiData['vehiclePlate'] as String? ?? '43C-189.24';
        final status = apiData['status'] as int? ?? 1;

        TripStep step = TripStep.scheduled;
        if (status >= 6) {
          step = TripStep.completed;
        } else if (status >= 5) {
          step = TripStep.atDelivery;
        } else if (status >= 4) {
          step = TripStep.inTransit;
        } else if (status >= 3) {
          step = TripStep.loading;
        } else if (status >= 2) {
          step = TripStep.atPickup;
        }

        setState(() {
          _vehiclePlate = plate;
          _trip = _trip.copyWith(
            tripCode: tripCode,
            vehiclePlate: plate,
            currentStep: step,
          );
        });
      }
    } catch (_) {}
  }

  void _advanceTripStep() async {
    switch (_trip.currentStep) {
      case TripStep.scheduled:
        setState(() {
          _trip = _trip.copyWith(currentStep: TripStep.atPickup);
        });
        await ApiService.advanceTripStatus(_trip.id, 2, 'Tài xế đã đến kho Vinamilk lấy hàng');
        break;
      case TripStep.atPickup:
        setState(() {
          _trip = _trip.copyWith(currentStep: TripStep.loading);
        });
        await ApiService.advanceTripStatus(_trip.id, 3, 'Bắt đầu bốc xếp hàng và kiểm tra niêm phong chì');
        break;
      case TripStep.loading:
        setState(() {
          _trip = _trip.copyWith(currentStep: TripStep.inTransit);
        });
        await ApiService.advanceTripStatus(_trip.id, 4, 'Bốc xếp xong, xe bắt đầu khởi hành');
        break;
      case TripStep.inTransit:
        setState(() {
          _trip = _trip.copyWith(currentStep: TripStep.atDelivery);
        });
        await ApiService.advanceTripStatus(_trip.id, 5, 'Xe đã tới kho Co.opmart Đà Nẵng');
        break;
      case TripStep.atDelivery:
        // Switch to ePOD Tab
        setState(() {
          _currentIndex = 2;
        });
        break;
      case TripStep.completed:
        _setupDefaultTrip();
        setState(() {});
        break;
    }
  }

  void _showPreTripInspectionDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(VDBusSpace.lg),
        decoration: const BoxDecoration(
          color: VDBusColors.surface,
          borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.fact_check_outlined, color: VDBusColors.primary, size: 22),
                    SizedBox(width: 8),
                    Text(
                      'Kiểm tra an toàn trước chuyến (Pre-trip Inspection)',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: VDBusColors.textPrimary),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.of(ctx).pop(),
                ),
              ],
            ),
            const Divider(),
            const SizedBox(height: 8),
            _buildChecklistRow(Icons.tire_repair, 'Áp suất lốp xe (TPMS 6 bánh)', '110 - 118 PSI (Đạt chuẩn)'),
            _buildChecklistRow(Icons.local_gas_station, 'Dầu Diesel và mức dầu bôi trơn', 'Còn 82% bình (Đạt chuẩn)'),
            _buildChecklistRow(Icons.settings, 'Hệ thống phanh khí nén & ABS', 'Đồng hồ áp 8.5 bar (An toàn)'),
            _buildChecklistRow(Icons.ac_unit, 'Hệ thống máy lạnh thùng đông', '-18.4°C (Sẵn sàng)'),
            _buildChecklistRow(Icons.description_outlined, 'Giấy tờ xe & Phù hiệu xe tải', 'Đăng kiểm còn hạn đến 10/11/2026'),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () {
                setState(() {
                  _preTripInspected = true;
                });
                Navigator.of(ctx).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Xác nhận xe 43C-189.24 đủ điều kiện lưu hành an toàn.'),
                    backgroundColor: VDBusColors.successText,
                  ),
                );
              },
              icon: const Icon(Icons.check_circle_outline, size: 20),
              label: const Text('XÁC NHẬN XE ĐỦ ĐIỀU KIỆN XUẤT BẾN'),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Widget _buildChecklistRow(IconData icon, String title, String subtitle) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        children: [
          Icon(icon, color: VDBusColors.primary, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: VDBusColors.textPrimary)),
                Text(subtitle, style: const TextStyle(fontSize: 12, color: VDBusColors.textSecondary)),
              ],
            ),
          ),
          const Icon(Icons.check_circle, color: VDBusColors.successText, size: 20),
        ],
      ),
    );
  }

  String _getStepTitle(TripStep step) {
    switch (step) {
      case TripStep.scheduled:
        return 'Chờ bắt đầu';
      case TripStep.atPickup:
        return 'Đã đến điểm lấy hàng';
      case TripStep.loading:
        return 'Đang bốc xếp hàng';
      case TripStep.inTransit:
        return 'Đang vận chuyển';
      case TripStep.atDelivery:
        return 'Đã đến điểm giao hàng';
      case TripStep.completed:
        return 'Chuyến xe hoàn tất';
    }
  }

  String _getActionButtonLabel(TripStep step) {
    switch (step) {
      case TripStep.scheduled:
        return 'BẮT ĐẦU ĐI ĐẾN ĐIỂM LẤY HÀNG';
      case TripStep.atPickup:
        return 'XÁC NHẬN BẮT ĐẦU XẾP HÀNG';
      case TripStep.loading:
        return 'XẾP HÀNG XONG - KHỞI HÀNH';
      case TripStep.inTransit:
        return 'ĐÃ TỚI ĐIỂM GIAO HÀNG';
      case TripStep.atDelivery:
        return 'TIẾN HÀNH GIAO HÀNG & KÝ ePOD';
      case TripStep.completed:
        return 'KHỞI TẠO CHUYẾN XE MỚI';
    }
  }

  Color _getStatusBg(TripStep step) {
    switch (step) {
      case TripStep.completed:
        return VDBusColors.successBg;
      case TripStep.inTransit:
      case TripStep.atDelivery:
        return VDBusColors.infoBg;
      default:
        return VDBusColors.warningBg;
    }
  }

  Color _getStatusText(TripStep step) {
    switch (step) {
      case TripStep.completed:
        return VDBusColors.successText;
      case TripStep.inTransit:
      case TripStep.atDelivery:
        return VDBusColors.infoText;
      default:
        return VDBusColors.warningText;
    }
  }

  void _handleLogout() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.logout, color: VDBusColors.errorText, size: 20),
            SizedBox(width: 8),
            Text('Xác nhận đăng xuất'),
          ],
        ),
        content: const Text('Bạn có chắc chắn muốn đăng xuất ca làm việc hiện tại không?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('HỦY'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: ElevatedButton.styleFrom(
              backgroundColor: VDBusColors.errorText,
              foregroundColor: Colors.white,
            ),
            child: const Text('ĐĂNG XUẤT'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      await ApiService.clearSession();
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Icon(Icons.local_shipping, color: VDBusColors.primary, size: 24),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'VDBus Tài xế',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: VDBusColors.textPrimary),
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    '$_driverName - Xe: $_vehiclePlate',
                    style: const TextStyle(fontSize: 11, color: VDBusColors.textSecondary),
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
            decoration: BoxDecoration(
              color: VDBusColors.successBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: VDBusColors.successText),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                CircleAvatar(radius: 4, backgroundColor: VDBusColors.successText),
                SizedBox(width: 6),
                Text(
                  'Trực tuyến',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: VDBusColors.successText),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.logout, size: 20),
            tooltip: 'Đăng xuất ca làm việc',
            onPressed: _handleLogout,
          ),
        ],
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: [
          _buildTripTab(),
          _buildCockpitAndMapTab(),
          _buildEpodTab(),
          _buildWalletAndExpensesTab(),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        type: BottomNavigationBarType.fixed,
        selectedItemColor: VDBusColors.primary,
        unselectedItemColor: VDBusColors.textMuted,
        selectedFontSize: 12,
        unselectedFontSize: 11,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.local_shipping_outlined),
            activeIcon: Icon(Icons.local_shipping),
            label: 'Chuyến xe',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.speed_outlined),
            activeIcon: Icon(Icons.speed),
            label: 'Buồng lái',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.draw_outlined),
            activeIcon: Icon(Icons.draw),
            label: 'Ký ePOD',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.account_balance_wallet_outlined),
            activeIcon: Icon(Icons.account_balance_wallet),
            label: 'Ví xe & Sổ',
          ),
        ],
      ),
    );
  }

  // TAB 1: Chuyến xe & Tiến trình
  Widget _buildTripTab() {
    final statusBg = _getStatusBg(_trip.currentStep);
    final statusText = _getStatusText(_trip.currentStep);

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(VDBusSpace.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Trip Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: VDBusColors.surface,
                border: Border.all(color: VDBusColors.borderSubtle),
                borderRadius: BorderRadius.circular(VDBusRadius.md),
                boxShadow: const [
                  BoxShadow(color: Colors.black12, blurRadius: 4, offset: Offset(0, 2)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Row(
                          children: [
                            const Icon(Icons.confirmation_number_outlined, size: 18, color: VDBusColors.primary),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                'Chuyến xe: ${_trip.tripCode}',
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: VDBusColors.textPrimary,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: statusBg,
                          border: Border.all(color: statusText),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          _getStepTitle(_trip.currentStep),
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: statusText,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      const Icon(Icons.inventory_2_outlined, size: 16, color: VDBusColors.primary),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          'Đơn hàng: ${_trip.orderCode} (Sữa tươi tiệt trùng Vinamilk)',
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: VDBusColors.textPrimary),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.scale_outlined, size: 16, color: VDBusColors.textMuted),
                      const SizedBox(width: 6),
                      Text(
                        'Trọng tải: ${(_trip.totalWeightKg / 1000).toStringAsFixed(1)} tấn - ${_trip.totalVolumeCbm} CBM',
                        style: const TextStyle(fontSize: 13, color: VDBusColors.textSecondary),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // Pre-trip inspection banner
            InkWell(
              onTap: _showPreTripInspectionDialog,
              borderRadius: BorderRadius.circular(VDBusRadius.sm),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: BoxDecoration(
                  color: _preTripInspected ? VDBusColors.successBg : VDBusColors.warningBg,
                  borderRadius: BorderRadius.circular(VDBusRadius.sm),
                  border: Border.all(color: _preTripInspected ? VDBusColors.successText : VDBusColors.warningText),
                ),
                child: Row(
                  children: [
                    Icon(
                      _preTripInspected ? Icons.verified : Icons.warning_amber_rounded,
                      color: _preTripInspected ? VDBusColors.successText : VDBusColors.warningText,
                      size: 22,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        _preTripInspected
                            ? 'Kiểm tra xe trước chuyến: ĐÃ ĐẠT YÊU CẦU'
                            : 'Yêu cầu kiểm tra kỹ thuật xe trước khi xuất bến',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: _preTripInspected ? VDBusColors.successText : VDBusColors.warningText,
                        ),
                      ),
                    ),
                    const Icon(Icons.arrow_forward_ios, size: 14, color: VDBusColors.textMuted),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Stops Timeline Header
            const Row(
              children: [
                Icon(Icons.route_outlined, size: 18, color: VDBusColors.primary),
                SizedBox(width: 6),
                Text(
                  'Lộ trình & Điểm dừng',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: VDBusColors.textPrimary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Stops List
            Expanded(
              child: ListView.separated(
                itemCount: _trip.stops.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (context, index) {
                  final stop = _trip.stops[index];
                  final isPickup = stop.type == 'Pickup';
                  return Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: VDBusColors.surface,
                      border: Border.all(color: VDBusColors.borderSubtle),
                      borderRadius: BorderRadius.circular(VDBusRadius.sm),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: isPickup ? VDBusColors.infoBg : VDBusColors.successBg,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            isPickup ? 'LẤY HÀNG' : 'GIAO HÀNG',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: isPickup ? VDBusColors.infoText : VDBusColors.successText,
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                stop.address,
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: VDBusColors.textPrimary,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  const Icon(Icons.person_outline, size: 14, color: VDBusColors.textSecondary),
                                  const SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      stop.contactName,
                                      style: const TextStyle(fontSize: 12, color: VDBusColors.textSecondary),
                                    ),
                                  ),
                                  const Icon(Icons.phone_outlined, size: 14, color: VDBusColors.primary),
                                  const SizedBox(width: 4),
                                  Text(
                                    stop.contactPhone,
                                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: VDBusColors.primary),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 12),

            // High-Contrast Primary Touch Action (Height >= 48dp)
            ElevatedButton.icon(
              onPressed: _advanceTripStep,
              icon: const Icon(Icons.arrow_circle_right_outlined, size: 22),
              label: Text(_getActionButtonLabel(_trip.currentStep)),
              style: ElevatedButton.styleFrom(
                minimumSize: const Size.fromHeight(52),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // TAB 2: Buồng lái & Bản đồ thời gian thực
  Widget _buildCockpitAndMapTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(VDBusSpace.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Live Map Card
          DriverOsmMap(
            currentPosition: const LatLng(16.0712, 108.1754),
            pickupPosition: const LatLng(16.0825, 108.1482),
            deliveryPosition: const LatLng(16.0682, 108.2124),
            licensePlate: _vehiclePlate,
            headingDegrees: 120,
            height: 260,
          ),

          const SizedBox(height: 16),

          // Speed & HOS HUD
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: VDBusColors.surface,
                    border: Border.all(color: VDBusColors.borderSubtle),
                    borderRadius: BorderRadius.circular(VDBusRadius.sm),
                  ),
                  child: const Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.speed, size: 14, color: VDBusColors.primary),
                          SizedBox(width: 4),
                          Text('TỐC ĐỘ GPS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: VDBusColors.textSecondary)),
                        ],
                      ),
                      SizedBox(height: 4),
                      Text('54', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: VDBusColors.primary)),
                      Text('km/h (Hợp quy)', style: TextStyle(fontSize: 11, color: VDBusColors.successText)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: VDBusColors.surface,
                    border: Border.all(color: VDBusColors.borderSubtle),
                    borderRadius: BorderRadius.circular(VDBusRadius.sm),
                  ),
                  child: const Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.timer_outlined, size: 14, color: VDBusColors.warningText),
                          SizedBox(width: 4),
                          Text('GIỜ LÁI (NĐ 10/2020)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: VDBusColors.textSecondary)),
                        ],
                      ),
                      SizedBox(height: 4),
                      Text('55', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: VDBusColors.warningText)),
                      Text('phút còn lại / 4h', style: TextStyle(fontSize: 11, color: VDBusColors.warningText)),
                    ],
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Cold chain & TPMS
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: VDBusColors.surface,
              border: Border.all(color: VDBusColors.borderSubtle),
              borderRadius: BorderRadius.circular(VDBusRadius.sm),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                Column(
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.ac_unit, size: 16, color: VDBusColors.infoText),
                        SizedBox(width: 4),
                        Text('NHIỆT ĐỘ THÙNG', style: TextStyle(fontSize: 11, color: VDBusColors.textSecondary)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    const Text('-18.4°C', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: VDBusColors.infoText)),
                    const Text('Định mức -20°C đến -16°C', style: TextStyle(fontSize: 10, color: VDBusColors.textMuted)),
                  ],
                ),
                Container(height: 40, width: 1, color: VDBusColors.borderSubtle),
                Column(
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.tire_repair, size: 16, color: VDBusColors.successText),
                        SizedBox(width: 4),
                        Text('ÁP SUẤT LỐP (TPMS)', style: TextStyle(fontSize: 11, color: VDBusColors.textSecondary)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    const Text('6 / 6 LỐP ĐẠT', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: VDBusColors.successText)),
                    const Text('112 - 116 PSI', style: TextStyle(fontSize: 10, color: VDBusColors.textMuted)),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Open Full Cockpit Button
          OutlinedButton.icon(
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => CockpitScreen(
                    vehiclePlate: _vehiclePlate,
                    driverName: _driverName,
                  ),
                ),
              );
            },
            icon: const Icon(Icons.open_in_new, size: 18),
            label: const Text('MỞ TOÀN MÀN HÌNH BUỒNG LÁI & HOS'),
          ),
        ],
      ),
    );
  }

  // TAB 3: ePOD Ký nhận điện tử
  Widget _buildEpodTab() {
    return EpodScreen(trip: _trip);
  }

  // TAB 4: Ví xe & Sổ sách chi phí
  Widget _buildWalletAndExpensesTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(VDBusSpace.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Vehicle Info Banner
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: VDBusColors.primarySubtle,
              border: Border.all(color: VDBusColors.primary),
              borderRadius: BorderRadius.circular(VDBusRadius.sm),
            ),
            child: Row(
              children: [
                const Icon(Icons.folder_shared_outlined, color: VDBusColors.primary, size: 36),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Hồ sơ Phương tiện: $_vehiclePlate',
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: VDBusColors.primary),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        _vehicleModel,
                        style: const TextStyle(fontSize: 12, color: VDBusColors.textSecondary),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Document Wallet Navigation
          ListTile(
            tileColor: VDBusColors.surface,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(VDBusRadius.sm),
              side: const BorderSide(color: VDBusColors.borderSubtle),
            ),
            leading: const Icon(Icons.badge_outlined, color: VDBusColors.primary, size: 24),
            title: const Text('Ví giấy tờ pháp lý xe & tài xế', style: TextStyle(fontWeight: FontWeight.w600)),
            subtitle: const Text('GPLX, Đăng kiểm, Phù hiệu, Bảo hiểm PTI', style: TextStyle(fontSize: 12)),
            trailing: const Icon(Icons.arrow_forward_ios, size: 14),
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => DocumentWalletScreen(
                    driverName: _driverName,
                    vehiclePlate: _vehiclePlate,
                  ),
                ),
              );
            },
          ),

          const SizedBox(height: 12),

          // Fuel Logging Navigation
          ListTile(
            tileColor: VDBusColors.surface,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(VDBusRadius.sm),
              side: const BorderSide(color: VDBusColors.borderSubtle),
            ),
            leading: const Icon(Icons.local_gas_station_outlined, color: VDBusColors.warningText, size: 24),
            title: const Text('Nhật ký đổ dầu & Hóa đơn VAT', style: TextStyle(fontWeight: FontWeight.w600)),
            subtitle: const Text('Ghi nhận số lít, đơn giá, hóa đơn xăng dầu dọc đường', style: TextStyle(fontSize: 12)),
            trailing: const Icon(Icons.arrow_forward_ios, size: 14),
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => FuelEntryScreen(
                    vehiclePlate: _vehiclePlate,
                    driverName: _driverName,
                  ),
                ),
              );
            },
          ),

          const SizedBox(height: 12),

          // Toll fee summary
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: VDBusColors.surface,
              border: Border.all(color: VDBusColors.borderSubtle),
              borderRadius: BorderRadius.circular(VDBusRadius.sm),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.toll_outlined, size: 18, color: VDBusColors.infoText),
                    SizedBox(width: 6),
                    Text('Lịch sử phí đường bộ VETC / ePass', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                  ],
                ),
                SizedBox(height: 8),
                Text('Trạm BOT Điện Bàn: 76.000 VNĐ (10:15 - 01/11/2026)', style: TextStyle(fontSize: 12, color: VDBusColors.textSecondary)),
                SizedBox(height: 4),
                Text('Trạm BOT Nam Hải Vân: 110.000 VNĐ (07:30 - 01/11/2026)', style: TextStyle(fontSize: 12, color: VDBusColors.textSecondary)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
