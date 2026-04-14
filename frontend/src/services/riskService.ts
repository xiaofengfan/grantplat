import api from './api'
import { RiskRule, RiskMetrics } from '../types'

export const riskService = {
  async getRules() {
    const response = await api.get<{ code: number; message: string; data: RiskRule[] }>('/risk/rules')
    return response.data
  },

  async createRule(data: Partial<RiskRule>) {
    const response = await api.post<{ code: number; message: string; data: RiskRule }>('/risk/rules', data)
    return response.data
  },

  async updateRule(id: number, data: Partial<RiskRule>) {
    const response = await api.put<{ code: number; message: string; data: RiskRule }>(`/risk/rules/${id}`, data)
    return response.data
  },

  async deleteRule(id: number) {
    const response = await api.delete<{ code: number; message: string }>(`/risk/rules/${id}`)
    return response.data
  },

  async getMonitorData() {
    const response = await api.get<{ code: number; message: string; data: RiskMetrics }>('/risk/monitor')
    return response.data
  },
}
