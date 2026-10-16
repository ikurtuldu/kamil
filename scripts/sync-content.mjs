import {copyFile} from 'node:fs/promises';
for(const [source,target]of [['lib/content.mjs','public/content-schema.mjs'],['lib/legal.mjs','public/legal.mjs']])await copyFile(new URL('../'+source,import.meta.url),new URL('../'+target,import.meta.url));
console.log('İçerik ve hukuki şemalar eşitlendi.');
