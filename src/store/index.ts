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

const STORAGE_KEY = 'elevator-maintenance-app'

interface PersistedState {
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
}

interface StoreState extends PersistedState {
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

function loadPersistedState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedState
      if (parsed.elevators && parsed.dispatchOrders) {
        return parsed
      }
    }
  } catch {}
  return null
}

function persistState(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

const defaultState: PersistedState = {
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
}

const initialState = loadPersistedState() ?? defaultState

export const useStore = create<StoreState>()((set) => ({
  ...initialState,
  activeRescueTimer: null,

  login: (phone, _password) => {
    const user = mockUsers.find((u) => u.phone === phone)
    if (user) {
      set((state) => {
        const next = { ...state, currentUser: user }
        persistState(next)
        return { currentUser: user }
      })
      return true
    }
    return false
  },

  logout: () => set((state) => {
    const next = { ...state, currentUser: null }
    persistState(next)
    return { currentUser: null }
  }),

  updateElevatorStatus: (id, status) =>
    set((state) => {
      const next = { ...state, elevators: state.elevators.map((e) => (e.id === id ? { ...e, status } : e)) }
      persistState(next)
      return { elevators: next.elevators }
    }),

  disableElevator: (id, reason) =>
    set((state) => {
      const next = {
        ...state,
        elevators: state.elevators.map((e) =>
          e.id === id ? { ...e, status: 'disabled' as const, disabledReason: reason, disabledAt: new Date().toISOString() } : e
        ),
      }
      persistState(next)
      return { elevators: next.elevators }
    }),

  enableElevator: (id) =>
    set((state) => {
      const next = {
        ...state,
        elevators: state.elevators.map((e) =>
          e.id === id ? { ...e, status: 'normal' as const, disabledReason: undefined, disabledAt: undefined } : e
        ),
      }
      persistState(next)
      return { elevators: next.elevators }
    }),

  acceptDispatch: (id) =>
    set((state) => {
      const next = { ...state, dispatchOrders: state.dispatchOrders.map((d) => (d.id === id ? { ...d, status: 'accepted' as const } : d)) }
      persistState(next)
      return { dispatchOrders: next.dispatchOrders }
    }),

  completeDispatch: (id) =>
    set((state) => {
      const now = new Date().toISOString()
      const next = {
        ...state,
        dispatchOrders: state.dispatchOrders.map((d) =>
          d.id === id ? { ...d, status: 'completed' as const, completedAt: now } : d
        ),
        checkinRecords: state.checkinRecords.map((cr) =>
          cr.dispatchId === id ? { ...cr, checkoutTime: now, items: (state.dispatchOrders.find((d) => d.id === id)?.items ?? cr.items) } : cr
        ),
      }
      persistState(next)
      return { dispatchOrders: next.dispatchOrders, checkinRecords: next.checkinRecords }
    }),

  updateMaintenanceItem: (dispatchId, itemId, checked, remark) =>
    set((state) => {
      const nextDispatchOrders = state.dispatchOrders.map((d) =>
        d.id === dispatchId
          ? {
              ...d,
              items: d.items.map((item) =>
                item.id === itemId ? { ...item, checked, ...(remark !== undefined ? { remark } : {}) } : item
              ),
            }
          : d
      )
      const nextCheckinRecords = state.checkinRecords.map((cr) =>
        cr.dispatchId === dispatchId
          ? {
              ...cr,
              items: cr.items.map((item) =>
                item.id === itemId ? { ...item, checked, ...(remark !== undefined ? { remark } : {}) } : item
              ),
            }
          : cr
      )
      const next = { ...state, dispatchOrders: nextDispatchOrders, checkinRecords: nextCheckinRecords }
      persistState(next)
      return { dispatchOrders: next.dispatchOrders, checkinRecords: next.checkinRecords }
    }),

  addCheckinRecord: (record) =>
    set((state) => {
      const next = { ...state, checkinRecords: [...state.checkinRecords, record] }
      persistState(next)
      return { checkinRecords: next.checkinRecords }
    }),

  addPartReplacement: (checkinId, part) =>
    set((state) => {
      const next = {
        ...state,
        checkinRecords: state.checkinRecords.map((cr) =>
          cr.id === checkinId ? { ...cr, parts: [...cr.parts, part] } : cr
        ),
      }
      persistState(next)
      return { checkinRecords: next.checkinRecords }
    }),

  createRepairOrder: (order) =>
    set((state) => {
      const next = { ...state, repairOrders: [...state.repairOrders, order] }
      persistState(next)
      return { repairOrders: next.repairOrders }
    }),

  updateRepairStatus: (id, status) =>
    set((state) => {
      const next = {
        ...state,
        repairOrders: state.repairOrders.map((r) =>
          r.id === id
            ? {
                ...r,
                status,
                ...(status === 'completed' ? { completedAt: new Date().toISOString() } : {}),
              }
            : r
        ),
      }
      persistState(next)
      return { repairOrders: next.repairOrders }
    }),

  assignRepair: (id, assigneeId, assigneeName) =>
    set((state) => {
      const next = {
        ...state,
        repairOrders: state.repairOrders.map((r) =>
          r.id === id ? { ...r, status: 'assigned' as const, assigneeId, assigneeName } : r
        ),
      }
      persistState(next)
      return { repairOrders: next.repairOrders }
    }),

  updateRescueStatus: (id, status) =>
    set((state) => {
      const next = {
        ...state,
        rescueOrders: state.rescueOrders.map((r) =>
          r.id === id
            ? {
                ...r,
                status,
                ...(status === 'en_route' ? { enRouteAt: new Date().toISOString() } : {}),
                ...(status === 'rescued' ? { rescuedAt: new Date().toISOString() } : {}),
                ...(status === 'closed' ? { closedAt: new Date().toISOString() } : {}),
              }
            : r
        ),
      }
      persistState(next)
      return { rescueOrders: next.rescueOrders }
    }),

  startRescueTimer: (orderId) =>
    set({ activeRescueTimer: { orderId, startTime: Date.now() } }),

  stopRescueTimer: () => set({ activeRescueTimer: null }),

  arriveRescue: (id, arrivedAt) =>
    set((state) => {
      const next = {
        ...state,
        rescueOrders: state.rescueOrders.map((r) =>
          r.id === id ? { ...r, status: 'arrived' as const, arrivedAt } : r
        ),
      }
      persistState(next)
      return { rescueOrders: next.rescueOrders, activeRescueTimer: null }
    }),

  addRescueRecord: (id, record) =>
    set((state) => {
      const next = {
        ...state,
        rescueOrders: state.rescueOrders.map((r) =>
          r.id === id ? { ...r, rescueRecord: record } : r
        ),
      }
      persistState(next)
      return { rescueOrders: next.rescueOrders }
    }),

  completeInspection: (id, result, nextDate) =>
    set((state) => {
      const next = {
        ...state,
        inspections: state.inspections.map((i) =>
          i.id === id ? { ...i, status: 'completed' as const, result, nextDate } : i
        ),
      }
      persistState(next)
      return { inspections: next.inspections }
    }),

  markNotificationRead: (id) =>
    set((state) => {
      const next = {
        ...state,
        notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      }
      persistState(next)
      return { notifications: next.notifications }
    }),
}))
