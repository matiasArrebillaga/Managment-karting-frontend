import { useEffect, useState, type ReactNode } from "react"
import { login as loginService, register as registerService, type DatosRegistro, type Sesion } from "../services/authService"
import { EVENTO_SESION_INVALIDA } from "../services/httpClient"
import type { PersonaAuth } from "../types"
import { AuthContext } from "./AuthContext"

const CLAVE_STORAGE = 'karting_sesion'

// localStorage es síncrono: la sesión guardada se lee al crear el estado,
// así el primer render ya sabe si hay alguien logueado (no hace falta un estado "cargando").
function leerSesionGuardada (): PersonaAuth | null {
    try {
        const guardada = localStorage.getItem(CLAVE_STORAGE)
        if (!guardada) return null
        const sesion: Sesion = JSON.parse(guardada)
        return sesion.persona
    } catch {
        localStorage.removeItem(CLAVE_STORAGE)
        return null
    }
}

export function AuthProvider ({ children }: { children: ReactNode }) {
    const [persona, setPersona] = useState(leerSesionGuardada)

    // httpClient avisa con este evento cuando el backend rechaza el token
    useEffect(() => {
        function handleSesionInvalida () {
            localStorage.removeItem(CLAVE_STORAGE)
            setPersona(null)
        }
        window.addEventListener(EVENTO_SESION_INVALIDA, handleSesionInvalida)
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
        <AuthContext.Provider value={{ persona, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}
