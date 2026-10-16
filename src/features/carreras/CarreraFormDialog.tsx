import { useEffect, useState } from 'react'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material'
import { createCarrera, updateCarrera } from '../../services/carreraService'
import { getCircuitos } from '../../services/circuitoService'
import { getTorneos } from '../../services/torneoService'
import { getKartings } from '../../services/kartingService'
import { getTiposKarting } from '../../services/tipoKartingService'
import { usaMocks } from '../../services/httpClient'
import { fechaLocal, fechaTexto, horaTexto } from '../../utils/fechas'
import { nombreCircuito } from '../../utils/formato'
import type { Circuito, CreateCarrera, ICarrera, ITorneos, Karting, TipoKarting } from '../../types'

type Props = {
    carrera?: ICarrera | null
    onCerrar: () => void
    onGuardado: () => void
}

function CarreraFormDialog ({ carrera, onCerrar, onGuardado }: Props) {
    const [fechaCarrera, setFechaCarrera] = useState(carrera ? fechaTexto(carrera.fechaCarrera) : '')
    const [horaInicio, setHoraInicio] = useState(carrera ? horaTexto(carrera.horaInicio) : '')
    const [horaFin, setHoraFin] = useState(carrera ? horaTexto(carrera.horaFin) : '')
    const [torneoId, setTorneoId] = useState(carrera ? String(carrera.Torneos_idTorneos) : '')
    const [circuitoId, setCircuitoId] = useState(carrera ? String(carrera.Circuitos_idCircuitos) : '')
    const [kartingIds, setKartingIds] = useState<string[]>(
        (carrera?.kartings ?? (carrera?.Kartings_idKartings === undefined ? [] : [carrera.Kartings_idKartings])).map(String),
    )
    const [circuitos, setCircuitos] = useState<Circuito[]>([])
    const [torneos, setTorneos] = useState<ITorneos[]>([])
    const [kartings, setKartings] = useState<Karting[]>([])
    const [tiposKarting, setTiposKarting] = useState<TipoKarting[]>([])
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState('')

    const editando = Boolean(carrera)
    const torneoElegido = torneos.find((torneo) => String(torneo.idTorneos) === torneoId)
    // Solo se ofrecen los karts de la licencia del torneo y disponibles; el backend lo vuelve a validar.
    // Al editar se mantienen los ya asignados aunque esten en mantenimiento (el backend solo exige estado a los nuevos)
    const kartingsDelTorneo = torneoElegido
        ? kartings.filter((karting) => tiposKarting.find((tipo) => tipo.idTiposKarting === karting.TiposKarting_idTiposKarting)
            ?.TiposLicencias_idTipoLicenciaMinima === torneoElegido.TiposLicencias_idTipoLicencia
            && (karting.estado.toLowerCase() === 'disponible' || kartingIds.includes(String(karting.idKartings))))
        : []

    useEffect(() => {
        Promise.all([getCircuitos(), getTorneos(), getKartings(), getTiposKarting()])
            .then(([datosCircuitos, datosTorneos, datosKartings, datosTiposKarting]) => {
                setCircuitos(datosCircuitos)
                setTorneos(datosTorneos)
                setKartings(datosKartings)
                setTiposKarting(datosTiposKarting)
            })
            .catch((motivo: unknown) => {
                setError(motivo instanceof Error ? motivo.message : 'No se pudieron cargar los datos de la carrera')
            })
    }, [])

    async function handleGuardar () {
        if (!fechaCarrera || !horaInicio || !horaFin || !torneoId || !circuitoId || kartingIds.length === 0) {
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
                fechaCarrera: fechaLocal(fechaCarrera),
                horaInicio,
                horaFin,
                kartings: kartingIds.map(Number),
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
        <Dialog open onClose={onCerrar}>
            <DialogTitle>{editando ? 'Editar Carrera' : 'Nueva Carrera'}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
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
                        onChange={(event) => {
                            // los karts elegidos podrian no ser de la licencia del nuevo torneo
                            setTorneoId(event.target.value)
                            setKartingIds([])
                        }}
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
                        label="Kartings"
                        value={kartingIds}
                        slotProps={{ select: { multiple: true } }}
                        onChange={(event) => {
                            const seleccion = event.target.value
                            setKartingIds(typeof seleccion === 'string' ? seleccion.split(',') : seleccion)
                        }}
                        disabled={!torneoElegido}
                        helperText={torneoElegido
                            ? `Elegí al menos ${torneoElegido.cupoMaximo} (cupo del torneo). Seleccionados: ${kartingIds.length}`
                            : 'Elegí primero el torneo'}
                        required
                        fullWidth
                    >
                        {kartingsDelTorneo.map((karting) => (
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
                                {nombreCircuito(circuitos, circuito.idCircuitos)}
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