import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:flutter/material.dart';
import '../core/theme/theme.dart';
import '../models/trip_model.dart';
import '../widgets/signature_pad.dart';

class EpodScreen extends StatefulWidget {
  final DriverTrip trip;

  const EpodScreen({
    super.key,
    required this.trip,
  });

  @override
  State<EpodScreen> createState() => _EpodScreenState();
}

class _EpodScreenState extends State<EpodScreen> {
  final _receiverController = TextEditingController();
  final _phoneController = TextEditingController();
  final _notesController = TextEditingController();
  final GlobalKey<SignaturePadState> _signatureKey = GlobalKey<SignaturePadState>();

  bool _hasSignature = false;
  final bool _isPhotoCaptured = true;
  bool _isSubmitting = false;
  String? _generatedHashSha256;

  @override
  void dispose() {
    _receiverController.dispose();
    _phoneController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  void _submitEpod() async {
    final receiver = _receiverController.text.trim();
    if (receiver.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui long nhap ten nguoi nhan hang.'),
          backgroundColor: VDBusColors.errorText,
        ),
      );
      return;
    }

    if (!_hasSignature) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui long yeu cau nguoi nhan ky xac nhan.'),
          backgroundColor: VDBusColors.errorText,
        ),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    // Simulating GPS location at delivery
    const double deliveryLat = 16.0682;
    const double deliveryLng = 108.2124;
    final nowUtc = DateTime.now().toUtc();

    // Băm SHA-256 xác thực chống giả mạo theo chuẩn Backend
    final rawHashPayload = '${widget.trip.orderId}:${nowUtc.toIso8601String()}:${receiver.toUpperCase()}:1024:/photos/pod-simulated.jpg:${deliveryLat.toStringAsFixed(4)}:${deliveryLng.toStringAsFixed(4)}';
    final bytes = utf8.encode(rawHashPayload);
    final digest = sha256.convert(bytes);
    final hashSha256 = digest.toString();

    // Small delay to simulate network call
    await Future.delayed(const Duration(milliseconds: 600));

    if (!mounted) return;

    setState(() {
      _isSubmitting = false;
      _generatedHashSha256 = hashSha256;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_generatedHashSha256 != null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Chung Chi ePOD'),
          automaticallyImplyLeading: false,
        ),
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Spacer(),
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: VDBusColors.surface,
                    border: Border.all(color: VDBusColors.successText, width: 2),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Column(
                    children: [
                      const Text(
                        'XAC NHAN GIAO HANG THANH CONG',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: VDBusColors.successText,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Don hang: ${widget.trip.orderCode}',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: VDBusColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Nguoi nhan: ${_receiverController.text}',
                        style: const TextStyle(
                          fontSize: 14,
                          color: VDBusColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Divider(color: VDBusColors.borderSubtle),
                      const SizedBox(height: 12),
                      const Text(
                        'Ma bam bao mat toan ven (SHA-256):',
                        style: TextStyle(
                          fontSize: 12,
                          color: VDBusColors.textMuted,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: VDBusColors.subtle,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          _generatedHashSha256!,
                          style: const TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: VDBusColors.textPrimary,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ],
                  ),
                ),
                const Spacer(),
                ElevatedButton(
                  onPressed: () {
                    Navigator.of(context).pop(true); // Return success
                  },
                  child: const Text('HOAN TAT & VE TRANG CHU'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Ky Nhan Dien Tu (ePOD)'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Delivery Summary Card
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: VDBusColors.surface,
                  border: Border.all(color: VDBusColors.borderSubtle),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Don hang: ${widget.trip.orderCode}',
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: VDBusColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Diem giao: ${widget.trip.stops.last.address}',
                      style: const TextStyle(
                        fontSize: 13,
                        color: VDBusColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 18),

              // Receiver Full Name Input
              const Text(
                'Ho ten nguoi nhan hang *',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: VDBusColors.textPrimary,
                ),
              ),
              const SizedBox(height: 6),
              TextField(
                controller: _receiverController,
                decoration: const InputDecoration(
                  hintText: 'VD: Vo Minh Tri (Thu kho)',
                ),
              ),

              const SizedBox(height: 14),

              // Receiver Phone Input
              const Text(
                'So dien thoai nguoi nhan',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: VDBusColors.textPrimary,
                ),
              ),
              const SizedBox(height: 6),
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  hintText: 'VD: 0905333444',
                ),
              ),

              const SizedBox(height: 18),

              // Interactive Signature Pad
              const Text(
                'Chu ky dien tu nguoi nhan *',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: VDBusColors.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              SignaturePad(
                key: _signatureKey,
                onSignatureChanged: (hasSig) {
                  setState(() {
                    _hasSignature = hasSig;
                  });
                },
              ),

              const SizedBox(height: 14),

              // Photo capture status
              if (_isPhotoCaptured)
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: VDBusColors.subtle,
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: VDBusColors.borderSubtle),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 12,
                        height: 12,
                        decoration: const BoxDecoration(
                          color: VDBusColors.successText,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Expanded(
                        child: Text(
                          'Anh chup chung tu / kien hang: Da ghi nhan',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                            color: VDBusColors.textPrimary,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

              const SizedBox(height: 14),

              // Delivery Notes
              const Text(
                'Ghi chu tinh trang hang hoa',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: VDBusColors.textPrimary,
                ),
              ),
              const SizedBox(height: 6),
              TextField(
                controller: _notesController,
                decoration: const InputDecoration(
                  hintText: 'VD: Hang nguyen dai kien, day du niem phong',
                ),
              ),

              const SizedBox(height: 24),

              // Submit Button >= 48dp
              ElevatedButton(
                onPressed: _isSubmitting ? null : _submitEpod,
                child: _isSubmitting
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: VDBusColors.textInverse,
                        ),
                      )
                    : const Text('XAC NHAN GIAO HANG (ePOD)'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
