import { useEffect, useState } from 'react'
import { Alert, Button, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { createReserva, updateReserva } from '../../services/reservaService'
import { getCircuitos } from '../../services/circuitoService'
import { getKartings } from '../../services/kartingService'
import { getTiposKarting } from '../../services/tipoKartingService'
import { getPersonas } from '../../services/personaService'
import type { Circuito, CreateReservaInput, IReserva, Karting, Persona, TipoKarting } from '../../types'
import { pesos } from '../../utils/formato'
import { fechaTexto, horaTexto } from '../../utils/fechas'

export type ReservaFormProps = {
    reserva?: IReserva | null
    idPersonaActual: number
    nombrePersonaActual: string
    puedeGestionar: boolean
    onGuardado: () => void
    onCancelar?: () => void
}

type Campo = 'fecha' | 'horaInicio' | 'horaFin' | 'circuito' | 'karting'
type ErroresCampo = Partial<Record<Campo, string>>

function minutosDeHora (hora: string) {
    return Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3, 5))
}

// Valida lo que se puede saber sin el backend; cada error va debajo de su campo.
function validar (fechaReserva: string, horaInicio: string, horaFin: string, circuitoId: string, kartingId: string): ErroresCampo {
    const errores: ErroresCampo = {}
    if (!fechaReserva) errores.fecha = 'Elegí una fecha'
    else if (fechaReserva < fechaTexto(new Date())) errores.fecha = 'La fecha de reserva no puede ser anterior a hoy'

    const formato = /^\d{2}:\d{2}$/
    const horaValida = (valor: string) => formato.test(valor) && minutosDeHora(valor) < 24 * 60 && Number(valor.slice(3)) < 60
    if (!horaValida(horaInicio)) errores.horaInicio = 'Ingresá una hora de inicio válida (HH:MM)'
    if (!horaValida(horaFin)) errores.horaFin = 'Ingresá una hora de fin válida (HH:MM)'
    if (!errores.horaInicio && !errores.horaFin) {
        const duracion = minutosDeHora(horaFin) - minutosDeHora(horaInicio)
        if (duracion <= 0) errores.horaFin = 'La hora de fin debe ser posterior a la hora de inicio'
        else if (duracion % 60 !== 0) errores.horaFin = 'La duración debe ser de horas enteras (1 h, 2 h, 3 h...)'
    }

    if (!circuitoId) errores.circuito = 'Elegí un circuito'
    if (!kartingId) errores.karting = 'Elegí un karting'
    return errores
}

