import type { Licencia } from "../types"
import { licencias as seed } from "../data/mockData"
import { apiFetch, usaMocks } from "./httpClient"

let licencias: Licencia[] = [...seed]
let siguienteId = licencias.length + 1

const demora = () => new Promise((resolve) => setTimeout(resolve, 300))

function esObjeto(valor: unknown): valor is Record<string, unknown> {
    return typeof valor === 'object' && valor !== null
}

function normalizarLicencia(valor: unknown): Licencia {
    if (
        !esObjeto(valor)
        || typeof valor.idLicencias !== 'number'
        || typeof valor.fechaEmision !== 'string'
        || typeof valor.fechaVencimiento !== 'string'
        || typeof valor.Personas_idPersona !== 'number'
        || typeof valor.TiposLicencias_idTipoLicencia !== 'number'
    ) {
        throw new Error('La API devolvió una licencia con un formato inválido')
    }
    return {
        idLicencias: valor.idLicencias,
        // la API manda DateTime ISO; los inputs date y la tabla usan YYYY-MM-DD
        fechaEmision: valor.fechaEmision.slice(0, 10),
        fechaVencimiento: valor.fechaVencimiento.slice(0, 10),
        Personas_idPersona: valor.Personas_idPersona,
        TiposLicencias_idTipoLicencia: valor.TiposLicencias_idTipoLicencia,
    }
}

function validarDatos(datos: Omit<Licencia, 'idLicencias'>): void {
    if (!datos.Personas_idPersona) throw new Error('Elegí el titular de la licencia')
    if (!datos.TiposLicencias_idTipoLicencia) throw new Error('Elegí el tipo de licencia')
    if (!datos.fechaEmision || !datos.fechaVencimiento) throw new Error('Las fechas de emisión y vencimiento son obligatorias')
    if (datos.fechaVencimiento <= datos.fechaEmision) throw new Error('El vencimiento debe ser posterior a la emisión')
}

export async function getLicencias(): Promise<Licencia[]> {
    if (!usaMocks) {
        const response = await apiFetch('/licencias')
        const valor: unknown = await response.json()
        if (!Array.isArray(valor)) {
            throw new Error('La API devolvió una lista de licencias inválida')
        }
        return valor.map(normalizarLicencia)
    }
    await demora()
    return licencias
}

export async function getLicencia(id: number): Promise<Licencia> {
    if (!usaMocks) {
        const response = await apiFetch(`/licencias/${id}`)
        return normalizarLicencia(await response.json())
    }
    await demora()
    const licencia = licencias.find((l) => l.idLicencias === id)
    if (!licencia) {
        throw new Error(`No existe una licencia con id ${id}`)
    }
    return licencia
}

export async function createLicencia(datos: Omit<Licencia, 'idLicencias'>): Promise<Licencia> {
    validarDatos(datos)
    if (!usaMocks) {
        const response = await apiFetch('/licencias', {
            method: 'POST',
            body: JSON.stringify(datos),
        })
        return normalizarLicencia(await response.json())
    }
    await demora()
    const nueva: Licencia = { idLicencias: siguienteId, ...datos }
    siguienteId++
    licencias.push(nueva)
    return nueva
}

export async function updateLicencia(id: number, datos: Omit<Licencia, 'idLicencias'>): Promise<Licencia> {
    validarDatos(datos)
    if (!usaMocks) {
        const response = await apiFetch(`/licencias/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(datos),
        })
        return normalizarLicencia(await response.json())
    }
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
    if (!usaMocks) {
        await apiFetch(`/licencias/${id}`, { method: 'DELETE' })
        return
    }
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
