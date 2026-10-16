import type { Circuito } from '../types'
import { fechaLocal, horaTexto } from './fechas'

// Formatos que ve el usuario: siempre es-AR, así no dependen del idioma del navegador.

export function fecha (valor: Date | string): string {
    return fechaLocal(valor).toLocaleDateString('es-AR')
}

// El backend manda las horas de reserva como 'HH:MM:SS' y las de carrera como Date
export const hora = horaTexto

// el monto de la reserva puede llegar como texto (Decimal de Prisma): Number lo convierte
export function pesos (monto: number | string): string {
    return `$${Number(monto).toLocaleString('es-AR')}`
}

// los circuitos no tienen nombre en la base: se arma uno legible con sus datos
export function nombreCircuito (circuitos: Circuito[], id: number): string {
    const circuito = circuitos.find((item) => item.idCircuitos === id)
    return circuito ? `Circuito ${id} · ${circuito.distancia} m · ${circuito.dificultad}` : `Circuito ${id}`
}
