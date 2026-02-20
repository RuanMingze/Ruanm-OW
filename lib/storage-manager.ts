export class StorageManager {
  private static hasCookieConsent(): boolean {
    if (typeof window === 'undefined') return false
    const consent = localStorage.getItem('cookie-consent')
    return consent === 'accepted'
  }

  private static setCookie(name: string, value: string, days: number = 30): void {
    if (typeof window === 'undefined') return
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
  }

  private static getCookie(name: string): string | null {
    if (typeof window === 'undefined') return null
    const nameEQ = `${name}=`
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
  }

  static setItem(key: string, value: string, cookieDays: number = 30): void {
    if (typeof window === 'undefined') return
    
    localStorage.setItem(key, value)
    
    if (this.hasCookieConsent()) {
      this.setCookie(key, value, cookieDays)
    }
  }

  static getItem(key: string): string | null {
    if (typeof window === 'undefined') return null
    
    const localStorageValue = localStorage.getItem(key)
    
    if (this.hasCookieConsent()) {
      const cookieValue = this.getCookie(key)
      if (cookieValue !== null) {
        return cookieValue
      }
    }
    
    return localStorageValue
  }

  static removeItem(key: string): void {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem(key)
    
    if (this.hasCookieConsent()) {
      document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
    }
  }

  static clear(): void {
    if (typeof window === 'undefined') return
    
    localStorage.clear()
    
    if (this.hasCookieConsent()) {
      const cookies = document.cookie.split(';')
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i]
        const eqPos = cookie.indexOf('=')
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
      }
    }
  }

  static setJSON<T>(key: string, value: T, cookieDays: number = 30): void {
    const jsonValue = JSON.stringify(value)
    this.setItem(key, jsonValue, cookieDays)
  }

  static getJSON<T>(key: string): T | null {
    const value = this.getItem(key)
    if (value === null) return null
    try {
      return JSON.parse(value) as T
    } catch {
      return null
    }
  }
}
