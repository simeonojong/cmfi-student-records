export const schoolName='CMFI Bilingual High School';

// Wording follows the school's supplied recommendation sample. Pronouns are
// filled from the confirmed student gender before a document can be created.
export const recommendationTemplate=`Dear Sir/Madam,

Letter of Recommendation

We are pleased to recommend {{name}}, a good scholar aspiring to enroll in your institution. Accordingly, {{name}} is a {{year}} graduate who has been a student of the above-mentioned school for over a period of time. During this time, we found {{object}} to be submissive, resolute, intellectual, meticulous and punctual in most of {{possessive}} activities.

Given these good merits, we do not hesitate to recommend {{object}} to your institution. We are quite sure that, when accepted, {{subject}} will prove {{reflexive}} trustworthy. Please find the original copy of {{possessive}} transcript attached hereto.

It is therefore our hope that you will accord {{object}} the opportunities and assistance essential to the fulfillment of {{possessive}} ambition.

Kind regards,

Simeon E. Ojong BSc. MSc.
Principal
CMFI Bilingual High School`;

export function renderWording(template,student){
 const p=student.gender==='Male'?{subject:'he',Subject:'He',object:'him',possessive:'his',reflexive:'himself'}:student.gender==='Female'?{subject:'she',Subject:'She',object:'her',possessive:'her',reflexive:'herself'}:null;
 if(!p)throw Error('Confirm Male or Female before generating a document.');
 const values={...p,name:student.name,id:student.id,year:student.year||'2026',school:schoolName};
 const result=template.replace(/\{\{(\w+)\}\}/g,(all,key)=>{if(!(key in values))throw Error('Unknown template field: '+key);return values[key]});
 if(/\{\{|\}\}/.test(result))throw Error('Check incomplete template fields.');
 return result;
}

function drawDiploma(pdf,d,assets){
 const s=d.snapshot||{};
 pdf.addImage(assets.diplomaTemplate,'JPEG',0,0,297,210);
 pdf.setTextColor(71,47,30);
 pdf.setFont('times','bold');
 pdf.setFontSize(21);
 pdf.text(String(s.name||'').toUpperCase(),148.5,98,{align:'center'});
 pdf.setFont('times','normal');
 pdf.setFontSize(9);
 pdf.text('Candidate / student number: '+(s.id||''),148.5,112,{align:'center'});
 if(assets.qr){
  pdf.setFillColor(255,255,255);pdf.roundedRect(264,164,28,36,2,2,'F');
  pdf.addImage(assets.qr,'GIF',267,167,22,22);
  pdf.setFont('helvetica','bold');pdf.setFontSize(5.5);pdf.text('SCAN TO VERIFY',278,195,{align:'center'});
 }
 pdf.setFont('helvetica','normal');pdf.setFontSize(6);pdf.setTextColor(84,58,41);
 pdf.text('Document ID: '+d.id,16,202);
 return pdf;
}

export function drawDocument(pdf,d,assets={}){
 const s=d.snapshot||{};
 if(d.type==='Diploma'&&assets.diplomaTemplate)return drawDiploma(pdf,d,assets);
 let page=0,y=0;
 function background(){
  if(assets.officialPage)pdf.addImage(assets.officialPage,'JPEG',0,0,210,297);
  else if(assets.letterhead)pdf.addImage(assets.letterhead,'PNG',18,12,178,27.76);
 }
 function header(){
  page++;background();
  pdf.setTextColor(43,48,58);pdf.setDrawColor(50,61,122);pdf.setLineWidth(.45);pdf.line(25,57,185,57);
  pdf.setFont('times','bold');pdf.setFontSize(15);pdf.text(d.type.toUpperCase(),105,70,{align:'center'});
  pdf.setFont('times','normal');pdf.setFontSize(10);y=82;
 }
 function footer(){
  pdf.setFont('helvetica','normal');pdf.setFontSize(7.5);pdf.setTextColor(74,74,80);
  pdf.text('Document ID: '+d.id,25,270);pdf.text('Verification record · '+d.date,25,276);pdf.text('Page '+page,25,282);
  if(assets.qr)pdf.addImage(assets.qr,'GIF',168,258,22,22);
  pdf.setTextColor(25,28,34);
 }
 function next(){footer();pdf.addPage();header()}
 function line(text,bold=false){if(y>246)next();pdf.setFont('times',bold?'bold':'normal');pdf.setFontSize(10.5);pdf.text(String(text),28,y);y+=5.7;}
 function paragraph(text){for(const part of String(text||'').split('\n')){if(!part){y+=4;continue}for(const l of pdf.splitTextToSize(part,154))line(l)}}
 header();
 line('Office of the Principal',true);line('Date: '+d.date);y+=5;
 line('Student: '+s.name,true);line('Candidate / student number: '+s.id);line('Gender: '+(s.gender||'Not recorded'));y+=6;
 if(d.type==='Transcript'){
  line('Official Transcript · AD 2024/2025 Graduate',true);y+=2;
  pdf.setFillColor(36,54,112);pdf.rect(28,y-4,154,9,'F');pdf.setTextColor(255,255,255);pdf.setFont('times','bold');pdf.setFontSize(9.5);pdf.text('SUBJECT',32,y+2);pdf.text('SCORE / 100',154,y+2);pdf.setTextColor(30,32,38);y+=11;
  const rows=Array.isArray(s.subjects)?s.subjects:[];
  rows.forEach(([subject,score])=>{if(y>247)next();pdf.setFont('times','normal');pdf.setFontSize(10);pdf.text(String(subject||''),32,y);pdf.text(String(score??''),160,y,{align:'right'});pdf.setDrawColor(216,218,224);pdf.setLineWidth(.2);pdf.line(28,y+2,182,y+2);y+=7});
  const average=rows.length?rows.reduce((sum,row)=>sum+Number(row[1]||0),0)/rows.length:0;y+=3;line('Average: '+average.toFixed(1)+'%',true);y+=4;
  paragraph('Remarks/Comments: Any erasure of grade(s) renders this transcript INVALID. This transcript summarizes the approved academic results held in the school record.');
 }else if(d.type==='Recommendation letter'){
  paragraph(d.letter||'');
 }else {
  paragraph('This document records '+s.name+' in the academic records of '+schoolName+'. Completion of graduation requirements must be confirmed by the institution before official issuance.');
 }
 y+=9;line('Authorized signature: ______________________________');line('Simeon E. Ojong BSc. MSc. · Principal');
 footer();return pdf;
}
