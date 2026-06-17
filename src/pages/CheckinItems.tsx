import { useParams, useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useStore } from '@/store'
import PageHeader from '@/components/PageHeader'

export default function CheckinItems() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const checkinRecords = useStore((s) => s.checkinRecords)
  const dispatchOrders = useStore((s) => s.dispatchOrders)
  const updateMaintenanceItem = useStore((s) => s.updateMaintenanceItem)
  const completeDispatch = useStore((s) => s.completeDispatch)

  const record = checkinRecords.find((cr) => cr.id === id)
  const order = record
    ? dispatchOrders.find((d) => d.id === record.dispatchId)
    : undefined

  if (!record || !order) {
    return (
      <div className="min-h-screen bg-surface-50">
        <PageHeader title="保养项目" showBack />
        <div className="pt-12 text-center text-sm text-gray-400 py-12">未找到打卡记录</div>
      </div>
    )
  }

  const items = order.items
  const checkedCount = items.filter((i) => i.checked).length
  const totalCount = items.length
  const allChecked = checkedCount === totalCount
  const categories = Array.from(new Set(items.map((i) => i.category)))

  const handleSubmit = () => {
    completeDispatch(order.id)
    navigate('/dispatch')
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <PageHeader
        title="保养项目"
        showBack
        rightAction={
          <span className="text-xs font-medium text-primary-500">
            {checkedCount}/{totalCount}
          </span>
        }
      />

      <div className="pt-14 pb-28 px-4">
        <div className="mt-3 h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary-500 transition-all"
            style={{ width: `${totalCount ? (checkedCount / totalCount) * 100 : 0}%` }}
          />
        </div>

        <div className="mt-4 space-y-4">
          {categories.map((category) => (
            <div key={category} className="rounded-card bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-gray-800 mb-3">{category}</p>
              <div className="space-y-3">
                {items
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={(e) =>
                            updateMaintenanceItem(order.id, item.id, e.target.checked)
                          }
                          className="rounded border-gray-300 text-primary-500 focus:ring-primary-500 h-4 w-4"
                        />
                        <span
                          className={`text-sm ${
                            item.checked ? 'text-gray-400 line-through' : 'text-gray-700'
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>
                      {item.checked && <Check size={16} className="text-success-500" />}
                    </label>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-lg mx-auto space-y-2">
          <button
            onClick={() => navigate(`/checkin/${id}/parts`)}
            className="w-full rounded-lg border border-primary-500 py-3 text-sm font-medium text-primary-500"
          >
            添加更换零件
          </button>
          <button
            onClick={handleSubmit}
            disabled={!allChecked}
            className={`w-full rounded-lg py-3 text-sm font-medium text-white ${
              allChecked ? 'bg-primary-500' : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            提交保养报告
          </button>
        </div>
      </div>
    </div>
  )
}
