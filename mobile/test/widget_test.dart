import 'package:flutter_test/flutter_test.dart';
import 'package:vdbus_driver/main.dart';

void main() {
  testWidgets('Driver app smoke test renders trip and toggles driving state', (WidgetTester tester) async {
    await tester.pumpWidget(const VDBusDriverApp());

    // Verify title and trip details
    expect(find.text('VDBus Tai xe'), findsOneWidget);
    expect(find.text('Chuyen xe: CH-2026-0881'), findsOneWidget);
    expect(find.text('Cho bat dau'), findsOneWidget);

    // Tap to start trip
    await tester.tap(find.text('BAT DAU CHUYEN XE'));
    await tester.pump();

    // Verify status updated to 'Dang chay'
    expect(find.text('Dang chay'), findsOneWidget);
    expect(find.text('DUNG CHUYEN XE'), findsOneWidget);
  });
}
