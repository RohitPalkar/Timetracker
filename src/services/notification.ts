/**
 * Notification repository — in-memory mock implementation.
 */
import type { AppNotification } from '@/types/collaboration'
import { notificationStore } from './stores'
import { mockDelay } from './http'


export const notificationService = {
  async list(): Promise<AppNotification[]> {
    await mockDelay(250)
    return notificationStore.query({ sort: { field: 'createdAt', direction: 'desc' } }).items
  },

  async unreadCount(): Promise<number> {
    await mockDelay(100)
    return notificationStore.query({ filters: { read: false } }).total
  },

  async markRead(id: string): Promise<AppNotification> {
    await mockDelay(120)
    const updated = notificationStore.update(id, { read: true })
    if (!updated) throw new Error('Notification not found')
    return updated
  },

  async markAllRead(): Promise<void> {
    await mockDelay(150)
    for (const notification of notificationStore.all()) {
      notificationStore.update(notification.id, { read: true })
    }
  },
}