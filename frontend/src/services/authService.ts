import api from './api'
import { User } from '../types'

export const authService = {
  async register(data: { username: string; email: string; password: string; phone?: string }) {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  async login(data: { email: string; password: string }) {
    const response = await api.post('/auth/login', data)
    return {
      data: {
        user: response.data.user,
        token: response.data.access_token
      }
    }
  },

  async logout() {
    const response = await api.post('/auth/logout')
    return response.data
  },

  async getProfile() {
    const response = await api.get('/auth/profile')
    return response.data
  },

  async updateProfile(data: Partial<User>) {
    const response = await api.put('/auth/profile', data)
    return response.data
  },
}
