import { useQuery } from '@tanstack/react-query'
import { helenaClient } from './helena-client'
import type {
  Panel,
  Card,
  Contact,
  User,
  DashboardFilters,
} from './helena-types'

// Query keys
export const queryKeys = {
  panels: ['helena', 'panels'] as const,
  panel: (id: string) => ['helena', 'panel', id] as const,
  cards: (filters?: DashboardFilters) =>
    ['helena', 'cards', filters] as const,
  card: (id: string) => ['helena', 'card', id] as const,
  contacts: (filters?: DashboardFilters) =>
    ['helena', 'contacts', filters] as const,
  users: ['helena', 'users'] as const,
  user: (id: string) => ['helena', 'user', id] as const,
  channels: ['helena', 'channels'] as const,
}

// Hooks para Painéis
export const usePanels = () => {
  return useQuery({
    queryKey: queryKeys.panels,
    queryFn: async () => {
      console.log('🔍 [usePanels] Iniciando busca de painéis...')
      const response = await helenaClient.getPanels()
      const panels = response.items || []
      console.log(`🔍 [usePanels] Painéis retornados: ${panels.length}`, panels)
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
    queryFn: () => helenaClient.getPanelById(panelId),
    enabled: enabled && !!panelId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// Hooks para Cards
export const useCards = (filters?: DashboardFilters, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.cards(filters),
    queryFn: async () => {
      console.log('🔍 [useCards] Iniciando busca de cards...', { filters, enabled })
      const response = await helenaClient.getCards(filters)
      const cards = response.items || []
      console.log(`🔍 [useCards] Cards retornados: ${cards.length}`, cards.slice(0, 3))
      return cards
    },
    enabled,
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
    queryFn: () => helenaClient.getCardById(cardId),
    enabled: enabled && !!cardId,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  })
}

// Hooks para Contatos
export const useContacts = (filters?: DashboardFilters, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.contacts(filters),
    queryFn: async () => {
      const response = await helenaClient.getContacts(filters)
      return response.items || []
    },
    enabled,
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

