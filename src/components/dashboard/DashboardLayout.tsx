import { ReactNode, useState, useEffect } from 'react'
import { LogOut, User, ChevronDown } from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import type { AuthUser } from '@/types/crm'

interface DashboardLayoutProps {
  children: ReactNode
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    // Carregar dados do usuário do localStorage
    const userData = apiClient.getUserData()
    if (userData) {
      setUser(userData)
    }
  }, [])

  const handleLogout = () => {
    apiClient.logout()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src="/logo_verde-300x78.png" 
              alt="AtendeBot" 
              className="h-8 object-contain"
            />
            <div className="h-6 w-px bg-gray-300" />
            <span className="text-lg font-medium text-gray-700">Dashboard CRM</span>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              onBlur={() => setTimeout(() => setShowMenu(false), 200)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
              aria-label="Menu do usuário"
              tabIndex={0}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c8fa00] text-gray-900">
                <User className="h-4 w-4" />
              </div>
              <span className="font-medium">
                {user?.name || 'Usuário'}
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                <div className="border-b border-gray-100 px-4 py-2">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.phone}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                  tabIndex={0}
                  aria-label="Sair da conta"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        <div className="space-y-6">{children}</div>
      </main>
    </div>
  )
}

export default DashboardLayout
