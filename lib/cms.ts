import 'server-only';
import {getPool,databaseConfigured} from '../db/pool.mjs';
import {repository} from '../db/repository.mjs';
import {defaults,validateContent} from './content.mjs';
export {adminUser} from './auth';
export function json(body:unknown,status=200){return Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
export {sameOrigin} from './origin.mjs';
export function cmsRepository(){return repository(getPool())}
export async function readContent(id='published'){
 if(!databaseConfigured()){
  if(id==='published'&&process.env.DEMO_MODE!=='false')return {data:structuredClone(defaults),version:0,updatedAt:null,demo:true};
  throw new Error('MYSQL_NOT_CONFIGURED');
 }
 return cmsRepository().read(id);
}
export {defaults,validateContent};
