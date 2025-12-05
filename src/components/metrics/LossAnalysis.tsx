import { useMemo } from 'react'
import ChartCard from '@/components/dashboard/ChartCard'
import BarChart from '@/components/charts/BarChart'
import PieChart from '@/components/charts/PieChart'
import { Skeleton } from '@/components/ui/skeleton'
import { useCards } from '@/lib/api/queries'
import { calculateLostValue } from '@/lib/utils/calculations'
import {
  filterCardsByPeriod,
  filterCardsByUser,
  filterCardsByChannel,
} from '@/lib/utils/calculations'
import { formatCurrency } from '@/lib/utils/format'
import type { DashboardFilters } from '@/lib/api/helena-types'
import type { Card } from '@/lib/api/helena-types'

interface LossAnalysisProps {
  filters?: DashboardFilters
}

const LossAnalysis = ({ filters }: LossAnalysisProps) => {
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

  const lostMetrics = useMemo(() => {
    return calculateLostValue(filteredCards)
  }, [filteredCards])

  const totalLostValue = useMemo(() => {
    return lostMetrics.reduce((sum, item) => sum + item.value, 0)
  }, [lostMetrics])

  const barChartData = useMemo(() => {
    return lostMetrics.map((metric) => ({
      name: metric.reason,
      value: metric.value,
      count: metric.count,
    }))
  }, [lostMetrics])

  const pieChartData = useMemo(() => {
    return lostMetrics.map((metric) => ({
      name: metric.reason,
      value: metric.value,
    }))
  }, [lostMetrics])

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
      <ChartCard title="Análise de Perdas" className="text-center py-8">
        <p className="text-destructive">Erro ao carregar dados</p>
      </ChartCard>
    )
  }

  if (lostMetrics.length === 0) {
    return (
      <ChartCard title="Análise de Perdas" className="text-center py-8">
        <p className="text-muted-foreground">Nenhuma perda registrada</p>
      </ChartCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <ChartCard title="Valor Total Perdido">
          <div className="text-3xl font-bold text-destructive">
            {formatCurrency(totalLostValue)}
          </div>
        </ChartCard>
        <ChartCard title="Total de Perdas">
          <div className="text-3xl font-bold">
            {lostMetrics.reduce((sum, item) => sum + item.count, 0)}
          </div>
        </ChartCard>
        <ChartCard title="Motivos Diferentes">
          <div className="text-3xl font-bold">{lostMetrics.length}</div>
        </ChartCard>
      </div>

      {/* Gráfico de Barras - Valor por Motivo */}
      <ChartCard title="Valor Perdido por Motivo">
        <BarChart
          data={barChartData}
          bars={[
            {
              key: 'value',
              name: 'Valor Perdido (R$)',
              color: 'hsl(var(--destructive))',
            },
          ]}
          xAxisKey="name"
          height={300}
        />
      </ChartCard>

      {/* Gráfico de Pizza - Distribuição */}
      <ChartCard title="Distribuição de Perdas por Motivo">
        <PieChart data={pieChartData} height={300} />
      </ChartCard>

      {/* Tabela Detalhada */}
      <ChartCard title="Detalhes de Perdas por Motivo">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Motivo</th>
                <th className="text-right p-2">Quantidade</th>
                <th className="text-right p-2">Valor Total</th>
                <th className="text-right p-2">Valor Médio</th>
              </tr>
            </thead>
            <tbody>
              {lostMetrics.map((metric, index) => (
                <tr key={index} className="border-b hover:bg-muted/50">
                  <td className="p-2 font-medium">{metric.reason}</td>
                  <td className="p-2 text-right">{metric.count}</td>
                  <td className="p-2 text-right text-destructive">
                    {formatCurrency(metric.value)}
                  </td>
                  <td className="p-2 text-right">
                    {formatCurrency(metric.value / metric.count)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  )
}

export default LossAnalysis

