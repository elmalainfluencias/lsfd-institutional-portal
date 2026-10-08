'use client';
import { useEffect, useMemo, useState } from 'react';
import { allArticles, sections } from '../lib/code';

const discipline = [
  { type: 'Leve', color: 'slate', desc: 'Conductas que alteren el orden, la disciplina o el funcionamiento sin comprometer gravemente la seguridad o el servicio.', arts: '3' },
  { type: 'Grave', color: 'amber', desc: 'Acciones u omisiones que afecten significativamente la disciplina, cadena de mando, convivencia o ejecución del servicio.', arts: '4' },
  { type: 'Gravísima', color: 'red', desc: 'Conductas que comprometan la seguridad, vida, integridad física, ética profesional o prestigio del Departamento.', arts: '5' },
];
const sanctions = ['Amonestación verbal', 'Amonestación escrita', 'Suspensión temporal', 'Degradación de rango', 'Expulsión definitiva'];

export default function Home() {
  const [view, setView] = useState<'home' | 'code' | 'discipline' | 'procedure' | 'neutrality'>('home');
  const [query, setQuery] = useState('');
  const [section, setSection] = useState('all');
  const [darkMode, setDarkMode] = useState(false);
  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem('lsfd-theme');
    const initialDark = saved === 'dark';
    setDarkMode(initialDark);
    document.documentElement.dataset.theme = initialDark ? 'dark' : 'light';
    setThemeReady(true);
  }, []);

  useEffect(() => {
    if (!themeReady) return;
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
    window.localStorage.setItem('lsfd-theme', darkMode ? 'dark' : 'light');
  }, [darkMode, themeReady]);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const nav = (v: typeof view) => { setView(v); scrollTop(); };
  const openCode = (id = 'all') => { setSection(id); setQuery(''); setView('code'); scrollTop(); };

  return <main>
    <header className="topbar">
      <div className="brand" onClick={() => nav('home')}>
        <img src="/lsfd-logo.png" alt="Los Santos Fire Department" className="brandLogo" />
        <div><strong>LOS SANTOS</strong><span>FIRE DEPARTMENT</span></div>
      </div>
      <nav>
        <button className={view === 'home' ? 'active' : ''} onClick={() => nav('home')}>Inicio</button>
        <button className={view === 'code' ? 'active' : ''} onClick={() => nav('code')}>Código</button>
        <button className={view === 'discipline' ? 'active' : ''} onClick={() => nav('discipline')}>Disciplina</button>
        <button className={view === 'procedure' ? 'active' : ''} onClick={() => nav('procedure')}>Procedimientos</button>
        <button className={view === 'neutrality' ? 'active' : ''} onClick={() => nav('neutrality')}>Neutralidad</button>
      </nav>
      <div className="divisionMark">
        <img src="/psd-logo.png" alt="Professional Standards Division" />
        <span>PSD</span>
      </div>
      <button className="themeToggle" onClick={() => setDarkMode(v => !v)} aria-label={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'} title={darkMode ? 'Modo claro' : 'Modo oscuro'}>
        <span aria-hidden="true">{darkMode ? '☼' : '☾'}</span>
        <b>{darkMode ? 'CLARO' : 'OSCURO'}</b>
      </button>
      <div className="status"><i /> VIGENTE</div>
    </header>

    {view === 'home' && <HomeView openCode={openCode} nav={nav} />}
    {view === 'code' && <CodeView query={query} setQuery={setQuery} section={section} setSection={setSection} />}
    {view === 'discipline' && <DisciplineView nav={nav} />}
    {view === 'procedure' && <ProcedureView />}
    {view === 'neutrality' && <NeutralityView />}

    <footer>
      <div className="footerBrand"><img src="/lsfd-logo.png" alt="LSFD" /><div><b>LOS SANTOS FIRE DEPARTMENT</b><span>Portal Normativo Institucional</span></div></div>
      <div className="footerDivision"><img src="/psd-logo.png" alt="PSD" /><span>Professional Standards Division</span></div>
      <div>Versión 1.0 · Revisado en Abril 2026</div>
    </footer>
  </main>;
}

