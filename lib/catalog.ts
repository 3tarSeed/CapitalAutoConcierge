export const services=[
 {id:'ppf',name:'Paint protection film',short:'PPF',description:'Protect the finish. Preserve the original.',icon:'shield',options:[['front','Full front',1500,3000],['partial','Partial front',1300,null],['full','Full vehicle',5500,8000],['custom','Individual panels',null,null]]},
 {id:'tint',name:'Window tint',short:'Window tint',description:'Choose the film and exactly which glass you want covered.',icon:'sun',options:[
  ['dyed:front-two','Dyed · two front windows',129,199],['dyed:sides-rear','Dyed · all sides + rear',299,449],['dyed:entire','Dyed · entire vehicle incl. windshield',499,699],['dyed:windshield','Dyed · windshield only',149,249],['dyed:roof','Dyed · sunroof / panoramic roof',149,299],['dyed:specific','Dyed · specific windows',null,null],
  ['carbon:front-two','Carbon · two front windows',179,249],['carbon:sides-rear','Carbon · all sides + rear',449,649],['carbon:entire','Carbon · entire vehicle incl. windshield',699,899],['carbon:windshield','Carbon · windshield only',199,349],['carbon:roof','Carbon · sunroof / panoramic roof',199,349],['carbon:specific','Carbon · specific windows',null,null],
  ['ceramic:front-two','Ceramic · two front windows',199,299],['ceramic:sides-rear','Ceramic · all sides + rear',699,899],['ceramic:entire','Ceramic · entire vehicle incl. windshield',950,1300],['ceramic:windshield','Ceramic · windshield only',250,450],['ceramic:roof','Ceramic · sunroof / panoramic roof',250,450],['ceramic:specific','Ceramic · specific windows',null,null]
 ]},
 {id:'ceramic',name:'Ceramic coating',short:'Ceramic coating',description:'Lasting gloss and easier maintenance.',icon:'sparkles',options:[['five','Five-year coating',800,1800]]},
 {id:'wrap',name:'Color-change wrap',short:'Vinyl wrap',description:'A new expression of your vehicle.',icon:'layers',options:[['full','Full vehicle vinyl wrap',2500,null]]},
 {id:'detail',name:'Auto detailing',short:'Auto detailing',description:'Interior, exterior or complete care—with the finish work you choose.',icon:'sparkles',options:[
  ['interior','Interior detail',200,350],
  ['exterior','Exterior detail',175,275],
  ['exterior-clay','Exterior detail · clay-bar treatment',250,375],
  ['exterior-polish','Exterior detail · one-step polish',450,750],
  ['exterior-clay-polish','Exterior detail · clay bar + one-step polish',550,850],
  ['complete','Complete interior + exterior detail',350,550],
  ['complete-clay','Complete detail · clay-bar treatment',425,650],
  ['complete-polish','Complete detail · one-step polish',600,950],
  ['complete-clay-polish','Complete detail · clay bar + one-step polish',700,1100]
 ]},
 {id:'correction',name:'Paint correction',short:'Paint correction',description:'Refine swirls and surface imperfections.',icon:'sparkles',options:[['inspect','Correction assessment',750,1500]]},
 {id:'wheel',name:'Wheel & rim repair',short:'Wheel repair',description:'Bent wheels, curb rash, cracks and finish damage.',icon:'wrench',options:[
  ['cosmetic-one','Cosmetic repair / refinish · one wheel',150,250],
  ['straighten-one','Bent-wheel straightening · one wheel',175,300],
  ['crack-one','Crack repair assessment · one wheel',200,400],
  ['refinish-four','Cosmetic refinish · set of four',550,900],
  ['inspect','Unsure · inspect and recommend',null,null]
 ]},
 {id:'transport',name:'Vehicle transport',short:'Vehicle transport',description:'A standalone pickup and delivery request.',icon:'truck',options:[['quote','Route-specific estimate',null,null]]}
] as const;
export const timings=['As soon as possible','By a specific date','Within a few weeks','Flexible'];
export const modes=['Discuss with concierge','Mobile service','Customer drop-off','Pickup & return'];
export const statuses=['New','Contacted','Inspection Needed','Quote Sent','Follow-up','Won','Lost'];
export const money=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
export function estimate(selected:Record<string,string>){
 const lines=Object.entries(selected).map(([id,option])=>{const s=services.find(s=>s.id===id);const p=s?.options.find(p=>p[0]===option);if(!s||!p)throw new Error('Unknown service');return {id,name:s.short,package:p[1],low:p[2],high:p[3]};});
 return {lines,low:lines.reduce((n,l)=>n+(l.low??0),0),high:lines.reduce((n,l)=>n+(l.high??l.low??0),0),open:lines.some(l=>l.high===null),manual:lines.some(l=>l.low===null)};
}
