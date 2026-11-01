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
  final String _driverName = 'Nguyen Van Tuan';
  String _vehiclePlate = '43C-189.24';
  final String _vehicleModel = 'Hino 500 FG8JJ7A (8.5 tan)';

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
          address: 'Kho Tong Vinamilk, KCN Hoa Khanh, Lien Chieu, Da Nang',
          contactName: 'Nguyen Van Hung (Quan ly Kho)',
          contactPhone: '0905123456',
          scheduledTime: DateTime.now().add(const Duration(minutes: 45)),
        ),
        TripStop(
          order: 2,
          type: 'Delivery',
          address: 'Tong kho Co.opmart Da Nang, 478 Dien Bien Phu, Thanh Khe, Da Nang',
          contactName: 'Tran Dinh Long (Bo phan Giao nhan)',
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
        await ApiService.advanceTripStatus(_trip.id, 2, 'Tai xe da den kho Vinamilk lay hang');
        break;
      case TripStep.atPickup:
        setState(() {
          _trip = _trip.copyWith(currentStep: TripStep.loading);
        });
        await ApiService.advanceTripStatus(_trip.id, 3, 'Bat dau boc xep hang va kiem tra niêm phong');
        break;
      case TripStep.loading:
        setState(() {
          _trip = _trip.copyWith(currentStep: TripStep.inTransit);
        });
        await ApiService.advanceTripStatus(_trip.id, 4, 'Boc xep xong, xe bat dau khoi hanh');
        break;
      case TripStep.inTransit:
        setState(() {
          _trip = _trip.copyWith(currentStep: TripStep.atDelivery);
        });
        await ApiService.advanceTripStatus(_trip.id, 5, 'Xe da toi kho Co.opmart Da Nang');
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
                const Text(
                  'Kiem tra xe truoc chuyen (Pre-trip Inspection)',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: VDBusColors.textPrimary),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.of(ctx).pop(),
                ),
              ],
            ),
            const Divider(),
            const SizedBox(height: 8),
            _buildChecklistRow('Ap suat lop xe (TPMS 6 banh)', '110 - 118 PSI (Dat chuan)'),
            _buildChecklistRow('Dau Diesel va muc dau boi tron', 'Con 82% binh (Dat chuan)'),
            _buildChecklistRow('He thong phanh khi nen & ABS', 'Dong ho ap 8.5 bar (An toan)'),
            _buildChecklistRow('He thong may lanh thung hang', '-18.4 do C (San sang)'),
            _buildChecklistRow('Giay to xe & Phu hieu xe tai', 'Dang kiem con han den 2026-11-10'),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                setState(() {
                  _preTripInspected = true;
                });
                Navigator.of(ctx).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Xac nhan xe 43C-189.24 du dieu kien luu hanh an toan.'),
                    backgroundColor: VDBusColors.successText,
                  ),
                );
              },
              child: const Text('XAC NHAN XE DU DIEU KIEN XUAT BEN'),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Widget _buildChecklistRow(String title, String subtitle) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        children: [
          const Icon(Icons.check_circle, color: VDBusColors.successText, size: 20),
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
        ],
      ),
    );
  }

  String _getStepTitle(TripStep step) {
    switch (step) {
      case TripStep.scheduled:
        return 'Cho bat dau';
      case TripStep.atPickup:
        return 'Da den diem lay hang';
      case TripStep.loading:
        return 'Dang boc xep hang';
      case TripStep.inTransit:
        return 'Dang van chuyen';
      case TripStep.atDelivery:
        return 'Da den diem giao hang';
      case TripStep.completed:
        return 'Chuyen xe hoan tat';
    }
  }

  String _getActionButtonLabel(TripStep step) {
    switch (step) {
      case TripStep.scheduled:
        return 'BAT DAU DI DEN DIEM LAY HANG';
      case TripStep.atPickup:
        return 'XAC NHAN BAT DAU XEP HANG';
      case TripStep.loading:
        return 'XEP HANG XONG - KHOI HANH';
      case TripStep.inTransit:
        return 'DA TOI DIEM GIAO HANG';
      case TripStep.atDelivery:
        return 'TIEN HANH GIAO HANG & KY ePOD';
      case TripStep.completed:
        return 'KHOI TAO CHUYEN XE MOI';
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
        title: const Text('Xac nhan dang xuat'),
        content: const Text('Ban co chac chan muon dang xuat ca lam viec hien tai khong?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('HUY'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: ElevatedButton.styleFrom(
              backgroundColor: VDBusColors.errorText,
              foregroundColor: Colors.white,
            ),
            child: const Text('DANG XUAT'),
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
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'VDBus Tai xe',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: VDBusColors.textPrimary),
                ),
                Text(
                  '$_driverName - Xe: $_vehiclePlate',
                  style: const TextStyle(fontSize: 12, color: VDBusColors.textSecondary),
                ),
              ],
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: VDBusColors.successBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: VDBusColors.successText),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                CircleAvatar(radius: 3, backgroundColor: VDBusColors.successText),
                SizedBox(width: 4),
                Text(
                  'Truc tuyen',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: VDBusColors.successText),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.logout, size: 20),
            tooltip: 'Dang xuat',
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
            icon: Icon(Icons.assignment_outlined),
            activeIcon: Icon(Icons.assignment),
            label: 'Chuyen xe',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.map_outlined),
            activeIcon: Icon(Icons.map),
            label: 'Buong lai',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.draw_outlined),
            activeIcon: Icon(Icons.draw),
            label: 'Ky ePOD',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.account_balance_wallet_outlined),
            activeIcon: Icon(Icons.account_balance_wallet),
            label: 'Vi xe & So',
          ),
        ],
      ),
    );
  }

  // TAB 1: Chuyen xe & Tien trinh
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
                      Text(
                        'Chuyen xe: ${_trip.tripCode}',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: VDBusColors.textPrimary,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
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
                      Text(
                        'Don hang: ${_trip.orderCode} (Sua tuoi Vinamilk)',
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: VDBusColors.textPrimary),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Trong tai: ${(_trip.totalWeightKg / 1000).toStringAsFixed(1)} tan - ${_trip.totalVolumeCbm} CBM',
                    style: const TextStyle(fontSize: 13, color: VDBusColors.textSecondary),
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
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: _preTripInspected ? VDBusColors.successBg : VDBusColors.warningBg,
                  borderRadius: BorderRadius.circular(VDBusRadius.sm),
                  border: Border.all(color: _preTripInspected ? VDBusColors.successText : VDBusColors.warningText),
                ),
                child: Row(
                  children: [
                    Icon(
                      _preTripInspected ? Icons.verified : Icons.error_outline,
                      color: _preTripInspected ? VDBusColors.successText : VDBusColors.warningText,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _preTripInspected
                            ? 'Kiem tra xe truoc chuyen: DA DAT YEU CAU'
                            : 'Yeu cau kiem tra ky thuat xe truoc khi xuat ben',
                        style: TextStyle(
                          fontSize: 12,
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
            const Text(
              'Lo trinh & Diem dung',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: VDBusColors.textPrimary,
              ),
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
                            isPickup ? 'LAY HANG' : 'GIAO HANG',
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
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  const Icon(Icons.phone, size: 14, color: VDBusColors.textSecondary),
                                  const SizedBox(width: 4),
                                  Text(
                                    '${stop.contactName} - ${stop.contactPhone}',
                                    style: const TextStyle(fontSize: 12, color: VDBusColors.textSecondary),
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
            ElevatedButton(
              onPressed: _advanceTripStep,
              child: Text(_getActionButtonLabel(_trip.currentStep)),
            ),
          ],
        ),
      ),
    );
  }

  // TAB 2: Buong lai & Ban do thoi gian thuc
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
                      Text('TOC DO GPS', style: TextStyle(fontSize: 11, color: VDBusColors.textSecondary)),
                      SizedBox(height: 4),
                      Text('54', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: VDBusColors.primary)),
                      Text('km/h (Hop quyen)', style: TextStyle(fontSize: 11, color: VDBusColors.successText)),
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
                      Text('GIO LAI (ND 10/2020)', style: TextStyle(fontSize: 11, color: VDBusColors.textSecondary)),
                      SizedBox(height: 4),
                      Text('55', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: VDBusColors.warningText)),
                      Text('phut con lai / 4h', style: TextStyle(fontSize: 11, color: VDBusColors.warningText)),
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
                        Text('NHIET DO THUNG', style: TextStyle(fontSize: 11, color: VDBusColors.textSecondary)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    const Text('-18.4 C', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: VDBusColors.infoText)),
                    const Text('Dinh muc -20 C den -16 C', style: TextStyle(fontSize: 10, color: VDBusColors.textMuted)),
                  ],
                ),
                Container(height: 40, width: 1, color: VDBusColors.borderSubtle),
                Column(
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.tire_repair, size: 16, color: VDBusColors.successText),
                        SizedBox(width: 4),
                        Text('AP SUAT LOP (TPMS)', style: TextStyle(fontSize: 11, color: VDBusColors.textSecondary)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    const Text('6 / 6 LOP DAT', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: VDBusColors.successText)),
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
            icon: const Icon(Icons.speed, size: 18),
            label: const Text('MO TOAN MAN HINH BUONG LAI & HOS'),
          ),
        ],
      ),
    );
  }

  // TAB 3: ePOD Ky nhan dien tu
  Widget _buildEpodTab() {
    return EpodScreen(trip: _trip);
  }

  // TAB 4: Vi xe & So sach chi phi
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
                const Icon(Icons.folder_shared, color: VDBusColors.primary, size: 36),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Ho so Phuong tien: $_vehiclePlate',
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
            leading: const Icon(Icons.badge, color: VDBusColors.primary),
            title: const Text('Vi giay to phap ly xe & tai xe', style: TextStyle(fontWeight: FontWeight.w600)),
            subtitle: const Text('GPLX, Dang kiem, Phu hieu, Bao hiem PTI', style: TextStyle(fontSize: 12)),
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
            leading: const Icon(Icons.local_gas_station, color: VDBusColors.warningText),
            title: const Text('Nhat ky do dau & Hoa don VAT', style: TextStyle(fontWeight: FontWeight.w600)),
            subtitle: const Text('Ghi nhan so lit, don gia, hoa don xang dau doc duong', style: TextStyle(fontSize: 12)),
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
                    Icon(Icons.toll, size: 18, color: VDBusColors.infoText),
                    SizedBox(width: 6),
                    Text('Lich su phi duong bo VETC / ePass', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                  ],
                ),
                SizedBox(height: 8),
                Text('Tram BOT Dien Ban: 76,000 VND (10:15 - 2026-11-01)', style: TextStyle(fontSize: 12, color: VDBusColors.textSecondary)),
                SizedBox(height: 4),
                Text('Tram BOT Nam Hai Van: 110,000 VND (07:30 - 2026-11-01)', style: TextStyle(fontSize: 12, color: VDBusColors.textSecondary)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
