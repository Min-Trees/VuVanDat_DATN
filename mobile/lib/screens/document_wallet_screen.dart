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
    this.driverName = 'Nguyen Van Hai',
    this.vehiclePlate = '43C-189.24',
  });

  static const List<WalletDocument> sampleDocuments = [
    WalletDocument(
      title: 'Giay phep lai xe Hang FC',
      docNumber: 'GPLX-4301928471',
      issuer: 'So Giao thong Van tai Da Nang',
      expiryDate: '2029-08-20',
      daysRemaining: 1020,
      isVehicleDoc: false,
    ),
    WalletDocument(
      title: 'Giay chung nhan Kiem dinh ATKT & BVMT',
      docNumber: 'KD-4301S-19284',
      issuer: 'Trung tam Dang kiem 43-01S',
      expiryDate: '2026-11-10',
      daysRemaining: 9,
      isVehicleDoc: true,
    ),
    WalletDocument(
      title: 'Phu hieu Xe tai (Container)',
      docNumber: 'PH-43-2026-0812',
      issuer: 'So Giao thong Van tai Da Nang',
      expiryDate: '2031-04-15',
      daysRemaining: 1625,
      isVehicleDoc: true,
    ),
    WalletDocument(
      title: 'Bao hiem TNDS bat buoc chu xe co gioi',
      docNumber: 'BH-PTI-847291',
      issuer: 'Tong cong ty Bao hiem Buu dien (PTI)',
      expiryDate: '2027-01-15',
      daysRemaining: 75,
      isVehicleDoc: true,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Vi Giay to So & Dang kiem',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
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
                    'HO SO DIEN TU TAI XE & PHUONG TIEN',
                    style: TextStyle(
                      color: VDBusColors.textInverse,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    driverName,
                    style: const TextStyle(
                      color: VDBusColors.textInverse,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Phuong tien gan lien: $vehiclePlate',
                    style: const TextStyle(
                      color: VDBusColors.subtle,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: VDBusColors.primaryHover,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text(
                      'Che do ngoai tuyen: San sang xuat trinh cho CSGT / TTGT',
                      style: TextStyle(
                        color: VDBusColors.textInverse,
                        fontSize: 11,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            const Text(
              'Danh muc giay to luu hanh (4 hang muc)',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: VDBusColors.textPrimary,
              ),
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
              child: const Text(
                'Luu y phap ly: Can xuat trinh ban goc hoac giay to dien tu co gia tri phap ly theo Nghi dinh 10/2020/ND-CP khi duoc luc luong chuc nang yeu cau kiem tra.',
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
    );
  }

  Widget _buildDocCard(BuildContext context, WalletDocument doc) {
    Color badgeBg;
    Color badgeText;
    String badgeLabel;

    if (doc.daysRemaining <= 0) {
      badgeBg = VDBusColors.errorBg;
      badgeText = VDBusColors.errorText;
      badgeLabel = 'Het han';
    } else if (doc.daysRemaining <= 30) {
      badgeBg = VDBusColors.warningBg;
      badgeText = VDBusColors.warningText;
      badgeLabel = 'Sap het han (${doc.daysRemaining} ngay)';
    } else {
      badgeBg = VDBusColors.successBg;
      badgeText = VDBusColors.successText;
      badgeLabel = 'Hop le';
    }

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
                child: Text(
                  doc.title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: VDBusColors.textPrimary,
                  ),
                ),
              ),
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
            'So hieu: ${doc.docNumber}',
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              fontFamily: 'monospace',
              color: VDBusColors.primary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Co quan cap: ${doc.issuer}',
            style: const TextStyle(
              fontSize: 12,
              color: VDBusColors.textSecondary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Hieu luc den: ${doc.expiryDate}',
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: VDBusColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}
