import 'package:flutter/material.dart';
import '../core/theme/theme.dart';

class SignaturePad extends StatefulWidget {
  final ValueChanged<bool>? onSignatureChanged;

  const SignaturePad({
    super.key,
    this.onSignatureChanged,
  });

  @override
  State<SignaturePad> createState() => SignaturePadState();
}

class SignaturePadState extends State<SignaturePad> {
  final List<Offset?> _points = [];

  bool get hasSignature => _points.where((p) => p != null).isNotEmpty;

  void clear() {
    setState(() {
      _points.clear();
    });
    widget.onSignatureChanged?.call(false);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          height: 180,
          decoration: BoxDecoration(
            color: VDBusColors.surface,
            border: Border.all(color: VDBusColors.borderDefault, width: 1.5),
            borderRadius: BorderRadius.circular(4),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: GestureDetector(
              onPanStart: (details) {
                setState(() {
                  _points.add(details.localPosition);
                });
                widget.onSignatureChanged?.call(true);
              },
              onPanUpdate: (details) {
                setState(() {
                  _points.add(details.localPosition);
                });
              },
              onPanEnd: (_) {
                setState(() {
                  _points.add(null);
                });
              },
              child: CustomPaint(
                painter: _SignaturePainter(points: _points),
                size: Size.infinite,
              ),
            ),
          ),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Ky bang ngon tay vao khung ben tren',
              style: TextStyle(
                fontSize: 12,
                color: VDBusColors.textMuted,
              ),
            ),
            TextButton(
              onPressed: clear,
              style: TextButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                minimumSize: const Size(60, 36),
              ),
              child: const Text(
                'KY LAI',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: VDBusColors.primary,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _SignaturePainter extends CustomPainter {
  final List<Offset?> points;

  _SignaturePainter({required this.points});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = VDBusColors.textPrimary
      ..strokeCap = StrokeCap.round
      ..strokeWidth = 2.5;

    // Draw watermark baseline
    final linePaint = Paint()
      ..color = VDBusColors.borderSubtle
      ..strokeWidth = 1.0;
    canvas.drawLine(
      Offset(20, size.height - 35),
      Offset(size.width - 20, size.height - 35),
      linePaint,
    );

    for (int i = 0; i < points.length - 1; i++) {
      if (points[i] != null && points[i + 1] != null) {
        canvas.drawLine(points[i]!, points[i + 1]!, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _SignaturePainter oldDelegate) {
    return oldDelegate.points.length != points.length;
  }
}
