import 'package:flutter_test/flutter_test.dart';
import 'package:vdbus_driver/main.dart';

void main() {
  testWidgets('Driver app execution flow test verifies step transitions and button actions', (WidgetTester tester) async {
    await tester.pumpWidget(const VDBusDriverApp());

    // Step 0: Scheduled
    expect(find.text('VDBus Tai xe'), findsOneWidget);
    expect(find.text('Chuyen xe: CH-2026-0881'), findsOneWidget);
    expect(find.text('Cho bat dau'), findsOneWidget);
    expect(find.text('BAT DAU DI DEN DIEM LAY HANG'), findsOneWidget);

    // Advance to Step 1: atPickup
    await tester.tap(find.text('BAT DAU DI DEN DIEM LAY HANG'));
    await tester.pump();
    expect(find.text('Da den diem lay hang'), findsOneWidget);
    expect(find.text('XAC NHAN BAT DAU XEP HANG'), findsOneWidget);

    // Advance to Step 2: loading
    await tester.tap(find.text('XAC NHAN BAT DAU XEP HANG'));
    await tester.pump();
    expect(find.text('Dang boc xep hang'), findsOneWidget);
    expect(find.text('XEP HANG XONG - KHOI HANH'), findsOneWidget);

    // Advance to Step 3: inTransit
    await tester.tap(find.text('XEP HANG XONG - KHOI HANH'));
    await tester.pump();
    expect(find.text('Dang van chuyen'), findsOneWidget);
    expect(find.text('DA TOI DIEM GIAO HANG'), findsOneWidget);

    // Advance to Step 4: atDelivery
    await tester.tap(find.text('DA TOI DIEM GIAO HANG'));
    await tester.pump();
    expect(find.text('Da den diem giao hang'), findsOneWidget);
    expect(find.text('TIEN HANH GIAO HANG & KY ePOD'), findsOneWidget);
  });
}
