import 'dart:async';
import 'package:flutter/material.dart';
import '../core/theme/theme.dart';
import '../core/sync/sync_queue.dart';
import 'document_wallet_screen.dart';
import 'fuel_entry_screen.dart';

class GpsFilter {
  static const double minMovingSpeedKmh = 3.0;

  static double filterSpeed(double rawSpeedKmh) {
    if (rawSpeedKmh < minMovingSpeedKmh) {
      return 0.0;
    }
    return rawSpeedKmh;
  }

  static bool isStationary(double speedKmh) {
    return filterSpeed(speedKmh) == 0.0;
  }
}

class CockpitScreen extends StatefulWidget {
  final String vehiclePlate;
  final String driverName;

  const CockpitScreen({
    super.key,
    this.vehiclePlate = '43C-189.24',
    this.driverName = 'Nguyễn Văn Tuấn',
  });

  @override
  State<CockpitScreen> createState() => _CockpitScreenState();
}

class _CockpitScreenState extends State<CockpitScreen> {
  double _rawSpeedKmh = 64.5;
  int _continuousDrivingMinutes = 185;
  final int _maxContinuousMinutes = 240;
  final double _coldChainTemp = -18.4;
  final double _coldChainTargetMin = -20.0;
  final double _coldChainTargetMax = -16.0;
  final bool _isReeferRunning = true;
  bool _isResting = false;
  int _restMinutesElapsed = 0;
  Timer? _ticker;

