import { useEffect, useState } from 'react'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { createReserva, updateReserva } from '../../services/reservaService'
import { getCircuitos } from '../../services/circuitoService'
import { getKartings } from '../../services/kartingService'
import { getPersonas } from '../../services/personaService'
import { usaMocks } from '../../services/httpClient'
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

function fechaInput (fecha: Date | string) {
    if (typeof fecha === 'string') return fecha.slice(0, 10)
    const year = fecha.getFullYear()
    const month = String(fecha.getMonth() + 1).padStart(2, '0')
    const day = String(fecha.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function horaInput (fecha: Date | string) {
    if (typeof fecha === 'string') return fecha.slice(0, 5)
    const hours = String(fecha.getHours()).padStart(2, '0')
    const minutes = String(fecha.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
}

function fechaMinimaInput () {
    const hoy = new Date()
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
}

function ReservaFormDialog ({ abierto, reserva, idPersonaActual, nombrePersonaActual, puedeGestionar, onCerrar, onGuardado }: Props) {
    const [fechaReserva, setFechaReserva] = useState('')
    const [horaInicio, setHoraInicio] = useState('')
    const [horaFin, setHoraFin] = useState('')
    const [monto, setMonto] = useState('')
    const [personaId, setPersonaId] = useState(String(idPersonaActual))
    const [circuitoId, setCircuitoId] = useState('')
    const [kartingId, setKartingId] = useState('')
    const [personas, setPersonas] = useState<Persona[]>([])
    const [circuitos, setCircuitos] = useState<Circuito[]>([])
    const [kartings, setKartings] = useState<Karting[]>([])
    const [cargandoCatalogos, setCargandoCatalogos] = useState(false)
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState('')

    const editando = Boolean(reserva)

    useEffect(() => {
        if (!abierto) return

        let cancelado = false
        setCargandoCatalogos(true)
        Promise.all([
            getCircuitos(),
            getKartings(),
            puedeGestionar ? getPersonas() : Promise.resolve([]),
        ])
            .then(([datosCircuitos, datosKartings, datosPersonas]) => {
                if (cancelado) return
                setCircuitos(datosCircuitos)
                setKartings(datosKartings.filter((karting) => (
                    karting.estado.toLowerCase() === 'disponible'
                    || karting.idKartings === reserva?.Kartings_idKartings
                )))
                setPersonas(datosPersonas)
            })
            .catch((motivo: unknown) => {
                if (!cancelado) {
                    setError(motivo instanceof Error ? motivo.message : 'No se pudieron cargar los datos de la reserva')
                }
            })
            .finally(() => {
                if (!cancelado) setCargandoCatalogos(false)
            })

        return () => {
            cancelado = true
        }
    }, [abierto, puedeGestionar, reserva])

    useEffect(() => {
        if (reserva) {
            setFechaReserva(fechaInput(reserva.fechaReserva))
            setHoraInicio(horaInput(reserva.horaInicio))
            setHoraFin(horaInput(reserva.horaFin))
            setMonto(reserva.monto === undefined ? '' : String(reserva.monto))
            setPersonaId(String(reserva.Personas_idPersona))
            setCircuitoId(String(reserva.Circuitos_idCircuitos))
            setKartingId(String(reserva.Kartings_idKartings))
        } else {
            setFechaReserva('')
            setHoraInicio('')
            setHoraFin('')
            setMonto('')
            setPersonaId(String(idPersonaActual))
            setCircuitoId('')
            setKartingId('')
        }
        setError('')
    }, [reserva, abierto, idPersonaActual])

    async function handleGuardar () {
        if (!fechaReserva || !personaId || !circuitoId || !kartingId) return

        const hoy = new Date()
        const fechaMinima = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`
        if (fechaReserva < fechaMinima) {
            setError('La fecha de reserva no puede ser anterior a hoy')
            return
        }
        if (usaMocks) {
            if (!horaInicio || !horaFin || !/^\d{2}:\d{2}$/.test(horaInicio) || !/^\d{2}:\d{2}$/.test(horaFin)) {
                setError('Las horas deben tener formato HH:MM')
                return
            }
            const minutosInicio = Number(horaInicio.slice(0, 2)) * 60 + Number(horaInicio.slice(3))
            const minutosFin = Number(horaFin.slice(0, 2)) * 60 + Number(horaFin.slice(3))
            if (
                minutosInicio >= 24 * 60
                || minutosFin >= 24 * 60
                || Number(horaInicio.slice(3)) >= 60
                || Number(horaFin.slice(3)) >= 60
            ) {
                setError('Ingresá horarios válidos en formato HH:MM')
                return
            }
            const duracion = minutosFin - minutosInicio
            if (duracion <= 0) {
                setError('La hora de fin debe ser posterior a la hora de inicio')
                return
            }
            if (duracion % 60 !== 0) {
                setError('La duración debe ser de horas enteras (1 h, 2 h, 3 h...)')
                return
            }
        } else if (!monto || !Number.isFinite(Number(monto)) || Number(monto) <= 0) {
            setError('Ingresá un monto mayor que cero')
            return
        }

        setGuardando(true)
        setError('')
        try {
            const datos: CreateReservaInput = {
                fechaReserva,
                horaInicio: usaMocks ? horaInicio : '',
                horaFin: usaMocks ? horaFin : '',
                ...(!usaMocks ? { monto: Number(monto) } : {}),
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
                        slotProps={{ htmlInput: { min: fechaMinimaInput() }, inputLabel: { shrink: true } }}
                        value={fechaReserva}
                        onChange={(event) => {
                            setFechaReserva(event.target.value)
                            setCircuitoId('')
                            setKartingId('')
                        }}
                        required
                        fullWidth
                    />
                    {usaMocks && <>
                        <TextField
                            label="Hora de inicio"
                            type="time"
                            slotProps={{ htmlInput: { step: 3600 }, inputLabel: { shrink: true } }}
                            value={horaInicio}
                            onChange={(event) => {
                                setHoraInicio(event.target.value)
                                setCircuitoId('')
                                setKartingId('')
                            }}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Hora de fin"
                            type="time"
                            slotProps={{ htmlInput: { step: 3600 }, inputLabel: { shrink: true } }}
                            value={horaFin}
                            onChange={(event) => {
                                setHoraFin(event.target.value)
                                setCircuitoId('')
                                setKartingId('')
                            }}
                            required
                            fullWidth
                        />
                    </>}
                    {cargandoCatalogos ? (
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
                            <MenuItem value="" disabled>Seleccioná un circuito</MenuItem>
                            {circuitos.map((circuito) => (
                                <MenuItem key={circuito.idCircuitos} value={String(circuito.idCircuitos)}>
                                    Circuito {circuito.idCircuitos} ({circuito.distancia} m)
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                    {!cargandoCatalogos && circuitos.length === 0 && (
                        <Typography color="text.secondary">No hay circuitos disponibles.</Typography>
                    )}
                    {cargandoCatalogos ? (
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
                            <MenuItem value="" disabled>Seleccioná un karting</MenuItem>
                            {kartings.map((karting) => (
                                <MenuItem key={karting.idKartings} value={String(karting.idKartings)}>
                                    {karting.modelo} ({karting.categoria})
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                    {!cargandoCatalogos && kartings.length === 0 && (
                        <Typography color="text.secondary">No hay kartings disponibles.</Typography>
                    )}
                    {!usaMocks && (
                        <TextField
                            label="Monto de la reserva"
                            type="number"
                            value={monto}
                            onChange={(event) => setMonto(event.target.value)}
                            slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
                            helperText="El backend requiere que se indique el monto."
                            required
                            fullWidth
                        />
                    )}
                    {error && <Alert severity="error">{error}</Alert>}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCerrar}>Cancelar</Button>
                <Button
                    variant="contained"
                    onClick={handleGuardar}
                    disabled={guardando || cargandoCatalogos || !fechaReserva || (usaMocks && (!horaInicio || !horaFin)) || (!usaMocks && !monto) || !personaId || !circuitoId || !kartingId}
                >
                    Guardar
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ReservaFormDialog
