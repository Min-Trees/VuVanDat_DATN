import 'package:flutter/material.dart';
import 'core/theme/theme.dart';
import 'models/trip_model.dart';
import 'screens/epod_screen.dart';

void main() {
  runApp(const VDBusDriverApp());
}

class VDBusDriverApp extends StatelessWidget {
  const VDBusDriverApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'VDBus Driver',
      theme: VDBusTheme.lightTheme,
      debugShowCheckedModeBanner: false,
      home: const DriverHomeScreen(),
    );
  }
}

class DriverHomeScreen extends StatefulWidget {
  const DriverHomeScreen({super.key});

  @override
  State<DriverHomeScreen> createState() => _DriverHomeScreenState();
}

class _DriverHomeScreenState extends State<DriverHomeScreen> {
  late DriverTrip _trip;

  @override
  void initState() {
    super.initState();
    _resetTrip();
  }

  void _resetTrip() {
    _trip = DriverTrip(
      id: 't-demo-001',
      tripCode: 'CH-2026-0881',
      orderId: 'o1111111-1111-1111-1111-111111111111',
      orderCode: 'DH-20261024-8192',
      vehiclePlate: '43C-189.24',
      vehicleModel: 'Hino 500 FG8JJ7A (8.5 tan)',
      totalWeightKg: 5400,
      totalVolumeCbm: 26,
      currentStep: TripStep.scheduled,
      isSimulated: true,
      stops: [
        TripStop(
          order: 1,
          type: 'Pickup',
          address: 'KCN Hoa Khanh, Lien Chieu, Da Nang',
          contactName: 'Nguyen Van Hung (Kho Vinamilk)',
          contactPhone: '0905123456',
          scheduledTime: DateTime.now().add(const Duration(hours: 1)),
        ),
        TripStop(
          order: 2,
          type: 'Delivery',
          address: 'Tong kho Big C, 255 Hung Vuong, Da Nang',
          contactName: 'Bao ve Kho Big C',
          contactPhone: '0905333444',
          scheduledTime: DateTime.now().add(const Duration(hours: 4)),
        ),
      ],
    );
  }

  void _advanceTripStep() async {
    switch (_trip.currentStep) {
      case TripStep.scheduled:
        setState(() {
          _trip = _trip.copyWith(currentStep: TripStep.atPickup);
        });
        break;
      case TripStep.atPickup:
        setState(() {
          _trip = _trip.copyWith(currentStep: TripStep.loading);
        });
        break;
      case TripStep.loading:
        setState(() {
          _trip = _trip.copyWith(currentStep: TripStep.inTransit);
        });
        break;
      case TripStep.inTransit:
        setState(() {
          _trip = _trip.copyWith(currentStep: TripStep.atDelivery);
        });
        break;
      case TripStep.atDelivery:
        // Open ePOD capture screen
        final result = await Navigator.of(context).push<bool>(
          MaterialPageRoute(
            builder: (_) => EpodScreen(trip: _trip),
          ),
        );
        if (result == true) {
          setState(() {
            _trip = _trip.copyWith(currentStep: TripStep.completed);
          });
        }
        break;
      case TripStep.completed:
        _resetTrip();
        setState(() {});
        break;
    }
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

  @override
  Widget build(BuildContext context) {
    final statusBg = _getStatusBg(_trip.currentStep);
    final statusText = _getStatusText(_trip.currentStep);

    return Scaffold(
      appBar: AppBar(
        title: const Text('VDBus Tai xe'),
        actions: [
          if (_trip.isSimulated)
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: VDBusColors.mockBg,
                border: Border.all(color: VDBusColors.mockText),
                borderRadius: BorderRadius.circular(4),
              ),
              child: const Text(
                'Du lieu mo phong',
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
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Trip Summary Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: VDBusColors.surface,
                  border: Border.all(color: VDBusColors.borderSubtle),
                  borderRadius: BorderRadius.circular(4),
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
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: statusBg,
                            border: Border.all(color: statusText),
                            borderRadius: BorderRadius.circular(2),
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
                    Text(
                      'Don hang: ${_trip.orderCode}',
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: VDBusColors.textPrimary),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Bien so xe: ${_trip.vehiclePlate} (${_trip.vehicleModel})',
                      style: const TextStyle(fontSize: 14, color: VDBusColors.textSecondary),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Trong tai hang: ${(_trip.totalWeightKg / 1000).toStringAsFixed(1)} tan - ${_trip.totalVolumeCbm} m3',
                      style: const TextStyle(fontSize: 14, color: VDBusColors.textSecondary),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Stops Timeline
              const Text(
                'Lo trinh chuyen xe',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: VDBusColors.textPrimary,
                ),
              ),
              const SizedBox(height: 8),

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
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: isPickup ? VDBusColors.infoBg : VDBusColors.successBg,
                              borderRadius: BorderRadius.circular(2),
                            ),
                            child: Text(
                              isPickup ? 'LAY' : 'GIAO',
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
                                    fontSize: 14,
                                    fontWeight: FontWeight.w500,
                                    color: VDBusColors.textPrimary,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Lien he: ${stop.contactName} - ${stop.contactPhone}',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: VDBusColors.textMuted,
                                  ),
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
      ),
    );
  }
}
