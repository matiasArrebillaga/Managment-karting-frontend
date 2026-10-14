import { Dialog, DialogContent, DialogTitle } from '@mui/material'
import ReservaForm, { type ReservaFormProps } from './ReservaForm'

type Props = Omit<ReservaFormProps, 'onCancelar'> & {
    abierto: boolean
    onCerrar: () => void
}

function ReservaFormDialog ({ abierto, onCerrar, ...formProps }: Props) {
    return (
        <Dialog open={abierto} onClose={onCerrar} fullWidth maxWidth="sm">
            <DialogTitle>{formProps.reserva ? 'Editar reserva' : 'Nueva reserva'}</DialogTitle>
            <DialogContent>
                <div style={{ paddingTop: 8 }}>
                    <ReservaForm key={formProps.reserva?.idReservas ?? 'nueva'} {...formProps} onCancelar={onCerrar} />
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ReservaFormDialog
