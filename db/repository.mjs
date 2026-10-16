import {randomUUID} from 'node:crypto';
import {defaults,validateContent,normalizeContent} from '../lib/content.mjs';
export class CmsError extends Error {constructor(message,status=400){super(message);this.status=status}}
const unpack=row=>({data:normalizeContent(typeof row.document==='string'?JSON.parse(row.document):row.document),version:Number(row.version),updatedAt:row.updated_at});
export function repository(pool){
 async function read(id='published'){
  if(!['draft','published'].includes(id))throw new CmsError('İçerik türü geçersiz.');
  const [rows]=await pool.execute('SELECT document, version, updated_at FROM site_content WHERE id = ?',[id]);
  return rows.length?unpack(rows[0]):{data:structuredClone(defaults),version:0,updatedAt:null};
 }
 async function snapshot(){
  const [draft,published,[history]]=await Promise.all([read('draft'),read(),pool.execute('SELECT id, created_at, author FROM content_history ORDER BY created_at DESC, id DESC LIMIT 20')]);
  return {draft,published,history};
 }
 async function write(body){
  if(!['save','publish','restore'].includes(body.action)||!Number.isSafeInteger(body.version)||body.version<0||typeof body.author!=='string'||!body.author||body.author.length>255)throw new CmsError('İstek geçersiz.');
  if(body.action==='restore'&&(typeof body.historyId!=='string'||body.historyId.length!==36))throw new CmsError('Sürüm kimliği geçersiz.');
  let data;
  if(body.action!=='restore'){try{data=validateContent(body.data)}catch(e){throw new CmsError(e.message)}}
  const connection=await pool.getConnection();
  try{
   await connection.beginTransaction();
   const now=new Date().toISOString();
   // The initial insert also locks the draft row, including concurrent first saves.
   await connection.execute('INSERT INTO site_content (id, document, version, updated_at) VALUES (?, ?, 0, ?) ON DUPLICATE KEY UPDATE id = id',['draft',JSON.stringify(defaults),now]);
   const [rows]=await connection.execute('SELECT version FROM site_content WHERE id = ? FOR UPDATE',['draft']);
   if(Number(rows[0].version)!==body.version)throw new CmsError('İçerik başka bir sekmede değiştirildi. Önce güncel içeriği yükleyin.',409);
   if(body.action==='restore'){
    const [history]=await connection.execute('SELECT document FROM content_history WHERE id = ?',[body.historyId]);
    if(!history.length)throw new CmsError('Sürüm bulunamadı.',404);
    const restored=typeof history[0].document==='string'?JSON.parse(history[0].document):history[0].document;
    try{data=validateContent(restored)}catch(e){throw new CmsError(e.message)}
   }
   const document=JSON.stringify(data),version=body.version+1;
   await connection.execute('UPDATE site_content SET document = ?, version = ?, updated_at = ? WHERE id = ?',[document,version,now,'draft']);
   if(body.action==='publish'){
    await connection.execute('INSERT INTO content_history (id, document, created_at, author) VALUES (?, ?, ?, ?)',[randomUUID(),document,now,body.author]);
    await connection.execute('INSERT INTO site_content (id, document, version, updated_at) VALUES (?, ?, 1, ?) ON DUPLICATE KEY UPDATE document = ?, version = version + 1, updated_at = ?',['published',document,now,document,now]);
   }
   await connection.commit();
   return {version,updatedAt:now,published:body.action==='publish'};
  }catch(e){await connection.rollback();throw e}finally{connection.release()}
 }
 return {read,snapshot,write};
}
