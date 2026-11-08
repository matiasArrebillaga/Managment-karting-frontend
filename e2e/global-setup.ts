import { API_URL, CLIENTE_PRUEBA } from './cliente.ts'

// Antes de los e2e se asegura que el cliente de prueba exista, usando la API pública
// (el mismo /auth/register que usa la pantalla "Crear cuenta"). Si ya existe no se toca.
async function puedeIngresar (): Promise<boolean> {
    const respuesta = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mail: CLIENTE_PRUEBA.mail, contraseña: CLIENTE_PRUEBA.contraseña }),
    })
    return respuesta.ok
}

export default async function globalSetup () {
    try {
        if (await puedeIngresar()) return
    } catch {
        throw new Error(`No se pudo conectar con el backend en ${API_URL}. Levantalo con "npm run dev" antes de correr los e2e.`)
    }

    const localidades = await fetch(`${API_URL}/auth/localidades`).then((r) => r.json()) as { idLocalidades: number }[]
    if (!Array.isArray(localidades) || localidades.length === 0) {
        throw new Error('No hay localidades cargadas: corré el seed del backend antes de los e2e.')
    }

    const registro = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nombre: CLIENTE_PRUEBA.nombre,
            apellido: CLIENTE_PRUEBA.apellido,
            dni: '99999999',
            fechaNacimiento: '2000-01-01',
            mail: CLIENTE_PRUEBA.mail,
            telefono: '3410000000',
            contraseña: CLIENTE_PRUEBA.contraseña,
            Localidades_idLocalidades: localidades[0].idLocalidades,
        }),
    })

    if (!registro.ok || !(await puedeIngresar())) {
        throw new Error(
            `No se pudo crear ni ingresar con el cliente de prueba ${CLIENTE_PRUEBA.mail} (status ${registro.status}): `
            + `${await registro.text()}. Si el mail ya existe con otra contraseña, usá E2E_CLIENTE_MAIL / E2E_CLIENTE_PASSWORD.`,
        )
    }
}
