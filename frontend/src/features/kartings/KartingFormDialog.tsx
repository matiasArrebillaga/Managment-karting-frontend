import { useEffect, useState } from "react"
import { createKarting, updateKarting } from "../../services/kartingService"
import { getTiposKarting } from "../../services/tipoKartingService"
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material"
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

    const editando = Boolean(karting)

    useEffect(() => {
        if (abierto) {
            getTiposKarting().then((datos) => setTiposKarting(datos))
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
        setGuardando(true)
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
                        fullWidth
                    />
                    <TextField
                        label="Modelo"
                        value={modelo}
                        onChange={(e) => setModelo(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        select
                        label="Tipo de Karting"
                        value={tipoKartingId}
                        onChange={(e) => setTipoKartingId(e.target.value)}
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
                        fullWidth
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCerrar}>Cancelar</Button>
                <Button variant="contained" onClick={handleGuardar} disabled={guardando}>Guardar</Button>
            </DialogActions>
        </Dialog>
    )
}

export default KartingFormDialog
