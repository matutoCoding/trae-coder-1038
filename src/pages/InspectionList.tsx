import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, List, Calendar, ChevronLeft, ChevronRight, ChevronRight as ChevronRightIcon } from 'lucide-react'
import { useStore } from '@/store'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import type { InspectionSchedule } from '@/types'

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待年检' },
  { key: 'overdue', label: '已超期' },
  { key: 'completed', label: '已完成' },
]

const typeLabels: Record<string, string> = {
  annual: '年检',
  periodic: '定检',
}

function isWithin7Days(dateStr: string): boolean {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000
}

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date()
}

export default function InspectionList() {
  const navigate = useNavigate()
  const inspections = useStore((s) => s.inspections)
  const elevators = useStore((s) => s.elevators)
  const [activeTab, setActiveTab] = useState('all')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const filtered = inspections.filter((i) => {
    if (activeTab === 'all') return true
    return i.status === activeTab
  })

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(d)
    return days
  }, [currentMonth])

  const getInspectionsForDay = (day: number) => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return inspections.filter((i) => i.scheduledDate === dateStr)
  }

  const hasInspectionOnDay = (day: number) => getInspectionsForDay(day).length > 0

  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const selectedDayInspections = selectedDay ? getInspectionsForDay(selectedDay) : []

  const monthLabel = `${currentMonth.getFullYear()}年${currentMonth.getMonth() + 1}月`

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))

  return (
    <div className="min-h-screen bg-surface-50">
      <PageHeader
        title="年检管理"
        rightAction={
          <button onClick={() => navigate('/inspection/new')}>
            <Plus size={22} className="text-primary-500" />
          </button>
        }
      />

      <div className="pt-12">
        <div className="px-4 pt-3 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-lg p-2 transition-colors ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-white text-gray-400'}`}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`rounded-lg p-2 transition-colors ${viewMode === 'calendar' ? 'bg-primary-500 text-white' : 'bg-white text-gray-400'}`}
            >
              <Calendar size={18} />
            </button>
          </div>
        </div>

        {viewMode === 'list' ? (
          <>
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
              {filtered.map((insp) => (
                <InspectionCard
                  key={insp.id}
                  inspection={insp}
                  elevator={elevators.find((e) => e.id === insp.elevatorId)}
                />
              ))}
              {filtered.length === 0 && (
                <div className="py-12 text-center text-sm text-gray-400">暂无数据</div>
              )}
            </div>
          </>
        ) : (
          <div className="px-4 pt-3">
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevMonth} className="p-1"><ChevronLeft size={20} className="text-gray-500" /></button>
              <span className="text-sm font-medium text-gray-700">{monthLabel}</span>
              <button onClick={nextMonth} className="p-1"><ChevronRight size={20} className="text-gray-500" /></button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
                <div key={d} className="text-xs text-gray-400 py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center py-1">
                  {day !== null ? (
                    <button
                      onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                      className={`relative flex h-8 w-8 items-center justify-center rounded-full text-xs transition-colors ${
                        selectedDay === day ? 'bg-primary-500 text-white' : 'text-gray-700'
                      }`}
                    >
                      {day}
                      {hasInspectionOnDay(day) && (
                        <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-danger-500" />
                      )}
                    </button>
                  ) : null}
                </div>
              ))}
            </div>

            {selectedDay && selectedDayInspections.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-gray-500">{selectedDay}日的年检</p>
                {selectedDayInspections.map((insp) => (
                  <InspectionCard
                    key={insp.id}
                    inspection={insp}
                    elevator={elevators.find((e) => e.id === insp.elevatorId)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function InspectionCard({
  inspection,
  elevator,
}: {
  inspection: InspectionSchedule
  elevator?: { id: string; code: string; address: string }
}) {
  const navigate = useNavigate()
  const borderClass =
    inspection.status === 'overdue'
      ? 'border-l-4 border-l-danger-500'
      : inspection.status === 'pending' && isWithin7Days(inspection.scheduledDate)
        ? 'border-l-4 border-l-safety-500'
        : ''

  return (
    <button
      onClick={() => navigate(`/inspection/${inspection.id}`)}
      className={`w-full text-left rounded-card bg-white p-4 shadow-sm ${borderClass} hover:bg-gray-50`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800">
          {elevator?.code ?? '-'}
        </span>
        <div className="flex items-center gap-1">
          <StatusBadge status={inspection.status} type="inspection" />
          <ChevronRightIcon size={14} className="text-gray-300" />
        </div>
      </div>
      <p className="mt-1 text-xs text-gray-500 line-clamp-1">{elevator?.address ?? '-'}</p>

      <div className="mt-2 flex items-center gap-2">
        <span className="rounded bg-primary-50 px-1.5 py-0.5 text-xs font-medium text-primary-500">
          {typeLabels[inspection.type] ?? inspection.type}
        </span>
        {inspection.result && (
          <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${
            inspection.result === 'pass' ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600'
          }`}>
            {inspection.result === 'pass' ? '合格' : '不合格'}
          </span>
        )}
      </div>

      <div className="mt-2 text-xs text-gray-400">
        计划日期：{inspection.scheduledDate}
        {inspection.inspectionDate && ` · 实际：${inspection.inspectionDate}`}
      </div>
    </button>
  )
}
