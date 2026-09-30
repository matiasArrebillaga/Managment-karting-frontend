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

export interface DatosRegistro {
    nombre: string
    apellido: string
    mail: string
    contraseña: string
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

const CLAVE_USUARIOS_REGISTRADOS = 'karting_usuarios_registrados'
const demora = () => new Promise((resolve) => setTimeout(resolve, 300))

function usuariosRegistrados(): UsuarioMock[] {
    try {
        return JSON.parse(localStorage.getItem(CLAVE_USUARIOS_REGISTRADOS) ?? '[]') as UsuarioMock[]
    } catch {
        return []
    }
}

function crearSesion(usuario: UsuarioMock): Sesion {
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

export async function login(mail: string, contraseña: string): Promise<Sesion> {
    if (USE_MOCKS) {
        await demora()
        const todosLosUsuarios = [...USUARIOS_MOCK, ...usuariosRegistrados()]
        const usuario = todosLosUsuarios.find(
            (u) => u.mail.toLowerCase() === mail.trim().toLowerCase() && u.contraseña === contraseña,
        )
        if (!usuario) {
            throw new Error('Credenciales invalidas')
        }
        return crearSesion(usuario)
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

export async function register(datos: DatosRegistro): Promise<Sesion> {
    if (USE_MOCKS) {
        await demora()
        const mail = datos.mail.trim().toLowerCase()
        const registrados = usuariosRegistrados()
        const existe = [...USUARIOS_MOCK, ...registrados].some((usuario) => usuario.mail.toLowerCase() === mail)
        if (existe) {
            throw new Error('Ya existe una cuenta con ese email')
        }

        const usuario: UsuarioMock = {
            idPersona: Math.max(0, ...USUARIOS_MOCK.map((u) => u.idPersona), ...registrados.map((u) => u.idPersona)) + 1,
            nombre: datos.nombre.trim(),
            apellido: datos.apellido.trim(),
            mail,
            contraseña: datos.contraseña,
            idRol: 3,
            rol: 'CLIENTE',
        }
        localStorage.setItem(CLAVE_USUARIOS_REGISTRADOS, JSON.stringify([...registrados, usuario]))
        return crearSesion(usuario)
    }

    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
    })
    if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.message ?? 'No se pudo crear la cuenta')
    }
    return response.json()
}
