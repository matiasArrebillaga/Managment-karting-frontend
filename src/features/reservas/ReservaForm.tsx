import { useEffect, useState } from 'react'
import { Alert, Button, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { createReserva, updateReserva } from '../../services/reservaService'
import { getCircuitos } from '../../services/circuitoService'
import { getKartingsDisponibles } from '../../services/kartingService'
import { getTiposKarting } from '../../services/tipoKartingService'
import { getPersonas } from '../../services/personaService'
import type { Circuito, CreateReservaInput, IReserva, Karting, Persona, TipoKarting } from '../../types'
import { nombreCircuito, pesos } from '../../utils/formato'
import { fechaTexto, horaTexto } from '../../utils/fechas'
import SelectorKartings from '../../components/SelectorKartings'

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

// las reservas son de hora en hora: los selects solo ofrecen 00:00, 01:00 ... 23:00
const HORAS = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}:00`)

function minutosDeHora (hora: string) {
    return Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3, 5))
}

// Valida lo que se puede saber sin el backend; cada error va debajo de su campo.
function validar (fechaReserva: string, horaInicio: string, horaFin: string, circuitoId: string, kartingId: string): ErroresCampo {
    const errores: ErroresCampo = {}
    if (!fechaReserva) errores.fecha = 'Elegí una fecha'
    else if (fechaReserva < fechaTexto(new Date())) errores.fecha = 'La fecha de reserva no puede ser anterior a hoy'

    if (!HORAS.includes(horaInicio)) errores.horaInicio = 'Elegí una hora de inicio'
    if (!HORAS.includes(horaFin)) errores.horaFin = 'Elegí una hora de fin'
    if (!errores.horaInicio && !errores.horaFin && minutosDeHora(horaFin) <= minutosDeHora(horaInicio)) {
        errores.horaFin = 'La hora de fin debe ser posterior a la hora de inicio'
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
            puedeGestionar ? getPersonas() : Promise.resolve([]),
            getTiposKarting(),
        ])
            .then(([datosCircuitos, datosPersonas, datosTipos]) => {
                if (cancelado) return
                setCircuitos(datosCircuitos)
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

    // con dia y horario elegidos se piden los karts libres en esa franja; al editar, la propia reserva no cuenta
    const franjaCompleta = Boolean(fechaReserva) && HORAS.includes(horaInicio) && horaFin > horaInicio
    const idReservaEditada = reserva?.idReservas
    useEffect(() => {
        if (!franjaCompleta) return
        let cancelado = false
        getKartingsDisponibles(fechaReserva, horaInicio, horaFin, idReservaEditada === undefined ? {} : { idReserva: idReservaEditada })
            .then((libres) => {
                if (cancelado) return
                setKartings(libres)
                // si el kart elegido quedó ocupado en la nueva franja, se deselecciona
                setKartingId((actual) => (libres.some((karting) => String(karting.idKartings) === actual) ? actual : ''))
            })
            .catch((motivo: unknown) => {
                if (!cancelado) setError(motivo instanceof Error ? motivo.message : 'No se pudieron cargar los kartings libres')
            })
        return () => {
            cancelado = true
        }
    }, [franjaCompleta, fechaReserva, horaInicio, horaFin, idReservaEditada])

    // al corregir un campo se borra su error; cambiar el inicio también borra el de fin (ahí va el de duración)
    function limpiarError (...campos: Campo[]) {
        setErrores((actuales) => {
            const siguientes = { ...actuales }
            campos.forEach((campo) => delete siguientes[campo])
            return siguientes
        })
    }

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
                onChange={(event) => { setFechaReserva(event.target.value); limpiarError('fecha') }}
                error={Boolean(errores.fecha)}
                helperText={errores.fecha}
                required
                fullWidth
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                    select
                    label="Hora de inicio"
                    value={horaInicio}
                    onChange={(event) => {
                        const inicio = event.target.value
                        setHoraInicio(inicio)
                        // si la hora de fin quedó antes del nuevo inicio, se vacía (ya no está entre las opciones)
                        setHoraFin((fin) => (fin > inicio ? fin : ''))
                        limpiarError('horaInicio', 'horaFin')
                    }}
                    error={Boolean(errores.horaInicio)}
                    helperText={errores.horaInicio}
                    required
                    fullWidth
                >
                    {HORAS.slice(0, -1).map((hora) => <MenuItem key={hora} value={hora}>{hora}</MenuItem>)}
                </TextField>
                <TextField
                    select
                    label="Hora de fin"
                    value={horaFin}
                    onChange={(event) => { setHoraFin(event.target.value); limpiarError('horaFin') }}
                    error={Boolean(errores.horaFin)}
                    helperText={errores.horaFin}
                    required
                    fullWidth
                >
                    {HORAS.filter((hora) => !horaInicio || hora > horaInicio).map((hora) => <MenuItem key={hora} value={hora}>{hora}</MenuItem>)}
                </TextField>
            </Stack>
            {cargandoCatalogos ? (
                <Typography color="text.secondary">Cargando circuitos y kartings...</Typography>
            ) : (
                <>
                    <TextField
                        select
                        label="Circuito"
                        value={circuitoId}
                        onChange={(event) => { setCircuitoId(event.target.value); limpiarError('circuito') }}
                        error={Boolean(errores.circuito)}
                        helperText={errores.circuito ?? (circuitos.length === 0 ? 'No hay circuitos disponibles' : undefined)}
                        required
                        fullWidth
                    >
                        <MenuItem value="" disabled>Seleccioná un circuito</MenuItem>
                        {circuitos.map((circuito) => (
                            <MenuItem key={circuito.idCircuitos} value={String(circuito.idCircuitos)}>
                                {nombreCircuito(circuitos, circuito.idCircuitos)}
                            </MenuItem>
                        ))}
                    </TextField>
                    <SelectorKartings
                        kartings={franjaCompleta ? kartings : []}
                        tiposKarting={tiposKarting}
                        seleccionados={kartingId ? [kartingId] : []}
                        onCambiar={([id]) => { setKartingId(id ?? ''); limpiarError('karting') }}
                        deshabilitado={!franjaCompleta}
                        ayuda={!franjaCompleta
                            ? 'Elegí la fecha y el horario para ver los kartings libres'
                            : kartings.length === 0 ? 'No hay kartings libres en ese horario' : undefined}
                        error={errores.karting}
                    />
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
