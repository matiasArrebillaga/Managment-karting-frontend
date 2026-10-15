import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Stack, Typography } from "@mui/material"
import type { Circuito, IReserva, Karting, Persona } from "../../types"
import { fecha, hora, pesos } from "../../utils/formato"

type Props = {
    reserva: IReserva | null
    persona?: Pick<Persona, 'nombre' | 'apellido'> & Partial<Pick<Persona, 'dni' | 'mail' | 'telefono'>>
    karting?: Karting
    circuito?: Circuito
    onCerrar: () => void
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor?: string | number }) {
    return (
        <Typography>
            <strong>{etiqueta}:</strong> {valor ?? '—'}
        </Typography>
    )
}

function ReservaDetalleDialog({ reserva, persona, karting, circuito, onCerrar }: Props) {
    return (
        <Dialog open={reserva !== null} onClose={onCerrar} fullWidth maxWidth="sm">
            <DialogTitle>Reserva #{reserva?.idReservas}</DialogTitle>
            {reserva && (
                <DialogContent>
                    <Stack spacing={1}>
                        <Typography variant="h6">Reserva</Typography>
                        <Dato etiqueta="Fecha" valor={fecha(reserva.fechaReserva)} />
                        <Dato etiqueta="Horario" valor={`${hora(reserva.horaInicio)} a ${hora(reserva.horaFin)}`} />
                        <Dato etiqueta="Monto" valor={reserva.monto !== undefined ? pesos(reserva.monto) : undefined} />
                        <Dato
                            etiqueta="Circuito"
                            valor={circuito ? `#${circuito.idCircuitos} · ${circuito.distancia} m · ${circuito.dificultad}` : `#${reserva.Circuitos_idCircuitos}`}
                        />

                        <Divider />
                        <Typography variant="h6">Persona</Typography>
                        <Dato etiqueta="Nombre" valor={persona ? `${persona.nombre} ${persona.apellido}` : `#${reserva.Personas_idPersona}`} />
                        <Dato etiqueta="DNI" valor={persona?.dni} />
                        <Dato etiqueta="Mail" valor={persona?.mail} />
                        <Dato etiqueta="Teléfono" valor={persona?.telefono} />

                        <Divider />
                        <Typography variant="h6">Karting</Typography>
                        <Dato etiqueta="Modelo" valor={karting?.modelo ?? `#${reserva.Kartings_idKartings}`} />
                        <Dato etiqueta="Categoría" valor={karting?.categoria} />
                        <Dato etiqueta="Estado" valor={karting?.estado} />
                    </Stack>
                </DialogContent>
            )}
            <DialogActions>
                <Button onClick={onCerrar}>Cerrar</Button>
            </DialogActions>
        </Dialog>
    )
}

export default ReservaDetalleDialog
