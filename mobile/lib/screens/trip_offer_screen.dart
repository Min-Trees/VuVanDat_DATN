import 'dart:async';
import 'package:flutter/material.dart';
import '../core/theme/theme.dart';

class TripOfferScreen extends StatefulWidget {
  final VoidCallback onAccept;
  final Function(String reason)? onReject;

  const TripOfferScreen({
    super.key,
    required this.onAccept,
    this.onReject,
  });

  @override
  State<TripOfferScreen> createState() => _TripOfferScreenState();
}

class _TripOfferScreenState extends State<TripOfferScreen> {
  int _secondsRemaining = 15;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startCountdown();
  }

  void _startCountdown() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      if (_secondsRemaining > 1) {
        setState(() {
          _secondsRemaining--;
        });
      } else {
        _timer?.cancel();
        _rejectWithReason('Hết thời gian phản hồi (15s)');
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _rejectWithReason(String reason) {
    _timer?.cancel();
    if (widget.onReject != null) {
      widget.onReject!(reason);
    }
    Navigator.of(context).pop();
  }

  void _showRejectDialog() {
    _timer?.cancel();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Lý do từ chối chuyến', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.build, color: VDBusColors.textSecondary),
              title: const Text('Xe gặp sự cố kỹ thuật / Hỏng lốp'),
              onTap: () => _rejectWithReason('Xe gặp sự cố kỹ thuật'),
            ),
            ListTile(
              leading: const Icon(Icons.access_time, color: VDBusColors.warning),
              title: const Text('Sắp quá giờ lái xe liên tục HOS (4h)'),
              onTap: () => _rejectWithReason('Hết giờ lái xe HOS'),
            ),
            ListTile(
              leading: const Icon(Icons.traffic, color: VDBusColors.textSecondary),
              title: const Text('Kẹt đường / Kẹt hầm Hải Vân'),
              onTap: () => _rejectWithReason('Kẹt đường'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              _startCountdown();
            },
            child: const Text('Quay lại'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final progress = _secondsRemaining / 15.0;

    return Scaffold(
      backgroundColor: Colors.black.withValues(alpha: 0.85),
      body: SafeArea(
        child: Center(
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: VDBusColors.surface,
              borderRadius: BorderRadius.circular(16),
              boxShadow: const [
                BoxShadow(color: Colors.black38, blurRadius: 20, offset: Offset(0, 10)),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Thanh đếm ngược 15s
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: VDBusColors.amberAction.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        'ĐỀ NGHỊ CHUYẾN XE MỚI',
                        style: TextStyle(
                          color: VDBusColors.amberAction,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                    Text(
                      'Tự động hủy sau ${_secondsRemaining}s',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: _secondsRemaining <= 5 ? VDBusColors.error : VDBusColors.textSecondary,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(3),
                  child: LinearProgressIndicator(
                    value: progress,
                    backgroundColor: VDBusColors.bgCanvas,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      _secondsRemaining <= 5 ? VDBusColors.error : VDBusColors.amberAction,
                    ),
                    minHeight: 6,
                  ),
                ),
                const SizedBox(height: 16),

                // Cước phí & Trọng tải
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: VDBusColors.primarySubtle,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: VDBusColors.primary.withValues(alpha: 0.2)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('CƯỚC CHUYẾN DỰ KIẾN', style: TextStyle(fontSize: 11, color: VDBusColors.textSecondary, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          const Text(
                            '2.850.000 đ',
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: VDBusColors.primary,
                            ),
                          ),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          const Text('TỔNG TẢI TRỌNG', style: TextStyle(fontSize: 11, color: VDBusColors.textSecondary, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: VDBusColors.surface,
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(color: VDBusColors.borderSubtle),
                            ),
                            child: const Text('18.5 Tấn / 42 CBM', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Cự ly tiếp cận kho lấy
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: VDBusColors.successBg,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: VDBusColors.successBorder),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.near_me, size: 16, color: VDBusColors.successText),
                      SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Vị trí của bạn cách điểm lấy hàng 3.2 km (khoảng 8 phút di chuyển)',
                          style: TextStyle(fontSize: 12, color: VDBusColors.successText, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Tuyến hành trình 2 điểm dừng
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: VDBusColors.bgCanvas,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: VDBusColors.borderSubtle),
                  ),
                  child: Column(
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(color: VDBusColors.primary, shape: BoxShape.circle),
                            child: const Icon(Icons.arrow_upward, color: Colors.white, size: 12),
                          ),
                          const SizedBox(width: 8),
                          const Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('ĐIỂM 1: LẤY HÀNG (14.2 km)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: VDBusColors.primary)),
                                Text('Kho Hòa Phát Dung Quất, KKT Dung Quất, Quảng Ngãi', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                                Text('Hàng hóa: 2 Cuộn thép dự ứng lực (18.5 Tấn)', style: TextStyle(fontSize: 11, color: VDBusColors.textSecondary)),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const Padding(
                        padding: EdgeInsets.only(left: 10),
                        child: Align(
                          alignment: Alignment.centerLeft,
                          child: SizedBox(height: 16, child: VerticalDivider(thickness: 2, color: VDBusColors.borderSubtle)),
                        ),
                      ),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(color: VDBusColors.amberAction, shape: BoxShape.circle),
                            child: const Icon(Icons.location_on, color: Colors.white, size: 12),
                          ),
                          const SizedBox(width: 8),
                          const Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('ĐIỂM 2: GIAO HÀNG (22.6 km)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: VDBusColors.amberAction)),
                                Text('Kho Vinamilk Hòa Cường, Hải Châu, Đà Nẵng', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                                Text('Người nhận: Thủ kho Trần Đình Long (0905.333.444)', style: TextStyle(fontSize: 11, color: VDBusColors.textSecondary)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // 2 Nút hành động Từ chối và Nhận đơn
                Row(
                  children: [
                    Expanded(
                      flex: 1,
                      child: OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size(0, 52),
                          side: const BorderSide(color: VDBusColors.borderDefault),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                        ),
                        onPressed: _showRejectDialog,
                        child: const Text('TỪ CHỐI', style: TextStyle(color: VDBusColors.textSecondary, fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 2,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          minimumSize: const Size(0, 52),
                          backgroundColor: VDBusColors.amberAction,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                          elevation: 2,
                        ),
                        onPressed: () {
                          _timer?.cancel();
                          Navigator.of(context).pop();
                          widget.onAccept();
                        },
                        child: const Text(
                          'NHẬN CHUYẾN NGAY',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
