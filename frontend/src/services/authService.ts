const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

export type Rol = 'ADMIN' | 'EMPLEADO' | 'CLIENTE'

export interface PersonaConRol {
    idPersona: number
    nombre: string
    apellido: string
    mail: string
    rol: { idRol: number; nombre: Rol }
}

export interface Sesion {
    token: string
    persona: PersonaConRol
}

type UsuarioMock = {
    idPersona: number
    nombre: string
    apellido: string
    mail: string
    contraseña: string
    idRol: number
    rol: Rol
}

// Usuarios de prueba para poder loguearse sin el backend real (VITE_USE_MOCKS=true).
// Los idPersona coinciden con los de data/mockData.ts (Maria Gomez, Agustina Castro, Tomas Ibarra).
const USUARIOS_MOCK: UsuarioMock[] = [
    { idPersona: 1, nombre: 'Maria', apellido: 'Gomez', mail: 'admin@karting.com', contraseña: '1234', idRol: 1, rol: 'ADMIN' },
    { idPersona: 2, nombre: 'Agustina', apellido: 'Castro', mail: 'empleado@karting.com', contraseña: '1234', idRol: 2, rol: 'EMPLEADO' },
    { idPersona: 3, nombre: 'Tomas', apellido: 'Ibarra', mail: 'cliente@karting.com', contraseña: '1234', idRol: 3, rol: 'CLIENTE' },
]

const demora = () => new Promise((resolve) => setTimeout(resolve, 300))

export async function login(mail: string, contraseña: string): Promise<Sesion> {
    if (USE_MOCKS) {
        await demora()
        const usuario = USUARIOS_MOCK.find((u) => u.mail === mail && u.contraseña === contraseña)
        if (!usuario) {
            throw new Error('Credenciales invalidas')
        }
        return {
            token: `mock-token-${usuario.idPersona}`,
            persona: {
                idPersona: usuario.idPersona,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                mail: usuario.mail,
                rol: { idRol: usuario.idRol, nombre: usuario.rol },
            },
        }
    }

    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mail, contraseña }),
    })
    if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.message ?? 'Credenciales invalidas')
    }
    return response.json()
}
