import { useEffect, useState } from 'react'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material'
import { createCarrera, updateCarrera } from '../../services/carreraService'
import { getCircuitos } from '../../services/circuitoService'
import { getTorneos } from '../../services/torneoService'
import { getKartings } from '../../services/kartingService'
import { usaMocks } from '../../services/httpClient'
import type { Circuito, CreateCarrera, ICarrera, ITorneos, Karting } from '../../types'

type Props = {
    abierto: boolean
    carrera?: ICarrera | null
    onCerrar: () => void
    onGuardado: () => void
}

function fechaLocal (fecha: Date) {
    const year = fecha.getFullYear()
    const month = String(fecha.getMonth() + 1).padStart(2, '0')
    const day = String(fecha.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function horaLocal (fecha: Date) {
    const hours = String(fecha.getHours()).padStart(2, '0')
    const minutes = String(fecha.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
}

function CarreraFormDialog ({ abierto, carrera, onCerrar, onGuardado }: Props) {
    const [fechaCarrera, setFechaCarrera] = useState('')
    const [horaInicio, setHoraInicio] = useState('')
    const [horaFin, setHoraFin] = useState('')
    const [torneoId, setTorneoId] = useState('')
    const [circuitoId, setCircuitoId] = useState('')
    const [kartingId, setKartingId] = useState('')
    const [circuitos, setCircuitos] = useState<Circuito[]>([])
    const [torneos, setTorneos] = useState<ITorneos[]>([])
    const [kartings, setKartings] = useState<Karting[]>([])
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState('')

    const editando = Boolean(carrera)

    useEffect(() => {
        if (abierto) {
            Promise.all([getCircuitos(), getTorneos(), getKartings()])
                .then(([datosCircuitos, datosTorneos, datosKartings]) => {
                    setCircuitos(datosCircuitos)
                    setTorneos(datosTorneos)
                    setKartings(datosKartings)
                })
                .catch((motivo: unknown) => {
                    setError(motivo instanceof Error ? motivo.message : 'No se pudieron cargar los datos de la carrera')
                })
        }
    }, [abierto])

    useEffect(() => {
        if (carrera) {
            setFechaCarrera(fechaLocal(carrera.fechaCarrera))
            setHoraInicio(horaLocal(carrera.horaInicio))
            setHoraFin(horaLocal(carrera.horaFin))
            setTorneoId(String(carrera.Torneos_idTorneos))
            setCircuitoId(String(carrera.Circuitos_idCircuitos))
            setKartingId(carrera.Kartings_idKartings === undefined ? '' : String(carrera.Kartings_idKartings))
        } else {
            setFechaCarrera('')
            setHoraInicio('')
            setHoraFin('')
            setTorneoId('')
            setCircuitoId('')
            setKartingId('')
        }
        setError('')
    }, [carrera, abierto])

    async function handleGuardar () {
        if (!fechaCarrera || !horaInicio || !horaFin || !torneoId || !circuitoId || !kartingId) {
            setError('Completá todos los campos de la carrera')
            return
        }
        if (horaInicio >= horaFin) {
            setError('La hora de inicio debe ser anterior a la hora de fin')
            return
        }

        setGuardando(true)
        setError('')
        try {
            const datos: CreateCarrera = {
                fechaCarrera: new Date(`${fechaCarrera}T00:00:00`),
                horaInicio,
                horaFin,
                Kartings_idKartings: Number(kartingId),
                Torneos_idTorneos: Number(torneoId),
                Circuitos_idCircuitos: Number(circuitoId),
            }
            if (editando && carrera) {
                await updateCarrera(carrera, datos)
            } else {
                await createCarrera(datos)
            }
            onGuardado()
        } catch (motivo) {
            setError(motivo instanceof Error ? motivo.message : 'No se pudo guardar la carrera')
        } finally {
            setGuardando(false)
        }
    }

    return (
        <Dialog open={abierto} onClose={onCerrar}>
            <DialogTitle>{editando ? 'Editar Carrera' : 'Nueva Carrera'}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1, minWidth: 320 }}>
                    <TextField
                        label="Fecha de la carrera"
                        type="date"
                        value={fechaCarrera}
                        onChange={(event) => setFechaCarrera(event.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        disabled={editando && !usaMocks}
                        required
                        fullWidth
                    />
                    <TextField
                        label="Hora de inicio"
                        type="time"
                        value={horaInicio}
                        onChange={(event) => setHoraInicio(event.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        required
                        fullWidth
                    />
                    <TextField
                        label="Hora de fin"
                        type="time"
                        value={horaFin}
                        onChange={(event) => setHoraFin(event.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        required
                        fullWidth
                    />
                    <TextField
                        select
                        label="Torneo"
                        value={torneoId}
                        onChange={(event) => setTorneoId(event.target.value)}
                        disabled={editando && !usaMocks}
                        required
                        fullWidth
                    >
                        {torneos.map((torneo) => torneo.idTorneos === undefined ? null : (
                            <MenuItem key={torneo.idTorneos} value={String(torneo.idTorneos)}>
                                {torneo.nombre}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label="Karting"
                        value={kartingId}
                        onChange={(event) => setKartingId(event.target.value)}
                        disabled={editando && !usaMocks}
                        required
                        fullWidth
                    >
                        {kartings.map((karting) => (
                            <MenuItem key={karting.idKartings} value={String(karting.idKartings)}>
                                {karting.modelo} ({karting.categoria})
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label="Circuito"
                        value={circuitoId}
                        onChange={(event) => setCircuitoId(event.target.value)}
                        disabled={editando && !usaMocks}
                        required
                        fullWidth
                    >
                        {circuitos.map((circuito) => (
                            <MenuItem key={circuito.idCircuitos} value={String(circuito.idCircuitos)}>
                                Circuito {circuito.idCircuitos} ({circuito.distancia} m)
                            </MenuItem>
                        ))}
                    </TextField>
                    {error && <Alert severity="error">{error}</Alert>}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCerrar}>Cancelar</Button>
                <Button variant="contained" onClick={handleGuardar} disabled={guardando}>Guardar</Button>
            </DialogActions>
        </Dialog>
    )
}

export default CarreraFormDialog