import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import PageHeader from '@/components/PageHeader'

const disableReasons = [
  { value: '设备老化', label: '设备老化' },
  { value: '安全隐患', label: '安全隐患' },
  { value: '大修改造', label: '大修改造' },
  { value: '其他', label: '其他' },
]

export default function ElevatorDisable() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const disableElevator = useStore((s) => s.disableElevator)
  const elevators = useStore((s) => s.elevators)
  const elevator = elevators.find((e) => e.id === id)

  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = () => {
    if (!id || !reason) return
    setSubmitting(true)
    const fullReason = description ? `${reason}：${description}` : reason
    disableElevator(id, fullReason)
    navigate(`/elevators/${id}`)
  }

  if (!elevator) {
    return (
      <div className="min-h-screen bg-surface-50">
        <PageHeader title="电梯停用挂牌" showBack />
        <div className="pt-16 text-center text-sm text-gray-400">未找到电梯信息</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <PageHeader title="电梯停用挂牌" showBack />

      <div className="px-4 pt-16 pb-6">
        <div className="mb-4 rounded-card bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-800">{elevator.code}</p>
          <p className="mt-1 text-xs text-gray-500">{elevator.address}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">停用原因</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-primary-500"
            >
              <option value="">请选择停用原因</option>
              {disableReasons.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">详细描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请输入停用原因的详细描述"
              rows={4}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-primary-500 placeholder:text-gray-300"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!reason || submitting}
          className="mt-6 w-full rounded-lg bg-danger-500 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          确认停用
        </button>
      </div>
    </div>
  )
}
