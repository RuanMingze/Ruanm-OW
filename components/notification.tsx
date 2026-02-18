'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, X } from 'lucide-react'

export interface NotificationProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onClose?: () => void
}

export function Notification({ message, type = 'success', duration = 5000, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)

    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose?.()
    }, 300)
  }

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-destructive' : 'bg-primary'
  const icon = type === 'success' ? <CheckCircle size={20} /> : null

  return (
    <div
      className={`fixed top-4 right-4 z-[100] max-w-md transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
    >
      <div className={`${bgColor} text-white rounded-lg shadow-lg p-4 flex items-start gap-3`}>
        {icon && <div className="flex-shrink-0 mt-0.5">{icon}</div>}
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
          aria-label="关闭通知"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}

export function useNotification() {
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error' | 'info'
  } | null>(null)

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type })
  }

  const closeNotification = () => {
    setNotification(null)
  }

  const NotificationComponent = notification ? (
    <Notification
      key={Date.now()}
      message={notification.message}
      type={notification.type}
      onClose={closeNotification}
    />
  ) : null

  return { showNotification, closeNotification, NotificationComponent }
}
