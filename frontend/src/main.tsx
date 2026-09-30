import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App.tsx'
import Dashboard from './components/Dashboard.tsx'
import AuthPage from './components/AuthPage.tsx'
import Header from './components/Header.tsx'
import LocalidadesPage  from './features/localidades/LocalidadesPage.tsx'
import TiposLicenciaPage from './features/tiposLicencia/TiposLicenciaPage.tsx'
import CircuitosPage from './features/circuitos/CircuitosPage.tsx'
import KartingsPage from './features/kartings/KartingsPage.tsx'
import TiposKartingPage from './features/tiposKarting/TiposKartingPage.tsx'
import LicenciasPage from './features/licencias/LicenciasPage.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import RutaProtegida from './components/RutaProtegida.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CssBaseline />
        <Header />
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/dashboard" element={<RutaProtegida><Dashboard /></RutaProtegida>} />
          <Route path="/localidades" element={<RutaProtegida><LocalidadesPage /></RutaProtegida>} />
          <Route path="/circuitos" element={<RutaProtegida><CircuitosPage /></RutaProtegida>} />
          <Route path="/kartings" element={<RutaProtegida><KartingsPage /></RutaProtegida>} />
          <Route
            path="/tipos-licencia"
            element={<RutaProtegida rolesPermitidos={['ADMIN', 'EMPLEADO']}><TiposLicenciaPage /></RutaProtegida>}
          />
          <Route
            path="/tipos-karting"
            element={<RutaProtegida rolesPermitidos={['ADMIN', 'EMPLEADO']}><TiposKartingPage /></RutaProtegida>}
          />
          <Route
            path="/licencias"
            element={<RutaProtegida rolesPermitidos={['ADMIN', 'EMPLEADO']}><LicenciasPage /></RutaProtegida>}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
