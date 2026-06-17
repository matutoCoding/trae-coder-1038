import { useStore } from '@/store'
import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import type { Certificate } from '@/types'

function getExpiryRatio(expiryDate: string): number {
  const now = new Date().getTime()
  const end = new Date(expiryDate).getTime()
  const remaining = end - now
  if (remaining <= 0) return 0
  const oneYear = 365 * 24 * 60 * 60 * 1000
  return Math.min(remaining / oneYear, 1)
}

function getBarColor(ratio: number): string {
  if (ratio > 0.6) return 'bg-success-500'
  if (ratio >= 0.3) return 'bg-safety-500'
  return 'bg-danger-500'
}

export default function CertificateList() {
  const certificates = useStore((s) => s.certificates)

  return (
    <div className="min-h-screen bg-surface-50">
      <PageHeader title="人员持证管理" showBack />

      <div className="pt-12">
        <div className="space-y-3 px-4 pt-4 pb-6">
          {certificates.map((cert) => (
            <CertificateCard key={cert.id} cert={cert} />
          ))}
          {certificates.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-400">暂无数据</div>
          )}
        </div>
      </div>
    </div>
  )
}

function CertificateCard({ cert }: { cert: Certificate }) {
  const ratio = getExpiryRatio(cert.expiryDate)
  const barColor = getBarColor(ratio)
  const percent = Math.round(ratio * 100)

  return (
    <div className="rounded-card bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800">{cert.userName}</span>
        <StatusBadge status={cert.status} type="certificate" />
      </div>
      <p className="mt-1 text-xs text-gray-500">{cert.certType}</p>
      <p className="mt-0.5 text-xs text-gray-400">编号：{cert.certNumber}</p>

      <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
        <span>{cert.issueDate}</span>
        <span>{cert.expiryDate}</span>
      </div>

      <div className="mt-1.5 h-1.5 w-full rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
