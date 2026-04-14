import api from './api'
import { Quote, KLine } from '../types'

export const dataService = {
  async getQuotes(symbols: string[]) {
    const response = await api.get<{ code: number; message: string; data: Quote[] }>('/data/quotes', {
      params: { symbols: symbols.join(',') }
    })
    return response.data
  },

  async getHistoryKLine(params: {
    symbol: string
    period: '1m' | '5m' | '15m' | '30m' | '1h' | '1d' | '1w'
    start_date: string
    end_date: string
  }) {
    const response = await api.get<{ code: number; message: string; data: KLine[] }>('/data/history', { params })
    return response.data
  },

  async getFactors(params: { category?: string; page?: number; page_size?: number }) {
    const response = await api.get<{ code: number; message: string; data: { items: any[]; total: number } }>('/data/factors', { params })
    return response.data
  },
}
