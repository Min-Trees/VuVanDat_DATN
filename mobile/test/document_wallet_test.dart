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
            driverName: 'Nguyen Van Hai',
            vehiclePlate: '43C-189.24',
          ),
        ),
      );

      expect(find.text('Vi Giay to So & Dang kiem'), findsOneWidget);
      expect(find.text('Nguyen Van Hai'), findsOneWidget);
      expect(find.text('Phuong tien gan lien: 43C-189.24'), findsOneWidget);
      expect(find.text('Giay phep lai xe Hang FC'), findsOneWidget);
      expect(find.text('Giay chung nhan Kiem dinh ATKT & BVMT'), findsOneWidget);
      expect(find.textContaining('KD-4301S-19284'), findsOneWidget);
      expect(find.text('Sap het han (9 ngay)'), findsOneWidget);
    });

    testWidgets('fills fuel entry form and submits to sync queue', (WidgetTester tester) async {
      tester.view.physicalSize = const Size(800, 1400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const MaterialApp(
          home: FuelEntryScreen(
            vehiclePlate: '43C-189.24',
            driverName: 'Nguyen Van Hai',
          ),
        ),
      );

      expect(find.text('Ghi Nhan Do Xang Dau'), findsOneWidget);
      expect(find.text('Tong thanh tien hoa don:'), findsOneWidget);

      final submitBtn = find.text('Xac Nhan & Luu Hang Doi Ngoai Tuyen');
      expect(submitBtn, findsOneWidget);

      await tester.ensureVisible(submitBtn);
      await tester.tap(submitBtn);
      await tester.pumpAndSettle();

      expect(find.textContaining('Thanh cong: Da dua vao SyncQueue'), findsOneWidget);
    });
  });
}
