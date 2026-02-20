'use client'

import { useEffect, useState } from 'react'
import { useNotification } from '@/components/notification'
import supabase from '@/lib/supabase'

export function BetaQualificationChecker() {
  const { showNotification, NotificationComponent } = useNotification()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (checked) return

    const checkAndGrantBetaAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.user?.email) {
          setChecked(true)
          return
        }

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('has_beta_access')
          .eq('email', session.user.email)
          .single()
        
        if (profile?.has_beta_access) {
          const qualified = localStorage.getItem('betaQualified')
          if (qualified !== 'true') {
            localStorage.setItem('betaQualified', 'true')
            showNotification('恭喜！您已成功获得 Beta 测试资格！', 'success')
          }
        }
      } catch (err) {
        console.error('检查Beta资格失败:', err)
      }

      setChecked(true)
    }

    checkAndGrantBetaAccess()
  }, [checked, showNotification])

  return NotificationComponent
}
