'use client'

import { useEffect } from 'react'

interface ActiveUser {
  sessionId: string
  lastActive: string
}

interface AlertConfig {
  enabled: boolean
  threshold: number
  timeoutMinutes: number
}

const DEFAULT_CONFIG: AlertConfig = {
  enabled: true,
  threshold: 130,
  timeoutMinutes: 5
}

export function VisitMonitor() {
  useEffect(() => {
    const config = loadConfig()
    if (!config.enabled) return

    const sessionId = generateSessionId()
    const now = new Date()
    const timeoutStart = new Date(now.getTime() - config.timeoutMinutes * 60 * 1000)

    const activeUsers = loadActiveUsers()
    
    const currentActiveUsers = activeUsers.filter(u => {
      const lastActive = new Date(u.lastActive)
      return lastActive >= timeoutStart
    })

    const userExists = currentActiveUsers.some(u => u.sessionId === sessionId)
    
    if (!userExists) {
      currentActiveUsers.push({
        sessionId,
        lastActive: now.toISOString()
      })
    } else {
      const userIndex = currentActiveUsers.findIndex(u => u.sessionId === sessionId)
      currentActiveUsers[userIndex].lastActive = now.toISOString()
    }

    saveActiveUsers(currentActiveUsers)

    console.log(`[访问监控] 当前时间: ${now.toLocaleString('zh-CN')}`)
    console.log(`[访问监控] 超时时间: ${config.timeoutMinutes}分钟`)
    console.log(`[访问监控] 同时在线用户: ${currentActiveUsers.length}人`)
    console.log(`[访问监控] 报警阈值: ${config.threshold}人`)

    if (currentActiveUsers.length >= config.threshold) {
      console.warn(`[访问警告] 当前同时在线用户达到${currentActiveUsers.length}人，超过阈值${config.threshold}人！`)
    }

    const cleanupInactiveUsers = () => {
      const allKeys = Object.keys(localStorage)
      const activeUserKeys = allKeys.filter(k => k.startsWith('activeUser_'))
      
      activeUserKeys.forEach(key => {
        const userData = localStorage.getItem(key)
        if (userData) {
          try {
            const user: ActiveUser = JSON.parse(userData)
            const lastActive = new Date(user.lastActive)
            
            if (lastActive < timeoutStart) {
              localStorage.removeItem(key)
            }
          } catch (err) {
            localStorage.removeItem(key)
          }
        }
      })
    }

    cleanupInactiveUsers()

    const heartbeatInterval = setInterval(() => {
      const now = new Date()
      const users = loadActiveUsers()
      const userIndex = users.findIndex(u => u.sessionId === sessionId)
      
      if (userIndex !== -1) {
        users[userIndex].lastActive = now.toISOString()
        saveActiveUsers(users)
      }
    }, 60000)

    return () => {
      clearInterval(heartbeatInterval)
    }

  }, [])

  const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const loadConfig = (): AlertConfig => {
    try {
      const saved = localStorage.getItem('visitMonitorConfig')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (err) {
      console.warn('加载监控配置失败:', err)
    }
    return DEFAULT_CONFIG
  }

  const loadActiveUsers = (): ActiveUser[] => {
    const users: ActiveUser[] = []
    const allKeys = Object.keys(localStorage)
    const activeUserKeys = allKeys.filter(k => k.startsWith('activeUser_'))
    
    activeUserKeys.forEach(key => {
      const userData = localStorage.getItem(key)
      if (userData) {
        try {
          const user: ActiveUser = JSON.parse(userData)
          users.push(user)
        } catch (err) {
          console.warn('解析用户数据失败:', err)
        }
      }
    })
    
    return users
  }

  const saveActiveUsers = (users: ActiveUser[]) => {
    const allKeys = Object.keys(localStorage)
    const activeUserKeys = allKeys.filter(k => k.startsWith('activeUser_'))
    
    activeUserKeys.forEach(key => {
      localStorage.removeItem(key)
    })
    
    users.forEach(user => {
      localStorage.setItem(`activeUser_${user.sessionId}`, JSON.stringify(user))
    })
  }

  return null
}