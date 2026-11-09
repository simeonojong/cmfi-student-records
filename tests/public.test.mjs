import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeCredential,getClient,SetupRequiredError} from '../backend.mjs';
globalThis.document={querySelectorAll:()=>[],querySelector:()=>null};
globalThis.location={search:''};
const {safePhoto,profileHTML}=await import('../public.mjs');
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
test('missing backend configuration fails closed',async()=>{
 globalThis.fetch=async()=>({ok:true,json:async()=>({supabaseUrl:'',supabasePublishableKey:''})});
 await assert.rejects(getClient(),SetupRequiredError);
});
