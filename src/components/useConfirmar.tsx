import { useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'

type Pedido = { mensaje: string; accion: string; responder: (ok: boolean) => void }

// Reemplazo de window.confirm con el estilo de la app.
// Uso: const { confirmar, dialogo } = useConfirmar()
//      if (!(await confirmar('¿Eliminar?', 'Eliminar'))) return
//      ...y renderizar {dialogo} en la página.
export function useConfirmar () {
    const [pedido, setPedido] = useState<Pedido | null>(null)
    // el texto se guarda aparte para que no desaparezca durante la animación de cierre
    const [abierto, setAbierto] = useState(false)

    function confirmar (mensaje: string, accion = 'Confirmar') {
        return new Promise<boolean>((responder) => {
            setPedido({ mensaje, accion, responder })
            setAbierto(true)
        })
    }

    function cerrar (ok: boolean) {
        pedido?.responder(ok)
        setAbierto(false)
    }

    const dialogo = (
        <Dialog open={abierto} onClose={() => cerrar(false)} maxWidth="xs">
            <DialogTitle>{pedido?.mensaje}</DialogTitle>
            <DialogContent />
            <DialogActions>
                <Button onClick={() => cerrar(false)}>Volver</Button>
                <Button variant="contained" onClick={() => cerrar(true)} autoFocus>{pedido?.accion}</Button>
            </DialogActions>
        </Dialog>
    )

    return { confirmar, dialogo }
}
