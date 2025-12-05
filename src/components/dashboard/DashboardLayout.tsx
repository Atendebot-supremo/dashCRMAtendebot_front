import { ReactNode } from 'react'
import { BarChart3, LogOut, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

interface DashboardLayoutProps {
  children: ReactNode
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header - Similar ao AtendeBot */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-[#3B82F6]" />
            <h1 className="text-xl font-semibold text-gray-900">Dashboard CRM</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {user?.name || 'Usuário'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Sair"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Fundo cinza claro como AtendeBot */}
      <main className="container mx-auto px-6 py-6">
        <div className="space-y-6">{children}</div>
      </main>
    </div>
  )
}

export default DashboardLayout

