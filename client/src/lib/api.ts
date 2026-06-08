const BASE_URL = '/api'

function getToken(): string | null {
  return localStorage.getItem('tdc_token')
}

function setToken(token: string): void {
  localStorage.setItem('tdc_token', token)
}

function clearToken(): void {
  localStorage.removeItem('tdc_token')
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    clearToken()
    window.location.href = '/login'
    throw new Error('Session expired')
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Request failed')
  }

  return data
}

export const api = {
  getToken,
  setToken,
  clearToken,

  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => request<any>('/auth/me'),

  // Profiles
  getProfiles: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<any[]>(`/profiles${query}`)
  },

  getAssignedProfiles: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<any[]>(`/profiles/assigned${query}`)
  },

  getProfile: (id: string) => request<any>(`/profiles/${id}`),

  // Matches
  getMatches: (profileId: string) =>
    request<any[]>(`/matches/${profileId}`),

  sendMatch: (customerProfileId: string, matchedProfileId: string, aiIntro: string) =>
    request<any>('/matches/send', {
      method: 'POST',
      body: JSON.stringify({ customerProfileId, matchedProfileId, aiIntro }),
    }),

  getMatchHistory: (profileId: string) =>
    request<any[]>(`/matches/history/${profileId}`),

  // Notes
  getNotes: (profileId: string) =>
    request<any[]>(`/notes/${profileId}`),

  addNote: (profileId: string, content: string, type: string = 'general', sentiment: string = 'neutral') =>
    request<any>(`/notes/${profileId}`, {
      method: 'POST',
      body: JSON.stringify({ content, type, sentiment }),
    }),

  // Scoring
  getScoringConfig: () =>
    request<any>('/scoring/config'),

  updateScoringConfig: (config: any) =>
    request<any>('/scoring/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    }),

  getScoringPresets: () =>
    request<any[]>('/scoring/presets'),

  previewScore: (customerId: string, matchId: string, weights?: any, weightsFemale?: any) =>
    request<any>('/scoring/preview', {
      method: 'POST',
      body: JSON.stringify({ customerId, matchId, weights, weightsFemale }),
    }),

  // AI
  getAiExplanation: (customerId: string, matchId: string) =>
    request<{ explanation: string }>('/ai/explain', {
      method: 'POST',
      body: JSON.stringify({ customerId, matchId }),
    }),

  getAiIntro: (customerId: string, matchId: string) =>
    request<{ email: string }>('/ai/intro', {
      method: 'POST',
      body: JSON.stringify({ customerId, matchId }),
    }),

  summarizeNotes: (notes: string) =>
    request<{ summary: string }>('/ai/summarize-notes', {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),

  getAiStatus: () => request<{ configured: boolean }>('/ai/status'),
}
