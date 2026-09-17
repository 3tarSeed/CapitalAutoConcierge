'use client';
import {useState} from 'react';
import {usePathname} from 'next/navigation';
import {Calculator,CircleDollarSign,MessageSquare} from 'lucide-react';
import ContactForm from './contact-form';

export default function MobileNav(){
 const path=usePathname();const [contact,setContact]=useState(false);
 const item=(href:string,label:string,Icon:typeof Calculator)=><a href={href} className={path===href?'active':''} aria-current={path===href?'page':undefined}><Icon size={22} aria-hidden/>{label}</a>;
 return <><nav className="mobile-nav" aria-label="Main">{item('/','Estimate',Calculator)}{item('/pricing','Pricing',CircleDollarSign)}<button type="button" className={contact?'active':''} onClick={()=>setContact(true)}><MessageSquare size={22} aria-hidden/>Contact</button></nav><ContactForm open={contact} onOpenChange={setContact}/></>;
}
