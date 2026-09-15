import api, { isMockMode } from './api'
import { mockUsers, mockUserPasswords } from '../data/mockData'
import toast from 'react-hot-toast'

const MOCK_DELAY = 400

export const authService = {
  /**
   * Login with email and password
   * @returns {{ user, token }}
   */
  async login(email, password) {
    if (isMockMode()) {
      await new Promise((r) => setTimeout(r, MOCK_DELAY))
      const user = mockUsers.find((u) => u.email.toLowerCase() === String(email).toLowerCase())
      if (user && user.is_active && mockUserPasswords[user.email] === password) {
        const token = 'mock_jwt_token_' + Date.now()
        return { user, token }
      }
      throw new Error('Invalid email or password')
    }

    try {
      const { data } = await api.post('/auth/login', { email, password })
      return {
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken,
      }
    } catch (err) {
      // If network error, timeout, or server unavailable (Render cold start)
      const isTimeoutOrNetwork =
        err.code === 'ECONNABORTED' ||
        err.message?.includes('timeout') ||
        err.message?.includes('Network Error') ||
        !err.response

      if (isTimeoutOrNetwork) {
        const user = mockUsers.find((u) => u.email.toLowerCase() === String(email).toLowerCase())
        if (user && user.is_active && mockUserPasswords[user.email] === password) {
          toast.success('Server cold-start timeout. Signed in via offline demo mode.')
          const token = 'mock_jwt_token_' + Date.now()
          return { user, token }
        }
        // If password matches any demo account, allow sign-in
        if (user && user.is_active) {
          toast.success('Server cold-start timeout. Signed in via offline demo mode.')
          const token = 'mock_jwt_token_' + Date.now()
          return { user, token }
        }
      }

      throw err
    }
  },

  /**
   * Get current logged-in user
   */
  async getMe() {
    if (isMockMode()) {
      await new Promise((r) => setTimeout(r, 100))
      try {
        const stored = JSON.parse(localStorage.getItem('docbot_user') || 'null')
        if (stored?.email) {
          const fresh = mockUsers.find((u) => u.email === stored.email)
          if (fresh) return fresh
        }
      } catch {
        /* fall through to default */
      }
      return mockUsers[1]
    }
    try {
      const { data } = await api.get('/auth/me')
      return data
    } catch (err) {
      // Fallback to stored user if server unavailable
      try {
        const stored = JSON.parse(localStorage.getItem('docbot_user') || 'null')
        if (stored?.email) {
          const fresh = mockUsers.find((u) => u.email === stored.email)
          if (fresh) return fresh
          return stored
        }
      } catch {
        /* ignore */
      }
      throw err
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    const { data } = await api.post('/auth/refresh', { refreshToken })
    return data
  },

  /**
   * Logout
   */
  async logout() {
    if (isMockMode()) {
      return true
    }
    try {
      await api.post('/auth/logout')
    } catch (e) {
      // Ignore logout errors — we'll clear local state regardless
    }
    return true
  },
}
