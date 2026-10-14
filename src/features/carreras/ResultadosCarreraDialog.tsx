import { useEffect, useState } from 'react'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { cargarResultadosCarrera, deleteParticipacion, getClasificacionCarrera, updateParticipacion } from '../../services/participacionService'
import { getInscriptosTorneo } from '../../services/torneoService'
import type { ICarrera } from '../../types'

// Una fila sirve para los dos modos: cargar (inscriptos vacíos) o corregir (clasificación guardada)
type Fila = { idPersona: number; piloto: string; posicion: string; tiempo: string; puntos?: number }

type Props = {
    carrera: ICarrera | null
    puedeBorrar: boolean
    onCerrar: () => void
}

function ResultadosCarreraDialog ({ carrera, puedeBorrar, onCerrar }: Props) {
    const [filas, setFilas] = useState<Fila[]>([])
    const [yaCargada, setYaCargada] = useState(false)
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState('')

    async function cargar (carreraActual: ICarrera) {
        setCargando(true)
        try {
            const clasificacion = await getClasificacionCarrera(carreraActual)
            if (clasificacion.length > 0) {
                setYaCargada(true)
                setFilas(clasificacion.map((fila) => ({
                    idPersona: fila.idPersona,
                    piloto: `${fila.nombre} ${fila.apellido}`,
                    posicion: String(fila.posicion),
                    tiempo: fila.tiempo,
                    puntos: fila.puntos,
                })))
            } else {
                const inscriptos = await getInscriptosTorneo(carreraActual.Torneos_idTorneos)
                setYaCargada(false)
                setFilas(inscriptos.map((persona) => ({
                    idPersona: persona.idPersona,
                    piloto: `${persona.nombre} ${persona.apellido}`,
                    posicion: '',
                    tiempo: '',
                })))
            }
        } catch (motivo) {
            setError(motivo instanceof Error ? motivo.message : 'No se pudieron cargar los resultados')
        } finally {
            setCargando(false)
        }
    }

    useEffect(() => {
        if (!carrera) return
        setError('')
        cargar(carrera)
    }, [carrera])

    function cambiar (idPersona: number, campo: 'posicion' | 'tiempo', valor: string) {
        setFilas((actuales) => actuales.map((fila) => (fila.idPersona === idPersona ? { ...fila, [campo]: valor } : fila)))
    }

    // Corre la acción contra el backend y recarga; si falla muestra el mensaje del backend
    async function ejecutar (accion: (carreraActual: ICarrera) => Promise<void>) {
        if (!carrera) return
        setError('')
        try {
            await accion(carrera)
            await cargar(carrera)
        } catch (motivo) {
            setError(motivo instanceof Error ? motivo.message : 'No se pudo guardar')
        }
    }

    // Los pilotos sin posición no corrieron: no se mandan
    function handleCargar () {
        ejecutar((carreraActual) => cargarResultadosCarrera(carreraActual, filas
            .filter((fila) => fila.posicion !== '')
            .map((fila) => ({ Personas_idPersona: fila.idPersona, posicion_final: Number(fila.posicion), tiempo: fila.tiempo }))))
    }

    function handleGuardarFila (fila: Fila) {
        ejecutar((carreraActual) => updateParticipacion(carreraActual, fila.idPersona, {
            posicion_final: Number(fila.posicion),
            tiempo: fila.tiempo,
        }))
    }

    function handleBorrarFila (fila: Fila) {
        if (!window.confirm(`¿Borrar el resultado de ${fila.piloto}?`)) return
        ejecutar((carreraActual) => deleteParticipacion(carreraActual, fila.idPersona))
    }

    return (
        <Dialog open={Boolean(carrera)} onClose={onCerrar} maxWidth="md" fullWidth>
            <DialogTitle>{yaCargada ? 'Clasificación' : 'Cargar resultados'}</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {cargando ? (
                    <Typography>Cargando...</Typography>
                ) : filas.length === 0 ? (
                    <Typography>No hay pilotos inscriptos en el torneo de esta carrera.</Typography>
                ) : (
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Piloto</TableCell>
                                    <TableCell>Posición</TableCell>
                                    <TableCell>Tiempo (HH:MM:SS)</TableCell>
                                    {yaCargada && <TableCell>Puntos</TableCell>}
                                    {yaCargada && <TableCell>Acciones</TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filas.map((fila) => (
                                    <TableRow key={fila.idPersona}>
                                        <TableCell>{fila.piloto}</TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                type="number"
                                                value={fila.posicion}
                                                onChange={(event) => cambiar(fila.idPersona, 'posicion', event.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                placeholder="00:12:34"
                                                value={fila.tiempo}
                                                onChange={(event) => cambiar(fila.idPersona, 'tiempo', event.target.value)}
                                            />
                                        </TableCell>
                                        {yaCargada && <TableCell>{fila.puntos}</TableCell>}
                                        {yaCargada && (
                                            <TableCell>
                                                <Button size="small" onClick={() => handleGuardarFila(fila)}>Guardar</Button>
                                                {puedeBorrar && (
                                                    <Button size="small" color="error" onClick={() => handleBorrarFila(fila)}>Borrar</Button>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onCerrar}>Cerrar</Button>
                {!yaCargada && filas.length > 0 && (
                    <Button variant="contained" onClick={handleCargar} disabled={cargando}>Guardar resultados</Button>
                )}
            </DialogActions>
        </Dialog>
    )
}

export default ResultadosCarreraDialog
