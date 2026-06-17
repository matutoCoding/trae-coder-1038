import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { useStore } from '@/store'
import PageHeader from '@/components/PageHeader'
import type { PartReplacement } from '@/types'

export default function CheckinParts() {
  const { id } = useParams<{ id: string }>()
  const checkinRecords = useStore((s) => s.checkinRecords)
  const addPartReplacement = useStore((s) => s.addPartReplacement)

  const [name, setName] = useState('')
  const [model, setModel] = useState('')
  const [quantity, setQuantity] = useState('')

  const record = checkinRecords.find((cr) => cr.id === id)

  if (!record) {
    return (
      <div className="min-h-screen bg-surface-50">
        <PageHeader title="更换零件" showBack />
        <div className="pt-12 text-center text-sm text-gray-400 py-12">未找到打卡记录</div>
      </div>
    )
  }

  const handleAdd = () => {
    if (!name.trim() || !model.trim() || !quantity) return

    const part: PartReplacement = {
      id: `part-${Date.now()}`,
      name: name.trim(),
      model: model.trim(),
      quantity: Number(quantity),
      photos: [],
      replacedAt: new Date().toISOString(),
    }
    addPartReplacement(record.id, part)
    setName('')
    setModel('')
    setQuantity('')
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <PageHeader title="更换零件" showBack />

      <div className="pt-14 pb-40 px-4">
        {record.parts.length > 0 ? (
          <div className="mt-3 space-y-3">
            {record.parts.map((part) => (
              <div
                key={part.id}
                className="rounded-card bg-white p-4 shadow-sm flex items-start justify-between"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-800">{part.name}</p>
                  <p className="text-xs text-gray-500">型号：{part.model}</p>
                  <p className="text-xs text-gray-500">数量：{part.quantity}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(part.replacedAt).toLocaleString()}
                  </p>
                </div>
                <button className="text-gray-300 active:text-danger-500 p-1">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-12 text-center text-sm text-gray-400">暂无更换零件记录</div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-lg mx-auto space-y-3">
          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="零件名称"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="型号"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="数量"
              min={1}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
            <button
              onClick={handleAdd}
              disabled={!name.trim() || !model.trim() || !quantity}
              className={`rounded-lg px-6 py-2 text-sm font-medium text-white ${
                name.trim() && model.trim() && quantity
                  ? 'bg-primary-500'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              添加
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
