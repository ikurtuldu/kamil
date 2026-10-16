import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sameOrigin} from '../lib/origin.mjs';
test('same-origin checks use the actual host behind Next.js URL normalization',()=>{const req=new Request('http://localhost:4180/api/auth/login',{headers:{Host:'127.0.0.1:4180',Origin:'http://127.0.0.1:4180'}});assert.ok(sameOrigin(req))});
test('Vercel HTTPS origins match the public host even with an internal request URL',()=>{const req=new Request('http://internal.local/api/admin',{headers:{Host:'site.vercel.app',Origin:'https://site.vercel.app'}});assert.ok(sameOrigin(req))});
test('cross-origin, missing and opaque origins are denied',()=>{for(const origin of ['https://attacker.example','null','']){const req=new Request('https://site.example/api/admin',{headers:{Host:'site.example',Origin:origin}});assert.equal(sameOrigin(req),false)}});
