import type { Localidad } from '../types'
import { localidades as seed } from '../data/mockData'
import { apiFetch, usaMocks } from './httpClient'

let localidades: Localidad[] = [...seed]
let siguienteId = localidades.length + 1

const demora = () => new Promise((resolve) => setTimeout(resolve, 300))

function esObjeto(valor: unknown): valor is Record<string, unknown> {
    return typeof valor === 'object' && valor !== null
}

function normalizarLocalidad(valor: unknown): Localidad {
    if (
        !esObjeto(valor)
        || typeof valor.idLocalidades !== 'number'
        || typeof valor.nombre !== 'string'
    ) {
        throw new Error('La API devolvió una localidad con un formato inválido')
    }
    return { idLocalidades: valor.idLocalidades, nombre: valor.nombre }
}

function normalizarLista(valor: unknown): Localidad[] {
    if (!Array.isArray(valor)) {
        throw new Error('La API devolvió una lista de localidades inválida')
    }
    return valor.map(normalizarLocalidad)
}

function validarNombre(nombre: string): void {
    if (!nombre.trim()) {
        throw new Error('El nombre de la localidad es obligatorio')
    }
}

export async function getLocalidadesParaRegistro(): Promise<Localidad[]> {
    return [...seed]
}

export async function getLocalidades(): Promise<Localidad[]> {
    if (!usaMocks) {
        const response = await apiFetch('/localidades')
        return normalizarLista(await response.json())
    }

    await demora()
    return localidades
}

export async function getLocalidad(id: number): Promise<Localidad> {
    if (!usaMocks) {
        const response = await apiFetch(`/localidades/${id}`)
        return normalizarLocalidad(await response.json())
    }
    await demora()
    const localidad = localidades.find((l) => l.idLocalidades === id)
    if (!localidad) {
        throw new Error(`No existe una localidad con id ${id}`)
    }
    return localidad
}

export async function createLocalidad(datos: Omit<Localidad, 'idLocalidades'>): Promise<Localidad> {
    validarNombre(datos.nombre)
    if (!usaMocks) {
        const response = await apiFetch('/localidades', {
            method: 'POST',
            body: JSON.stringify({ nombre: datos.nombre.trim() }),
        })
        return normalizarLocalidad(await response.json())
    }
    await demora()
    const nueva: Localidad = { idLocalidades: siguienteId, nombre: datos.nombre.trim() }
    siguienteId++
    localidades.push(nueva)
    return nueva
}

export async function updateLocalidad(id: number, datos: Omit<Localidad, 'idLocalidades'>): Promise<Localidad> {
    validarNombre(datos.nombre)
    if (!usaMocks) {
        const response = await apiFetch(`/localidades/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ nombre: datos.nombre.trim() }),
        })
        return normalizarLocalidad(await response.json())
    }
    await demora()
    const indice = localidades.findIndex((l) => l.idLocalidades === id)
    if (indice === -1) {
        throw new Error(`No existe una localidad con id ${id}`)
    }
    const actualizada: Localidad = { idLocalidades: id, nombre: datos.nombre.trim() }
    localidades[indice] = actualizada
    return actualizada
}

export async function deleteLocalidad(id: number): Promise<void> {
    if (!usaMocks) {
        await apiFetch(`/localidades/${id}`, { method: 'DELETE' })
        return
    }
    await demora()
    const indice = localidades.findIndex((l) => l.idLocalidades === id)
    if (indice === -1) {
        throw new Error(`No existe una localidad con id ${id}`)
    }
    localidades.splice(indice,1)
}
