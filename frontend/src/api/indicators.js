import api from './auth'

export async function getIndicators() {
  const { data } = await api.get('/indicators')
  return data // [{code, name}]
}

export async function getIndicatorData(code) {
  const { data } = await api.get(`/indicators/${code}/data`)
  return data // [{country, year, value, ...}]
}