function ReservaForm ({ reserva, idPersonaActual, nombrePersonaActual, puedeGestionar, onGuardado, onCancelar }: ReservaFormProps) {
    const editando = Boolean(reserva)
    const [fechaReserva, setFechaReserva] = useState(reserva ? fechaTexto(reserva.fechaReserva) : '')
    const [horaInicio, setHoraInicio] = useState(reserva ? horaTexto(reserva.horaInicio) : '')
    const [horaFin, setHoraFin] = useState(reserva ? horaTexto(reserva.horaFin) : '')
    const [personaId, setPersonaId] = useState(String(reserva?.Personas_idPersona ?? idPersonaActual))
    const [circuitoId, setCircuitoId] = useState(reserva ? String(reserva.Circuitos_idCircuitos) : '')
    const [kartingId, setKartingId] = useState(reserva ? String(reserva.Kartings_idKartings) : '')
    const [personas, setPersonas] = useState<Persona[]>([])
    const [circuitos, setCircuitos] = useState<Circuito[]>([])
    const [kartings, setKartings] = useState<Karting[]>([])
    const [tiposKarting, setTiposKarting] = useState<TipoKarting[]>([])
    const [cargandoCatalogos, setCargandoCatalogos] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [errores, setErrores] = useState<ErroresCampo>({})
    const [error, setError] = useState('')

    useEffect(() => {
        let cancelado = false
        Promise.all([
            getCircuitos(),
            getKartings(),
            puedeGestionar ? getPersonas() : Promise.resolve([]),
            getTiposKarting(),
        ])
            .then(([datosCircuitos, datosKartings, datosPersonas, datosTipos]) => {
                if (cancelado) return
                setCircuitos(datosCircuitos)
                setKartings(datosKartings.filter((karting) => (
                    karting.estado.toLowerCase() === 'disponible'
                    || karting.idKartings === reserva?.Kartings_idKartings
                )))
                setPersonas(datosPersonas)
                setTiposKarting(datosTipos)
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
    }, [puedeGestionar, reserva])

    async function handleGuardar () {
        const nuevosErrores = validar(fechaReserva, horaInicio, horaFin, circuitoId, kartingId)
        setErrores(nuevosErrores)
        setError('')
        if (Object.keys(nuevosErrores).length > 0 || !personaId) return

        setGuardando(true)
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

    const kartingElegido = kartings.find((karting) => String(karting.idKartings) === kartingId)
    const precioHora = tiposKarting.find((tipo) => tipo.idTiposKarting === kartingElegido?.TiposKarting_idTiposKarting)?.precioHora
    const horas = horaInicio && horaFin ? (minutosDeHora(horaFin) - minutosDeHora(horaInicio)) / 60 : 0
    const montoEstimado = precioHora && horas > 0 && Number.isInteger(horas) ? precioHora * horas : null

    return (
        <Stack spacing={2}>
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
                slotProps={{ htmlInput: { min: fechaTexto(new Date()) }, inputLabel: { shrink: true } }}
                value={fechaReserva}
                onChange={(event) => setFechaReserva(event.target.value)}
                error={Boolean(errores.fecha)}
                helperText={errores.fecha}
                required
                fullWidth
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                    label="Hora de inicio"
                    type="time"
                    slotProps={{ htmlInput: { step: 3600 }, inputLabel: { shrink: true } }}
                    value={horaInicio}
                    onChange={(event) => setHoraInicio(event.target.value)}
                    error={Boolean(errores.horaInicio)}
                    helperText={errores.horaInicio}
                    required
                    fullWidth
                />
                <TextField
                    label="Hora de fin"
                    type="time"
                    slotProps={{ htmlInput: { step: 3600 }, inputLabel: { shrink: true } }}
                    value={horaFin}
                    onChange={(event) => setHoraFin(event.target.value)}
                    error={Boolean(errores.horaFin)}
                    helperText={errores.horaFin}
                    required
                    fullWidth
                />
            </Stack>
            {cargandoCatalogos ? (
                <Typography color="text.secondary">Cargando circuitos y kartings...</Typography>
            ) : (
                <>
                    <TextField
                        select
                        label="Circuito"
                        value={circuitoId}
                        onChange={(event) => setCircuitoId(event.target.value)}
                        error={Boolean(errores.circuito)}
                        helperText={errores.circuito ?? (circuitos.length === 0 ? 'No hay circuitos disponibles' : undefined)}
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
                    <TextField
                        select
                        label="Karting"
                        value={kartingId}
                        onChange={(event) => setKartingId(event.target.value)}
                        error={Boolean(errores.karting)}
                        helperText={errores.karting ?? (kartings.length === 0 ? 'No hay kartings disponibles' : undefined)}
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
                </>
            )}
            {error && <Alert severity="error">{error}</Alert>}
            <div className="form-pie">
                <span className="small">
                    Monto: <strong className="mono">{montoEstimado !== null ? pesos(montoEstimado) : '-'}</strong>
                </span>
                <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                    {onCancelar && <Button onClick={onCancelar}>Cancelar</Button>}
                    <Button variant="contained" onClick={handleGuardar} disabled={guardando || cargandoCatalogos}>
                        {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Confirmar reserva'}
                    </Button>
                </Stack>
            </div>
        </Stack>
    )
}

export default ReservaForm
