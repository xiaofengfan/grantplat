import api from './api'
import { Strategy, BacktestResult } from '../types'

export const strategyService = {
  async getStrategies(params?: { page?: number; page_size?: number; status?: string }) {
    const response = await api.get<{ code: number; message: string; data: { items: Strategy[]; total: number } }>('/strategies', { params })
    return response.data
  },

  async getStrategy(id: number) {
    const response = await api.get<{ code: number; message: string; data: Strategy }>(`/strategies/${id}`)
    return response.data
  },

  async createStrategy(data: Partial<Strategy>) {
    const response = await api.post<{ code: number; message: string; data: Strategy }>('/strategies', data)
    return response.data
  },

  async updateStrategy(id: number, data: Partial<Strategy>) {
    const response = await api.put<{ code: number; message: string; data: Strategy }>(`/strategies/${id}`, data)
    return response.data
  },

  async deleteStrategy(id: number) {
    const response = await api.delete<{ code: number; message: string }>(`/strategies/${id}`)
    return response.data
  },

  async startBacktest(id: number, params: { start_date: string; end_date: string; initial_capital: number }) {
    const response = await api.post<{ code: number; message: string; data: BacktestResult }>(`/strategies/${id}/backtest`, null, { params })
    return response.data
  },

  async startSimulate(id: number) {
    const response = await api.post<{ code: number; message: string }>(`/strategies/${id}/simulate`)
    return response.data
  },

  async deployStrategy(id: number) {
    const response = await api.post<{ code: number; message: string }>(`/strategies/${id}/deploy`)
    return response.data
  },
}
