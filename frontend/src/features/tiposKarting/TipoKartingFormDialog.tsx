import { useEffect, useState } from "react"
import { createTipoKarting, updateTipoKarting } from "../../services/tipoKartingService"
import { getTiposLicencia } from "../../services/tipoLicenciaService"
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material"
import type { TipoKarting, TipoLicencia } from "../../types"

type Props = {
    abierto: boolean
    tipoKarting?: TipoKarting | null
    onCerrar: () => void
    onGuardado: () => void
}

function TipoKartingFormDialog({ abierto, tipoKarting, onCerrar, onGuardado }: Props) {
    const [nombre, setNombre] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [tipoLicenciaMinimaId, setTipoLicenciaMinimaId] = useState('')
    const [tiposLicencia, setTiposLicencia] = useState<TipoLicencia[]>([])
    const [guardando, setGuardando] = useState(false)

    const editando = Boolean(tipoKarting)

    useEffect(() => {
        if (abierto) {
            getTiposLicencia().then((datos) => setTiposLicencia(datos))
        }
    }, [abierto])

    useEffect(() => {
        if (tipoKarting) {
            setNombre(tipoKarting.nombre)
            setDescripcion(tipoKarting.descripcion)
            setTipoLicenciaMinimaId(String(tipoKarting.TiposLicencias_idTipoLicenciaMinima))
        } else {
            setNombre('')
            setDescripcion('')
            setTipoLicenciaMinimaId('')
        }
    }, [tipoKarting, abierto])

    async function handleGuardar() {
        setGuardando(true)
        try {
            const datos = {
                nombre,
                descripcion,
                TiposLicencias_idTipoLicenciaMinima: Number(tipoLicenciaMinimaId),
            }
            if (editando && tipoKarting) {
                await updateTipoKarting(tipoKarting.idTiposKarting, datos)
            } else {
                await createTipoKarting(datos)
            }
            onGuardado()
        } finally {
            setGuardando(false)
        }
    }

    return (
        <Dialog open={abierto} onClose={onCerrar}>
            <DialogTitle>{editando ? 'Editar Tipo de Karting' : 'Nuevo Tipo de Karting'}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        label="Nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        select
                        label="Licencia minima requerida"
                        value={tipoLicenciaMinimaId}
                        onChange={(e) => setTipoLicenciaMinimaId(e.target.value)}
                        fullWidth
                    >
                        {tiposLicencia.map((t) => (
                            <MenuItem key={t.idTipoLicencia} value={String(t.idTipoLicencia)}>{t.nombre}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Descripcion"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
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
