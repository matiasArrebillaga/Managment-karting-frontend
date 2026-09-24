import { useEffect, useState } from "react"
import { createLicencia, updateLicencia } from "../../services/licenciaService"
import { getTiposLicencia } from "../../services/tipoLicenciaService"
import { getPersonas } from "../../services/personaService"
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material"
import type { Licencia, TipoLicencia, Persona } from "../../types"

type Props = {
    abierto: boolean
    licencia?: Licencia | null
    onCerrar: () => void
    onGuardado: () => void
}

function LicenciaFormDialog({ abierto, licencia, onCerrar, onGuardado }: Props) {
    const [fechaEmision, setFechaEmision] = useState('')
    const [fechaVencimiento, setFechaVencimiento] = useState('')
    const [personaId, setPersonaId] = useState('')
    const [tipoLicenciaId, setTipoLicenciaId] = useState('')
    const [personas, setPersonas] = useState<Persona[]>([])
    const [tiposLicencia, setTiposLicencia] = useState<TipoLicencia[]>([])
    const [guardando, setGuardando] = useState(false)

    const editando = Boolean(licencia)

    useEffect(() => {
        if (abierto) {
            Promise.all([getPersonas(), getTiposLicencia()]).then(([datosPersonas, datosTipos]) => {
                setPersonas(datosPersonas)
                setTiposLicencia(datosTipos)
            })
        }
    }, [abierto])

    useEffect(() => {
        if (licencia) {
            setFechaEmision(licencia.fechaEmision)
            setFechaVencimiento(licencia.fechaVencimiento)
            setPersonaId(String(licencia.Personas_idPersona))
            setTipoLicenciaId(String(licencia.TiposLicencias_idTipoLicencia))
        } else {
            setFechaEmision('')
            setFechaVencimiento('')
            setPersonaId('')
            setTipoLicenciaId('')
        }
    }, [licencia, abierto])

    async function handleGuardar() {
        setGuardando(true)
        try {
            const datos = {
                fechaEmision,
                fechaVencimiento,
                Personas_idPersona: Number(personaId),
                TiposLicencias_idTipoLicencia: Number(tipoLicenciaId),
            }
            if (editando && licencia) {
                await updateLicencia(licencia.idLicencias, datos)
            } else {
                await createLicencia(datos)
            }
            onGuardado()
        } finally {
            setGuardando(false)
        }
    }

    return (
        <Dialog open={abierto} onClose={onCerrar}>
            <DialogTitle>{editando ? 'Editar Licencia' : 'Nueva Licencia'}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        select
                        label="Titular"
                        value={personaId}
                        onChange={(e) => setPersonaId(e.target.value)}
                        fullWidth
                    >
                        {personas.map((p) => (
                            <MenuItem key={p.idPersona} value={String(p.idPersona)}>{p.nombre} {p.apellido}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label="Tipo de Licencia"
                        value={tipoLicenciaId}
                        onChange={(e) => setTipoLicenciaId(e.target.value)}
                        fullWidth
                    >
                        {tiposLicencia.map((t) => (
                            <MenuItem key={t.idTipoLicencia} value={String(t.idTipoLicencia)}>{t.nombre}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Fecha de emision"
                        type="date"
                        value={fechaEmision}
                        onChange={(e) => setFechaEmision(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        fullWidth
                    />
                    <TextField
                        label="Fecha de vencimiento"
                        type="date"
                        value={fechaVencimiento}
                        onChange={(e) => setFechaVencimiento(e.target.value)}
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

export default LicenciaFormDialog
