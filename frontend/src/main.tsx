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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <CssBaseline />
      <Header />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/localidades" element={<LocalidadesPage />} />
        <Route path="/tipos-licencia" element={<TiposLicenciaPage />} />
        <Route path="/circuitos" element={<CircuitosPage />} />
        <Route path="/kartings" element={<KartingsPage />} />
        <Route path="/tipos-karting" element={<TiposKartingPage />} />
        <Route path="/licencias" element={<LicenciasPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
