#!/usr/bin/env node

/**
 * Linter kiểm tra tuân thủ nguyên tắc Enterprise B2B SaaS:
 * 1. Tuyệt đối KHÔNG có Emoji trong mã nguồn giao diện (web, packages, mobile).
 * 2. Cấm hardcode mã màu hex/rgb/rgba trong các file UI (phải dùng design token / CSS variables).
 */

const fs = require('fs');
const path = require('path');

// Regex phát hiện Emoji phổ biến
const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]/u;

// Regex phát hiện hardcoded colors (#hex, rgb(), rgba())
const HARDCODED_COLOR_REGEX = /(#[0-9a-fA-F]{3,8}\b|rgba?\([^)]+\))/;

const ROOT_DIR = path.resolve(__dirname, '..');
const SCAN_DIRS = ['packages/design-system/src', 'web', 'mobile/lib'];
const IGNORE_FILES = ['tokens.css', 'theme.dart']; // Nơi duy nhất được định nghĩa token

let errorCount = 0;

function scanDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== 'build') {
        scanDirectory(fullPath);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (['.tsx', '.ts', '.jsx', '.js', '.dart', '.css'].includes(ext)) {
        checkFile(fullPath);
      }
    }
  }
}

function checkFile(filePath) {
  const fileName = path.basename(filePath);
  if (IGNORE_FILES.includes(fileName)) return;

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // 1. Kiểm tra Emoji
    if (EMOJI_REGEX.test(line)) {
      console.error(`[ERROR: EMOJI DETECTED] ${filePath}:${index + 1}`);
      console.error(`  > ${line.trim()}`);
      errorCount++;
    }

    // 2. Kiểm tra Hardcoded color trong JSX/TSX/CSS component (không áp dụng cho comment và file test)
    if (
      (filePath.endsWith('.tsx') || filePath.endsWith('.css') || filePath.endsWith('.dart')) &&
      !filePath.includes('.test.') &&
      !filePath.includes('.stories.') &&
      !line.trim().startsWith('//') &&
      !line.trim().startsWith('/*') &&
      !line.trim().startsWith('*')
    ) {
      // Cho phép 'transparent', 'currentColor', 'inherit'
      if (HARDCODED_COLOR_REGEX.test(line) && !line.includes('var(--vdbus-') && !line.includes('// allow-color')) {
        console.error(`[ERROR: HARDCODED COLOR] ${filePath}:${index + 1} - Phải sử dụng Design Token (var(--vdbus-*))`);
        console.error(`  > ${line.trim()}`);
        errorCount++;
      }
    }
  });
}

console.log('--- Đang quét vi phạm nguyên tắc giao diện Enterprise B2B SaaS ---');
for (const scanDir of SCAN_DIRS) {
  scanDirectory(path.join(ROOT_DIR, scanDir));
}

if (errorCount > 0) {
  console.error(`\n[ERROR] Phat hien ${errorCount} loi vi pham nguyen tac (Emoji / Hardcoded Color). Vui long sua lai!`);
  process.exit(1);
} else {
  console.log('[OK] Dat chuan: Khong co Emoji, khong co mau hardcode trong thanh phan giao dien.\n');
}
