
type EstimateLine={name:string;package:string;low?:number;high?:number};
type LeadNotification={
 requestId:string;name:string;phone:string;email:string;year:string;make:string;model:string;trim?:string;
 timing:string;deadline?:string;selected:string[]|Record<string,string>;estimate:{low:number;high:number;lines:EstimateLine[]};
};

const vars=()=>process.env as Record<string,string|undefined>;
const money=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
const clean=(value:string)=>value.replace(/[<>]/g,'');
const selectedList=(s:LeadNotification['selected'])=>Array.isArray(s)?s:Object.entries(s).map(([id,pkg])=>`${id} — ${pkg}`);
const defaultDesk='https://capitalautoconcierge.netlify.app/leads';

function summary(lead:LeadNotification){
 const vehicle=[lead.year,lead.make,lead.model,lead.trim].filter(Boolean).join(' ');
 const estimate=lead.estimate.low||lead.estimate.high?`${money(lead.estimate.low)}–${money(lead.estimate.high)}`:'Manual estimate';
 const deadline=lead.deadline?` (${lead.deadline})`:'';
 return {vehicle,estimate,deadline,ref:lead.requestId.slice(0,8).toUpperCase()};
}

async function sendEmail(lead:LeadNotification){
 const e=vars(),to=e.NOTIFY_EMAIL_TO,key=e.RESEND_API_KEY,from=e.RESEND_FROM;
 if(!to||!key||!from)return {channel:'email',status:'not_configured'};
 const s=summary(lead),desk=e.CONCIERGE_DESK_URL||defaultDesk;
 const services=lead.estimate.lines.map(line=>`${clean(line.name)} — ${clean(line.package)}`).join('<br>')||selectedList(lead.selected).map(clean).join('<br>');
 const html=`<h2>New Capital Auto Concierge lead</h2><p><strong>${clean(lead.name)}</strong><br>${clean(lead.phone)}<br>${clean(lead.email)}</p><p><strong>Vehicle:</strong> ${clean(s.vehicle)}<br><strong>Services:</strong><br>${services}<br><strong>Estimate:</strong> ${s.estimate}<br><strong>Timeframe:</strong> ${clean(lead.timing+s.deadline)}<br><strong>Reference:</strong> ${s.ref}</p><p><a href="${desk}">Open this lead in the Concierge Desk</a></p>`;
 const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:[to],subject:`New lead: ${s.vehicle} · ${lead.timing}`,html})});
 if(!response.ok)throw new Error(`Email notification failed (${response.status})`);
 return {channel:'email',status:'sent'};
}

async function sendCustomerConfirmation(lead:LeadNotification){
 const e=vars(),key=e.RESEND_API_KEY,from=e.RESEND_FROM;
 if(!key||!from)return {channel:'customer_email',status:'not_configured'};
 const s=summary(lead);
 const html=`<h2>We received your request</h2><p>Hi ${clean(lead.name)},</p><p>Thank you for contacting Capital Auto Concierge about your ${clean(s.vehicle)}. Your request has been received, and a concierge will contact you shortly to discuss the vehicle, its condition, timing, and next steps.</p><p><strong>Requested services:</strong><br>${lead.estimate.lines.map(line=>`${clean(line.name)} — ${clean(line.package)}`).join('<br>')||selectedList(lead.selected).map(clean).join('<br>')}<br><strong>Preliminary estimate:</strong> ${s.estimate}<br><strong>Timeframe:</strong> ${clean(lead.timing+s.deadline)}<br><strong>Reference:</strong> ${s.ref}</p><p>This is a preliminary estimate only. It is not a final quote or confirmed appointment. Final pricing may change after we review the vehicle and any preparation or repair needs.</p><p>Capital Auto Concierge</p>`;
 const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:[lead.email],subject:`We received your request · ${s.ref}`,html})});
 if(!response.ok)throw new Error(`Customer confirmation failed (${response.status})`);
 return {channel:'customer_email',status:'sent'};
}

async function sendSms(lead:LeadNotification){
 const e=vars(),to=e.NOTIFY_SMS_TO,sid=e.TWILIO_ACCOUNT_SID,token=e.TWILIO_AUTH_TOKEN,from=e.TWILIO_FROM_NUMBER;
 if(!to||!sid||!token||!from)return {channel:'sms',status:'not_configured'};
 const s=summary(lead),desk=e.CONCIERGE_DESK_URL||defaultDesk;
 const body=`NEW CAC LEAD: ${lead.name}, ${s.vehicle}, ${lead.timing}${s.deadline}, est. ${s.estimate}. ${lead.phone}. Ref ${s.ref}. ${desk}`;
 const form=new URLSearchParams({To:to,From:from,Body:body});
 const response=await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`,{method:'POST',headers:{Authorization:`Basic ${btoa(`${sid}:${token}`)}`,'Content-Type':'application/x-www-form-urlencoded'},body:form});
 if(!response.ok)throw new Error(`SMS notification failed (${response.status})`);
 return {channel:'sms',status:'sent'};
}

export async function notifyNewLead(lead:LeadNotification){
 const results=await Promise.allSettled([sendEmail(lead),sendSms(lead),sendCustomerConfirmation(lead)]);
 for(const result of results)if(result.status==='rejected')console.error('Lead alert failed',result.reason);
 return results;
}
