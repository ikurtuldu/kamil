import assert from 'node:assert/strict';
const base='http://127.0.0.1:4180';
for(const [path,location]of [['/','/index.html'],['/katalog','/katalog.html']]){const r=await fetch(base+path,{redirect:'manual'});assert.equal(r.status,307);assert.equal(r.headers.get('location'),location)}
for(const path of ['/index.html','/katalog.html','/app.js','/legal.mjs','/content-schema.mjs'])assert.equal((await fetch(base+path)).status,200,path);
const doc=await(await fetch(base+'/api/content')).json();assert.equal(doc.data.legal.operator.legalName,'Kamil Uzun');assert.equal(doc.demo,true);
for(const [path,needle]of [['/impressum','Kamil Uzun'],['/datenschutz','Datenschutzerklärung'],['/cookies','HttpOnly']]){const r=await fetch(base+path);assert.equal(r.status,200,path);assert.ok((await r.text()).includes(needle));assert.equal(r.headers.get('x-frame-options'),'DENY')}
for(const path of ['/api/admin','/api/content?preview=1']){const r=await fetch(base+path,{headers:{'oai-authenticated-user-id':'spoofed','oai-authenticated-user-email':'info@turkiyedenistegelsin.com'}});assert.equal(r.status,403,path)}
assert.equal((await fetch(base+'/api/upload',{method:'POST',headers:{Origin:base}})).status,403);
assert.equal((await fetch(base+'/api/auth/login',{method:'POST',headers:{Origin:'https://other.example','Content-Type':'application/json'},body:'{}'})).status,403);
assert.equal((await fetch(base+'/api/auth/login',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:'{}'})).status,503);
const logout=await fetch(base+'/api/auth/logout',{method:'POST',headers:{Origin:base}});assert.equal(logout.status,200);const cookie=logout.headers.get('set-cookie');assert.ok(cookie.includes('__Host-nordraum_session'));assert.ok(cookie.includes('HttpOnly'));assert.ok(cookie.includes('Secure'));assert.ok(cookie.includes('SameSite=strict'));
assert.equal((await fetch(base+'/media/not-an-image')).status,404);
console.log('Production HTTP checks passed: routes, demo content, legal pages, static modules, headers, protected API/preview, spoofed identity rejection, login CSRF and secure logout cookie.');
