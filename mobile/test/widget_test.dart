import 'package:flutter_test/flutter_test.dart';
import 'package:vdbus_driver/main.dart';

void main() {
  testWidgets('Driver app execution flow test verifies step transitions and button actions', (WidgetTester tester) async {
    await tester.pumpWidget(const VDBusDriverApp());

    // Step 0: Scheduled
    expect(find.text('VDBus Tài xế'), findsOneWidget);
    expect(find.text('Chuyến xe: CH-2026-0881'), findsOneWidget);
    expect(find.text('Chờ bắt đầu'), findsOneWidget);
    expect(find.text('BẮT ĐẦU ĐI ĐẾN ĐIỂM LẤY HÀNG'), findsOneWidget);

    // Advance to Step 1: atPickup
    await tester.tap(find.text('BẮT ĐẦU ĐI ĐẾN ĐIỂM LẤY HÀNG'));
    await tester.pump();
    expect(find.text('Đã đến điểm lấy hàng'), findsOneWidget);
    expect(find.text('XÁC NHẬN BẮT ĐẦU XẾP HÀNG'), findsOneWidget);

    // Advance to Step 2: loading
    await tester.tap(find.text('XÁC NHẬN BẮT ĐẦU XẾP HÀNG'));
    await tester.pump();
    expect(find.text('Đang bốc xếp hàng'), findsOneWidget);
    expect(find.text('XẾP HÀNG XONG - KHỞI HÀNH'), findsOneWidget);

    // Advance to Step 3: inTransit
    await tester.tap(find.text('XẾP HÀNG XONG - KHỞI HÀNH'));
    await tester.pump();
    expect(find.text('Đang vận chuyển'), findsOneWidget);
    expect(find.text('ĐÃ TỚI ĐIỂM GIAO HÀNG'), findsOneWidget);

    // Advance to Step 4: atDelivery
    await tester.tap(find.text('ĐÃ TỚI ĐIỂM GIAO HÀNG'));
    await tester.pump();
    expect(find.text('Đã đến điểm giao hàng'), findsOneWidget);
    expect(find.text('TIẾN HÀNH GIAO HÀNG & KÝ ePOD'), findsOneWidget);
  });
}
