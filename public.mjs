import {publicRecord,publicGraduates,publicGalleryPhotos,normalizeCredential} from './backend.mjs';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safePhoto(value){const s=String(value||'');return /^(photos\/[a-zA-Z0-9._-]+\.(?:jpg|jpeg|png|webp)|data:image\/(?:jpeg|png|webp);base64,[a-zA-Z0-9+/=]+)$/.test(s)||/^https:\/\/[^\s<>"']+$/.test(s)?s:'';}
function profileURL(id){return new URL('./student.html?document='+encodeURIComponent(id),import.meta.url).href;}
function docStatus(doc){return doc.revoked?'Revoked':'Active draft'}
function docLink(doc,current){return `<article class="record-document-card"><div><span class="status-pill ${doc.revoked?'revoked':''}">${doc.revoked?'REVOKED':'ACTIVE DRAFT'}</span><h3>${esc(doc.type)}</h3><p>Document ID: ${esc(doc.id)}<br>Issued: ${esc(doc.date||'Not recorded')}</p></div><a class="btn btn-outline" href="${esc(profileURL(doc.id))}">${doc.id===current?'Verified record':'Open record'} ↗</a></article>`}
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
 const d=result.document||{},s=result.student||{},picture=safePhoto(s.photo),revoked=d.revoked;
 const linkedDocs=Array.isArray(result.documents)&&result.documents.length?result.documents:[d];
 const currentId=d.id||'';
 const fields=[['Full name',s.name],['Candidate / student ID',s.id],['Gender',s.gender],['Class / grade',s.grade],['Program',s.program],['Graduation year',s.year],['Institution',s.institution||d.institution||'CMFI Bilingual High School'],['Record source',s.source],['Record status',s.status]];
 const docFields=[['Verified document',d.type],['Document ID',d.id],['Issue date',d.date],['Status',docStatus(d)],['Linked documents',linkedDocs.length]];
 const fieldHTML=rows=>`<dl class="record-fields">${rows.map(([label,value])=>`<div><dt>${label}</dt><dd>${esc(value||'Not recorded')}</dd></div>`).join('')}</dl>`;
 const grades=(Array.isArray(s.subjects)&&s.subjects.length?s.subjects:(Array.isArray(d.snapshot?.subjects)?d.snapshot.subjects:[])).filter(row=>Array.isArray(row)&&row.length>=2);
 const average=grades.length?grades.reduce((sum,row)=>sum+Number(row[1]||0),0)/grades.length:0;
 const recommendation=linkedDocs.find(doc=>doc.type==='Recommendation letter'&&doc.letter)||null;
 const transcript=linkedDocs.find(doc=>doc.type==='Transcript')||null;
 const diploma=linkedDocs.find(doc=>doc.type==='Diploma')||null;
 const photoHTML=picture?`<img class="record-photo" src="${esc(picture)}" alt="${esc(s.name)} student photo">`:`<div class="record-photo record-initial" aria-label="No student photo available">${esc((s.name||'?')[0])}</div>`;
 const statusClass=revoked?'revoked':'';
 const statusText=revoked?'DOCUMENT REVOKED':'STUDENT RECORD VERIFIED';
 const warning=revoked?'This document has been revoked. Do not rely on it as an active credential. Contact the school office for clarification.':'This QR code opens the student’s verified school record, including the WASSCE result, grades and linked academic documents. A database match does not replace the school’s official approval and authorized signature.';
 const checkedAt=result.checkedAt?'Checked against the shared database at '+esc(new Date(result.checkedAt).toUTCString()):'';
 const sourceText=s.source?'Source: '+esc(s.source)+' · ':'';
 const gradeSummary=sourceText+grades.length+' subject'+(grades.length===1?'':'s')+' recorded'+(grades.length?' · Average: '+average.toFixed(1)+' / 100':'');
 const transcriptBadge=transcript?`<span class="status-pill ${transcript.revoked?'revoked':''}">${transcript.revoked?'TRANSCRIPT REVOKED':'TRANSCRIPT LINKED'}</span>`:'';
 const gradeTable=grades.length?`<table class="public-table"><thead><tr><th>SUBJECT</th><th>SCORE / 100</th></tr></thead><tbody>${grades.map(([name,grade])=>`<tr><td>${esc(name)}</td><td>${esc(grade)}</td></tr>`).join('')}</tbody></table>`:'<p class="record-note">No academic results were recorded with this student record yet.</p>';
 const recommendationHTML=recommendation?`<section class="record-panel full"><div class="record-panel-heading"><h2>Letter of recommendation</h2><span class="status-pill ${recommendation.revoked?'revoked':''}">${recommendation.revoked?'REVOKED':'LINKED DOCUMENT'}</span></div><p class="public-letter">${esc(recommendation.letter)}</p></section>`:'';
 const diplomaBadge=diploma?`<span class="status-pill ${diploma.revoked?'revoked':''}">${diploma.revoked?'DIPLOMA REVOKED':'DIPLOMA LINKED'}</span>`:'';
 return `<section class="record-top">${photoHTML}<div class="record-title"><span class="status-pill ${statusClass}">${statusText}</span><h1>${esc(s.name)}</h1><p>${esc(s.id)}<br>${esc(s.institution||'CMFI Bilingual High School')}</p></div></section><div class="record-warning ${statusClass}">${warning}</div><div class="record-columns"><section class="record-panel"><h2>Student information</h2>${fieldHTML(fields)}</section><section class="record-panel"><h2>Verification information</h2>${fieldHTML(docFields)}<p class="record-note">${checkedAt}</p></section><section class="record-panel full"><div class="record-panel-heading"><div><h2>WASSCE result and grades</h2><p class="record-note">${gradeSummary}</p></div>${transcriptBadge}</div>${gradeTable}<p class="record-note">Results reflect the current approved school record. Individual document snapshots may show the grades saved when that document was issued.</p></section>${recommendationHTML}<section class="record-panel full"><div class="record-panel-heading"><div><h2>Academic documents</h2><p class="record-note">This student’s transcripts, recommendation letters and diploma records are linked to the same public verification page.</p></div>${diplomaBadge}</div><div class="record-document-list">${linkedDocs.map(doc=>docLink(doc,currentId)).join('')}</div></section></div>`;
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
const graduateTarget=document.querySelector('#graduateGallery');
if(graduateTarget){
 const cardHTML=student=>{const picture=safePhoto(student.photo),isGallery=Boolean(student.filename),name=isGallery?(student.title||student.filename||'CMFI gallery photo'):(student.name||'Unnamed student'),photo=picture?`<img src="${esc(picture)}" alt="${esc(name)}" loading="lazy">`:`<span class="graduate-initial">${esc((name||'?')[0])}</span>`;return `<article class="graduate-card">${photo}<div class="graduate-card-body"><span class="graduate-kicker">${isGallery?'CMFI SCHOOL GALLERY':'CMFI GRADUATE'}</span><h2>${esc(name)}</h2><p>${isGallery?'Published by CMFI Bilingual High School':`${esc(student.program||'WASSCE candidate')}${student.year?` · Class of ${esc(student.year)}`:''}`}</p>${student.id?`<span class="graduate-id">${esc(student.id)}</span>`:''}</div></article>`};
 (async()=>{try{let gallery=await publicGalleryPhotos();let graduates=await publicGraduates();if(gallery.length)graduates=[...gallery,...graduates];if(!graduates.length){const response=await fetch('./student-roster.json');if(response.ok)graduates=(await response.json()).filter(student=>student.photo)}graduateTarget.innerHTML=graduates.length?graduates.map(cardHTML).join(''):'<div class="state-card"><h2>Graduate portraits are being prepared.</h2><p>The school office has not published the gallery yet.</p></div>'}catch(error){try{const response=await fetch('./student-roster.json');const graduates=response.ok?(await response.json()).filter(student=>student.photo):[];graduateTarget.innerHTML=graduates.length?graduates.map(cardHTML).join(''):'<div class="state-card"><h2>Graduate portraits are being prepared.</h2><p>Please check back soon.</p></div>'}catch{graduateTarget.innerHTML='<div class="state-card"><h2>Graduate gallery unavailable.</h2><p>Please try again later.</p></div>'}}})();
}
