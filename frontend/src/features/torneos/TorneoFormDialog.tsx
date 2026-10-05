import { useEffect, useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material'
import { createTorneo, updateTorneo } from '../../services/torneoService'
import type { CreateTorneos, ITorneos } from '../../types'

type Props = {
    abierto: boolean
    torneo?: ITorneos | null
    onCerrar: () => void
    onGuardado: () => void
}

function fechaInput (fecha: Date) {
    const year = fecha.getFullYear()
    const month = String(fecha.getMonth() + 1).padStart(2, '0')
    const day = String(fecha.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function TorneoFormDialog ({ abierto, torneo, onCerrar, onGuardado }: Props) {
    const [nombre, setNombre] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [cupoMaximo, setCupoMaximo] = useState('')
    const [fechaInicio, setFechaInicio] = useState('')
    const [fechaFin, setFechaFin] = useState('')
    const [guardando, setGuardando] = useState(false)

    const editando = Boolean(torneo)
    const fechasValidas = fechaInicio !== '' && fechaFin !== '' && fechaInicio <= fechaFin
    const puedeGuardar = nombre.trim() !== '' && cupoMaximo !== '' && Number(cupoMaximo) > 0 && fechasValidas

    useEffect(() => {
        if (torneo) {
            setNombre(torneo.nombre)
            setDescripcion(torneo.descripcion)
            setCupoMaximo(String(torneo.cupoMaximo))
            setFechaInicio(fechaInput(torneo.fechaInicio))
            setFechaFin(fechaInput(torneo.fechaFin))
        } else {
            setNombre('')
            setDescripcion('')
            setCupoMaximo('')
            setFechaInicio('')
            setFechaFin('')
        }
    }, [torneo, abierto])

    async function handleGuardar () {
        if (!puedeGuardar) return

        setGuardando(true)
        try {
            const datos: CreateTorneos = {
                nombre: nombre.trim(),
                descripcion: descripcion.trim(),
                cupoMaximo: Number(cupoMaximo),
                fechaInicio: new Date(`${fechaInicio}T00:00:00`),
                fechaFin: new Date(`${fechaFin}T00:00:00`),
            }
            if (editando && torneo?.idTorneos !== undefined) {
                await updateTorneo(torneo.idTorneos, datos)
            } else {
                await createTorneo(datos)
            }
            onGuardado()
        } finally {
            setGuardando(false)
        }
    }

    return (
        <Dialog open={abierto} onClose={onCerrar}>
            <DialogTitle>{editando ? 'Editar Torneo' : 'Nuevo Torneo'}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1, minWidth: 320 }}>
                    <TextField
                        label="Nombre"
                        value={nombre}
                        onChange={(event) => setNombre(event.target.value)}
                        required
                        fullWidth
                    />
                    <TextField
                        label="Descripción"
                        value={descripcion}
                        onChange={(event) => setDescripcion(event.target.value)}
                        multiline
                        minRows={2}
                        fullWidth
                    />
                    <TextField
                        label="Cupo máximo"
                        type="number"
                        value={cupoMaximo}
                        onChange={(event) => setCupoMaximo(event.target.value)}
                        slotProps={{ htmlInput: { min: 1, step: 1 } }}
                        required
                        fullWidth
                    />
                    <TextField
                        label="Fecha de inicio"
                        type="date"
                        value={fechaInicio}
                        onChange={(event) => setFechaInicio(event.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        required
                        fullWidth
                    />
                    <TextField
                        label="Fecha de fin"
                        type="date"
                        value={fechaFin}
                        onChange={(event) => setFechaFin(event.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        error={fechaFin !== '' && fechaInicio !== '' && fechaFin < fechaInicio}
                        helperText={fechaFin !== '' && fechaInicio !== '' && fechaFin < fechaInicio ? 'La fecha de fin debe ser posterior al inicio' : ''}
                        required
                        fullWidth
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCerrar}>Cancelar</Button>
                <Button variant="contained" onClick={handleGuardar} disabled={guardando || !puedeGuardar}>
                    Guardar
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default TorneoFormDialog
