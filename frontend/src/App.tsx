import { useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Flag,
  Gauge,
  LayoutDashboard,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import Dashboard from "./components/dashboard";
import "./App.css";

function App () {
  const [activePage, setActivePage] = useState("Dashboard");
  const [showMenu, setShowMenu] = useState(false);
  const navigation = [
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "Carreras", icon: Flag },
    { label: "Reservas", icon: CalendarDays },
    { label: "Pilotos", icon: Users },
    { label: "Kartings", icon: Gauge },
  ];


  return (
    <div className="app-shell">
      <aside className={`sidebar ${showMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <span className="brand-mark">K</span>
          <span>
            KART<span className="brand-accent">/</span>CONTROL
          </span>
        </div>
        <div className="workspace-label">CENTRO ROSARIO</div>
        <nav>
          {navigation.map(({ label, icon: Icon }) => (
            <button
              className={activePage === label ? "nav-item active" : "nav-item"}
              key={label}
              onClick={() => {
                setActivePage(label);
                setShowMenu(false);
              }}
            >
              <Icon size={18} />
              <span>{label}</span>
              {label === "Carreras" && <span className="nav-count">4</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item">
            <Settings size={18} />
            <span>Configuración</span>
          </button>
          <div className="profile">
            <div className="avatar">MR</div>
            <div>
              <strong>Matias R.</strong>
              <small>Administrador</small>
            </div>
            <ChevronDown size={15} />
          </div>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setShowMenu(!showMenu)}
            aria-label="Abrir menú"
          >
            {showMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="breadcrumb">
            <span>Operaciones</span>
            <span>/</span>
            <strong>{activePage}</strong>
          </div>
          <div className="top-actions">
            <div className="status">
              <i></i> Sistema operativo
            </div>
            <div className="mini-avatar">MR</div>
          </div>
        </header>
        {activePage === "Dashboard" ? <Dashboard /> : ""}
      </main>
    </div >
  );
}

export default App;
