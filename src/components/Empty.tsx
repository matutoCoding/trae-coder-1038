import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

interface EmptyProps {
  title?: string
  description?: string
  icon?: ReactNode
}

export default function Empty({ title = '暂无数据', description, icon }: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="text-gray-300 mb-3">{icon ?? <Inbox size={48} />}</div>
      <p className="text-sm text-gray-500">{title}</p>
      {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
    </div>
  )
}
