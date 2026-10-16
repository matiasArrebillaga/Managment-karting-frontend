import type { Localidad } from '../types'
import { API_URL, apiFetch, esObjeto } from './httpClient'

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

// Sin token: el registro carga las localidades antes de que exista una sesión
export async function getLocalidadesParaRegistro(): Promise<Localidad[]> {
    const response = await fetch(`${API_URL}/auth/localidades`).catch(() => {
        throw new Error('No se pudo conectar con el servidor para cargar las localidades')
    })
    if (!response.ok) {
        throw new Error(`No se pudieron cargar las localidades (${response.status})`)
    }
    const lista = normalizarLista(await response.json())
    if (lista.length === 0) {
        throw new Error('No hay localidades cargadas. Contactá a un administrador.')
    }
    return lista
}

export async function getLocalidades(): Promise<Localidad[]> {
    const response = await apiFetch('/localidades')
    return normalizarLista(await response.json())
}

export async function getLocalidad(id: number): Promise<Localidad> {
    const response = await apiFetch(`/localidades/${id}`)
    return normalizarLocalidad(await response.json())
}

export async function createLocalidad(datos: Omit<Localidad, 'idLocalidades'>): Promise<Localidad> {
    validarNombre(datos.nombre)
    const response = await apiFetch('/localidades', {
        method: 'POST',
        body: JSON.stringify({ nombre: datos.nombre.trim() }),
    })
    return normalizarLocalidad(await response.json())
}

export async function updateLocalidad(id: number, datos: Omit<Localidad, 'idLocalidades'>): Promise<Localidad> {
    validarNombre(datos.nombre)
    const response = await apiFetch(`/localidades/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ nombre: datos.nombre.trim() }),
    })
    return normalizarLocalidad(await response.json())
}

export async function deleteLocalidad(id: number): Promise<void> {
    await apiFetch(`/localidades/${id}`, { method: 'DELETE' })
}
