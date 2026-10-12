import type { DatosRegistro, Rol, Sesion } from '../types'

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/+$/, '')

export type { DatosRegistro, Rol, Sesion }

function esObjeto(valor: unknown): valor is Record<string, unknown> {
    return typeof valor === 'object' && valor !== null
}

async function leerError(response: Response, mensajePorDefecto: string): Promise<Error> {
    const cuerpo: unknown = await response.json().catch(() => null)
    if (esObjeto(cuerpo) && typeof cuerpo.message === 'string') {
        return new Error(cuerpo.message)
    }
    return new Error(mensajePorDefecto)
}

function leerRol(valor: unknown): Rol | null {
    const rol = typeof valor === 'string'
        ? valor
        : esObjeto(valor) && typeof valor.nombre === 'string'
            ? valor.nombre
            : null

    return rol === 'ADMIN' || rol === 'EMPLEADO' || rol === 'CLIENTE' ? rol : null
}

function decodificarRol(token: string): Rol | null {
    const segmentoPayload = token.split('.')[1]
    if (!segmentoPayload) return null

    try {
        const base64 = segmentoPayload.replace(/-/g, '+').replace(/_/g, '/')
        const bytes = Uint8Array.from(atob(base64), (caracter) => caracter.charCodeAt(0))
        const payload: unknown = JSON.parse(new TextDecoder().decode(bytes))
        return esObjeto(payload) ? leerRol(payload.rol) : null
    } catch {
        return null
    }
}

function normalizarSesion(respuesta: unknown): Sesion {
    if (
        !esObjeto(respuesta)
        || typeof respuesta.token !== 'string'
        || !esObjeto(respuesta.persona)
    ) {
        throw new Error('El servidor devolvió una respuesta de inicio de sesión inválida')
    }

    const persona = respuesta.persona
    if (
        typeof persona.idPersona !== 'number'
        || typeof persona.nombre !== 'string'
        || typeof persona.apellido !== 'string'
        || typeof persona.mail !== 'string'
    ) {
        throw new Error('El servidor devolvió datos de persona incompletos')
    }

    const rol = decodificarRol(respuesta.token) ?? leerRol(persona.rol)
    if (!rol) {
        throw new Error('La respuesta de inicio de sesión no contiene un rol válido')
    }

    const idRol = esObjeto(persona.rol) && typeof persona.rol.idRol === 'number'
        ? persona.rol.idRol
        : rol === 'ADMIN' ? 1 : rol === 'EMPLEADO' ? 2 : 3

    return {
        token: respuesta.token,
        persona: {
            idPersona: persona.idPersona,
            nombre: persona.nombre,
            apellido: persona.apellido,
            mail: persona.mail,
            rol: { idRol, nombre: rol },
        },
    }
}

export async function login(mail: string, contraseña: string): Promise<Sesion> {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mail: mail.trim(), contraseña }),
    })

    if (!response.ok) {
        throw await leerError(response, 'No se pudo iniciar sesión')
    }

    return normalizarSesion(await response.json())
}

export async function register(datos: DatosRegistro): Promise<Sesion> {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...datos,
            nombre: datos.nombre.trim(),
            apellido: datos.apellido.trim(),
            dni: datos.dni.trim(),
            mail: datos.mail.trim(),
            telefono: datos.telefono.trim(),
            idRol: 3,
        }),
    })

    if (!response.ok) {
        throw await leerError(response, 'No se pudo crear la cuenta')
    }

    try {
        return await login(datos.mail, datos.contraseña)
    } catch (error) {
        const detalle = error instanceof Error ? error.message : 'Error desconocido'
        throw new Error(`La cuenta se creó, pero no se pudo iniciar sesión automáticamente: ${detalle}`)
    }
}
