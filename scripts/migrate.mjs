import {readFile} from 'node:fs/promises';
import {getPool} from '../db/pool.mjs';
import {loadEnvConfig} from '@next/env';
loadEnvConfig(process.cwd());
const pool=getPool();
try{
 for(const file of ['../db/schema.sql','../db/migrations/0002_admin_login_limits.sql']){
  const schema=await readFile(new URL(file,import.meta.url),'utf8');
  for(const statement of schema.split(';').map(x=>x.trim()).filter(Boolean))await pool.query(statement);
 }
 console.log('MySQL tabloları hazır. Mevcut içerikler korundu.');
}finally{await pool.end()}
