import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'

const typeLabels: Record<string, string> = {
  half_monthly: '半月保',
  quarterly: '季度保',
  repair: '维修',
}

export default function DispatchDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatchOrders = useStore((s) => s.dispatchOrders)
  const elevators = useStore((s) => s.elevators)
  const acceptDispatch = useStore((s) => s.acceptDispatch)
  const completeDispatch = useStore((s) => s.completeDispatch)
  const updateMaintenanceItem = useStore((s) => s.updateMaintenanceItem)

  const order = dispatchOrders.find((d) => d.id === id)
  const elevator = order ? elevators.find((e) => e.id === order.elevatorId) : undefined

  if (!order) {
    return (
      <div className="min-h-screen bg-surface-50">
        <PageHeader title="派工详情" showBack />
        <div className="pt-12 text-center text-sm text-gray-400 py-12">未找到该派工单</div>
      </div>
    )
  }

  const categories = Array.from(new Set(order.items.map((item) => item.category)))

  return (
    <div className="min-h-screen bg-surface-50">
      <PageHeader title="派工详情" showBack />

      <div className="pt-12 pb-24 space-y-3 px-4 pt-4">
        <div className="rounded-card bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-800">电梯信息</span>
            <StatusBadge status={order.status} type="dispatch" />
          </div>
          <div className="space-y-1 text-xs text-gray-500">
            <p>编号：{elevator?.code ?? '-'}</p>
            <p>地址：{elevator?.address ?? '-'}</p>
            <p>品牌：{elevator?.brand ?? '-'}</p>
          </div>
        </div>

        <div className="rounded-card bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">维保类型</span>
            <span className="rounded bg-primary-50 px-1.5 py-0.5 text-xs font-medium text-primary-500">
              {typeLabels[order.type] ?? order.type}
            </span>
          </div>
          <div className="mt-2 space-y-1 text-xs text-gray-500">
            <p>维保工：{order.assigneeName}</p>
            <p>计划日期：{order.scheduledDate}</p>
          </div>
        </div>

        <div className="rounded-card bg-white p-4 shadow-sm">
          <span className="text-sm font-semibold text-gray-800">保养项目清单</span>
          <div className="mt-3 space-y-4">
            {categories.map((category) => (
              <div key={category}>
                <p className="text-xs font-medium text-gray-700 mb-2">{category}</p>
                <div className="space-y-2">
                  {order.items
                    .filter((item) => item.category === category)
                    .map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center gap-2 text-xs text-gray-600"
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={(e) =>
                            updateMaintenanceItem(order.id, item.id, e.target.checked)
                          }
                          className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                        />
                        <span>{item.name}</span>
                      </label>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {order.status !== 'completed' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="max-w-lg mx-auto">
            {order.status === 'pending' && (
              <button
                onClick={() => acceptDispatch(order.id)}
                className="w-full rounded-lg bg-primary-500 py-3 text-sm font-medium text-white"
              >
                接单
              </button>
            )}
            {order.status === 'accepted' && (
              <button
                onClick={() => navigate(`/checkin?dispatchId=${order.id}`)}
                className="w-full rounded-lg bg-primary-500 py-3 text-sm font-medium text-white"
              >
                扫码打卡
              </button>
            )}
            {order.status === 'in_progress' && (
              <button
                onClick={() => completeDispatch(order.id)}
                className="w-full rounded-lg bg-success-500 py-3 text-sm font-medium text-white"
              >
                完成保养
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
