import { create } from 'zustand'
import type {
  Elevator,
  MaintenanceContract,
  DispatchOrder,
  CheckinRecord,
  RepairOrder,
  RescueOrder,
  InspectionSchedule,
  Certificate,
  User,
  PerformanceStats,
  Notification,
  PartReplacement,
  RescueRecord,
} from '@/types'
import {
  elevators as mockElevators,
  maintenanceContracts as mockContracts,
  dispatchOrders as mockDispatchOrders,
  checkinRecords as mockCheckinRecords,
  repairOrders as mockRepairOrders,
  rescueOrders as mockRescueOrders,
  inspectionSchedules as mockInspections,
  certificates as mockCertificates,
  users as mockUsers,
  performanceStats as mockPerformanceStats,
  notifications as mockNotifications,
} from '@/data/mock'

interface StoreState {
  currentUser: User | null
  elevators: Elevator[]
  contracts: MaintenanceContract[]
  dispatchOrders: DispatchOrder[]
  checkinRecords: CheckinRecord[]
  repairOrders: RepairOrder[]
  rescueOrders: RescueOrder[]
  inspections: InspectionSchedule[]
  certificates: Certificate[]
  users: User[]
  performanceStats: PerformanceStats[]
  notifications: Notification[]
  activeRescueTimer: { orderId: string; startTime: number } | null

  login: (phone: string, password: string) => boolean
  logout: () => void
  updateElevatorStatus: (id: string, status: Elevator['status']) => void
  disableElevator: (id: string, reason: string) => void
  enableElevator: (id: string) => void
  acceptDispatch: (id: string) => void
  completeDispatch: (id: string) => void
  updateMaintenanceItem: (dispatchId: string, itemId: string, checked: boolean, remark?: string) => void
  addCheckinRecord: (record: CheckinRecord) => void
  addPartReplacement: (checkinId: string, part: PartReplacement) => void
  createRepairOrder: (order: RepairOrder) => void
  updateRepairStatus: (id: string, status: RepairOrder['status']) => void
  assignRepair: (id: string, assigneeId: string, assigneeName: string) => void
  updateRescueStatus: (id: string, status: RescueOrder['status']) => void
  startRescueTimer: (orderId: string) => void
  stopRescueTimer: () => void
  arriveRescue: (id: string, arrivedAt: string) => void
  addRescueRecord: (id: string, record: RescueRecord) => void
  completeInspection: (id: string, result: 'pass' | 'fail', nextDate: string) => void
  markNotificationRead: (id: string) => void
}

export const useStore = create<StoreState>()((set) => ({
  currentUser: null,
  elevators: mockElevators,
  contracts: mockContracts,
  dispatchOrders: mockDispatchOrders,
  checkinRecords: mockCheckinRecords,
  repairOrders: mockRepairOrders,
  rescueOrders: mockRescueOrders,
  inspections: mockInspections,
  certificates: mockCertificates,
  users: mockUsers,
  performanceStats: mockPerformanceStats,
  notifications: mockNotifications,
  activeRescueTimer: null,

  login: (phone, _password) => {
    const user = mockUsers.find((u) => u.phone === phone)
    if (user) {
      set({ currentUser: user })
      return true
    }
    return false
  },

  logout: () => set({ currentUser: null }),

  updateElevatorStatus: (id, status) =>
    set((state) => ({
      elevators: state.elevators.map((e) => (e.id === id ? { ...e, status } : e)),
    })),

  disableElevator: (id, reason) =>
    set((state) => ({
      elevators: state.elevators.map((e) =>
        e.id === id ? { ...e, status: 'disabled' as const, disabledReason: reason, disabledAt: new Date().toISOString() } : e
      ),
    })),

  enableElevator: (id) =>
    set((state) => ({
      elevators: state.elevators.map((e) =>
        e.id === id ? { ...e, status: 'normal' as const, disabledReason: undefined, disabledAt: undefined } : e
      ),
    })),

  acceptDispatch: (id) =>
    set((state) => ({
      dispatchOrders: state.dispatchOrders.map((d) => (d.id === id ? { ...d, status: 'accepted' as const } : d)),
    })),

  completeDispatch: (id) =>
    set((state) => ({
      dispatchOrders: state.dispatchOrders.map((d) =>
        d.id === id ? { ...d, status: 'completed' as const, completedAt: new Date().toISOString() } : d
      ),
    })),

  updateMaintenanceItem: (dispatchId, itemId, checked, remark) =>
    set((state) => ({
      dispatchOrders: state.dispatchOrders.map((d) =>
        d.id === dispatchId
          ? {
              ...d,
              items: d.items.map((item) =>
                item.id === itemId ? { ...item, checked, ...(remark !== undefined ? { remark } : {}) } : item
              ),
            }
          : d
      ),
    })),

  addCheckinRecord: (record) =>
    set((state) => ({
      checkinRecords: [...state.checkinRecords, record],
    })),

  addPartReplacement: (checkinId, part) =>
    set((state) => ({
      checkinRecords: state.checkinRecords.map((cr) =>
        cr.id === checkinId ? { ...cr, parts: [...cr.parts, part] } : cr
      ),
    })),

  createRepairOrder: (order) =>
    set((state) => ({
      repairOrders: [...state.repairOrders, order],
    })),

  updateRepairStatus: (id, status) =>
    set((state) => ({
      repairOrders: state.repairOrders.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              ...(status === 'completed' ? { completedAt: new Date().toISOString() } : {}),
            }
          : r
      ),
    })),

  assignRepair: (id, assigneeId, assigneeName) =>
    set((state) => ({
      repairOrders: state.repairOrders.map((r) =>
        r.id === id ? { ...r, status: 'assigned' as const, assigneeId, assigneeName } : r
      ),
    })),

  updateRescueStatus: (id, status) =>
    set((state) => ({
      rescueOrders: state.rescueOrders.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              ...(status === 'rescued' ? { rescuedAt: new Date().toISOString() } : {}),
              ...(status === 'closed' ? { closedAt: new Date().toISOString() } : {}),
            }
          : r
      ),
    })),

  startRescueTimer: (orderId) =>
    set({ activeRescueTimer: { orderId, startTime: Date.now() } }),

  stopRescueTimer: () => set({ activeRescueTimer: null }),

  arriveRescue: (id, arrivedAt) =>
    set((state) => ({
      rescueOrders: state.rescueOrders.map((r) =>
        r.id === id ? { ...r, status: 'arrived' as const, arrivedAt } : r
      ),
    })),

  addRescueRecord: (id, record) =>
    set((state) => ({
      rescueOrders: state.rescueOrders.map((r) =>
        r.id === id ? { ...r, rescueRecord: record } : r
      ),
    })),

  completeInspection: (id, result, nextDate) =>
    set((state) => ({
      inspections: state.inspections.map((i) =>
        i.id === id ? { ...i, status: 'completed' as const, result, nextDate } : i
      ),
    })),

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
}))
