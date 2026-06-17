import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import PageHeader from '@/components/PageHeader'

const inspectionTypes = [
  { key: 'annual', label: '年检' },
  { key: 'periodic', label: '定检' },
] as const

const resultOptions = [
  { key: 'pass', label: '合格' },
  { key: 'fail', label: '不合格' },
] as const

export default function InspectionNew() {
  const navigate = useNavigate()
  const elevators = useStore((s) => s.elevators)
  const inspections = useStore((s) => s.inspections)
  const completeInspection = useStore((s) => s.completeInspection)

  const [elevatorId, setElevatorId] = useState('')
  const [inspType, setInspType] = useState<'annual' | 'periodic'>('annual')
  const [inspDate, setInspDate] = useState('')
  const [result, setResult] = useState<'pass' | 'fail'>('pass')
  const [nextDate, setNextDate] = useState('')

  const matchedInspection = inspections.find(
    (i) => i.elevatorId === elevatorId && i.type === inspType && i.status !== 'completed'
  )

  const handleSubmit = () => {
    if (!matchedInspection || !inspDate || !nextDate) return
    completeInspection(matchedInspection.id, result, nextDate)
    navigate('/inspection')
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <PageHeader title="年检录入" showBack />

      <div className="pt-12 px-4 pb-6 space-y-4">
        <div className="rounded-card bg-white p-4 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">选择电梯</label>
            <select
              value={elevatorId}
              onChange={(e) => setElevatorId(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            >
              <option value="">请选择电梯</option>
              {elevators.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.code} - {e.address}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">年检类型</label>
            <div className="flex gap-2">
              {inspectionTypes.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setInspType(opt.key)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    inspType === opt.key
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">年检日期</label>
            <input
              type="date"
              value={inspDate}
              onChange={(e) => setInspDate(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">年检结果</label>
            <div className="flex gap-2">
              {resultOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setResult(opt.key)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    result === opt.key
                      ? opt.key === 'pass'
                        ? 'bg-success-500 text-white'
                        : 'bg-danger-500 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">下次年检日期</label>
            <input
              type="date"
              value={nextDate}
              onChange={(e) => setNextDate(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!matchedInspection || !inspDate || !nextDate}
          className="w-full rounded-lg bg-primary-500 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          提交
        </button>
      </div>
    </div>
  )
}
