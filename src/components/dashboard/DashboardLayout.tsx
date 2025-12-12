import { ReactNode, useState, useEffect } from 'react'
import { LogOut, User, ChevronDown, LayoutDashboard } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#c8fa00]/10 via-transparent to-transparent rotate-12" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#c8fa00]/5 via-transparent to-transparent -rotate-12" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#c8fa00]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-[#c8fa00]/3 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-gray-700/50 bg-gray-800/80 backdrop-blur-xl shadow-lg shadow-black/10">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <img 
              src="/logo_verde-300x78.png" 
              alt="AtendeBot" 
              className="h-8 object-contain"
            />
            <div className="h-6 w-px bg-gray-600" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c8fa00]/10">
                <LayoutDashboard className="h-4 w-4 text-[#c8fa00]" />
              </div>
              <span className="text-lg font-semibold text-white">Dashboard CRM</span>
            </div>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              onBlur={() => setTimeout(() => setShowMenu(false), 200)}
              className="flex items-center gap-3 rounded-xl px-4 py-2 text-sm text-gray-300 transition-all duration-200 hover:bg-gray-700/50 border border-transparent hover:border-gray-600/50"
              aria-label="Menu do usuário"
              tabIndex={0}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#c8fa00] to-[#a8d600] text-gray-900 shadow-lg shadow-[#c8fa00]/20">
                <User className="h-4 w-4" />
              </div>
              <div className="text-left hidden sm:block">
                <span className="font-medium text-white block">
                  {user?.name || 'Usuário'}
                </span>
                <span className="text-xs text-gray-500">Administrador</span>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-700/50 bg-gray-800/95 backdrop-blur-xl py-2 shadow-2xl shadow-black/30">
                <div className="border-b border-gray-700/50 px-4 py-3">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{user?.phone}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                    tabIndex={0}
                    aria-label="Sair da conta"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair da conta
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8">
        <div className="space-y-6">{children}</div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-700/50 bg-gray-800/50 backdrop-blur-sm py-4 mt-8">
        <div className="container mx-auto px-6">
          <p className="text-center text-gray-500 text-xs">
            © {new Date().getFullYear()} AtendeBot. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default DashboardLayout
