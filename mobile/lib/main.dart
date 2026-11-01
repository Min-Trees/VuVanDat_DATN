import 'package:flutter/material.dart';
import 'core/theme/theme.dart';
import 'screens/driver_main_screen.dart';

void main() {
  runApp(const VDBusDriverApp());
}

class VDBusDriverApp extends StatelessWidget {
  final Widget? home;
  const VDBusDriverApp({super.key, this.home});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'VDBus Driver',
      theme: VDBusTheme.lightTheme,
      debugShowCheckedModeBanner: false,
      home: home ?? const DriverHomeScreen(),
    );
  }
}

// Retain DriverHomeScreen for backward compatibility with testing suites
class DriverHomeScreen extends StatelessWidget {
  const DriverHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const DriverMainScreen();
  }
}
