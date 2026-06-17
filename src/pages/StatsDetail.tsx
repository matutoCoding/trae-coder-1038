import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { ChevronRight, CheckCircle2, Info, ClipboardCheck, Siren, ChevronDown } from 'lucide-react'
import { useStore } from '@/store'
import PageHeader from '@/components/PageHeader'

type TimeRange = 'month' | 'quarter' | 'half'
const TIME_TABS: { key: TimeRange; label: string }[] = [
  { key: 'month', label: '本月' },
  { key: 'quarter', label: '近3个月' },
  { key: 'half', label: '近半年' },
]
const NOW = new Date('2025-06-17T12:00:00')

function getStartDate(range: TimeRange): Date {
  const d = new Date(NOW)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  if (range === 'quarter') d.setMonth(d.getMonth() - 2)
  else if (range === 'half') d.setMonth(d.getMonth() - 5)
  return d
}
const getTypeLabel = (t: string) =>
  t === 'half_monthly' ? '半月保' : t === 'quarterly' ? '季保' : t === 'repair' ? '维修' : t

function monthLabel(date: Date): string {
  return `${date.getMonth() + 1}月`
}

function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="rounded-card bg-white p-3 shadow-sm text-center">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[11px] text-gray-500 mt-1">{label}</p>
    </div>
  )
}

