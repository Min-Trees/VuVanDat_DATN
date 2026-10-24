import 'package:flutter/material.dart';

class VDBusColors {
  // Brand Primary (Deep Blue)
  static const Color primary = Color(0xFF1E3A8A);
  static const Color primaryHover = Color(0xFF172554);
  static const Color primarySubtle = Color(0xFFEFF6FF);

  // Canvas & Surfaces
  static const Color canvas = Color(0xFFF8FAFC);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color subtle = Color(0xFFF1F5F9);

  // Text Colors (High contrast for sunlight readability)
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF475569);
  static const Color textMuted = Color(0xFF64748B);
  static const Color textInverse = Color(0xFFFFFFFF);

  // Borders
  static const Color borderSubtle = Color(0xFFE2E8F0);
  static const Color borderDefault = Color(0xFFCBD5E1);

  // Status Tints
  static const Color successBg = Color(0xFFF0FDF4);
  static const Color successText = Color(0xFF14532D);
  static const Color warningBg = Color(0xFFFFFBEB);
  static const Color warningText = Color(0xFF78350F);
  static const Color errorBg = Color(0xFFFEF2F2);
  static const Color errorText = Color(0xFF7F1D1D);
  static const Color infoBg = Color(0xFFEFF6FF);
  static const Color infoText = Color(0xFF1E3A8A);
  static const Color mockBg = Color(0xFFFEFCE8);
  static const Color mockText = Color(0xFF854D0E);
}

class VDBusTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: VDBusColors.canvas,
      colorScheme: const ColorScheme.light(
        primary: VDBusColors.primary,
        surface: VDBusColors.surface,
        error: VDBusColors.errorText,
      ),
      fontFamily: 'Roboto',
      appBarTheme: const AppBarTheme(
        backgroundColor: VDBusColors.surface,
        foregroundColor: VDBusColors.textPrimary,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: VDBusColors.textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
      ),
      // Enterprise Driver strict minimum 48dp button height
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          minimumSize: const Size.fromHeight(48),
          backgroundColor: VDBusColors.primary,
          foregroundColor: VDBusColors.textInverse,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(4),
          ),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size.fromHeight(48),
          foregroundColor: VDBusColors.textPrimary,
          side: const BorderSide(color: VDBusColors.borderDefault, width: 1),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(4),
          ),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: VDBusColors.surface,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(4),
          borderSide: const BorderSide(color: VDBusColors.borderDefault, width: 1),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(4),
          borderSide: const BorderSide(color: VDBusColors.borderDefault, width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(4),
          borderSide: const BorderSide(color: VDBusColors.primary, width: 1.5),
        ),
        labelStyle: const TextStyle(color: VDBusColors.textSecondary, fontSize: 14),
      ),
    );
  }
}
