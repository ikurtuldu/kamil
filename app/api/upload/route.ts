import {put} from '@vercel/blob';
import {adminUser,sameOrigin,json} from '../../../lib/cms';
import {detectImageType,MAX_IMAGE_BYTES} from '../../../lib/uploads.mjs';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function POST(request:Request){
 if(!await adminUser()||!sameOrigin(request))return json({error:'Yetkisiz erişim.'},403);
 if(Number(request.headers.get('content-length')||0)>MAX_IMAGE_BYTES+10000)return json({error:'En fazla 3 MB yükleyebilirsiniz.'},413);
 if(!process.env.BLOB_READ_WRITE_TOKEN&&!process.env.BLOB_STORE_ID)return json({error:'Vercel Blob deposu henüz bağlanmamış.'},503);
 try{
  const form=await request.formData(),file=form.get('file');
  if(!(file instanceof File)||file.size>MAX_IMAGE_BYTES||file.size===0)return json({error:'Geçerli bir görsel seçin (en fazla 3 MB).'},400);
  const bytes=new Uint8Array(await file.arrayBuffer()),type=detectImageType(bytes);
  if(!type)return json({error:'Yalnızca JPEG, PNG ve WebP görseller kabul edilir.'},400);
  const key=`images/${crypto.randomUUID()}.${type.ext}`;
  await put(key,Buffer.from(bytes),{access:'private',contentType:type.type,addRandomSuffix:false});
  return json({url:`/media/${key}`});
 }catch{return json({error:'Görsel yüklenemedi. Private Vercel Blob bağlantısını kontrol edin.'},503)}
}
