import 'package:flutter/material.dart';
import '../core/theme/theme.dart';
import '../core/sync/sync_queue.dart';

class FuelEntryScreen extends StatefulWidget {
  final String vehiclePlate;
  final String driverName;

  const FuelEntryScreen({
    super.key,
    this.vehiclePlate = '43C-189.24',
    this.driverName = 'Nguyen Van Hai',
  });

  @override
  State<FuelEntryScreen> createState() => _FuelEntryScreenState();
}

class _FuelEntryScreenState extends State<FuelEntryScreen> {
  final _formKey = GlobalKey<FormState>();
  final _odometerController = TextEditingController(text: '124500');
  final _litresController = TextEditingController(text: '120');
  final _unitPriceController = TextEditingController(text: '22000');
  final _stationController = TextEditingController(text: 'Petrolimex Cua hang 12 (Hoa Cam)');
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
        content: Text('Da ghi nhan hoa don xang dau vao hang doi dong bo: ${item.id}'),
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
    final formatCurrency = '${_totalVnd.toStringAsFixed(0)} VND';

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Ghi Nhan Do Xang Dau',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
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
                            'Phuong tien',
                            style: TextStyle(fontSize: 11, color: VDBusColors.textMuted),
                          ),
                          Text(
                            widget.vehiclePlate,
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          const Text(
                            'Tai xe thuc hien',
                            style: TextStyle(fontSize: 11, color: VDBusColors.textMuted),
                          ),
                          Text(
                            widget.driverName,
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Form fields
                const Text(
                  'Chi so Odometer (km dong ho)',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: VDBusColors.textPrimary),
                ),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _odometerController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    hintText: 'Vi du: 124500',
                    suffixText: 'km',
                  ),
                  validator: (v) => (v == null || v.isEmpty) ? 'Vui long nhap so km' : null,
                  onChanged: (_) => setState(() {}),
                ),
                const SizedBox(height: 14),

                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'So lit dau thuc do',
                            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: VDBusColors.textPrimary),
                          ),
                          const SizedBox(height: 6),
                          TextFormField(
                            controller: _litresController,
                            keyboardType: const TextInputType.numberWithOptions(decimal: true),
                            decoration: const InputDecoration(
                              border: OutlineInputBorder(),
                              hintText: '120',
                              suffixText: 'Lit',
                            ),
                            validator: (v) => (v == null || v.isEmpty) ? 'Nhap so lit' : null,
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
                          const Text(
                            'Don gia (VND/lit)',
                            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: VDBusColors.textPrimary),
                          ),
                          const SizedBox(height: 6),
                          TextFormField(
                            controller: _unitPriceController,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(
                              border: OutlineInputBorder(),
                              hintText: '22000',
                              suffixText: 'd',
                            ),
                            validator: (v) => (v == null || v.isEmpty) ? 'Nhap don gia' : null,
                            onChanged: (_) => setState(() {}),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                const Text(
                  'Ten cay xang / Tram bom',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: VDBusColors.textPrimary),
                ),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _stationController,
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    hintText: 'Ten tram xang dau Petrolimex, PVOIL...',
                  ),
                  validator: (v) => (v == null || v.isEmpty) ? 'Vui long nhap ten tram' : null,
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
                        'Tong thanh tien hoa don:',
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
                              'Anh hoa don VAT cay xang',
                              style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                            ),
                            Text(
                              'Da chup anh hoa don tu camera (Mo phong dinh kem)',
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
                          'Da dinh kem',
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
                  child: ElevatedButton(
                    onPressed: _handleSubmit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: VDBusColors.primary,
                      foregroundColor: VDBusColors.textInverse,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    child: const Text(
                      'Xac Nhan & Luu Hang Doi Ngoai Tuyen',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
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
                      'Thanh cong: Da dua vao SyncQueue (ID: $_submittedSyncId). Du lieu se tu dong dong bo ve TMS ngay khi co mang 4G.',
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
