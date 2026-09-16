import {getChatGPTUser} from '@/app/chatgpt-auth';
import {database} from '@/lib/database';
import {leadSchema,updateSchema} from '@/lib/lead-schema';
import {estimate} from '@/lib/catalog';
import {notifyNewLead} from '@/lib/notifications';
export const dynamic='force-dynamic';
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(){const user=await getChatGPTUser();if(!user)return reply({error:'Sign in to view your private review leads.'},401);try{const result=await database().prepare('SELECT * FROM leads WHERE owner = ? ORDER BY created DESC LIMIT 500').bind(user.userId).all();return reply({leads:result.results.map(r=>({...r,data:JSON.parse(r.data as string)}))});}catch(e){console.error('Lead read failed',e);return reply({error:'Leads are temporarily unavailable. Please retry.'},503);}}
async function mutate(request:Request,update:boolean){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return reply({error:'Invalid request origin.'},403);
 const user=await getChatGPTUser();if(!user)return reply({error:'This private review requires sign-in. Your information has not been submitted.'},401);
 try{const body=await request.text();if(body.length>24000)return reply({error:'Request too large.'},413);let raw;try{raw=JSON.parse(body);}catch{return reply({error:'Invalid request.'},400);}
 if(update){const p=updateSchema.safeParse(raw);if(!p.success)return reply({error:'Check the lead details.'},400);const v=p.data;const r=await database().prepare('UPDATE leads SET status = ?, notes = ?, assignee = ?, followup = ? WHERE id = ? AND owner = ?').bind(v.status,v.notes,v.assignee,v.followup,v.id,user.userId).run();if(!r.meta.changes)return reply({error:'Lead not found.'},404);return reply({ok:true});}
 const p=leadSchema.safeParse(raw);if(!p.success)return reply({error:p.error.issues[0]?.message||'Check your information.'},400);const v=p.data;
 const data={...v,estimate:estimate(v.selected),pricingVersion:'dc-research-2026-09-16-v1',inspectionRequired:true};
 const saved=await database().prepare('INSERT INTO leads (id,owner,created,data,status,notes,assignee,followup) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(v.requestId,user.userId,Date.now(),JSON.stringify(data),'New','','','').run();
 if(saved.meta.changes)await notifyNewLead(data);
 return reply({id:v.requestId},201);
 }catch(e){console.error('Lead save failed',e);return reply({error:'Unable to save right now. Your form is still here; please try again.'},503);}
}
export async function POST(r:Request){return mutate(r,false);}
export async function PATCH(r:Request){return mutate(r,true);}
