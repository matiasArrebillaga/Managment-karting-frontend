import { useEffect, useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material'
import { createCarrera, updateCarrera } from '../../services/carreraService'
import { getCircuitos } from '../../services/circuitoService'
import { getTorneos } from '../../services/torneoService'
import type { Circuito, CreateCarrera, ICarrera, ITorneos } from '../../types'

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
    const [circuitos, setCircuitos] = useState<Circuito[]>([])
    const [torneos, setTorneos] = useState<ITorneos[]>([])
    const [guardando, setGuardando] = useState(false)

    const editando = Boolean(carrera)

    useEffect(() => {
        if (abierto) {
            Promise.all([getCircuitos(), getTorneos()]).then(([datosCircuitos, datosTorneos]) => {
                setCircuitos(datosCircuitos)
                setTorneos(datosTorneos)
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
        } else {
            setFechaCarrera('')
            setHoraInicio('')
            setHoraFin('')
            setTorneoId('')
            setCircuitoId('')
        }
    }, [carrera, abierto])

    async function handleGuardar () {
        setGuardando(true)
        try {
            const datos: CreateCarrera = {
                fechaCarrera: new Date(`${fechaCarrera}T00:00:00`),
                horaInicio: new Date(`${fechaCarrera}T${horaInicio}:00`),
                horaFin: new Date(`${fechaCarrera}T${horaFin}:00`),
                Torneos_idTorneos: Number(torneoId),
                Circuitos_idCircuitos: Number(circuitoId),
            }
            if (editando && carrera) {
                await updateCarrera(carrera.idCarreras, datos)
            } else {
                await createCarrera(datos)
            }
            onGuardado()
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
                        fullWidth
                    />
                    <TextField
                        label="Hora de inicio"
                        type="time"
                        value={horaInicio}
                        onChange={(event) => setHoraInicio(event.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        fullWidth
                    />
                    <TextField
                        label="Hora de fin"
                        type="time"
                        value={horaFin}
                        onChange={(event) => setHoraFin(event.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        fullWidth
                    />
                    <TextField
                        select
                        label="Torneo"
                        value={torneoId}
                        onChange={(event) => setTorneoId(event.target.value)}
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
                        label="Circuito"
                        value={circuitoId}
                        onChange={(event) => setCircuitoId(event.target.value)}
                        fullWidth
                    >
                        {circuitos.map((circuito) => (
                            <MenuItem key={circuito.idCircuitos} value={String(circuito.idCircuitos)}>
                                Circuito {circuito.idCircuitos} ({circuito.distancia} m)
                            </MenuItem>
                        ))}
                    </TextField>
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