import { useEffect, useState } from "react"
import { createLocalidad, updateLocalidad } from "../../services/localidadService"
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material"
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

    const editando = Boolean(localidad)

    useEffect(() => {
        if (localidad) {
            setNombre(localidad.nombre)
        } else {
            setNombre('')
        }
    }, [localidad, abierto])

    async function handleGuardar() {
        setGuardando(true)
        try {
            const datos = { nombre }
            if (editando && localidad) {
                await updateLocalidad(localidad.idLocalidades, datos)
            } else {
                await createLocalidad(datos)
            }
            onGuardado()
        } finally {
            setGuardando(false)
        }
    }

    return (
        <Dialog open={abierto} onClose={onCerrar}>
            <DialogTitle>{editando ? 'Editar Localidad' : 'Nueva Localidad'}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        label="Nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
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
