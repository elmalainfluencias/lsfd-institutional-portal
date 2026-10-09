'use client';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { allArticles, sections } from '../lib/code';
import { LSFD_RANKS } from '../lib/ranks';
import { adminRequest, clearSession, createComplaint, getMyComplaints, getSession, login, requestAccount, type LsfdProfile } from '../lib/auth-client';
import HeroSlideshow from '../components/HeroSlideshow';

const discipline = [
  { type: 'Leve', color: 'slate', desc: 'Conductas que alteren el orden, la disciplina o el funcionamiento sin comprometer gravemente la seguridad o el servicio.', arts: '3' },
  { type: 'Grave', color: 'amber', desc: 'Acciones u omisiones que afecten significativamente la disciplina, cadena de mando, convivencia o ejecución del servicio.', arts: '4' },
  { type: 'Gravísima', color: 'red', desc: 'Conductas que comprometan la seguridad, vida, integridad física, ética profesional o prestigio del Departamento.', arts: '5' },
];
const sanctions = ['Amonestación verbal', 'Amonestación escrita', 'Suspensión temporal', 'Degradación de rango', 'Expulsión definitiva'];

export default function Home() {
  const [view, setView] = useState<'home' | 'code' | 'discipline' | 'procedure' | 'neutrality' | 'login' | 'signup' | 'dashboard'>('home');
  const [session, setSession] = useState(getSession());
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
  const openDashboard = () => { setView('dashboard'); scrollTop(); };
  const logout = () => { clearSession(); setSession(null); setView('home'); scrollTop(); };

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
      <button className="accountButton" onClick={session ? openDashboard : () => nav('login')}>{session ? session.profile.nombre_ic : 'ACCESO PERSONAL'}</button>
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
    {view === 'login' && <LoginView onLogin={(next) => { setSession(next); setView('dashboard'); scrollTop(); }} onSignup={() => { setView('signup'); scrollTop(); }} />}
    {view === 'signup' && <SignupView onBack={() => { setView('login'); scrollTop(); }} onDone={() => { setView('login'); scrollTop(); }} />}
    {view === 'dashboard' && session && <DashboardView session={session} onLogout={logout} />}

    <footer>
      <div className="footerBrand"><img src="/lsfd-logo.png" alt="LSFD" /><div><b>LOS SANTOS FIRE DEPARTMENT</b><span>Portal Normativo Institucional</span></div></div>
      <div className="footerDivision"><img src="/psd-logo.png" alt="PSD" /><span>Professional Standards Division</span></div>
      <div>Versión 1.1 · Revisado y actualizado en Octubre 2026</div>
    </footer>
  </main>;
}

function HomeView({ openCode, nav }: { openCode: (id?: string) => void; nav: (v: any) => void }) {
  return <>
    <HeroSlideshow />

    <section className="identitySection" id="identidad">
      <div className="identityIntro">
        <div className="eyebrow">QUIÉNES SOMOS</div>
        <h2>Una institución.<br /><em>Un compromiso.</em></h2>
        <p>Los Santos Fire Department es una institución dedicada a la respuesta ante emergencias, la protección de la vida y el servicio responsable a la comunidad de Los Santos.</p>
      </div>
      <div className="identityMission">
        <article className="identityBlock missionBlock"><span className="identityIndex">01 / MISIÓN</span><h3>Proteger y servir.</h3><p>Responder a emergencias con preparación, coordinación y profesionalismo; preservar la vida y los bienes, y actuar con responsabilidad, respeto y vocación de servicio.</p></article>
        <article className="identityBlock visionBlock"><span className="identityIndex">02 / VISIÓN</span><h3>Confianza en cada respuesta.</h3><p>Consolidar un departamento confiable, preparado y cercano a la comunidad, con personal capacitado, criterios claros y una cultura de mejora continua.</p></article>
        <article className="identityBlock valuesBlock"><span className="identityIndex">03 / VALORES</span><h3>La forma en que servimos.</h3><div className="identityValues"><span>Integridad</span><span>Disciplina</span><span>Trabajo en equipo</span><span>Preparación</span><span>Respeto</span><span>Compromiso</span></div></article>
      </div>
    </section>

    <section className="content">
      <div className="sectionHead"><div><div className="eyebrow">ACCESO RÁPIDO</div><h2>Marco institucional</h2></div><span className="muted">Consulta por título</span></div>
      <div className="cards">{sections.map((s, i) => <button className="card" key={s.id} onClick={() => openCode(s.id)}><span className="num">{String(i + 1).padStart(2, '0')}</span><div><h3>{s.title}</h3><p>{s.subtitle}</p><small>{s.range}</small></div><span className="arrow">↗</span></button>)}</div>
      <div className="feature">
        <div><div className="eyebrow">PRINCIPIO INSTITUCIONAL</div><h2>La disciplina protege<br />la operación.</h2><p>Las normas no solo establecen sanciones. Definen responsabilidades, protegen la cadena de mando y establecen criterios para actuar con seguridad y profesionalismo.</p></div>
        <div className="featureStats"><div><b>3</b><span>niveles de falta</span></div><div><b>5</b><span>sanciones principales</span></div><div><b>20</b><span>artículos de procedimiento</span></div></div>
      </div>
      <div className="notice"><div className="noticeIcon">✓</div><div><b>Numeración independiente por título</b><p>Cada título reinicia su numeración desde el Art. 1º. El Título II contiene 41 artículos tras la incorporación de las normas de neutralidad institucional y participación política.</p></div></div>
    </section>
  </>;
}

