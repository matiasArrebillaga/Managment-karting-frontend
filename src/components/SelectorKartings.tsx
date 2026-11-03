import { Button, FormHelperText, FormLabel, Stack } from '@mui/material'
import type { Karting, TipoKarting } from '../types'
import { pesos } from '../utils/formato'

type Props = {
    kartings: Karting[]
    tiposKarting: TipoKarting[]
    seleccionados: string[]
    onCambiar: (ids: string[]) => void
    // reserva: un solo kart (tocar otro lo reemplaza); carrera: varios (tocar uno lo agrega o lo saca)
    multiple?: boolean
    deshabilitado?: boolean
    ayuda?: string
    error?: string
}

// Grilla de tarjetas en vez de un select: se ve el modelo, la categoría y el precio de cada kart libre.
// Cada tarjeta es un <button> con aria-pressed, así funciona con teclado y lector de pantalla.
function SelectorKartings ({ kartings, tiposKarting, seleccionados, onCambiar, multiple = false, deshabilitado = false, ayuda, error }: Props) {
    function tocar (id: string) {
        if (!multiple) onCambiar([id])
        else onCambiar(seleccionados.includes(id) ? seleccionados.filter((otro) => otro !== id) : [...seleccionados, id])
    }

    const todosElegidos = kartings.length > 0 && kartings.every((karting) => seleccionados.includes(String(karting.idKartings)))

    return (
        <Stack spacing={1}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <FormLabel required error={Boolean(error)}>{multiple ? 'Kartings' : 'Karting'}</FormLabel>
                {multiple && !deshabilitado && kartings.length > 0 && (
                    <Button size="small" onClick={() => onCambiar(todosElegidos ? [] : kartings.map((karting) => String(karting.idKartings)))}>
                        {todosElegidos ? 'Quitar todos' : 'Seleccionar todos'}
                    </Button>
                )}
            </Stack>
            {!deshabilitado && kartings.length > 0 && (
                <div className="karts">
                    {kartings.map((karting) => {
                        const id = String(karting.idKartings)
                        const tipo = tiposKarting.find((item) => item.idTiposKarting === karting.TiposKarting_idTiposKarting)
                        const elegido = seleccionados.includes(id)
                        return (
                            <button key={id} type="button" className="kart" aria-pressed={elegido} onClick={() => tocar(id)}>
                                <b>{karting.modelo}</b>
                                {/* el tipo solo se agrega si no se llama igual que la categoría (evita "Junior · Junior") */}
                                <small>{karting.categoria}{tipo && tipo.nombre !== karting.categoria ? ` · ${tipo.nombre}` : ''}</small>
                                {tipo && <small className="mono">{pesos(tipo.precioHora)}/h</small>}
                            </button>
                        )
                    })}
                </div>
            )}
            <FormHelperText error={Boolean(error)}>{error ?? ayuda}</FormHelperText>
        </Stack>
    )
}

export default SelectorKartings
