import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthContext } from '../context/AuthContext'
import type { Permiso } from '../permisos'
import type { PersonaAuth, Rol } from '../types'
import RutaProtegida from './RutaProtegida'

function personaConRol (rol: Rol): PersonaAuth {
    return {
        idPersona: 1,
        nombre: 'Ana',
        apellido: 'Pérez',
        mail: 'ana@karting.com',
        rol: { idRol: rol === 'ADMIN' ? 1 : rol === 'EMPLEADO' ? 2 : 3, nombre: rol },
    }
}

// Se usa el AuthContext directo (sin AuthProvider) para elegir la sesión sin pasar por la API.
function renderizarEn (persona: PersonaAuth | null, permiso?: Permiso) {
    return render(
        <AuthContext.Provider value={{ persona, login: async () => {}, register: async () => {}, logout: () => {} }}>
            <MemoryRouter initialEntries={['/privada']}>
                <Routes>
                    <Route path="/login" element={<h1>Pantalla de login</h1>} />
                    <Route
                        path="/privada"
                        element={<RutaProtegida permiso={permiso}><h1>Contenido privado</h1></RutaProtegida>}
                    />
                </Routes>
            </MemoryRouter>
        </AuthContext.Provider>,
    )
}

describe('RutaProtegida', () => {
    it('redirige a /login cuando no hay sesión', () => {
        renderizarEn(null)

        expect(screen.getByRole('heading', { name: 'Pantalla de login' })).toBeInTheDocument()
        expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument()
    })

    it('muestra "Acceso denegado" cuando el rol no tiene el permiso', () => {
        renderizarEn(personaConRol('CLIENTE'), 'personas.gestionar')

        expect(screen.getByText('Acceso denegado')).toBeInTheDocument()
        expect(screen.getByText(/Tu rol \(CLIENTE\) no tiene permiso/)).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/')
        expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument()
    })

    it('muestra el contenido cuando el rol tiene el permiso', () => {
        renderizarEn(personaConRol('ADMIN'), 'personas.gestionar')

        expect(screen.getByRole('heading', { name: 'Contenido privado' })).toBeInTheDocument()
        expect(screen.queryByText('Acceso denegado')).not.toBeInTheDocument()
    })

    it('sin permiso pedido alcanza con estar logueado, sea cual sea el rol', () => {
        renderizarEn(personaConRol('CLIENTE'))

        expect(screen.getByRole('heading', { name: 'Contenido privado' })).toBeInTheDocument()
    })
})
