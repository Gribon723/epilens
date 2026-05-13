import api from './auth'

export async function getTrend(records, projectYears = 5) {
  const { data } = await api.post('/stats/trend', { records, project_years: projectYears })
  return data
}

export async function getAnomalies(records, window = 5) {
  const { data } = await api.post('/stats/anomalies', { records, window })
  return data
}

export async function getCorrelation(xRecords, yRecords) {
  const { data } = await api.post('/stats/correlate', { x_records: xRecords, y_records: yRecords })
  return data
}

export async function getBurden(records, weights = null, invert = null) {
  const { data } = await api.post('/stats/burden', { records, weights, invert })
  return data
}

export async function getCluster(records, nClusters = 4) {
  const { data } = await api.post('/stats/cluster', { records, n_clusters: nClusters })
  return data
}
