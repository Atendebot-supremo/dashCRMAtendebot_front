import { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface ChartCardProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
  icon?: ReactNode
}

const ChartCard = ({
  title,
  description,
  children,
  className,
  icon,
}: ChartCardProps) => {
  return (
    <div className={cn(
      'group relative rounded-xl border border-gray-700/50 bg-gray-800/80 backdrop-blur-xl shadow-xl shadow-black/10 overflow-hidden transition-all duration-300 hover:border-gray-600/50',
      className
    )}>
      {/* Header */}
      <div className="border-b border-gray-700/50 px-6 py-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#c8fa00]/10">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-base font-semibold text-white">{title}</h3>
            {description && (
              <p className="text-xs text-gray-500 mt-0.5">{description}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}

export default ChartCard
