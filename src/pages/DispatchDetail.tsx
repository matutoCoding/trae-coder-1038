import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import { Clock, User, MapPin, ChevronRight, Image, Package, CheckCircle2, AlertCircle } from 'lucide-react'

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
  const checkinRecords = useStore((s) => s.checkinRecords)
  const acceptDispatch = useStore((s) => s.acceptDispatch)
  const completeDispatch = useStore((s) => s.completeDispatch)
  const updateMaintenanceItem = useStore((s) => s.updateMaintenanceItem)

  const order = dispatchOrders.find((d) => d.id === id)
  const elevator = order ? elevators.find((e) => e.id === order.elevatorId) : undefined
  const checkin = order ? checkinRecords.find((c) => c.dispatchId === order.id) : undefined

  if (!order) {
    return (
      <div className="min-h-screen bg-surface-50">
        <PageHeader title="派工详情" showBack />
        <div className="pt-12 text-center text-sm text-gray-400 py-12">未找到该派工单</div>
      </div>
    )
  }

  const categories = Array.from(new Set(order.items.map((item) => item.category)))
  const checkedCount = order.items.filter((i) => i.checked).length
  const totalCount = order.items.length
  const isCompleted = order.status === 'completed'

  return (
    <div className="min-h-screen bg-surface-50">
      <PageHeader title="派工详情" showBack />

      <div className={`pt-14 pb-24 space-y-3 px-4 ${isCompleted ? 'pt-14' : 'pt-14'}`}>
        <button
          onClick={() => elevator && navigate(`/elevators/${elevator.id}`)}
          className="w-full text-left rounded-card bg-white p-4 shadow-sm hover:bg-gray-50"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-800">电梯信息</span>
            <div className="flex items-center gap-1">
              <StatusBadge status={order.status} type="dispatch" />
              <ChevronRight size={14} className="text-gray-300" />
            </div>
          </div>
          <div className="space-y-1 text-xs text-gray-500">
            <p>编号：{elevator?.code ?? '-'}</p>
            <p>地址：{elevator?.address ?? '-'}</p>
            <p>小区：{elevator?.community ?? '-'}</p>
            <p>品牌：{elevator?.brand ?? '-'}</p>
          </div>
        </button>

        <div className="rounded-card bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">维保信息</span>
            <span className="rounded bg-primary-50 px-1.5 py-0.5 text-xs font-medium text-primary-500">
              {typeLabels[order.type] ?? order.type}
            </span>
          </div>
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-gray-500">
              <User size={12} />
              <span>维保工：{order.assigneeName}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <Clock size={12} />
              <span>计划日期：{order.scheduledDate}</span>
            </div>
            {checkin && (
              <div className="flex items-center gap-2 text-gray-500">
                <MapPin size={12} />
                <span>签到时间：{new Date(checkin.checkinTime).toLocaleString()}</span>
              </div>
            )}
            {checkin?.checkoutTime && (
              <div className="flex items-center gap-2 text-gray-500">
                <Clock size={12} />
                <span>签退时间：{new Date(checkin.checkoutTime).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {isCompleted && checkin && checkin.parts.length > 0 && (
          <div className="rounded-card bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Package size={14} className="text-safety-500" />
              <span className="text-sm font-semibold text-gray-800">零部件更换（{checkin.parts.length}件）</span>
            </div>
            <div className="space-y-2">
              {checkin.parts.map((p) => (
                <div key={p.id} className="rounded bg-safety-50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">{p.name}</span>
                    <span className="text-xs text-safety-600">×{p.quantity}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">型号：{p.model}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">更换时间：{new Date(p.replacedAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-card bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-800">保养项目清单</span>
            <span className="text-xs text-gray-400">{checkedCount}/{totalCount}</span>
          </div>
          <div className="space-y-4">
            {categories.map((category) => {
              const catItems = order.items.filter((item) => item.category === category)
              const catChecked = catItems.filter((i) => i.checked).length
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-700">{category}</p>
                    <span className="text-[11px] text-gray-400">{catChecked}/{catItems.length}</span>
                  </div>
                  <div className="space-y-2">
                    {catItems.map((item) => (
                      <label
                        key={item.id}
                        className={`flex items-start gap-2 text-xs p-2 rounded ${isCompleted ? 'bg-gray-50' : ''}`}
                      >
                        {isCompleted ? (
                          item.checked
                            ? <CheckCircle2 size={14} className="text-success-500 mt-0.5 flex-shrink-0" />
                            : <AlertCircle size={14} className="text-danger-400 mt-0.5 flex-shrink-0" />
                        ) : (
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={(e) => updateMaintenanceItem(order.id, item.id, e.target.checked)}
                            className="rounded border-gray-300 text-primary-500 focus:ring-primary-500 mt-0.5"
                          />
                        )}
                        <div className="flex-1">
                          <span className={item.checked ? 'text-gray-700' : 'text-gray-500'}>
                            {item.name}
                          </span>
                          {item.remark && (
                            <p className="text-[11px] text-primary-600 mt-0.5">备注：{item.remark}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {isCompleted && checkin && (
          <div className="rounded-card bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Image size={14} className="text-primary-500" />
              <span className="text-sm font-semibold text-gray-800">现场照片</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(checkin.parts.flatMap(p => p.photos) as string[]).slice(0, 9).map((_, idx) => (
                <div key={idx} className="aspect-square rounded bg-gray-100 flex items-center justify-center border border-dashed border-gray-200">
                  <Image size={20} className="text-gray-300" />
                </div>
              ))}
              {checkin.parts.flatMap(p => p.photos).length === 0 && (
                <div className="col-span-3 py-6 text-center text-xs text-gray-400">
                  本次保养无现场照片
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {!isCompleted && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 max-w-lg mx-auto">
          <div>
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
