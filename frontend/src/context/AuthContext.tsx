import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { login as loginService, register as registerService, type DatosRegistro, type Sesion } from "../services/authService"
import { EVENTO_SESION_INVALIDA } from "../services/httpClient"
import type { PersonaAuth } from "../types"

type AuthContextValue = {
    persona: PersonaAuth | null
    cargando: boolean
    login: (mail: string, contraseña: string) => Promise<void>
    register: (datos: DatosRegistro) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const CLAVE_STORAGE = 'karting_sesion'

export function AuthProvider ({ children }: { children: ReactNode }) {
    const [persona, setPersona] = useState<PersonaAuth | null>(null)
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        function handleSesionInvalida () {
            localStorage.removeItem(CLAVE_STORAGE)
            setPersona(null)
        }

        window.addEventListener(EVENTO_SESION_INVALIDA, handleSesionInvalida)
        try {
            const guardada = localStorage.getItem(CLAVE_STORAGE)
            if (guardada) {
                const sesion: Sesion = JSON.parse(guardada)
                setPersona(sesion.persona)
            }
        } catch {
            localStorage.removeItem(CLAVE_STORAGE)
        } finally {
            setCargando(false)
        }
        return () => window.removeEventListener(EVENTO_SESION_INVALIDA, handleSesionInvalida)
    }, [])

    async function login (mail: string, contraseña: string) {
        const sesion = await loginService(mail, contraseña)
        localStorage.setItem(CLAVE_STORAGE, JSON.stringify(sesion))
        setPersona(sesion.persona)
    }

    async function register (datos: DatosRegistro) {
        const sesion = await registerService(datos)
        localStorage.setItem(CLAVE_STORAGE, JSON.stringify(sesion))
        setPersona(sesion.persona)
    }

    function logout () {
        localStorage.removeItem(CLAVE_STORAGE)
        setPersona(null)
    }

    return (
        <AuthContext.Provider value={{ persona, cargando, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth () {
    const contexto = useContext(AuthContext)
    if (!contexto) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider')
    }
    return contexto
}
