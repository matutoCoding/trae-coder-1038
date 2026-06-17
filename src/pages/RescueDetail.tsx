import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import Timer from '@/components/Timer'
import StatusBadge from '@/components/StatusBadge'

export default function RescueDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const rescueOrders = useStore((s) => s.rescueOrders)
  const elevators = useStore((s) => s.elevators)
  const activeRescueTimer = useStore((s) => s.activeRescueTimer)
  const updateRescueStatus = useStore((s) => s.updateRescueStatus)
  const arriveRescue = useStore((s) => s.arriveRescue)
  const startRescueTimer = useStore((s) => s.startRescueTimer)

  const order = rescueOrders.find((r) => r.id === id)
  const elevator = elevators.find((e) => e.id === order?.elevatorId)

  if (!order) {
    return (
      <div className="min-h-screen bg-surface-50">
        <div className="pt-16 text-center text-sm text-gray-400">工单不存在</div>
      </div>
    )
  }

  const isActive = ['dispatched', 'en_route', 'arrived'].includes(order.status)
  const isArrived = ['arrived', 'rescued', 'closed'].includes(order.status)
  const isEnRoute = order.status === 'en_route'
  const timerRunning = activeRescueTimer?.orderId === order.id && !isArrived

  const formatDuration = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime()
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  const handleDepart = () => {
    updateRescueStatus(order.id, 'en_route')
    startRescueTimer(order.id)
  }

  const handleArrive = () => {
    arriveRescue(order.id, new Date().toISOString())
  }

  return (
    <div className="min-h-screen bg-surface-50">
      {isActive && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-danger-500 py-2 text-center">
          <span className="animate-pulse text-sm font-bold text-white">
            SOS 紧急救援 · {elevator?.code ?? '-'}
          </span>
        </div>
      )}

      <div className={`px-4 pb-24 ${isActive ? 'pt-10' : 'pt-4'} space-y-3`}>
        <div className="rounded-card bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">{elevator?.code ?? '-'}</span>
            <StatusBadge status={order.status} type="rescue" />
          </div>
          <p className="mt-1 text-xs text-gray-400">{elevator?.address ?? '-'}</p>
        </div>

        <div className="rounded-card bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-800">困人信息</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-800">{order.trappedFloor}F</p>
              <p className="text-xs text-gray-400">困人楼层</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-800">{order.trappedCount}人</p>
              <p className="text-xs text-gray-400">被困人数</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-800">{order.elevatorStatus}</p>
              <p className="text-xs text-gray-400">电梯状态</p>
            </div>
          </div>
        </div>

        <div className="rounded-card bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-800">应急到场计时</h3>
          <div className="text-center py-3">
            {timerRunning && activeRescueTimer && (
              <div>
                <Timer startTime={activeRescueTimer.startTime} isDanger />
                <p className="mt-1 text-xs text-danger-400">正在赶往现场...</p>
              </div>
            )}
            {isArrived && order.arrivedAt && order.enRouteAt && (
              <div>
                <span className="text-2xl font-mono font-bold text-gray-900">
                  {formatDuration(order.enRouteAt, order.arrivedAt)}
                </span>
                <p className="mt-1 text-xs text-gray-400">到场用时（出发→到场）</p>
              </div>
            )}
            {isArrived && order.arrivedAt && !order.enRouteAt && order.createdAt && (
              <div>
                <span className="text-2xl font-mono font-bold text-gray-900">
                  {formatDuration(order.createdAt, order.arrivedAt)}
                </span>
                <p className="mt-1 text-xs text-gray-400">到场用时</p>
              </div>
            )}
            {order.status === 'dispatched' && (
              <span className="text-sm text-gray-400">等待出发</span>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 max-w-lg mx-auto">
        {order.status === 'dispatched' && (
          <button
            onClick={handleDepart}
            className="w-full rounded-lg bg-danger-500 py-3 text-sm font-medium text-white"
          >
            出发
          </button>
        )}
        {isEnRoute && (
          <button
            onClick={handleArrive}
            className="w-full rounded-lg bg-danger-500 py-3 text-sm font-medium text-white"
          >
            到场
          </button>
        )}
        {order.status === 'arrived' && (
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/rescue/${order.id}/record`)}
              className="flex-1 rounded-lg bg-safety-500 py-3 text-sm font-medium text-white"
            >
              记录原因
            </button>
            <button
              onClick={() => updateRescueStatus(order.id, 'rescued')}
              className="flex-1 rounded-lg bg-success-500 py-3 text-sm font-medium text-white"
            >
              完成救援
            </button>
          </div>
        )}
        {order.status === 'rescued' && (
          <button
            onClick={() => updateRescueStatus(order.id, 'closed')}
            className="w-full rounded-lg bg-gray-500 py-3 text-sm font-medium text-white"
          >
            关闭工单
          </button>
        )}
      </div>
    </div>
  )
}
