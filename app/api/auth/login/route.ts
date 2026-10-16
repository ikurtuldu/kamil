import {NextResponse} from 'next/server';
import {authConfig,authConfigured,sessionCookieName} from '../../../../lib/auth';
import {verifyPassword,createSession,SESSION_SECONDS} from '../../../../lib/auth-crypto.mjs';
import {reserveLoginAttempt,clearLoginAttempts} from '../../../../lib/login-limits.mjs';
import {getPool} from '../../../../db/pool.mjs';
import {json,sameOrigin} from '../../../../lib/cms';
export const runtime='nodejs';
export async function POST(request:Request){
 if(!sameOrigin(request))return json({error:'İstek kaynağı doğrulanamadı.'},403);
 if(!authConfigured())return json({error:'Yönetici girişi henüz yapılandırılmamış.'},503);
 if(Number(request.headers.get('content-length')||0)>8192)return json({error:'İstek çok büyük.'},413);
 try{
  const text=await request.text();if(text.length>8192)return json({error:'İstek çok büyük.'},413);
  let body;try{body=JSON.parse(text)}catch{return json({error:'Geçersiz istek.'},400)}
  if(!body||typeof body.email!=='string'||typeof body.password!=='string'||body.email.length>254||body.password.length>1024)return json({error:'E-posta veya şifre geçersiz.'},400);
  const config=authConfig(),pool=getPool();
  const ip=request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()||request.headers.get('x-real-ip')||'local';
  const limit=await reserveLoginAttempt(pool,config.secret,body.email,ip);
  if(!limit.allowed)return json({error:'Çok fazla giriş denemesi. 15 dakika sonra tekrar deneyin.'},429);
  const correct=await verifyPassword(body.password,config.passwordHash);
  if(!correct||body.email.trim().toLowerCase()!==config.email)return json({error:'E-posta veya şifre hatalı.'},401);
  await clearLoginAttempts(pool,limit.keys);
  const response=NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}});
  response.cookies.set(sessionCookieName(),createSession(config),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:SESSION_SECONDS});
  return response;
 }catch{return json({error:'Giriş tamamlanamadı. Veritabanı ayarlarını kontrol edin.'},503)}
}
