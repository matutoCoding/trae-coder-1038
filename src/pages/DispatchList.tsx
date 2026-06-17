import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useStore } from '@/store'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import type { DispatchOrder } from '@/types'

const tabs = [
  { key: 'pending', label: '待接单' },
  { key: 'active', label: '进行中' },
  { key: 'completed', label: '已完成' },
]

const typeLabels: Record<string, string> = {
  half_monthly: '半月保',
  quarterly: '季度保',
  repair: '维修',
}

export default function DispatchList() {
  const navigate = useNavigate()
  const dispatchOrders = useStore((s) => s.dispatchOrders)
  const elevators = useStore((s) => s.elevators)
  const [activeTab, setActiveTab] = useState('pending')

  const filtered = dispatchOrders.filter((d) => {
    if (activeTab === 'pending') return d.status === 'pending'
    if (activeTab === 'active') return d.status === 'accepted' || d.status === 'in_progress'
    return d.status === 'completed'
  })

  return (
    <div className="min-h-screen bg-surface-50">
      <PageHeader
        title="维保派工"
        rightAction={
          <button onClick={() => navigate('/dispatch/new')}>
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
            <DispatchCard
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

function DispatchCard({
  order,
  elevator,
}: {
  order: DispatchOrder
  elevator?: { code: string; address: string }
}) {
  const navigate = useNavigate()
  const acceptDispatch = useStore((s) => s.acceptDispatch)

  return (
    <div
      className="rounded-card bg-white p-4 shadow-sm cursor-pointer"
      onClick={() => navigate(`/dispatch/${order.id}`)}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800">
          {elevator?.code ?? '-'}
        </span>
        <StatusBadge status={order.status} type="dispatch" />
      </div>
      <p className="mt-1 text-xs text-gray-500">{elevator?.address ?? '-'}</p>

      <div className="mt-2 flex items-center gap-2">
        <span className="rounded bg-primary-50 px-1.5 py-0.5 text-xs font-medium text-primary-500">
          {typeLabels[order.type] ?? order.type}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
        <span>维保工：{order.assigneeName}</span>
        <span>计划：{order.scheduledDate}</span>
      </div>

      <div className="mt-3 flex justify-end gap-2">
        {order.status === 'pending' && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              acceptDispatch(order.id)
            }}
            className="rounded-lg bg-primary-500 px-4 py-1.5 text-xs font-medium text-white"
          >
            接单
          </button>
        )}
        {(order.status === 'accepted' || order.status === 'in_progress') && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate('/checkin')
            }}
            className="rounded-lg bg-primary-500 px-4 py-1.5 text-xs font-medium text-white"
          >
            开始保养
          </button>
        )}
        {order.status === 'completed' && order.completedAt && (
          <span className="text-xs text-gray-400">
            完成于 {new Date(order.completedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  )
}
