import { useStore } from '@/store'
import PageHeader from '@/components/PageHeader'
import type { Notification } from '@/types'

const typeGroups = [
  { key: 'rescue', label: '救援通知' },
  { key: 'dispatch', label: '派工提醒' },
  { key: 'contract', label: '合同到期' },
  { key: 'inspection', label: '年检提醒' },
  { key: 'system', label: '系统通知' },
] as const

const typeColors: Record<string, string> = {
  rescue: 'bg-danger-50 text-danger-500',
  dispatch: 'bg-primary-50 text-primary-500',
  contract: 'bg-safety-50 text-safety-500',
  inspection: 'bg-primary-50 text-primary-500',
  system: 'bg-gray-100 text-gray-500',
}

export default function Notifications() {
  const notifications = useStore((s) => s.notifications)
  const markNotificationRead = useStore((s) => s.markNotificationRead)

  const grouped = typeGroups.map((group) => ({
    ...group,
    items: notifications.filter((n) => n.type === group.key),
  })).filter((g) => g.items.length > 0)

  const handleClick = (id: string, read: boolean) => {
    if (!read) markNotificationRead(id)
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <PageHeader title="消息通知" showBack />

      <div className="pt-12 px-4 pb-6 space-y-5">
        {grouped.map((group) => (
          <div key={group.key}>
            <p className="text-xs font-medium text-gray-400 mb-2">{group.label}</p>
            <div className="space-y-2">
              {group.items.map((n) => (
                <NotificationCard
                  key={n.id}
                  notification={n}
                  typeColor={typeColors[n.type] ?? 'bg-gray-100 text-gray-500'}
                  onClick={() => handleClick(n.id, n.read)}
                />
              ))}
            </div>
          </div>
        ))}
        {grouped.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">暂无消息</div>
        )}
      </div>
    </div>
  )
}

function NotificationCard({
  notification,
  typeColor,
  onClick,
}: {
  notification: Notification
  typeColor: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-card bg-white p-4 shadow-sm text-left"
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${typeColor}`}>
          <span className="text-xs font-medium">{notification.type.charAt(0).toUpperCase()}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-gray-800">{notification.title}</p>
            {!notification.read && (
              <span className="h-2 w-2 shrink-0 rounded-full bg-danger-500" />
            )}
          </div>
          <p className="mt-1 truncate text-xs text-gray-500">{notification.content}</p>
          <p className="mt-1 text-xs text-gray-400">{notification.time}</p>
        </div>
      </div>
    </button>
  )
}
