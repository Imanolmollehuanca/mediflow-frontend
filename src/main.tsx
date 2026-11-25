import {useState,useEffect} from 'react'
import {createRoot} from 'react-dom/client'
import {BrowserRouter,Routes,Route,Link,NavLink,useNavigate,useLocation} from 'react-router-dom'
import {modules,display,type Row} from './catalog'
import {api,session,token,claims,useQuery} from './api'
import {Form} from './Form'
import {Records,Panel} from './Records'
import './style.css'

function Availability(){
 const [query,set]=useState(''),[version,refresh]=useState(0)
 const data=useQuery<Row[]>(query?'Schedules/availability?'+query:null,version)
 const go=useNavigate()
 return <><p className="over">Agenda</p><h1>Disponibilidad</h1><section className="card pad"><h2>Buscar un turno</h2><Form fields="doctorId date" submit="Consultar disponibilidad" save={async b=>{set(new URLSearchParams({doctorId:String(b.doctorId),date:String(b.date)}).toString());refresh(n=>n+1)}} onDone={()=>{}}/></section>
 {query&&<section className="card pad"><h2>Turnos disponibles</h2>{!data.data?<Panel error={data.error}/>:!data.data.length?<p>Sin turnos disponibles en esta fecha.</p>:<div className="slots">{data.data.map(r=><article key={String(r.startDateTime)}><strong>{display('startDateTime',r.startDateTime)}</strong><p>{r.slotDurationMinutes} min · Consultorios {display('roomIds',r.roomIds)||'—'}</p><button onClick={()=>go('/Appointments',{state:{appointment:r}})}>Programar cita</button></article>)}</div>}</section>}</>
}
function Dashboard(){
 const [v,refresh]=useState(0)
 const patients=useQuery<Row[]>('Patients',v),doctors=useQuery<Row[]>('Doctors',v),appointments=useQuery<Row[]>('Appointments',v)
 const upcoming=appointments.data?.filter(a=>['Scheduled','Confirmed'].includes(String(a.status))&&Date.parse(String(a.startDateTime))>=Date.now()).sort((a,b)=>String(a.startDateTime).localeCompare(String(b.startDateTime))).slice(0,6)
 function person(rows:Row[]|undefined,k:string,id:Row[string]){const r=rows?.find(p=>p[k]===id);return r?[r.firstName,r.lastName].join(' '):'#'+id}
 return <><div className="heading"><div><p className="over">Panel de control</p><h1>Resumen clínico</h1></div><button onClick={()=>refresh(n=>n+1)}>Actualizar</button></div>
 <section className="hero"><div><h2>Agenda de atención</h2><p>Consulta los horarios del equipo médico y reserva un turno disponible.</p><Link className="light" to="/disponibilidad">Consultar disponibilidad</Link></div><svg aria-hidden="true" viewBox="0 0 220 90"><path d="M0 50h55l14-20 16 46 22-68 19 53 12-11h82" fill="none" stroke="currentColor" strokeWidth="3"/></svg></section>
 <div className="metrics">{[[patients,'Pacientes','Patients'],[doctors,'Médicos','Doctors'],[appointments,'Citas','Appointments']].map(([query,title,path])=>{const q=query as typeof patients;return <Link className="card metric" to={'/'+path} key={String(path)}><span>{String(title)}</span><strong>{q.data?.length??'—'}</strong><small>{q.error?'Consulta fallida':q.data?'Registros en la API':'Consultando…'}</small></Link>})}</div>
 <section className="card pad"><div className="heading"><h2>Próximas citas</h2><Link to="/Appointments">Ver agenda</Link></div>{!upcoming?<Panel error={appointments.error}/>:upcoming.length?<div className="scroll"><table><thead><tr><th>Inicio (UTC)</th><th>Paciente</th><th>Médico</th><th>Estado</th></tr></thead><tbody>{upcoming.map(r=><tr key={String(r.appointmentId)}><td>{display('startDateTime',r.startDateTime)}</td><td>{person(patients.data,'patientId',r.patientId)}</td><td>{person(doctors.data,'doctorId',r.doctorId)}</td><td>{display('status',r.status)}</td></tr>)}</tbody></table></div>:<p className="empty">Sin citas próximas programadas.</p>}</section></>
}
function Account({jwt}:{jwt:string|null}){
 const me=useQuery<Row>(jwt?'auth/me':null)
 const [notice,set]=useState('')
 return <><p className="over">Cuenta</p><h1>{jwt?'Mi sesión':'Iniciar sesión'}</h1><section className="card pad narrow">{jwt?<>{me.data?<h2>{String(me.data.username)}</h2>:<Panel error={me.error}/>}<h3>Cambiar contraseña</h3><Form key={notice} fields="currentPassword newPassword" save={b=>api('auth/change-password','POST',b)} onDone={()=>set('Contraseña actualizada.')} submit="Actualizar contraseña"/>{notice&&<p role="status">{notice}</p>}<hr/><button onClick={()=>session(null)}>Cerrar sesión</button></>:<Form fields="usernameOrEmail password" submit="Iniciar sesión" save={async b=>{const data=await api<{accessToken:string}>('auth/login','POST',b);session(data.accessToken)}} onDone={()=>{}}/>}</section></>
}
function Reports(){
 const [notice,set]=useState('')
 return <><p className="over">Reportes</p><h1>Exportaciones</h1><section className="card pad narrow"><h2>Listado de pacientes</h2><p>Descarga el reporte de pacientes en formato Excel.</p><Form fields="" submit="Descargar Excel" save={async()=>{const blob=await api<Blob>('reports/patients/excel','GET',undefined,undefined,true);const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='MediFlow_Pacientes_'+new Date().toISOString().slice(0,10)+'.xlsx';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}} onDone={()=>set('Descarga iniciada.')}/>{notice&&<p role="status">{notice}</p>}</section></>
}
function App(){
 const [jwt,set]=useState(token),[open,toggle]=useState(false)
 const loc=useLocation();useEffect(()=>toggle(false),[loc.key])
 useEffect(()=>{const sync=()=>set(token());window.addEventListener('mediflow-session',sync);return ()=>window.removeEventListener('mediflow-session',sync)},[])
 useEffect(()=>{if(!jwt)return;const delay=Number(claims().exp)*1000-Date.now();if(!(delay>0)){session(null);return}const t=setTimeout(()=>session(null),delay);return ()=>clearTimeout(t)},[jwt])
 const role=claims()['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
 const admin=Boolean(jwt&&(Array.isArray(role)?role.includes('Admin'):role==='Admin'))
 const denied=<section className="card pad"><h1>Acceso restringido</h1><p>{jwt?'Se requiere el rol Admin.':'Inicia sesión con una cuenta autorizada.'}</p><Link to="/cuenta">Mi cuenta</Link></section>
 return <div className="layout"><aside className={open?'open':''}><div className="brand"><b>✚</b> MediFlow</div><nav aria-label="Navegación principal"><NavLink to="/" end>Resumen clínico</NavLink>{['Agenda','Atención clínica','Equipo y espacios','Administración'].filter(g=>g!=='Administración'||admin).map(g=><div key={g}><h3>{g}</h3>{g==='Agenda'&&<NavLink to="/disponibilidad">Disponibilidad</NavLink>}{modules.filter(m=>m.group===g).map(m=><NavLink key={m.route} to={'/'+m.route}>{m.title}</NavLink>)}</div>)}{jwt&&<NavLink to="/reportes">Reportes Excel</NavLink>}</nav></aside><div className="body"><header className="top"><button className="hamb" aria-expanded={open} onClick={()=>toggle(!open)}>Menú</button><span>Gestión clínica</span><Link to="/cuenta">{jwt?'Mi cuenta':'Iniciar sesión'}</Link></header><main><Routes><Route path="/" element={<Dashboard/>}/><Route path="/disponibilidad" element={<Availability/>}/><Route path="/cuenta" element={<Account key={jwt?'account':'login'} jwt={jwt}/>}/><Route path="/reportes" element={jwt?<Reports/>:denied}/>{modules.map(m=><Route key={m.route} path={'/'+m.route} element={m.group==='Administración'&&!admin?denied:<Records key={m.route} m={m}/>}/>)}<Route path="*" element={<><h1>Página no encontrada</h1><Link to="/">Volver al resumen</Link></>}/></Routes></main></div></div>
}
createRoot(document.getElementById('root')!).render(<BrowserRouter><App/></BrowserRouter>)