function HomeView({ openCode, nav }: { openCode: (id?: string) => void; nav: (v: any) => void }) {
  return <>
    <section className="hero">
      <div className="heroBrand"><img src="/lsfd-logo.png" alt="LSFD" /><div><span>LOS SANTOS FIRE DEPARTMENT</span><b>PORTAL NORMATIVO</b></div></div>
      <div className="eyebrow">PORTAL INSTITUCIONAL · LSFD</div>
      <h1>Normativa, disciplina<br /><em>y profesionalismo.</em></h1>
      <p>Centro de consulta del marco disciplinario, operativo y administrativo de Los Santos Fire Department.</p>
      <div className="heroActions"><button className="primary" onClick={() => openCode()}>Consultar Código <span>→</span></button><button className="ghost" onClick={() => nav('discipline')}>Régimen disciplinario</button></div>
      <div className="heroMeta"><span><b>1.0</b> Versión vigente</span><span><b>159</b> artículos</span><span><b>VII</b> títulos</span></div>
    </section>

    <section className="content">
      <div className="sectionHead"><div><div className="eyebrow">ACCESO RÁPIDO</div><h2>Marco institucional</h2></div><span className="muted">Consulta por título</span></div>
      <div className="cards">{sections.map((s, i) => <button className="card" key={s.id} onClick={() => openCode(s.id)}><span className="num">{String(i + 1).padStart(2, '0')}</span><div><h3>{s.title}</h3><p>{s.subtitle}</p><small>{s.range}</small></div><span className="arrow">↗</span></button>)}</div>
      <div className="feature">
        <div><div className="eyebrow">PRINCIPIO INSTITUCIONAL</div><h2>La disciplina protege<br />la operación.</h2><p>Las normas no solo establecen sanciones. Definen responsabilidades, protegen la cadena de mando y establecen criterios para actuar con seguridad y profesionalismo.</p></div>
        <div className="featureStats"><div><b>3</b><span>niveles de falta</span></div><div><b>5</b><span>sanciones principales</span></div><div><b>20</b><span>artículos de procedimiento</span></div></div>
      </div>
      <div className="notice"><div className="noticeIcon">✓</div><div><b>Numeración independiente por título</b><p>Cada título reinicia su numeración desde el Art. 1º. El Título II contiene 39 artículos debido al salto existente en el documento original entre sus artículos 34º y 36º.</p></div></div>
    </section>
  </>;
}

function CodeView({ query, setQuery, section, setSection }: { query: string; setQuery: (v: string) => void; section: string; setSection: (v: string) => void }) {
  const normalized = query.trim().toLowerCase();
  const visibleSections = useMemo(() => sections.filter(s => section === 'all' || s.id === section).map(s => ({ ...s, articles: normalized ? s.articles.filter(a => (`${a.n} ${a.text} ${a.tags?.join(' ')}`).toLowerCase().includes(normalized)) : s.articles })).filter(s => s.articles.length > 0), [section, normalized]);
  const resultCount = visibleSections.reduce((n, s) => n + s.articles.length, 0);

  return <section className="content page">
    <div className="pageTitle"><div><div className="eyebrow">DOCUMENTO NORMATIVO</div><h1>Código Disciplinario</h1><p>Versión 1.0 · Revisado en Abril 2026 · Los Santos Fire Department</p></div><div className="docMarks"><img src="/lsfd-logo.png" alt="LSFD" /><span>LSFD / CD-01</span></div></div>
    <div className="search"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar artículo, término o contenido…" />{query && <button className="clearSearch" onClick={() => setQuery('')}>×</button>}</div>
    <div className="filters"><button className={section === 'all' ? 'selected' : ''} onClick={() => setSection('all')}>Todos</button>{sections.map(s => <button key={s.id} className={section === s.id ? 'selected' : ''} onClick={() => setSection(s.id)}>{s.title.replace('Título ', 'T. ')}</button>)}</div>

    {query && <div className="resultCount">{resultCount} {resultCount === 1 ? 'artículo encontrado' : 'artículos encontrados'}</div>}

    <div className="legalDocument">
      {visibleSections.map(s => <section className="legalChapter" id={s.id} key={s.id}>
        <div className="legalChapterHead"><div><span>{s.title}</span><h2>{s.subtitle}</h2></div><small>{s.articles.length} {s.articles.length === 1 ? 'artículo' : 'artículos'} · {s.range}</small></div>
        <div className="legalArticles">
          {s.articles.map(a => <article className="legalArticle" key={`${s.id}-${a.n}`}><div className="articleLabel">ART. {a.n}º</div><p>{a.text}</p></article>)}
        </div>
      </section>)}
      {visibleSections.length === 0 && <div className="emptyState"><b>No se encontraron artículos.</b><span>Probá con otro término de búsqueda.</span></div>}
    </div>
  </section>;
}

