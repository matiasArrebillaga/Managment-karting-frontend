import { useEffect, useState } from "react"
import { createTipoKarting, updateTipoKarting } from "../../services/tipoKartingService"
import { getTiposLicencia } from "../../services/tipoLicenciaService"
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material"
import type { TipoKarting, TipoLicencia } from "../../types"

type Props = {
    tipoKarting?: TipoKarting | null
    onCerrar: () => void
    onGuardado: () => void
}

function TipoKartingFormDialog({ tipoKarting, onCerrar, onGuardado }: Props) {
    const [nombre, setNombre] = useState(tipoKarting?.nombre ?? '')
    const [descripcion, setDescripcion] = useState(tipoKarting?.descripcion ?? '')
    const [precioHora, setPrecioHora] = useState(tipoKarting ? String(tipoKarting.precioHora) : '')
    const [tipoLicenciaMinimaId, setTipoLicenciaMinimaId] = useState(tipoKarting ? String(tipoKarting.TiposLicencias_idTipoLicenciaMinima) : '')
    const [tiposLicencia, setTiposLicencia] = useState<TipoLicencia[]>([])
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState('')

    const editando = Boolean(tipoKarting)

    useEffect(() => {
        getTiposLicencia()
            .then((datos) => setTiposLicencia(datos))
            .catch((motivo) => setError(motivo instanceof Error ? motivo.message : 'No se pudieron cargar los tipos de licencia'))
    }, [])

    // mismas reglas que el backend; Number('') da 0, por eso se mira el texto vacío aparte
    function validar() {
        if (nombre.trim().length === 0) return 'Ingresá el nombre'
        if (!tipoLicenciaMinimaId) return 'Elegí la licencia mínima'
        if (precioHora.trim() === '' || !(Number(precioHora) > 0)) return 'El precio por hora debe ser mayor que cero'
        if (descripcion.trim().length === 0) return 'Ingresá una descripción'
        return ''
    }

    async function handleGuardar() {
        const motivo = validar()
        if (motivo) {
            setError(motivo)
            return
        }
        setGuardando(true)
        setError('')
        try {
            const datos = {
                nombre: nombre.trim(),
                descripcion: descripcion.trim(),
                precioHora: Number(precioHora),
                TiposLicencias_idTipoLicenciaMinima: Number(tipoLicenciaMinimaId),
            }
            if (editando && tipoKarting) {
                await updateTipoKarting(tipoKarting.idTiposKarting, datos)
            } else {
                await createTipoKarting(datos)
            }
            onGuardado()
        } catch (motivo) {
            setError(motivo instanceof Error ? motivo.message : 'No se pudo guardar el tipo de karting')
        } finally {
            setGuardando(false)
        }
    }

    return (
        <Dialog open onClose={onCerrar}>
            <DialogTitle>{editando ? 'Editar Tipo de Karting' : 'Nuevo Tipo de Karting'}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    {error && <Alert severity="error">{error}</Alert>}
                    <TextField
                        label="Nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        slotProps={{ htmlInput: { maxLength: 45 } }}
                        required
                        fullWidth
                    />
                    <TextField
                        select
                        label="Licencia minima requerida"
                        value={tipoLicenciaMinimaId}
                        onChange={(e) => setTipoLicenciaMinimaId(e.target.value)}
                        required
                        fullWidth
                    >
                        {tiposLicencia.map((t) => (
                            <MenuItem key={t.idTipoLicencia} value={String(t.idTipoLicencia)}>{t.nombre}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Precio por hora"
                        type="number"
                        value={precioHora}
                        onChange={(e) => setPrecioHora(e.target.value)}
                        slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
                        required
                        fullWidth
                    />
                    <TextField
                        label="Descripcion"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        slotProps={{ htmlInput: { maxLength: 45 } }}
                        required
                        fullWidth
                        multiline
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

export default TipoKartingFormDialog
