import { afterEach, describe, expect, it, vi } from 'vitest'
import { login } from './authService'

// token falso con el payload que arma el backend: solo importa el rol (la firma no se valida en el front)
function tokenConRol (rol: unknown): string {
    const payload = btoa(JSON.stringify({ idPersona: 7, rol })).replace(/=+$/, '')
    return `cabecera.${payload}.firma`
}

const personaApi = { idPersona: 7, nombre: 'Juan', apellido: 'Gómez', mail: 'juan@karting.com' }

function responderCon (cuerpo: unknown, status = 200) {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(cuerpo), { status })))
}

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('login (normalización de la sesión)', () => {
    it('toma el rol del token y arma la persona solo con los campos que usa el front', async () => {
        responderCon({ token: tokenConRol('CLIENTE'), persona: { ...personaApi, contraseña: 'hash', dni: '123' } })

        const sesion = await login('  juan@karting.com  ', 'secreta123')

        expect(sesion.persona).toEqual({ ...personaApi, rol: { idRol: 3, nombre: 'CLIENTE' } })
        // el mail se manda sin espacios
        const [, init] = vi.mocked(fetch).mock.calls[0]
        expect(JSON.parse(String(init?.body))).toEqual({ mail: 'juan@karting.com', contraseña: 'secreta123' })
    })

    it('si el token no trae rol, usa el rol de la persona con su idRol', async () => {
        responderCon({ token: 'sin.payload-valido.firma', persona: { ...personaApi, rol: { idRol: 2, nombre: 'EMPLEADO' } } })

        const sesion = await login('juan@karting.com', 'secreta123')

        expect(sesion.persona.rol).toEqual({ idRol: 2, nombre: 'EMPLEADO' })
    })

    it('rechaza un rol desconocido', async () => {
        responderCon({ token: tokenConRol('SUPERUSUARIO'), persona: personaApi })

        await expect(login('juan@karting.com', 'secreta123')).rejects.toThrow('no contiene un rol válido')
    })

    it('rechaza una respuesta sin datos de persona completos', async () => {
        responderCon({ token: tokenConRol('CLIENTE'), persona: { idPersona: 7 } })

        await expect(login('juan@karting.com', 'secreta123')).rejects.toThrow('datos de persona incompletos')
    })

    it('muestra el mensaje del backend cuando las credenciales son incorrectas', async () => {
        responderCon({ message: 'Credenciales inválidas' }, 401)

        await expect(login('juan@karting.com', 'mala')).rejects.toThrow('Credenciales inválidas')
    })
})
