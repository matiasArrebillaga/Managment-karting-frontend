const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/+$/, '')
const CLAVE_STORAGE = 'karting_sesion'
export const EVENTO_SESION_INVALIDA = 'karting:session-invalid'

function obtenerToken(): string {
    const guardada = localStorage.getItem(CLAVE_STORAGE)
    if (!guardada) {
        throw new Error('Tu sesión no está disponible. Iniciá sesión nuevamente.')
    }

    try {
        const sesion: unknown = JSON.parse(guardada)
        if (
            typeof sesion === 'object'
            && sesion !== null
            && 'token' in sesion
            && typeof sesion.token === 'string'
        ) {
            return sesion.token
        }
    } catch {
        localStorage.removeItem(CLAVE_STORAGE)
    }

    throw new Error('La sesión guardada no es válida. Iniciá sesión nuevamente.')
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
    const headers = new Headers(init.headers)
    headers.set('Authorization', `Bearer ${obtenerToken()}`)
    if (init.body !== undefined && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
    }

    const response = await fetch(`${API_URL}${path}`, { ...init, headers })
    if (!response.ok) {
        const cuerpo: unknown = await response.json().catch(() => null)
        const mensaje = (
            typeof cuerpo === 'object'
            && cuerpo !== null
            && 'message' in cuerpo
            && typeof cuerpo.message === 'string'
        ) ? cuerpo.message : null

        if (
            response.status === 401
            || (response.status === 403 && mensaje !== null && /token.*(inv[aí]lido|expirado|no proporcionado)/i.test(mensaje))
        ) {
            localStorage.removeItem(CLAVE_STORAGE)
            window.dispatchEvent(new Event(EVENTO_SESION_INVALIDA))
        }

        if (mensaje) throw new Error(mensaje)
        throw new Error(`La solicitud falló (${response.status})`)
    }

    return response
}

export const usaMocks = import.meta.env.VITE_USE_MOCKS === 'true'
