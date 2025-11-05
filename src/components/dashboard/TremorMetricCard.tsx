import { Metric, Text, Card as TremorCard } from '@tremor/react'
import { LucideIcon } from 'lucide-react'

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
    <TremorCard className={className}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Text className="text-sm font-medium text-gray-600">{title}</Text>
          <Metric className="mt-2 text-2xl font-bold text-gray-900">
            {value}
          </Metric>
          {description && (
            <Text className="mt-1 text-xs text-gray-500">{description}</Text>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`text-xs font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value}%
              </span>
              <Text className="text-xs text-gray-500">vs período anterior</Text>
            </div>
          )}
        </div>
        {Icon && (
          <div className="ml-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
        )}
      </div>
    </TremorCard>
  )
}

export default TremorMetricCard

