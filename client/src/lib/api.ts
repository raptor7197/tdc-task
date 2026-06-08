const BASE_URL = '/api'

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Request failed')
  }

  return data
}

export const api = {

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
