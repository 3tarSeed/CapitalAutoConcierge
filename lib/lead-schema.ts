import {z} from 'zod';
import {services,timings,modes,statuses} from './catalog';
export const leadSchema=z.object({
 requestId:z.string().uuid(),year:z.string().regex(/^\d{4}$/).refine(v=>+v>=1950&&+v<=new Date().getFullYear()+1),
 make:z.string().trim().min(1).max(60),model:z.string().trim().min(1).max(100),trim:z.string().trim().max(100),zip:z.string().regex(/^\d{5}$/),
 selected:z.record(z.string()).refine(v=>Object.keys(v).length>0&&Object.entries(v).every(([id,o])=>services.some(s=>s.id===id&&s.options.some(p=>p[0]===o)))),
 timing:z.string().refine(v=>timings.includes(v)),deadline:z.string().max(10),mode:z.string().refine(v=>modes.includes(v)),
 destination:z.string().trim().max(250),transportMethod:z.enum(['Discuss with concierge','Insured driver / valet','Flatbed','Enclosed transport']),
 condition:z.string().trim().max(2000),name:z.string().trim().min(2).max(100),email:z.string().trim().email().max(200),
 phone:z.string().trim().min(7).max(30).refine(v=>v.replace(/\D/g,'').length>=7),contactTime:z.string().max(100),consent:z.literal(true),
}).superRefine((v,ctx)=>{if(v.timing==='By a specific date'&&(!/^\d{4}-\d{2}-\d{2}$/.test(v.deadline)||v.deadline<new Date().toISOString().slice(0,10)))ctx.addIssue({code:'custom',path:['deadline'],message:'Choose today or a future date.'});});
export const updateSchema=z.object({id:z.string().uuid(),status:z.string().refine(v=>statuses.includes(v)),notes:z.string().max(10000),assignee:z.string().max(100),followup:z.string().max(16)});
