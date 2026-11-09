export const schoolName='CMFI Bilingual High School';
export const recommendationTemplate=`To Whom It May Concern,\n\nI am pleased to recommend {{name}}, a student whose academic record is maintained by CMFI Bilingual High School. This letter is prepared in support of {{possessive}} application for further education or other academic opportunities.\n\n{{Subject}} has a student record with our institution under candidate/student number {{id}}. The accompanying transcript summarizes {{possessive}} approved academic results. Please refer to that transcript when assessing {{possessive}} academic performance.\n\nWe respectfully ask that you consider {{object}} for the opportunity for which {{subject}} is applying. Please contact the Office of the Principal if further confirmation of {{possessessive}} record is required.\n\nYours faithfully,\nOffice of the Principal` .replace('{{possessessive}}','{{possessive}}');
export function renderWording(template,student){
 const p=student.gender==='Male'?{subject:'he',Subject:'He',object:'him',possessive:'his',reflexive:'himself'}:student.gender==='Female'?{subject:'she',Subject:'She',object:'her',possessive:'her',reflexive:'herself'}:null;
 if(!p)throw Error('Confirm Male or Female before generating a document.');
 const values={...p,name:student.name,id:student.id};
 const result=template.replace(/\{\{(\w+)\}\}/g,(all,key)=>{if(!(key in values))throw Error('Unknown template field: '+key);return values[key]});
 if(/\{\{|\}\}/.test(result))throw Error('Check incomplete template fields.');
 return result;
}
export function drawDocument(pdf,d,assets={}){
 const s=d.snapshot;let page=0,y=0;
 function header(){page++;pdf.setFillColor(32,28,180);pdf.rect(9,8,2,280,'F');if(assets.letterhead)pdf.addImage(assets.letterhead,'PNG',18,12,178,27.76);else{pdf.setFontSize(17);pdf.text(schoolName,20,25)}pdf.setTextColor(100);pdf.setFontSize(8);pdf.text('DRAFT - REQUIRES INSTITUTIONAL APPROVAL',105,46,{align:'center'});pdf.setTextColor(20);pdf.setFont('times','bold');pdf.setFontSize(16);pdf.text(d.type.toUpperCase(),105,59,{align:'center'});pdf.setFont('times','normal');pdf.setFontSize(11);y=72;}
 function footer(){pdf.setFont('helvetica','normal');pdf.setFontSize(8);pdf.setTextColor(80);pdf.text('Document ID: '+d.id,20,269);pdf.text('Draft verification record - '+d.date,20,275);pdf.text('Page '+page,20,281);if(assets.qr)pdf.addImage(assets.qr,'GIF',170,260,23,23);pdf.setTextColor(20)}
 function next(){footer();pdf.addPage();header()}
 function line(t,bold=false){if(y>247)next();pdf.setFont('times',bold?'bold':'normal');pdf.setFontSize(11);pdf.text(t,22,y);y+=6;}
 function paragraph(t){for(const part of t.split('\n')){if(!part){y+=4;continue}for(const l of pdf.splitTextToSize(part,165))line(l)}}
 header();line('Office of the Principal',true);line('Date: '+d.date);y+=5;
 line('Student: '+s.name,true);line('Candidate / student number: '+s.id);line('Gender: '+s.gender);y+=5;
 if(d.type==='Transcript'){
  line('ACADEMIC RECORD',true);line('Subject                                                     Score (out of 100)',true);
  for(const [subject,score] of s.subjects){if(y>242)next();pdf.setFont('times','normal');for(const l of pdf.splitTextToSize(subject,125)){pdf.text(l,22,y);y+=6;}pdf.text(String(score),170,y-6);}
  if(y>200)next();y+=5;line('Average: '+(s.subjects.reduce((a,x)=>a+Number(x[1]),0)/s.subjects.length).toFixed(1)+'%',true);
  y+=4;paragraph('This transcript summarizes the approved results held in the student record. It requires institutional approval and an authorized signature before official use.');
 }else if(d.type==='Recommendation letter')paragraph(d.letter);
 else paragraph('This draft records '+s.name+' in the academic records of '+schoolName+'. Completion of graduation requirements must be confirmed by the institution before official issuance.');
 y+=10;line('Authorized signature: __________________________');footer();return pdf;
}
