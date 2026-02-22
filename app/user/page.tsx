'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, LogOut, ExternalLink, Settings, Shield, CheckCircle, Clock, Home, Edit2, X, AlertCircle } from 'lucide-react'
import bcrypt from 'bcryptjs'
import supabase from '@/lib/supabase'
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

const products: Record<string, string> = {
  paperstation: 'PaperStation 浏览器',
  screensaver: 'RuanmScreenSaver 屏保程序',
  toolbox: '阮铭泽工具箱',
  ai: '小R AI助手',
  search: 'ChickRubGo搜索引擎',
}

export default function UserCenterPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [betaQualified, setBetaQualified] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editAvatar, setEditAvatar] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteStep, setDeleteStep] = useState(1)
  const [confirmUsername, setConfirmUsername] = useState('')
  const [confirmPhrase, setConfirmPhrase] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [betaApplicationStatus, setBetaApplicationStatus] = useState<'approved' | 'rejected' | null>(null)
  const [showBetaStatusModal, setShowBetaStatusModal] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [changePasswordError, setChangePasswordError] = useState('')
  const [changePasswordSuccess, setChangePasswordSuccess] = useState('')

  useEffect(() => {
    setMounted(true)
    checkSession()
    checkBetaQualification()
  }, [])

  const checkSession = async () => {
    try {
      const userProfileStr = localStorage.getItem('userProfile')
      if (userProfileStr) {
        const userProfileData = JSON.parse(userProfileStr)
        setUserProfile(userProfileData)
        
        const mockUser = {
          id: userProfileData.id || 'local-user',
          email: userProfileData.email,
          user_metadata: {
            username: userProfileData.name
          }
        }
        setUser(mockUser)
        
        await checkBetaApplicationStatus(userProfileData.id)
        return
      }

      const { data } = await supabase.auth.getSession()
      const session = data?.session
      
      if (session?.user) {
        setUser(session.user)
        
        try {
          const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('email', session.user.email)
            .single()
          
          if (error) {
            console.warn('从user_profiles读取失败:', error)
            setUserProfile(null)
          } else {
            setUserProfile(profile)
            localStorage.setItem('userProfile', JSON.stringify(profile))
            await checkBetaApplicationStatus(profile.id)
          }
        } catch (profileError) {
          console.warn('从user_profiles读取失败，使用默认方式:', profileError)
          setUserProfile(null)
        }
      } else {
        console.log('未找到会话，重新登录...')
      }
    } catch (err) {
      console.error('获取用户信息失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkBetaApplicationStatus = async (userId: number) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('beta_applications, has_beta_access')
        .eq('id', userId)
        .single()

      if (error) throw error

      if (profile?.beta_applications) {
        if (profile.beta_applications.status === 'approved' && !profile.has_beta_access) {
          setBetaApplicationStatus('approved')
          setShowBetaStatusModal(true)
        } else if (profile.beta_applications.status === 'rejected') {
          setBetaApplicationStatus('rejected')
          setShowBetaStatusModal(true)
        }
      }
    } catch (err) {
      console.error('检查Beta申请状态失败:', err)
    }
  }

  const checkBetaQualification = async () => {
    try {
      const userProfileStr = localStorage.getItem('userProfile')
      if (userProfileStr) {
        const userProfileData = JSON.parse(userProfileStr)
        
        // 从数据库重新读取has_beta_access，而不是从localStorage读取
        try {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('has_beta_access')
            .eq('id', userProfileData.id)
            .single()
          
          if (profile?.has_beta_access) {
            setBetaQualified(true)
            // 更新localStorage中的has_beta_access
            userProfileData.has_beta_access = true
            localStorage.setItem('userProfile', JSON.stringify(userProfileData))
          } else {
            setBetaQualified(false)
            // 更新localStorage中的has_beta_access
            userProfileData.has_beta_access = false
            localStorage.setItem('userProfile', JSON.stringify(userProfileData))
          }
        } catch (err) {
          console.warn('从数据库读取has_beta_access失败，使用localStorage中的值:', err)
          if (userProfileData.has_beta_access) {
            setBetaQualified(true)
          }
        }
        return
      }

      const { data } = await supabase.auth.getSession()
      const session = data?.session
      
      if (session?.user?.email) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('has_beta_access')
          .eq('email', session.user.email)
          .single()
        
        if (profile?.has_beta_access) {
          setBetaQualified(true)
        }
      }
    } catch (err) {
      console.error('检查Beta资格失败:', err)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      
      localStorage.clear()
      document.cookie.split(';').forEach(cookie => {
        const eqPos = cookie.indexOf('=')
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
      })
      
      setUser(null)
      setUserProfile(null)
      setBetaQualified(false)
      
      setTimeout(() => {
        router.push(`${basePath}/`)
      }, 100)
    } catch (err) {
      console.error('登出失败:', err)
    }
  }

  const handleEditClick = () => {
    setEditName(userProfile?.name || user?.user_metadata?.username || user?.email?.split('@')[0] || '')
    setEditAvatar(userProfile?.avatar_url || '')
    setSaveError('')
    setIsEditing(true)
  }

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      setSaveError('用户名不能为空')
      return
    }

    setIsSaving(true)
    setSaveError('')

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          name: editName.trim(),
          avatar_url: editAvatar.trim() || null,
        })
        .eq('email', user.email)

      if (error) throw error

      const { data: updatedProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', user.email)
        .single()

      setUserProfile(updatedProfile)
      setIsEditing(false)
    } catch (err: any) {
      console.error('保存用户信息失败:', err)
      setSaveError('保存失败：' + (err.message || '未知错误'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setSaveError('')
  }

  const handleChangePassword = async () => {
    setChangePasswordError('')
    setChangePasswordSuccess('')

    if (!currentPassword.trim()) {
      setChangePasswordError('请输入当前密码')
      return
    }

    if (!newPassword.trim()) {
      setChangePasswordError('请输入新密码')
      return
    }

    if (newPassword.length < 6) {
      setChangePasswordError('新密码长度至少6位')
      return
    }

    if (newPassword !== confirmPassword) {
      setChangePasswordError('两次输入的新密码不一致')
      return
    }

    if (currentPassword === newPassword) {
      setChangePasswordError('新密码不能与当前密码相同')
      return
    }

    setIsChangingPassword(true)

    try {
      const userProfileStr = localStorage.getItem('userProfile')
      if (userProfileStr) {
        const userProfileData = JSON.parse(userProfileStr)

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('hashed_password')
          .eq('id', userProfileData.id)
          .single()

        if (!profile?.hashed_password) {
          throw new Error('未找到用户密码信息')
        }

        const passwordMatch = await bcrypt.compare(currentPassword, profile.hashed_password)
        if (!passwordMatch) {
          throw new Error('当前密码不正确')
        }

        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(newPassword.trim(), saltRounds)

        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ hashed_password: hashedPassword })
          .eq('id', userProfileData.id)

        if (updateError) throw updateError

        const { error: authError } = await supabase.auth.updateUser({
          password: newPassword.trim()
        })

        if (authError && authError.message !== 'Auth session missing!') {
          console.warn('更新Supabase Auth密码失败:', authError)
        }

        setChangePasswordSuccess('密码修改成功！')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')

        setTimeout(() => {
          setShowChangePassword(false)
          setChangePasswordSuccess('')
        }, 2000)
      }
    } catch (err: any) {
      console.error('修改密码失败:', err)
      setChangePasswordError('修改密码失败：' + (err.message || '未知错误'))
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleCancelChangePassword = () => {
    setShowChangePassword(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setChangePasswordError('')
    setChangePasswordSuccess('')
  }

  const handleDeleteUser = async () => {
    setIsDeleting(true)
    setDeleteError('')
    
    try {
      const currentUsername = userProfile?.name || user?.user_metadata?.username || user?.email?.split('@')[0]
      
      if (confirmUsername !== currentUsername) {
        throw new Error('用户名输入不正确')
      }
      
      if (confirmPhrase !== '注销我的用户') {
        throw new Error('确认短语输入不正确')
      }

      const { error: deleteError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('email', user.email)

      if (deleteError) throw deleteError

      await supabase.auth.signOut()
      
      // 只有当user来自真实的session时，才尝试删除Auth用户
      // mockUser的id是整数，不是UUID，不能用于deleteUser
      if (user && user.id && typeof user.id === 'string' && user.id.length === 36) {
        const { error: authError } = await supabase.auth.admin.deleteUser(user.id)
        if (authError) {
          console.warn('删除Auth用户失败（权限问题）:', authError)
        }
      }

      router.push(`${basePath}/login`)
    } catch (err: any) {
      console.error('删除用户失败:', err)
      setDeleteError('删除用户失败：' + (err.message || '未知错误'))
    } finally {
      setIsDeleting(false)
    }
  }

  const handleNextStep = () => {
    setDeleteError('')
    
    if (deleteStep === 1) {
      setDeleteStep(2)
    } else if (deleteStep === 2) {
      const currentUsername = userProfile?.name || user?.user_metadata?.username || user?.email?.split('@')[0]
      if (confirmUsername !== currentUsername) {
        setDeleteError('用户名输入不正确')
        return
      }
      setDeleteStep(3)
    }
  }

  const handlePrevStep = () => {
    setDeleteError('')
    if (deleteStep > 1) {
      setDeleteStep(deleteStep - 1)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
    setDeleteStep(1)
    setConfirmUsername('')
    setConfirmPhrase('')
    setDeleteError('')
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-6 py-32">
      <div className="mx-auto max-w-4xl">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">
              用户中心
            </h1>
            <p className="text-muted-foreground">
              管理您的账户和访问权限
            </p>
          </div>

          <div className="flex flex-col items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-primary/10 relative">
              {userProfile?.avatar_url ? (
                <img
                  src={userProfile.avatar_url}
                  alt="用户头像"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const fallback = target.parentElement?.querySelector('.fallback-avatar')
                    if (fallback) {
                      (fallback as HTMLElement).style.display = 'flex'
                    }
                  }}
                />
              ) : null}
              <div className={`fallback-avatar absolute inset-0 flex items-center justify-center ${userProfile?.avatar_url ? 'hidden' : 'flex'}`}>
                <User size={48} className="text-primary" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">用户名</p>
              <p className="text-2xl font-bold text-primary">
                {userProfile?.name || user?.user_metadata?.username || user?.email?.split('@')[0] || '未知用户'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {user?.email || '未绑定邮箱'}
              </p>
              {userProfile && (
                <div className="mt-4 flex gap-4 justify-center">
                  <button
                    onClick={handleEditClick}
                    className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <Edit2 size={16} />
                    编辑资料
                  </button>
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <Settings size={16} />
                    修改密码
                  </button>
                </div>
              )}
            </div>
          </div>

          {isEditing && userProfile && (
            <div className="mb-8 bg-muted/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <Edit2 size={20} />
                编辑用户资料
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-primary mb-2">
                    用户名
                  </label>
                  <input
                    id="edit-name"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="请输入用户名"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="edit-avatar" className="block text-sm font-medium text-primary mb-2">
                    头像 URL（可选）
                  </label>
                  <input
                    id="edit-avatar"
                    type="text"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    placeholder="请输入头像图片链接"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                  />
                </div>
                {saveError && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive text-center">
                      {saveError}
                    </p>
                  </div>
                )}
                <div className="flex gap-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                        保存中...
                      </>
                    ) : (
                      '保存'
                    )}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-primary hover:bg-accent transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <X size={18} />
                    取消
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <Shield size={20} />
                Beta 测试
              </h2>
              {betaQualified ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle size={20} />
                    <span className="font-medium">已获得 Beta 测试资格</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    恭喜您！您已成功获得 Beta 测试资格，可以开始体验最新功能了。
                  </p>
                  <a
                    href={`${basePath}/products`}
                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700 transition-all duration-300"
                  >
                    <ExternalLink size={18} />
                    访问 Beta 应用
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    申请我们的 Beta 测试资格，抢先体验最新功能
                  </p>
                  <a
                    href={`${basePath}/beta`}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-300"
                  >
                    <ExternalLink size={18} />
                    申请 Beta 测试
                  </a>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border">
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <a
                  href={`${basePath}/`}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-primary hover:bg-accent transition-all duration-300"
                >
                  <Home size={18} />
                  返回主页
                </a>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-6 py-3 text-sm font-medium text-destructive hover:bg-destructive/20 transition-all duration-300"
                >
                  <LogOut size={18} />
                  退出登录
                </button>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-destructive px-6 py-3 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-all duration-300"
              >
                <X size={18} />
                注销账号
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>© 2026 Ruanm Studio. 用户体验至上的好产品</p>
        </div>
      </div>

      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-primary mb-4">
              修改密码
            </h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="current-password" className="block text-sm font-medium text-primary mb-2">
                  当前密码
                </label>
                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="请输入当前密码"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-primary mb-2">
                  新密码（至少6位）
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="请输入新密码"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-primary mb-2">
                  确认新密码
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="请再次输入新密码"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                />
              </div>

              {changePasswordError && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive text-center">
                    {changePasswordError}
                  </p>
                </div>
              )}

              {changePasswordSuccess && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-600 text-center">
                    {changePasswordSuccess}
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleCancelChangePassword}
                  disabled={isChangingPassword}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-primary hover:bg-accent transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  取消
                </button>

                <button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isChangingPassword ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                      修改中...
                    </>
                  ) : (
                    '确认修改'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-primary mb-4">
              确认退出登录
            </h3>
            
            <p className="text-muted-foreground mb-6">
              您确定要退出登录吗？
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-primary hover:bg-accent transition-all duration-300"
              >
                取消
              </button>
              
              <button
                onClick={handleLogout}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-300"
              >
                <LogOut size={18} />
                确认退出
              </button>
            </div>
          </div>
        </div>
      )}

      {showBetaStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full mx-4">
            {betaApplicationStatus === 'approved' ? (
              <>
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle size={32} className="text-green-500" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-primary mb-4 text-center">
                  申请成功！
                </h3>
                <p className="text-muted-foreground mb-6 text-center">
                  恭喜您！您的Beta测试申请已通过审核，现在可以开始体验最新功能了。
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowBetaStatusModal(false)}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-primary hover:bg-accent transition-all duration-300"
                  >
                    关闭
                  </button>
                  <a
                    href={`${basePath}/products`}
                    onClick={() => setShowBetaStatusModal(false)}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-300"
                  >
                    访问Beta应用
                  </a>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                    <X size={32} className="text-red-500" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-primary mb-4 text-center">
                  申请被撤回
                </h3>
                <p className="text-muted-foreground mb-6 text-center">
                  很抱歉，您的Beta测试申请已被撤回。您可以重新提交申请。
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowBetaStatusModal(false)}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-primary hover:bg-accent transition-all duration-300"
                  >
                    关闭
                  </button>
                  <a
                    href={`${basePath}/beta`}
                    onClick={() => setShowBetaStatusModal(false)}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-300"
                  >
                    重新申请
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-primary mb-4">
              {deleteStep === 1 && '确认注销'}
              {deleteStep === 2 && '验证身份'}
              {deleteStep === 3 && '最终确认'}
            </h3>
            
            {deleteError && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg mb-6">
                <p className="text-sm text-destructive">
                  {deleteError}
                </p>
              </div>
            )}

            {deleteStep === 1 && (
              <div className="mb-6 space-y-4">
                <p className="text-muted-foreground">
                  您确定要注销当前账号吗？
                </p>
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-sm text-destructive font-medium flex items-center gap-2">
                    <AlertCircle size={16} />
                    重要提示
                  </p>
                  <p className="text-sm text-destructive mt-2">
                    此操作将删除您在系统中的所有数据，且无法恢复。请谨慎操作！
                  </p>
                </div>
              </div>
            )}

            {deleteStep === 2 && (
              <div className="mb-6 space-y-4">
                <p className="text-muted-foreground">
                  请输入您的用户名以验证身份：
                </p>
                <div>
                  <label htmlFor="confirm-username" className="block text-sm font-medium text-primary mb-2">
                    用户名
                  </label>
                  <input
                    id="confirm-username"
                    type="text"
                    value={confirmUsername}
                    onChange={(e) => setConfirmUsername(e.target.value)}
                    placeholder="请输入您的用户名"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    onPaste={(e) => e.preventDefault()}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    注意：此输入框禁止粘贴操作
                  </p>
                </div>
              </div>
            )}

            {deleteStep === 3 && (
              <div className="mb-6 space-y-4">
                <p className="text-muted-foreground">
                  请输入以下确认短语：
                </p>
                <div className="bg-muted/50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-primary">
                    注销我的用户
                  </p>
                </div>
                <div>
                  <label htmlFor="confirm-phrase" className="block text-sm font-medium text-primary mb-2">
                    确认短语
                  </label>
                  <input
                    id="confirm-phrase"
                    type="text"
                    value={confirmPhrase}
                    onChange={(e) => setConfirmPhrase(e.target.value)}
                    placeholder="请输入上面的确认短语"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    onPaste={(e) => e.preventDefault()}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    注意：此输入框禁止粘贴操作
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              {deleteStep > 1 && (
                <button
                  onClick={handlePrevStep}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-primary hover:bg-accent transition-all duration-300"
                >
                  上一步
                </button>
              )}
              
              <button
                onClick={handleCancelDelete}
                className={`${deleteStep > 1 ? 'flex-1' : 'flex-1'} inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-primary hover:bg-accent transition-all duration-300`}
              >
                取消
              </button>
              
              {deleteStep < 3 ? (
                <button
                  onClick={handleNextStep}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-300"
                >
                  下一步
                </button>
              ) : (
                <button
                  onClick={handleDeleteUser}
                  disabled={isDeleting}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-destructive px-6 py-3 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-destructive-foreground border-t-transparent rounded-full animate-spin"></div>
                      处理中...
                    </>
                  ) : (
                    "确认注销"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
