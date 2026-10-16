import {createHmac,createHash,randomBytes,scrypt as scryptCallback,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(scryptCallback);
export const SESSION_SECONDS=8*60*60;
export async function hashPassword(password){
 if(typeof password!=='string'||password.length<12||password.length>1024)throw new Error('Şifre 12–1024 karakter olmalıdır.');
 const salt=randomBytes(24),key=await scrypt(password,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024});
 return `scrypt:32768:8:1:${salt.toString('base64url')}:${key.toString('base64url')}`;
}
export function validPasswordHash(encoded){
 return typeof encoded==='string'&&/^scrypt:32768:8:1:[\w-]{32}:[\w-]{86}$/.test(encoded);
}
export async function verifyPassword(password,encoded){
 if(typeof password!=='string'||password.length>1024||!validPasswordHash(encoded))return false;
 const [,n,r,p,salt,hash]=encoded.split(':');
 try{const expected=Buffer.from(hash,'base64url'),actual=await scrypt(password,Buffer.from(salt,'base64url'),expected.length,{N:Number(n),r:Number(r),p:Number(p),maxmem:64*1024*1024});return timingSafeEqual(actual,expected)}catch{return false}
}
const fingerprint=config=>createHash('sha256').update(config.email.toLowerCase()+'\0'+config.passwordHash).digest('base64url');
export function createSession(config,now=Math.floor(Date.now()/1000)){
 if(!config.secret||config.secret.length<32)throw new Error('AUTH_SECRET eksik.');
 const body=Buffer.from(JSON.stringify({sub:config.email.toLowerCase(),iat:now,exp:now+SESSION_SECONDS,credential:fingerprint(config),nonce:randomBytes(16).toString('base64url')})).toString('base64url');
 const message='v1.'+body;return message+'.'+createHmac('sha256',config.secret).update(message).digest('base64url');
}
export function verifySession(token,config,now=Math.floor(Date.now()/1000)){
 if(typeof token!=='string'||token.length>2000||!config.secret||config.secret.length<32)return null;
 try{const [v,body,signature,...extra]=token.split('.');if(v!=='v1'||extra.length||!body||!signature)return null;
  const expected=createHmac('sha256',config.secret).update(v+'.'+body).digest(),actual=Buffer.from(signature,'base64url');
  if(actual.length!==expected.length||!timingSafeEqual(actual,expected))return null;
  const payload=JSON.parse(Buffer.from(body,'base64url').toString('utf8'));
  if(payload.sub!==config.email.toLowerCase()||payload.credential!==fingerprint(config)||!Number.isSafeInteger(payload.exp)||!Number.isSafeInteger(payload.iat)||payload.exp<=now||payload.iat>now+30||payload.exp-payload.iat!==SESSION_SECONDS)return null;
  return {userId:payload.sub,email:payload.sub};
 }catch{return null}
}
