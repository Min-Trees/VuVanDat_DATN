import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../core/theme/theme.dart';

class DriverOsmMap extends StatelessWidget {
  final LatLng currentPosition;
  final LatLng pickupPosition;
  final LatLng deliveryPosition;
  final String licensePlate;
  final double headingDegrees;
  final double height;
  final bool isMoving;

  const DriverOsmMap({
    super.key,
    required this.currentPosition,
    required this.pickupPosition,
    required this.deliveryPosition,
    required this.licensePlate,
    this.headingDegrees = 180,
    this.height = 280,
    this.isMoving = true,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(VDBusRadius.md),
        border: Border.all(color: VDBusColors.borderSubtle),
      ),
      clipBehavior: Clip.antiAlias,
      child: FlutterMap(
        options: MapOptions(
          initialCenter: currentPosition,
          initialZoom: 13.0,
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
              Polyline(
                points: [
                  pickupPosition,
                  LatLng(
                    (pickupPosition.latitude + currentPosition.latitude) / 2,
                    (pickupPosition.longitude + currentPosition.longitude) / 2,
                  ),
                  currentPosition,
                  LatLng(
                    (currentPosition.latitude + deliveryPosition.latitude) / 2,
                    (currentPosition.longitude + deliveryPosition.longitude) / 2,
                  ),
                  deliveryPosition,
                ],
                color: VDBusColors.primary,
                strokeWidth: 4.0,
              ),
            ],
          ),
          MarkerLayer(
            markers: [
              // Pickup Point
              Marker(
                point: pickupPosition,
                width: 80,
                height: 52,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.blue[700],
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        'Điểm lấy',
                        style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const Icon(Icons.location_on, color: Colors.blue, size: 20),
                  ],
                ),
              ),

              // Delivery Point
              Marker(
                point: deliveryPosition,
                width: 80,
                height: 52,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.purple[700],
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        'Điểm giao',
                        style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const Icon(Icons.flag, color: Colors.purple, size: 20),
                  ],
                ),
              ),

              // Current Vehicle Marker
              Marker(
                point: currentPosition,
                width: 96,
                height: 64,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: isMoving ? VDBusColors.successText : Colors.grey[700],
                        borderRadius: BorderRadius.circular(4),
                        boxShadow: const [
                          BoxShadow(color: Colors.black26, blurRadius: 4, offset: Offset(0, 2)),
                        ],
                      ),
                      child: Text(
                        licensePlate,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Transform.rotate(
                      angle: (headingDegrees * 3.141592653589793 / 180),
                      child: Container(
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          color: isMoving ? VDBusColors.successText : Colors.grey[800],
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 2),
                          boxShadow: const [
                            BoxShadow(color: Colors.black38, blurRadius: 4, offset: Offset(0, 2)),
                          ],
                        ),
                        child: const Icon(
                          Icons.navigation,
                          color: Colors.white,
                          size: 16,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
