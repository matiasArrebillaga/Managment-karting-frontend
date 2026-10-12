import type { Licencia } from "../types"
import { licencias as seed } from "../data/mockData"

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
