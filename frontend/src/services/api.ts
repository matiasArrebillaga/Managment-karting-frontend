import { karts, races } from '../data/mockData'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

export async function getRaces() {
  if (USE_MOCKS) return races
  const response = await fetch(`${API_URL}/carreras`)
  if (!response.ok) throw new Error('No se pudieron cargar las carreras')
  return response.json()
}

export async function getKartings() {
  if (USE_MOCKS) return karts
  const response = await fetch(`${API_URL}/kartings`)
  if (!response.ok) throw new Error('No se pudieron cargar los kartings')
  return response.json()
}
