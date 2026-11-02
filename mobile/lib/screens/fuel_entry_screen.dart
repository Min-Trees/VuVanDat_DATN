import 'package:flutter/material.dart';
import '../core/theme/theme.dart';
import '../core/sync/sync_queue.dart';

class FuelEntryScreen extends StatefulWidget {
  final String vehiclePlate;
  final String driverName;

  const FuelEntryScreen({
    super.key,
    this.vehiclePlate = '43C-189.24',
    this.driverName = 'Nguyễn Văn Tuấn',
  });

  @override
  State<FuelEntryScreen> createState() => _FuelEntryScreenState();
}

class _FuelEntryScreenState extends State<FuelEntryScreen> {
  final _formKey = GlobalKey<FormState>();
  final _odometerController = TextEditingController(text: '124500');
  final _litresController = TextEditingController(text: '120');
  final _unitPriceController = TextEditingController(text: '22000');
  final _stationController = TextEditingController(text: 'Petrolimex Cửa hàng 12 (Hòa Cầm)');
  bool _isSubmitted = false;
  String? _submittedSyncId;

  double get _totalVnd {
    final litres = double.tryParse(_litresController.text) ?? 0.0;
    final price = double.tryParse(_unitPriceController.text) ?? 0.0;
    return litres * price;
  }

  void _handleSubmit() {
    if (!_formKey.currentState!.validate()) return;

    final syncQueue = SyncQueueService();
    final item = syncQueue.enqueue(
      actionType: 'RECORD_FUEL_PURCHASE',
      payload: {
        'vehiclePlate': widget.vehiclePlate,
        'driverName': widget.driverName,
        'odometerKm': double.tryParse(_odometerController.text) ?? 0.0,
        'fuelLitre': double.tryParse(_litresController.text) ?? 0.0,
        'unitPriceVnd': double.tryParse(_unitPriceController.text) ?? 0.0,
        'totalAmountVnd': _totalVnd,
        'stationName': _stationController.text,
        'recordedAtUtc': DateTime.now().toUtc().toIso8601String(),
        'hasReceiptPhoto': true,
      },
    );

    setState(() {
      _isSubmitted = true;
      _submittedSyncId = item.id;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Đã ghi nhận hóa đơn xăng dầu vào hàng đợi đồng bộ: ${item.id}'),
        backgroundColor: VDBusColors.primary,
      ),
    );
  }

  @override
  void dispose() {
    _odometerController.dispose();
    _litresController.dispose();
    _unitPriceController.dispose();
    _stationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final formatCurrency = '${_totalVnd.toStringAsFixed(0)} VNĐ';

    return Scaffold(
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.local_gas_station_outlined, color: VDBusColors.primary, size: 22),
            SizedBox(width: 8),
            Text(
              'Ghi Nhận Đổ Xăng Dầu',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
          ],
        ),
        backgroundColor: VDBusColors.surface,
        foregroundColor: VDBusColors.textPrimary,
        elevation: 0,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Vehicle Info Bar
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: VDBusColors.subtle,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: VDBusColors.borderSubtle),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Phương tiện',
                            style: TextStyle(fontSize: 11, color: VDBusColors.textMuted),
                          ),
                          const SizedBox(height: 2),
                          Row(
                            children: [
                              const Icon(Icons.local_shipping, size: 16, color: VDBusColors.primary),
                              const SizedBox(width: 4),
                              Text(
                                widget.vehiclePlate,
                                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          const Text(
                            'Tài xế thực hiện',
                            style: TextStyle(fontSize: 11, color: VDBusColors.textMuted),
                          ),
                          const SizedBox(height: 2),
                          Row(
                            children: [
                              const Icon(Icons.person, size: 16, color: VDBusColors.textSecondary),
                              const SizedBox(width: 4),
                              Text(
                                widget.driverName,
                                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Form fields
                const Row(
                  children: [
                    Icon(Icons.speed, size: 16, color: VDBusColors.primary),
                    SizedBox(width: 6),
                    Text(
                      'Chỉ số Odometer (km đồng hồ)',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: VDBusColors.textPrimary),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _odometerController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    hintText: 'Ví dụ: 124500',
                    suffixText: 'km',
                  ),
                  validator: (v) => (v == null || v.isEmpty) ? 'Vui lòng nhập số km' : null,
                  onChanged: (_) => setState(() {}),
                ),
                const SizedBox(height: 14),

                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.water_drop_outlined, size: 16, color: VDBusColors.warningText),
                              SizedBox(width: 4),
                              Text(
                                'Số lít dầu thực đổ',
                                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: VDBusColors.textPrimary),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          TextFormField(
                            controller: _litresController,
                            keyboardType: const TextInputType.numberWithOptions(decimal: true),
                            decoration: const InputDecoration(
                              border: OutlineInputBorder(),
                              hintText: '120',
                              suffixText: 'Lít',
                            ),
                            validator: (v) => (v == null || v.isEmpty) ? 'Nhập số lít' : null,
                            onChanged: (_) => setState(() {}),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.payments_outlined, size: 16, color: VDBusColors.successText),
                              SizedBox(width: 4),
                              Text(
                                'Đơn giá (VNĐ/lít)',
                                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: VDBusColors.textPrimary),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          TextFormField(
                            controller: _unitPriceController,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(
                              border: OutlineInputBorder(),
                              hintText: '22000',
                              suffixText: 'đ',
                            ),
                            validator: (v) => (v == null || v.isEmpty) ? 'Nhập đơn giá' : null,
                            onChanged: (_) => setState(() {}),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                const Row(
                  children: [
                    Icon(Icons.storefront_outlined, size: 16, color: VDBusColors.primary),
                    SizedBox(width: 6),
                    Text(
                      'Tên cây xăng / Trạm bơm',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: VDBusColors.textPrimary),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _stationController,
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    hintText: 'Tên trạm xăng dầu Petrolimex, PVOIL...',
                  ),
                  validator: (v) => (v == null || v.isEmpty) ? 'Vui lòng nhập tên trạm' : null,
                ),
                const SizedBox(height: 16),

                // Total Amount preview card
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: VDBusColors.subtle,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: VDBusColors.borderDefault),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Tổng thanh tiền hóa đơn:',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                      ),
                      Text(
                        formatCurrency,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: VDBusColors.primary,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Receipt Photo Attachment Card
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: VDBusColors.surface,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: VDBusColors.borderSubtle),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.receipt_long, color: VDBusColors.primary, size: 28),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Ảnh hóa đơn VAT cây xăng',
                              style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                            ),
                            Text(
                              'Đã chụp ảnh hóa đơn từ camera (Mô phỏng đính kèm)',
                              style: TextStyle(fontSize: 11, color: VDBusColors.textSecondary),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: VDBusColors.successBg,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          'Đã đính kèm',
                          style: TextStyle(fontSize: 11, color: VDBusColors.successText, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Submit Button
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton.icon(
                    onPressed: _handleSubmit,
                    icon: const Icon(Icons.cloud_upload_outlined, size: 20),
                    label: const Text(
                      'Xác Nhận & Lưu Hàng Đợi Ngoại Tuyến',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: VDBusColors.primary,
                      foregroundColor: VDBusColors.textInverse,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ),

                if (_isSubmitted) ...[
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: VDBusColors.successBg,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: VDBusColors.successText),
                    ),
                    child: Text(
                      'Thành công: Đã đưa vào SyncQueue (ID: $_submittedSyncId). Dữ liệu sẽ tự động đồng bộ về TMS ngay khi có mạng 4G.',
                      style: const TextStyle(fontSize: 12, color: VDBusColors.successText),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
