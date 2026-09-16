import {requireChatGPTUser} from '@/app/chatgpt-auth';
import Desk from './desk';
export const dynamic='force-dynamic';
export default async function Page(){await requireChatGPTUser('/leads');return <Desk/>;}
