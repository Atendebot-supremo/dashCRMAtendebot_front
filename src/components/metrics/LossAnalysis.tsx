import { useMemo } from 'react'
import { AlertTriangle, DollarSign, XCircle, Trophy, Medal, Award, FileText } from 'lucide-react'
import ChartCard from '@/components/dashboard/ChartCard'
import { useCards } from '@/lib/api/queries'
import {
  filterCardsByPeriod,
  filterCardsByUser,
  filterCardsByChannel,
} from '@/lib/utils/calculations'
import { formatCurrency } from '@/lib/utils/format'
import type { DashboardFilters, Card } from '@/types/crm'

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

  // Filtrar apenas cards na etapa "Perdido"
  const lostCards = useMemo(() => {
    return filteredCards.filter(
      (card) => card.stepTitle === 'Perdido' || card.stepTitle?.toLowerCase().includes('perdido')
    )
  }, [filteredCards])

  // Ranking dos leads (cards) perdidos
  // O título do card é o nome do lead
  // Ordena por valor (com valor primeiro), depois por data de criação
  const topLostLeads = useMemo(() => {
    return lostCards
      .map((card) => ({
        id: card.id,
        title: card.title || 'Sem título',
        value: card.monetaryAmount || 0,
        responsibleUser: card.responsibleUser?.name || 'Sem responsável',
        createdAt: card.createdAt,
        key: card.key,
      }))
      .sort((a, b) => {
        // Primeiro ordena por valor (maior primeiro)
        if (b.value !== a.value) {
          return b.value - a.value
        }
        // Se valores iguais (ou ambos zero), ordena por data (mais recente primeiro)
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
        return 0
      })
      .slice(0, 5) // Top 5
  }, [lostCards])

  const totalLostValue = useMemo(() => {
    return lostCards.reduce((sum, card) => sum + (card.monetaryAmount || 0), 0)
  }, [lostCards])

  const totalLostCount = lostCards.length

  // Função para obter o ícone e cor do ranking
  const getRankingIcon = (position: number) => {
    switch (position) {
      case 1:
        return { Icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' }
      case 2:
        return { Icon: Medal, color: 'text-gray-300', bg: 'bg-gray-300/10', border: 'border-gray-300/20' }
      case 3:
        return { Icon: Award, color: 'text-amber-600', bg: 'bg-amber-600/10', border: 'border-amber-600/20' }
      default:
        return null
    }
  }

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
      <ChartCard title="Análise de Perdas" className="text-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <p className="text-red-400 font-medium">Erro ao carregar dados</p>
        </div>
      </ChartCard>
    )
  }

  if (lostCards.length === 0) {
    return (
      <ChartCard title="Análise de Perdas" className="text-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <XCircle className="h-6 w-6 text-emerald-400" />
          </div>
          <p className="text-gray-400">Nenhum card na etapa "Perdido"</p>
          <p className="text-xs text-gray-500">Ótimo trabalho! 🎉</p>
        </div>
      </ChartCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="group relative rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-gray-800/80 backdrop-blur-xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20 border border-red-500/30">
              <DollarSign className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Valor Total Perdido</p>
              <p className="text-2xl font-bold text-red-400">
                {formatCurrency(totalLostValue)}
              </p>
            </div>
          </div>
        </div>

        <div className="group relative rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-gray-800/80 backdrop-blur-xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30">
              <XCircle className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total de Cards Perdidos</p>
              <p className="text-2xl font-bold text-white">
                {totalLostCount}
              </p>
            </div>
          </div>
        </div>

        <div className="group relative rounded-xl border border-gray-600/30 bg-gray-800/80 backdrop-blur-xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-700/50 border border-gray-600/30">
              <AlertTriangle className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Valor Médio por Lead</p>
              <p className="text-2xl font-bold text-white">
                {totalLostCount > 0 ? formatCurrency(totalLostValue / totalLostCount) : formatCurrency(0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ranking dos Leads com Maior Valor Perdido */}
      <ChartCard 
        title="Ranking de Leads Perdidos (Maior Valor)"
        icon={<Trophy className="h-4 w-4 text-[#c8fa00]" />}
      >
        {topLostLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <div className="h-12 w-12 rounded-full bg-gray-700/50 flex items-center justify-center mb-3">
              <FileText className="h-6 w-6" />
            </div>
            <p>Nenhum lead com valor perdido</p>
          </div>
        ) : (
          <div className="space-y-2">
            {topLostLeads.map((lead, index) => {
              const position = index + 1
              const ranking = getRankingIcon(position)
              
              return (
                <div
                  key={lead.id}
                  className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                    ranking
                      ? `${ranking.bg} ${ranking.border} border-2`
                      : 'bg-gray-700/30 border-gray-600/30'
                  } hover:border-red-500/30`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Posição do Ranking */}
                    <div className="flex-shrink-0">
                      {ranking ? (
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${ranking.bg} ${ranking.border} border-2`}>
                          <ranking.Icon className={`h-4 w-4 ${ranking.color}`} />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700/50 border border-gray-600/50">
                          <span className="text-xs font-bold text-gray-400">#{position}</span>
                        </div>
                      )}
                    </div>

                    {/* Informações do Lead */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                        <span className="font-semibold text-sm text-white truncate">{lead.title}</span>
                        {lead.key && (
                          <span className="text-xs font-mono text-gray-500 bg-gray-600/30 px-1.5 py-0.5 rounded flex-shrink-0">
                            {lead.key}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                        <span>{lead.responsibleUser}</span>
                        {lead.createdAt && (
                          <span>• {new Date(lead.createdAt).toLocaleDateString('pt-BR')}</span>
                        )}
                      </div>
                    </div>

                    {/* Valor Perdido */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {lead.value > 0 ? (
                        <span className="text-lg font-bold text-red-400">{formatCurrency(lead.value)}</span>
                      ) : (
                        <span className="text-sm font-medium text-gray-500">Sem valor</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ChartCard>
    </div>
  )
}

export default LossAnalysis
