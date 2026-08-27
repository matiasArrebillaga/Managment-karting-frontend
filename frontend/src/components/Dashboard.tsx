import { useState } from "react";
import {
    ArrowUpRight,
    CalendarDays,
    ChevronDown,
    Gauge,
    Plus,
    Search,
    Trophy,
    Users,
    Wrench,
} from "lucide-react";
import { activity, karts, races } from "../data/mockData";

function Dashboard () {
    const [query, setQuery] = useState("");
    const filteredRaces = races.filter((race) =>
        `${race.name} ${race.circuit}`.toLowerCase().includes(query.toLowerCase()),
    );



    return (

        <div className="content-wrap">
            <section className="page-heading">
                <div>
                    <p className="eyebrow">MIÉRCOLES, 26 DE AGOSTO DE 2026</p>
                    <h1>
                        Buen día, Matias <span>✦</span>
                    </h1>
                    <p className="subtitle">
                        Todo bajo control. Esto está pasando hoy en la pista.
                    </p>
                </div>
                <button className="primary-button">
                    <Plus size={18} /> Nueva reserva
                </button>
            </section>
            <section className="metrics-grid">
                <article className="metric-card dark">
                    <div className="metric-icon">
                        <Trophy size={17} />
                    </div>
                    <p>Reservas de hoy</p>
                    <strong>24</strong>
                    <small className="positive">
                        +12.5% <span>vs. ayer</span>
                    </small>
                    <div className="sparkline">
                        <b></b>
                        <b></b>
                        <b></b>
                        <b></b>
                        <b></b>
                        <b></b>
                        <b></b>
                        <b></b>
                    </div>
                </article>
                <article className="metric-card">
                    <div className="metric-icon lime">
                        <Users size={17} />
                    </div>
                    <p>Pilotos activos</p>
                    <strong>86</strong>
                    <small className="positive">
                        +8.2% <span>este mes</span>
                    </small>
                </article>
                <article className="metric-card">
                    <div className="metric-icon orange">
                        <Gauge size={17} />
                    </div>
                    <p>Kartings disponibles</p>
                    <strong>
                        08 <small>/ 10</small>
                    </strong>
                    <small className="warning">2 en mantenimiento</small>
                    <div className="progress">
                        <span></span>
                    </div>
                </article>
                <article className="metric-card">
                    <div className="metric-icon blue">
                        <CalendarDays size={17} />
                    </div>
                    <p>Próxima carrera</p>
                    <strong>
                        11:00 <small>AM</small>
                    </strong>
                    <small className="muted">Torneo Primavera</small>
                </article>
            </section>
            <section className="dashboard-grid">
                <article className="panel schedule-panel">
                    <div className="panel-header">
                        <div>
                            <p className="eyebrow">AGENDA DE HOY</p>
                            <h2>Próximas carreras</h2>
                        </div>
                        <div className="header-actions">
                            <div className="search-box">
                                <Search size={16} />
                                <input
                                    placeholder="Buscar carrera"
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                />
                            </div>
                            <button className="icon-button" aria-label="Filtrar carreras">
                                <ChevronDown size={17} />
                            </button>
                        </div>
                    </div>
                    <div className="race-list">
                        {filteredRaces.map((race) => (
                            <div className="race-row" key={race.id}>
                                <time>{race.time}</time>
                                <div
                                    className={`race-line ${race.status === "En curso" ? "current" : ""}`}
                                ></div>
                                <div className="race-info">
                                    <strong>{race.name}</strong>
                                    <span>
                                        {race.circuit} <b>·</b> {race.drivers} pilotos
                                    </span>
                                </div>
                                <span
                                    className={`badge ${race.status.toLowerCase().replace(" ", "-")}`}
                                >
                                    {race.status}
                                </span>
                                <ArrowUpRight size={17} className="row-arrow" />
                            </div>
                        ))}
                    </div>
                    <button className="text-button">
                        Ver agenda completa <ArrowUpRight size={15} />
                    </button>
                </article>
                <article className="panel activity-panel">
                    <div className="panel-header">
                        <div>
                            <p className="eyebrow">MOVIMIENTOS</p>
                            <h2>Actividad reciente</h2>
                        </div>
                        <button className="more-button">•••</button>
                    </div>
                    <div className="activity-list">
                        {activity.map((item) => (
                            <div className="activity-item" key={item.title}>
                                <div className={`activity-dot ${item.tone}`}></div>
                                <div>
                                    <strong>{item.title}</strong>
                                    <span>{item.detail}</span>
                                    <small>{item.time}</small>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="text-button">
                        Ver toda la actividad <ArrowUpRight size={15} />
                    </button>
                </article>
            </section>
            <section className="panel fleet-panel">
                <div className="panel-header">
                    <div>
                        <p className="eyebrow">FLOTA</p>
                        <h2>Estado de kartings</h2>
                    </div>
                    <button className="text-button">
                        Administrar flota <ArrowUpRight size={15} />
                    </button>
                </div>
                <div className="fleet-list">
                    {karts.map((kart) => (
                        <div className="fleet-item" key={kart.id}>
                            <div className="kart-number">
                                {String(kart.id).padStart(2, "0")}
                            </div>
                            <div className="kart-visual">
                                <Wrench size={18} />
                            </div>
                            <div className="kart-copy">
                                <strong>{kart.model}</strong>
                                <span>{kart.category}</span>
                            </div>
                            <span
                                className={`fleet-status ${kart.status === "Disponible" ? "available" : "repair"}`}
                            >
                                <i></i>
                                {kart.status}
                            </span>
                        </div>
                    ))}
                </div>
            </section>
        </div>

    )

}

export default Dashboard