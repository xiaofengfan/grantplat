import { create } from 'zustand'
import { Strategy } from '../types'

interface StrategyState {
  strategies: Strategy[]
  currentStrategy: Strategy | null
  setStrategies: (strategies: Strategy[]) => void
  setCurrentStrategy: (strategy: Strategy | null) => void
  addStrategy: (strategy: Strategy) => void
  updateStrategy: (id: number, updates: Partial<Strategy>) => void
  removeStrategy: (id: number) => void
}

export const useStrategyStore = create<StrategyState>((set) => ({
  strategies: [],
  currentStrategy: null,
  setStrategies: (strategies) => set({ strategies }),
  setCurrentStrategy: (strategy) => set({ currentStrategy: strategy }),
  addStrategy: (strategy) => set((state) => ({
    strategies: [...state.strategies, strategy]
  })),
  updateStrategy: (id, updates) => set((state) => ({
    strategies: state.strategies.map((s) =>
      s.id === id ? { ...s, ...updates } : s
    ),
    currentStrategy: state.currentStrategy?.id === id
      ? { ...state.currentStrategy, ...updates }
      : state.currentStrategy
  })),
  removeStrategy: (id) => set((state) => ({
    strategies: state.strategies.filter((s) => s.id !== id),
    currentStrategy: state.currentStrategy?.id === id ? null : state.currentStrategy
  })),
}))
