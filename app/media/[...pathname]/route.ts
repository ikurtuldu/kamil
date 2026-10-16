import {get} from '@vercel/blob';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:Promise<{pathname:string[]}>}){
 const {pathname}=await params;
 // Only expose uploaded image files. The opaque path is public site content, even though the underlying Blob store itself is private.
 if(pathname.length!==2||pathname[0]!=='images'||!/^[-a-f0-9]{36}\.(?:jpg|png|webp)$/.test(pathname[1]))return new Response('Not found',{status:404});
 try{
  const result=await get(pathname.join('/'),{access:'private'});
  if(!result||result.statusCode!==200)return new Response('Not found',{status:404});
  return new Response(result.stream,{headers:{'Content-Type':result.blob.contentType,'Content-Length':String(result.blob.size),'Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff','Content-Disposition':'inline'}});
 }catch{
  return new Response('Not found',{status:404,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 }
}
