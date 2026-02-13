import { useMemo, useState } from 'react'
import { TrendingUp, BarChart3, TableIcon, ExternalLink, User, Calendar, DollarSign, ChevronRight, X } from 'lucide-react'
import FunnelChart from '@/components/charts/FunnelChart'
import ChartCard from '@/components/dashboard/ChartCard'
import { useCards } from '@/lib/api/queries'
import { calculateFunnelMetrics } from '@/lib/utils/calculations'
import { filterCardsByPeriod, filterCardsByUser, filterCardsByChannel } from '@/lib/utils/calculations'
import { getStageName } from '@/lib/utils/stage-mapping'
import { formatCurrency, formatPercentage } from '@/lib/utils/format'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import type { DashboardFilters, Card } from '@/types/crm'

interface FunilViewProps {
  filters?: DashboardFilters
}

interface SelectedStage {
  name: string
  cards: Card[]
}

const FunilView = ({ filters }: FunilViewProps) => {
  const { data: cards = [], isLoading, isError } = useCards(filters)
  const [selectedStage, setSelectedStage] = useState<SelectedStage | null>(null)

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

  // Agrupar cards por etapa para o modal
  const cardsByStage = useMemo(() => {
    const grouped: Record<string, Card[]> = {}
    filteredCards.forEach((card) => {
      const stageName = getStageName(card)
      if (!grouped[stageName]) {
        grouped[stageName] = []
      }
      grouped[stageName].push(card)
    })
    return grouped
  }, [filteredCards])

  const handleStageClick = (stageName: string) => {
    const stageCards = cardsByStage[stageName] || []
    setSelectedStage({
      name: stageName,
      cards: stageCards,
    })
  }

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
        <div className="h-[400px] animate-pulse rounded-xl bg-gray-800/50 border border-gray-700/50" />
        <div className="h-[300px] animate-pulse rounded-xl bg-gray-800/50 border border-gray-700/50" />
      </div>
    )
  }

  if (isError) {
    return (
      <ChartCard title="Funil de Vendas" className="text-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-red-400" />
          </div>
          <p className="text-red-400 font-medium">Erro ao carregar dados do funil</p>
        </div>
      </ChartCard>
    )
  }

  if (funnelMetrics.length === 0) {
    return (
      <ChartCard title="Funil de Vendas" className="text-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gray-700/50 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-gray-500" />
          </div>
          <p className="text-gray-400">Nenhum dado disponível</p>
        </div>
      </ChartCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Gráfico de Funil */}
      <ChartCard 
        title="Funil de Vendas - Quantidade de Leads por Etapa"
        icon={<TrendingUp className="h-4 w-4 text-[#c8fa00]" />}
      >
        <p className="text-xs text-gray-500 mb-2">Clique em uma barra para ver os cards da etapa</p>
        <div className="mt-2">
          <FunnelChart 
            data={chartData} 
            height={400} 
            onStageClick={handleStageClick}
          />
        </div>
      </ChartCard>

      {/* Gráfico de Valores */}
      <ChartCard 
        title="Valor em Reais por Etapa"
        icon={<BarChart3 className="h-4 w-4 text-[#c8fa00]" />}
      >
        <p className="text-xs text-gray-500 mb-3">Clique para ver os cards da etapa</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {valueChartData.map((item, index) => (
            <button 
              key={index}
              onClick={() => handleStageClick(item.name)}
              className="group relative p-4 rounded-xl bg-gray-700/30 border border-gray-600/30 hover:border-[#c8fa00]/30 transition-all duration-300 text-left cursor-pointer"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#c8fa00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-xs text-gray-400 truncate mb-2 group-hover:text-[#c8fa00] transition-colors">{item.name}</p>
              <p className="text-lg font-bold text-white">{formatCurrency(item.value)}</p>
              <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 opacity-0 group-hover:opacity-100 group-hover:text-[#c8fa00] transition-all" />
            </button>
          ))}
        </div>
      </ChartCard>

      {/* Tabela de Métricas */}
      <ChartCard 
        title="Métricas Detalhadas por Etapa"
        icon={<TableIcon className="h-4 w-4 text-[#c8fa00]" />}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700/50">
                <th className="text-left p-4 font-semibold text-gray-300">Etapa</th>
                <th className="text-right p-4 font-semibold text-gray-300">Leads</th>
                <th className="text-right p-4 font-semibold text-gray-300">Valor Total</th>
                <th className="text-right p-4 font-semibold text-gray-300">Taxa de Conversão</th>
                <th className="text-right p-4 font-semibold text-gray-300">Tempo Médio</th>
              </tr>
            </thead>
            <tbody>
              {funnelMetrics.map((metric, index) => (
                <tr 
                  key={index} 
                  className="border-b border-gray-700/30 hover:bg-gray-700/30 transition-colors cursor-pointer group"
                  onClick={() => handleStageClick(metric.stage)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleStageClick(metric.stage)
                    }
                  }}
                  aria-label={`Ver cards da etapa ${metric.stage}`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#c8fa00] to-[#a8d600] shadow-sm shadow-[#c8fa00]/20" />
                      <span className="font-medium text-white group-hover:text-[#c8fa00] transition-colors">{metric.stage}</span>
                      <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-[#c8fa00] opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#c8fa00]/10 text-[#c8fa00] border border-[#c8fa00]/20 group-hover:bg-[#c8fa00]/20 transition-colors">
                      {metric.leads}
                    </span>
                  </td>
                  <td className="p-4 text-right font-semibold text-white">
                    {formatCurrency(metric.value)}
                  </td>
                  <td className="p-4 text-right">
                    <span className={`font-medium ${metric.conversionRate >= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {formatPercentage(metric.conversionRate)}
                    </span>
                  </td>
                  <td className="p-4 text-right text-gray-400">
                    {metric.averageTime.toFixed(1)} dias
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* Modal de Cards da Etapa */}
      <Dialog open={!!selectedStage} onOpenChange={() => setSelectedStage(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#c8fa00] to-[#a8d600]" />
              {selectedStage?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedStage?.cards.length || 0} card{(selectedStage?.cards.length || 0) !== 1 ? 's' : ''} nesta etapa
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto -mx-6 px-6">
            {selectedStage?.cards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <div className="h-12 w-12 rounded-full bg-gray-700/50 flex items-center justify-center mb-3">
                  <TableIcon className="h-6 w-6" />
                </div>
                <p>Nenhum card nesta etapa</p>
              </div>
            ) : (
              <div className="space-y-3 py-2">
                {selectedStage?.cards.map((card) => (
                  <div
                    key={card.id}
                    className="group p-4 rounded-xl bg-gray-700/30 border border-gray-600/30 hover:border-[#c8fa00]/30 transition-all"
                  >
                    {/* Header do Card */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-gray-500 bg-gray-600/30 px-2 py-0.5 rounded">
                            {card.key || `#${card.number || card.id.slice(0, 8)}`}
                          </span>
                        </div>
                        <h4 className="font-semibold text-white truncate group-hover:text-[#c8fa00] transition-colors">
                          {card.title || 'Sem título'}
                        </h4>
                      </div>
                      {card.monetaryAmount && card.monetaryAmount > 0 && (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <DollarSign className="h-4 w-4" />
                          {formatCurrency(card.monetaryAmount)}
                        </div>
                      )}
                    </div>

                    {/* Informações do Card */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      {/* Responsável */}
                      {card.responsibleUser?.name && (
                        <div className="flex items-center gap-2 text-gray-400">
                          <User className="h-4 w-4 text-[#c8fa00]" />
                          <span>{card.responsibleUser.name}</span>
                        </div>
                      )}

                      {/* Data de Criação */}
                      {card.createdAt && (
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar className="h-4 w-4 text-[#c8fa00]" />
                          <span>
                            {new Date(card.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}

                      {/* Contato */}
                      {card.contacts && card.contacts.length > 0 && (
                        <div className="flex items-center gap-2 text-gray-400">
                          <ExternalLink className="h-4 w-4 text-[#c8fa00]" />
                          <span className="truncate max-w-[150px]">
                            {card.contacts[0].name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Descrição */}
                    {card.description && (
                      <p className="mt-3 text-sm text-gray-400 line-clamp-2">
                        {card.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer com total */}
          {selectedStage && selectedStage.cards.length > 0 && (
            <div className="border-t border-gray-700/50 pt-4 -mx-6 px-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Valor total da etapa:</span>
                <span className="text-lg font-bold text-[#c8fa00]">
                  {formatCurrency(
                    selectedStage.cards.reduce(
                      (sum, card) => sum + (card.monetaryAmount || 0),
                      0
                    )
                  )}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FunilView
