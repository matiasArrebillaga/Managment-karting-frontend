import { useEffect, useState } from "react"
import { createKarting, updateKarting } from "../../services/kartingService"
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material"
import type { Karting } from "../../types"

const CATEGORIAS = ['Junior', 'Senior']
const ESTADOS = ['Disponible', 'Mantenimiento']

type Props = {
    abierto: boolean
    karting?: Karting | null
    onCerrar: () => void
    onGuardado: () => void
}

function KartingFormDialog({ abierto, karting, onCerrar, onGuardado }: Props) {
    const [numero, setNumero] = useState('')
    const [modelo, setModelo] = useState('')
    const [categoria, setCategoria] = useState('')
    const [estado, setEstado] = useState('')
    const [fechaAdquisicion, setFechaAdquisicion] = useState('')
    const [fechaUltimoMantenimiento, setFechaUltimoMantenimiento] = useState('')
    const [guardando, setGuardando] = useState(false)

    const editando = Boolean(karting)

    useEffect(() => {
        if (karting) {
            setNumero(String(karting.numero))
            setModelo(karting.modelo)
            setCategoria(karting.categoria)
            setEstado(karting.estado)
            setFechaAdquisicion(karting.fechaAdquisicion)
            setFechaUltimoMantenimiento(karting.fechaUltimoMantenimiento ?? '')
        } else {
            setNumero('')
            setModelo('')
            setCategoria('')
            setEstado('')
            setFechaAdquisicion('')
            setFechaUltimoMantenimiento('')
        }
    }, [karting, abierto])

    async function handleGuardar() {
        setGuardando(true)
        try {
            const datos = {
                numero: Number(numero),
                modelo,
                categoria,
                estado,
                fechaAdquisicion,
                fechaUltimoMantenimiento: fechaUltimoMantenimiento || undefined,
            }
            if (editando && karting) {
                await updateKarting(karting.id, datos)
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
                        label="Numero"
                        type="number"
                        value={numero}
                        onChange={(e) => setNumero(e.target.value)}
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
                        label="Categoria"
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                        fullWidth
                    >
                        {CATEGORIAS.map((c) => (
                            <MenuItem key={c} value={c}>{c}</MenuItem>
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
                    <TextField
                        label="Ultimo mantenimiento (opcional)"
                        type="date"
                        value={fechaUltimoMantenimiento}
                        onChange={(e) => setFechaUltimoMantenimiento(e.target.value)}
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
