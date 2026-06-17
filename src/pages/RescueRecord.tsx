import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ImagePlus } from 'lucide-react'
import { useStore } from '@/store'
import PageHeader from '@/components/PageHeader'

const causes = [
  '门锁故障',
  '停电',
  '控制系统故障',
  '机械卡阻',
  '乘客操作不当',
  '其他',
]

export default function RescueRecord() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const addRescueRecord = useStore((s) => s.addRescueRecord)
  const updateRescueStatus = useStore((s) => s.updateRescueStatus)

  const [cause, setCause] = useState('')
  const [process, setProcess] = useState('')
  const [result, setResult] = useState('')

  const handleSubmit = () => {
    if (!id || !cause || !process || !result) return
    addRescueRecord(id, {
      cause,
      process,
      result,
      photos: [],
    })
    updateRescueStatus(id, 'rescued')
    navigate(`/rescue/${id}`)
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <PageHeader title="救援记录" showBack />

      <div className="pt-12 px-4 pb-6 space-y-4">
        <div className="rounded-card bg-white p-4 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">困人原因</label>
            <select
              value={cause}
              onChange={(e) => setCause(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            >
              <option value="">请选择困人原因</option>
              {causes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">救援过程描述</label>
            <textarea
              value={process}
              onChange={(e) => setProcess(e.target.value)}
              rows={4}
              placeholder="请描述救援过程..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">处理结果</label>
            <textarea
              value={result}
              onChange={(e) => setResult(e.target.value)}
              rows={3}
              placeholder="请描述处理结果..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">图片上传</label>
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-300"
                >
                  <ImagePlus size={24} className="text-gray-300" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!cause || !process || !result}
          className="w-full rounded-lg bg-primary-500 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          提交
        </button>
      </div>
    </div>
  )
}
