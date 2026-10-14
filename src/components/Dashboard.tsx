import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { puede } from "../permisos";
import { getCarreras } from "../services/carreraService";
import { getKartings } from "../services/kartingService";
import { getReservasDelDia } from "../services/reservaService";
import type { ICarrera, IReserva, Karting } from "../types";

function inicioDelDia (fecha: Date): Date {
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

function hora (fecha: Date | string): string {
    if (typeof fecha === "string") return fecha.slice(0, 5);
    return `${String(fecha.getHours()).padStart(2, "0")}:${String(fecha.getMinutes()).padStart(2, "0")}`;
}

function estadoCarrera (carrera: ICarrera, ahora: Date): string {
    if (ahora < carrera.horaInicio) return "Próxima";
    if (ahora < carrera.horaFin) return "En curso";
    return "Finalizada";
}

const CLASE_ESTADO: Record<string, string> = { "Próxima": "", "En curso": "info", "Finalizada": "ok" };

// Panel del día: solo staff. El cliente tiene lo suyo en /mi-cuenta.
function Dashboard () {
    const { persona } = useAuth();
    const esStaff = puede(persona?.rol.nombre, "reservas.verTodas");
    const ahora = new Date();

    const [carreras, setCarreras] = useState<ICarrera[]>([]);
    const [reservas, setReservas] = useState<IReserva[]>([]);
    const [kartings, setKartings] = useState<Karting[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!esStaff) return;
        const dia = inicioDelDia(new Date());
        Promise.all([getCarreras(), getReservasDelDia(dia), getKartings()])
            .then(([datosCarreras, datosReservas, datosKartings]) => {
                setCarreras(datosCarreras
                    .filter((carrera) => carrera.fechaCarrera.getTime() === dia.getTime())
                    .sort((a, b) => a.horaInicio.getTime() - b.horaInicio.getTime()));
                setReservas([...datosReservas].sort((a, b) => hora(a.horaInicio).localeCompare(hora(b.horaInicio))));
                setKartings(datosKartings);
            })
            .catch((err: Error) => setError(err.message));
    }, [esStaff]);

    if (!esStaff) return <Navigate to="/mi-cuenta" replace />;

    return (
        <div className="page">
            <div className="page-head">
                <div>
                    <p className="eyebrow">
                        {ahora.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <h1>Panel del día</h1>
                    <p className="sub">Esto está pasando hoy en la pista.</p>
                    {error && <p className="error">No se pudieron cargar los datos: {error}</p>}
                </div>
                <Link className="btn" to="/reservas">Ver reservas</Link>
            </div>

            <div className="grid2">
                <section className="panel">
                    <div className="panel-head">
                        <h2>Carreras de hoy</h2>
                        <Link className="link" to="/carreras">Carreras y resultados →</Link>
                    </div>
                    <div className="rows">
                        {carreras.length === 0 && <p className="empty">No hay carreras hoy.</p>}
                        {carreras.map((carrera) => {
                            const estado = estadoCarrera(carrera, ahora);
                            return (
                                <div className="row" key={`${carrera.Torneos_idTorneos}-${carrera.Circuitos_idCircuitos}`}>
                                    <time>{hora(carrera.horaInicio)}</time>
                                    <div>
                                        Torneo #{carrera.Torneos_idTorneos}
                                        <small>Circuito #{carrera.Circuitos_idCircuitos} · {carrera.kartings?.length ?? 0} kartings</small>
                                    </div>
                                    <span className={`tag ${CLASE_ESTADO[estado]}`}>{estado}</span>
                                </div>
                            );
                        })}
                    </div>
                </section>
                <section className="panel">
                    <div className="panel-head">
                        <h2>Reservas del día</h2>
                        <Link className="link" to="/reservas">Ver todas →</Link>
                    </div>
                    <div className="rows">
                        {reservas.length === 0 && <p className="empty">No hay reservas para hoy.</p>}
                        {reservas.map((reserva) => (
                            <div className="row" key={reserva.idReservas}>
                                <time>{hora(reserva.horaInicio)}</time>
                                <div>
                                    Kart #{reserva.Kartings_idKartings}
                                    <small>Circuito #{reserva.Circuitos_idCircuitos} · hasta {hora(reserva.horaFin)}</small>
                                </div>
                                <span />
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <section className="panel">
                <div className="panel-head">
                    <h2>Estado de la flota</h2>
                    <Link className="link" to="/kartings">Administrar →</Link>
                </div>
                <div className="rows">
                    {kartings.length === 0 && <p className="empty">No hay kartings cargados.</p>}
                    {kartings.map((karting) => (
                        <div className="row" key={karting.idKartings}>
                            <time>{String(karting.idKartings).padStart(2, "0")}</time>
                            <div>
                                {karting.modelo}
                                <small>{karting.categoria}</small>
                            </div>
                            <span className={`tag ${karting.estado.toLowerCase() === "disponible" ? "ok" : "warn"}`}>{karting.estado}</span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default Dashboard;
