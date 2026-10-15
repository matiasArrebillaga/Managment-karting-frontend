import { useEffect, useState } from 'react'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material'
import { createTorneo, updateTorneo } from '../../services/torneoService'
import { getTiposLicencia } from '../../services/tipoLicenciaService'
import type { CreateTorneos, ITorneos, TipoLicencia } from '../../types'
import { fechaLocal, fechaTexto } from '../../utils/fechas'

type Props = {
    abierto: boolean
    torneo?: ITorneos | null
    onCerrar: () => void
    onGuardado: () => void
}

function TorneoFormDialog ({ abierto, torneo, onCerrar, onGuardado }: Props) {
    const [nombre, setNombre] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [cupoMaximo, setCupoMaximo] = useState('')
    const [fechaInicio, setFechaInicio] = useState('')
    const [fechaFin, setFechaFin] = useState('')
    const [licenciaId, setLicenciaId] = useState('')
    const [tiposLicencia, setTiposLicencia] = useState<TipoLicencia[]>([])
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState('')

    const editando = Boolean(torneo)
    const fechasValidas = fechaInicio !== '' && fechaFin !== '' && fechaInicio <= fechaFin
    const puedeGuardar = nombre.trim() !== '' && cupoMaximo !== '' && Number(cupoMaximo) > 0 && fechasValidas && licenciaId !== ''

    useEffect(() => {
        if (!abierto) return
        getTiposLicencia()
            .then(setTiposLicencia)
            .catch((motivo: unknown) => {
                setError(motivo instanceof Error ? motivo.message : 'No se pudieron cargar los tipos de licencia')
            })
    }, [abierto])

    useEffect(() => {
        if (torneo) {
            setNombre(torneo.nombre)
            setDescripcion(torneo.descripcion)
            setCupoMaximo(String(torneo.cupoMaximo))
            setFechaInicio(fechaTexto(torneo.fechaInicio))
            setFechaFin(fechaTexto(torneo.fechaFin))
            setLicenciaId(String(torneo.TiposLicencias_idTipoLicencia))
        } else {
            setNombre('')
            setDescripcion('')
            setCupoMaximo('')
            setFechaInicio('')
            setFechaFin('')
            setLicenciaId('')
        }
    }, [torneo, abierto])

    async function handleGuardar () {
        if (!puedeGuardar) {
            setError(fechaFin !== '' && fechaInicio !== '' && fechaFin < fechaInicio
                ? 'La fecha de fin debe ser posterior al inicio'
                : 'Completá nombre, cupo (mayor a 0), tipo de licencia y las dos fechas')
            return
        }

        setGuardando(true)
        setError('')
        try {
            const datos: CreateTorneos = {
                nombre: nombre.trim(),
                descripcion: descripcion.trim(),
                cupoMaximo: Number(cupoMaximo),
                fechaInicio: fechaLocal(fechaInicio),
                fechaFin: fechaLocal(fechaFin),
                TiposLicencias_idTipoLicencia: Number(licenciaId),
            }
            if (editando && torneo?.idTorneos !== undefined) {
                await updateTorneo(torneo.idTorneos, datos)
            } else {
                await createTorneo(datos)
            }
            onGuardado()
        } catch (motivo) {
            setError(motivo instanceof Error ? motivo.message : 'No se pudo guardar el torneo')
        } finally {
            setGuardando(false)
        }
    }

    return (
        <Dialog open={abierto} onClose={onCerrar}>
            <DialogTitle>{editando ? 'Editar Torneo' : 'Nuevo Torneo'}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
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
                        select
                        label="Tipo de licencia"
                        value={licenciaId}
                        onChange={(event) => setLicenciaId(event.target.value)}
                        helperText="Los kartings de sus carreras tienen que ser de esta licencia"
                        required
                        fullWidth
                    >
                        {tiposLicencia.map((tipo) => (
                            <MenuItem key={tipo.idTipoLicencia} value={String(tipo.idTipoLicencia)}>
                                {tipo.nombre} (nivel {tipo.nivel})
                            </MenuItem>
                        ))}
                    </TextField>
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
                    {error && <Alert severity="error">{error}</Alert>}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCerrar}>Cancelar</Button>
                <Button variant="contained" onClick={handleGuardar} disabled={guardando}>
                    {guardando ? 'Guardando...' : 'Guardar'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default TorneoFormDialog
