import { describe, expect, it } from 'vitest'
import { fechaLocal, fechaTexto, horaLocal, horaTexto } from './fechas'

describe('fechaTexto', () => {
    it('convierte un Date a YYYY-MM-DD en hora local, con ceros a la izquierda', () => {
        expect(fechaTexto(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05')
    })

    it('recorta un texto ISO a la parte de la fecha', () => {
        expect(fechaTexto('2026-11-08T00:00:00.000Z')).toBe('2026-11-08')
    })
})

describe('horaTexto', () => {
    it('convierte un Date a HH:MM', () => {
        expect(horaTexto(new Date(2026, 0, 1, 9, 5))).toBe('09:05')
    })

    it('acepta HH:MM:SS (horas de reserva)', () => {
        expect(horaTexto('14:30:00')).toBe('14:30')
    })

    it('acepta ISO con T y se queda con la hora', () => {
        expect(horaTexto('1970-01-01T18:45:00.000Z')).toBe('18:45')
    })
})

describe('fechaLocal', () => {
    it('lee YYYY-MM-DD como medianoche local y no como el día anterior (UTC)', () => {
        const fecha = fechaLocal('2026-11-08')
        expect(fecha.getFullYear()).toBe(2026)
        expect(fecha.getMonth()).toBe(10)
        expect(fecha.getDate()).toBe(8)
        expect(fecha.getHours()).toBe(0)
    })

    it('a un Date le saca la hora', () => {
        const fecha = fechaLocal(new Date(2026, 4, 20, 17, 45))
        expect(fecha).toEqual(new Date(2026, 4, 20))
    })
})

describe('horaLocal', () => {
    it('combina un día con una hora HH:MM', () => {
        expect(horaLocal('10:15', new Date(2026, 2, 3))).toEqual(new Date(2026, 2, 3, 10, 15))
    })

    it('combina un día con la hora de un ISO', () => {
        expect(horaLocal('1970-01-01T20:00:00', new Date(2026, 2, 3))).toEqual(new Date(2026, 2, 3, 20, 0))
    })
})
