import {createHmac} from 'node:crypto';
export async function reserveLoginAttempt(pool,secret,email,ip,now=Date.now()){
 const windowMs=15*60*1000;
 await pool.execute('DELETE FROM admin_login_limits WHERE window_started_at < ? LIMIT 100',[now-24*60*60*1000]);
 const keys=[createHmac('sha256',secret).update('ip:'+ip).digest('hex'),createHmac('sha256',secret).update('email:'+email.trim().toLowerCase()).digest('hex')];
 for(const key of keys){
  await pool.execute('INSERT INTO admin_login_limits (key_hash, attempts, window_started_at) VALUES (?, 1, ?) ON DUPLICATE KEY UPDATE attempts = IF(window_started_at <= ?, 1, attempts + 1), window_started_at = IF(window_started_at <= ?, ?, window_started_at)',[key,now,now-windowMs,now-windowMs,now]);
  const [rows]=await pool.execute('SELECT attempts FROM admin_login_limits WHERE key_hash = ?',[key]);
  if(Number(rows[0].attempts)>10)return {allowed:false,keys};
 }
 return {allowed:true,keys};
}
export async function clearLoginAttempts(pool,keys){for(const key of keys)await pool.execute('DELETE FROM admin_login_limits WHERE key_hash = ?',[key])}
