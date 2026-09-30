import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { login as loginService, type PersonaConRol, type Sesion } from "../services/authService"

type AuthContextValue = {
    persona: PersonaConRol | null
    cargando: boolean
    login: (mail: string, contraseña: string) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const CLAVE_STORAGE = 'karting_sesion'

export function AuthProvider({ children }: { children: ReactNode }) {
    const [persona, setPersona] = useState<PersonaConRol | null>(null)
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
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
    }, [])

    async function login(mail: string, contraseña: string) {
        const sesion = await loginService(mail, contraseña)
        localStorage.setItem(CLAVE_STORAGE, JSON.stringify(sesion))
        setPersona(sesion.persona)
    }

    function logout() {
        localStorage.removeItem(CLAVE_STORAGE)
        setPersona(null)
    }

    return (
        <AuthContext.Provider value={{ persona, cargando, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const contexto = useContext(AuthContext)
    if (!contexto) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider')
    }
    return contexto
}
