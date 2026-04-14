import api from './api'
import { BacktestResult } from '../types'

export const backtestService = {
  async getBacktests(params?: { page?: number; page_size?: number; strategy_id?: number }) {
    const response = await api.get<{ code: number; message: string; data: { items: BacktestResult[]; total: number } }>('/backtests', { params })
    return response.data
  },

  async getBacktest(id: number) {
    const response = await api.get<{ code: number; message: string; data: BacktestResult }>(`/backtests/${id}`)
    return response.data
  },

  async getBacktestCharts(id: number) {
    const response = await api.get<{ code: number; message: string; data: any }>(`/backtests/${id}/charts`)
    return response.data
  },

  async cancelBacktest(id: number) {
    const response = await api.post<{ code: number; message: string }>(`/backtests/${id}/cancel`)
    return response.data
  },
}
