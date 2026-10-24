import 'dart:async';
import 'package:flutter/material.dart';
import '../core/theme/theme.dart';

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
    this.driverName = 'Nguyen Van Tuan',
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
      hosAlertText = 'VI PHAM GIO LAI: Vui long tap vao le va nghi toi thieu 15 phut!';
    } else if (remainingMinutes <= 15) {
      hosColor = VDBusColors.errorText;
      hosAlertText = 'KHAN CAP: Con duoi 15 phut gio lai lien tuc!';
    } else if (remainingMinutes <= 30) {
      hosColor = VDBusColors.warningText;
      hosAlertText = 'CANH BAO: Con $remainingMinutes phut truoc khi het gio lai.';
    } else {
      hosColor = VDBusColors.successText;
      hosAlertText = 'An toan: Con $remainingMinutes phut gio lai lien tuc.';
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Buong lai so (Cockpit)'),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: VDBusColors.mockBg,
              border: Border.all(color: VDBusColors.mockText),
              borderRadius: BorderRadius.circular(4),
            ),
            child: const Text(
              'Mo phong GPS & IoT',
              style: TextStyle(
                fontSize: 12,
                color: VDBusColors.mockText,
                fontWeight: FontWeight.w600,
              ),
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
                padding: const EdgeInsets.all(12),
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
                        Text(
                          widget.vehiclePlate,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: VDBusColors.textPrimary,
                          ),
                        ),
                        Text(
                          'Tai xe: ${widget.driverName}',
                          style: const TextStyle(
                            fontSize: 13,
                            color: VDBusColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: isStationary ? VDBusColors.subtle : VDBusColors.successBg,
                        border: Border.all(color: isStationary ? VDBusColors.borderDefault : VDBusColors.successText),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        isStationary ? 'DUNG XE' : 'DANG CHAY',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: isStationary ? VDBusColors.textMuted : VDBusColors.successText,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Digital Speedometer Display with GPS Noise Filter
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: VDBusColors.surface,
                  border: Border.all(color: VDBusColors.borderSubtle),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Column(
                  children: [
                    const Text(
                      'VAN TOC GPS HIEN TAI',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: VDBusColors.textMuted,
                        letterSpacing: 1.0,
                      ),
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
                            fontSize: 48,
                            fontWeight: FontWeight.bold,
                            color: VDBusColors.primary,
                          ),
                        ),
                        const SizedBox(width: 6),
                        const Text(
                          'km/h',
                          style: TextStyle(
                            fontSize: 16,
                            color: VDBusColors.textSecondary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      isStationary
                          ? 'Loc nhieu GPS: Da kich hoat (Van toc goc ${_rawSpeedKmh.toStringAsFixed(1)} < 3 km/h)'
                          : 'Tin hieu GPS on dinh',
                      style: TextStyle(
                        fontSize: 11,
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
                        const Text(
                          'GIO LAI AN TOAN (HOS)',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: VDBusColors.textPrimary,
                          ),
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
                      padding: const EdgeInsets.all(8),
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
                          fontWeight: FontWeight.w500,
                          color: hosColor,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _isResting ? VDBusColors.successText : VDBusColors.primary,
                        foregroundColor: VDBusColors.textInverse,
                        minimumSize: const Size.fromHeight(48),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      onPressed: _toggleRest,
                      child: Text(
                        _isResting
                            ? 'DANG NGHI NGOI ($_restMinutesElapsed / 15 PHUT) - KET THUC'
                            : 'BAT DAU NGHI NGOI AN TOAN (15 PHUT)',
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
                        const Text(
                          'CHUOI LANH (THUNG HANG)',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: VDBusColors.textPrimary,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: isTempWarning ? VDBusColors.errorBg : VDBusColors.successBg,
                            border: Border.all(color: isTempWarning ? VDBusColors.errorText : VDBusColors.successText),
                            borderRadius: BorderRadius.circular(2),
                          ),
                          child: Text(
                            isTempWarning ? 'VUOT NGUONG' : 'DAT CHUAN',
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
                              'Nhiet do hien tai',
                              style: TextStyle(fontSize: 12, color: VDBusColors.textMuted),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${_coldChainTemp.toStringAsFixed(1)} C',
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
                              'Dai yeu cau',
                              style: TextStyle(fontSize: 12, color: VDBusColors.textMuted),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${_coldChainTargetMin.toInt()} C den ${_coldChainTargetMax.toInt()} C',
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
                              'May lanh',
                              style: TextStyle(fontSize: 12, color: VDBusColors.textMuted),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _isReeferRunning ? 'DANG CHAY' : 'TAT',
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
                    const Text(
                      'AP SUAT LOP TPMS (DINH MUC 110 - 120 PSI)',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: VDBusColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: const [
                        _TireItem(label: 'Truoc Trai', psi: 115, temp: 45),
                        _TireItem(label: 'Truoc Phai', psi: 116, temp: 46),
                        _TireItem(label: 'Sau Trai', psi: 118, temp: 50),
                        _TireItem(label: 'Sau Phai', psi: 117, temp: 49),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Test Simulation Button: Trigger GPS Stationary Noise Filter (< 3 km/h)
              OutlinedButton(
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size.fromHeight(48),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                ),
                onPressed: _simulateStationary,
                child: const Text('KIEM TRA LOC NHIEU GPS (DAT TOC DO 2.4 KM/H)'),
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
          style: const TextStyle(fontSize: 11, color: VDBusColors.textMuted),
        ),
        const SizedBox(height: 4),
        Text(
          '$psi PSI',
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: VDBusColors.textPrimary,
          ),
        ),
        Text(
          '$temp C',
          style: const TextStyle(fontSize: 11, color: VDBusColors.textSecondary),
        ),
      ],
    );
  }
}