function CodeView({ query, setQuery, section, setSection }: { query: string; setQuery: (v: string) => void; section: string; setSection: (v: string) => void }) {
  const normalized = query.trim().toLowerCase();
  const visibleSections = useMemo(() => sections.filter(s => section === 'all' || s.id === section).map(s => ({ ...s, articles: normalized ? s.articles.filter(a => (`${a.n} ${a.text} ${a.tags?.join(' ')}`).toLowerCase().includes(normalized)) : s.articles })).filter(s => s.articles.length > 0), [section, normalized]);
  const resultCount = visibleSections.reduce((n, s) => n + s.articles.length, 0);

  return <section className="content page">
    <div className="pageTitle"><div><div className="eyebrow">DOCUMENTO NORMATIVO</div><h1>Código Disciplinario</h1><p>Versión 1.1 · Revisado y actualizado en Octubre 2026 · Los Santos Fire Department</p></div><div className="docMarks"><img src="/lsfd-logo.png" alt="LSFD" /><span>LSFD / CD-01</span></div></div>
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


function LoginView({ onLogin, onSignup }: { onLogin: (session: any) => void; onSignup: () => void }) {
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setError('');
    try { onLogin(await login(nombre, password)); } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.'); }
    finally { setBusy(false); }
  };
  return <section className="content page authPage"><div className="authCard"><div className="eyebrow">ÁREA DE PERSONAL · LSFD</div><h1>Acceso de personal</h1><p>Ingresa con tu nombre y la contraseña de tu cuenta aprobada.</p><form onSubmit={submit}><label>Nombre<input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre Apellido" autoComplete="username" required /></label><label>Contraseña<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" required /></label>{error && <div className="formError">{error}</div>}<button className="primary fullButton" disabled={busy}>{busy ? 'Ingresando…' : 'Ingresar'}</button></form><button className="linkButton" onClick={onSignup}>¿No tienes cuenta? Solicitar una</button></div></section>;
}

