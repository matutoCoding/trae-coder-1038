import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, User, Building, FileText, AlertCircle, ChevronRight } from 'lucide-react'
import { useStore } from '@/store'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'

export default function InspectionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const inspections = useStore((s) => s.inspections)
  const elevators = useStore((s) => s.elevators)

  const inspection = inspections.find((i) => i.id === id)
  const elevator = elevators.find((e) => e.id === inspection?.elevatorId)

  if (!inspection) {
    return (
      <div className="min-h-screen bg-surface-50">
        <PageHeader title="年检详情" showBack />
        <div className="pt-16 text-center text-sm text-gray-400">未找到年检记录</div>
      </div>
    )
  }

  const typeLabel = inspection.type === 'annual' ? '年度检验' : '定期检验'

  return (
    <div className="min-h-screen bg-surface-50">
      <PageHeader title={typeLabel} showBack />

      <div className="pt-14 px-4 pb-8 space-y-3">
        {elevator && (
          <button
            onClick={() => navigate(`/elevators/${elevator.id}`)}
            className="w-full rounded-card bg-white p-4 shadow-sm flex items-center justify-between hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <Building size={18} className="text-primary-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-800">{elevator.code}</p>
                <p className="text-xs text-gray-400">{elevator.community}</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-gray-300" />
          </button>
        )}

        <div className="rounded-card bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-800">{typeLabel}</p>
            <StatusBadge status={inspection.status} type="inspection" />
          </div>
          {inspection.result && (
            <p className="mt-2 text-xs text-gray-500">
              结果：
              <span className={inspection.result === 'pass' ? 'text-success-600' : 'text-danger-600'}>
                {inspection.result === 'pass' ? '合格' : '不合格'}
              </span>
            </p>
          )}
        </div>

        <div className="rounded-card bg-white shadow-sm divide-y divide-gray-100">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600">计划日期</span>
            </div>
            <span className="text-sm text-gray-800">{inspection.scheduledDate}</span>
          </div>
          {inspection.inspectionDate && (
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-success-500" />
                <span className="text-sm text-gray-600">实际检验日期</span>
              </div>
              <span className="text-sm text-gray-800">{inspection.inspectionDate}</span>
            </div>
          )}
          {inspection.nextDate && (
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-primary-500" />
                <span className="text-sm text-gray-600">下次检验日期</span>
              </div>
              <span className="text-sm text-gray-800">{inspection.nextDate}</span>
            </div>
          )}
        </div>

        <div className="rounded-card bg-white shadow-sm divide-y divide-gray-100">
          {inspection.inspectorName && (
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User size={14} className="text-gray-400" />
                <span className="text-sm text-gray-600">检验员</span>
              </div>
              <span className="text-sm text-gray-800">{inspection.inspectorName}</span>
            </div>
          )}
          {inspection.inspectorOrg && (
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building size={14} className="text-gray-400" />
                <span className="text-sm text-gray-600">检验机构</span>
              </div>
              <span className="text-sm text-gray-800">{inspection.inspectorOrg}</span>
            </div>
          )}
        </div>

        {inspection.remark && (
          <div className="rounded-card bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={14} className="text-safety-500" />
              <p className="text-sm font-medium text-gray-800">备注</p>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{inspection.remark}</p>
          </div>
        )}

        <div className="rounded-card bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={14} className="text-primary-500" />
            <p className="text-sm font-medium text-gray-800">检验报告</p>
          </div>
          {inspection.reportAttachment ? (
            <button className="w-full rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 flex items-center gap-3 hover:bg-gray-100">
              <div className="h-10 w-10 rounded bg-primary-50 flex items-center justify-center">
                <FileText size={18} className="text-primary-500" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm text-gray-700">{inspection.reportAttachment}</p>
                <p className="text-xs text-gray-400">点击查看</p>
              </div>
              <ChevronRight size={14} className="text-gray-300" />
            </button>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-center">
              <p className="text-xs text-gray-400">暂无报告附件</p>
            </div>
          )}
        </div>

        <div className="rounded-card bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-800 mb-2">现场照片</p>
          <div className="grid grid-cols-3 gap-2">
            {inspection.photos && inspection.photos.length > 0 ? (
              inspection.photos.map((photo, idx) => (
                <div key={idx} className="aspect-square rounded bg-gray-100" />
              ))
            ) : (
              <div className="col-span-3 py-6 text-center">
                <p className="text-xs text-gray-400">暂无照片</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
