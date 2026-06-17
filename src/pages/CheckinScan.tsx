import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { QrCode, CheckCircle, MapPin, Clock } from 'lucide-react'
import { useStore } from '@/store'
import PageHeader from '@/components/PageHeader'
import type { CheckinRecord } from '@/types'

export default function CheckinScan() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const dispatchId = searchParams.get('dispatchId')

  const dispatchOrders = useStore((s) => s.dispatchOrders)
  const elevators = useStore((s) => s.elevators)
  const addCheckinRecord = useStore((s) => s.addCheckinRecord)

  const [checkedIn, setCheckedIn] = useState(false)
  const [record, setRecord] = useState<CheckinRecord | null>(null)

  const activeOrder = dispatchId
    ? dispatchOrders.find((d) => d.id === dispatchId)
    : dispatchOrders.find((d) => d.status === 'accepted' || d.status === 'in_progress')

  const elevator = activeOrder
    ? elevators.find((e) => e.id === activeOrder.elevatorId)
    : undefined

  const handleScan = () => {
    if (!activeOrder) return

    const now = new Date()
    const newRecord: CheckinRecord = {
      id: `cr-${Date.now()}`,
      dispatchId: activeOrder.id,
      elevatorId: activeOrder.elevatorId,
      checkinTime: now.toISOString(),
      checkinLocation: '杭州市西湖区文三路268号',
      items: activeOrder.items ?? [],
      parts: [],
    }
    addCheckinRecord(newRecord)
    setRecord(newRecord)
    setCheckedIn(true)

    setTimeout(() => {
      navigate(`/checkin/${newRecord.id}/items`)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <PageHeader title="保养打卡" showBack />

      <div className="pt-14 flex flex-col items-center px-4">
        {checkedIn && record ? (
          <div className="flex flex-col items-center mt-16 space-y-4">
            <CheckCircle size={72} className="text-success-500" />
            <p className="text-lg font-semibold text-gray-800">签到成功</p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock size={16} />
              <span>{new Date(record.checkinTime).toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin size={16} />
              <span>{record.checkinLocation}</span>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={handleScan}
              disabled={!activeOrder}
              className={`mt-20 flex h-40 w-40 items-center justify-center rounded-full shadow-lg active:scale-95 transition-transform ${
                activeOrder ? 'bg-primary-500' : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              <QrCode size={64} className="text-white" />
            </button>
            <p className="mt-4 text-sm text-gray-500">
              {activeOrder ? '点击扫码签到' : '暂无进行中的工单'}
            </p>
          </>
        )}

        {activeOrder && elevator && (
          <div className="mt-10 w-full rounded-card bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-gray-800">当前任务</p>
            <div className="mt-2 space-y-1 text-xs text-gray-500">
              <p>工单号：{activeOrder.id}</p>
              <p>电梯编号：{elevator.code}</p>
              <p>地址：{elevator.address}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
