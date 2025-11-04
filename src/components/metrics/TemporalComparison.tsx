import { useMemo } from 'react'
import ChartCard from '@/components/dashboard/ChartCard'
import LineChart from '@/components/charts/LineChart'
import BarChart from '@/components/charts/BarChart'
import { Skeleton } from '@/components/ui/skeleton'
import { useCards } from '@/lib/api/queries'
import { aggregateByPeriod } from '@/lib/utils/calculations'
import {
  filterCardsByPeriod,
  filterCardsByUser,
  filterCardsByChannel,
} from '@/lib/utils/calculations'
import { formatCurrency } from '@/lib/utils/format'
import type { DashboardFilters } from '@/lib/api/helena-types'
import type { Card } from '@/lib/api/helena-types'

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
      .slice(-12) // Últimas 12 semanas
  }, [filteredCards])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <ChartCard title="Comparações Temporais" className="text-center py-8">
        <p className="text-destructive">Erro ao carregar dados</p>
      </ChartCard>
    )
  }

  if (monthlyData.length === 0) {
    return (
      <ChartCard title="Comparações Temporais" className="text-center py-8">
        <p className="text-muted-foreground">Nenhum dado disponível</p>
      </ChartCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Gráfico Mensal - Leads */}
      <ChartCard title="Comparação Mês a Mês - Quantidade de Leads">
        <LineChart
          data={monthlyData}
          dataKey="period"
          lines={[
            {
              key: 'leads',
              name: 'Leads',
              color: 'hsl(var(--chart-1))',
            },
          ]}
          xAxisKey="period"
          height={300}
        />
      </ChartCard>

      {/* Gráfico Mensal - Valores */}
      <ChartCard title="Comparação Mês a Mês - Valores">
        <BarChart
          data={monthlyData}
          bars={[
            {
              key: 'value',
              name: 'Valor (R$)',
              color: 'hsl(var(--chart-2))',
            },
          ]}
          xAxisKey="period"
          height={300}
        />
      </ChartCard>

      {/* Gráfico Semanal */}
      {weeklyData.length > 0 && (
        <ChartCard title="Comparação Semanal - Últimas 12 Semanas">
          <LineChart
            data={weeklyData}
            dataKey="period"
            lines={[
              {
                key: 'leads',
                name: 'Leads',
                color: 'hsl(var(--chart-1))',
              },
              {
                key: 'value',
                name: 'Valor (R$)',
                color: 'hsl(var(--chart-2))',
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

