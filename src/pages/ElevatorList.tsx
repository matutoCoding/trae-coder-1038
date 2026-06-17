import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, Plus } from 'lucide-react'
import { useStore } from '@/store'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import type { Elevator } from '@/types'

const statusTabs = [
  { key: 'all', label: '全部' },
  { key: 'normal', label: '正常' },
  { key: 'maintenance', label: '维保中' },
  { key: 'fault', label: '故障' },
  { key: 'disabled', label: '停用' },
]

export default function ElevatorList() {
  const navigate = useNavigate()
  const elevators = useStore((s) => s.elevators)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const filtered = elevators.filter((e) => {
    const matchSearch =
      e.code.includes(search) || e.address.includes(search) || e.brand.includes(search)
    const matchTab = activeTab === 'all' || e.status === activeTab
    return matchSearch && matchTab
  })

  return (
    <div className="min-h-screen bg-surface-50">
      <PageHeader title="电梯台账" />

      <div className="pt-12 pb-20">
        <div className="px-4 pt-3">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        <div className="px-4 pt-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 px-4 pt-3">
          {filtered.map((elevator) => (
            <ElevatorCard
              key={elevator.id}
              elevator={elevator}
              onClick={() => navigate(`/elevators/${elevator.id}`)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-400">暂无数据</div>
          )}
        </div>
      </div>

      <button className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg">
        <Plus size={24} />
      </button>
    </div>
  )
}

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2">
      <div className="flex flex-1 items-center gap-2 rounded-lg bg-white px-3 py-2">
        <Search size={16} className="text-gray-400" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="搜索编号、地址、品牌"
          className="flex-1 text-sm outline-none placeholder:text-gray-300"
        />
      </div>
      <button className="flex items-center justify-center rounded-lg bg-white px-3">
        <SlidersHorizontal size={18} className="text-gray-500" />
      </button>
    </div>
  )
}

function ElevatorCard({
  elevator,
  onClick,
}: {
  elevator: Elevator
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-card bg-white p-4 text-left shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800">{elevator.code}</span>
        <StatusBadge status={elevator.status} type="elevator" />
      </div>
      <p className="mt-1.5 text-xs text-gray-500">{elevator.address}</p>
      <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
        <span>{elevator.brand}</span>
        <span>{elevator.floorCount}层</span>
        <span>年检 {elevator.nextInspection}</span>
      </div>
    </button>
  )
}
