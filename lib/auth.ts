import 'server-only';
import {cookies} from 'next/headers';
import {verifySession,validPasswordHash} from './auth-crypto.mjs';
export function authConfig(){return {email:(process.env.ADMIN_EMAIL||'').trim().toLowerCase(),passwordHash:process.env.ADMIN_PASSWORD_HASH||'',secret:process.env.AUTH_SECRET||''}}
export function authConfigured(){const c=authConfig();return Boolean(c.email&&validPasswordHash(c.passwordHash)&&c.secret.length>=32)}
export function sessionCookieName(){return process.env.NODE_ENV==='production'?'__Host-nordraum_session':'nordraum_session'}
export async function adminUser(){if(!authConfigured())return null;const token=(await cookies()).get(sessionCookieName())?.value;return verifySession(token,authConfig())}
