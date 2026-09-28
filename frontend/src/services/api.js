const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const TOKEN_KEY = 'token'

class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

async function request(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY)
  const headers = new Headers(options.headers)

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    })
  } catch (error) {
    throw new ApiError('Não foi possível conectar ao servidor.', 0, error)
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(
      data?.erro || 'A requisição não pôde ser concluída.',
      response.status,
      data,
    )
  }

  return data
}

export const api = {
  auth: {
    async login(email, senha) {
      const data = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha }),
      })
      localStorage.setItem(TOKEN_KEY, data.token)
      return data
    },

    cadastro(nome, email, senha) {
      return request('/api/auth/cadastro', {
        method: 'POST',
        body: JSON.stringify({ nome, email, senha }),
      })
    },

    logout() {
      localStorage.removeItem(TOKEN_KEY)
    },
  },

  ai: {
    explicar(payload) {
      return request('/api/explicar', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    },
  },

  flashcards: {
    listar() {
      return request('/api/flashcards')
    },

    excluir(id) {
      return request(`/api/flashcards/${id}`, { method: 'DELETE' })
    },
  },

  minigame: {
    gerar() {
      return request('/api/minigame/gerar')
    },
  },
}

export { ApiError, TOKEN_KEY }