import type { Licencia } from "../types"
import { licencias as seed } from "../data/mockData"
import { apiFetch } from "./httpClient"

let licencias: Licencia[] = [...seed]
let siguienteId = licencias.length + 1

const demora = () => new Promise((resolve) => setTimeout(resolve, 300))

export async function getLicencias(): Promise<Licencia[]> {
    await demora()
    return licencias
}

export async function getLicencia(id: number): Promise<Licencia> {
    await demora()
    const licencia = licencias.find((l) => l.idLicencias === id)
    if (!licencia) {
        throw new Error(`No existe una licencia con id ${id}`)
    }
    return licencia
}

export async function createLicencia(datos: Omit<Licencia, 'idLicencias'>): Promise<Licencia> {
    await demora()
    const nueva: Licencia = { idLicencias: siguienteId, ...datos }
    siguienteId++
    licencias.push(nueva)
    return nueva
}

export async function updateLicencia(id: number, datos: Omit<Licencia, 'idLicencias'>): Promise<Licencia> {
    await demora()
    const indice = licencias.findIndex((l) => l.idLicencias === id)
    if (indice === -1) {
        throw new Error(`No existe una licencia con id ${id}`)
    }
    const actualizada: Licencia = { idLicencias: id, ...datos }
    licencias[indice] = actualizada
    return actualizada
}

export async function deleteLicencia(id: number): Promise<void> {
    await demora()
    const indice = licencias.findIndex((l) => l.idLicencias === id)
    if (indice === -1) {
        throw new Error(`No existe una licencia con id ${id}`)
    }
    licencias.splice(indice, 1)
}

export type MiLicencia = Licencia & { tipo: string }

// GET /licencias/mias: las licencias del usuario del token, la más nueva primero
export async function getMisLicencias(): Promise<MiLicencia[]> {
    const response = await apiFetch('/licencias/mias')
    const datos: unknown = await response.json()
    if (!Array.isArray(datos)) throw new Error('La API devolvió una lista de licencias inválida')
    return datos.map((licencia) => ({
        ...licencia,
        fechaVencimiento: String(licencia.fechaVencimiento).slice(0, 10),
        tipo: licencia.tiposlicencias?.nombre ?? `Tipo #${licencia.TiposLicencias_idTipoLicencia}`,
    }))
}
