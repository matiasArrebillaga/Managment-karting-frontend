import { useEffect, useState } from "react"
import { createCircuito, updateCircuito } from "../../services/circuitoService"
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material"
import type { Circuito } from "../../types"

const DIFICULTADES = ['Facil', 'Media', 'Dificil']

type Props = {
    abierto: boolean
    circuito?: Circuito | null
    onCerrar: () => void
    onGuardado: () => void
}

function CircuitoFormDialog({ abierto, circuito, onCerrar, onGuardado }: Props) {
    const [nombre, setNombre] = useState('')
    const [distancia, setDistancia] = useState('')
    const [dificultad, setDificultad] = useState('')
    const [capacidadMaxima, setCapacidadMaxima] = useState('')
    const [guardando, setGuardando] = useState(false)

    const editando = Boolean(circuito)

    useEffect(() => {
        if (circuito) {
            setNombre(circuito.nombre)
            setDistancia(String(circuito.distancia))
            setDificultad(circuito.dificultad)
            setCapacidadMaxima(String(circuito.capacidadMaxima))
        } else {
            setNombre('')
            setDistancia('')
            setDificultad('')
            setCapacidadMaxima('')
        }
    }, [circuito, abierto])

    async function handleGuardar() {
        setGuardando(true)
        try {
            const datos = {
                nombre,
                distancia: Number(distancia),
                dificultad,
                capacidadMaxima: Number(capacidadMaxima),
            }
            if (editando && circuito) {
                await updateCircuito(circuito.id, datos)
            } else {
                await createCircuito(datos)
            }
            onGuardado()
        } finally {
            setGuardando(false)
        }
    }

    return (
        <Dialog open={abierto} onClose={onCerrar}>
            <DialogTitle>{editando ? 'Editar Circuito' : 'Nuevo Circuito'}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        label="Nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Distancia (metros)"
                        type="number"
                        value={distancia}
                        onChange={(e) => setDistancia(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        select
                        label="Dificultad"
                        value={dificultad}
                        onChange={(e) => setDificultad(e.target.value)}
                        fullWidth
                    >
                        {DIFICULTADES.map((d) => (
                            <MenuItem key={d} value={d}>{d}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Capacidad maxima"
                        type="number"
                        value={capacidadMaxima}
                        onChange={(e) => setCapacidadMaxima(e.target.value)}
                        fullWidth
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCerrar}>Cancelar</Button>
                <Button variant="contained" onClick={handleGuardar} disabled={guardando}>Guardar</Button>
            </DialogActions>
        </Dialog>
    )
}

export default CircuitoFormDialog
