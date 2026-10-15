import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCarrerasTorneo } from "../services/carreraService";
import { getCircuitos } from "../services/circuitoService";
import { getKartings } from "../services/kartingService";
import { getMisLicencias, type MiLicencia } from "../services/licenciaService";
import { getMisReservas } from "../services/reservaService";
import { getMisTorneos } from "../services/torneoService";
import type { Circuito, ICarrera, IReserva, ITorneos, Karting } from "../types";
import { fecha as fechaCorta, hora, pesos } from "../utils/formato";
import { fechaLocal } from "../utils/fechas";

function inicioDelDia (fecha: Date): Date {
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

function MiCuentaPage () {
    const { persona } = useAuth();
    const [reservas, setReservas] = useState<IReserva[]>([]);
    const [torneos, setTorneos] = useState<ITorneos[]>([]);
    const [carreras, setCarreras] = useState<ICarrera[]>([]);
    const [licencia, setLicencia] = useState<MiLicencia | null>(null);
    const [circuitos, setCircuitos] = useState<Circuito[]>([]);
    const [kartings, setKartings] = useState<Karting[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const hoy = inicioDelDia(new Date());
        Promise.all([getMisReservas(persona?.idPersona), getMisTorneos(), getMisLicencias()])
            .then(([datosReservas, datosTorneos, datosLicencias]) => {
                setReservas(datosReservas
                    .filter((reserva) => reserva.fechaReserva >= hoy)
                    .sort((a, b) => a.fechaReserva.getTime() - b.fechaReserva.getTime() || hora(a.horaInicio).localeCompare(hora(b.horaInicio))));
                const misTorneos = datosTorneos.filter((torneo) => torneo.fechaFin >= hoy);
                setTorneos(misTorneos);
                setLicencia(datosLicencias[0] ?? null);
                // una llamada por torneo: el backend no tiene "mis carreras"
                return Promise.all(misTorneos.map((torneo) => getCarrerasTorneo(torneo.idTorneos)));
            })
            .then((carrerasPorTorneo) => {
                setCarreras(carrerasPorTorneo
                    .flat()
                    .filter((carrera) => carrera.fechaCarrera >= hoy)
                    .sort((a, b) => a.horaInicio.getTime() - b.horaInicio.getTime()));
            })
            .catch((err: Error) => setError(err.message));
    }, [persona?.idPersona]);

    // los nombres son un extra: si fallan, las filas muestran el número
    useEffect(() => {
        getCircuitos().then(setCircuitos).catch(() => setCircuitos([]));
        getKartings().then(setKartings).catch(() => setKartings([]));
    }, []);

    function nombreCircuito (id: number) {
        const circuito = circuitos.find((item) => item.idCircuitos === id);
        return circuito ? `Circuito ${id} (${circuito.distancia} m)` : `Circuito #${id}`;
    }

    function nombreKarting (id: number) {
        return kartings.find((karting) => karting.idKartings === id)?.modelo ?? `Kart #${id}`;
    }

    const vencimiento = licencia ? fechaLocal(licencia.fechaVencimiento) : null;
    const vigente = vencimiento !== null && vencimiento >= inicioDelDia(new Date());

    return (
        <div className="page">
            <div className="page-head">
                <div>
                    <p className="eyebrow">Mi cuenta</p>
                    <h1>Hola, {persona?.nombre}</h1>
                    <p className="sub">Tus próximas reservas, torneos y tu licencia.</p>
                    {error && <p className="error">No se pudieron cargar los datos: {error}</p>}
                </div>
                <Link className="btn" to="/reservar">Reservar karting</Link>
            </div>

            <div className="grid2">
                <section className="panel">
                    <div className="panel-head">
                        <h2>Próximas reservas</h2>
                        <Link className="link" to="/mi-cuenta/reservas">Ver historial →</Link>
                    </div>
                    <div className="rows">
                        {reservas.length === 0 && <p className="empty">No tenés reservas próximas.</p>}
                        {reservas.map((reserva) => (
                            <div className="row" key={reserva.idReservas}>
                                <time>{hora(reserva.horaInicio)}</time>
                                <div>
                                    {fechaCorta(reserva.fechaReserva)}
                                    <small>{nombreKarting(reserva.Kartings_idKartings)} · {nombreCircuito(reserva.Circuitos_idCircuitos)} · hasta {hora(reserva.horaFin)}</small>
                                </div>
                                <span className="mono">{reserva.monto !== undefined ? pesos(reserva.monto) : ""}</span>
                            </div>
                        ))}
                    </div>
                </section>
                <section className="panel">
                    <div className="panel-head"><h2>Mi licencia</h2></div>
                    {licencia && vencimiento ? (
                        <>
                            <dl className="lic">
                                <div><dt>Tipo</dt><dd>{licencia.tipo}</dd></div>
                                <div><dt>Emitida</dt><dd className="mono">{fechaCorta(licencia.fechaEmision)}</dd></div>
                                <div><dt>Vencimiento</dt><dd className="mono">{fechaCorta(vencimiento)}</dd></div>
                            </dl>
                            <div className="lic-pie">
                                <span className="small">Define qué karts y torneos podés usar</span>
                                <span className={`tag ${vigente ? "ok" : "bad"}`}>{vigente ? "Vigente" : "Vencida"}</span>
                            </div>
                        </>
                    ) : (
                        <p className="empty">Todavía no tenés licencia. Pedila en recepción para poder reservar.</p>
                    )}
                </section>
            </div>

            <section className="panel">
                <div className="panel-head">
                    <h2>Mis torneos</h2>
                    <Link className="link" to="/mi-cuenta/torneos">Ver historial →</Link>
                </div>
                <div className="rows">
                    {torneos.length === 0 && <p className="empty">No estás anotado en ningún torneo.</p>}
                    {torneos.map((torneo) => (
                        <div className="row" key={torneo.idTorneos}>
                            <time>{fechaCorta(torneo.fechaInicio).slice(0, -5)}</time>
                            <div>
                                <Link to={`/torneos/${torneo.idTorneos}`}>{torneo.nombre}</Link>
                                <small>Del {fechaCorta(torneo.fechaInicio)} al {fechaCorta(torneo.fechaFin)}</small>
                            </div>
                            <span className="tag ok">Anotado</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className="panel">
                <div className="panel-head"><h2>Próximas carreras de mis torneos</h2></div>
                <div className="rows">
                    {carreras.length === 0 && <p className="empty">No hay carreras próximas en tus torneos.</p>}
                    {carreras.map((carrera) => (
                        <div className="row" key={`${fechaCorta(carrera.fechaCarrera)}-${carrera.Torneos_idTorneos}-${carrera.Circuitos_idCircuitos}`}>
                            <time>{fechaCorta(carrera.fechaCarrera).slice(0, -5)}</time>
                            <div>
                                {torneos.find((torneo) => torneo.idTorneos === carrera.Torneos_idTorneos)?.nombre}
                                <small>{hora(carrera.horaInicio)} a {hora(carrera.horaFin)} · {nombreCircuito(carrera.Circuitos_idCircuitos)}</small>
                            </div>
                            <span />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default MiCuentaPage;
