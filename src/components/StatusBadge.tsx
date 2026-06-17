type StatusType = 'elevator' | 'dispatch' | 'repair' | 'rescue' | 'inspection' | 'contract' | 'certificate'

interface StatusBadgeProps {
  status: string
  type: StatusType
}

const statusLabels: Record<StatusType, Record<string, string>> = {
  elevator: { normal: '正常', maintenance: '维保中', fault: '故障', disabled: '停用' },
  dispatch: { pending: '待接单', accepted: '已接单', in_progress: '进行中', completed: '已完成' },
  repair: { submitted: '已提交', assigned: '已派单', repairing: '维修中', completed: '已完成' },
  rescue: { dispatched: '已派单', en_route: '出车中', arrived: '已到场', rescued: '已救出', closed: '已关闭' },
  inspection: { pending: '待年检', overdue: '已逾期', completed: '已完成' },
  contract: { active: '生效中', expiring: '即将到期', expired: '已过期' },
  certificate: { valid: '有效', expiring: '即将到期', expired: '已过期' },
}

const statusColors: Record<StatusType, Record<string, string>> = {
  elevator: {
    normal: 'bg-success-50 text-success-500',
    maintenance: 'bg-primary-50 text-primary-500',
    fault: 'bg-danger-50 text-danger-500',
    disabled: 'bg-gray-100 text-gray-400',
  },
  dispatch: {
    pending: 'bg-safety-50 text-safety-500',
    accepted: 'bg-primary-50 text-primary-500',
    in_progress: 'bg-primary-50 text-primary-500',
    completed: 'bg-success-50 text-success-500',
  },
  repair: {
    submitted: 'bg-safety-50 text-safety-500',
    assigned: 'bg-primary-50 text-primary-500',
    repairing: 'bg-primary-50 text-primary-500',
    completed: 'bg-success-50 text-success-500',
  },
  rescue: {
    dispatched: 'bg-danger-50 text-danger-500',
    en_route: 'bg-danger-50 text-danger-500',
    arrived: 'bg-safety-50 text-safety-500',
    rescued: 'bg-success-50 text-success-500',
    closed: 'bg-gray-100 text-gray-400',
  },
  inspection: {
    pending: 'bg-primary-50 text-primary-500',
    overdue: 'bg-danger-50 text-danger-500',
    completed: 'bg-success-50 text-success-500',
  },
  contract: {
    active: 'bg-success-50 text-success-500',
    expiring: 'bg-safety-50 text-safety-500',
    expired: 'bg-danger-50 text-danger-500',
  },
  certificate: {
    valid: 'bg-success-50 text-success-500',
    expiring: 'bg-safety-50 text-safety-500',
    expired: 'bg-danger-50 text-danger-500',
  },
}

export default function StatusBadge({ status, type }: StatusBadgeProps) {
  const label = statusLabels[type]?.[status] ?? status
  const color = statusColors[type]?.[status] ?? 'bg-gray-100 text-gray-400'

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {label}
    </span>
  )
}
