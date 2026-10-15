import type { Rol } from './types'

// Copia de los verifyRoles(...) del backend: si cambia una ruta allá, se cambia acá.
const PERMISOS = {
    'participaciones.ver': ['ADMIN', 'EMPLEADO'],
    'catalogos.ver': ['ADMIN', 'EMPLEADO'],
    'catalogos.eliminar': ['ADMIN'],
    'circuitos.crear': ['ADMIN'],
    'circuitos.editar': ['ADMIN', 'EMPLEADO'],
    'circuitos.eliminar': ['ADMIN'],
    'kartings.gestionar': ['ADMIN', 'EMPLEADO'],
    'kartings.eliminar': ['ADMIN', 'EMPLEADO'],
    'carreras.gestionar': ['ADMIN', 'EMPLEADO'],
    'carreras.eliminar': ['ADMIN'],
    'resultados.eliminar': ['ADMIN'],
    'torneos.gestionar': ['ADMIN', 'EMPLEADO'],
    'torneos.eliminar': ['ADMIN'],
    'inscripciones.verTodas': ['ADMIN', 'EMPLEADO'],
    'inscripciones.anotarse': ['CLIENTE', 'EMPLEADO'],
    'reservas.verTodas': ['ADMIN', 'EMPLEADO'],
    'personas.gestionar': ['ADMIN'],
} satisfies Record<string, Rol[]>

export type Permiso = keyof typeof PERMISOS

export function puede(rol: Rol | undefined, permiso: Permiso): boolean {
    const roles: readonly Rol[] = PERMISOS[permiso]
    return rol !== undefined && roles.includes(rol)
}
