import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useStore } from '@/store'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import type { RepairOrder } from '@/types'

const tabs = [
  { key: 'pending', label: '待处理' },
  { key: 'repairing', label: '处理中' },
  { key: 'completed', label: '已完成' },
]

const urgencyConfig: Record<string, { label: string; color: string }> = {
  low: { label: '低', color: 'bg-gray-100 text-gray-500' },
  medium: { label: '中', color: 'bg-orange-50 text-orange-500' },
  high: { label: '高', color: 'bg-danger-50 text-danger-500' },
}

export default function RepairList() {
  const navigate = useNavigate()
  const repairOrders = useStore((s) => s.repairOrders)
  const elevators = useStore((s) => s.elevators)
  const [activeTab, setActiveTab] = useState('pending')

  const filtered = repairOrders.filter((r) => {
    if (activeTab === 'pending') return r.status === 'submitted' || r.status === 'assigned'
    if (activeTab === 'repairing') return r.status === 'repairing'
    return r.status === 'completed'
  })

  return (
    <div className="min-h-screen bg-surface-50">
      <PageHeader
        title="故障报修"
        rightAction={
          <button onClick={() => navigate('/repair/new')}>
            <Plus size={22} className="text-primary-500" />
          </button>
        }
      />

      <div className="pt-12">
        <div className="px-4 pt-3">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 px-4 pt-4 pb-6">
          {filtered.map((order) => (
            <RepairCard
              key={order.id}
              order={order}
              elevator={elevators.find((e) => e.id === order.elevatorId)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-400">暂无数据</div>
          )}
        </div>
      </div>
    </div>
  )
}

function RepairCard({
  order,
  elevator,
}: {
  order: RepairOrder
  elevator?: { code: string; address: string }
}) {
  const navigate = useNavigate()
  const urgency = urgencyConfig[order.urgency]

  return (
    <div
      className="rounded-card bg-white p-4 shadow-sm cursor-pointer"
      onClick={() => navigate(`/repair/${order.id}`)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">{order.faultType}</span>
          <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${urgency.color}`}>
            {urgency.label}
          </span>
        </div>
        <StatusBadge status={order.status} type="repair" />
      </div>
      <p className="mt-1 text-xs text-gray-500 line-clamp-1">{order.faultDesc}</p>
      <p className="mt-1 text-xs text-gray-400">{elevator?.address ?? '-'}</p>
      <div className="mt-2 text-xs text-gray-400">
        {new Date(order.createdAt).toLocaleString()}
      </div>
    </div>
  )
}
