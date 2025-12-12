import { useMemo } from 'react'
import { Calendar, TrendingUp, BarChart3 } from 'lucide-react'
import ChartCard from '@/components/dashboard/ChartCard'
import LineChart from '@/components/charts/LineChart'
import BarChart from '@/components/charts/BarChart'
import { useCards } from '@/lib/api/queries'
import { aggregateByPeriod } from '@/lib/utils/calculations'
import {
  filterCardsByPeriod,
  filterCardsByUser,
  filterCardsByChannel,
} from '@/lib/utils/calculations'
import type { DashboardFilters, Card } from '@/types/crm'

interface TemporalComparisonProps {
  filters?: DashboardFilters
}

const TemporalComparison = ({ filters }: TemporalComparisonProps) => {
  const { data: cards = [], isLoading, isError } = useCards(filters)

  const filteredCards = useMemo(() => {
    let filtered: Card[] = cards

    if (filters?.startDate || filters?.endDate) {
      filtered = filterCardsByPeriod(
        filtered,
        filters.startDate,
        filters.endDate
      )
    }

    if (filters?.userId) {
      filtered = filterCardsByUser(filtered, filters.userId)
    }

    if (filters?.channelId) {
      filtered = filterCardsByChannel(filtered, filters.channelId)
    }

    return filtered
  }, [cards, filters])

  const monthlyData = useMemo(() => {
    const aggregated = aggregateByPeriod(filteredCards, 'month')
    return Object.entries(aggregated)
      .map(([period, data]) => ({
        period,
        leads: data.count,
        value: data.value,
      }))
      .sort((a, b) => a.period.localeCompare(b.period))
  }, [filteredCards])

  const weeklyData = useMemo(() => {
    const aggregated = aggregateByPeriod(filteredCards, 'week')
    return Object.entries(aggregated)
      .map(([period, data]) => ({
        period,
        leads: data.count,
        value: data.value,
      }))
      .sort((a, b) => a.period.localeCompare(b.period))
      .slice(-12)
  }, [filteredCards])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-[300px] animate-pulse rounded-xl bg-gray-800/50 border border-gray-700/50" />
        <div className="h-[300px] animate-pulse rounded-xl bg-gray-800/50 border border-gray-700/50" />
      </div>
    )
  }

  if (isError) {
    return (
      <ChartCard title="Comparações Temporais" className="text-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-red-400" />
          </div>
          <p className="text-red-400 font-medium">Erro ao carregar dados</p>
        </div>
      </ChartCard>
    )
  }

  if (monthlyData.length === 0) {
    return (
      <ChartCard title="Comparações Temporais" className="text-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gray-700/50 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-gray-500" />
          </div>
          <p className="text-gray-400">Nenhum dado disponível</p>
        </div>
      </ChartCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Gráfico Mensal - Leads */}
      <ChartCard 
        title="Comparação Mês a Mês - Quantidade de Leads"
        icon={<TrendingUp className="h-4 w-4 text-[#c8fa00]" />}
      >
        <LineChart
          data={monthlyData}
          dataKey="period"
          lines={[
            {
              key: 'leads',
              name: 'Leads',
              color: '#c8fa00',
            },
          ]}
          xAxisKey="period"
          height={300}
        />
      </ChartCard>

      {/* Gráfico Mensal - Valores */}
      <ChartCard 
        title="Comparação Mês a Mês - Valores"
        icon={<BarChart3 className="h-4 w-4 text-[#c8fa00]" />}
      >
        <BarChart
          data={monthlyData}
          bars={[
            {
              key: 'value',
              name: 'Valor (R$)',
              color: '#10b981',
            },
          ]}
          xAxisKey="period"
          height={300}
        />
      </ChartCard>

      {/* Gráfico Semanal */}
      {weeklyData.length > 0 && (
        <ChartCard 
          title="Comparação Semanal - Últimas 12 Semanas"
          icon={<Calendar className="h-4 w-4 text-[#c8fa00]" />}
        >
          <LineChart
            data={weeklyData}
            dataKey="period"
            lines={[
              {
                key: 'leads',
                name: 'Leads',
                color: '#c8fa00',
              },
              {
                key: 'value',
                name: 'Valor (R$)',
                color: '#3b82f6',
              },
            ]}
            xAxisKey="period"
            height={300}
          />
        </ChartCard>
      )}
    </div>
  )
}

export default TemporalComparison