function DisciplineView({ nav }: { nav: (v: any) => void }) {
  return <section className="content page">
    <div className="pageTitle"><div><div className="eyebrow">TÍTULO V · NUMERACIÓN INTERNA</div><h1>Régimen disciplinario</h1><p>Clasificación de faltas, circunstancias y sanciones.</p></div><div className="divisionHeader"><img src="/psd-logo.png" alt="Professional Standards Division" /><div><b>PSD</b><span>Professional Standards Division</span></div></div></div>
    <div className="disciplineGrid">{discipline.map(d => <div className={`level ${d.color}`} key={d.type}><div className="levelTop"><span>{d.type}</span><b>Art. {d.arts}º</b></div><h2>Falta {d.type.toLowerCase()}</h2><p>{d.desc}</p></div>)}</div>
    <div className="twoCol"><div className="panel"><div className="eyebrow">ART. 11º · TÍTULO V</div><h2>Sanciones aplicables</h2>{sanctions.map((s, i) => <div className="sanction" key={s}><span>0{i + 1}</span><b>{s}</b></div>)}</div><div className="panel"><div className="eyebrow">CRITERIOS</div><h2>Proporcionalidad</h2><p>Las sanciones deben considerar la gravedad de la falta, circunstancias del hecho e historial del funcionario.</p><div className="criterion"><b>Atenuantes</b><span>Art. 7º · Título V</span><p>Conducta anterior, colaboración, reconocimiento y reparación.</p></div><div className="criterion"><b>Agravantes</b><span>Art. 8º · Título V</span><p>Intencionalidad, premeditación, abuso de autoridad, ocultamiento y perjuicio.</p></div><button className="textBtn" onClick={() => nav('procedure')}>Ver procedimiento disciplinario →</button></div></div>
  </section>;
}

function ProcedureView() {
  return <section className="content page">
    <div className="pageTitle"><div><div className="eyebrow">TÍTULO VI · NUMERACIÓN INTERNA</div><h1>Procedimiento disciplinario</h1><p>Ruta institucional desde el conocimiento del hecho hasta la resolución y apelación.</p></div><div className="divisionHeader"><img src="/psd-logo.png" alt="Professional Standards Division" /><div><b>PSD</b><span>Professional Standards Division</span></div></div></div>
    <div className="timeline">{[['01', 'Inicio', 'Denuncia formal, informe de superior o actuación de oficio.', 'Art. 2º'], ['02', 'Investigación', 'Designación de investigador o comisión y recopilación de antecedentes.', 'Arts. 3–6º'], ['03', 'Determinación', 'Se establece la existencia o inexistencia de responsabilidad.', 'Arts. 7–8º'], ['04', 'Resolución', 'La autoridad competente emite un fallo fundado.', 'Arts. 9–10º'], ['05', 'Defensa y apelación', 'Descargos y recurso ante una instancia superior.', 'Arts. 11–13º'], ['06', 'Registro', 'Archivo seguro y registro histórico disciplinario.', 'Arts. 15–20º']].map(x => <div className="step" key={x[0]}><div className="stepNo">{x[0]}</div><div><span>{x[3]}</span><h2>{x[1]}</h2><p>{x[2]}</p></div></div>)}</div>
    <div className="due"><b>Garantías del funcionario</b><span>Debido proceso · Presunción de inocencia · Derecho a defensa · Imparcialidad</span></div>
  </section>;
}

function NeutralityView() {
  const related: [string, number][] = [
    ['general', 8],
    ['ethics', 19],
    ['ethics', 28],
    ['ethics', 29],
    ['ethics', 30],
  ];
  return <section className="content page">
    <div className="neutralHero"><div className="neutralLogos"><img src="/lsfd-logo.png" alt="LSFD" /><span>+</span><img src="/psd-logo.png" alt="PSD" /></div><div className="eyebrow">NORMATIVA COMPLEMENTARIA · PROPUESTA</div><h1>Neutralidad institucional</h1><p>Un marco específico para proteger la independencia, imagen y representación de LSFD frente a actividades partidarias.</p></div>
    <div className="warning"><b>Situación actual</b><p>El Código vigente contiene disposiciones relacionadas con imagen, comunicaciones, instalaciones y prestigio institucional, pero no establece una prohibición expresa y autónoma sobre la utilización partidaria de LSFD.</p></div>
    <div className="twoCol"><div className="panel"><div className="eyebrow">ARTÍCULOS RELACIONADOS</div><h2>Marco vigente</h2>{related.map(([id, n]) => { const s = sections.find(x => x.id === id)!; const a = s.articles.find(x => x.n === n)!; return <div className="related" key={`${id}-${n}`}><b>{s.title} · Art. {n}º</b><p>{a.text}</p></div>; })}</div><div className="panel proposal"><div className="eyebrow">PROPUESTA</div><h2>Artículo de neutralidad</h2><p><b>Neutralidad institucional.</b> LSFD mantendrá estricta neutralidad respecto de partidos políticos, organizaciones partidarias, candidaturas y actividades de carácter electoral o proselitista.</p><p>Queda prohibido utilizar el nombre, imagen, instalaciones, vehículos, uniformes, recursos, personal o representación institucional de LSFD para promover, respaldar, favorecer o asociar al Departamento con cualquier partido político, candidato u organización partidaria, salvo actividades oficiales de carácter institucional que cuenten con autorización expresa de la autoridad competente.</p><p>Ningún miembro podrá utilizar su rango, cargo, uniforme o condición de funcionario para expresar apoyo institucional a partidos políticos, candidatos u organizaciones partidarias.</p></div></div>
  </section>;
}
