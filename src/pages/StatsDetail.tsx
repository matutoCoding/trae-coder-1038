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
} from 'recharts'
import { ChevronRight, ClipboardCheck, Siren, CheckCircle2 } from 'lucide-react'
import { useStore } from '@/store'
import PageHeader from '@/components/PageHeader'

const monthlyCompletionData = [
  { month: '1月', rate: 85 },
  { month: '2月', rate: 90 },
  { month: '3月', rate: 78 },
  { month: '4月', rate: 92 },
  { month: '5月', rate: 88 },
  { month: '6月', rate: 95 },
]

export default function StatsDetail() {
  const { workerId } = useParams<{ workerId: string }>()
  const navigate = useNavigate()
  const performanceStats = useStore((s) => s.performanceStats)
  const dispatchOrders = useStore((s) => s.dispatchOrders)
  const elevators = useStore((s) => s.elevators)

  const stat = performanceStats.find((p) => p.workerId === workerId)

  if (!stat) {
    return (
      <div className="min-h-screen bg-surface-50">
        <PageHeader title="维保工详情" showBack />
        <div className="pt-16 text-center text-sm text-gray-400">未找到数据</div>
      </div>
    )
  }

  const completionRate = ((stat.monthlyCompleted / stat.monthlyTotal) * 100).toFixed(1)
  const pieData = [
    { name: '已完成', value: Number(completionRate) },
    { name: '未完成', value: Number((100 - Number(completionRate)).toFixed(1)) },
  ]

  const recentOrders = dispatchOrders
    .filter((d) => d.assigneeId === workerId && d.status === 'completed')
    .sort((a, b) => new Date(b.completedAt ?? '').getTime() - new Date(a.completedAt ?? '').getTime())
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-surface-50">
      <PageHeader title={stat.workerName} showBack />

      <div className="pt-14 px-4 pb-6 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-card bg-white p-3 shadow-sm text-center">
            <p className="text-xl font-bold text-primary-500">{stat.monthlyCompleted}</p>
            <p className="text-[11px] text-gray-500 mt-1">本月完成</p>
          </div>
          <div className="rounded-card bg-white p-3 shadow-sm text-center">
            <p className="text-xl font-bold text-safety-500">{stat.monthlyTotal}</p>
            <p className="text-[11px] text-gray-500 mt-1">本月总工单</p>
          </div>
          <div className="rounded-card bg-white p-3 shadow-sm text-center">
            <p className="text-xl font-bold text-success-500">{stat.rescueCount}</p>
            <p className="text-[11px] text-gray-500 mt-1">救援次数</p>
          </div>
        </div>

        <div className="rounded-card bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-800">维保完成率</p>
            <span className="text-xs text-gray-400">{stat.monthlyCompleted}/{stat.monthlyTotal}</span>
          </div>
          <div className="flex items-center justify-center relative">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  <Cell fill="#1B5E8C" />
                  <Cell fill="#E5E7EB" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-800">{completionRate}%</span>
              <span className="text-xs text-gray-400 mt-0.5">完成率</span>
            </div>
          </div>
        </div>

        <div className="rounded-card bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-800 mb-3">救援响应</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-danger-500">{stat.avgResponseMinutes}<span className="text-xs ml-1 text-gray-400">分钟</span></p>
              <p className="text-xs text-gray-500 mt-1">平均响应时间</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success-500">{((1 - stat.avgResponseMinutes / 30) * 100).toFixed(0)}%</p>
              <p className="text-xs text-gray-500 mt-1">30分钟达标率</p>
            </div>
          </div>
        </div>

        <div className="rounded-card bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-800 mb-3">月度完成趋势</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyCompletionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="rate" fill="#1B5E8C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-card bg-white shadow-sm divide-y divide-gray-100">
          <div className="px-4 py-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-800">最近完成工单</p>
            <span className="text-xs text-gray-400">近5条</span>
          </div>
          {recentOrders.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">暂无完成工单</div>
          ) : (
            recentOrders.map((order) => {
              const elevator = elevators.find((e) => e.id === order.elevatorId)
              return (
                <button
                  key={order.id}
                  onClick={() => navigate(`/dispatch/${order.id}`)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-success-500" />
                    <div className="text-left">
                      <p className="text-sm text-gray-800">{elevator?.code ?? '-'}</p>
                      <p className="text-xs text-gray-400">{elevator?.community ?? '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">
                      {order.completedAt ? new Date(order.completedAt).toLocaleDateString() : '-'}
                    </span>
                    <ChevronRight size={14} className="text-gray-300" />
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
