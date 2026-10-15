import { useState } from "react"
import { createTipoLicencia, updateTipoLicencia } from "../../services/tipoLicenciaService"
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material"
import type { TipoLicencia } from "../../types"

type Props = {
    tipoLicencia?: TipoLicencia | null
    onCerrar: () => void
    onGuardado: () => void
}

function TipoLicenciaFormDialog({ tipoLicencia, onCerrar, onGuardado }: Props) {
    const [nombre, setNombre] = useState(tipoLicencia?.nombre ?? '')
    const [descripcion, setDescripcion] = useState(tipoLicencia?.descripcion ?? '')
    const [nivel, setNivel] = useState(tipoLicencia ? String(tipoLicencia.nivel) : '')
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState('')

    const editando = Boolean(tipoLicencia)

    async function handleGuardar() {
        setGuardando(true)
        setError('')
        try {
            const datos = {
                nombre,
                descripcion,
                nivel: Number(nivel),
            }
            if (editando && tipoLicencia) {
                await updateTipoLicencia(tipoLicencia.idTipoLicencia, datos)
            } else {
                await createTipoLicencia(datos)
            }
            onGuardado()
        } catch (motivo) {
            setError(motivo instanceof Error ? motivo.message : 'No se pudo guardar el tipo de licencia')
        } finally {
            setGuardando(false)
        }
    }

    return (
        <Dialog open onClose={onCerrar}>
            <DialogTitle>{editando ? 'Editar Tipo de Licencia' : 'Nuevo Tipo de Licencia'}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    {error && <Alert severity="error">{error}</Alert>}
                    <TextField
                        label="Nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Nivel"
                        type="number"
                        value={nivel}
                        onChange={(e) => setNivel(e.target.value)}
                        fullWidth
                    />
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

export default TipoLicenciaFormDialog
