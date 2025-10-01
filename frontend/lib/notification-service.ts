// Система мгновенных уведомлений для всех действий
interface Notification {
  id: string
  type: "friend_request" | "friend_accepted" | "message" | "call" | "group_invite"
  fromUserId: string
  toUserId: string
  data: any
  timestamp: number
}

class NotificationService {
  private listeners: Map<string, ((notification: Notification) => void)[]> = new Map()
  private activeNotifications: Map<string, Notification> = new Map()

  // Подписка на уведомления
  subscribe(userId: string, callback: (notification: Notification) => void) {
    if (!this.listeners.has(userId)) {
      this.listeners.set(userId, [])
    }
    this.listeners.get(userId)!.push(callback)

    console.log("🔔 User subscribed to notifications:", userId)

    return () => {
      const userListeners = this.listeners.get(userId)
      if (userListeners) {
        const index = userListeners.indexOf(callback)
        if (index > -1) {
          userListeners.splice(index, 1)
        }
      }
    }
  }

  // Отправка уведомления
  private notify(userId: string, notification: Notification) {
    const userListeners = this.listeners.get(userId)
    if (userListeners && userListeners.length > 0) {
      console.log("🔔 Sending notification to user:", userId, notification.type)
      userListeners.forEach((callback) => callback(notification))
    } else {
      console.log("🔔 No active listeners for user:", userId, "- storing notification")
      // Сохраняем уведомление для получения позже
      this.activeNotifications.set(`${userId}_${notification.id}`, notification)
    }
  }

  // Отправка запроса дружбы
  sendFriendRequest(fromUserId: string, toUserId: string, fromUserInfo: any) {
    const notificationId = `friend_req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const notification: Notification = {
      id: notificationId,
      type: "friend_request",
      fromUserId,
      toUserId,
      data: {
        fromUser: fromUserInfo,
        message: `${fromUserInfo.name} (@${fromUserInfo.login}) хочет добавить вас в друзья`,
      },
      timestamp: Date.now(),
    }

    console.log("👥 Sending friend request notification:", fromUserInfo.login, "->", toUserId)

    // Мгновенно отправляем уведомление
    setTimeout(() => {
      this.notify(toUserId, notification)
    }, 100)

    return notificationId
  }

  // Принятие запроса дружбы
  acceptFriendRequest(requestId: string, fromUserId: string, toUserId: string, toUserInfo: any) {
    const notification: Notification = {
      id: `friend_acc_${Date.now()}`,
      type: "friend_accepted",
      fromUserId: toUserId,
      toUserId: fromUserId,
      data: {
        fromUser: toUserInfo,
        message: `${toUserInfo.name} (@${toUserInfo.login}) принял ваш запрос дружбы`,
      },
      timestamp: Date.now(),
    }

    console.log("✅ Friend request accepted:", toUserInfo.login, "->", fromUserId)

    // Уведомляем отправителя запроса
    setTimeout(() => {
      this.notify(fromUserId, notification)
    }, 100)

    // Удаляем исходный запрос
    this.activeNotifications.delete(`${toUserId}_${requestId}`)
  }

  // Получение непрочитанных уведомлений
  getUnreadNotifications(userId: string): Notification[] {
    const notifications: Notification[] = []

    for (const [key, notification] of this.activeNotifications.entries()) {
      if (key.startsWith(`${userId}_`)) {
        notifications.push(notification)
      }
    }

    return notifications.sort((a, b) => b.timestamp - a.timestamp)
  }

  // Отметка уведомления как прочитанного
  markAsRead(userId: string, notificationId: string) {
    this.activeNotifications.delete(`${userId}_${notificationId}`)
  }
}

export const notificationService = new NotificationService()
