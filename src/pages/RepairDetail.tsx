import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useStore } from '@/store'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'

const urgencyConfig: Record<string, { label: string; color: string }> = {
  low: { label: '低', color: 'bg-gray-100 text-gray-500' },
  medium: { label: '中', color: 'bg-orange-50 text-orange-500' },
  high: { label: '高', color: 'bg-danger-50 text-danger-500' },
}

export default function RepairDetail() {
  const { id } = useParams<{ id: string }>()
  const repairOrders = useStore((s) => s.repairOrders)
  const elevators = useStore((s) => s.elevators)
  const users = useStore((s) => s.users)
  const updateRepairStatus = useStore((s) => s.updateRepairStatus)
  const assignRepair = useStore((s) => s.assignRepair)

  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState('')

  const order = repairOrders.find((r) => r.id === id)
  const elevator = elevators.find((e) => e.id === order?.elevatorId)
  const workers = users.filter((u) => u.role === 'worker')

  if (!order) {
    return (
      <div className="min-h-screen bg-surface-50">
        <PageHeader title="工单详情" showBack />
        <div className="pt-16 text-center text-sm text-gray-400">工单不存在</div>
      </div>
    )
  }

  const urgency = urgencyConfig[order.urgency]

  const handleAssign = () => {
    if (!selectedWorker) return
    const worker = workers.find((w) => w.id === selectedWorker)
    if (worker) {
      assignRepair(order.id, worker.id, worker.name)
      setShowAssignModal(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <PageHeader title="工单详情" showBack />

      <div className="pt-12 px-4 pb-24 space-y-3">
        <div className="rounded-card bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">{elevator?.code ?? '-'}</span>
            <StatusBadge status={order.status} type="repair" />
          </div>
          <p className="mt-1 text-xs text-gray-500">{elevator?.address ?? '-'}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-gray-500">{order.faultType}</span>
            <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${urgency.color}`}>
              {urgency.label}
            </span>
          </div>
        </div>

        <div className="rounded-card bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-800">处理进度</h3>
          <div className="space-y-4">
            {order.timeline.map((item, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      index === order.timeline.length - 1
                        ? 'bg-primary-500 ring-4 ring-primary-100'
                        : 'bg-gray-300'
                    }`}
                  />
                  {index < order.timeline.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gray-200" />
                  )}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium text-gray-800">{item.action}</p>
                  <p className="text-xs text-gray-400">{item.operator}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(item.time).toLocaleString()}
                  </p>
                  {item.remark && (
                    <p className="mt-1 text-xs text-gray-500">{item.remark}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 max-w-lg mx-auto">
        {order.status === 'submitted' && (
          <button
            onClick={() => setShowAssignModal(true)}
            className="w-full rounded-lg bg-primary-500 py-3 text-sm font-medium text-white"
          >
            分配维修人员
          </button>
        )}
        {order.status === 'assigned' && (
          <button
            onClick={() => updateRepairStatus(order.id, 'repairing')}
            className="w-full rounded-lg bg-primary-500 py-3 text-sm font-medium text-white"
          >
            开始维修
          </button>
        )}
        {order.status === 'repairing' && (
          <button
            onClick={() => updateRepairStatus(order.id, 'completed')}
            className="w-full rounded-lg bg-success-500 py-3 text-sm font-medium text-white"
          >
            完成维修
          </button>
        )}
      </div>

      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-t-2xl bg-white p-4 pb-8">
            <h3 className="mb-3 text-base font-semibold text-gray-800">分配维修人员</h3>
            <select
              value={selectedWorker}
              onChange={(e) => setSelectedWorker(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            >
              <option value="">请选择维修人员</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 rounded-lg bg-gray-100 py-2.5 text-sm font-medium text-gray-500"
              >
                取消
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedWorker}
                className="flex-1 rounded-lg bg-primary-500 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
