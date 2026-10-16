import {test} from 'node:test';
import assert from 'node:assert/strict';
import {defaults} from '../public/content-schema.mjs';
import {localizeContent} from '../public/translations.mjs';

test('Turkish localization translates site navigation and content without mutating German source',()=>{
 const source=structuredClone(defaults),translated=localizeContent(source,'tr');
 assert.equal(translated.settings.language,'tr');
 assert.equal(translated.navigation.services,'Hizmetler');
 assert.equal(translated.catalog.categories[0],'Koltuklar');
 assert.equal(translated.products[0].name,'Koltuk Linde');
 assert.equal(source.navigation.services,'Leistungen');
 assert.equal(source.products[0].name,'Sofa Linde');
});

test('German remains unchanged and business facts stay shared in Turkish view',()=>{
 const source=structuredClone(defaults);
 assert.equal(localizeContent(source,'de'),source);
 const translated=localizeContent(source,'tr');
 assert.equal(translated.settings.email,source.settings.email);
 assert.equal(translated.settings.address,source.settings.address);
 assert.equal(translated.legal.operator.legalName,source.legal.operator.legalName);
 assert.equal(translated.legal.confirmed,source.legal.confirmed);
});
