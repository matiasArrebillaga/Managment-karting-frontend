import { useState, type ReactNode } from "react"
import { Alert, Snackbar } from "@mui/material"
import { AvisoContext, type TipoAviso } from "./AvisoContext"

// Un único Snackbar para toda la app: cualquier pantalla avisa con useAviso()
// y el mensaje se ve arriba al centro (abajo está la barra de navegación en el celular).
export function AvisoProvider ({ children }: { children: ReactNode }) {
    const [aviso, setAviso] = useState<{ mensaje: string; tipo: TipoAviso } | null>(null)
    // el texto se guarda aparte para que no desaparezca durante la animación de cierre
    const [abierto, setAbierto] = useState(false)

    function avisar (mensaje: string, tipo: TipoAviso = 'success') {
        setAviso({ mensaje, tipo })
        setAbierto(true)
    }

    return (
        <AvisoContext.Provider value={avisar}>
            {children}
            <Snackbar
                open={abierto}
                autoHideDuration={4000}
                // 'clickaway' es un clic en cualquier parte de la página: no cierra el aviso
                onClose={(_evento, motivo) => { if (motivo !== 'clickaway') setAbierto(false) }}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity={aviso?.tipo} variant="filled" onClose={() => setAbierto(false)}>
                    {aviso?.mensaje}
                </Alert>
            </Snackbar>
        </AvisoContext.Provider>
    )
}
