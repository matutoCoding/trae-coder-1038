import { useState } from 'react'
import { useStore } from '@/store'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import type { MaintenanceContract } from '@/types'

const filterTabs = [
  { key: 'all', label: '全部' },
  { key: 'expiring', label: '即将到期' },
  { key: 'expired', label: '已过期' },
]

function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate)
  const now = new Date()
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function getDaysColor(days: number): string {
  if (days < 0) return 'text-danger-500'
  if (days <= 30) return 'text-danger-500'
  if (days <= 60) return 'text-safety-500'
  return 'text-success-500'
}

export default function ContractList() {
  const contracts = useStore((s) => s.contracts)
  const elevators = useStore((s) => s.elevators)
  const [activeTab, setActiveTab] = useState('all')

  const filtered = contracts.filter((c) => {
    if (activeTab === 'all') return true
    return c.status === activeTab
  })

  return (
    <div className="min-h-screen bg-surface-50">
      <PageHeader title="合同到期提醒" showBack />

      <div className="pt-12">
        <div className="px-4 pt-3">
          <div className="flex gap-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
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

        <div className="space-y-3 px-4 pt-4 pb-6">
          {filtered.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              elevatorCode={
                elevators.find((e) => e.id === contract.elevatorId)?.code ?? '-'
              }
            />
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-400">暂无数据</div>
          )}
        </div>
      </div>
    </div>
  )
}

function ContractCard({
  contract,
  elevatorCode,
}: {
  contract: MaintenanceContract
  elevatorCode: string
}) {
  const daysRemaining = getDaysRemaining(contract.endDate)
  const daysColor = getDaysColor(daysRemaining)
  const displayDays = daysRemaining >= 0 ? daysRemaining : 0

  return (
    <div className="rounded-card bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800">{elevatorCode}</span>
        <StatusBadge status={contract.status} type="contract" />
      </div>
      <p className="mt-1.5 text-xs text-gray-500">{contract.companyName}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-gray-400">到期 {contract.endDate}</span>
        <span className={`text-sm font-bold ${daysColor}`}>
          {daysRemaining < 0 ? '已过期' : `剩余${displayDays}天`}
        </span>
      </div>
    </div>
  )
}
