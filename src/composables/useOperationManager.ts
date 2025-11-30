import { ref } from 'vue'

export interface NotificationOptions {
  type?: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

export interface OperationManagerOptions {
  showUserNotifications?: boolean
  retryAttempts?: number
}

export function useOperationManager(options: OperationManagerOptions = {}) {
  const { showUserNotifications = true } = options
  
  const notifications = ref<Array<NotificationOptions & { id: string }>>([])

  const showNotification = (options: NotificationOptions) => {
    if (!showUserNotifications) return

    const notification = {
      ...options,
      id: Math.random().toString(36).substr(2, 9),
      duration: options.duration || 3000
    }

    notifications.value.push(notification)

    if (notification.duration) {
      setTimeout(() => {
        const index = notifications.value.findIndex(n => n.id === notification.id)
        if (index > -1) {
          notifications.value.splice(index, 1)
        }
      }, notification.duration)
    }
  }

  const showSuccess = (message: string) => {
    showNotification({ type: 'success', message })
  }

  const showError = (message: string) => {
    showNotification({ type: 'error', message })
  }

  const showWarning = (message: string) => {
    showNotification({ type: 'warning', message })
  }

  const showInfo = (message: string) => {
    showNotification({ type: 'info', message })
  }

  return {
    notifications,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}
