import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, MapPin, User } from 'lucide-react'
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

  useEffect(() => {
    if (order && order.status === 'en_route' && order.enRouteAt) {
      if (!activeRescueTimer || activeRescueTimer.orderId !== order.id) {
        const startTime = new Date(order.enRouteAt).getTime()
        startRescueTimer(order.id)
        const state = useStore.getState()
        useStore.setState({
          activeRescueTimer: { orderId: order.id, startTime },
        })
      }
    }
  }, [order?.id])

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

  const calcResponseMinutes = () => {
    if (order.arrivedAt && order.enRouteAt) {
      const diff = new Date(order.arrivedAt).getTime() - new Date(order.enRouteAt).getTime()
      return (diff / 60000).toFixed(1)
    }
    if (order.arrivedAt) {
      const diff = new Date(order.arrivedAt).getTime() - new Date(order.createdAt).getTime()
      return (diff / 60000).toFixed(1)
    }
    return null
  }

  const handleDepart = () => {
    updateRescueStatus(order.id, 'en_route')
    startRescueTimer(order.id)
  }

  const handleArrive = () => {
    arriveRescue(order.id, new Date().toISOString())
  }

  const timeline = [
    { key: 'dispatched', label: '工单派单', time: order.createdAt, done: true, icon: '🚨' },
    ...(order.enRouteAt ? [{ key: 'en_route', label: '维保工出发', time: order.enRouteAt, done: true, icon: '🚗' }] : []),
    ...(order.arrivedAt ? [{ key: 'arrived', label: '到达现场', time: order.arrivedAt, done: true, icon: '📍' }] : []),
    ...(order.rescuedAt ? [{ key: 'rescued', label: '救出被困人员', time: order.rescuedAt, done: true, icon: '✅' }] : []),
    ...(order.closedAt ? [{ key: 'closed', label: '工单关闭', time: order.closedAt, done: true, icon: '📋' }] : []),
  ]

  const responseMinutes = calcResponseMinutes()

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
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">{elevator?.code ?? '-'}</span>
              <StatusBadge status={order.status} type="rescue" />
            </div>
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
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <User size={14} />
            <span>维保工：{order.assigneeName}</span>
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
            {isArrived && responseMinutes && (
              <div>
                <span className="text-2xl font-mono font-bold text-gray-900">
                  {responseMinutes}<span className="text-sm ml-1">分钟</span>
                </span>
                <p className="mt-1 text-xs text-gray-400">到场用时（出发→到场）</p>
              </div>
            )}
            {order.status === 'dispatched' && (
              <div>
                <span className="text-sm text-gray-400">等待出发</span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-card bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-800">救援时间线</h3>
          <div className="space-y-3 border-l-2 border-primary-100 ml-2">
            {timeline.map((node, idx) => (
              <div key={node.key} className="relative pl-5 pb-1 last:pb-0">
                <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full flex items-center justify-center text-xs ${node.done ? 'bg-primary-500' : 'bg-gray-200'}`}>
                  <span className="text-[10px]">{node.icon}</span>
                </div>
                <p className="text-sm font-medium text-gray-800">{node.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(node.time).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        </div>

        {order.rescueRecord && (
          <div className="rounded-card bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">救援记录</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-400 text-xs">困人原因：</span>
                <span className="text-gray-700">{order.rescueRecord.cause}</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs">处理结果：</span>
                <span className="text-gray-700">{order.rescueRecord.result}</span>
              </div>
            </div>
          </div>
        )}
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
        {order.status === 'closed' && (
          <p className="text-center text-sm text-gray-400 py-3">工单已关闭</p>
        )}
      </div>
    </div>
  )
}
