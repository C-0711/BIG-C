/**
 * NotificationService - Send notifications from agents
 * Sprint 10.2 - Notifications
 */

import { EventBus } from '../events/EventBus';

export type NotificationChannel = 'ui' | 'email' | 'webhook' | 'push';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id: string;
  title: string;
  message: string;
  channel: NotificationChannel;
  priority: NotificationPriority;
  source: {
    type: 'agent' | 'skill' | 'system';
    id: string;
    name?: string;
  };
  data?: Record<string, unknown>;
  actions?: NotificationAction[];
  createdAt: number;
  readAt?: number;
  dismissedAt?: number;
}

export interface NotificationAction {
  id: string;
  label: string;
  action: 'link' | 'callback' | 'dismiss';
  url?: string;
  callbackEvent?: string;
}

export interface NotificationHandler {
  channel: NotificationChannel;
  send(notification: Notification): Promise<boolean>;
}

export interface NotificationServiceConfig {
  /** Default channel */
  defaultChannel?: NotificationChannel;
  /** Maximum stored notifications */
  maxStored?: number;
  /** Handlers for different channels */
  handlers?: NotificationHandler[];
}

export class NotificationService {
  private config: Required<NotificationServiceConfig>;
  private handlers: Map<NotificationChannel, NotificationHandler> = new Map();
  private notifications: Notification[] = [];
  private unreadCount = 0;

  constructor(config: NotificationServiceConfig = {}) {
    this.config = {
      defaultChannel: config.defaultChannel || 'ui',
      maxStored: config.maxStored || 100,
      handlers: config.handlers || [],
    };

    // Register provided handlers
    for (const handler of this.config.handlers) {
      this.registerHandler(handler);
    }

    // Register default UI handler
    if (!this.handlers.has('ui')) {
      this.registerHandler({
        channel: 'ui',
        send: async (notification) => {
          EventBus.emit('notification.ui', notification);
          return true;
        },
      });
    }
  }

  /**
   * Register a notification handler
   */
  registerHandler(handler: NotificationHandler): void {
    this.handlers.set(handler.channel, handler);
  }

  /**
   * Send a notification
   */
  async send(
    title: string,
    message: string,
    options: {
      channel?: NotificationChannel;
      priority?: NotificationPriority;
      source: { type: 'agent' | 'skill' | 'system'; id: string; name?: string };
      data?: Record<string, unknown>;
      actions?: NotificationAction[];
    }
  ): Promise<Notification> {
    const notification: Notification = {
      id: this.generateId(),
      title,
      message,
      channel: options.channel || this.config.defaultChannel,
      priority: options.priority || 'normal',
      source: options.source,
      data: options.data,
      actions: options.actions,
      createdAt: Date.now(),
    };

    // Store notification
    this.storeNotification(notification);

    // Send via handler
    const handler = this.handlers.get(notification.channel);
    if (handler) {
      try {
        await handler.send(notification);
        EventBus.emit('notification.sent', {
          id: notification.id,
          channel: notification.channel,
        });
      } catch (error) {
        EventBus.emit('notification.failed', {
          id: notification.id,
          channel: notification.channel,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return notification;
  }

  /**
   * Send notification from an agent
   */
  async sendFromAgent(
    agentId: string,
    agentName: string,
    title: string,
    message: string,
    options?: {
      channel?: NotificationChannel;
      priority?: NotificationPriority;
      data?: Record<string, unknown>;
      actions?: NotificationAction[];
    }
  ): Promise<Notification> {
    return this.send(title, message, {
      ...options,
      source: { type: 'agent', id: agentId, name: agentName },
    });
  }

  /**
   * Send notification from a skill
   */
  async sendFromSkill(
    skillId: string,
    skillName: string,
    title: string,
    message: string,
    options?: {
      channel?: NotificationChannel;
      priority?: NotificationPriority;
      data?: Record<string, unknown>;
    }
  ): Promise<Notification> {
    return this.send(title, message, {
      ...options,
      source: { type: 'skill', id: skillId, name: skillName },
    });
  }

  /**
   * Send system notification
   */
  async sendSystem(
    title: string,
    message: string,
    priority: NotificationPriority = 'normal'
  ): Promise<Notification> {
    return this.send(title, message, {
      priority,
      source: { type: 'system', id: 'system' },
    });
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): boolean {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (!notification || notification.readAt) return false;

    notification.readAt = Date.now();
    this.unreadCount = Math.max(0, this.unreadCount - 1);

    EventBus.emit('notification.read', { id: notificationId });

    return true;
  }

  /**
   * Mark all as read
   */
  markAllAsRead(): number {
    let count = 0;
    for (const notification of this.notifications) {
      if (!notification.readAt) {
        notification.readAt = Date.now();
        count++;
      }
    }
    this.unreadCount = 0;

    EventBus.emit('notification.all_read', { count });

    return count;
  }

  /**
   * Dismiss notification
   */
  dismiss(notificationId: string): boolean {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (!notification) return false;

    notification.dismissedAt = Date.now();
    if (!notification.readAt) {
      notification.readAt = Date.now();
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    }

    EventBus.emit('notification.dismissed', { id: notificationId });

    return true;
  }

  /**
   * Get all notifications
   */
  getAll(): Notification[] {
    return [...this.notifications];
  }

  /**
   * Get unread notifications
   */
  getUnread(): Notification[] {
    return this.notifications.filter(n => !n.readAt);
  }

  /**
   * Get unread count
   */
  getUnreadCount(): number {
    return this.unreadCount;
  }

  /**
   * Get notifications by source
   */
  getBySource(sourceType: 'agent' | 'skill' | 'system', sourceId?: string): Notification[] {
    return this.notifications.filter(n => {
      if (n.source.type !== sourceType) return false;
      if (sourceId && n.source.id !== sourceId) return false;
      return true;
    });
  }

  /**
   * Clear all notifications
   */
  clear(): void {
    this.notifications = [];
    this.unreadCount = 0;

    EventBus.emit('notification.cleared', {});
  }

  /**
   * Store notification with limit
   */
  private storeNotification(notification: Notification): void {
    this.notifications.unshift(notification);
    this.unreadCount++;

    while (this.notifications.length > this.config.maxStored) {
      const removed = this.notifications.pop();
      if (removed && !removed.readAt) {
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
    }
  }

  /**
   * Generate notification ID
   */
  private generateId(): string {
    return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}

/** Singleton instance */
export const notificationService = new NotificationService();
