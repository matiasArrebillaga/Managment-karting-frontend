import { useEffect, useState } from 'react'
import Table from '@mui/material/Table'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import Button from '@mui/material/Button'
import { getLicencias, deleteLicencia } from '../../services/licenciaService'
import { getTiposLicencia } from '../../services/tipoLicenciaService'
import { getPersonas } from '../../services/personaService'
import type { Licencia, TipoLicencia, Persona } from '../../types'
import LicenciaFormDialog from './LicenciaFormDialog'

function LicenciasPage() {
    const [licencias, setLicencias] = useState<Licencia[]>([])
    const [tiposLicencia, setTiposLicencia] = useState<TipoLicencia[]>([])
    const [personas, setPersonas] = useState<Persona[]>([])
    const [cargando, setCargando] = useState(true)
    const [abierto, setAbierto] = useState(false)
    const [licenciaEditando, setLicenciaEditando] = useState<Licencia | null>(null)

    function cargarLicencias() {
        setCargando(true)
        Promise.all([getLicencias(), getTiposLicencia(), getPersonas()])
            .then(([datosLicencias, datosTipos, datosPersonas]) => {
                setLicencias(datosLicencias)
                setTiposLicencia(datosTipos)
                setPersonas(datosPersonas)
            })
            .finally(() => setCargando(false))
    }

    function nombreTipoLicencia(id: number) {
        return tiposLicencia.find((t) => t.idTipoLicencia === id)?.nombre ?? '-'
    }

    function nombreTitular(id: number) {
        const persona = personas.find((p) => p.idPersona === id)
        return persona ? `${persona.nombre} ${persona.apellido}` : '-'
    }

    useEffect(() => {
        cargarLicencias()
    }, [])

    function handleNueva() {
        setLicenciaEditando(null)
        setAbierto(true)
    }

    function handleEditar(licencia: Licencia) {
        setLicenciaEditando(licencia)
        setAbierto(true)
    }

    function handleGuardado() {
        setAbierto(false)
        setLicenciaEditando(null)
        cargarLicencias()
    }

    async function handleEliminar(id: number) {
        const confirmar = window.confirm('¿Seguro que querés eliminar esta licencia?')
        if (!confirmar) return

        try {
            await deleteLicencia(id)
            cargarLicencias()
        } catch (error) {
            alert(error instanceof Error ? error.message : 'No se pudo eliminar la licencia')
            console.error(error)
        }
    }

    if (cargando) {
        return <Typography sx={{ p: 3 }}>Cargando...</Typography>
    }

    return (
        <div style={{ padding: 24 }}>
            <Typography variant="h4" gutterBottom>
                Licencias
            </Typography>

            <Button variant="contained" onClick={handleNueva} sx={{ mb: 2 }}>
                Nueva Licencia
            </Button>

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Titular</TableCell>
                        <TableCell>Tipo de Licencia</TableCell>
                        <TableCell>Fecha Emision</TableCell>
                        <TableCell>Fecha Vencimiento</TableCell>
                        <TableCell>Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {licencias.map((licencia) => (
                        <TableRow key={licencia.idLicencias}>
                            <TableCell>{nombreTitular(licencia.Personas_idPersona)}</TableCell>
                            <TableCell>{nombreTipoLicencia(licencia.TiposLicencias_idTipoLicencia)}</TableCell>
                            <TableCell>{licencia.fechaEmision}</TableCell>
                            <TableCell>{licencia.fechaVencimiento}</TableCell>
                            <TableCell>
                                <Button size="small" onClick={() => handleEditar(licencia)}>
                                    Editar
                                </Button>
                                <Button size="small" color="error" onClick={() => handleEliminar(licencia.idLicencias)}>
                                    Eliminar
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <LicenciaFormDialog
                abierto={abierto}
                licencia={licenciaEditando}
                onCerrar={() => setAbierto(false)}
                onGuardado={handleGuardado}
            />
        </div>
    )
}

export default LicenciasPage
