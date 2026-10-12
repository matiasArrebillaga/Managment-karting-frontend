import { useEffect, useState } from "react"
import { createCircuito, updateCircuito } from "../../services/circuitoService"
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material"
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
    const [error, setError] = useState('')

    const editando = Boolean(circuito)
    const puedeGuardar = Number.isInteger(Number(distancia))
        && Number(distancia) > 0
        && dificultad !== ''
        && Number.isInteger(Number(maximo))
        && Number(maximo) > 0

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
        if (!puedeGuardar) {
            setError('Ingresá una distancia y capacidad válidas, y seleccioná la dificultad')
            return
        }
        setGuardando(true)
        setError('')
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
        } catch (motivo) {
            setError(motivo instanceof Error ? motivo.message : 'No se pudo guardar el circuito')
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
                        slotProps={{ htmlInput: { min: 1, step: 1 } }}
                        required
                        fullWidth
                    />
                    <TextField
                        select
                        label="Dificultad"
                        value={dificultad}
                        onChange={(e) => setDificultad(e.target.value)}
                        required
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
                        slotProps={{ htmlInput: { min: 1, step: 1 } }}
                        required
                        fullWidth
                    />
                    {error && <Alert severity="error">{error}</Alert>}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCerrar}>Cancelar</Button>
                <Button variant="contained" onClick={handleGuardar} disabled={guardando || !puedeGuardar}>Guardar</Button>
            </DialogActions>
        </Dialog>
    )
}

export default CircuitoFormDialog
