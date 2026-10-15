// Formatos que ve el usuario: siempre es-AR, así no dependen del idioma del navegador.

// Un string 'YYYY-MM-DD' se arma con T00:00:00 para leerlo como día local:
// sin la hora, el navegador lo toma en UTC y en Argentina muestra el día anterior.
export function fecha (valor: Date | string): string {
    const dia = typeof valor === 'string' ? new Date(`${valor.slice(0, 10)}T00:00:00`) : valor
    return dia.toLocaleDateString('es-AR')
}

// El backend manda las horas de reserva como 'HH:MM:SS' y las de carrera como Date
export function hora (valor: Date | string): string {
    if (typeof valor === 'string') return valor.slice(0, 5)
    return `${String(valor.getHours()).padStart(2, '0')}:${String(valor.getMinutes()).padStart(2, '0')}`
}

// el monto de la reserva puede llegar como texto (Decimal de Prisma): Number lo convierte
export function pesos (monto: number | string): string {
    return `$${Number(monto).toLocaleString('es-AR')}`
}
