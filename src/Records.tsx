import {useState,useEffect,useRef,type ReactNode} from 'react'
import {useLocation} from 'react-router-dom'
import {api,useQuery} from './api'
import {type Row,type Module,labels,display} from './catalog'
import {Form,Field} from './Form'

export function Modal({title,close,children}:{title:string,close:()=>void,children:ReactNode}){
 const ref=useRef<HTMLDialogElement>(null)
 useEffect(()=>{const dialog=ref.current!;dialog.showModal();return ()=>dialog.close()},[])
 return <dialog ref={ref} onCancel={close} aria-label={title}><header><h2>{title}</h2><button onClick={close} aria-label="Cerrar">×</button></header>{children}</dialog>
}
export function Panel({error}:{error?:string}){return error?<p role="alert" className="error">{error}</p>:<p role="status" className="empty">Cargando registros…</p>}
export function Records({m}:{m:Module}){
 const initial=useLocation().state?.appointment as Row|undefined
 const [view,setView]=useState(initial?'new':''),[id,select]=useState(''),[search,find]=useState(''),[version,refresh]=useState(0),[notice,notify]=useState('')
 const [doctor,setDoctor]=useState(''),[room,setRoom]=useState(''),[patient,setPatient]=useState('')
 const q=new URLSearchParams();if(doctor)q.set('doctorId',doctor);if(room)q.set('roomId',room)
 const list=useQuery<Row[]>(m.route+(patient?'/patient/'+patient:q.size?'?'+q:''),version)
 const detail=useQuery<Row>(id?m.route+'/'+id:null,version)
 const [seed,setSeed]=useState<Row>(initial??{})
 const cols=m.columns.split(' ')
 function done(){setView('');select('');setSeed({});notify('Operación completada.');refresh(n=>n+1)}
 const path=m.route+'/'+id, row=detail.data
 const filtered=list.data?.filter(r=>Object.entries(r).some(([k,v])=>display(k,v).toLocaleLowerCase().includes(search.toLocaleLowerCase())))
 const deleteLabel=m.route==='Appointments'?'Cancelar cita':row&&'isActive' in row?'Desactivar':'Eliminar'
 const canDelete=m.remove&&row?.isActive!==false&&!(m.route==='Appointments'&&['Completed','Cancelled'].includes(String(row?.status)))
 const action=(title:string,method:string,suffix='',fields='',data?:Row)=> <Form fields={fields} initial={data} payment={m.route==='Payments'} submit={title} save={b=>api(path+suffix,method,fields?b:undefined)} onDone={done}/>
 return <><div className="heading"><div><p className="over">{m.group}</p><h1>{m.title}</h1></div><button className="primary" onClick={()=>{setSeed({});setView('new')}}>＋ Crear registro</button></div>
 {notice&&<p role="status" className="success">{notice}</p>}
 <section className="card"><div className="toolbar"><input type="search" aria-label="Buscar registros" placeholder="Buscar en los registros…" value={search} onChange={e=>find(e.target.value)}/><button onClick={()=>refresh(v=>v+1)}>Actualizar</button></div>
 {['DoctorRooms','Schedules','Prescriptions'].includes(m.route)&&<div className="filters">{m.route==='Prescriptions'?<Field name="patientId" required={false} value={patient} onChange={setPatient}/>:<Field name="doctorId" required={false} value={doctor} onChange={setDoctor}/>}
 {m.route==='DoctorRooms'&&<Field name="roomId" required={false} value={room} onChange={setRoom}/>}</div>}
 {!filtered?<Panel error={list.error}/>:<><div className="scroll"><table><thead><tr>{cols.map(k=><th key={k}>{labels[k]}</th>)}<th>Ficha</th></tr></thead><tbody>{filtered.map(r=><tr key={String(r[m.id])}>{cols.map(k=><td key={k}>{display(k,r[k])}</td>)}<td><button onClick={()=>{select(String(r[m.id]));setView('detail')}}>Ver ficha</button></td></tr>)}</tbody></table></div><p className="empty">{filtered.length?filtered.length+' registros':search?'Sin coincidencias.':'Sin registros para esta consulta.'}</p></>}</section>
 {view&&<Modal title={view==='new'?'Crear registro · '+m.title:m.title+' · #'+id} close={()=>{setView('');select('')}}>{view==='new'?<Form fields={m.create} initial={seed} save={b=>api(m.route,'POST',b)} onDone={done}/>:!row?<Panel error={detail.error}/>:view==='edit'?<Form fields={m.update} initial={row} locked={m.route==='Appointments'?['doctorId','patientId']:[]} save={b=>api(path,'PUT',b)} onDone={done}/>:view==='delete'?<><p>¿Confirmas la acción «{deleteLabel}» para el registro #{id}?</p>{action(deleteLabel,'DELETE')}</>:view==='status'?m.route==='Users'?action(row.isActive?'Desactivar usuario':'Activar usuario','PATCH','/status','isActive',{isActive:!row.isActive}):action('Guardar estado','PATCH','/status','status',row):view==='read'?action('Marcar como leída','PATCH','/read'):['assign','revoke'].includes(view)?<Form fields="roleId" submit={view==='assign'?'Asignar rol':'Retirar rol'} save={b=>api(path+'/roles/'+b.roleId,view==='assign'?'POST':'DELETE')} onDone={done}/>:<><dl>{Object.entries(row).map(([k,v])=><div key={k}><dt>{labels[k]??k}</dt><dd>{display(k,v)}</dd></div>)}</dl><div className="actions">{m.update&&!(m.route==='Appointments'&&['Completed','Cancelled'].includes(String(row.status)))&&<button onClick={()=>setView('edit')}>Editar</button>}{canDelete&&<button className="danger" onClick={()=>setView('delete')}>{deleteLabel}</button>}{['Users','Payments'].includes(m.route)&&<button onClick={()=>setView('status')}>Cambiar estado</button>}{m.route==='Notifications'&&!row.isRead&&<button onClick={()=>setView('read')}>Marcar como leída</button>}{m.route==='Users'&&<><button onClick={()=>setView('assign')}>Asignar rol</button><button onClick={()=>setView('revoke')}>Retirar rol</button></>}</div></>}</Modal>}</>
}