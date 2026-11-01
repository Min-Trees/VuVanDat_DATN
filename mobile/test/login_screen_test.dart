import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:vdbus_driver/screens/login_screen.dart';

void main() {
  testWidgets('LoginScreen renders brand header, prefilled credentials, and fast login button', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(800, 1400);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);

    await tester.pumpWidget(
      const MaterialApp(
        home: LoginScreen(),
      ),
    );

    expect(find.text('VDBUS DRIVER'), findsOneWidget);
    expect(find.text('Hệ thống Điều vận & Buồng lái Tài xế B2B'), findsOneWidget);
    expect(find.text('Tài khoản tài xế'), findsOneWidget);
    expect(find.text('Mật khẩu'), findsOneWidget);
    expect(find.text('ĐĂNG NHẬP VÀO CA'), findsOneWidget);
    expect(find.text('Đăng nhập nhanh: Tài xế Tuấn (43C-189.24)'), findsOneWidget);
  });
}
