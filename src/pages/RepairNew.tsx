import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ImagePlus } from 'lucide-react'
import { useStore } from '@/store'
import PageHeader from '@/components/PageHeader'
import type { RepairOrder } from '@/types'

const faultTypes = ['门系统故障', '电气系统故障', '机械系统故障', '安全装置故障', '其他']
const urgencyOptions = [
  { key: 'low', label: '低' },
  { key: 'medium', label: '中' },
  { key: 'high', label: '高' },
] as const

export default function RepairNew() {
  const navigate = useNavigate()
  const elevators = useStore((s) => s.elevators)
  const currentUser = useStore((s) => s.currentUser)
  const createRepairOrder = useStore((s) => s.createRepairOrder)

  const [elevatorId, setElevatorId] = useState('')
  const [faultType, setFaultType] = useState('')
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('low')
  const [faultDesc, setFaultDesc] = useState('')

  const handleSubmit = () => {
    if (!elevatorId || !faultType || !faultDesc) return

    const order: RepairOrder = {
      id: `R${Date.now()}`,
      elevatorId,
      faultType,
      faultDesc,
      urgency,
      photos: [],
      status: 'submitted',
      reporterId: currentUser?.id ?? '',
      reporterName: currentUser?.name ?? '',
      createdAt: new Date().toISOString(),
      timeline: [
        {
          time: new Date().toISOString(),
          action: '创建报修工单',
          operator: currentUser?.name ?? '',
        },
      ],
    }
    createRepairOrder(order)
    navigate('/repair')
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <PageHeader title="故障报修" showBack />

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
            <label className="block text-sm font-medium text-gray-700 mb-1">故障类型</label>
            <select
              value={faultType}
              onChange={(e) => setFaultType(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            >
              <option value="">请选择故障类型</option>
              {faultTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">紧急程度</label>
            <div className="flex gap-2">
              {urgencyOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setUrgency(opt.key)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    urgency === opt.key
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
            <label className="block text-sm font-medium text-gray-700 mb-1">故障描述</label>
            <textarea
              value={faultDesc}
              onChange={(e) => setFaultDesc(e.target.value)}
              rows={4}
              placeholder="请描述故障情况..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">图片上传</label>
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-300"
                >
                  <ImagePlus size={24} className="text-gray-300" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!elevatorId || !faultType || !faultDesc}
          className="w-full rounded-lg bg-primary-500 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          提交
        </button>
      </div>
    </div>
  )
}
