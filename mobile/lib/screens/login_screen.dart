import 'package:flutter/material.dart';
import '../core/theme/theme.dart';
import '../services/api_service.dart';
import 'driver_main_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController(text: 'driver.tuan@vdbus.vn');
  final _passwordController = TextEditingController(text: 'AdminPassword123!');
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleLogin() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      setState(() {
        _errorMessage = 'Vui lòng nhập đầy đủ tài khoản và mật khẩu.';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final res = await ApiService.login(email, password);

    if (!mounted) return;
    setState(() {
      _isLoading = false;
    });

    if (res != null) {
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const DriverMainScreen()),
      );
    } else {
      // Local fallback for offline mode or demo
      if (email.contains('driver')) {
        await ApiService.saveToken('vdbus_offline_token', 'Nguyễn Văn Tuấn', email, '5');
        if (!mounted) return;
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const DriverMainScreen()),
        );
      } else {
        setState(() {
          _errorMessage = 'Tài khoản hoặc mật khẩu không chính xác.';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: VDBusColors.bgCanvas,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(VDBusSpace.lg),
            child: Container(
              constraints: const BoxConstraints(maxWidth: 420),
              padding: const EdgeInsets.all(VDBusSpace.xl),
              decoration: BoxDecoration(
                color: VDBusColors.bgSurface,
                borderRadius: BorderRadius.circular(VDBusRadius.md),
                border: Border.all(color: VDBusColors.borderSubtle),
                boxShadow: const [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 10,
                    offset: Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // App Brand Header
                  const Center(
                    child: Icon(
                      Icons.local_shipping,
                      size: 48,
                      color: VDBusColors.primary,
                    ),
                  ),
                  const SizedBox(height: VDBusSpace.md),
                  const Text(
                    'VDBUS DRIVER',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.2,
                      color: VDBusColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: VDBusSpace.xs),
                  const Text(
                    'Hệ thống Điều vận & Buồng lái Tài xế B2B',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 13,
                      color: VDBusColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: VDBusSpace.xl),

                  if (_errorMessage != null)
                    Container(
                      padding: const EdgeInsets.all(VDBusSpace.md),
                      margin: const EdgeInsets.only(bottom: VDBusSpace.lg),
                      decoration: BoxDecoration(
                        color: VDBusColors.errorBg,
                        borderRadius: BorderRadius.circular(VDBusRadius.sm),
                        border: Border.all(color: VDBusColors.errorText.withValues(alpha: 0.3)),
                      ),
                      child: Text(
                        _errorMessage!,
                        style: const TextStyle(
                          color: VDBusColors.errorText,
                          fontSize: 13,
                        ),
                      ),
                    ),

                  // Email / Driver Code
                  const Text(
                    'Tài khoản tài xế',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: VDBusColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    decoration: InputDecoration(
                      hintText: 'driver.tuan@vdbus.vn',
                      prefixIcon: const Icon(Icons.person_outline, size: 20),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(VDBusRadius.sm),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                    ),
                  ),
                  const SizedBox(height: VDBusSpace.lg),

                  // Password
                  const Text(
                    'Mật khẩu',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: VDBusColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _passwordController,
                    obscureText: true,
                    decoration: InputDecoration(
                      hintText: 'Nhập mật khẩu',
                      prefixIcon: const Icon(Icons.lock_outline, size: 20),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(VDBusRadius.sm),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                    ),
                  ),
                  const SizedBox(height: VDBusSpace.xl),

                  // Login Button
                  ElevatedButton.icon(
                    onPressed: _isLoading ? null : _handleLogin,
                    icon: _isLoading
                        ? const SizedBox.shrink()
                        : const Icon(Icons.login, size: 20),
                    label: _isLoading
                        ? const SizedBox(
                            width: 22,
                            height: 22,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Text(
                            'ĐĂNG NHẬP VÀO CA',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                          ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: VDBusColors.primary,
                      foregroundColor: Colors.white,
                      minimumSize: const Size.fromHeight(50),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(VDBusRadius.sm),
                      ),
                      elevation: 0,
                    ),
                  ),
                  const SizedBox(height: VDBusSpace.md),

                  // Fast Test Login Button
                  OutlinedButton.icon(
                    onPressed: () {
                      _emailController.text = 'driver.tuan@vdbus.vn';
                      _passwordController.text = 'AdminPassword123!';
                      _handleLogin();
                    },
                    icon: const Icon(Icons.flash_on, size: 18),
                    label: const Text('Đăng nhập nhanh: Tài xế Tuấn (43C-189.24)'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: VDBusColors.textSecondary,
                      minimumSize: const Size.fromHeight(44),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(VDBusRadius.sm),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
