import {test} from 'node:test';
import assert from 'node:assert/strict';
import {detectImageType,MAX_IMAGE_BYTES} from '../lib/uploads.mjs';
test('only supported image signatures are recognized',()=>{const png=Buffer.from('89504e470d0a1a0a00000000','hex');const jpg=Buffer.from('ffd8ffe00000000000000000','hex');const webp=Buffer.from('524946460000000057454250','hex');assert.equal(detectImageType(png).ext,'png');assert.equal(detectImageType(jpg).ext,'jpg');assert.equal(detectImageType(webp).ext,'webp');assert.equal(detectImageType(Buffer.from('<svg onload=alert(1)>')),null);assert.equal(detectImageType(Buffer.from('ffd8ff','hex')),null)});
test('server upload limit stays below the Vercel function payload limit',()=>assert.ok(MAX_IMAGE_BYTES+10000<4500000));
