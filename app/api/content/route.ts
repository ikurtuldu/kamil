import { adminUser,readContent,json } from '../../../lib/cms';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export async function GET(request:Request){try{const preview=new URL(request.url).searchParams.has('preview');if(preview&&!await adminUser())return json({error:'Yetkisiz erişim.'},403);return json(await readContent(preview?'draft':'published'));}catch(error){const code=error&&typeof error==='object'&&'code' in error?String(error.code).slice(0,64):'CONTENT_READ_FAILED';console.error('content_read_failed',{code});return json({error:'İçerik yüklenemedi. Veritabanı kurulumunu kontrol edin.'},503)}}
