import { useEffect, useState } from "react"
import { createTipoLicencia, updateTipoLicencia } from "../../services/tipoLicenciaService"
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material"
import type { TipoLicencia } from "../../types"

type Props = {
    abierto: boolean
    tipoLicencia?: TipoLicencia | null
    onCerrar: () => void
    onGuardado: () => void
}

function TipoLicenciaFormDialog({ abierto, tipoLicencia, onCerrar, onGuardado }: Props) {
    const [nombre, setNombre] = useState('')
    const [edadMinima, setEdadMinima] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [guardando, setGuardando] = useState(false)

    const editando = Boolean(tipoLicencia)

    useEffect(() => {
        if (tipoLicencia) {
            setNombre(tipoLicencia.nombre)
            setEdadMinima(String(tipoLicencia.edadMinima))
            setDescripcion(tipoLicencia.descripcion ?? '')
        } else {
            setNombre('')
            setEdadMinima('')
            setDescripcion('')
        }
    }, [tipoLicencia, abierto])

    async function handleGuardar() {
        setGuardando(true)
        try {
            const datos = {
                nombre,
                edadMinima: Number(edadMinima),
                descripcion: descripcion || undefined,
            }
            if (editando && tipoLicencia) {
                await updateTipoLicencia(tipoLicencia.id, datos)
            } else {
                await createTipoLicencia(datos)
            }
            onGuardado()
        } finally {
            setGuardando(false)
        }
    }

    return (
        <Dialog open={abierto} onClose={onCerrar}>
            <DialogTitle>{editando ? 'Editar Tipo de Licencia' : 'Nuevo Tipo de Licencia'}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        label="Nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Edad minima"
                        type="number"
                        value={edadMinima}
                        onChange={(e) => setEdadMinima(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Descripcion (opcional)"
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
