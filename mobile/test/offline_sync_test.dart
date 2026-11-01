import 'package:flutter_test/flutter_test.dart';
import 'package:vdbus_driver/core/sync/sync_queue.dart';

void main() {
  group('SyncQueueService Offline-First Tests', () {
    late SyncQueueService syncQueue;

    setUp(() {
      syncQueue = SyncQueueService();
      syncQueue.clearQueue();
    });

    test('generates deterministic idempotency key and enqueues action', () {
      final payload = {'tripId': 'trip-1', 'amount': 500000};
      final item = syncQueue.enqueue(
        actionType: 'CONFIRM_EPOD',
        payload: payload,
      );

      expect(item.id, isNotEmpty);
      expect(item.idempotencyKey, isNotEmpty);
      expect(item.actionType, equals('CONFIRM_EPOD'));
      expect(syncQueue.items.length, equals(1));
    });

    test('retains pending status when offline and flushes when reconnected', () async {
      syncQueue.setConnectivity(false);
      expect(syncQueue.isOnline, isFalse);

      final item1 = syncQueue.enqueue(
        actionType: 'RECORD_FUEL',
        payload: {'litres': 100, 'cost': 2200000},
      );
      final item2 = syncQueue.enqueue(
        actionType: 'SOS_EMERGENCY_BROADCAST',
        payload: {'lat': 16.0544, 'lng': 108.2022},
      );

      expect(syncQueue.pendingCount, equals(2));
      expect(item1.status, equals(SyncItemStatus.pending));
      expect(item2.status, equals(SyncItemStatus.pending));

      // Reconnect online
      syncQueue.setConnectivity(true);
      await syncQueue.flushQueue();

      expect(syncQueue.pendingCount, equals(0));
      expect(item1.status, equals(SyncItemStatus.synced));
      expect(item2.status, equals(SyncItemStatus.synced));
    });
  });
}
