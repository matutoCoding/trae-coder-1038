import { useNavigate } from 'react-router-dom'
import { ChevronRight, Bell, Award, FileText, Info } from 'lucide-react'
import { useStore } from '@/store'

const roleLabels: Record<string, string> = {
  admin: '管理员',
  dispatcher: '调度员',
  worker: '维保工',
}

const menuItems = [
  { icon: Bell, label: '消息通知', path: '/notifications' },
  { icon: Award, label: '人员持证', path: '/certificates' },
  { icon: FileText, label: '合同到期', path: '/contracts' },
  { icon: Info, label: '关于系统', path: '' },
]

export default function Profile() {
  const navigate = useNavigate()
  const currentUser = useStore((s) => s.currentUser)
  const logout = useStore((s) => s.logout)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const firstChar = currentUser?.name?.charAt(0) ?? '?'

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-5 pb-8 pt-14 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold">
            {firstChar}
          </div>
          <div>
            <p className="text-lg font-bold">{currentUser?.name ?? '用户'}</p>
            <span className="mt-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-xs">
              {roleLabels[currentUser?.role ?? ''] ?? currentUser?.role}
            </span>
            <p className="mt-1 text-sm opacity-80">{currentUser?.phone ?? ''}</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-3">
        <div className="rounded-card bg-white shadow-sm divide-y divide-gray-100">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => item.path && navigate(item.path)}
              className="flex w-full items-center justify-between px-4 py-3.5"
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} className="text-primary-500" />
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="w-full rounded-lg bg-danger-500 py-3 text-sm font-medium text-white"
        >
          退出登录
        </button>
      </div>
    </div>
  )
}
