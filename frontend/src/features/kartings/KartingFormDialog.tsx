import { useEffect, useState } from "react"
import { createKarting, updateKarting } from "../../services/kartingService"
import { getTiposKarting } from "../../services/tipoKartingService"
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material"
import type { Karting, TipoKarting } from "../../types"

const ESTADOS = ['Disponible', 'Mantenimiento']

type Props = {
    abierto: boolean
    karting?: Karting | null
    onCerrar: () => void
    onGuardado: () => void
}

function KartingFormDialog({ abierto, karting, onCerrar, onGuardado }: Props) {
    const [categoria, setCategoria] = useState('')
    const [modelo, setModelo] = useState('')
    const [estado, setEstado] = useState('')
    const [fechaAdquisicion, setFechaAdquisicion] = useState('')
    const [tipoKartingId, setTipoKartingId] = useState('')
    const [tiposKarting, setTiposKarting] = useState<TipoKarting[]>([])
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState('')

    const editando = Boolean(karting)
    const puedeGuardar = categoria.trim() !== ''
        && modelo.trim() !== ''
        && estado !== ''
        && /^\d{4}-\d{2}-\d{2}$/.test(fechaAdquisicion)
        && Number(tipoKartingId) > 0

    useEffect(() => {
        if (abierto) {
            getTiposKarting()
                .then(setTiposKarting)
                .catch((motivo: unknown) => {
                    setError(motivo instanceof Error ? motivo.message : 'No se pudieron cargar los tipos de karting')
                })
        }
    }, [abierto])

    useEffect(() => {
        if (karting) {
            setCategoria(karting.categoria)
            setModelo(karting.modelo)
            setEstado(karting.estado)
            setFechaAdquisicion(karting.fechaAdquisicion)
            setTipoKartingId(String(karting.TiposKarting_idTiposKarting))
        } else {
            setCategoria('')
            setModelo('')
            setEstado('')
            setFechaAdquisicion('')
            setTipoKartingId('')
        }
    }, [karting, abierto])

    async function handleGuardar() {
        if (!puedeGuardar) {
            setError('Completá todos los datos del karting')
            return
        }
        setGuardando(true)
        setError('')
        try {
            const datos = {
                categoria,
                modelo,
                estado,
                fechaAdquisicion,
                TiposKarting_idTiposKarting: Number(tipoKartingId),
            }
            if (editando && karting) {
                await updateKarting(karting.idKartings, datos)
            } else {
                await createKarting(datos)
            }
            onGuardado()
        } catch (motivo) {
            setError(motivo instanceof Error ? motivo.message : 'No se pudo guardar el karting')
        } finally {
            setGuardando(false)
        }
    }

    return (
        <Dialog open={abierto} onClose={onCerrar}>
            <DialogTitle>{editando ? 'Editar Karting' : 'Nuevo Karting'}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        label="Categoria"
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                        required
                        fullWidth
                    />
                    <TextField
                        label="Modelo"
                        value={modelo}
                        onChange={(e) => setModelo(e.target.value)}
                        required
                        fullWidth
                    />
                    <TextField
                        select
                        label="Tipo de Karting"
                        value={tipoKartingId}
                        onChange={(e) => setTipoKartingId(e.target.value)}
                        required
                        fullWidth
                    >
                        {tiposKarting.map((t) => (
                            <MenuItem key={t.idTiposKarting} value={String(t.idTiposKarting)}>{t.nombre}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label="Estado"
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                        required
                        fullWidth
                    >
                        {ESTADOS.map((s) => (
                            <MenuItem key={s} value={s}>{s}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Fecha de adquisicion"
                        type="date"
                        value={fechaAdquisicion}
                        onChange={(e) => setFechaAdquisicion(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        required
                        fullWidth
                    />
                    {error && <Alert severity="error">{error}</Alert>}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCerrar}>Cancelar</Button>
                <Button variant="contained" onClick={handleGuardar} disabled={guardando || !puedeGuardar}>Guardar</Button>
            </DialogActions>
        </Dialog>
    )
}

export default KartingFormDialog
