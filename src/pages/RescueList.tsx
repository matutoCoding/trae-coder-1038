import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, AlertTriangle } from 'lucide-react'
import { useStore } from '@/store'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import Timer from '@/components/Timer'
import type { RescueOrder } from '@/types'

const tabs = [
  { key: 'active', label: '进行中' },
  { key: 'closed', label: '已关闭' },
]

export default function RescueList() {
  const navigate = useNavigate()
  const rescueOrders = useStore((s) => s.rescueOrders)
  const elevators = useStore((s) => s.elevators)
  const users = useStore((s) => s.users)
  const activeRescueTimer = useStore((s) => s.activeRescueTimer)
  const [activeTab, setActiveTab] = useState('active')

  const filtered = rescueOrders.filter((r) => {
    if (activeTab === 'active') return ['dispatched', 'en_route', 'arrived'].includes(r.status)
    return ['rescued', 'closed'].includes(r.status)
  })

  const handleNewRescue = () => {
    const elevator = elevators[0]
    const worker = users.find((u) => u.role === 'worker')
    if (!elevator || !worker) return
    const newOrder: RescueOrder = {
      id: `res-${Date.now()}`,
      elevatorId: elevator.id,
      trappedFloor: Math.floor(Math.random() * elevator.floorCount) + 1,
      trappedCount: Math.floor(Math.random() * 3) + 1,
      elevatorStatus: '困人',
      status: 'dispatched',
      assigneeId: worker.id,
      assigneeName: worker.name,
      createdAt: new Date().toISOString(),
    }
    const store = useStore.getState()
    const nextRescueOrders = [...store.rescueOrders, newOrder]
    useStore.setState({ rescueOrders: nextRescueOrders })
    const persistData = { ...store, rescueOrders: nextRescueOrders }
    try { localStorage.setItem('elevator-maintenance-app', JSON.stringify(persistData)) } catch {}
    navigate(`/rescue/${newOrder.id}`)
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <PageHeader title="困人救援" />

      <div className="pt-12">
        <div className="px-4 pt-3">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-danger-500 text-white'
                    : 'bg-white text-gray-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 px-4 pt-4 pb-20">
          {filtered.map((order) => (
            <RescueCard
              key={order.id}
              order={order}
              elevator={elevators.find((e) => e.id === order.elevatorId)}
              timerActive={activeRescueTimer?.orderId === order.id}
              timerStart={activeRescueTimer?.startTime}
            />
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-400">暂无数据</div>
          )}
        </div>
      </div>

      <button
        onClick={handleNewRescue}
        className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full bg-danger-500 px-5 py-3 text-sm font-medium text-white shadow-lg"
      >
        <AlertTriangle size={18} />
        新增救援
      </button>
    </div>
  )
}

function RescueCard({
  order,
  elevator,
  timerActive,
  timerStart,
}: {
  order: RescueOrder
  elevator?: { code: string; address: string }
  timerActive: boolean
  timerStart?: number
}) {
  const navigate = useNavigate()

  return (
    <div
      className="rounded-card bg-white p-4 shadow-sm cursor-pointer"
      onClick={() => navigate(`/rescue/${order.id}`)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-danger-500" />
          <span className="text-sm font-semibold text-gray-800">
            {order.trappedFloor}F · {order.trappedCount}人被困
          </span>
        </div>
        <StatusBadge status={order.status} type="rescue" />
      </div>
      <p className="mt-1 text-xs text-gray-400">{elevator?.address ?? '-'}</p>
      <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
        <span>{new Date(order.createdAt).toLocaleString()}</span>
        {timerActive && timerStart && <Timer startTime={timerStart} isDanger />}
      </div>
    </div>
  )
}
