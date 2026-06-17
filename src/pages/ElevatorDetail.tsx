import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Wrench, Siren, CalendarClock, ChevronRight, Calendar, Shield, Settings } from 'lucide-react'
import { useStore } from '@/store'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'

const tabs = ['概览', '现场复盘']

const statusBanner: Record<string, { bg: string; text: string }> = {
  normal: { bg: 'bg-success-500', text: '正常运行' },
  maintenance: { bg: 'bg-primary-500', text: '维保中' },
  fault: { bg: 'bg-danger-500', text: '故障停梯' },
  disabled: { bg: 'bg-gray-400', text: '已停用' },
}

const reviewFilters = [
  { key: 'all', label: '全部' },
  { key: 'maintenance', label: '维保' },
  { key: 'abnormal', label: '异常事件' },
]

type TimelineItem = {
  id: string
  type: 'maintenance' | 'repair' | 'rescue' | 'inspection' | 'disable' | 'enable'
  time: string
  title: string
  desc: string
  route?: string
  abnormal?: boolean
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
  const inspections = useStore((s) => s.inspections)
  const enableElevator = useStore((s) => s.enableElevator)

  const elevator = elevators.find((e) => e.id === id)
  const [activeTab, setActiveTab] = useState(0)
  const [reviewFilter, setReviewFilter] = useState('all')

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
  const elevatorInspections = inspections.filter((i) => i.elevatorId === id).sort(
    (a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
  )

  const latestMaintenance = elevatorCheckins[0]
  const latestRepair = elevatorRepairs[0]
  const latestRescue = elevatorRescues[0]

  const banner = statusBanner[elevator.status] ?? statusBanner.normal

  const timeline: TimelineItem[] = []

  elevatorCheckins.forEach((cr) => {
    const order = dispatchOrders.find((d) => d.id === cr.dispatchId)
    timeline.push({
      id: `m-${cr.id}`,
      type: 'maintenance',
      time: cr.checkinTime,
      title: order?.type === 'quarterly' ? '季度保' : order?.type === 'repair' ? '维修保养' : '半月保',
      desc: `${order?.assigneeName ?? '-'} · 完成${cr.items.filter(i => i.checked).length}/${cr.items.length}项${cr.parts.length > 0 ? ` · 换件${cr.parts.length}个` : ''}`,
      route: order ? `/dispatch/${order.id}` : undefined,
    })
  })

  elevatorRepairs.forEach((r) => {
    timeline.push({
      id: `r-${r.id}`,
      type: 'repair',
      time: r.createdAt,
      title: `故障报修：${r.faultType}`,
      desc: `${r.reporterName} 报告 · ${r.faultDesc}`,
      route: `/repair/${r.id}`,
      abnormal: true,
    })
  })

  elevatorRescues.forEach((r) => {
    timeline.push({
      id: `re-${r.id}`,
      type: 'rescue',
      time: r.createdAt,
      title: `困人救援：${r.trappedFloor}F ${r.trappedCount}人`,
      desc: `${r.assigneeName} 响应${r.arrivedAt && r.enRouteAt ? ` · 用时${((new Date(r.arrivedAt).getTime() - new Date(r.enRouteAt).getTime()) / 60000).toFixed(1)}分钟到场` : ''}`,
      route: `/rescue/${r.id}`,
      abnormal: true,
    })
  })

  elevatorInspections.forEach((i) => {
    timeline.push({
      id: `i-${i.id}`,
      type: 'inspection',
      time: i.scheduledDate,
      title: `${i.type === 'annual' ? '年检' : '定检'}${i.status === 'completed' ? ` · ${i.result === 'pass' ? '合格' : '不合格'}` : ''}`,
      desc: i.status === 'overdue' ? '已超期未检' : i.status === 'completed' ? `下次：${i.nextDate ?? '-'}` : `计划日期：${i.scheduledDate}`,
      abnormal: i.status === 'overdue',
    })
  })

  if (elevator.disabledAt) {
    timeline.push({
      id: `d-${elevator.id}`,
      type: 'disable',
      time: elevator.disabledAt,
      title: '电梯停用挂牌',
      desc: elevator.disabledReason ?? '原因未填写',
      abnormal: true,
    })
  }

  timeline.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

  const filteredTimeline = timeline.filter((item) => {
    if (reviewFilter === 'all') return true
    if (reviewFilter === 'maintenance') return item.type === 'maintenance' || item.type === 'inspection'
    if (reviewFilter === 'abnormal') return !!item.abnormal
    return true
  })

  const typeMeta: Record<string, { icon: typeof Calendar; color: string; bg: string }> = {
    maintenance: { icon: Settings, color: 'text-primary-500', bg: 'bg-primary-50' },
    repair: { icon: Wrench, color: 'text-safety-600', bg: 'bg-safety-50' },
    rescue: { icon: Siren, color: 'text-danger-500', bg: 'bg-danger-50' },
    inspection: { icon: Calendar, color: 'text-success-600', bg: 'bg-success-50' },
    disable: { icon: Shield, color: 'text-gray-600', bg: 'bg-gray-100' },
    enable: { icon: Shield, color: 'text-success-600', bg: 'bg-success-50' },
  }

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
            className={`flex-1 py-2.5 text-center text-sm font-medium transition-colors ${
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
        {activeTab === 0 && (
          <OverviewTab
            elevator={elevator}
            contracts={elevatorContracts}
            checkins={elevatorCheckins}
            repairs={elevatorRepairs}
            rescues={elevatorRescues}
            dispatchOrders={dispatchOrders}
            onDispatchClick={(dId) => navigate(`/dispatch/${dId}`)}
            onRepairClick={(rId) => navigate(`/repair/${rId}`)}
            onRescueClick={(rId) => navigate(`/rescue/${rId}`)}
          />
        )}
        {activeTab === 1 && (
          <ReviewTab
            filter={reviewFilter}
            onFilterChange={setReviewFilter}
            items={filteredTimeline}
            typeMeta={typeMeta}
            onItemClick={(route) => route && navigate(route)}
          />
        )}
      </div>

      {elevator.status === 'disabled' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white px-4 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] max-w-lg mx-auto">
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

function OverviewTab({
  elevator,
  contracts,
  checkins,
  repairs,
  rescues,
  dispatchOrders,
  onDispatchClick,
  onRepairClick,
  onRescueClick,
}: {
  elevator: import('@/types').Elevator
  contracts: import('@/types').MaintenanceContract[]
  checkins: import('@/types').CheckinRecord[]
  repairs: import('@/types').RepairOrder[]
  rescues: import('@/types').RescueOrder[]
  dispatchOrders: import('@/types').DispatchOrder[]
  onDispatchClick: (id: string) => void
  onRepairClick: (id: string) => void
  onRescueClick: (id: string) => void
}) {
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

      {checkins.length > 0 && (
        <div className="rounded-card bg-white shadow-sm divide-y divide-gray-100">
          <div className="px-4 py-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-800">最近保养记录</p>
            <span className="text-xs text-gray-400">{checkins.length}条</span>
          </div>
          {checkins.slice(0, 3).map((record) => {
            const order = dispatchOrders.find((d) => d.id === record.dispatchId)
            const isCompleted = !!record.checkoutTime
            const checkedCount = record.items.filter((i) => i.checked).length
            const date = new Date(record.checkinTime)
            return (
              <button
                key={record.id}
                onClick={() => order && onDispatchClick(order.id)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50"
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
      )}

      {repairs.length > 0 && (
        <div className="rounded-card bg-white shadow-sm divide-y divide-gray-100">
          <div className="px-4 py-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-800">故障报修</p>
            <span className="text-xs text-gray-400">{repairs.length}条</span>
          </div>
          {repairs.slice(0, 3).map((r) => (
            <button
              key={r.id}
              onClick={() => onRepairClick(r.id)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench size={14} className="text-safety-500" />
                  <span className="text-sm font-medium text-gray-800">{r.faultType}</span>
                </div>
                <div className="flex items-center gap-1">
                  <StatusBadge status={r.status} type="repair" />
                  <ChevronRight size={14} className="text-gray-300" />
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-400 line-clamp-1">{r.faultDesc}</p>
            </button>
          ))}
        </div>
      )}

      {rescues.length > 0 && (
        <div className="rounded-card bg-white shadow-sm divide-y divide-gray-100">
          <div className="px-4 py-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-800">困人救援</p>
            <span className="text-xs text-gray-400">{rescues.length}条</span>
          </div>
          {rescues.slice(0, 3).map((r) => {
            const responseText = r.arrivedAt && r.enRouteAt
              ? `${((new Date(r.arrivedAt).getTime() - new Date(r.enRouteAt).getTime()) / 60000).toFixed(1)}分钟到场`
              : r.arrivedAt
              ? `${((new Date(r.arrivedAt).getTime() - new Date(r.createdAt).getTime()) / 60000).toFixed(1)}分钟到场`
              : '待响应'
            return (
              <button
                key={r.id}
                onClick={() => onRescueClick(r.id)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50"
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
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ReviewTab({
  filter,
  onFilterChange,
  items,
  typeMeta,
  onItemClick,
}: {
  filter: string
  onFilterChange: (k: string) => void
  items: TimelineItem[]
  typeMeta: Record<string, { icon: typeof Calendar; color: string; bg: string }>
  onItemClick: (route?: string) => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {reviewFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => onFilterChange(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium ${
              filter === f.key
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-500'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="rounded-card bg-white p-8 text-center">
          <p className="text-sm text-gray-400">当前筛选下暂无事件</p>
          <p className="text-xs text-gray-300 mt-1">可尝试切换筛选条件</p>
        </div>
      ) : (
        <div className="rounded-card bg-white shadow-sm">
          <div className="space-y-0 border-l-2 border-gray-100 ml-4 mt-2 mb-2">
            {items.map((item) => {
              const meta = typeMeta[item.type] ?? typeMeta.maintenance
              const Icon = meta.icon
              return (
                <button
                  key={item.id}
                  onClick={() => onItemClick(item.route)}
                  disabled={!item.route}
                  className={`w-full text-left relative pl-6 pr-4 py-3 ${item.route ? 'hover:bg-gray-50' : ''} ${!item.route ? 'cursor-default' : ''}`}
                >
                  <div className={`absolute -left-[9px] top-3 h-4 w-4 rounded-full flex items-center justify-center ${meta.bg}`}>
                    <Icon size={12} className={meta.color} />
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-800">{item.title}</p>
                        {item.abnormal && (
                          <span className="rounded bg-danger-50 px-1.5 py-0.5 text-[10px] text-danger-600">异常</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                      <p className="text-[11px] text-gray-300 mt-0.5">
                        {new Date(item.time).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {item.route && <ChevronRight size={14} className="text-gray-300 mt-1" />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
