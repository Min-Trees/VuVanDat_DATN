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
          content: Text('Vui lòng nhập họ tên người nhận hàng.'),
          backgroundColor: VDBusColors.errorText,
        ),
      );
      return;
    }

    if (!_hasSignature) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng yêu cầu người nhận ký xác nhận.'),
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
          title: const Row(
            children: [
              Icon(Icons.verified, color: VDBusColors.primary, size: 22),
              SizedBox(width: 8),
              Text('Chứng Chỉ ePOD'),
            ],
          ),
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
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: const [
                      BoxShadow(color: Colors.black12, blurRadius: 6, offset: Offset(0, 3)),
                    ],
                  ),
                  child: Column(
                    children: [
                      const Icon(Icons.check_circle, color: VDBusColors.successText, size: 48),
                      const SizedBox(height: 12),
                      const Text(
                        'XÁC NHẬN GIAO HÀNG THÀNH CÔNG',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: VDBusColors.successText,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.inventory_2_outlined, size: 16, color: VDBusColors.primary),
                          const SizedBox(width: 6),
                          Text(
                            'Đơn hàng: ${widget.trip.orderCode}',
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                              color: VDBusColors.textPrimary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.person_outline, size: 16, color: VDBusColors.textSecondary),
                          const SizedBox(width: 6),
                          Text(
                            'Người nhận: ${_receiverController.text}',
                            style: const TextStyle(
                              fontSize: 14,
                              color: VDBusColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      const Divider(color: VDBusColors.borderSubtle),
                      const SizedBox(height: 12),
                      const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.fingerprint, size: 16, color: VDBusColors.primary),
                          SizedBox(width: 6),
                          Text(
                            'Mã băm bảo mật toàn vẹn (SHA-256):',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: VDBusColors.textMuted,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: VDBusColors.subtle,
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(color: VDBusColors.borderSubtle),
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
                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.of(context).pop(true);
                  },
                  icon: const Icon(Icons.home, size: 20),
                  label: const Text('HOÀN TẤT & VỀ TRANG CHỦ'),
                  style: ElevatedButton.styleFrom(
                    minimumSize: const Size.fromHeight(50),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.draw, color: VDBusColors.primary, size: 22),
            SizedBox(width: 8),
            Text('Ký Nhận Điện Tử (ePOD)'),
          ],
        ),
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
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.inventory_2_outlined, size: 18, color: VDBusColors.primary),
                        const SizedBox(width: 6),
                        Text(
                          'Đơn hàng: ${widget.trip.orderCode}',
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: VDBusColors.textPrimary,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(Icons.location_on_outlined, size: 16, color: VDBusColors.infoText),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            'Điểm giao: ${widget.trip.stops.last.address}',
                            style: const TextStyle(
                              fontSize: 13,
                              color: VDBusColors.textSecondary,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 18),

              // Receiver Full Name Input
              const Row(
                children: [
                  Icon(Icons.person_outline, size: 16, color: VDBusColors.primary),
                  SizedBox(width: 6),
                  Text(
                    'Họ tên người nhận hàng *',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: VDBusColors.textPrimary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              TextField(
                controller: _receiverController,
                decoration: InputDecoration(
                  hintText: 'VD: Võ Minh Trí (Thủ kho)',
                  prefixIcon: const Icon(Icons.badge_outlined, size: 20),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(6)),
                ),
              ),

              const SizedBox(height: 14),

              // Receiver Phone Input
              const Row(
                children: [
                  Icon(Icons.phone_outlined, size: 16, color: VDBusColors.primary),
                  SizedBox(width: 6),
                  Text(
                    'Số điện thoại người nhận',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: VDBusColors.textPrimary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(
                  hintText: 'VD: 0905333444',
                  prefixIcon: const Icon(Icons.phone_iphone, size: 20),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(6)),
                ),
              ),

              const SizedBox(height: 18),

              // Interactive Signature Pad
              const Row(
                children: [
                  Icon(Icons.gesture, size: 16, color: VDBusColors.primary),
                  SizedBox(width: 6),
                  Text(
                    'Chữ ký điện tử người nhận *',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: VDBusColors.textPrimary,
                    ),
                  ),
                ],
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
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: VDBusColors.borderSubtle),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.camera_alt_outlined, color: VDBusColors.successText, size: 20),
                      SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Ảnh chụp chứng từ / kiện hàng: Đã ghi nhận',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                            color: VDBusColors.textPrimary,
                          ),
                        ),
                      ),
                      Icon(Icons.check_circle, color: VDBusColors.successText, size: 18),
                    ],
                  ),
                ),

              const SizedBox(height: 14),

              // Delivery Notes
              const Row(
                children: [
                  Icon(Icons.note_alt_outlined, size: 16, color: VDBusColors.primary),
                  SizedBox(width: 6),
                  Text(
                    'Ghi chú tình trạng hàng hóa',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: VDBusColors.textPrimary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              TextField(
                controller: _notesController,
                decoration: InputDecoration(
                  hintText: 'VD: Hàng nguyên đai kiện, đầy đủ niêm phong chì',
                  prefixIcon: const Icon(Icons.edit_note, size: 20),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(6)),
                ),
              ),

              const SizedBox(height: 24),

              // Submit Button >= 48dp
              ElevatedButton.icon(
                onPressed: _isSubmitting ? null : _submitEpod,
                icon: const Icon(Icons.verified, size: 20),
                label: _isSubmitting
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: VDBusColors.textInverse,
                        ),
                      )
                    : const Text('XÁC NHẬN GIAO HÀNG (ePOD)'),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size.fromHeight(50),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
