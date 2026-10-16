export function sameOrigin(request){
 try{
  const origin=new URL(request.headers.get('origin')||'');
  const host=(request.headers.get('host')||new URL(request.url).host).toLowerCase();
  if(origin.host.toLowerCase()!==host)return false;
  if(origin.protocol==='https:')return true;
  return origin.protocol==='http:'&&(process.env.NODE_ENV!=='production'||['localhost','127.0.0.1','[::1]'].includes(origin.hostname));
 }catch{return false}
}
