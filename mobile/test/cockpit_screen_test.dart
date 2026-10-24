import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:vdbus_driver/screens/cockpit_screen.dart';

void main() {
  group('GpsFilter Tests', () {
    test('filters out stationary GPS noise below 3.0 km/h', () {
      expect(GpsFilter.filterSpeed(0.0), 0.0);
      expect(GpsFilter.filterSpeed(1.5), 0.0);
      expect(GpsFilter.filterSpeed(2.9), 0.0);
      expect(GpsFilter.isStationary(2.9), isTrue);

      expect(GpsFilter.filterSpeed(3.0), 3.0);
      expect(GpsFilter.filterSpeed(55.4), 55.4);
      expect(GpsFilter.isStationary(55.4), isFalse);
    });
  });

  group('CockpitScreen Widget Tests', () {
    testWidgets('renders cockpit header, speed display, HOS meter and cold chain info', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(800, 1400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const MaterialApp(
          home: CockpitScreen(
            vehiclePlate: '43C-189.24',
            driverName: 'Nguyen Van Tuan',
          ),
        ),
      );

      // Verify title and vehicle details
      expect(find.text('Buong lai so (Cockpit)'), findsOneWidget);
      expect(find.text('43C-189.24'), findsOneWidget);
      expect(find.text('Tai xe: Nguyen Van Tuan'), findsOneWidget);

      // Verify Speedometer
      expect(find.text('VAN TOC GPS HIEN TAI'), findsOneWidget);
      expect(find.text('km/h'), findsOneWidget);

      // Verify HOS countdown and safety button
      expect(find.text('GIO LAI AN TOAN (HOS)'), findsOneWidget);
      expect(find.textContaining('BAT DAU NGHI NGOI AN TOAN'), findsOneWidget);

      // Verify Cold chain & TPMS
      expect(find.text('CHUOI LANH (THUNG HANG)'), findsOneWidget);
      expect(find.text('-18.4 C'), findsOneWidget);
      expect(find.text('AP SUAT LOP TPMS (DINH MUC 110 - 120 PSI)'), findsOneWidget);
    });

    testWidgets('triggers rest mode toggle and GPS stationary simulation button', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(800, 1400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const MaterialApp(
          home: CockpitScreen(
            vehiclePlate: '43C-189.24',
            driverName: 'Nguyen Van Tuan',
          ),
        ),
      );

      // Tap GPS noise filter test button
      await tester.tap(find.text('KIEM TRA LOC NHIEU GPS (DAT TOC DO 2.4 KM/H)'));
      await tester.pump();

      // Filtered speed is 0.0 and DUNG XE is shown
      expect(find.text('0.0'), findsOneWidget);
      expect(find.text('DUNG XE'), findsOneWidget);

      // Tap rest button
      await tester.tap(find.textContaining('BAT DAU NGHI NGOI AN TOAN'));
      await tester.pump();

      expect(find.textContaining('DANG NGHI NGOI'), findsOneWidget);
    });
  });
}
