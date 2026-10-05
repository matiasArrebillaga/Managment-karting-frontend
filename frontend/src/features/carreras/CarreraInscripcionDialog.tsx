import { useEffect, useState } from 'react'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { getKartingsDisponiblesCarrera, inscribirseEnCarrera } from '../../services/carreraService'
import type { ICarrera, Karting } from '../../types'

type Props = {
    abierto: boolean
    carrera: ICarrera | null
    idPersona: number
    onCerrar: () => void
    onInscripto: () => void
}

function CarreraInscripcionDialog ({ abierto, carrera, idPersona, onCerrar, onInscripto }: Props) {
    const [kartings, setKartings] = useState<Karting[]>([])
    const [kartingId, setKartingId] = useState('')
    const [cargando, setCargando] = useState(false)
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!abierto || !carrera) return

        setCargando(true)
        setError('')
        setKartingId('')
        getKartingsDisponiblesCarrera(carrera.idCarreras)
            .then(setKartings)
            .catch((motivo: unknown) => {
                setError(motivo instanceof Error ? motivo.message : 'No se pudieron cargar los kartings disponibles')
            })
            .finally(() => setCargando(false))
    }, [abierto, carrera])

    async function handleConfirmar () {
        if (!carrera || !kartingId) return

        setGuardando(true)
        setError('')
        try {
            await inscribirseEnCarrera(carrera.idCarreras, idPersona, Number(kartingId))
            onInscripto()
        } catch (motivo) {
            setError(motivo instanceof Error ? motivo.message : 'No se pudo completar la inscripción')
        } finally {
            setGuardando(false)
        }
    }

    return (
        <Dialog open={abierto} onClose={onCerrar}>
            <DialogTitle>Anotarme a la carrera</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1, minWidth: 320 }}>
                    {cargando ? (
                        <Typography>Cargando kartings disponibles...</Typography>
                    ) : kartings.length > 0 ? (
                        <TextField
                            select
                            label="Karting disponible"
                            value={kartingId}
                            onChange={(event) => setKartingId(event.target.value)}
                            fullWidth
                        >
                            {kartings.map((karting) => (
                                <MenuItem key={karting.idKartings} value={String(karting.idKartings)}>
                                    {karting.modelo} ({karting.categoria})
                                </MenuItem>
                            ))}
                        </TextField>
                    ) : (
                        <Typography>No hay kartings disponibles para este horario.</Typography>
                    )}
                    {error && <Alert severity="error">{error}</Alert>}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCerrar}>Cancelar</Button>
                <Button
                    variant="contained"
                    onClick={handleConfirmar}
                    disabled={cargando || guardando || !kartingId}
                >
                    {guardando ? 'Anotando...' : 'Confirmar inscripción'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default CarreraInscripcionDialog
