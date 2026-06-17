export interface ElevatorStatusEvent {
  id: string
  elevatorId: string
  type: 'disable' | 'enable' | 'fault' | 'repair'
  time: string
  operatorId?: string
  operatorName: string
  reason: string
  remark?: string
}

export interface Elevator {
  id: string
  code: string
  address: string
  community: string
  brand: string
  model: string
  floorCount: number
  status: "normal" | "maintenance" | "fault" | "disabled"
  contractExpiry: string
  lastMaintenance: string
  nextInspection: string
  disabledReason?: string
  disabledAt?: string
  qrCode: string
  statusHistory: ElevatorStatusEvent[]
}

export interface MaintenanceContract {
  id: string
  elevatorId: string
  companyName: string
  startDate: string
  endDate: string
  type: "half_monthly" | "quarterly"
  status: "active" | "expiring" | "expired"
}

export interface MaintenanceItem {
  id: string
  name: string
  category: string
  checked: boolean
  remark?: string
  photos?: string[]
}

export interface DispatchOrder {
  id: string
  elevatorId: string
  type: "half_monthly" | "quarterly" | "repair"
  status: "pending" | "accepted" | "in_progress" | "completed"
  assigneeId: string
  assigneeName: string
  scheduledDate: string
  createdAt: string
  completedAt?: string
  items: MaintenanceItem[]
}

export interface PartReplacement {
  id: string
  name: string
  model: string
  quantity: number
  photos: string[]
  replacedAt: string
}

export interface CheckinRecord {
  id: string
  dispatchId: string
  elevatorId: string
  checkinTime: string
  checkinLocation: string
  checkoutTime?: string
  items: MaintenanceItem[]
  parts: PartReplacement[]
}

export interface RepairTimeline {
  time: string
  action: string
  operator: string
  remark?: string
}

export interface RepairOrder {
  id: string
  elevatorId: string
  faultType: string
  faultDesc: string
  urgency: "low" | "medium" | "high"
  photos: string[]
  status: "submitted" | "assigned" | "repairing" | "completed"
  reporterId: string
  reporterName: string
  assigneeId?: string
  assigneeName?: string
  createdAt: string
  completedAt?: string
  timeline: RepairTimeline[]
}

export interface RescueRecord {
  cause: string
  process: string
  result: string
  photos: string[]
}

export interface RescueOrder {
  id: string
  elevatorId: string
  trappedFloor: number
  trappedCount: number
  elevatorStatus: string
  status: "dispatched" | "en_route" | "arrived" | "rescued" | "closed"
  assigneeId: string
  assigneeName: string
  createdAt: string
  enRouteAt?: string
  arrivedAt?: string
  rescuedAt?: string
  closedAt?: string
  responseMinutes?: number
  rescueRecord?: RescueRecord
}

export interface InspectionSchedule {
  id: string
  elevatorId: string
  type: "annual" | "periodic"
  scheduledDate: string
  inspectionDate?: string
  status: "pending" | "overdue" | "completed"
  result?: "pass" | "fail"
  inspectorName?: string
  inspectorOrg?: string
  nextDate?: string
  reportAttachment?: string
  remark?: string
  photos?: string[]
}

export interface Certificate {
  id: string
  userId: string
  userName: string
  certType: string
  certNumber: string
  issueDate: string
  expiryDate: string
  status: "valid" | "expiring" | "expired"
}

export interface User {
  id: string
  name: string
  phone: string
  role: "admin" | "dispatcher" | "worker"
  avatar: string
  certificates: Certificate[]
}

export interface MonthlyTrendItem {
  month: string
  rate: number
}

export interface PerformanceStats {
  workerId: string
  workerName: string
  monthlyCompleted: number
  monthlyTotal: number
  completionRate: number
  avgResponseMinutes: number
  rescueCount: number
  monthlyTrend: MonthlyTrendItem[]
}

export interface Notification {
  id: string
  type: "dispatch" | "contract" | "rescue" | "inspection" | "system"
  title: string
  content: string
  time: string
  read: boolean
}
