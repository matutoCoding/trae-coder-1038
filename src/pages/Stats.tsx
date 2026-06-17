import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts'
import { useStore } from '@/store'
import PageHeader from '@/components/PageHeader'

const segTabs = [
  { key: 'completion', label: '完成率' },
  { key: 'rescue', label: '救援分析' },
  { key: 'workload', label: '工作量' },
]

const monthlyCompletionData = [
  { month: '1月', rate: 85 },
  { month: '2月', rate: 90 },
  { month: '3月', rate: 78 },
  { month: '4月', rate: 92 },
  { month: '5月', rate: 88 },
  { month: '6月', rate: 95 },
]

const monthlyResponseData = [
  { month: '1月', minutes: 18 },
  { month: '2月', minutes: 15 },
  { month: '3月', minutes: 20 },
  { month: '4月', minutes: 12 },
  { month: '5月', minutes: 14 },
  { month: '6月', minutes: 11 },
]

export default function Stats() {
  const navigate = useNavigate()
  const performanceStats = useStore((s) => s.performanceStats)
  const currentUser = useStore((s) => s.currentUser)
  const [activeTab, setActiveTab] = useState('completion')

  const myStats = performanceStats.find((p) => p.workerId === currentUser?.id)
  const completionRate = myStats?.completionRate ? (myStats.completionRate * 100).toFixed(1) : '0'
  const avgResponse = myStats?.avgResponseMinutes ?? 0

  const arrivalRate = 82

  const sortedByWorkload = [...performanceStats].sort(
    (a, b) => b.monthlyCompleted - a.monthlyCompleted
  )

  return (
    <div className="min-h-screen bg-surface-50">
      <PageHeader title="绩效统计" />

      <div className="pt-12">
        <div className="px-4 pt-3">
          <div className="flex gap-2">
            {segTabs.map((tab) => (
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

        <div className="px-4 pt-4 pb-6">
          {activeTab === 'completion' && (
            <CompletionTab completionRate={completionRate} />
          )}
          {activeTab === 'rescue' && (
            <RescueTab avgResponse={avgResponse} arrivalRate={arrivalRate} />
          )}
          {activeTab === 'workload' && (
            <WorkloadTab rankings={sortedByWorkload} currentUserId={currentUser?.id ?? ''} onRowClick={(id) => navigate(`/stats/${id}`)} />
          )}
        </div>
      </div>
    </div>
  )
}

function CompletionTab({ completionRate }: { completionRate: string | number }) {
  const rate = Number(completionRate)
  const pieData = [
    { name: '已完成', value: rate },
    { name: '未完成', value: 100 - rate },
  ]

  return (
    <div className="space-y-4">
      <div className="rounded-card bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-gray-700 mb-3">个人维保完成率</p>
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
            <span className="text-2xl font-bold text-gray-800">{rate}%</span>
          </div>
        </div>
      </div>

      <div className="rounded-card bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-gray-700 mb-3">月度完成率</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyCompletionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="rate" fill="#1B5E8C" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function RescueTab({ avgResponse, arrivalRate }: { avgResponse: number; arrivalRate: number }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-card bg-white p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-primary-500">{avgResponse}<span className="text-sm text-gray-400 ml-0.5">分钟</span></p>
          <p className="text-xs text-gray-500 mt-1">平均响应时间</p>
        </div>
        <div className="rounded-card bg-white p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-success-500">{arrivalRate}%</p>
          <p className="text-xs text-gray-500 mt-1">到场时效达标率</p>
        </div>
      </div>

      <div className="rounded-card bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-gray-700 mb-3">月度响应时间</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthlyResponseData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="minutes" stroke="#1B5E8C" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function WorkloadTab({ rankings, currentUserId, onRowClick }: { rankings: { workerId: string; workerName: string; monthlyCompleted: number; monthlyTotal: number; completionRate?: number }[]; currentUserId: string; onRowClick?: (id: string) => void }) {
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="rounded-card bg-white shadow-sm divide-y divide-gray-100">
      {rankings.map((item, idx) => {
        const isMe = item.workerId === currentUserId
        const rate = item.completionRate !== undefined
          ? (item.completionRate * 100).toFixed(1)
          : item.monthlyTotal > 0
          ? ((item.monthlyCompleted / item.monthlyTotal) * 100).toFixed(1)
          : '0'
        return (
          <button
            key={item.workerId}
            onClick={() => onRowClick?.(item.workerId)}
            className={`w-full flex items-center justify-between px-4 py-3 ${isMe ? 'bg-primary-50' : ''} hover:bg-gray-50`}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 text-center text-sm">
                {idx < 3 ? medals[idx] : idx + 1}
              </span>
              <span className={`text-sm font-medium ${isMe ? 'text-primary-600' : 'text-gray-800'}`}>
                {item.workerName}
              </span>
              {isMe && (
                <span className="rounded bg-primary-100 px-1.5 py-0.5 text-xs text-primary-600">我</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-xs text-gray-700 font-medium">{item.monthlyCompleted}/{item.monthlyTotal}</p>
                <p className="text-[10px] text-gray-400">{rate}%</p>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
