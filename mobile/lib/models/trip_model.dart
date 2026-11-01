enum TripStep {
  scheduled,
  atPickup,
  loading,
  inTransit,
  atDelivery,
  completed,
}

class TripStop {
  final int order;
  final String type; // 'Pickup' or 'Delivery'
  final String address;
  final String contactName;
  final String contactPhone;
  final DateTime scheduledTime;
  final bool isCompleted;

  const TripStop({
    required this.order,
    required this.type,
    required this.address,
    required this.contactName,
    required this.contactPhone,
    required this.scheduledTime,
    this.isCompleted = false,
  });
}

class DriverTrip {
  final String id;
  final String tripCode;
  final String orderId;
  final String orderCode;
  final String vehiclePlate;
  final String vehicleModel;
  final double totalWeightKg;
  final double totalVolumeCbm;
  final List<TripStop> stops;
  final TripStep currentStep;
  final bool isSimulated;

  const DriverTrip({
    required this.id,
    required this.tripCode,
    required this.orderId,
    required this.orderCode,
    required this.vehiclePlate,
    required this.vehicleModel,
    required this.totalWeightKg,
    required this.totalVolumeCbm,
    required this.stops,
    required this.currentStep,
    this.isSimulated = true,
  });

  DriverTrip copyWith({
    String? tripCode,
    String? vehiclePlate,
    TripStep? currentStep,
    List<TripStop>? stops,
  }) {
    return DriverTrip(
      id: id,
      tripCode: tripCode ?? this.tripCode,
      orderId: orderId,
      orderCode: orderCode,
      vehiclePlate: vehiclePlate ?? this.vehiclePlate,
      vehicleModel: vehicleModel,
      totalWeightKg: totalWeightKg,
      totalVolumeCbm: totalVolumeCbm,
      stops: stops ?? this.stops,
      currentStep: currentStep ?? this.currentStep,
      isSimulated: isSimulated,
    );
  }
}
