import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { puede } from "../permisos";
import { getCarreras } from "../services/carreraService";
import { getCircuitos } from "../services/circuitoService";
import { getKartings } from "../services/kartingService";
import { getPersonas } from "../services/personaService";
import { getReservasDelDia } from "../services/reservaService";
import { getTorneos } from "../services/torneoService";
import type { Circuito, ICarrera, IReserva, ITorneos, Karting, Persona } from "../types";
import { hora } from "../utils/formato";

function inicioDelDia (fecha: Date): Date {
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
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
    const [circuitos, setCircuitos] = useState<Circuito[]>([]);
    const [torneos, setTorneos] = useState<ITorneos[]>([]);
    const [personas, setPersonas] = useState<Persona[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!esStaff) return;
        const dia = inicioDelDia(new Date());
        Promise.all([getCarreras(), getReservasDelDia(dia), getKartings(), getCircuitos(), getTorneos(), getPersonas()])
            .then(([datosCarreras, datosReservas, datosKartings, datosCircuitos, datosTorneos, datosPersonas]) => {
                setCarreras(datosCarreras
                    .filter((carrera) => carrera.fechaCarrera.getTime() === dia.getTime())
                    .sort((a, b) => a.horaInicio.getTime() - b.horaInicio.getTime()));
                setReservas([...datosReservas].sort((a, b) => hora(a.horaInicio).localeCompare(hora(b.horaInicio))));
                setKartings(datosKartings);
                setCircuitos(datosCircuitos);
                setTorneos(datosTorneos);
                setPersonas(datosPersonas);
            })
            .catch((err: Error) => setError(err.message));
    }, [esStaff]);

    if (!esStaff) return <Navigate to="/mi-cuenta" replace />;

    // si el catálogo no trae el registro, queda el número para no mostrar un hueco
    function nombreTorneo (id: number) {
        return torneos.find((torneo) => torneo.idTorneos === id)?.nombre ?? `Torneo #${id}`;
    }

    function nombreCircuito (id: number) {
        const circuito = circuitos.find((item) => item.idCircuitos === id);
        return circuito ? `Circuito ${id} (${circuito.distancia} m)` : `Circuito #${id}`;
    }

    function nombreKarting (id: number) {
        return kartings.find((karting) => karting.idKartings === id)?.modelo ?? `Kart #${id}`;
    }

    function nombrePersona (id: number) {
        const titular = personas.find((item) => item.idPersona === id);
        return titular ? `${titular.nombre} ${titular.apellido}` : `Persona #${id}`;
    }

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
                <Link className="btn con-icono" to="/reservas">
                    <span className="btn-icono"><CalendarDays size={16} aria-hidden="true" /></span>
                    Ver reservas
                </Link>
            </div>

            <div className="grid2">
                <section className="panel">
                    <div className="panel-head">
                        <h2>Carreras de hoy</h2>
                        <Link className="link" to="/carreras">Carreras y resultados <i aria-hidden="true">→</i></Link>
                    </div>
                    <div className="rows">
                        {carreras.length === 0 && <p className="empty">No hay carreras hoy.</p>}
                        {carreras.map((carrera) => {
                            const estado = estadoCarrera(carrera, ahora);
                            return (
                                <div className="row" key={`${carrera.Torneos_idTorneos}-${carrera.Circuitos_idCircuitos}`}>
                                    <time>{hora(carrera.horaInicio)}</time>
                                    <div>
                                        {nombreTorneo(carrera.Torneos_idTorneos)}
                                        <small>{nombreCircuito(carrera.Circuitos_idCircuitos)} · {carrera.kartings?.length ?? 0} kartings</small>
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
                        <Link className="link" to="/reservas">Ver todas <i aria-hidden="true">→</i></Link>
                    </div>
                    <div className="rows">
                        {reservas.length === 0 && <p className="empty">No hay reservas para hoy.</p>}
                        {reservas.map((reserva) => (
                            <div className="row" key={reserva.idReservas}>
                                <time>{hora(reserva.horaInicio)}</time>
                                <div>
                                    {nombrePersona(reserva.Personas_idPersona)}
                                    <small>{nombreKarting(reserva.Kartings_idKartings)} · {nombreCircuito(reserva.Circuitos_idCircuitos)} · hasta {hora(reserva.horaFin)}</small>
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
                    <Link className="link" to="/kartings">Administrar <i aria-hidden="true">→</i></Link>
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
