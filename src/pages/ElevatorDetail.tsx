import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Wrench, Siren, CalendarClock, ChevronRight } from 'lucide-react'
import { useStore } from '@/store'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'

const tabs = ['基本信息', '维保记录', '故障报修', '困人救援']

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
  const dispatchOrders = useStore((s) => s.dispatchOrders)
  const repairOrders = useStore((s) => s.repairOrders)
  const rescueOrders = useStore((s) => s.rescueOrders)
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
  const elevatorCheckins = checkinRecords.filter((c) => c.elevatorId === id).sort(
    (a, b) => new Date(b.checkinTime).getTime() - new Date(a.checkinTime).getTime()
  )
  const elevatorRepairs = repairOrders.filter((r) => r.elevatorId === id).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  const elevatorRescues = rescueOrders.filter((r) => r.elevatorId === id).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const latestMaintenance = elevatorCheckins[0]
  const latestRepair = elevatorRepairs[0]
  const latestRescue = elevatorRescues[0]

  const banner = statusBanner[elevator.status] ?? statusBanner.normal

  return (
    <div className="min-h-screen bg-surface-50">
      <PageHeader title="电梯详情" showBack />

      <div className={`${banner.bg} px-4 pt-16 pb-5 text-white`}>
        <p className="text-sm font-medium opacity-90">{banner.text}</p>
        <p className="mt-1 text-lg font-bold">{elevator.code}</p>
        <p className="mt-1 text-xs opacity-80">{elevator.address}</p>
      </div>

      <div className="px-4 -mt-2">
        <div className="grid grid-cols-3 gap-2 rounded-card bg-white p-3 shadow-sm">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <CalendarClock size={14} className="text-primary-500" />
              <span className="text-[11px] text-gray-500">最近维保</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-gray-800">
              {latestMaintenance
                ? new Date(latestMaintenance.checkinTime).toLocaleDateString()
                : '-'}
            </p>
          </div>
          <div className="text-center border-x border-gray-100">
            <div className="flex items-center justify-center gap-1">
              <Wrench size={14} className="text-safety-500" />
              <span className="text-[11px] text-gray-500">最近报修</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-gray-800">
              {latestRepair
                ? new Date(latestRepair.createdAt).toLocaleDateString()
                : '-'}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Siren size={14} className="text-danger-500" />
              <span className="text-[11px] text-gray-500">最近救援</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-gray-800">
              {latestRescue
                ? new Date(latestRescue.createdAt).toLocaleDateString()
                : '-'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex border-b border-gray-100 bg-white mt-3">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`flex-1 py-2.5 text-center text-xs font-medium transition-colors ${
              activeTab === i
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-gray-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="px-4 pt-3 pb-20">
        {activeTab === 0 && <InfoTab elevator={elevator} contracts={elevatorContracts} />}
        {activeTab === 1 && <MaintenanceTab checkins={elevatorCheckins} dispatchOrders={dispatchOrders} onRowClick={(id) => navigate(`/dispatch/${id}`)} />}
        {activeTab === 2 && <RepairTab repairs={elevatorRepairs} onRowClick={(id) => navigate(`/repair/${id}`)} />}
        {activeTab === 3 && <RescueTab rescues={elevatorRescues} onRowClick={(id) => navigate(`/rescue/${id}`)} />}
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

function InfoTab({ elevator, contracts }: { elevator: import('@/types').Elevator; contracts: import('@/types').MaintenanceContract[] }) {
  const items = [
    { label: '编号', value: elevator.code },
    { label: '小区', value: elevator.community },
    { label: '品牌', value: elevator.brand },
    { label: '型号', value: elevator.model },
    { label: '楼层数', value: `${elevator.floorCount}层` },
    { label: '上次维保', value: elevator.lastMaintenance },
    { label: '下次年检', value: elevator.nextInspection },
  ]

  return (
    <div className="space-y-3">
      <div className="rounded-card bg-white p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {items.map((item) => (
            <div key={item.label}>
              <p className="text-xs text-gray-400">{item.label}</p>
              <p className="mt-0.5 text-sm text-gray-800">{item.value}</p>
            </div>
          ))}
          <div className="col-span-2">
            <p className="text-xs text-gray-400">地址</p>
            <p className="mt-0.5 text-sm text-gray-800">{elevator.address}</p>
          </div>
        </div>
      </div>

      <div className="rounded-card bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-gray-800 mb-2">维保合同</p>
        {contracts.length === 0 ? (
          <p className="text-xs text-gray-400">暂无合同</p>
        ) : (
          contracts.map((c) => (
            <div key={c.id} className="pb-2 last:pb-0">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{c.companyName}</span>
                <StatusBadge status={c.status} type="contract" />
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {c.startDate} ~ {c.endDate} · {c.type === 'half_monthly' ? '半月保' : '季保'}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function MaintenanceTab({
  checkins,
  dispatchOrders,
  onRowClick,
}: {
  checkins: import('@/types').CheckinRecord[]
  dispatchOrders: import('@/types').DispatchOrder[]
  onRowClick: (dispatchId: string) => void
}) {
  if (checkins.length === 0) {
    return <div className="py-12 text-center text-sm text-gray-400">暂无保养记录</div>
  }

  return (
    <div className="space-y-2">
      {checkins.map((record) => {
        const order = dispatchOrders.find((d) => d.id === record.dispatchId)
        const isCompleted = !!record.checkoutTime
        const checkedCount = record.items.filter((i) => i.checked).length
        const date = new Date(record.checkinTime)
        return (
          <button
            key={record.id}
            onClick={() => record.dispatchId && onRowClick(record.dispatchId)}
            className="w-full text-left rounded-card bg-white p-3 shadow-sm hover:bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-800">
                {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <div className="flex items-center gap-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${isCompleted ? 'bg-success-50 text-success-600' : 'bg-primary-50 text-primary-600'}`}>
                  {isCompleted ? '已完成' : '进行中'}
                </span>
                <ChevronRight size={14} className="text-gray-300" />
              </div>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
              <span>保养项 {checkedCount}/{record.items.length}</span>
              {order && (
                <span className="px-1.5 py-0.5 rounded bg-gray-100">
                  {order.type === 'half_monthly' ? '半月保' : order.type === 'quarterly' ? '季保' : '维修'}
                </span>
              )}
              {record.parts.length > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-safety-50 text-safety-600">
                  换件{record.parts.length}个
                </span>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

function RepairTab({
  repairs,
  onRowClick,
}: {
  repairs: import('@/types').RepairOrder[]
  onRowClick: (id: string) => void
}) {
  if (repairs.length === 0) {
    return <div className="py-12 text-center text-sm text-gray-400">暂无故障报修</div>
  }

  const urgencyText: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
  }

  const urgencyColor: Record<string, string> = {
    low: 'bg-gray-100 text-gray-500',
    medium: 'bg-safety-50 text-safety-600',
    high: 'bg-danger-50 text-danger-600',
  }

  return (
    <div className="space-y-2">
      {repairs.map((r) => (
        <button
          key={r.id}
          onClick={() => onRowClick(r.id)}
          className="w-full text-left rounded-card bg-white p-3 shadow-sm hover:bg-gray-50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-800">{r.faultType}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${urgencyColor[r.urgency]}`}>
                紧急{urgencyText[r.urgency]}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <StatusBadge status={r.status} type="repair" />
              <ChevronRight size={14} className="text-gray-300" />
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-400 line-clamp-1">{r.faultDesc}</p>
          <p className="mt-0.5 text-[11px] text-gray-300">
            {new Date(r.createdAt).toLocaleString()}
          </p>
        </button>
      ))}
    </div>
  )
}

function RescueTab({
  rescues,
  onRowClick,
}: {
  rescues: import('@/types').RescueOrder[]
  onRowClick: (id: string) => void
}) {
  if (rescues.length === 0) {
    return <div className="py-12 text-center text-sm text-gray-400">暂无困人救援记录</div>
  }

  return (
    <div className="space-y-2">
      {rescues.map((r) => {
        const responseText = r.arrivedAt && r.enRouteAt
          ? `${((new Date(r.arrivedAt).getTime() - new Date(r.enRouteAt).getTime()) / 60000).toFixed(1)}分钟到场`
          : r.arrivedAt
          ? `${((new Date(r.arrivedAt).getTime() - new Date(r.createdAt).getTime()) / 60000).toFixed(1)}分钟到场`
          : '待响应'
        return (
          <button
            key={r.id}
            onClick={() => onRowClick(r.id)}
            className="w-full text-left rounded-card bg-white p-3 shadow-sm hover:bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Siren size={14} className="text-danger-500" />
                <span className="text-sm font-medium text-gray-800">{r.trappedFloor}F · {r.trappedCount}人被困</span>
              </div>
              <div className="flex items-center gap-1">
                <StatusBadge status={r.status} type="rescue" />
                <ChevronRight size={14} className="text-gray-300" />
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              {responseText} · {r.assigneeName}
            </p>
            <p className="mt-0.5 text-[11px] text-gray-300">
              {new Date(r.createdAt).toLocaleString()}
            </p>
          </button>
        )
      })}
    </div>
  )
}
