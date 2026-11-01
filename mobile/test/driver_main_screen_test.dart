import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:vdbus_driver/screens/driver_main_screen.dart';

void main() {
  testWidgets('DriverMainScreen renders header, trip card, pre-trip inspection and navigation tabs', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(800, 1400);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);

    await tester.pumpWidget(
      const MaterialApp(
        home: DriverMainScreen(),
      ),
    );

    // Header info
    expect(find.text('VDBus Tai xe'), findsOneWidget);
    expect(find.textContaining('Nguyen Van Tuan'), findsOneWidget);
    expect(find.textContaining('Xe: 43C-189.24'), findsOneWidget);
    expect(find.text('Truc tuyen'), findsOneWidget);

    // Trip details
    expect(find.text('Chuyen xe: CH-2026-0881'), findsOneWidget);
    expect(find.text('Cho bat dau'), findsOneWidget);
    expect(find.text('BAT DAU DI DEN DIEM LAY HANG'), findsOneWidget);

    // Pre-trip inspection banner check
    expect(find.text('Kiem tra xe truoc chuyen: DA DAT YEU CAU'), findsOneWidget);

    // Switch to Cockpit & Map Tab
    await tester.tap(find.text('Buong lai'));
    await tester.pumpAndSettle();
    expect(find.text('TOC DO GPS'), findsOneWidget);
    expect(find.text('NHIET DO THUNG'), findsOneWidget);

    // Switch to Wallet Tab
    await tester.tap(find.text('Vi xe & So'));
    await tester.pumpAndSettle();
    expect(find.textContaining('Ho so Phuong tien: 43C-189.24'), findsOneWidget);
    expect(find.text('Vi giay to phap ly xe & tai xe'), findsOneWidget);
    expect(find.text('Nhat ky do dau & Hoa don VAT'), findsOneWidget);

    // Switch to ePOD Tab
    await tester.tap(find.text('Ky ePOD'));
    await tester.pumpAndSettle();
    expect(find.text('Ky Nhan Dien Tu (ePOD)'), findsOneWidget);
  });
}
