import { useEffect, useState } from "react"
import { createKarting, updateKarting } from "../../services/kartingService"
import { getTiposKarting } from "../../services/tipoKartingService"
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material"
import type { Karting, TipoKarting } from "../../types"
import { fechaTexto } from "../../utils/fechas"
import CampoFecha from '../../components/CampoFecha'

const ESTADOS = ['Disponible', 'Mantenimiento']

type Props = {
    karting?: Karting | null
    onCerrar: () => void
    onGuardado: () => void
}

function KartingFormDialog({ karting, onCerrar, onGuardado }: Props) {
    const [categoria, setCategoria] = useState(karting?.categoria ?? '')
    const [modelo, setModelo] = useState(karting?.modelo ?? '')
    const [estado, setEstado] = useState(karting?.estado ?? '')
    const [fechaAdquisicion, setFechaAdquisicion] = useState(karting?.fechaAdquisicion ?? '')
    const [tipoKartingId, setTipoKartingId] = useState(karting ? String(karting.TiposKarting_idTiposKarting) : '')
    const [tiposKarting, setTiposKarting] = useState<TipoKarting[]>([])
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState('')

    const editando = Boolean(karting)
    // si la base tiene un estado que no está en la lista, se agrega como opción para que el select no quede vacío
    const estados = estado && !ESTADOS.includes(estado) ? [...ESTADOS, estado] : ESTADOS
    const puedeGuardar = categoria.trim() !== ''
        && modelo.trim() !== ''
        && estado !== ''
        && /^\d{4}-\d{2}-\d{2}$/.test(fechaAdquisicion)
        && Number(tipoKartingId) > 0

    useEffect(() => {
        getTiposKarting()
            .then(setTiposKarting)
            .catch((motivo: unknown) => {
                setError(motivo instanceof Error ? motivo.message : 'No se pudieron cargar los tipos de karting')
            })
    }, [])

    async function handleGuardar() {
        if (!puedeGuardar) {
            setError('Completá todos los datos del karting')
            return
        }
        setGuardando(true)
        setError('')
        try {
            const datos = {
                categoria: categoria.trim(),
                modelo: modelo.trim(),
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
        <Dialog open onClose={onCerrar}>
            <DialogTitle>{editando ? 'Editar Karting' : 'Nuevo Karting'}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        label="Categoria"
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                        slotProps={{ htmlInput: { maxLength: 45 } }}
                        required
                        fullWidth
                    />
                    <TextField
                        label="Modelo"
                        value={modelo}
                        onChange={(e) => setModelo(e.target.value)}
                        slotProps={{ htmlInput: { maxLength: 45 } }}
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
                        {estados.map((s) => (
                            <MenuItem key={s} value={s}>{s}</MenuItem>
                        ))}
                    </TextField>
                    <CampoFecha
                        label="Fecha de adquisicion"
                        value={fechaAdquisicion}
                        onChange={setFechaAdquisicion}
                        max={fechaTexto(new Date())}
                        required
                        fullWidth
                    />
                    {error && <Alert severity="error">{error}</Alert>}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCerrar}>Cancelar</Button>
                <Button variant="contained" onClick={handleGuardar} disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar'}</Button>
            </DialogActions>
        </Dialog>
    )
}

export default KartingFormDialog
