import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Building2,
  ClipboardList,
  ScanLine,
  Wrench,
  Siren,
  CalendarCheck,
  BarChart3,
  Award,
  FileText,
  Clock,
} from 'lucide-react'
import { useStore } from '@/store'

const shortcuts = [
  { icon: Building2, label: '电梯台账', path: '/elevators' },
  { icon: ClipboardList, label: '维保派工', path: '/dispatch' },
  { icon: ScanLine, label: '保养打卡', path: '/checkin' },
  { icon: Wrench, label: '故障报修', path: '/repair' },
  { icon: Siren, label: '困人救援', path: '/rescue' },
  { icon: CalendarCheck, label: '年检管理', path: '/inspection' },
  { icon: BarChart3, label: '绩效统计', path: '/performance' },
  { icon: Award, label: '人员持证', path: '/certificates' },
]

export default function Home() {
  const navigate = useNavigate()
  const currentUser = useStore((s) => s.currentUser)
  const notifications = useStore((s) => s.notifications)
  const dispatchOrders = useStore((s) => s.dispatchOrders)
  const rescueOrders = useStore((s) => s.rescueOrders)
  const contracts = useStore((s) => s.contracts)

  const pendingCount = dispatchOrders.filter((d) => d.status === 'pending').length
  const activeRescueCount = rescueOrders.filter((r) => r.status !== 'closed').length
  const expiringContractCount = contracts.filter((c) => c.status === 'expiring').length
  const unreadCount = notifications.filter((n) => !n.read).length
  const recentNotifications = notifications.slice(0, 3)

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-5 pb-6 pt-12 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">你好</p>
            <p className="text-xl font-bold">{currentUser?.name ?? '用户'}</p>
          </div>
          <button className="relative rounded-full p-2 transition-colors hover:bg-white/10">
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-danger-500" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-5 px-4 py-5">
        <div className="flex gap-3 -mt-10">
          <StatCard label="待办工单" value={pendingCount} color="safety" />
          <StatCard label="紧急救援" value={activeRescueCount} color="danger" />
          <StatCard label="合同到期" value={expiringContractCount} color="safety" />
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">快捷功能</h2>
          <div className="grid grid-cols-4 gap-y-5">
            {shortcuts.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-1.5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50">
                  <item.icon className="h-5 w-5 text-primary-500" />
                </div>
                <span className="text-xs text-gray-600">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">最近通知</h2>
          <div className="space-y-3">
            {recentNotifications.map((n) => (
              <div key={n.id} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50">
                  <FileText className="h-4 w-4 text-primary-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-gray-800">{n.title}</p>
                    {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-danger-500" />}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>{n.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: 'safety' | 'danger' }) {
  const bgMap = { safety: 'bg-safety-50', danger: 'bg-danger-50' }
  const textMap = { safety: 'text-safety-500', danger: 'text-danger-500' }
  const iconBgMap = { safety: 'bg-safety-100', danger: 'bg-danger-100' }

  return (
    <div className={`flex-1 rounded-xl ${bgMap[color]} p-3`}>
      <p className={`text-2xl font-bold ${textMap[color]}`}>{value}</p>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  )
}
