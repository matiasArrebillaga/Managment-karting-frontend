import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCircuitos } from "../services/circuitoService";
import { getKartings } from "../services/kartingService";
import { getTiposKarting } from "../services/tipoKartingService";
import { getTorneos } from "../services/torneoService";
import type { TipoKarting } from "../types";
import fotoCircuito from "../assets/inicio/circuito.jpg";
import fotoKart from "../assets/inicio/kart.jpg";
import fotoTorneo from "../assets/inicio/torneo.jpg";

type Datos = { circuitos: number; kartings: number; torneos: number };

function InicioPage () {
    const { persona } = useAuth();
    const [datos, setDatos] = useState<Datos | null>(null);
    const [tipos, setTipos] = useState<TipoKarting[]>([]);

    // los endpoints piden sesión: sin sesión o si fallan, la página se muestra sin números
    useEffect(() => {
        if (!persona) return;
        Promise.allSettled([getCircuitos(), getKartings(), getTorneos(), getTiposKarting()])
            .then(([circuitos, kartings, torneos, tiposKarting]) => {
                if (circuitos.status === "fulfilled" && kartings.status === "fulfilled" && torneos.status === "fulfilled") {
                    setDatos({ circuitos: circuitos.value.length, kartings: kartings.value.length, torneos: torneos.value.length });
                }
                if (tiposKarting.status === "fulfilled") {
                    setTipos([...tiposKarting.value].sort((a, b) => a.precioHora - b.precioHora));
                }
            });
    }, [persona]);

    const destino = (ruta: string) => (persona ? ruta : "/login");

    return (
        <div className="page">
            <section className="intro">
                <figure className="photo ancha">
                    <img src={fotoCircuito} alt="Karts recorriendo una curva del circuito" />
                </figure>
                <div className="intro-texto">
                    <p className="eyebrow">Karting en Rosario</p>
                    <h1>Kart Control</h1>
                    <p>
                        Somos un centro de karting con circuitos propios y una flota de kartings para todas las edades.
                        Podés venir a correr un rato con amigos, practicar para mejorar tus tiempos o competir en nuestros torneos.
                    </p>
                    <p>
                        Reservás online, elegís el circuito y el karting, y pagás según el tiempo que corras.
                    </p>
                    {datos && (
                        <div className="datos">
                            <div><b>{datos.circuitos}</b><span>circuitos</span></div>
                            <div><b>{datos.kartings}</b><span>kartings</span></div>
                            <div><b>{datos.torneos}</b><span>torneos</span></div>
                        </div>
                    )}
                </div>
            </section>

            <div className="features">
                <article className="panel feature">
                    <figure className="photo"><img src={fotoKart} alt="Piloto con casco en un kart de competición" /></figure>
                    <div className="feature-body">
                        <h2>Kartings para cada nivel</h2>
                        <div className="feature-texto">
                            <p>
                                Tenemos kartings de iniciación para quienes corren por primera vez, modelos para adultos y kartings de competición.
                                Cada tipo pide una licencia mínima, así todos corren con un kart acorde a su experiencia.
                            </p>
                            {tipos.length > 0 && (
                                <ul>
                                    {tipos.map((tipo) => (
                                        <li key={tipo.idTiposKarting}>
                                            <span>{tipo.nombre}</span>
                                            <span>${tipo.precioHora.toLocaleString("es-AR")}/h</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <Link className="btn" to={destino("/reservar")}>Reservar karting</Link>
                    </div>
                </article>
                <article className="panel feature">
                    <figure className="photo"><img src={fotoTorneo} alt="Bandera a cuadros al paso de un kart" /></figure>
                    <div className="feature-body">
                        <h2>Torneos durante todo el año</h2>
                        <div className="feature-texto">
                            <p>
                                Organizamos torneos con varias fechas en nuestros circuitos. En cada carrera sumás puntos según tu posición final
                                y la tabla general define al campeón. Cada torneo tiene cupo limitado y una licencia mínima para anotarse.
                            </p>
                        </div>
                        <Link className="btn" to={destino("/torneos")}>Reservar torneo</Link>
                    </div>
                </article>
            </div>
            <p className="creditos">
                Fotos: Wikimedia Commons. Circuito y kart, dominio público (CC0). Bandera a cuadros, Christine Matthews, CC BY-SA 2.0.
            </p>
        </div>
    );
}

export default InicioPage;
