import {adminUser,json,sameOrigin,cmsRepository} from '../../../lib/cms';
import {CmsError} from '../../../db/repository.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(){if(!await adminUser())return json({error:'Yönetici girişi gerekli.'},403);try{return json(await cmsRepository().snapshot())}catch{return json({error:'MySQL bağlantısı hazır değil. Bağlantı ve tablo kurulumunu kontrol edin.'},503)}}
export async function POST(request:Request){
 const user=await adminUser();if(!user)return json({error:'Yönetici girişi gerekli.'},403);if(!sameOrigin(request))return json({error:'İstek kaynağı doğrulanamadı.'},403);
 if(Number(request.headers.get('content-length')||0)>1500000)return json({error:'İçerik çok büyük.'},413);
 try{
  const text=await request.text();if(text.length>1500000)return json({error:'İçerik çok büyük.'},413);
  let body;try{body=JSON.parse(text)}catch{return json({error:'Geçersiz JSON.'},400)}
  if(!body||typeof body!=='object')return json({error:'Geçersiz istek.'},400);
  return json(await cmsRepository().write({action:body.action,data:body.data,version:body.version,historyId:body.historyId,author:user.userId}));
 }catch(e){return json({error:e instanceof CmsError?e.message:'İşlem tamamlanamadı. MySQL bağlantısını kontrol edin.'},e instanceof CmsError?e.status:503)}
}
