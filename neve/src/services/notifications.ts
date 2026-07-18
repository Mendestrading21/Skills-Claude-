/**
 * Notification interface placeholder. No real scheduling is performed — the
 * app never presents fake real-time notifications. A concrete implementation
 * would require platform permissions and infrastructure.
 */
export interface NotificationService {
  readonly available: boolean;
  scheduleBudgetReminder(message: string): Promise<void>;
}

export class NoopNotificationService implements NotificationService {
  readonly available = false;
  async scheduleBudgetReminder(): Promise<void> {
    // Intentionally does nothing in local mode.
  }
}

export const notificationService: NotificationService = new NoopNotificationService();
