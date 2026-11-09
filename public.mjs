import {publicRecord,normalizeCredential} from './backend.mjs';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safePhoto(value){const s=String(value||'');return /^(photos\/[a-zA-Z0-9._-]+\.(?:jpg|jpeg|png|webp)|data:image\/(?:jpeg|png|webp);base64,[a-zA-Z0-9+/=]+)$/.test(s)||/^https:\/\/[^\s<>"']+$/.test(s)?s:'';}
function profileURL(id){return new URL('./student.html?document='+encodeURIComponent(id),import.meta.url).href;}
for(const form of document.querySelectorAll('[data-verify-form]')){
 form.addEventListener('submit',async event=>{
  event.preventDefault();const button=form.querySelector('button[type=submit]'),status=form.querySelector('[data-status]');status.className='form-status';status.textContent='Looking up the document…';button.disabled=true;
  try{const id=normalizeCredential(form.elements.credential.value);const result=await publicRecord(id);
   if(!result){status.className='form-status error';status.textContent='No matching document was found. Check the full ID printed beside the QR code, or contact the school office.';return;}
   location.href=profileURL(id);
  }catch(error){status.className='form-status error';status.textContent=error.message;}finally{button.disabled=false;}
 });
}
export function profileHTML(result){
 const d=result.document,s=result.student,picture=safePhoto(s.photo),revoked=d.revoked;
 const fields=[['Full name',s.name],['Candidate / student ID',s.id],['Gender',s.gender],['Class / grade',s.grade],['Program',s.program],['Graduation year',s.year],['Institution',s.institution||d.institution||'CMFI Bilingual High School'],['Record status',s.status]];
 const docFields=[['Document type',d.type],['Document ID',d.id],['Issue date',d.date],['Status',revoked?'Revoked':'Active draft']];
 const fieldHTML=rows=>`<dl class="record-fields">${rows.map(([label,value])=>`<div><dt>${label}</dt><dd>${esc(value||'Not recorded')}</dd></div>`).join('')}</dl>`;
 const grades=d.snapshot?.subjects||[];
 return `<section class="record-top">${picture?`<img class="record-photo" src="${esc(picture)}" alt="${esc(s.name)} student photo">`:`<div class="record-photo record-initial" aria-label="No student photo available">${esc((s.name||'?')[0])}</div>`}<div class="record-title"><span class="status-pill ${revoked?'revoked':''}">${revoked?'DOCUMENT REVOKED':'DOCUMENT RECORD FOUND'}</span><h1>${esc(s.name)}</h1><p>${esc(s.id)}<br>${esc(s.institution||'CMFI Bilingual High School')}</p></div></section><div class="record-warning ${revoked?'revoked':''}">${revoked?'This document has been revoked. Do not rely on it as an active credential. Contact the school office for clarification.':'This is a matching draft document record. A database match does not replace the school’s official approval and authorized signature.'}</div><div class="record-columns"><section class="record-panel"><h2>Student information</h2>${fieldHTML(fields)}</section><section class="record-panel"><h2>Document information</h2>${fieldHTML(docFields)}<p class="record-note">${result.checkedAt?'Checked against the shared database at '+esc(new Date(result.checkedAt).toUTCString()):''}</p></section><section class="record-panel full"><h2>Academic results recorded with this document</h2>${grades.length?`<table class="public-table"><thead><tr><th>SUBJECT</th><th>SCORE / 100</th></tr></thead><tbody>${grades.map(([name,grade])=>`<tr><td>${esc(name)}</td><td>${esc(grade)}</td></tr>`).join('')}</tbody></table>`:'<p class="record-note">No academic results were recorded with this document.</p>'}<p class="record-note">Document results reflect the saved snapshot at creation. Student information above reflects the current school record.</p></section>${d.type==='Recommendation letter'&&d.letter?`<section class="record-panel full"><h2>Recommendation letter</h2><p style="white-space:pre-wrap;line-height:1.9;font-size:12px">${esc(d.letter)}</p></section>`:''}</div>`;
}
const target=document.querySelector('#studentRecord');
if(target){
 const query=new URLSearchParams(location.search),id=query.get('document')||query.get('verify');
 try{
  if(!id)throw new Error('Open this page from a document’s QR code, or enter its ID on the verification page.');
  const result=await publicRecord(id);
  if(!result)throw new Error('No matching document was found. Check the complete document ID or contact the school office.');
  document.title=result.student.name+' | CMFI verification';target.innerHTML=profileHTML(result);
 }catch(error){target.innerHTML=`<div class="state-card"><h1>${error.name==='SetupRequiredError'?'Verification service pending activation':'Unable to verify this document'}</h1><p>${esc(error.message)}</p><a class="btn btn-dark" href="verify.html">Verify another document ↗</a></div>`;}
}else{
 const id=new URLSearchParams(location.search).get('verify');if(id){try{location.replace(profileURL(normalizeCredential(id)))}catch(error){const status=document.querySelector('[data-status]');if(status){status.className='form-status error';status.textContent=error.message;document.querySelector('#verification')?.scrollIntoView();}}}
}
