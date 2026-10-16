import type { DatosRegistro, Persona, Rol, RolDetalle } from "../types"
import { apiFetch } from "./httpClient"

// Sin contraseña: en una edición vacía significa "no cambiarla"
export type DatosPersona = Omit<DatosRegistro, 'contraseña'> & { contraseña?: string }

function limpiar(datos: DatosPersona): DatosPersona {
    return {
        ...datos,
        nombre: datos.nombre.trim(),
        apellido: datos.apellido.trim(),
        dni: datos.dni.trim(),
        mail: datos.mail.trim(),
        telefono: datos.telefono.trim(),
        contraseña: datos.contraseña || undefined,
    }
}

export async function getPersonas(): Promise<Persona[]> {
    const response = await apiFetch('/personas')
    return response.json() as Promise<Persona[]>
}

// GET /roles es solo ADMIN: se usa para mostrar el nombre del rol (GET /personas solo manda idRol)
export async function getRoles(): Promise<RolDetalle[]> {
    const response = await apiFetch('/roles')
    return response.json() as Promise<RolDetalle[]>
}

// CLIENTE -> POST /personas, EMPLEADO -> POST /personas/empleado
export async function createPersona(datos: DatosRegistro, tipo: 'CLIENTE' | 'EMPLEADO'): Promise<Persona> {
    const cuerpo = limpiar(datos)
    const response = await apiFetch(tipo === 'EMPLEADO' ? '/personas/empleado' : '/personas', {
        method: 'POST',
        body: JSON.stringify(cuerpo),
    })
    return response.json() as Promise<Persona>
}

export async function updatePersona(id: number, datos: DatosPersona): Promise<void> {
    const cuerpo = limpiar(datos)
    await apiFetch(`/personas/${id}`, { method: 'PATCH', body: JSON.stringify(cuerpo) })
}

export async function asignarRol(id: number, nombreRol: Rol): Promise<void> {
    await apiFetch(`/personas/${id}/rol`, { method: 'POST', body: JSON.stringify({ nombreRol }) })
}

export async function deletePersona(id: number): Promise<void> {
    await apiFetch(`/personas/${id}`, { method: 'DELETE' })
}
