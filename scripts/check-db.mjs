import {getPool} from '../db/pool.mjs';
import {loadEnvConfig} from '@next/env';
loadEnvConfig(process.cwd());
const pool=getPool();
try{
 await pool.execute('SELECT 1');
 for(const name of ['site_content','content_history','admin_login_limits'])await pool.execute(`SELECT 1 FROM ${name} LIMIT 1`);
 console.log('MySQL bağlantısı ve gerekli tablolar doğrulandı.');
}finally{await pool.end()}
