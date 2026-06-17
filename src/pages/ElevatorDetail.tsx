import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'

const tabs = ['基本信息', '维保合同', '保养记录']

const statusBanner: Record<string, { bg: string; text: string }> = {
  normal: { bg: 'bg-success-500', text: '正常运行' },
  maintenance: { bg: 'bg-primary-500', text: '维保中' },
  fault: { bg: 'bg-danger-500', text: '故障停梯' },
  disabled: { bg: 'bg-gray-400', text: '已停用' },
}

export default function ElevatorDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const elevators = useStore((s) => s.elevators)
  const contracts = useStore((s) => s.contracts)
  const checkinRecords = useStore((s) => s.checkinRecords)
  const enableElevator = useStore((s) => s.enableElevator)

  const elevator = elevators.find((e) => e.id === id)
  const [activeTab, setActiveTab] = useState(0)

  if (!elevator) {
    return (
      <div className="min-h-screen bg-surface-50">
        <PageHeader title="电梯详情" showBack />
        <div className="pt-16 text-center text-sm text-gray-400">未找到电梯信息</div>
      </div>
    )
  }

  const elevatorContracts = contracts.filter((c) => c.elevatorId === id)
  const elevatorCheckins = checkinRecords.filter((c) => c.elevatorId === id)
  const banner = statusBanner[elevator.status] ?? statusBanner.normal

  return (
    <div className="min-h-screen bg-surface-50">
      <PageHeader title="电梯详情" showBack />

      <div className={`${banner.bg} px-4 pt-16 pb-5 text-white`}>
        <p className="text-sm font-medium opacity-90">{banner.text}</p>
        <p className="mt-1 text-lg font-bold">{elevator.code}</p>
      </div>

      <div className="flex border-b border-gray-100 bg-white">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
              activeTab === i
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-gray-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="px-4 pt-4 pb-20">
        {activeTab === 0 && <InfoTab elevator={elevator} />}
        {activeTab === 1 && <ContractTab contracts={elevatorContracts} />}
        {activeTab === 2 && <CheckinTab checkins={elevatorCheckins} />}
      </div>

      {elevator.status === 'disabled' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white px-4 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
          <button
            onClick={() => {
              enableElevator(elevator.id)
              navigate(-1)
            }}
            className="w-full rounded-lg bg-success-500 py-2.5 text-sm font-medium text-white"
          >
            恢复启用
          </button>
        </div>
      )}
    </div>
  )
}

function InfoTab({ elevator }: { elevator: import('@/types').Elevator }) {
  const items = [
    { label: '编号', value: elevator.code },
    { label: '地址', value: elevator.address },
    { label: '小区', value: elevator.community },
    { label: '品牌', value: elevator.brand },
    { label: '型号', value: elevator.model },
    { label: '楼层数', value: `${elevator.floorCount}层` },
    { label: '上次维保', value: elevator.lastMaintenance },
    { label: '下次年检', value: elevator.nextInspection },
  ]

  return (
    <div className="rounded-card bg-white p-4 shadow-sm">
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-xs text-gray-400">{item.label}</p>
            <p className="mt-0.5 text-sm text-gray-800">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ContractTab({ contracts }: { contracts: import('@/types').MaintenanceContract[] }) {
  if (contracts.length === 0) {
    return <div className="py-12 text-center text-sm text-gray-400">暂无合同</div>
  }

  return (
    <div className="space-y-3">
      {contracts.map((c) => (
        <div key={c.id} className="rounded-card bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">{c.companyName}</span>
            <StatusBadge status={c.status} type="contract" />
          </div>
          <div className="mt-2 space-y-1 text-xs text-gray-500">
            <p>有效期：{c.startDate} ~ {c.endDate}</p>
            <p>类型：{c.type === 'half_monthly' ? '半月保' : '季保'}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function CheckinTab({ checkins }: { checkins: import('@/types').CheckinRecord[] }) {
  if (checkins.length === 0) {
    return <div className="py-12 text-center text-sm text-gray-400">暂无保养记录</div>
  }

  return (
    <div className="space-y-0 border-l-2 border-primary-100 ml-2">
      {checkins.map((record) => {
        const date = record.checkinTime.slice(0, 10)
        const time = record.checkinTime.slice(11, 16)
        const isCompleted = !!record.checkoutTime
        return (
          <div key={record.id} className="relative pb-4 pl-4">
            <div className={`absolute -left-[5px] top-1 h-2 w-2 rounded-full ${isCompleted ? 'bg-success-500' : 'bg-primary-500'}`} />
            <p className="text-sm font-medium text-gray-800">{date} {time}</p>
            <p className="mt-0.5 text-xs text-gray-400">
              {isCompleted ? '已完成' : '进行中'}
            </p>
          </div>
        )
      })}
    </div>
  )
}
