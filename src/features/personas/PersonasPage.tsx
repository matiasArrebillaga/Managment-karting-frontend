import { useEffect, useState } from 'react'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { asignarRol, deletePersona, getPersonas, getRoles } from '../../services/personaService'
import { getLocalidades } from '../../services/localidadService'
import { useAuth } from '../../context/AuthContext'
import type { Localidad, Persona, Rol, RolDetalle } from '../../types'
import PersonaFormDialog from './PersonaFormDialog'

const ROLES: Rol[] = ['CLIENTE', 'EMPLEADO', 'ADMIN']

function PersonasPage() {
    const { persona: yo } = useAuth()
    const [personas, setPersonas] = useState<Persona[]>([])
    const [roles, setRoles] = useState<RolDetalle[]>([])
    const [localidades, setLocalidades] = useState<Localidad[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [abierto, setAbierto] = useState(false)
    const [personaEditando, setPersonaEditando] = useState<Persona | null>(null)
    const [personaRol, setPersonaRol] = useState<Persona | null>(null)
    const [rolNuevo, setRolNuevo] = useState<Rol>('CLIENTE')
    const [errorRol, setErrorRol] = useState('')

    async function cargarPersonas() {
        setCargando(true)
        setError('')
        try {
            const [datosPersonas, datosRoles, datosLocalidades] = await Promise.all([getPersonas(), getRoles(), getLocalidades()])
            setPersonas(datosPersonas)
            setRoles(datosRoles)
            setLocalidades(datosLocalidades)
        } catch (motivo) {
            setError(motivo instanceof Error ? motivo.message : 'No se pudieron cargar las personas')
        } finally {
            setCargando(false)
        }
    }

    useEffect(() => {
        cargarPersonas()
    }, [])

    const nombreRol = (id: number) => roles.find((r) => r.idRol === id)?.nombre ?? `#${id}`
    const nombreLocalidad = (id: number) => localidades.find((l) => l.idLocalidades === id)?.nombre ?? `#${id}`

    function handleNueva() {
        setPersonaEditando(null)
        setAbierto(true)
    }

    function handleEditar(persona: Persona) {
        setPersonaEditando(persona)
        setAbierto(true)
    }

    function handleGuardado() {
        setAbierto(false)
        setPersonaEditando(null)
        cargarPersonas()
    }

    function handleAbrirRol(persona: Persona) {
        setPersonaRol(persona)
        setRolNuevo(nombreRol(persona.idRol) as Rol)
        setErrorRol('')
    }

    async function handleGuardarRol() {
        if (!personaRol) return
        try {
            await asignarRol(personaRol.idPersona, rolNuevo)
            setPersonaRol(null)
            cargarPersonas()
        } catch (motivo) {
            setErrorRol(motivo instanceof Error ? motivo.message : 'No se pudo cambiar el rol')
        }
    }

    async function handleEliminar(persona: Persona) {
        if (!window.confirm(`¿Seguro que querés eliminar a ${persona.nombre} ${persona.apellido}?`)) return
        try {
            await deletePersona(persona.idPersona)
            cargarPersonas()
        } catch (motivo) {
            alert(motivo instanceof Error ? motivo.message : 'No se pudo eliminar la persona')
        }
    }

    if (cargando) {
        return <Typography sx={{ p: 3 }}>Cargando...</Typography>
    }

    return (
        <div style={{ padding: 24 }}>
            <Typography variant="h4" gutterBottom>
                Personas
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Button variant="contained" onClick={handleNueva} sx={{ mb: 2 }}>
                Nueva persona
            </Button>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Mail</TableCell>
                            <TableCell>DNI</TableCell>
                            <TableCell>Localidad</TableCell>
                            <TableCell>Rol</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {personas.map((persona) => {
                            // un admin no puede quitarse el rol ni borrarse a sí mismo desde acá
                            const soyYo = persona.idPersona === yo?.idPersona
                            return (
                                <TableRow key={persona.idPersona}>
                                    <TableCell>{persona.nombre} {persona.apellido}</TableCell>
                                    <TableCell>{persona.mail}</TableCell>
                                    <TableCell>{persona.dni}</TableCell>
                                    <TableCell>{nombreLocalidad(persona.Localidades_idLocalidades)}</TableCell>
                                    <TableCell>{nombreRol(persona.idRol)}</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                        <Button size="small" onClick={() => handleEditar(persona)}>Editar</Button>
                                        <Button size="small" onClick={() => handleAbrirRol(persona)} disabled={soyYo}>Cambiar rol</Button>
                                        <Button size="small" color="error" onClick={() => handleEliminar(persona)} disabled={soyYo}>Eliminar</Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {personas.length === 0 && !error && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No hay personas para mostrar.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <PersonaFormDialog
                abierto={abierto}
                persona={personaEditando}
                onCerrar={() => setAbierto(false)}
                onGuardado={handleGuardado}
            />

            <Dialog open={personaRol !== null} onClose={() => setPersonaRol(null)} fullWidth maxWidth="xs">
                <DialogTitle>Cambiar rol</DialogTitle>
                <DialogContent>
                    {errorRol && <Alert severity="error" sx={{ mb: 2 }}>{errorRol}</Alert>}
                    <Typography sx={{ mb: 2 }}>{personaRol?.nombre} {personaRol?.apellido}</Typography>
                    <TextField select fullWidth label="Rol" value={rolNuevo} onChange={(e) => setRolNuevo(e.target.value as Rol)}>
                        {ROLES.map((rol) => <MenuItem key={rol} value={rol}>{rol}</MenuItem>)}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPersonaRol(null)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleGuardarRol}>Guardar</Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default PersonasPage
