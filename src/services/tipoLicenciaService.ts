import type { TipoLicencia } from "../types"
import { apiFetch, esObjeto } from "./httpClient"

function normalizarTipo(valor: unknown): TipoLicencia {
    if (
        !esObjeto(valor)
        || typeof valor.idTipoLicencia !== 'number'
        || typeof valor.nombre !== 'string'
        || typeof valor.descripcion !== 'string'
        || typeof valor.nivel !== 'number'
    ) {
        throw new Error('La API devolvió un tipo de licencia con un formato inválido')
    }
    return {
        idTipoLicencia: valor.idTipoLicencia,
        nombre: valor.nombre,
        descripcion: valor.descripcion,
        nivel: valor.nivel,
    }
}

function validarDatos(datos: Omit<TipoLicencia, 'idTipoLicencia'>): Omit<TipoLicencia, 'idTipoLicencia'> {
    const nombre = datos.nombre.trim()
    const descripcion = datos.descripcion.trim()
    if (!nombre || nombre.length > 45) throw new Error('El nombre debe tener entre 1 y 45 caracteres')
    if (!descripcion || descripcion.length > 45) throw new Error('La descripción debe tener entre 1 y 45 caracteres')
    if (!Number.isInteger(datos.nivel) || datos.nivel <= 0) throw new Error('El nivel debe ser un número entero positivo')
    return { nombre, descripcion, nivel: datos.nivel }
}

export async function getTiposLicencia(): Promise<TipoLicencia[]> {
    const response = await apiFetch('/tiposLicencias')
    const valor: unknown = await response.json()
    if (!Array.isArray(valor)) {
        throw new Error('La API devolvió una lista de tipos de licencia inválida')
    }
    return valor.map(normalizarTipo)
}

export async function getTipoLicencia(id: number): Promise<TipoLicencia> {
    const response = await apiFetch(`/tiposLicencias/${id}`)
    return normalizarTipo(await response.json())
}

export async function createTipoLicencia(datos: Omit<TipoLicencia, 'idTipoLicencia'>) : Promise<TipoLicencia> {
    const limpios = validarDatos(datos)
    const response = await apiFetch('/tiposLicencias', {
        method: 'POST',
        body: JSON.stringify(limpios),
    })
    return normalizarTipo(await response.json())
}

export async function updateTipoLicencia(id: number, datos: Omit<TipoLicencia, 'idTipoLicencia'>) : Promise<TipoLicencia> {
    const limpios = validarDatos(datos)
    const response = await apiFetch(`/tiposLicencias/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(limpios),
    })
    return normalizarTipo(await response.json())
}

export async function deleteTipoLicencia(id: number): Promise<void> {
    // si hay tipos de karting, licencias o torneos que lo usan, el backend rechaza el borrado
    await apiFetch(`/tiposLicencias/${id}`, { method: 'DELETE' })
}
