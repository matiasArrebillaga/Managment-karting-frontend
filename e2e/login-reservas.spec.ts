import { expect, test } from '@playwright/test'
import { CLIENTE_PRUEBA } from './cliente.ts'

// El cliente no tiene el "Panel del día" (/dashboard es del staff y lo redirige a /mi-cuenta):
// su panel es "Mi cuenta", y desde ahí abre sus reservas.
test('el cliente de prueba ingresa, llega a su panel y abre Reservas', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Bienvenido a Management-Karting Rosario' })).toBeVisible()

    await page.getByLabel('Email').fill(CLIENTE_PRUEBA.mail)
    await page.getByLabel('Contraseña', { exact: true }).fill(CLIENTE_PRUEBA.contraseña)
    await page.getByRole('button', { name: 'Ingresar' }).click()

    // ingresó: sale del login y aparece su nombre en el menú de cuenta
    await expect(page).toHaveURL('/')
    const menuCuenta = page.getByRole('button', { name: new RegExp(`${CLIENTE_PRUEBA.nombre} ${CLIENTE_PRUEBA.apellido}`) })
    await expect(menuCuenta).toBeVisible()

    // el dashboard lo manda a su panel
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/mi-cuenta')
    await expect(page.getByRole('heading', { name: `Hola, ${CLIENTE_PRUEBA.nombre}` })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Próximas reservas' })).toBeVisible()

    // abre Reservas
    await page.getByRole('link', { name: 'Ver historial →' }).first().click()
    await expect(page).toHaveURL('/mi-cuenta/reservas')
    await expect(page.getByRole('heading', { name: 'Historial de reservas' })).toBeVisible()
})
