import api from './auth'

export async function getAnalyses() {
  const { data } = await api.get('/analyses')
  return data
}

export async function createAnalysis(payload) {
  const { data } = await api.post('/analyses', payload)
  return data
}

export async function deleteAnalysis(id) {
  await api.delete(`/analyses/${id}`)
}
