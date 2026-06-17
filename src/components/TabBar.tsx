import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Building2, ClipboardList, Siren, User } from 'lucide-react'

const tabs = [
  { path: '/', label: '首页', icon: Home },
  { path: '/elevators', label: '台账', icon: Building2 },
  { path: '/dispatch', label: '派工', icon: ClipboardList },
  { path: '/rescue', label: '救援', icon: Siren },
  { path: '/profile', label: '我的', icon: User },
]

export default function TabBar() {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = isActive(tab.path)
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center justify-center flex-1 h-full gap-0.5"
            >
              <Icon
                size={22}
                className={active ? 'text-primary-500' : 'text-gray-400'}
              />
              <span
                className={`text-xs ${active ? 'text-primary-500' : 'text-gray-400'}`}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
