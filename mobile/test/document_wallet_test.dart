import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:vdbus_driver/screens/document_wallet_screen.dart';
import 'package:vdbus_driver/screens/fuel_entry_screen.dart';

void main() {
  group('DocumentWalletScreen & FuelEntryScreen Tests', () {
    testWidgets('renders document wallet items and expiration indicators', (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: DocumentWalletScreen(
            driverName: 'Nguyễn Văn Tuấn',
            vehiclePlate: '43C-189.24',
          ),
        ),
      );

      expect(find.text('Ví Giấy tờ Số & Đăng kiểm'), findsOneWidget);
      expect(find.text('Nguyễn Văn Tuấn'), findsOneWidget);
      expect(find.text('Phương tiện gắn liền: 43C-189.24'), findsOneWidget);
      expect(find.text('Giấy phép lái xe hạng FC'), findsOneWidget);
      expect(find.text('Giấy chứng nhận Kiểm định ATKT & BVMT'), findsOneWidget);
      expect(find.textContaining('KD-4301S-19284'), findsOneWidget);
      expect(find.text('Sắp hết hạn (9 ngày)'), findsOneWidget);
    });

    testWidgets('fills fuel entry form and submits to sync queue', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(800, 1400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const MaterialApp(
          home: FuelEntryScreen(
            vehiclePlate: '43C-189.24',
            driverName: 'Nguyễn Văn Tuấn',
          ),
        ),
      );

      expect(find.text('Ghi Nhận Đổ Xăng Dầu'), findsOneWidget);
      expect(find.text('Tổng thanh tiền hóa đơn:'), findsOneWidget);

      final submitBtn = find.text('Xác Nhận & Lưu Hàng Đợi Ngoại Tuyến');
      expect(submitBtn, findsOneWidget);

      await tester.ensureVisible(submitBtn);
      await tester.tap(submitBtn);
      await tester.pumpAndSettle();

      expect(find.textContaining('Thành công: Đã đưa vào SyncQueue'), findsOneWidget);
    });
  });
}
