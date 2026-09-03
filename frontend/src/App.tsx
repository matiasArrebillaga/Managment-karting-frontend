import "./App.css";

function App () {
  return (
    <div className="app-shell">
      <main className="main-content">
        <section className="home-content">
          <div className="home-copy">
            <p className="eyebrow">CENTRO ROSARIO</p>
            <h1>Tu próxima carrera empieza acá.</h1>
            <p className="subtitle">
              Reservá tu kart, organizá tus carreras y disfrutá la pista.
            </p>
            <button className="primary-button">Ver nuestras carreras</button>
          </div>
          <div className="home-mark" aria-hidden="true">K</div>
        </section>
        <section className="home-section fleet-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">LA FLOTA</p>
              <h2>Kartings listos para la pista</h2>
            </div>
            <p className="section-note">Seguridad, velocidad y diversión para todos los niveles.</p>
          </div>
          <div className="kart-grid">
            <article className="kart-card">
              <img src="https://loremflickr.com/900/600/go-kart?lock=1" alt="Kart en una pista" />
              <div className="kart-card-copy">
                <span className="card-label">KART 01 / ADULTOS</span>
                <h3>Raptor 200</h3>
                <p>Potencia y control para acelerar a fondo.</p>
                <strong className="availability">Disponible hoy</strong>
              </div>
            </article>
            <article className="kart-card">
              <img src="https://loremflickr.com/900/600/go-kart?lock=2" alt="Kart de competición en circuito" />
              <div className="kart-card-copy">
                <span className="card-label">KART 07 / COMPETICIÓN</span>
                <h3>Vortex Pro</h3>
                <p>Respuesta rápida para quienes buscan superarse.</p>
                <strong className="availability">Disponible hoy</strong>
              </div>
            </article>
            <article className="kart-card">
              <img src="https://loremflickr.com/900/600/karting?lock=3" alt="Karting en pista" />
              <div className="kart-card-copy">
                <span className="card-label">KART 12 / INICIACIÓN</span>
                <h3>Mini Sprint</h3>
                <p>La mejor forma de descubrir tu pasión por las carreras.</p>
                <strong className="availability">Disponible hoy</strong>
              </div>
            </article>
          </div>
        </section>
        <section className="home-section tracks-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">PISTAS ROSARIO</p>
              <h2>Elegí dónde correr</h2>
            </div>
            <button className="outline-button">Reservar una pista</button>
          </div>
          <div className="tracks-layout">
            <div className="track-feature">
              <img src="https://loremflickr.com/1200/800/go-kart-track?lock=4" alt="Pista de karting con curvas" />
              <div>
                <span className="card-label">LA MÁS ELEGIDA / HASTA 12 PERSONAS</span>
                <h3>Circuito Central</h3>
                <p>Curvas técnicas y rectas rápidas para compartir una carrera con amigos.</p>
              </div>
            </div>
            <div className="track-list-home">
              <div className="track-home-row"><span className="track-number">01</span><span><strong>Circuito Central</strong><small>Intermedio · 8 a 12 personas</small></span><i>→</i></div>
              <div className="track-home-row"><span className="track-number">02</span><span><strong>Pista Junior</strong><small>Inicial · Ideal para familias</small></span><i>→</i></div>
              <div className="track-home-row"><span className="track-number">03</span><span><strong>Desafío Pro</strong><small>Avanzado · Hasta 10 personas</small></span><i>→</i></div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
