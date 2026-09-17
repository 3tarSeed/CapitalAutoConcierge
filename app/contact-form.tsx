'use client';
import {useState} from 'react';
import {ArrowRight,Check} from 'lucide-react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';

export default function ContactForm({open,onOpenChange}:{open:boolean,onOpenChange:(v:boolean)=>void}){
 const [f,setF]=useState({name:'',phone:'',email:'',message:'',website:''});
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[sent,setSent]=useState(false);
 const set=(k:keyof typeof f)=>(ev:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>setF(v=>({...v,[k]:ev.target.value}));
 async function submit(ev:React.FormEvent){ev.preventDefault();setBusy(true);setError('');try{const r=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(f)});const d=await r.json() as {error?:string};if(!r.ok)throw new Error(d.error);setSent(true);}catch(e){setError(e instanceof Error?e.message:'Unable to send. Please retry.');}finally{setBusy(false);}}
 function close(v:boolean){if(busy)return;onOpenChange(v);if(!v&&sent){setSent(false);setF({name:'',phone:'',email:'',message:'',website:''});}}
 return <Dialog open={open} onOpenChange={close}><DialogContent className="contact-dialog"><DialogTitle>{sent?'Message sent.':'Contact us.'}</DialogTitle><DialogDescription>{sent?'Thank you. A concierge will be in touch shortly.':'A quick note is all we need. We’ll reply by phone or email.'}</DialogDescription>
 {sent?<><div className="success-icon"><Check/></div><button className="primary full" onClick={()=>close(false)}>Done</button></>:
 <form onSubmit={submit}><div className="fields"><label className="field"><span>Name</span><input value={f.name} onChange={set('name')} required maxLength={100} autoComplete="name"/></label><label className="field"><span>Phone <small>Optional</small></span><input type="tel" value={f.phone} onChange={set('phone')} maxLength={30} autoComplete="tel"/></label><label className="field" style={{gridColumn:'1/-1'}}><span>Email</span><input type="email" value={f.email} onChange={set('email')} required maxLength={200} autoComplete="email"/></label><label className="field" style={{gridColumn:'1/-1'}}><span>How can we help?</span><textarea value={f.message} onChange={set('message')} required maxLength={2000} placeholder="Your vehicle, the service you have in mind, or a question…"/></label></div>
 <input type="text" name="website" tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} style={{position:'absolute',left:'-9999px',width:1,height:1,opacity:0}} aria-hidden="true"/>
 {error&&<p className="error" role="alert">{error}</p>}<button className="primary full" disabled={busy}>{busy?'Sending…':'Send message'}<ArrowRight size={16}/></button></form>}
 </DialogContent></Dialog>;
}
