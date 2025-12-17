import { useQuery } from '@tanstack/react-query'
import { helenaClient } from './helena-client'
import type {
  Panel,
  Card,
  Agent,
  DashboardFilters,
  GetCardsParams,
} from '@/types/crm'

// Query keys
export const queryKeys = {
  panels: ['crm', 'panels'] as const,
  panel: (id: string) => ['crm', 'panel', id] as const,
  cards: (params?: GetCardsParams) => ['crm', 'cards', params] as const,
  card: (id: string) => ['crm', 'card', id] as const,
  agents: (panelId: string) => ['crm', 'agents', panelId] as const,
  agent: (id: string) => ['crm', 'agent', id] as const,
}

// ========================================
// HOOKS PARA PAINÉIS
// ========================================

export const usePanels = () => {
  return useQuery({
    queryKey: queryKeys.panels,
    queryFn: async () => {
      console.log('🔍 [usePanels] Iniciando busca de painéis...')
      const response = await helenaClient.getPanels()
      const panels = response.items || []
      console.log(`✅ [usePanels] ${panels.length} painéis carregados`)
      console.log('✅ [usePanels] Painéis completos:', JSON.stringify(panels, null, 2))
      return panels
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
  })
}

export const usePanel = (panelId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.panel(panelId),
    queryFn: () => helenaClient.getPanelById(panelId),
    enabled: enabled && !!panelId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// ========================================
// HOOKS PARA CARDS
// ========================================

export const useCards = (params?: GetCardsParams, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.cards(params),
    queryFn: async () => {
      if (!params?.panelId) {
        console.log('⚠️ [useCards] panelId não fornecido, buscando primeiro painel...')
        const panels = await helenaClient.getPanels()
        if (!panels.items || panels.items.length === 0) {
          throw new Error('Nenhum painel encontrado')
        }
        const firstPanelId = panels.items[0].id
        console.log(`🔍 [useCards] Usando panelId: ${firstPanelId}`)
        
        const response = await helenaClient.getCards({ 
          ...params, 
          panelId: firstPanelId 
        })
        const cards = response.items || []
        console.log(`✅ [useCards] ${cards.length} cards carregados`)
        console.log('✅ [useCards] Cards completos:', JSON.stringify(cards, null, 2))
        return cards
      }

      console.log('🔍 [useCards] Buscando cards...', JSON.stringify(params, null, 2))
      const response = await helenaClient.getCards(params)
      const cards = response.items || []
      console.log(`✅ [useCards] ${cards.length} cards carregados`)
      console.log('✅ [useCards] Cards completos:', JSON.stringify(cards, null, 2))
      return cards
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 1,
  })
}

export const useCard = (cardId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.card(cardId),
    queryFn: () => helenaClient.getCardById(cardId),
    enabled: enabled && !!cardId,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  })
}

// ========================================
// HOOKS PARA AGENTES
// ========================================

export const useAgents = (panelId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.agents(panelId),
    queryFn: async () => {
      console.log('🔍 [useAgents] Buscando agentes...', { panelId })
      const response = await helenaClient.getAgents(panelId)
      const agents = response.items || []
      console.log(`✅ [useAgents] ${agents.length} agentes carregados`)
      return agents
    },
    enabled: enabled && !!panelId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

export const useAgent = (agentId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.agent(agentId),
    queryFn: () => helenaClient.getAgentById(agentId),
    enabled: enabled && !!agentId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// ========================================
// HOOK PARA DASHBOARD (DADOS COMBINADOS)
// ========================================

export const useDashboardData = (filters?: DashboardFilters) => {
  const panelsQuery = usePanels()
  
  // Usa o panelId do filtro ou o primeiro painel disponível
  const activePanelId = filters?.panelId || panelsQuery.data?.[0]?.id
  
  const cardsQuery = useCards(
    activePanelId ? {
      panelId: activePanelId,
      startDate: filters?.startDate,
      endDate: filters?.endDate,
      userId: filters?.userId,
      channelId: filters?.channelId,
    } : undefined,
    !!activePanelId
  )
  
  const agentsQuery = useAgents(activePanelId || '', !!activePanelId)

  return {
    panels: panelsQuery,
    cards: cardsQuery,
    agents: agentsQuery,
    activePanelId,
    isLoading: panelsQuery.isLoading || cardsQuery.isLoading || agentsQuery.isLoading,
    isError: panelsQuery.isError || cardsQuery.isError || agentsQuery.isError,
    error: panelsQuery.error || cardsQuery.error || agentsQuery.error,
  }
}
