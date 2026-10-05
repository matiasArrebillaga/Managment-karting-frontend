import { useEffect, useState } from 'react'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { createReserva, getCircuitosDisponiblesReserva, getKartingsDisponiblesReserva, updateReserva } from '../../services/reservaService'
import { getPersonas } from '../../services/personaService'
import type { Circuito, CreateReservaInput, IReserva, Karting, Persona } from '../../types'

type Props = {
    abierto: boolean
    reserva?: IReserva | null
    idPersonaActual: number
    nombrePersonaActual: string
    puedeGestionar: boolean
    onCerrar: () => void
    onGuardado: () => void
}

function fechaInput (fecha: Date) {
    const year = fecha.getFullYear()
    const month = String(fecha.getMonth() + 1).padStart(2, '0')
    const day = String(fecha.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function horaInput (fecha: Date) {
    const hours = String(fecha.getHours()).padStart(2, '0')
    const minutes = String(fecha.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
}

function ReservaFormDialog ({ abierto, reserva, idPersonaActual, nombrePersonaActual, puedeGestionar, onCerrar, onGuardado }: Props) {
    const [fechaReserva, setFechaReserva] = useState('')
    const [horaInicio, setHoraInicio] = useState('')
    const [horaFin, setHoraFin] = useState('')
    const [personaId, setPersonaId] = useState(String(idPersonaActual))
    const [circuitoId, setCircuitoId] = useState('')
    const [kartingId, setKartingId] = useState('')
    const [personas, setPersonas] = useState<Persona[]>([])
    const [circuitos, setCircuitos] = useState<Circuito[]>([])
    const [kartings, setKartings] = useState<Karting[]>([])
    const [cargandoCircuitos, setCargandoCircuitos] = useState(false)
    const [cargandoKartings, setCargandoKartings] = useState(false)
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState('')

    const editando = Boolean(reserva)

    useEffect(() => {
        if (!abierto) return

        Promise.all([puedeGestionar ? getPersonas() : Promise.resolve([])])
            .then(([datosPersonas]) => {
                setPersonas(datosPersonas)
            })
    }, [abierto, puedeGestionar])

    useEffect(() => {
        if (reserva) {
            setFechaReserva(fechaInput(reserva.fechaReserva))
            setHoraInicio(horaInput(reserva.horaInicio))
            setHoraFin(horaInput(reserva.horaFin))
            setPersonaId(String(reserva.Personas_idPersona))
            setCircuitoId(String(reserva.Circuitos_idCircuitos))
            setKartingId(String(reserva.Kartings_idKartings))
        } else {
            setFechaReserva('')
            setHoraInicio('')
            setHoraFin('')
            setPersonaId(String(idPersonaActual))
            setCircuitoId('')
            setKartingId('')
        }
        setError('')
    }, [reserva, abierto, idPersonaActual])

    useEffect(() => {
        if (!abierto || !fechaReserva || !horaInicio || !horaFin) {
            setCircuitos([])
            setKartings([])
            return
        }

        setCargandoCircuitos(true)
        setCargandoKartings(true)
        Promise.all([
            getCircuitosDisponiblesReserva(fechaReserva, horaInicio, horaFin, reserva?.idReservas),
            getKartingsDisponiblesReserva(fechaReserva, horaInicio, horaFin, reserva?.idReservas),
        ])
            .then(([circuitosDisponibles, kartingsDisponibles]) => {
                setCircuitos(circuitosDisponibles)
                setKartings(kartingsDisponibles)
            })
            .catch((motivo: unknown) => {
                setCircuitos([])
                setKartings([])
                setError(motivo instanceof Error ? motivo.message : 'No se pudieron cargar los recursos disponibles')
            })
            .finally(() => {
                setCargandoCircuitos(false)
                setCargandoKartings(false)
            })
    }, [abierto, fechaReserva, horaInicio, horaFin, reserva])

    async function handleGuardar () {
        if (!fechaReserva || !horaInicio || !horaFin || !personaId || !circuitoId || !kartingId) return

        setGuardando(true)
        setError('')
        try {
            const datos: CreateReservaInput = {
                fechaReserva,
                horaInicio,
                horaFin,
                Personas_idPersona: Number(personaId),
                Circuitos_idCircuitos: Number(circuitoId),
                Kartings_idKartings: Number(kartingId),
            }
            if (editando && reserva?.idReservas !== undefined) {
                await updateReserva(reserva.idReservas, datos)
            } else {
                await createReserva(datos)
            }
            onGuardado()
        } catch (motivo) {
            setError(motivo instanceof Error ? motivo.message : 'No se pudo guardar la reserva')
        } finally {
            setGuardando(false)
        }
    }

    return (
        <Dialog open={abierto} onClose={onCerrar}>
            <DialogTitle>{editando ? 'Editar Reserva' : 'Nueva Reserva'}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1, minWidth: 320 }}>
                    {puedeGestionar ? (
                        <TextField
                            select
                            label="Persona"
                            value={personaId}
                            onChange={(event) => setPersonaId(event.target.value)}
                            fullWidth
                        >
                            {personas.map((persona) => (
                                <MenuItem key={persona.idPersona} value={String(persona.idPersona)}>
                                    {persona.nombre} {persona.apellido}
                                </MenuItem>
                            ))}
                        </TextField>
                    ) : (
                        <TextField label="Persona" value={nombrePersonaActual} disabled fullWidth />
                    )}
                    <TextField
                        label="Fecha de reserva"
                        type="date"
                        value={fechaReserva}
                        onChange={(event) => {
                            setFechaReserva(event.target.value)
                            setCircuitoId('')
                            setKartingId('')
                        }}
                        slotProps={{ inputLabel: { shrink: true } }}
                        required
                        fullWidth
                    />
                    <TextField
                        label="Hora de inicio"
                        type="time"
                        value={horaInicio}
                        onChange={(event) => {
                            setHoraInicio(event.target.value)
                            setCircuitoId('')
                            setKartingId('')
                        }}
                        slotProps={{ inputLabel: { shrink: true } }}
                        required
                        fullWidth
                    />
                    <TextField
                        label="Hora de fin"
                        type="time"
                        value={horaFin}
                        onChange={(event) => {
                            setHoraFin(event.target.value)
                            setCircuitoId('')
                            setKartingId('')
                        }}
                        slotProps={{ inputLabel: { shrink: true } }}
                        required
                        fullWidth
                    />
                    {cargandoCircuitos ? (
                        <Typography>Cargando circuitos disponibles...</Typography>
                    ) : (
                        <TextField
                            select
                            label="Circuito disponible"
                            value={circuitoId}
                            onChange={(event) => setCircuitoId(event.target.value)}
                            required
                            fullWidth
                        >
                            {circuitos.map((circuito) => (
                                <MenuItem key={circuito.idCircuitos} value={String(circuito.idCircuitos)}>
                                    Circuito {circuito.idCircuitos} ({circuito.distancia} m)
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                    {!cargandoCircuitos && fechaReserva && horaInicio && horaFin && circuitos.length === 0 && (
                        <Typography color="text.secondary">No hay circuitos con capacidad disponible en ese horario.</Typography>
                    )}
                    {cargandoKartings ? (
                        <Typography>Cargando kartings disponibles...</Typography>
                    ) : (
                        <TextField
                            select
                            label="Karting"
                            value={kartingId}
                            onChange={(event) => setKartingId(event.target.value)}
                            required
                            fullWidth
                        >
                            {kartings.map((karting) => (
                                <MenuItem key={karting.idKartings} value={String(karting.idKartings)}>
                                    {karting.modelo} ({karting.categoria})
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                    {!cargandoKartings && fechaReserva && horaInicio && horaFin && kartings.length === 0 && (
                        <Typography color="text.secondary">No hay kartings disponibles en ese horario.</Typography>
                    )}
                    {error && <Alert severity="error">{error}</Alert>}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCerrar}>Cancelar</Button>
                <Button
                    variant="contained"
                    onClick={handleGuardar}
                    disabled={guardando || cargandoCircuitos || cargandoKartings || !fechaReserva || !horaInicio || !horaFin || !personaId || !circuitoId || !kartingId}
                >
                    Guardar
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ReservaFormDialog
