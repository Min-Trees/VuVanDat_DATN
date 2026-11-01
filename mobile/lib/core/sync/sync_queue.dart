import 'dart:async';
import 'dart:convert';
import 'package:crypto/crypto.dart';

enum SyncItemStatus {
  pending,
  synced,
  failed,
}

class SyncQueueItem {
  final String id;
  final String idempotencyKey;
  final String actionType;
  final Map<String, dynamic> payload;
  final DateTime createdAtUtc;
  SyncItemStatus status;
  int retryCount;
  String? errorMessage;

  SyncQueueItem({
    required this.id,
    required this.idempotencyKey,
    required this.actionType,
    required this.payload,
    required this.createdAtUtc,
    this.status = SyncItemStatus.pending,
    this.retryCount = 0,
    this.errorMessage,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'idempotencyKey': idempotencyKey,
    'actionType': actionType,
    'payload': payload,
    'createdAtUtc': createdAtUtc.toIso8601String(),
    'status': status.name,
    'retryCount': retryCount,
    'errorMessage': errorMessage,
  };

  factory SyncQueueItem.fromJson(Map<String, dynamic> json) {
    return SyncQueueItem(
      id: json['id'] as String,
      idempotencyKey: json['idempotencyKey'] as String,
      actionType: json['actionType'] as String,
      payload: Map<String, dynamic>.from(json['payload'] as Map),
      createdAtUtc: DateTime.parse(json['createdAtUtc'] as String),
      status: SyncItemStatus.values.firstWhere(
        (e) => e.name == json['status'],
        orElse: () => SyncItemStatus.pending,
      ),
      retryCount: json['retryCount'] as int? ?? 0,
      errorMessage: json['errorMessage'] as String?,
    );
  }
}

class SyncQueueService {
  static final SyncQueueService _instance = SyncQueueService._internal();
  factory SyncQueueService() => _instance;
  SyncQueueService._internal();

  final List<SyncQueueItem> _queue = [];
  bool _isOnline = true;

  bool get isOnline => _isOnline;
  List<SyncQueueItem> get items => List.unmodifiable(_queue);
  int get pendingCount => _queue.where((i) => i.status == SyncItemStatus.pending).length;

  void setConnectivity(bool online) {
    _isOnline = online;
    if (_isOnline) {
      flushQueue();
    }
  }

  String generateIdempotencyKey(String actionType, Map<String, dynamic> payload) {
    final raw = '$actionType-${jsonEncode(payload)}-${DateTime.now().millisecondsSinceEpoch}';
    final bytes = utf8.encode(raw);
    return sha256.convert(bytes).toString().substring(0, 32);
  }

  SyncQueueItem enqueue({
    required String actionType,
    required Map<String, dynamic> payload,
  }) {
    final idempotencyKey = generateIdempotencyKey(actionType, payload);
    final item = SyncQueueItem(
      id: 'sync-${DateTime.now().microsecondsSinceEpoch}',
      idempotencyKey: idempotencyKey,
      actionType: actionType,
      payload: payload,
      createdAtUtc: DateTime.now().toUtc(),
      status: SyncItemStatus.pending,
    );

    _queue.add(item);

    if (_isOnline) {
      _processItem(item);
    }

    return item;
  }

  Future<void> flushQueue() async {
    final pendings = _queue.where((i) => i.status == SyncItemStatus.pending).toList();
    for (final item in pendings) {
      await _processItem(item);
    }
  }

  Future<void> _processItem(SyncQueueItem item) async {
    if (!_isOnline) return;

    try {
      // Simulate network roundtrip and backend processing
      await Future.delayed(const Duration(milliseconds: 10));
      item.status = SyncItemStatus.synced;
    } catch (e) {
      item.retryCount++;
      item.errorMessage = e.toString();
      if (item.retryCount > 3) {
        item.status = SyncItemStatus.failed;
      }
    }
  }

  void clearQueue() {
    _queue.clear();
  }
}
