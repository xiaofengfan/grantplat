import api from './api'
import { User } from '../types'

export const authService = {
  async register(data: { username: string; email: string; password: string; phone?: string }) {
    const response = await api.post<{ code: number; message: string; data: { user: User; token: string } }>('/auth/register', data)
    return response.data
  },

  async login(data: { email: string; password: string }) {
    const response = await api.post<{ code: number; message: string; data: { user: User; token: string } }>('/auth/login', data)
    return response.data
  },

  async logout() {
    const response = await api.post('/auth/logout')
    return response.data
  },

  async getProfile() {
    const response = await api.get<{ code: number; message: string; data: User }>('/auth/profile')
    return response.data
  },

  async updateProfile(data: Partial<User>) {
    const response = await api.put<{ code: number; message: string; data: User }>('/auth/profile', data)
    return response.data
  },
}
