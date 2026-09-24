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
    const [distancia, setDistancia] = useState('')
    const [dificultad, setDificultad] = useState('')
    const [maximo, setMaximo] = useState('')
    const [guardando, setGuardando] = useState(false)

    const editando = Boolean(circuito)

    useEffect(() => {
        if (circuito) {
            setDistancia(String(circuito.distancia))
            setDificultad(circuito.dificultad)
            setMaximo(String(circuito.maximo))
        } else {
            setDistancia('')
            setDificultad('')
            setMaximo('')
        }
    }, [circuito, abierto])

    async function handleGuardar() {
        setGuardando(true)
        try {
            const datos = {
                distancia: Number(distancia),
                dificultad,
                maximo: Number(maximo),
            }
            if (editando && circuito) {
                await updateCircuito(circuito.idCircuitos, datos)
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
                        value={maximo}
                        onChange={(e) => setMaximo(e.target.value)}
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