function SignupView({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const [nombre, setNombre] = useState(''); const [rango, setRango] = useState<string>(LSFD_RANKS[0]); const [password, setPassword] = useState(''); const [password2, setPassword2] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [done, setDone] = useState(false);
  const submit = async (e: FormEvent) => { e.preventDefault(); setError(''); if (password !== password2) { setError('Las contraseñas no coinciden.'); return; } setBusy(true); try { await requestAccount(nombre, rango, password); setDone(true); } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo enviar la solicitud.'); } finally { setBusy(false); } };
  if (done) return <section className="content page authPage"><div className="authCard successCard"><div className="successIcon">✓</div><div className="eyebrow">SOLICITUD ENVIADA</div><h1>Cuenta pendiente</h1><p>Tu solicitud fue recibida. Un administrador de LSFD debe aprobarla antes de que puedas ingresar al área de personal.</p><button className="primary fullButton" onClick={onDone}>Volver al acceso</button></div></section>;
  return <section className="content page authPage"><div className="authCard"><div className="eyebrow">REGISTRO · LSFD</div><h1>Solicitar acceso</h1><p>Para solicitar acceso al portal, completa los siguientes datos.</p><form onSubmit={submit}><label>Nombre<input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre Apellido" required /></label><label>Rango<select value={rango} onChange={e => setRango(e.target.value)} required>{LSFD_RANKS.map(rank => <option key={rank} value={rank}>{rank}</option>)}</select></label><label>Contraseña<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" minLength={8} required /></label><label>Repetir contraseña<input type="password" value={password2} onChange={e => setPassword2(e.target.value)} placeholder="Repite la contraseña" minLength={8} required /></label>{error && <div className="formError">{error}</div>}<button className="primary fullButton" disabled={busy}>{busy ? 'Enviando…' : 'Solicitar acceso'}</button></form><button className="linkButton" onClick={onBack}>← Volver al acceso</button></div></section>;
}

function DashboardView({ session, onLogout }: { session: any; onLogout: () => void }) {
  const [tab, setTab] = useState<'home'|'new'|'mine'|'requests'|'members'|'complaints'>('home'); const [complaints, setComplaints] = useState<any[]>([]); const [requests, setRequests] = useState<any[]>([]); const [members, setMembers] = useState<any[]>([]); const [adminComplaints, setAdminComplaints] = useState<any[]>([]); const [loading, setLoading] = useState(false); const [notice, setNotice] = useState(''); const [error, setError] = useState('');
  const isOwner = session.user.id === 'e3da3ae4-08b9-4427-b30d-07d11e5106a0'; const isAdmin = session.profile.rol === 'admin'; const canPsd = isAdmin || session.profile.rol === 'psd';
  const loadMine = async () => { setLoading(true); setError(''); try { setComplaints(await getMyComplaints()); } catch (e) { setError(e instanceof Error ? e.message : 'Error.'); } finally { setLoading(false); } };
  const loadAdmin = async () => { setLoading(true); setError(''); try { if (isAdmin) { const requestData = await adminRequest('/api/admin/requests','GET'); setRequests(requestData); const memberData = await adminRequest('/api/admin/members','GET'); setMembers(memberData.members || []); } if (canPsd) setAdminComplaints(await adminRequest('/api/admin/complaints','GET')); } catch(e) { setError(e instanceof Error ? e.message : 'Error.'); } finally { setLoading(false); } };
  useEffect(() => { if (tab === 'mine') loadMine(); if (tab === 'requests' || tab === 'members' || tab === 'complaints') loadAdmin(); }, [tab]);
  return <section className="content page dashboardPage"><div className="pageTitle"><div><div className="eyebrow">ÁREA INTERNA · LSFD</div><h1>Panel de personal</h1><p>{session.profile.nombre_ic} · {session.profile.rango}</p></div><button className="ghost" onClick={onLogout}>Cerrar sesión</button></div><div className="dashboardTabs"><button className={tab==='home'?'selected':''} onClick={()=>setTab('home')}>Inicio</button><button className={tab==='new'?'selected':''} onClick={()=>setTab('new')}>Presentar queja</button><button className={tab==='mine'?'selected':''} onClick={()=>setTab('mine')}>Mis quejas</button>{isAdmin&&<><button className={tab==='requests'?'selected':''} onClick={()=>setTab('requests')}>Solicitudes</button><button className={tab==='members'?'selected':''} onClick={()=>setTab('members')}>Personal</button></>}{canPsd&&<button className={tab==='complaints'?'selected':''} onClick={()=>setTab('complaints')}>Quejas · PSD</button>}</div>{notice&&<div className="formSuccess">{notice}</div>}{error&&<div className="formError">{error}</div>}{tab==='home'&&<div className="dashboardGrid"><div className="panel"><div className="eyebrow">CUENTA</div><h2>{session.profile.nombre_ic}</h2><p>Rango: <b>{session.profile.rango}</b></p><p>Estado: <b>Cuenta aprobada</b></p></div><div className="panel"><div className="eyebrow">CANAL INSTITUCIONAL</div><h2>Presentación de quejas</h2><p>Las quejas presentadas desde este panel quedan registradas para su tratamiento por PSD.</p><button className="textBtn" onClick={()=>setTab('new')}>Presentar una queja →</button></div></div>}{tab==='new'&&<ComplaintForm onDone={(msg)=>{setNotice(msg);setTab('mine');}} />}{tab==='mine'&&<ComplaintList items={complaints} loading={loading} />}{tab==='requests'&&<RequestList items={requests} loading={loading} refresh={loadAdmin} />}{tab==='members'&&<MemberList items={members} loading={loading} refresh={loadAdmin} canManageRoles={isOwner} />}{tab==='complaints'&&<AdminComplaintList items={adminComplaints} loading={loading} refresh={loadAdmin} />}</section>;
}

function ComplaintForm({ onDone }: { onDone: (msg:string)=>void }) { const [form,setForm]=useState({persona_denunciada:'',motivo:'',descripcion:'',fecha_hecho:''}); const [links,setLinks]=useState<string[]>(['']); const [files,setFiles]=useState<File[]>([]); const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const submit=async(e:FormEvent)=>{e.preventDefault();setBusy(true);setError('');try{const result=await createComplaint({...form,links:links.map(x=>x.trim()).filter(Boolean)}); for(const file of files){const session=getSession(); if(!session) throw new Error('Tu sesión expiró. Vuelve a iniciar sesión.'); const fd=new FormData(); fd.append('queja_id',result.id); fd.append('file',file); const upload=await fetch('/api/complaints/evidence',{method:'POST',headers:{Authorization:`Bearer ${session.access_token}`},body:fd}); const data=await upload.json(); if(!upload.ok) throw new Error(data.error||'No se pudo subir una de las imágenes.');} onDone('La queja fue presentada correctamente y quedó registrada.');}catch(err){setError(err instanceof Error?err.message:'No se pudo presentar la queja.');}finally{setBusy(false);}}; const addLink=()=>setLinks([...links,'']); return <div className="panel formPanel"><div className="eyebrow">PSD · PRESENTACIÓN FORMAL</div><h2>Presentar una queja</h2><p>Completa los datos de forma clara y objetiva. Puedes adjuntar imágenes o enlaces como evidencia.</p><form onSubmit={submit}><label>Persona denunciada<input required value={form.persona_denunciada} onChange={e=>setForm({...form,persona_denunciada:e.target.value})} placeholder="Nombre Apellido" /></label><label>Motivo<input required value={form.motivo} onChange={e=>setForm({...form,motivo:e.target.value})} placeholder="Motivo de la queja" /></label><label>Fecha del hecho<input type="date" value={form.fecha_hecho} onChange={e=>setForm({...form,fecha_hecho:e.target.value})} /></label><label>Descripción de los hechos<textarea required value={form.descripcion} onChange={e=>setForm({...form,descripcion:e.target.value})} placeholder="Describe lo ocurrido de manera objetiva." rows={7} /></label><div className="evidenceBox"><div className="evidenceTitle">EVIDENCIA</div><p>Adjunta imágenes o agrega enlaces que respalden la presentación.</p><label>Imágenes<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e=>setFiles(Array.from(e.target.files||[]).slice(0,8))} /></label>{files.length>0&&<small>{files.length} imagen(es) seleccionada(s). Máximo 8 MB por imagen.</small>}<label>Enlaces de evidencia</label>{links.map((link,i)=><div className="linkRow" key={i}><input type="url" value={link} onChange={e=>setLinks(links.map((x,j)=>j===i?e.target.value:x))} placeholder="https://imgur.com/..." /></div>)}{links.length<10&&<button type="button" className="ghost" onClick={addLink}>+ Agregar enlace</button>}</div>{error&&<div className="formError">{error}</div>}<button className="primary" disabled={busy}>{busy?'Enviando…':'Presentar queja'}</button></form></div>; }


function EvidenceBlock({ complaintId }: { complaintId: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    if (loaded) { setOpen(v => !v); return; }
    setOpen(true);
    setLoading(true);
    setError('');
    try {
      const session = getSession();
      if (!session) throw new Error('Tu sesión expiró. Vuelve a iniciar sesión.');
      const response = await fetch(`/api/complaints/evidence?complaintId=${encodeURIComponent(complaintId)}`, {
        headers: { Authorization: `Bearer ${session.access_token}` }, cache: 'no-store'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo cargar la evidencia.');
      setItems(data.items || []);
      setLoaded(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar la evidencia.');
    } finally { setLoading(false); }
  };

  return <div className="evidenceView">
    <button type="button" className="evidenceToggle" onClick={load} aria-expanded={open}>
      <span><b>Evidence</b>{loaded && items.length > 0 && <small>{items.length} elemento(s)</small>}</span>
      <strong>{open ? 'Ocultar ↑' : 'Ver evidencia →'}</strong>
    </button>
    {open && <div className="evidenceContent">
      {loading && <span className="evidenceMessage">Cargando evidencia…</span>}
      {error && <span className="evidenceMessage evidenceError">{error}</span>}
      {!loading && !error && loaded && !items.length && <span className="evidenceMessage">Esta queja no tiene evidencia adjunta.</span>}
      {!loading && !error && items.length > 0 && <div className="evidenceItems">{items.map((item:any) =>
        item.tipo === 'imagen'
          ? <a className="evidenceImage" href={item.url} target="_blank" rel="noreferrer" key={item.id}><img src={item.url} alt={item.nombre_archivo || 'Evidencia'} /><span>{item.nombre_archivo || 'Ver imagen'}</span></a>
          : <a className="evidenceLink" href={item.url} target="_blank" rel="noreferrer" key={item.id}>Abrir enlace de evidencia ↗</a>
      )}</div>}
    </div>}
  </div>;
}

function ComplaintList({ items, loading }: { items:any[]; loading:boolean }) { return <div className="panel"><div className="eyebrow">HISTORIAL PERSONAL</div><h2>Mis quejas</h2>{loading?<p>Cargando…</p>:items.length===0?<p>No tienes quejas presentadas.</p>:<div className="recordList">{items.map(x=><div className="record" key={x.id}><div><b>{x.motivo}</b><span>{x.persona_denunciada} · {x.fecha_hecho||'Fecha no indicada'}</span></div><strong className={`status status-${x.estado}`}>{x.estado.replace('_',' ')}</strong><p>{x.descripcion}</p><EvidenceBlock complaintId={x.id}/>{x.respuesta_psd&&<div className="response"><b>Respuesta PSD</b><p>{x.respuesta_psd}</p></div>}</div>)}</div>}</div>; }

function RequestList({ items, loading, refresh }: { items:any[]; loading:boolean; refresh:()=>void }) {
  const [selected,setSelected]=useState<any>(null);
  const [rank,setRank]=useState<string>(LSFD_RANKS[0]);
  const act=async(action:'approve'|'reject')=>{try{await adminRequest(action==='approve'?'/api/admin/approve':'/api/admin/reject','POST',action==='approve'?{id:selected.id,rango:rank}:{id:selected.id});setSelected(null);refresh();}catch(e){alert(e instanceof Error?e.message:'No se pudo actualizar.');}};
  return <div className="panel"><div className="eyebrow">ADMINISTRACIÓN</div><h2>Solicitudes pendientes</h2>{loading?<p>Cargando…</p>:items.length===0?<p>No hay solicitudes pendientes.</p>:<div className="recordList">{items.map(x=><div className="record requestRecord" key={x.id}><div><b>{x.nombre_ic}</b><span>Rango solicitado: {x.rango} · {new Date(x.created_at).toLocaleString('es-ES')}</span></div><div className="recordActions"><button className="primary smallButton" onClick={()=>{setSelected(x);setRank((LSFD_RANKS as readonly string[]).includes(x.rango) ? x.rango : LSFD_RANKS[0]);}}>Revisar</button><button className="dangerButton" onClick={()=>{setSelected(x);setRank((LSFD_RANKS as readonly string[]).includes(x.rango) ? x.rango : LSFD_RANKS[0]);}}>Rechazar</button></div></div>)}</div>}{selected&&<div className="modalBackdrop"><div className="modalCard"><div className="eyebrow">SOLICITUD DE ACCESO</div><h2>{selected.nombre_ic}</h2><p>Rango solicitado: <b>{selected.rango}</b></p><label>Rango asignado<select value={rank} onChange={e=>setRank(e.target.value)}>{LSFD_RANKS.map(r=><option key={r}>{r}</option>)}</select></label><div className="modalActions"><button className="ghost" onClick={()=>setSelected(null)}>Cancelar</button><button className="dangerButton" onClick={()=>act('reject')}>Rechazar</button><button className="primary" onClick={()=>act('approve')}>Aprobar cuenta</button></div></div></div>}</div>;
}

function MemberList({ items, loading, refresh, canManageRoles }: { items:any[]; loading:boolean; refresh:()=>void; canManageRoles:boolean }) {
  const [selected,setSelected]=useState<any>(null);
  const [rank,setRank]=useState<string>(LSFD_RANKS[0]);
  const [role,setRole]=useState<'miembro'|'psd'|'admin'>('miembro');
  const [savingRank,setSavingRank]=useState(false);
  const [savingRole,setSavingRole]=useState(false);
  const [modalNotice,setModalNotice]=useState('');

  const openMember=(member:any)=>{
    setSelected(member);
    setRank((LSFD_RANKS as readonly string[]).includes(member.rango) ? member.rango : LSFD_RANKS[0]);
    setRole(member.rol);
    setModalNotice('');
  };

  const edit=async()=>{
    if(!selected || savingRank) return;
    setSavingRank(true);
    setModalNotice('');
    try {
      await adminRequest('/api/admin/members','PATCH',{id:selected.id,rango:rank});
      setSelected((current:any)=>current ? {...current,rango:rank} : current);
      await Promise.resolve(refresh());
      setModalNotice('Rango actualizado correctamente.');
    } catch(e) {
      alert(e instanceof Error?e.message:'No se pudo actualizar el rango.');
    } finally { setSavingRank(false); }
  };

  const saveRole=async()=>{
    if(!selected || savingRole || role===selected.rol) return;
    setSavingRole(true);
    setModalNotice('');
    try {
      await adminRequest('/api/admin/members','PATCH',{id:selected.id,rol:role});
      setSelected((current:any)=>current ? {...current,rol:role} : current);
      await Promise.resolve(refresh());
      setModalNotice('Permisos actualizados correctamente.');
    } catch(e) {
      alert(e instanceof Error?e.message:'No se pudieron actualizar los permisos.');
    } finally { setSavingRole(false); }
  };

  const closeModal=()=>{
    if(savingRank || savingRole) return;
    setSelected(null);
    setModalNotice('');
  };

  return <div className="panel">
    <div className="eyebrow">ADMINISTRACIÓN</div>
    <h2>Personal</h2>
    <p>Administra los rangos asignados y consulta el estado de las cuentas.{canManageRoles?' Desde esta cuenta también puedes administrar los permisos del portal.':''}</p>
    {loading?<p>Cargando…</p>:items.length===0?<p>No hay miembros registrados.</p>:<div className="recordList">{items.map(x=><div className="record" key={x.id}>
      <div><b>{x.nombre_ic}</b><span>{x.rango} · {x.estado === 'aprobado' ? 'Cuenta aprobada' : x.estado === 'pendiente' ? 'Pendiente' : 'Rechazada'} · {x.rol==='admin'?'Administrador':x.rol==='psd'?'PSD':'Miembro'}</span></div>
      <div className="recordActions"><button type="button" className="primary smallButton" onClick={()=>openMember(x)}>Gestionar</button></div>
    </div>)}</div>}
    {selected&&<div className="modalBackdrop" onMouseDown={(event)=>{if(event.target===event.currentTarget) closeModal();}}>
      <div className="modalCard memberModal" role="dialog" aria-modal="true" aria-labelledby="member-modal-title">
        <div className="memberModalHeader">
          <div><div className="eyebrow">GESTIÓN DE PERSONAL</div><h2 id="member-modal-title">{selected.nombre_ic}</h2></div>
          <button type="button" className="modalClose" aria-label="Cerrar ventana" title="Cerrar ventana" onClick={closeModal} disabled={savingRank||savingRole}>×</button>
        </div>
        <p>Rango registrado: <b>{selected.rango}</b></p>
        <label>Nuevo rango<select value={rank} onChange={e=>setRank(e.target.value)}>{LSFD_RANKS.map(r=><option key={r} value={r}>{r}</option>)}</select></label>
        <div className="modalActions">
          <button type="button" className="ghost" onClick={closeModal} disabled={savingRank||savingRole}>Cerrar</button>
          <button type="button" className="primary" disabled={savingRank || rank===selected.rango} onClick={edit}>{savingRank?'Guardando rango…':'Guardar rango'}</button>
        </div>
        {canManageRoles&&<>
          <div className="dividerLine"/>
          <div className="eyebrow">PERMISOS DEL PORTAL · SOLO ADMINISTRADOR PRINCIPAL</div>
          <label>Rol de acceso<select value={role} onChange={e=>setRole(e.target.value as 'miembro'|'psd'|'admin')}><option value="miembro">Miembro</option><option value="psd">PSD</option><option value="admin">Administrador</option></select></label>
          <p className="muted">Cambiar el rol no modifica el rango IC. No puedes modificar los permisos de la cuenta propietaria.</p>
          <div className="modalActions">
            <button type="button" className="primary" disabled={savingRole || role===selected.rol} onClick={saveRole}>{savingRole?'Guardando permisos…':'Guardar permisos'}</button>
          </div>
        </>}
        {modalNotice&&<div className="formSuccess memberModalNotice" role="status">{modalNotice}</div>}
      </div>
    </div>}
  </div>;
}

const COMPLAINT_STATUSES = [
  ['pendiente','Pendientes'],
  ['en_revision','En revisión'],
  ['resuelta','Gestionadas'],
  ['rechazada','Rechazadas'],
] as const;

function AdminComplaintList({ items, loading, refresh }: { items:any[]; loading:boolean; refresh:()=>void }) {
  const [selected,setSelected]=useState<any>(null);
  const [response,setResponse]=useState('');
  const [filter,setFilter]=useState<'pendiente'|'en_revision'|'resuelta'|'rechazada'>('pendiente');
  const [updating,setUpdating]=useState(false);

  const filtered = items.filter(x => x.estado === filter);

  const update=async(estado:'en_revision'|'resuelta'|'rechazada')=>{
    if (!selected || updating) return;
    setUpdating(true);
    try {
      await adminRequest('/api/admin/complaints','POST',{id:selected.id,estado,respuesta_psd:response.trim() || null});
      const changed = { ...selected, estado, respuesta_psd: response.trim() || null, updated_at: new Date().toISOString() };
      setSelected(null);
      setResponse('');
      setFilter(estado);
      // Actualización inmediata para que una queja no siga apareciendo en la sección anterior.
      refresh();
      void changed;
    } catch(e) {
      alert(e instanceof Error?e.message:'No se pudo actualizar la queja.');
    } finally { setUpdating(false); }
  };

  const filterLabels = COMPLAINT_STATUSES;
  const selectedIsFinal = selected && (selected.estado === 'resuelta' || selected.estado === 'rechazada');

  return <div className="panel">
    <div className="eyebrow">PROFESSIONAL STANDARDS DIVISION</div>
    <h2>Quejas recibidas</h2>
    <p className="panelIntro">Consulta y gestiona las presentaciones según su estado. Cada sección contiene únicamente las quejas correspondientes a ese estado.</p>
    <div className="complaintFilters" role="tablist" aria-label="Estado de las quejas">
      {filterLabels.map(([value,label]) => {
        const count = items.filter(x => x.estado === value).length;
        return <button key={value} type="button" role="tab" aria-selected={filter===value} className={filter===value?'selected':''} onClick={()=>setFilter(value)}>
          {label}<span>{count}</span>
        </button>;
      })}
    </div>
    {loading?<p>Cargando…</p>:filtered.length===0?<div className="emptyState"><b>No hay quejas en este apartado.</b><span>Las que cambien de estado aparecerán automáticamente en su sección correspondiente.</span></div>:<div className="recordList">{filtered.map(x=><div className="record complaintRecord" key={x.id}>
      <div><b>{x.motivo}</b><span>Presentada por {x.profiles?.nombre_ic||'—'} · Contra {x.persona_denunciada}</span></div>
      <strong className={`status status-${x.estado}`}>{x.estado==='pendiente'?'Pendiente':x.estado==='en_revision'?'En revisión':x.estado==='resuelta'?'Gestionada':'Rechazada'}</strong>
      <p>{x.descripcion}</p>
      <EvidenceBlock complaintId={x.id}/>
      {x.respuesta_psd && <div className="response"><b>Respuesta PSD</b><p>{x.respuesta_psd}</p></div>}
      <button className="textBtn" onClick={()=>{setSelected(x);setResponse(x.respuesta_psd||'')}}>{x.estado==='pendiente'?'Gestionar →': x.estado==='en_revision'?'Continuar gestión →':'Ver gestión →'}</button>
    </div>)}</div>}
    {selected&&<div className="modalBackdrop"><div className="modalCard">
      <div className="eyebrow">GESTIÓN DE QUEJA</div>
      <h2>{selected.motivo}</h2>
      <div className="managementMeta"><span>Presentada por <b>{selected.profiles?.nombre_ic||'—'}</b></span><span>Contra <b>{selected.persona_denunciada}</b></span><span>Estado <b>{selected.estado==='pendiente'?'Pendiente':selected.estado==='en_revision'?'En revisión':selected.estado==='resuelta'?'Gestionada':'Rechazada'}</b></span></div>
      <div className="managementDescription"><b>Descripción</b><p>{selected.descripcion}</p></div>
      <EvidenceBlock complaintId={selected.id}/>
      <label>Respuesta PSD<textarea rows={5} value={response} onChange={e=>setResponse(e.target.value)} disabled={selectedIsFinal || updating} placeholder="Deja constancia de la gestión realizada." /></label>
      <div className="modalActions">
        <button className="ghost" onClick={()=>setSelected(null)} disabled={updating}>Cerrar</button>
        {!selectedIsFinal && selected.estado==='pendiente' && <button className="primary" onClick={()=>update('en_revision')} disabled={updating}>{updating?'Guardando…':'Tomar en revisión'}</button>}
        {!selectedIsFinal && selected.estado==='en_revision' && <button className="primary" onClick={()=>update('resuelta')} disabled={updating}>{updating?'Guardando…':'Marcar como gestionada'}</button>}
        {!selectedIsFinal && <button className="dangerButton" onClick={()=>update('rechazada')} disabled={updating}>{updating?'Guardando…':'Rechazar'}</button>}
      </div>
    </div></div>}
  </div>;
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
    <div className="neutralHero"><div className="neutralLogos"><img src="/lsfd-logo.png" alt="LSFD" /><span>+</span><img src="/psd-logo.png" alt="PSD" /></div><div className="eyebrow">NORMATIVA VIGENTE · TÍTULO II</div><h1>Neutralidad institucional</h1><p>Un marco específico para proteger la independencia, imagen y representación de LSFD frente a actividades partidarias.</p></div>
    <div className="warning"><b>Situación actual</b><p>El Código vigente contiene disposiciones relacionadas con imagen, comunicaciones, instalaciones y prestigio institucional, pero no establece una prohibición expresa y autónoma sobre la utilización partidaria de LSFD.</p></div>
    <div className="twoCol"><div className="panel"><div className="eyebrow">ARTÍCULOS RELACIONADOS</div><h2>Marco vigente</h2>{related.map(([id, n]) => { const s = sections.find(x => x.id === id)!; const a = s.articles.find(x => x.n === n)!; return <div className="related" key={`${id}-${n}`}><b>{s.title} · Art. {n}º</b><p>{a.text}</p></div>; })}</div><div className="panel proposal"><div className="eyebrow">NORMATIVA VIGENTE · TÍTULO II</div><h2>Neutralidad institucional</h2><p><b>Art. 30º — Neutralidad institucional.</b> LSFD mantendrá estricta neutralidad respecto de partidos políticos, organizaciones partidarias, candidaturas y actividades de carácter electoral o proselitista.</p><p>Queda prohibido utilizar el nombre, imagen, instalaciones, vehículos, uniformes, recursos, personal o representación institucional de LSFD para promover, respaldar, favorecer o asociar al Departamento con cualquier partido político, candidato u organización partidaria, salvo actividades oficiales de carácter institucional que cuenten con autorización expresa de la autoridad competente.</p><p><b>Art. 31º — Participación política y representación institucional.</b> Ningún miembro podrá utilizar su rango, cargo, uniforme o condición de funcionario para expresar apoyo institucional a partidos políticos, candidatos u organizaciones partidarias.</p></div></div>
  </section>;
}