  @override
  void initState() {
    super.initState();
    _ticker = Timer.periodic(const Duration(seconds: 4), (timer) {
      if (!mounted) return;
      setState(() {
        if (_isResting) {
          _restMinutesElapsed += 1;
          if (_restMinutesElapsed >= 15) {
            _continuousDrivingMinutes = 0;
            _isResting = false;
            _rawSpeedKmh = 45.0;
          }
        } else {
          // Jitter raw speed slightly
          if (_rawSpeedKmh > 0) {
            _rawSpeedKmh = (_rawSpeedKmh + (DateTime.now().second % 3 - 1)).clamp(0.0, 85.0);
          }
        }
      });
    });
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

  void _toggleRest() {
    setState(() {
      if (!_isResting) {
        _isResting = true;
        _rawSpeedKmh = 1.8; // Low jitter noise filtered to 0.0 by GpsFilter
        _restMinutesElapsed = 0;
      } else {
        _isResting = false;
        _rawSpeedKmh = 50.0;
      }
    });
  }

  void _simulateStationary() {
    setState(() {
      // Set to 2.4 km/h (below 3.0 km/h threshold) to test GPS noise filter
      _rawSpeedKmh = 2.4;
    });
  }

  void _handleSosEmergency() {
    final syncQueue = SyncQueueService();
    syncQueue.enqueue(
      actionType: 'SOS_EMERGENCY_BROADCAST',
      payload: {
        'vehiclePlate': widget.vehiclePlate,
        'driverName': widget.driverName,
        'lat': 16.0544,
        'lng': 108.2022,
        'timestampUtc': DateTime.now().toUtc().toIso8601String(),
        'alertType': 'COLLISION_OR_BREAKDOWN',
      },
    );

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: VDBusColors.errorText, size: 24),
            SizedBox(width: 8),
            Text('TÍN HIỆU SOS ĐÃ PHÁT', style: TextStyle(fontWeight: FontWeight.bold, color: VDBusColors.errorText)),
          ],
        ),
        content: const Text(
          'Tọa độ 16.0544, 108.2022 và thông tin khẩn cấp đã được ghi nhận và phát tới Trung tâm điều hành VDBus TMS và các đội cứu hộ gần nhất.',
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: VDBusColors.errorText,
              foregroundColor: Colors.white,
            ),
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('ĐÃ HIỂU'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filteredSpeed = GpsFilter.filterSpeed(_rawSpeedKmh);
    final isStationary = GpsFilter.isStationary(_rawSpeedKmh);
    final remainingMinutes = (_maxContinuousMinutes - _continuousDrivingMinutes).clamp(0, _maxContinuousMinutes);
    final isTempWarning = _coldChainTemp > _coldChainTargetMax || _coldChainTemp < _coldChainTargetMin;

    Color hosColor;
    String hosAlertText;
    if (_continuousDrivingMinutes >= _maxContinuousMinutes) {
      hosColor = VDBusColors.errorText;
      hosAlertText = 'VI PHẠM GIỜ LÁI XE: Vui lòng tấp vào lề và nghỉ tối thiểu 15 phút!';
    } else if (remainingMinutes <= 15) {
      hosColor = VDBusColors.errorText;
      hosAlertText = 'KHẨN CẤP: Còn dưới 15 phút giờ lái liên tục!';
    } else if (remainingMinutes <= 30) {
      hosColor = VDBusColors.warningText;
      hosAlertText = 'CẢNH BÁO: Còn $remainingMinutes phút trước khi hết giờ lái.';
    } else {
      hosColor = VDBusColors.successText;
      hosAlertText = 'An toàn: Còn $remainingMinutes phút giờ lái liên tục.';
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Buồng lái số (Cockpit)'),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: VDBusColors.mockBg,
              border: Border.all(color: VDBusColors.mockText),
              borderRadius: BorderRadius.circular(4),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.satellite_alt_outlined, size: 14, color: VDBusColors.mockText),
                SizedBox(width: 4),
                Text(
                  'Mô phỏng GPS & IoT',
                  style: TextStyle(
                    fontSize: 12,
                    color: VDBusColors.mockText,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header Card: Driver & Vehicle Info
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: VDBusColors.surface,
                  border: Border.all(color: VDBusColors.borderSubtle),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.local_shipping, size: 18, color: VDBusColors.primary),
                            const SizedBox(width: 6),
                            Text(
                              widget.vehiclePlate,
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: VDBusColors.textPrimary,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Tài xế: ${widget.driverName}',
                          style: const TextStyle(
                            fontSize: 13,
                            color: VDBusColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: isStationary ? VDBusColors.subtle : VDBusColors.successBg,
                        border: Border.all(color: isStationary ? VDBusColors.borderDefault : VDBusColors.successText),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            isStationary ? Icons.pause_circle_outline : Icons.play_circle_outline,
                            size: 14,
                            color: isStationary ? VDBusColors.textMuted : VDBusColors.successText,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            isStationary ? 'DỪNG XE' : 'ĐANG CHẠY',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: isStationary ? VDBusColors.textMuted : VDBusColors.successText,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Digital Speedometer Display with GPS Noise Filter
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: VDBusColors.surface,
                  border: Border.all(color: VDBusColors.borderSubtle),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Column(
                  children: [
                    const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.speed, size: 16, color: VDBusColors.primary),
                        SizedBox(width: 6),
                        Text(
                          'VẬN TỐC GPS HIỆN TẠI',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: VDBusColors.textMuted,
                            letterSpacing: 1.0,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.baseline,
                      textBaseline: TextBaseline.alphabetic,
                      children: [
                        Text(
                          filteredSpeed.toStringAsFixed(1),
                          style: const TextStyle(
                            fontSize: 52,
                            fontWeight: FontWeight.bold,
                            color: VDBusColors.primary,
                          ),
                        ),
                        const SizedBox(width: 6),
                        const Text(
                          'km/h',
                          style: TextStyle(
                            fontSize: 18,
                            color: VDBusColors.textSecondary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      isStationary
                          ? 'Lọc nhiễu GPS: Đã kích hoạt (Vận tốc gốc ${_rawSpeedKmh.toStringAsFixed(1)} < 3.0 km/h)'
                          : 'Tín hiệu GPS ổn định',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: isStationary ? VDBusColors.warningText : VDBusColors.textMuted,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // HOS (Hours of Service) Safety Module
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: VDBusColors.surface,
                  border: Border.all(color: VDBusColors.borderSubtle),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.timer_outlined, size: 18, color: VDBusColors.primary),
                            SizedBox(width: 6),
                            Text(
                              'GIỜ LÁI AN TOÀN (HOS NĐ 10/2020)',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: VDBusColors.textPrimary,
                              ),
                            ),
                          ],
                        ),
                        Text(
                          '${_continuousDrivingMinutes}p / ${_maxContinuousMinutes}p',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: hosColor,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    // Progress bar
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: (_continuousDrivingMinutes / _maxContinuousMinutes).clamp(0.0, 1.0),
                        minHeight: 12,
                        backgroundColor: VDBusColors.subtle,
                        valueColor: AlwaysStoppedAnimation<Color>(hosColor),
                      ),
                    ),
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: _continuousDrivingMinutes >= _maxContinuousMinutes
                            ? VDBusColors.errorBg
                            : remainingMinutes <= 30
                                ? VDBusColors.warningBg
                                : VDBusColors.infoBg,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        hosAlertText,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: hosColor,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _isResting ? VDBusColors.successText : VDBusColors.primary,
                        foregroundColor: VDBusColors.textInverse,
                        minimumSize: const Size.fromHeight(48),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      onPressed: _toggleRest,
                      icon: Icon(_isResting ? Icons.check_circle : Icons.nightlife, size: 20),
                      label: Text(
                        _isResting
                            ? 'ĐANG NGHỈ NGƠI ($_restMinutesElapsed / 15 PHÚT) - KẾT THÚC'
                            : 'BẮT ĐẦU NGHỈ NGƠI AN TOÀN (15 PHÚT)',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Cold Chain Telemetry Monitor
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: VDBusColors.surface,
                  border: Border.all(color: VDBusColors.borderSubtle),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.ac_unit, size: 18, color: VDBusColors.infoText),
                            SizedBox(width: 6),
                            Text(
                              'CHUỖI LẠNH (THÙNG HÀNG)',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: VDBusColors.textPrimary,
                              ),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: isTempWarning ? VDBusColors.errorBg : VDBusColors.successBg,
                            border: Border.all(color: isTempWarning ? VDBusColors.errorText : VDBusColors.successText),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            isTempWarning ? 'VƯỢT NGƯỠNG' : 'ĐẠT CHUẨN',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: isTempWarning ? VDBusColors.errorText : VDBusColors.successText,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        Column(
                          children: [
                            const Text(
                              'Nhiệt độ hiện tại',
                              style: TextStyle(fontSize: 12, color: VDBusColors.textMuted),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${_coldChainTemp.toStringAsFixed(1)}°C',
                              style: TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: isTempWarning ? VDBusColors.errorText : VDBusColors.primary,
                              ),
                            ),
                          ],
                        ),
                        Column(
                          children: [
                            const Text(
                              'Dải yêu cầu',
                              style: TextStyle(fontSize: 12, color: VDBusColors.textMuted),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${_coldChainTargetMin.toInt()}°C đến ${_coldChainTargetMax.toInt()}°C',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: VDBusColors.textPrimary,
                              ),
                            ),
                          ],
                        ),
                        Column(
                          children: [
                            const Text(
                              'Máy lạnh',
                              style: TextStyle(fontSize: 12, color: VDBusColors.textMuted),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _isReeferRunning ? 'ĐANG CHẠY' : 'TẮT',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: _isReeferRunning ? VDBusColors.successText : VDBusColors.textMuted,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // TPMS Tire Summary
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: VDBusColors.surface,
                  border: Border.all(color: VDBusColors.borderSubtle),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.tire_repair, size: 18, color: VDBusColors.primary),
                        SizedBox(width: 6),
                        Text(
                          'ÁP SUẤT LỐP TPMS (ĐỊNH MỨC 110 - 120 PSI)',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: VDBusColors.textPrimary,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: const [
                        _TireItem(label: 'Trước Trái', psi: 115, temp: 45),
                        _TireItem(label: 'Trước Phải', psi: 116, temp: 46),
                        _TireItem(label: 'Sau Trái', psi: 118, temp: 50),
                        _TireItem(label: 'Sau Phải', psi: 117, temp: 49),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Driver Quick Access Actions
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        side: const BorderSide(color: VDBusColors.primary),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                      ),
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (context) => DocumentWalletScreen(
                              driverName: widget.driverName,
                              vehiclePlate: widget.vehiclePlate,
                            ),
                          ),
                        );
                      },
                      icon: const Icon(Icons.badge_outlined, size: 16),
                      label: const Text('VÍ GIẤY TỜ', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        side: const BorderSide(color: VDBusColors.primary),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                      ),
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (context) => FuelEntryScreen(
                              driverName: widget.driverName,
                              vehiclePlate: widget.vehiclePlate,
                            ),
                          ),
                        );
                      },
                      icon: const Icon(Icons.local_gas_station_outlined, size: 16),
                      label: const Text('ĐỔ XĂNG DẦU', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        backgroundColor: VDBusColors.errorText,
                        foregroundColor: VDBusColors.textInverse,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                      ),
                      onPressed: _handleSosEmergency,
                      icon: const Icon(Icons.emergency, size: 16),
                      label: const Text('SOS KHẨN CẤP', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // Test Simulation Button: Trigger GPS Stationary Noise Filter (< 3 km/h)
              OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size.fromHeight(48),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                ),
                onPressed: _simulateStationary,
                icon: const Icon(Icons.filter_alt_outlined, size: 18),
                label: const Text('KIỂM TRA LỌC NHIỄU GPS (ĐẶT TỐC ĐỘ 2.4 KM/H)'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _TireItem extends StatelessWidget {
  final String label;
  final int psi;
  final int temp;

  const _TireItem({
    required this.label,
    required this.psi,
    required this.temp,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: VDBusColors.textMuted),
        ),
        const SizedBox(height: 4),
        Text(
          '$psi PSI',
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.bold,
            color: VDBusColors.textPrimary,
          ),
        ),
        Text(
          '$temp°C',
          style: const TextStyle(fontSize: 11, color: VDBusColors.textSecondary),
        ),
      ],
    );
  }
}
