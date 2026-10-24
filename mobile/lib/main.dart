import 'package:flutter/material.dart';
import 'core/theme/theme.dart';

void main() {
  runApp(const VDBusDriverApp());
}

class VDBusDriverApp extends StatelessWidget {
  const VDBusDriverApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'VDBus Driver',
      theme: VDBusTheme.lightTheme,
      debugShowCheckedModeBanner: false,
      home: const DriverHomeScreen(),
    );
  }
}

class DriverHomeScreen extends StatefulWidget {
  const DriverHomeScreen({super.key});

  @override
  State<DriverHomeScreen> createState() => _DriverHomeScreenState();
}

class _DriverHomeScreenState extends State<DriverHomeScreen> {
  bool _isDriving = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('VDBus Tai xe'),
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: VDBusColors.mockBg,
              border: Border.all(color: VDBusColors.mockText),
              borderRadius: BorderRadius.circular(4),
            ),
            child: const Text(
              'Du lieu mo phong',
              style: TextStyle(
                fontSize: 12,
                color: VDBusColors.mockText,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Trip Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: VDBusColors.surface,
                  border: Border.all(color: VDBusColors.borderSubtle),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Chuyen xe: CH-2026-0881',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: VDBusColors.textPrimary,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: _isDriving ? VDBusColors.infoBg : VDBusColors.warningBg,
                            border: Border.all(
                              color: _isDriving ? VDBusColors.infoText : VDBusColors.warningText,
                            ),
                            borderRadius: BorderRadius.circular(2),
                          ),
                          child: Text(
                            _isDriving ? 'Dang chay' : 'Cho bat dau',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: _isDriving ? VDBusColors.infoText : VDBusColors.warningText,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'Lo trinh: Ha Noi - Hai Phong (QL5B)',
                      style: TextStyle(fontSize: 14, color: VDBusColors.textSecondary),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Bien so xe: 29C-482.11',
                      style: TextStyle(fontSize: 14, color: VDBusColors.textSecondary),
                    ),
                  ],
                ),
              ),

              const Spacer(),

              // Primary Action (48dp height minimum for sunlight / one-handed ease)
              ElevatedButton(
                onPressed: () {
                  setState(() {
                    _isDriving = !_isDriving;
                  });
                },
                child: Text(_isDriving ? 'DUNG CHUYEN XE' : 'BAT DAU CHUYEN XE'),
              ),
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: () {},
                child: const Text('XEM GIAY TO XE (SO HOA)'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
