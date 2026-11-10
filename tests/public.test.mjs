import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeCredential,getClient,SetupRequiredError} from '../backend.mjs';
globalThis.document={querySelectorAll:()=>[],querySelector:()=>null};
globalThis.location={search:''};
const {safePhoto,profileHTML}=await import('../public.mjs');
import {recommendationTemplate,renderWording} from '../document-template.mjs';
test('credential IDs accept QR links without following external URLs',()=>{
 assert.equal(normalizeCredential('sch-1234abcd'),'SCH-1234ABCD');
 assert.equal(normalizeCredential('https://example.test/student.html?document=SCH-12345678-1234-1234-1234-123456789ABC'),'SCH-12345678-1234-1234-1234-123456789ABC');
 assert.equal(normalizeCredential('https://example.test/?verify=SCH-1234ABCD'),'SCH-1234ABCD');
 for(const input of ['','2101772001','javascript:alert(1)','https://example.test/?name=Student','SCH-'+('A'.repeat(100))])assert.throws(()=>normalizeCredential(input));
});
test('student profiles escape untrusted fields and block unsafe photo URLs',()=>{
 const html=profileHTML({student:{name:'<script>alert(1)</script>',id:'ID',photo:'javascript:alert(1)'},document:{id:'SCH-1234ABCD',type:'Recommendation letter',revoked:true,letter:'<img src=x onerror=alert(1)>',snapshot:{subjects:[['<b>Math</b>',80]]}}});
 assert(!html.includes('<script>'));assert(!html.includes('src="javascript:'));assert(html.includes('&lt;script&gt;'));assert(html.includes('DOCUMENT REVOKED'));assert(html.includes('&lt;b&gt;Math'));
 assert.equal(safePhoto('photos/123.jpg'),'photos/123.jpg');assert.equal(safePhoto('data:image/svg+xml;base64,AAAA'),'');assert.equal(safePhoto('https://example.test/portrait.jpg'),'https://example.test/portrait.jpg');
});
test('matching drafts are never labeled official credentials',()=>{
 const html=profileHTML({student:{name:'Test Student',id:'ID'},document:{id:'SCH-1234ABCD',type:'Transcript',revoked:false,snapshot:{subjects:[]}}});
 assert(html.includes('Active draft'));assert(html.includes('does not replace the school’s official approval'));assert(html.includes('No academic results'));
});
test('verified profiles include linked WASSCE results and all document types',()=>{
 const html=profileHTML({student:{name:'Test Student',id:'ID',gender:'Female',subjects:[['Mathematics',90]],source:'WASSCE 2026 result'},document:{id:'SCH-1234ABCD',type:'Transcript',revoked:false,date:'2026-11-10',snapshot:{subjects:[['Mathematics',90]]}},documents:[
  {id:'SCH-1234ABCD',type:'Transcript',revoked:false,date:'2026-11-10'},
  {id:'SCH-5678ABCD',type:'Recommendation letter',revoked:false,date:'2026-11-10',letter:'We recommend her.'},
  {id:'SCH-9012ABCD',type:'Diploma',revoked:false,date:'2026-11-10'}
 ]});
 assert(html.includes('WASSCE result and grades'));assert(html.includes('WASSCE 2026 result'));assert(html.includes('Mathematics'));assert(html.includes('Recommendation letter'));assert(html.includes('Diploma'));assert(html.includes('We recommend her.'));
});
test('official recommendation wording follows the confirmed gender',()=>{
 const female=renderWording(recommendationTemplate,{name:'Ada Student',id:'2101772001',year:'2026',gender:'Female'});
 const male=renderWording(recommendationTemplate,{name:'Ben Student',id:'2101772002',year:'2026',gender:'Male'});
 assert(female.includes('her transcript'));assert(female.includes('she will prove herself trustworthy'));assert(!female.includes(' his '));
 assert(male.includes('his transcript'));assert(male.includes('he will prove himself trustworthy'));assert(!male.includes(' her '));
});
test('missing backend configuration fails closed',async()=>{
 globalThis.fetch=async()=>({ok:true,json:async()=>({supabaseUrl:'',supabasePublishableKey:''})});
 await assert.rejects(getClient(),SetupRequiredError);
});
