import {NextResponse} from 'next/server';
import {sessionCookieName} from '../../../../lib/auth';
import {sameOrigin,json} from '../../../../lib/cms';
export const runtime='nodejs';
export async function POST(request:Request){if(!sameOrigin(request))return json({error:'İstek kaynağı doğrulanamadı.'},403);const response=NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}});response.cookies.set(sessionCookieName(),'',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:0});return response}
