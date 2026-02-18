'use client'

import { useEffect, useState } from 'react'
import { useNotification } from '@/components/notification'

export function BetaQualificationChecker() {
  const { showNotification, NotificationComponent } = useNotification()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (checked) return

    try {
      const applicationStr = localStorage.getItem('betaApplication')
      if (applicationStr) {
        const application = JSON.parse(applicationStr)
        const now = Date.now()
        const threeHours = 3 * 60 * 60 * 1000
        
        if (now - application.timestamp >= threeHours) {
          const qualified = localStorage.getItem('betaQualified')
          if (qualified !== 'true') {
            localStorage.setItem('betaQualified', 'true')
            showNotification('恭喜！您已成功获得 Beta 测试资格！', 'success')
          }
        }
      }
    } catch (err) {
      console.error('检查Beta资格失败:', err)
    }

    setChecked(true)
  }, [checked, showNotification])

  return NotificationComponent
}
