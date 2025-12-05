import { useQuery } from '@tanstack/react-query'
import { crmClient } from './crm-client'
import type {
  Panel,
  Card,
  Contact,
  User,
  DashboardFilters,
} from './helena-types'
import type { CardsFilters } from './crm-client'

// Query keys
export const queryKeys = {
  panels: ['crm', 'panels'] as const,
  panel: (id: string) => ['crm', 'panel', id] as const,
  cards: (filters?: CardsFilters) =>
    ['crm', 'cards', filters] as const,
  card: (id: string) => ['crm', 'card', id] as const,
  agents: (panelId: string) => ['crm', 'agents', panelId] as const,
  agent: (id: string) => ['crm', 'agent', id] as const,
  contacts: (filters?: DashboardFilters) =>
    ['crm', 'contacts', filters] as const,
  users: ['crm', 'users'] as const,
  user: (id: string) => ['crm', 'user', id] as const,
  channels: ['crm', 'channels'] as const,
}

// Hooks para Painéis
export const usePanels = () => {
  return useQuery({
    queryKey: queryKeys.panels,
    queryFn: async () => {
      console.log('🔍 [usePanels] Iniciando busca de painéis...')
      const response = await crmClient.getPanels()
      const panels = response.items || []
      console.log(`🔍 [usePanels] Painéis retornados: ${panels.length}`)
      console.log('🔍 [usePanels] Estrutura completa da resposta:', response)
      console.log('🔍 [usePanels] Primeiro painel completo:', panels[0])
      if (panels.length > 0) {
        console.log('🔍 [usePanels] Campos do primeiro painel:', {
          id: panels[0].id,
          title: panels[0].title,
          description: panels[0].description,
          hasTitle: !!panels[0].title,
          allKeys: Object.keys(panels[0]),
        })
      }
      return panels
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
    onSuccess: (data) => {
      console.log(`✅ [usePanels] Sucesso! ${data.length} painéis carregados`)
    },
    onError: (error) => {
      console.error('❌ [usePanels] Erro ao buscar painéis:', error)
    },
  })
}

export const usePanel = (panelId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.panel(panelId),
    queryFn: () => crmClient.getPanelById(panelId),
    enabled: enabled && !!panelId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// Hooks para Cards
export const useCards = (filters?: CardsFilters, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.cards(filters),
    queryFn: async () => {
      if (!filters?.panelId) {
        throw new Error('panelId é obrigatório para buscar cards')
      }
      
      console.log('🔍 [useCards] Iniciando busca de cards...', { filters, enabled })
      const response = await crmClient.getCards(filters)
      const cards = response.items || []
      console.log(`🔍 [useCards] Cards retornados: ${cards.length}`, cards.slice(0, 3))
      return cards
    },
    enabled: enabled && !!filters?.panelId,
    staleTime: 2 * 60 * 1000, // 2 minutos (dados mais dinâmicos)
    retry: 1,
    onSuccess: (data) => {
      console.log(`✅ [useCards] Sucesso! ${data.length} cards carregados`)
    },
    onError: (error) => {
      console.error('❌ [useCards] Erro ao buscar cards:', error)
    },
  })
}

export const useCard = (cardId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.card(cardId),
    queryFn: () => crmClient.getCardById(cardId),
    enabled: enabled && !!cardId,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  })
}

// Hooks para Agentes
export const useAgents = (panelId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.agents(panelId),
    queryFn: async () => {
      const response = await crmClient.getAgents(panelId)
      return response.items || []
    },
    enabled: enabled && !!panelId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

export const useAgent = (id: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.agent(id),
    queryFn: () => crmClient.getAgentById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// Hooks para Contatos - Mantido para compatibilidade, mas pode não estar disponível na nova API
export const useContacts = (filters?: DashboardFilters, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.contacts(filters),
    queryFn: async () => {
      // TODO: Implementar quando a rota estiver disponível na nova API
      return []
    },
    enabled: false, // Desabilitado até a rota existir
    staleTime: 2 * 60 * 1000,
    retry: 1,
  })
}

// Hooks para Usuários/Vendedores - DESABILITADO: rota não existe
export const useUsers = () => {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: async () => {
      // Retornar array vazio por enquanto
      return []
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
    enabled: false, // Desabilitado até a rota existir
  })
}

export const useUser = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.user(userId),
    queryFn: async () => {
      return {} as User
    },
    enabled: false, // Desabilitado
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })
}

// Hooks para Canais - DESABILITADO: rota não existe
export const useChannels = () => {
  return useQuery({
    queryKey: queryKeys.channels,
    queryFn: async () => {
      // Retornar array vazio por enquanto
      return []
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
    enabled: false, // Desabilitado até a rota existir
  })
}

// Hook para dados do dashboard (métricas agregadas)
export const useDashboardData = (filters?: DashboardFilters) => {
  const cardsQuery = useCards(filters)
  const contactsQuery = useContacts(filters)
  const usersQuery = useUsers()
  const channelsQuery = useChannels()

  return {
    cards: cardsQuery,
    contacts: contactsQuery,
    users: usersQuery,
    channels: channelsQuery,
    isLoading:
      cardsQuery.isLoading ||
      contactsQuery.isLoading ||
      usersQuery.isLoading ||
      channelsQuery.isLoading,
    isError:
      cardsQuery.isError ||
      contactsQuery.isError ||
      usersQuery.isError ||
      channelsQuery.isError,
  }
}

