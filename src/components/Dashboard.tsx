import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Plus, Wrench } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { puede } from "../permisos";
import { getCarreras, getCarrerasTorneo } from "../services/carreraService";
import { getKartings } from "../services/kartingService";
import { getMisLicencias, type MiLicencia } from "../services/licenciaService";
import { getMisReservas, getReservasDelDia } from "../services/reservaService";
import { getMisTorneos } from "../services/torneoService";
import type { ICarrera, IReserva, ITorneos, Karting } from "../types";

function inicioDelDia (fecha: Date): Date {
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

function hora (fecha: Date | string): string {
    if (typeof fecha === "string") return fecha.slice(0, 5);
    return `${String(fecha.getHours()).padStart(2, "0")}:${String(fecha.getMinutes()).padStart(2, "0")}`;
}

function fechaCorta (fecha: Date): string {
    return fecha.toLocaleDateString("es-AR");
}

function estadoCarrera (carrera: ICarrera, ahora: Date): string {
    if (ahora < carrera.horaInicio) return "Próxima";
    if (ahora < carrera.horaFin) return "En curso";
    return "Finalizada";
}

function Dashboard () {
    const navigate = useNavigate();
    const { persona } = useAuth();
    const esStaff = puede(persona?.rol.nombre, "reservas.verTodas");
    const ahora = new Date();
    const hoy = inicioDelDia(ahora);

    const [carreras, setCarreras] = useState<ICarrera[]>([]);
    const [reservas, setReservas] = useState<IReserva[]>([]);
    const [kartings, setKartings] = useState<Karting[]>([]);
    const [torneos, setTorneos] = useState<ITorneos[]>([]);
    const [licencia, setLicencia] = useState<MiLicencia | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const dia = inicioDelDia(new Date());
        const carga = esStaff
            ? Promise.all([getCarreras(), getReservasDelDia(dia), getKartings()]).then(([datosCarreras, datosReservas, datosKartings]) => {
                setCarreras(datosCarreras
                    .filter((carrera) => carrera.fechaCarrera.getTime() === dia.getTime())
                    .sort((a, b) => a.horaInicio.getTime() - b.horaInicio.getTime()));
                setReservas([...datosReservas].sort((a, b) => hora(a.horaInicio).localeCompare(hora(b.horaInicio))));
                setKartings(datosKartings);
            })
            : Promise.all([getMisReservas(persona?.idPersona), getMisTorneos(), getMisLicencias()]).then(async ([datosReservas, datosTorneos, datosLicencias]) => {
                setReservas(datosReservas
                    .filter((reserva) => reserva.fechaReserva >= dia)
                    .sort((a, b) => a.fechaReserva.getTime() - b.fechaReserva.getTime() || hora(a.horaInicio).localeCompare(hora(b.horaInicio))));
                const misTorneos = datosTorneos.filter((torneo) => torneo.fechaFin >= dia);
                setTorneos(misTorneos);
                setLicencia(datosLicencias[0] ?? null);
                // una llamada por torneo: el backend no tiene "mis carreras"
                const carrerasPorTorneo = await Promise.all(misTorneos.map((torneo) => getCarrerasTorneo(torneo.idTorneos)));
                setCarreras(carrerasPorTorneo
                    .flat()
                    .filter((carrera) => carrera.fechaCarrera >= dia)
                    .sort((a, b) => a.horaInicio.getTime() - b.horaInicio.getTime()));
            });
        carga.catch((err: Error) => setError(err.message));
    }, [esStaff, persona?.idPersona]);

    const vencimiento = licencia ? new Date(`${licencia.fechaVencimiento}T00:00:00`) : null;

    return (

        <div className="content-wrap">
            <section className="page-heading">
                <div>
                    <p className="eyebrow">
                        {ahora.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).toUpperCase()}
                    </p>
                    <h1>
                        Hola, {persona?.nombre} <span>✦</span>
                    </h1>
                    <p className="subtitle">
                        {esStaff ? "Esto está pasando hoy en la pista." : "Tus próximas reservas, torneos y tu licencia."}
                    </p>
                    {error && <p className="subtitle">No se pudieron cargar los datos: {error}</p>}
                </div>
                <button className="primary-button" onClick={() => navigate("/reservas")}>
                    <Plus size={18} /> Nueva reserva
                </button>
            </section>

            {esStaff ? (
                <>
                    <section className="dashboard-grid">
                        <article className="panel schedule-panel">
                            <div className="panel-header">
                                <div>
                                    <p className="eyebrow">AGENDA DE HOY</p>
                                    <h2>Carreras de hoy</h2>
                                </div>
                            </div>
                            <div className="race-list">
                                {carreras.length === 0 && <p className="subtitle">No hay carreras hoy.</p>}
                                {carreras.map((carrera) => {
                                    const estado = estadoCarrera(carrera, ahora);
                                    return (
                                        <div className="race-row" key={`${carrera.Torneos_idTorneos}-${carrera.Circuitos_idCircuitos}`}>
                                            <time>{hora(carrera.horaInicio)}</time>
                                            <div className={`race-line ${estado === "En curso" ? "current" : ""}`}></div>
                                            <div className="race-info">
                                                <strong>Torneo #{carrera.Torneos_idTorneos}</strong>
                                                <span>
                                                    Circuito #{carrera.Circuitos_idCircuitos} <b>·</b> {carrera.kartings?.length ?? 0} kartings
                                                </span>
                                            </div>
                                            <span className={`badge ${estado.toLowerCase().replace(" ", "-")}`}>{estado}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <button className="text-button" onClick={() => navigate("/carreras")}>
                                Ver todas las carreras <ArrowUpRight size={15} />
                            </button>
                        </article>
                        <article className="panel">
                            <div className="panel-header">
                                <div>
                                    <p className="eyebrow">RESERVAS</p>
                                    <h2>Reservas del día</h2>
                                </div>
                            </div>
                            <div className="race-list">
                                {reservas.length === 0 && <p className="subtitle">No hay reservas para hoy.</p>}
                                {reservas.map((reserva) => (
                                    <div className="race-row" key={reserva.idReservas}>
                                        <time>{hora(reserva.horaInicio)}</time>
                                        <div className="race-line"></div>
                                        <div className="race-info">
                                            <strong>Kart #{reserva.Kartings_idKartings}</strong>
                                            <span>Circuito #{reserva.Circuitos_idCircuitos} <b>·</b> hasta {hora(reserva.horaFin)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="text-button" onClick={() => navigate("/reservas")}>
                                Ver todas las reservas <ArrowUpRight size={15} />
                            </button>
                        </article>
                    </section>
                    <section className="panel fleet-panel">
                        <div className="panel-header">
                            <div>
                                <p className="eyebrow">FLOTA</p>
                                <h2>Estado de kartings</h2>
                            </div>
                            <button className="text-button" onClick={() => navigate("/kartings")}>
                                Administrar flota <ArrowUpRight size={15} />
                            </button>
                        </div>
                        <div className="fleet-list">
                            {kartings.map((karting) => (
                                <div className="fleet-item" key={karting.idKartings}>
                                    <div className="kart-number">{String(karting.idKartings).padStart(2, "0")}</div>
                                    <div className="kart-visual">
                                        <Wrench size={18} />
                                    </div>
                                    <div className="kart-copy">
                                        <strong>{karting.modelo}</strong>
                                        <span>{karting.categoria}</span>
                                    </div>
                                    <span className={`fleet-status ${karting.estado === "Disponible" ? "available" : "repair"}`}>
                                        <i></i>
                                        {karting.estado}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            ) : (
                <>
                    <section className="dashboard-grid">
                        <article className="panel schedule-panel">
                            <div className="panel-header">
                                <div>
                                    <p className="eyebrow">MI CUENTA</p>
                                    <h2>Próximas reservas</h2>
                                </div>
                            </div>
                            <div className="race-list">
                                {reservas.length === 0 && <p className="subtitle">No tenés reservas próximas.</p>}
                                {reservas.map((reserva) => (
                                    <div className="race-row" key={reserva.idReservas}>
                                        <time>{hora(reserva.horaInicio)}</time>
                                        <div className="race-line"></div>
                                        <div className="race-info">
                                            <strong>{fechaCorta(reserva.fechaReserva)}</strong>
                                            <span>
                                                Kart #{reserva.Kartings_idKartings} <b>·</b> Circuito #{reserva.Circuitos_idCircuitos} <b>·</b> hasta {hora(reserva.horaFin)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="text-button" onClick={() => navigate("/reservas")}>
                                Ver mis reservas <ArrowUpRight size={15} />
                            </button>
                        </article>
                        <article className="panel">
                            <div className="panel-header">
                                <div>
                                    <p className="eyebrow">COMPETENCIA</p>
                                    <h2>Mis torneos</h2>
                                </div>
                            </div>
                            <div className="race-list">
                                {torneos.length === 0 && <p className="subtitle">No estás anotado en ningún torneo.</p>}
                                {torneos.map((torneo) => (
                                    <div className="race-row" key={torneo.idTorneos}>
                                        <time>{fechaCorta(torneo.fechaInicio).slice(0, -5)}</time>
                                        <div className="race-line"></div>
                                        <div className="race-info">
                                            <strong>{torneo.nombre}</strong>
                                            <span>Del {fechaCorta(torneo.fechaInicio)} al {fechaCorta(torneo.fechaFin)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="text-button" onClick={() => navigate("/torneos")}>
                                Ver torneos <ArrowUpRight size={15} />
                            </button>
                        </article>
                    </section>
                    <section className="panel fleet-panel">
                        <div className="panel-header">
                            <div>
                                <p className="eyebrow">MIS TORNEOS</p>
                                <h2>Próximas carreras</h2>
                            </div>
                        </div>
                        <div className="race-list">
                            {carreras.length === 0 && <p className="subtitle">No hay carreras próximas en tus torneos.</p>}
                            {carreras.map((carrera) => (
                                <div className="race-row" key={`${fechaCorta(carrera.fechaCarrera)}-${carrera.Torneos_idTorneos}-${carrera.Circuitos_idCircuitos}`}>
                                    <time>{fechaCorta(carrera.fechaCarrera).slice(0, -5)}</time>
                                    <div className="race-line"></div>
                                    <div className="race-info">
                                        <strong>{torneos.find((torneo) => torneo.idTorneos === carrera.Torneos_idTorneos)?.nombre}</strong>
                                        <span>
                                            {hora(carrera.horaInicio)} a {hora(carrera.horaFin)} <b>·</b> Circuito #{carrera.Circuitos_idCircuitos}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                    <section className="panel fleet-panel">
                        <div className="panel-header">
                            <div>
                                <p className="eyebrow">LICENCIA</p>
                                <h2>Mi licencia</h2>
                            </div>
                        </div>
                        {licencia && vencimiento ? (
                            <div>
                                <div className="kart-copy">
                                    <strong>{licencia.tipo}</strong>
                                    <span>Vence el {fechaCorta(vencimiento)}</span>
                                </div>
                                <span className={`fleet-status ${vencimiento >= hoy ? "available" : "repair"}`}>
                                    <i></i>
                                    {vencimiento >= hoy ? "Vigente" : "Vencida"}
                                </span>
                            </div>
                        ) : (
                            <p className="subtitle">Todavía no tenés licencia. Pedila en recepción para poder reservar.</p>
                        )}
                    </section>
                </>
            )}
        </div>

    )

}

export default Dashboard
