import 'package:flutter/material.dart';
import '../core/theme/theme.dart';

class WalletDocument {
  final String title;
  final String docNumber;
  final String issuer;
  final String expiryDate;
  final int daysRemaining;
  final bool isVehicleDoc;

  const WalletDocument({
    required this.title,
    required this.docNumber,
    required this.issuer,
    required this.expiryDate,
    required this.daysRemaining,
    required this.isVehicleDoc,
  });
}

class DocumentWalletScreen extends StatelessWidget {
  final String driverName;
  final String vehiclePlate;

  const DocumentWalletScreen({
    super.key,
    this.driverName = 'Nguyễn Văn Tuấn',
    this.vehiclePlate = '43C-189.24',
  });

  static const List<WalletDocument> sampleDocuments = [
    WalletDocument(
      title: 'Giấy phép lái xe hạng FC',
      docNumber: 'GPLX-4301928471',
      issuer: 'Sở Giao thông Vận tải TP. Đà Nẵng',
      expiryDate: '2029-08-20',
      daysRemaining: 1020,
      isVehicleDoc: false,
    ),
    WalletDocument(
      title: 'Giấy chứng nhận Kiểm định ATKT & BVMT',
      docNumber: 'KD-4301S-19284',
      issuer: 'Trung tâm Đăng kiểm 43-01S',
      expiryDate: '2026-11-10',
      daysRemaining: 9,
      isVehicleDoc: true,
    ),
    WalletDocument(
      title: 'Phù hiệu Xe tải (Container)',
      docNumber: 'PH-43-2026-0812',
      issuer: 'Sở Giao thông Vận tải TP. Đà Nẵng',
      expiryDate: '2031-04-15',
      daysRemaining: 1625,
      isVehicleDoc: true,
    ),
    WalletDocument(
      title: 'Bảo hiểm TNDS bắt buộc chủ xe cơ giới',
      docNumber: 'BH-PTI-847291',
      issuer: 'Tổng công ty Cổ phần Bảo hiểm Bưu điện (PTI)',
      expiryDate: '2027-01-15',
      daysRemaining: 75,
      isVehicleDoc: true,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.badge_outlined, color: VDBusColors.primary, size: 22),
            SizedBox(width: 8),
            Text(
              'Ví Giấy tờ Số & Đăng kiểm',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
          ],
        ),
        backgroundColor: VDBusColors.surface,
        foregroundColor: VDBusColors.textPrimary,
        elevation: 0,
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Driver Profile Header Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: VDBusColors.primary,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'HỒ SƠ ĐIỆN TỬ TÀI XẾ & PHƯƠNG TIỆN',
                    style: TextStyle(
                      color: VDBusColors.textInverse,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.person, color: VDBusColors.textInverse, size: 24),
                      const SizedBox(width: 8),
                      Text(
                        driverName,
                        style: const TextStyle(
                          color: VDBusColors.textInverse,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.local_shipping_outlined, color: VDBusColors.subtle, size: 18),
                      const SizedBox(width: 6),
                      Text(
                        'Phương tiện gắn liền: $vehiclePlate',
                        style: const TextStyle(
                          color: VDBusColors.subtle,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: VDBusColors.primaryHover,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.wifi_off, size: 14, color: VDBusColors.textInverse),
                        SizedBox(width: 6),
                        Text(
                          'Chế độ ngoại tuyến: Sẵn sàng xuất trình cho CSGT / TTGT',
                          style: TextStyle(
                            color: VDBusColors.textInverse,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            const Row(
              children: [
                Icon(Icons.folder_outlined, size: 18, color: VDBusColors.primary),
                SizedBox(width: 6),
                Text(
                  'Danh mục giấy tờ lưu hành (4 hạng mục)',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: VDBusColors.textPrimary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            ...sampleDocuments.map((doc) => _buildDocCard(context, doc)),

            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: VDBusColors.subtle,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: VDBusColors.borderSubtle),
              ),
              child: const Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.info_outline, size: 18, color: VDBusColors.textSecondary),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Lưu ý pháp lý: Cần xuất trình bản gốc hoặc giấy tờ điện tử có giá trị pháp lý theo Nghị định 10/2020/NĐ-CP khi được lực lượng chức năng yêu cầu kiểm tra.',
                      style: TextStyle(
                        fontSize: 12,
                        color: VDBusColors.textSecondary,
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDocCard(BuildContext context, WalletDocument doc) {
    Color badgeBg;
    Color badgeText;
    String badgeLabel;

    if (doc.daysRemaining <= 0) {
      badgeBg = VDBusColors.errorBg;
      badgeText = VDBusColors.errorText;
      badgeLabel = 'Hết hạn';
    } else if (doc.daysRemaining <= 30) {
      badgeBg = VDBusColors.warningBg;
      badgeText = VDBusColors.warningText;
      badgeLabel = 'Sắp hết hạn (${doc.daysRemaining} ngày)';
    } else {
      badgeBg = VDBusColors.successBg;
      badgeText = VDBusColors.successText;
      badgeLabel = 'Hợp lệ';
    }

    IconData cardIcon = doc.isVehicleDoc ? Icons.description_outlined : Icons.badge_outlined;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: VDBusColors.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: doc.daysRemaining <= 30 ? VDBusColors.warningText : VDBusColors.borderSubtle,
          width: doc.daysRemaining <= 30 ? 1.5 : 1.0,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    Icon(cardIcon, size: 18, color: VDBusColors.primary),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        doc.title,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: VDBusColors.textPrimary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: badgeBg,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  badgeLabel,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: badgeText,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Số hiệu: ${doc.docNumber}',
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              fontFamily: 'monospace',
              color: VDBusColors.primary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Cơ quan cấp: ${doc.issuer}',
            style: const TextStyle(
              fontSize: 12,
              color: VDBusColors.textSecondary,
            ),
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              const Icon(Icons.event_outlined, size: 14, color: VDBusColors.textSecondary),
              const SizedBox(width: 4),
              Text(
                'Hiệu lực đến: ${doc.expiryDate}',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: VDBusColors.textPrimary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
