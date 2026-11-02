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
    expect(find.text('VDBus Tài xế'), findsOneWidget);
    expect(find.textContaining('Nguyễn Văn Tuấn'), findsOneWidget);
    expect(find.textContaining('Xe: 43C-189.24'), findsOneWidget);
    expect(find.text('Trực tuyến'), findsOneWidget);

    // Trip details
    expect(find.text('Chuyến xe: CH-2026-0881'), findsOneWidget);
    expect(find.text('Chờ bắt đầu'), findsOneWidget);
    expect(find.text('BẮT ĐẦU ĐI ĐẾN ĐIỂM LẤY HÀNG'), findsOneWidget);

    // Pre-trip inspection banner check
    expect(find.text('Kiểm tra xe trước chuyến: ĐÃ ĐẠT YÊU CẦU'), findsOneWidget);

    // Switch to Cockpit & Map Tab
    await tester.tap(find.text('Buồng lái'));
    await tester.pumpAndSettle();
    expect(find.text('TỐC ĐỘ GPS'), findsOneWidget);
    expect(find.text('NHIỆT ĐỘ THÙNG'), findsOneWidget);

    // Switch to Wallet Tab
    await tester.tap(find.text('Ví xe & Sổ'));
    await tester.pumpAndSettle();
    expect(find.textContaining('Hồ sơ Phương tiện: 43C-189.24'), findsOneWidget);
    expect(find.text('Ví giấy tờ pháp lý xe & tài xế'), findsOneWidget);
    expect(find.text('Nhật ký đổ dầu & Hóa đơn VAT'), findsOneWidget);

    // Switch to ePOD Tab
    await tester.tap(find.text('Ký ePOD'));
    await tester.pumpAndSettle();
    expect(find.text('Ký Nhận Điện Tử (ePOD)'), findsOneWidget);
  });
}
