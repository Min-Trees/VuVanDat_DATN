import 'dart:convert';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static String get baseUrl {
    if (kIsWeb) return 'http://localhost:5000/api/v1';
    try {
      if (Platform.isAndroid) return 'http://10.0.2.2:5000/api/v1';
    } catch (_) {}
    return 'http://localhost:5000/api/v1';
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('vdbus_driver_token');
  }

  static Future<void> saveToken(String token, String fullName, String email, String role) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('vdbus_driver_token', token);
    await prefs.setString('vdbus_driver_name', fullName);
    await prefs.setString('vdbus_driver_email', email);
    await prefs.setString('vdbus_driver_role', role);
  }

  static Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('vdbus_driver_token');
    await prefs.remove('vdbus_driver_name');
    await prefs.remove('vdbus_driver_email');
    await prefs.remove('vdbus_driver_role');
  }

  static Future<Map<String, dynamic>?> login(String email, String password) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        final token = data['accessToken'] as String;
        final user = data['user'] as Map<String, dynamic>;
        await saveToken(token, user['fullName'] ?? 'Tài xế', user['email'] ?? email, user['role']?.toString() ?? '5');
        return data;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  static Future<Map<String, dynamic>?> getActiveTrip() async {
    final token = await getToken();
    if (token == null) return null;

    try {
      final res = await http.get(
        Uri.parse('$baseUrl/trips/driver/active'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (res.statusCode == 200) {
        return jsonDecode(res.body) as Map<String, dynamic>;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  static Future<bool> advanceTripStatus(String tripId, int targetStatus, String? reason) async {
    final token = await getToken();
    if (token == null) return false;

    try {
      final res = await http.post(
        Uri.parse('$baseUrl/trips/$tripId/advance-status'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'targetStatus': targetStatus,
          'reason': reason ?? 'Cập nhật tiến trình bởi tài xế',
        }),
      );

      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  static Future<bool> submitPod({
    required String orderId,
    required String tripId,
    required String recipientName,
    required String recipientPhone,
    required String signatureBase64,
    required String photoUrl,
    required double lat,
    required double lng,
    required String hashSha256,
    String? notes,
  }) async {
    final token = await getToken();
    if (token == null) return false;

    try {
      final res = await http.post(
        Uri.parse('$baseUrl/pod/submit'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'orderId': orderId,
          'tripId': tripId,
          'recipientName': recipientName,
          'recipientPhone': recipientPhone,
          'signatureBase64': signatureBase64,
          'photoUrl': photoUrl,
          'latitude': lat,
          'longitude': lng,
          'hashSha256': hashSha256,
          'notes': notes ?? 'Giao hàng thành công đầy đủ theo biên bản',
        }),
      );

      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}
