import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  showBack?: boolean
  rightAction?: ReactNode
}

export default function PageHeader({ title, showBack, rightAction }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-12 px-4 max-w-lg mx-auto">
        <div className="flex items-center w-10">
          {showBack && (
            <button onClick={() => navigate(-1)} className="flex items-center">
              <ChevronLeft size={24} className="text-gray-700" />
            </button>
          )}
        </div>
        <h1 className="text-base font-medium text-gray-900 truncate">{title}</h1>
        <div className="flex items-center justify-end w-10">{rightAction}</div>
      </div>
    </header>
  )
}