export default function StatsDetail() {
  const { workerId } = useParams<{ workerId: string }>()
  const navigate = useNavigate()
  const [range, setRange] = useState<TimeRange>('month')
  const [showNote, setShowNote] = useState(true)
  const performanceStats = useStore((s) => s.performanceStats)
  const dispatchOrders = useStore((s) => s.dispatchOrders)
  const rescueOrders = useStore((s) => s.rescueOrders)
  const elevators = useStore((s) => s.elevators)
  const checkinRecords = useStore((s) => s.checkinRecords)
  const stat = performanceStats.find((p) => p.workerId === workerId)

  const startDate = useMemo(() => getStartDate(range), [range])

  const workerDispatch = useMemo(() => {
    return dispatchOrders.filter((d) => d.assigneeId === workerId)
  }, [dispatchOrders, workerId])

  const filteredDispatch = useMemo(() => {
    return workerDispatch.filter((d) =>
      new Date(d.completedAt || d.createdAt).getTime() >= startDate.getTime()
    )
  }, [workerDispatch, startDate])

  const completedCount = filteredDispatch.filter((d) => d.status === 'completed').length
  const totalCount = filteredDispatch.filter((d) => d.status !== 'pending').length
  const rate = totalCount > 0 ? Number(((completedCount / totalCount) * 100).toFixed(1)) : 0
  const pieData = [
    { name: '已完成', value: rate },
    { name: '未完成', value: Number((100 - rate).toFixed(1)) },
  ]

  const trend = useMemo(() => {
    const months: { label: string; dateKey: string; total: number; completed: number }[] = []
    const cursor = new Date(startDate)
    while (cursor <= NOW) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`
      months.push({ label: monthLabel(cursor), dateKey: key, total: 0, completed: 0 })
      cursor.setMonth(cursor.getMonth() + 1)
    }

    workerDispatch.forEach((d) => {
      const date = new Date(d.completedAt || d.createdAt)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const m = months.find((x) => x.dateKey === key)
      if (!m) return
      if (d.status !== 'pending') m.total += 1
      if (d.status === 'completed') m.completed += 1
    })

    return months.map((m) => ({
      month: m.label,
      rate: m.total > 0 ? Number(((m.completed / m.total) * 100).toFixed(1)) : 0,
      completed: m.completed,
      total: m.total,
    }))
  }, [workerDispatch, startDate])

  const filteredRescue = useMemo(() => {
    return rescueOrders.filter((r) => {
      if (r.assigneeId !== workerId) return false
      if (!['arrived', 'rescued', 'closed'].includes(r.status)) return false
      return new Date(r.createdAt).getTime() >= startDate.getTime()
    })
  }, [rescueOrders, workerId, startDate])

  const responseMinutes = filteredRescue
    .map((r) => {
      if (r.arrivedAt) {
        const base = r.enRouteAt || r.createdAt
        return (new Date(r.arrivedAt).getTime() - new Date(base).getTime()) / 60000
      }
      return r.responseMinutes || 0
    })
    .filter((m) => m > 0)
  const avgResponse = responseMinutes.length > 0 ? Math.round(responseMinutes.reduce((a, b) => a + b, 0) / responseMinutes.length) : null
  const qualifiedCount = responseMinutes.filter((m) => m <= 30).length
  const qualifiedRate = responseMinutes.length > 0
    ? Math.min(100, Math.max(0, Math.round((qualifiedCount / responseMinutes.length) * 100))) + '%'
    : '—'

  const recentOrders = filteredDispatch
    .filter((d) => d.status === 'completed')
    .sort((a, b) => new Date(b.completedAt || '').getTime() - new Date(a.completedAt || '').getTime())
    .slice(0, 5)

  if (!stat) {
    return (
      <div className="min-h-screen bg-surface-50">
        <PageHeader title="维保工详情" showBack />
        <div className="pt-16 text-center text-sm text-gray-400">未找到数据</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <PageHeader title={stat.workerName} showBack />
      <div className="pt-14 px-4 pb-6 space-y-4">
        <div className="flex gap-2">
          {TIME_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setRange(tab.key)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                range === tab.key ? 'bg-primary-500 text-white' : 'bg-white text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatCard value={completedCount} label="完成工单" color="text-primary-500" />
          <StatCard value={totalCount} label="总工单" color="text-safety-500" />
          <StatCard value={filteredRescue.length} label="救援次数" color="text-success-500" />
        </div>

        <div className="rounded-card bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-800">维保完成率</p>
            <span className="text-xs text-gray-400">{completedCount}/{totalCount}</span>
          </div>
          <div className="flex items-center justify-center relative">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" startAngle={90} endAngle={-270}>
                  <Cell fill="#1B5E8C" />
                  <Cell fill="#E5E7EB" />
                </Pie>
                <Legend iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-gray-800">{rate.toFixed(1)}%</span>
              <span className="text-xs text-gray-400 mt-0.5">完成率</span>
            </div>
          </div>
        </div>

        <div className="rounded-card bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 mb-3">
            <ClipboardCheck size={14} className="text-primary-500" />
            <p className="text-sm font-semibold text-gray-800">月度完成趋势</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  name === 'rate' ? `${value}%` : value,
                  name === 'rate' ? '完成率' : name,
                ]}
                labelFormatter={(label) => `${label}`}
              />
              <Bar dataKey="rate" fill="#1B5E8C" radius={[4, 4, 0, 0]} name="完成率" />
            </BarChart>
          </ResponsiveContainer>
          {trend.length > 0 && trend.every((t) => t.total === 0) && (
            <p className="text-center text-xs text-gray-400 mt-2">所选时段无派工记录</p>
          )}
        </div>

        <div className="rounded-card bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 mb-3">
            <Siren size={14} className="text-danger-500" />
            <p className="text-sm font-semibold text-gray-800">救援响应</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-danger-500">
                {avgResponse === null ? '—' : avgResponse}
                {avgResponse !== null && <span className="text-xs ml-1 text-gray-400">分钟</span>}
              </p>
              <p className="text-xs text-gray-500 mt-1">平均响应时间</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success-500">{qualifiedRate}</p>
              <p className="text-xs text-gray-500 mt-1">30分钟达标率</p>
            </div>
          </div>
        </div>

        <div className="rounded-card bg-white shadow-sm">
          <div className="px-4 py-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-800">最近完成工单</p>
            <span className="text-xs text-gray-400">近5条</span>
          </div>
          {recentOrders.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <div className="text-sm text-gray-400">当前时间范围内无完成工单</div>
              <div className="text-[11px] text-gray-300 mt-2">统计口径：仅统计已完成保养/维修工单</div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentOrders.map((order) => {
                const elevator = elevators.find((e) => e.id === order.elevatorId)
                const checkin = checkinRecords.find((c) => c.dispatchId === order.id)
                return (
                  <button
                    key={order.id}
                    onClick={() => navigate(`/dispatch/${order.id}`)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-success-500 shrink-0" />
                      <div>
                        <p className="text-sm text-gray-800">
                          {elevator?.code ?? '-'}
                          <span className="text-gray-400 ml-2">{elevator?.community ?? '-'}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded">{getTypeLabel(order.type)}</span>
                          <span className="text-xs text-gray-400">{order.completedAt ? new Date(order.completedAt).toLocaleDateString() : '-'}</span>
                          {checkin && checkin.parts.length > 0 && <span className="text-xs text-gray-500">换件 {checkin.parts.length} 件</span>}
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-gray-300 shrink-0" />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="rounded-card bg-white shadow-sm">
          <button onClick={() => setShowNote(!showNote)} className="w-full px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Info size={14} className="text-gray-400" />
              <p className="text-sm text-gray-600">统计口径说明</p>
            </div>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${showNote ? 'rotate-180' : ''}`} />
          </button>
          {showNote && (
            <div className="px-4 pb-4 space-y-1 text-[11px] text-gray-400 leading-relaxed">
              <p>· 数据范围按所选时间窗口统计</p>
              <p>· 本月以当月1日起算；近N个月以当前月往前 N-1 个月起算</p>
              <p>· 总工单 = 已接受 + 进行中 + 已完成（不含待派工）</p>
              <p>· 趋势图按月统计当月完成率，与列表口径一致</p>
              <p>· 救援响应 = 出发 → 到场的分钟数</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
