import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:vdbus_driver/screens/trip_offer_screen.dart';
import 'package:vdbus_driver/screens/truck_navigation_screen.dart';

void main() {
  testWidgets('TripOfferScreen displays offer details, countdown and actions', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(800, 1400);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);

    bool accepted = false;

    await tester.pumpWidget(
      MaterialApp(
        home: TripOfferScreen(
          onAccept: () {
            accepted = true;
          },
        ),
      ),
    );

    // Header & details
    expect(find.text('ĐỀ NGHỊ CHUYẾN XE MỚI'), findsOneWidget);
    expect(find.text('2.850.000 đ'), findsOneWidget);
    expect(find.text('18.5 Tấn / 42 CBM'), findsOneWidget);
    expect(find.textContaining('3.2 km'), findsOneWidget);

    // Stops
    expect(find.text('ĐIỂM 1: LẤY HÀNG (14.2 km)'), findsOneWidget);
    expect(find.text('ĐIỂM 2: GIAO HÀNG (22.6 km)'), findsOneWidget);

    // Accept CTA
    final acceptBtn = find.text('NHẬN CHUYẾN NGAY');
    expect(acceptBtn, findsOneWidget);
    await tester.tap(acceptBtn);
    await tester.pumpAndSettle();

    expect(accepted, isTrue);
  });

  testWidgets('TruckNavigationScreen renders banner, speed limit, bottom sheet and fast forward', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(800, 1400);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);

    bool epodTriggered = false;

    await tester.pumpWidget(
      MaterialApp(
        home: TruckNavigationScreen(
          onFinishToEpod: () {
            epodTriggered = true;
          },
        ),
      ),
    );

    // Speed limit and turn banner
    expect(find.text('60'), findsOneWidget);
    expect(find.textContaining('Rẽ phải'), findsOneWidget);

    // Truck alerts
    expect(find.textContaining('BOT Điện Bàn'), findsOneWidget);

    // Bottom sheet
    expect(find.text('ĐIỂM 1: LẤY HÀNG'), findsOneWidget);
    expect(find.text('Kho Thép Hòa Phát Dung Quất'), findsOneWidget);
    expect(find.text('GỌI THỦ KHO'), findsOneWidget);

    // Action buttons
    expect(find.byIcon(Icons.close), findsOneWidget);
    expect(find.byIcon(Icons.warning_amber), findsOneWidget);
    expect(find.byIcon(Icons.fast_forward), findsOneWidget);

    // Tap fast forward
    await tester.tap(find.byIcon(Icons.fast_forward));
    await tester.pump();
  });
}
