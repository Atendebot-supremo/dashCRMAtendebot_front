import { useMemo } from 'react'
import ChartCard from '@/components/dashboard/ChartCard'
import FunnelChart from '@/components/charts/FunnelChart'
import BarChart from '@/components/charts/BarChart'
import { Skeleton } from '@/components/ui/skeleton'
import { useCards } from '@/lib/api/queries'
import { calculateFunnelMetrics } from '@/lib/utils/calculations'
import { filterCardsByPeriod, filterCardsByUser, filterCardsByChannel } from '@/lib/utils/calculations'
import { formatCurrency, formatPercentage } from '@/lib/utils/format'
import type { DashboardFilters } from '@/lib/api/helena-types'
import type { Card } from '@/lib/api/helena-types'

interface FunilViewProps {
  filters?: DashboardFilters
}

const FunilView = ({ filters }: FunilViewProps) => {
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

  const funnelMetrics = useMemo(() => {
    return calculateFunnelMetrics(filteredCards)
  }, [filteredCards])

  const chartData = useMemo(() => {
    return funnelMetrics.map((metric) => ({
      stage: metric.stage,
      leads: metric.leads,
      value: metric.value,
      conversionRate: metric.conversionRate,
    }))
  }, [funnelMetrics])

  const valueChartData = useMemo(() => {
    return funnelMetrics.map((metric) => ({
      name: metric.stage,
      value: metric.value,
    }))
  }, [funnelMetrics])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    )
  }

  if (isError) {
    return (
      <ChartCard title="Funil de Vendas" className="text-center py-8">
        <p className="text-destructive">Erro ao carregar dados do funil</p>
      </ChartCard>
    )
  }

  if (funnelMetrics.length === 0) {
    return (
      <ChartCard title="Funil de Vendas" className="text-center py-8">
        <p className="text-muted-foreground">Nenhum dado disponível</p>
      </ChartCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Gráfico de Funil */}
      <ChartCard title="Funil de Vendas - Quantidade de Leads por Etapa">
        <FunnelChart data={chartData} height={400} />
      </ChartCard>

      {/* Gráfico de Valores */}
      <ChartCard title="Valor em Reais por Etapa">
        <BarChart
          data={valueChartData}
          bars={[{ key: 'value', name: 'Valor (R$)', color: 'hsl(var(--chart-1))' }]}
          xAxisKey="name"
          height={300}
        />
      </ChartCard>

      {/* Tabela de Métricas */}
      <ChartCard title="Métricas Detalhadas por Etapa">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Etapa</th>
                <th className="text-right p-2">Leads</th>
                <th className="text-right p-2">Valor Total</th>
                <th className="text-right p-2">Taxa de Conversão</th>
                <th className="text-right p-2">Tempo Médio</th>
              </tr>
            </thead>
            <tbody>
              {funnelMetrics.map((metric, index) => (
                <tr key={index} className="border-b hover:bg-muted/50">
                  <td className="p-2 font-medium">{metric.stage}</td>
                  <td className="p-2 text-right">{metric.leads}</td>
                  <td className="p-2 text-right">
                    {formatCurrency(metric.value)}
                  </td>
                  <td className="p-2 text-right">
                    {formatPercentage(metric.conversionRate)}
                  </td>
                  <td className="p-2 text-right">
                    {metric.averageTime.toFixed(1)} dias
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

export default FunilView

