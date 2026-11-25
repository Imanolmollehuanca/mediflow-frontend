import {useEffect,useState} from 'react'
const base = import.meta.env.DEV ? '' : import.meta.env.VITE_API_BASE_URL.replace(/\/$/,'')
const key='mediflow.session'
export function token(){return sessionStorage.getItem(key)}
export function session(value:string|null){
 if(value) sessionStorage.setItem(key,value)
 else sessionStorage.removeItem(key)
 window.dispatchEvent(new Event('mediflow-session'))
}
export function claims(){
 try {const raw=token()!.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')
 return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(raw), c=>c.charCodeAt(0))))}
 catch{return {}}
}
export async function api<T=void>(path:string,method='GET',body?:unknown,signal?:AbortSignal,download=false):Promise<T>{
 const jwt=token()
 let res:Response
 try{res=await fetch(base+'/api/'+path,{method,signal,headers:{...(jwt?{Authorization:'Bearer '+jwt}:{}),...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)})}
 catch(e){if(signal?.aborted)throw e;throw Error('No se pudo conectar con MediFlow. Comprueba la API y la configuración de CORS.')}
 if(!res.ok){
 const raw=await res.text();let message=''
 try{const p=JSON.parse(raw);message=Object.values(p.errors||{}).flat().join(' ') || p.message || p.detail || p.title || (typeof p==='string'?p:'')}catch{if(!raw.trim().startsWith('<'))message=raw.slice(0,400)}
 if(res.status===401 && jwt && token()===jwt && path!=='auth/login')session(null)
 throw Error(message || ({401:'Inicia sesión para continuar.',403:'Tu cuenta carece de este permiso.',404:'Registro no encontrado.',500:'La API no pudo completar la operación. Verifica el servidor y la base de datos.'}[res.status] ?? 'Error HTTP '+res.status))
 }
 if(download)return await res.blob() as T
 const raw=await res.text();return (raw?JSON.parse(raw):undefined) as T
}
export function useQuery<T>(path:string|null,version=0){
 const [state,set]=useState<{key:string,data?:T,error?:string}>({key:''})
 const key=JSON.stringify([path,version,token()])
 useEffect(()=>{if(!path)return;const ctrl=new AbortController()
 api<T>(path,'GET',undefined,ctrl.signal).then(data=>{if(!ctrl.signal.aborted)set({key,data})}).catch(e=>{if(!ctrl.signal.aborted)set({key,error:e.message})})
 return ()=>ctrl.abort()},[path,key])
 return state.key===key?state:{key}
}