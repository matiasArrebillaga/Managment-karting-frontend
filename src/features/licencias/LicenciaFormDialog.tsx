import { useEffect, useState } from "react"
import { createLicencia, updateLicencia } from "../../services/licenciaService"
import { getTiposLicencia } from "../../services/tipoLicenciaService"
import { getPersonas } from "../../services/personaService"
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material"
import type { Licencia, TipoLicencia, Persona } from "../../types"
import { fechaTexto } from "../../utils/fechas"
import CampoFecha from '../../components/CampoFecha'

type Props = {
    licencia?: Licencia | null
    onCerrar: () => void
    onGuardado: () => void
}

function LicenciaFormDialog({ licencia, onCerrar, onGuardado }: Props) {
    const [fechaEmision, setFechaEmision] = useState(licencia ? fechaTexto(licencia.fechaEmision) : '')
    const [fechaVencimiento, setFechaVencimiento] = useState(licencia ? fechaTexto(licencia.fechaVencimiento) : '')
    const [personaId, setPersonaId] = useState(licencia ? String(licencia.Personas_idPersona) : '')
    const [tipoLicenciaId, setTipoLicenciaId] = useState(licencia ? String(licencia.TiposLicencias_idTipoLicencia) : '')
    const [personas, setPersonas] = useState<Persona[]>([])
    const [tiposLicencia, setTiposLicencia] = useState<TipoLicencia[]>([])
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState('')

    const editando = Boolean(licencia)

    useEffect(() => {
        Promise.all([getPersonas(), getTiposLicencia()]).then(([datosPersonas, datosTipos]) => {
            setPersonas(datosPersonas)
            setTiposLicencia(datosTipos)
        }).catch((motivo) => setError(motivo instanceof Error ? motivo.message : 'No se pudieron cargar los titulares y tipos de licencia'))
    }, [])

    // mismas reglas que licencia.service del backend; las fechas 'YYYY-MM-DD' se comparan bien como texto
    function validar() {
        if (!personaId || !tipoLicenciaId || !fechaEmision || !fechaVencimiento) return 'Completá todos los campos de la licencia'
        if (fechaEmision > fechaTexto(new Date())) return 'La fecha de emisión no puede ser futura'
        if (fechaVencimiento <= fechaEmision) return 'El vencimiento debe ser posterior a la emisión'
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
        } catch (motivo) {
            setError(motivo instanceof Error ? motivo.message : 'No se pudo guardar la licencia')
        } finally {
            setGuardando(false)
        }
    }

    return (
        <Dialog open onClose={onCerrar}>
            <DialogTitle>{editando ? 'Editar Licencia' : 'Nueva Licencia'}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    {error && <Alert severity="error">{error}</Alert>}
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
                    <CampoFecha
                        label="Fecha de emision"
                        value={fechaEmision}
                        onChange={setFechaEmision}
                        max={fechaTexto(new Date())}
                        fullWidth
                    />
                    <CampoFecha
                        label="Fecha de vencimiento"
                        value={fechaVencimiento}
                        onChange={setFechaVencimiento}
                        // el calendario no deja elegir un vencimiento anterior a la emisión
                        min={fechaEmision || undefined}
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
