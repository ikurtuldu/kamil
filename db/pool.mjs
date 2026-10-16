import mysql from 'mysql2/promise';
import {attachDatabasePool} from '@vercel/functions';
export function databaseConfigured(){return ['MYSQL_HOST','MYSQL_DATABASE','MYSQL_USER','MYSQL_PASSWORD'].every(k=>Boolean(process.env[k]))}
export function getPool(){
 if(!databaseConfigured())throw new Error('MYSQL_NOT_CONFIGURED');
 if(!globalThis.__nordraumPool){
  const connectionLimit=Math.max(1,Math.min(10,Number(process.env.MYSQL_CONNECTION_LIMIT)||3));
  const pool=mysql.createPool({host:process.env.MYSQL_HOST,port:Number(process.env.MYSQL_PORT||3306),database:process.env.MYSQL_DATABASE,user:process.env.MYSQL_USER,password:process.env.MYSQL_PASSWORD,charset:'utf8mb4',timezone:'Z',jsonStrings:true,connectionLimit,maxIdle:connectionLimit,idleTimeout:5000,waitForConnections:true,queueLimit:50,connectTimeout:10000,enableKeepAlive:true,multipleStatements:false,ssl:process.env.MYSQL_SSL==='false'?undefined:{rejectUnauthorized:true,...(process.env.MYSQL_SSL_CA?{ca:process.env.MYSQL_SSL_CA.replace(/\\n/g,'\n')}:{})}});
  if(process.env.VERCEL)attachDatabasePool(pool);
  globalThis.__nordraumPool=pool;
 }
 return globalThis.__nordraumPool;
}
