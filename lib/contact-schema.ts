import {z} from 'zod';
export const contactSchema=z.object({
 name:z.string().trim().min(2).max(100),
 phone:z.string().trim().max(30).refine(v=>!v||v.replace(/\D/g,'').length>=7,'Enter a valid phone number.'),
 email:z.string().trim().email().max(200),
 message:z.string().trim().min(5,'Tell us a little about what you need.').max(2000),
});
export type ContactInput=z.infer<typeof contactSchema>;
