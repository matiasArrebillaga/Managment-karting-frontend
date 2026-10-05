import type { IParticipacion } from '../types'
import { participaciones as seed } from '../data/mockData'

const demora = () => new Promise((resolve) => setTimeout(resolve, 300))

export async function getParticipaciones(): Promise<IParticipacion[]> {
    await demora()
    return seed
}
