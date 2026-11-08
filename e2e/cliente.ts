// Cliente de prueba de los e2e. Se puede cambiar con variables de entorno
// para usar otro usuario (por ejemplo en otra base).
export const API_URL = (process.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/+$/, '')

export const CLIENTE_PRUEBA = {
    nombre: 'Cliente',
    apellido: 'Prueba',
    mail: process.env.E2E_CLIENTE_MAIL ?? 'cliente.prueba@karting.com',
    contraseña: process.env.E2E_CLIENTE_PASSWORD ?? 'ClientePrueba123',
}
