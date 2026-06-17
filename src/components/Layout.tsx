import { Outlet } from 'react-router-dom'
import TabBar from '@/components/TabBar'

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-surface-50">
      <div className="flex-1 pb-16 overflow-y-auto scrollbar-hide">
        <Outlet />
      </div>
      <TabBar />
    </div>
  )
}
