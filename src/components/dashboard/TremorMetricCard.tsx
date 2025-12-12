import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface TremorMetricCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

const TremorMetricCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: TremorMetricCardProps) => {
  return (
    <div className={`group relative rounded-xl border border-gray-700/50 bg-gray-800/80 backdrop-blur-xl p-6 shadow-xl shadow-black/10 transition-all duration-300 hover:border-gray-600/50 hover:shadow-2xl hover:shadow-[#c8fa00]/5 ${className || ''}`}>
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#c8fa00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-white tracking-tight">
            {value}
          </p>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
          {trend && (
            <div className="flex items-center gap-2 mt-2">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                trend.isPositive 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : 'bg-red-500/10 text-red-400'
              }`}>
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {trend.isPositive ? '+' : ''}{trend.value}%
              </div>
              <span className="text-xs text-gray-500">vs período anterior</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="ml-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#c8fa00]/20 to-[#c8fa00]/5 border border-[#c8fa00]/20 shadow-lg shadow-[#c8fa00]/10">
            <Icon className="h-7 w-7 text-[#c8fa00]" />
          </div>
        )}
      </div>
    </div>
  )
}

export default TremorMetricCard
