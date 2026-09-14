import { useEffect, useState } from "react"
import { createLocalidad, updateLocalidad } from "../../services/localidadService"
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material"
import type {Localidad} from "../../types"

type Props = {
    abierto: boolean
    localidad?: Localidad | null
    onCerrar: () => void
    onGuardado: () => void
}

function LocalidadFormDialog({abierto, localidad, onCerrar, onGuardado}:Props) {
    const [nombre, setNombre] = useState('')
    const [provincia, setProvincia] = useState('')
    const [codigoPostal, setCodigoPostal] = useState('')
    const [guardando, setGuardando] = useState(false)

    const editando = Boolean(localidad)

    useEffect(() => {
        if (localidad) {
            setNombre(localidad.nombre)
            setProvincia(localidad.provincia)
            setCodigoPostal(localidad.codigoPostal)
        } else {
            setNombre('')
            setProvincia('')
            setCodigoPostal('')
        }
    }, [localidad, abierto])

    async function handleGuardar() {
        setGuardando(true)
        try{
            if (editando && localidad){
                await updateLocalidad(localidad.id, {nombre, provincia, codigoPostal})
            } else {
                await createLocalidad({nombre, provincia, codigoPostal})
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
                <Stack spacing={2} sx={{mt:1}}>
                    <TextField
                        label="Nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Provincia"
                        value={provincia}
                        onChange={(e) => setProvincia(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Codigo postal"
                        value={codigoPostal}
                        onChange={(e) => setCodigoPostal(e.target.value)}
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