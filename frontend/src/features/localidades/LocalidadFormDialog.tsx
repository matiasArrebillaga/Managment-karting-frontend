import { useEffect, useState } from "react"
import { createLocalidad, updateLocalidad } from "../../services/localidadService"
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material"
import type { Localidad } from "../../types"

type Props = {
    abierto: boolean
    localidad?: Localidad | null
    onCerrar: () => void
    onGuardado: () => void
}

function LocalidadFormDialog({ abierto, localidad, onCerrar, onGuardado }: Props) {
    const [nombre, setNombre] = useState('')
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState('')

    const editando = Boolean(localidad)

    useEffect(() => {
        if (localidad) {
            setNombre(localidad.nombre)
        } else {
            setNombre('')
        }
        setError('')
    }, [localidad, abierto])

    async function handleGuardar() {
        if (!nombre.trim()) {
            setError('El nombre de la localidad es obligatorio')
            return
        }

        setGuardando(true)
        setError('')
        try {
            const datos = { nombre: nombre.trim() }
            if (editando && localidad) {
                await updateLocalidad(localidad.idLocalidades, datos)
            } else {
                await createLocalidad(datos)
            }
            onGuardado()
        } catch (motivo) {
            setError(motivo instanceof Error ? motivo.message : 'No se pudo guardar la localidad')
        } finally {
            setGuardando(false)
        }
    }

    return (
        <Dialog open={abierto} onClose={onCerrar}>
            <DialogTitle>{editando ? 'Editar Localidad' : 'Nueva Localidad'}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    {error && <Alert severity="error">{error}</Alert>}
                    <TextField
                        label="Nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
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

export default LocalidadFormDialog
