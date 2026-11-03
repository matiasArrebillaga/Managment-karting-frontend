import { useEffect, useState } from 'react'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material'
import { createCarrera, updateCarrera } from '../../services/carreraService'
import { getCircuitos } from '../../services/circuitoService'
import { getTorneos } from '../../services/torneoService'
import { getKartingsDisponibles } from '../../services/kartingService'
import { getTiposKarting } from '../../services/tipoKartingService'
import { fechaLocal, fechaTexto, horaTexto } from '../../utils/fechas'
import { nombreCircuito } from '../../utils/formato'
import SelectorKartings from '../../components/SelectorKartings'
import type { Circuito, CreateCarrera, ICarrera, ITorneos, Karting, TipoKarting } from '../../types'
import CampoFecha from '../../components/CampoFecha'

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
    const [kartingIds, setKartingIds] = useState<string[]>(carrera ? carrera.kartings.map(String) : [])
    const [circuitos, setCircuitos] = useState<Circuito[]>([])
    const [torneos, setTorneos] = useState<ITorneos[]>([])
    const [kartings, setKartings] = useState<Karting[]>([])
    const [tiposKarting, setTiposKarting] = useState<TipoKarting[]>([])
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState('')

    const editando = Boolean(carrera)
    const torneoElegido = torneos.find((torneo) => String(torneo.idTorneos) === torneoId)
    const franjaCompleta = Boolean(fechaCarrera) && Boolean(horaInicio) && horaFin > horaInicio
    // Solo se ofrecen los karts libres en la franja y de la licencia del torneo; el backend lo vuelve a validar.
    const kartingsDelTorneo = torneoElegido && franjaCompleta
        ? kartings.filter((karting) => tiposKarting.find((tipo) => tipo.idTiposKarting === karting.TiposKarting_idTiposKarting)
            ?.TiposLicencias_idTipoLicenciaMinima === torneoElegido.TiposLicencias_idTipoLicencia)
        : []

    useEffect(() => {
        Promise.all([getCircuitos(), getTorneos(), getTiposKarting()])
            .then(([datosCircuitos, datosTorneos, datosTiposKarting]) => {
                setCircuitos(datosCircuitos)
                setTorneos(datosTorneos)
                setTiposKarting(datosTiposKarting)
            })
            .catch((motivo: unknown) => {
                setError(motivo instanceof Error ? motivo.message : 'No se pudieron cargar los datos de la carrera')
            })
    }, [])

    // karts libres en la franja; al editar, la propia carrera no cuenta como ocupación
    const excluirTorneo = carrera?.Torneos_idTorneos
    const excluirCircuito = carrera?.Circuitos_idCircuitos
    useEffect(() => {
        if (!franjaCompleta) return
        let cancelado = false
        const excluir: Record<string, number> = excluirTorneo === undefined || excluirCircuito === undefined
            ? {}
            : { idTorneo: excluirTorneo, idCircuito: excluirCircuito }
        getKartingsDisponibles(fechaCarrera, horaInicio, horaFin, excluir)
            .then((libres) => {
                if (cancelado) return
                setKartings(libres)
                // se sacan de la selección los karts que quedaron ocupados en la nueva franja
                setKartingIds((actuales) => actuales.filter((id) => libres.some((karting) => String(karting.idKartings) === id)))
            })
            .catch((motivo: unknown) => {
                if (!cancelado) setError(motivo instanceof Error ? motivo.message : 'No se pudieron cargar los kartings libres')
            })
        return () => {
            cancelado = true
        }
    }, [franjaCompleta, fechaCarrera, horaInicio, horaFin, excluirTorneo, excluirCircuito])

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
                    <CampoFecha
                        label="Fecha de la carrera"
                        value={fechaCarrera}
                        onChange={setFechaCarrera}
                        disabled={editando}
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
                        disabled={editando}
                        required
                        fullWidth
                    >
                        {torneos.map((torneo) => (
                            <MenuItem key={torneo.idTorneos} value={String(torneo.idTorneos)}>
                                {torneo.nombre}
                            </MenuItem>
                        ))}
                    </TextField>
                    <SelectorKartings
                        multiple
                        kartings={kartingsDelTorneo}
                        tiposKarting={tiposKarting}
                        seleccionados={kartingIds}
                        onCambiar={setKartingIds}
                        deshabilitado={!torneoElegido || !franjaCompleta}
                        ayuda={!franjaCompleta
                            ? 'Elegí la fecha y el horario para ver los kartings libres'
                            : torneoElegido
                                ? `Elegí al menos ${torneoElegido.cupoMaximo} (cupo del torneo). Seleccionados: ${kartingIds.length} / ${torneoElegido.cupoMaximo} · Libres: ${kartingsDelTorneo.length}`
                                : 'Elegí primero el torneo'}
                    />
                    <TextField
                        select
                        label="Circuito"
                        value={circuitoId}
                        onChange={(event) => setCircuitoId(event.target.value)}
                        disabled={editando}
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