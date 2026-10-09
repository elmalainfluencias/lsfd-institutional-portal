'use client';

import { useEffect, useState } from 'react';
import './HeroSlideshow.css';

const slides = [
  { src: '/hero/lsfd-scene-01.png', alt: 'Unidades de emergencia del LSFD en una intervención nocturna' },
  { src: '/hero/lsfd-scene-02.png', alt: 'Camión de bomberos del LSFD en una escena urbana nocturna' },
  { src: '/hero/lsfd-scene-03.png', alt: 'Actividad institucional del LSFD junto a otros servicios de emergencia' },
];

export default function HeroSlideshow() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setActive(current => (current + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [paused]);

  const previous = () => setActive(current => (current - 1 + slides.length) % slides.length);
  const next = () => setActive(current => (current + 1) % slides.length);

  return (
    <section className="heroSlideshow" aria-label="Galería institucional LSFD" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false); }}>
      {slides.map((slide, index) => (
        <div className={`heroSlide${active === index ? ' isActive' : ''}`} key={slide.src} aria-hidden={active !== index}>
          <img src={slide.src} alt={slide.alt} loading={index === 0 ? 'eager' : 'lazy'} />
        </div>
      ))}
      <div className="heroShade" />
      <div className="heroSlideshowContent">
        <div className="heroBrand"><img src="/lsfd-logo.png" alt="" /><div><span>LOS SANTOS FIRE DEPARTMENT</span><b>SERVICIO · PREPARACIÓN · COMPROMISO</b></div></div>
        <div className="eyebrow heroKicker">DEPARTAMENTO DE BOMBEROS DE LOS SANTOS</div>
        <h1>Al servicio de<br /><em>Los Santos.</em></h1>
        <p>Preparados para responder, comprometidos con la comunidad y unidos por el deber de proteger la vida.</p>
        <div className="heroActions"><a className="primary heroLink" href="#identidad">Conoce nuestra misión <span>→</span></a><span className="heroSecondaryLabel">PORTAL INSTITUCIONAL · LSFD</span></div>
      </div>
      <div className="heroSlideControls">
        <button type="button" onClick={previous} aria-label="Fotografía anterior">‹</button>
        <div className="heroDots" aria-label="Seleccionar fotografía">{slides.map((slide, index) => <button type="button" key={slide.src} className={active === index ? 'active' : ''} onClick={() => setActive(index)} aria-label={`Mostrar fotografía ${index + 1}`} aria-pressed={active === index} />)}</div>
        <span className="heroSlideCount">0{active + 1} <i>/</i> 0{slides.length}</span>
        <button type="button" onClick={next} aria-label="Fotografía siguiente">›</button>
      </div>
    </section>
  );
}
