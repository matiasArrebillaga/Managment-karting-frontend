// Conversiones de fecha y hora entre el formato de la API / los <input> y Date.
// Todo se maneja en hora local: un 'YYYY-MM-DD' sin hora el navegador lo lee en UTC
// y en Argentina queda en el día anterior, por eso se arma con T00:00:00.

const dosDigitos = (n: number) => String(n).padStart(2, '0')

// Date o texto → 'YYYY-MM-DD' (lo que esperan la API y <input type="date">)
export function fechaTexto (valor: Date | string): string {
    if (typeof valor === 'string') return valor.slice(0, 10)
    return `${valor.getFullYear()}-${dosDigitos(valor.getMonth() + 1)}-${dosDigitos(valor.getDate())}`
}

// Date, 'HH:MM:SS' o ISO '...THH:MM:SS' → 'HH:MM' (lo que esperan la API y <input type="time">)
export function horaTexto (valor: Date | string): string {
    if (typeof valor === 'string') {
        const desde = valor.includes('T') ? valor.indexOf('T') + 1 : 0
        return valor.slice(desde, desde + 5)
    }
    return `${dosDigitos(valor.getHours())}:${dosDigitos(valor.getMinutes())}`
}

// Date o texto 'YYYY-MM-DD...' → Date a la medianoche local de ese día
export function fechaLocal (valor: Date | string): Date {
    if (valor instanceof Date) return new Date(valor.getFullYear(), valor.getMonth(), valor.getDate())
    return new Date(`${valor.slice(0, 10)}T00:00:00`)
}

// 'HH:MM', 'HH:MM:SS' o ISO '...THH:MM:SS' + día → Date local de ese día a esa hora
export function horaLocal (valor: string, dia: Date): Date {
    const desde = valor.includes('T') ? valor.indexOf('T') + 1 : 0
    return new Date(`${fechaTexto(dia)}T${valor.slice(desde, desde + 8)}`)
}
