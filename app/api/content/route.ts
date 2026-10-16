import { adminUser,readContent,json } from '../../../lib/cms';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export async function GET(request:Request){try{const preview=new URL(request.url).searchParams.has('preview');if(preview&&!await adminUser())return json({error:'Yetkisiz erişim.'},403);return json(await readContent(preview?'draft':'published'));}catch{return json({error:'İçerik yüklenemedi. Veritabanı kurulumunu kontrol edin.'},503)}}
