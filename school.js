const routes={'our-school':'about.html',admissions:'admissions.html',academics:'academics.html','student-life':'student-life.html','learning-hub':'learning-hub.html',graduates:'graduates.html',verification:'verify.html'};
const orderedNav=['./','about.html','admissions.html','academics.html','student-life.html','learning-hub.html','graduates.html','verify.html','contact.html'];
const addedNavLabels={'admissions.html':'Admissions','graduates.html':'Graduates'};
for(const nav of document.querySelectorAll('.nav-links,.mobile-school-links')){
 for(const [href,label] of Object.entries(addedNavLabels)){
  if(!nav.querySelector(`a[href="${href}"]`)){const link=document.createElement('a');link.href=href;link.textContent=label;nav.appendChild(link)}
 }
 for(const href of orderedNav){const link=nav.querySelector(`a[href="${href}"]`);if(link)nav.appendChild(link)}
}
for(const nav of document.querySelectorAll('.nav-links')){
 const extraLinks=['learning-hub.html','graduates.html'].map(href=>nav.querySelector(`a[href="${href}"]`)).filter(Boolean);
 if(extraLinks.length&&!nav.querySelector('.nav-more')){
  const more=document.createElement('details');more.className='nav-more';
  const summary=document.createElement('summary');summary.textContent='More';
  const panel=document.createElement('div');
  extraLinks.forEach(link=>panel.appendChild(link));
  more.append(summary,panel);nav.appendChild(more);
  if(extraLinks.some(link=>link.classList.contains('is-current')||link.getAttribute('aria-current')==='page')){more.open=true;summary.setAttribute('aria-current','page')}
 }
}
for(const bar of document.querySelectorAll('.topbar-inner')){
 if(!bar.querySelector('a[href*="facebook.com"]')){const link=document.createElement('a');link.href='https://www.facebook.com/cmfibilingualhighschool';link.target='_blank';link.rel='noopener noreferrer';link.dataset.schoolFacebook='true';link.textContent='Follow CMFI on Facebook ↗';bar.appendChild(link)}
 if(!bar.querySelector('[data-school-whatsapp]')){const link=document.createElement('a');link.href='https://wa.me/231880755412';link.target='_blank';link.rel='noopener noreferrer';link.dataset.schoolWhatsapp='true';link.textContent='WhatsApp +231 88 075 5412';bar.appendChild(link)}
 if(!bar.querySelector('[data-school-direct-call]')){const link=document.createElement('a');link.href='tel:+231777755413';link.dataset.schoolDirectCall='true';link.textContent='Call 0777 755 413';bar.appendChild(link)}
}
for(const footer of document.querySelectorAll('.school-footer-grid>div:last-child')){
 if(!footer.querySelector('a[href*="facebook.com"]')){const link=document.createElement('a');link.href='https://www.facebook.com/cmfibilingualhighschool';link.target='_blank';link.rel='noopener noreferrer';link.dataset.schoolFacebook='true';link.textContent='Follow us on Facebook ↗';footer.appendChild(link)}
}
for(const footer of document.querySelectorAll('.school-footer-grid>div:last-child')){
 if(!footer.querySelector('[data-school-whatsapp]')){const link=document.createElement('a');link.href='https://wa.me/231880755412';link.target='_blank';link.rel='noopener noreferrer';link.dataset.schoolWhatsapp='true';link.textContent='WhatsApp: +231 88 075 5412';footer.appendChild(link)}
 if(!footer.querySelector('[data-school-direct-call]')){const link=document.createElement('a');link.href='tel:+231777755413';link.dataset.schoolDirectCall='true';link.textContent='Direct call: 0777 755 413';footer.appendChild(link)}
}
const contactDetails=document.querySelector('.contact-info-card dl');
if(contactDetails&&!contactDetails.querySelector('[data-school-whatsapp]')){
 const addContact=(label,text,href,options={})=>{const item=document.createElement('div');const term=document.createElement('dt');term.textContent=label;const description=document.createElement('dd');const link=document.createElement('a');link.href=href;link.textContent=text;Object.assign(link,options);description.appendChild(link);item.append(term,description);contactDetails.appendChild(item)};
 addContact('WhatsApp','+231 88 075 5412','https://wa.me/231880755412',{target:'_blank',rel:'noopener noreferrer'});
 addContact('Direct call','0777 755 413','tel:+231777755413');
}
for(const explore of document.querySelectorAll('.school-footer-grid>div:nth-child(2)')){
 for(const [href,label] of [['admissions.html','Admissions'],['graduates.html','Graduates']]){
  if(!explore.querySelector(`a[href="${href}"]`)){const link=document.createElement('a');link.href=href;link.textContent=label;explore.appendChild(link)}
 }
}
for(const footer of document.querySelectorAll('.footer-bottom')){
 if(!footer.querySelector('[data-soumed-credit]')){const credit=document.createElement('span');credit.className='soumed-credit';credit.dataset.soumedCredit='true';credit.append('Powered by ');const link=document.createElement('a');link.href='https://soumed.org';link.target='_blank';link.rel='noopener noreferrer';link.textContent='SouMed Technologies';credit.append(link);footer.appendChild(credit)}
 footer.classList.add('has-soumed-credit');
}
if(!document.querySelector('link[data-site-essentials]')){const link=document.createElement('link');link.rel='stylesheet';link.href='site-essentials.css?v=school-pages-20261110-soumed-responsive';link.dataset.siteEssentials='true';document.head.appendChild(link)}
function injectHomeEssentials(){
 const main=document.querySelector('main');
 if(!main||!main.querySelector('.school-hero')||main.querySelector('.essential-home-section'))return;
 const cta=main.querySelector('.standalone-cta');
 const html=`<section class="essential-section essential-home-section"><div class="wrap"><div class="essential-intro"><div class="eyebrow">ESSENTIAL SCHOOL INFORMATION</div><h2>Everything families need,<br><em>in one place.</em></h2><p>Learn how to join CMFI, build strong study habits and use the school’s public services.</p></div><div class="essential-grid"><article class="essential-card featured"><div class="eyebrow">FOR NEW FAMILIES</div><h3>Admissions & enrolment</h3><p>Understand the enquiry process, prepare your documents and contact the school office for current dates and requirements.</p><a href="admissions.html">Explore admissions ↗</a></article><article class="essential-card"><div class="eyebrow">LEARNING SUPPORT</div><h3>Build better study habits.</h3><p>Open practical guides for planning, reading, writing, maths and assessment preparation.</p><a href="learning-hub.html">Open the learning hub ↗</a></article><article class="essential-card"><div class="eyebrow">PUBLIC SERVICE</div><h3>Verify a document</h3><p>Scan a QR code or enter a document ID to open the official CMFI student record and verification status.</p><a href="verify.html">Open verification ↗</a></article></div></div></section>`;
 const platformHtml=`<section class="platform-section" data-reveal-group><div class="wrap"><div class="platform-heading"><div><div class="eyebrow">CMFI SCHOOL PLATFORM</div><h2>From the classroom<br><em>to the next chapter.</em></h2></div><div class="platform-status"><span></span> School information, connected</div></div><div class="platform-layout"><article class="platform-feature"><div class="platform-feature-mark">CMFI / 01</div><h3>One school story, easy to follow.</h3><p>Move from admissions and learning support to student life, graduate portraits and official document verification without losing your way.</p><a class="platform-link" href="about.html">See how CMFI works ↗</a></article><div class="platform-grid"><article class="platform-card"><span>01 / LEARN</span><h3>Academic pathways</h3><p>Explore subjects, study guides and assessment preparation.</p><a href="academics.html">Explore academics ↗</a></article><article class="platform-card"><span>02 / CONNECT</span><h3>Student community</h3><p>Meet the values, people and graduate stories behind CMFI.</p><a href="student-life.html">Discover student life ↗</a></article><article class="platform-card"><span>03 / RECORD</span><h3>Verified credentials</h3><p>Use a QR code or document ID to confirm a school record.</p><a href="verify.html">Verify a document ↗</a></article><article class="platform-card"><span>04 / NEXT</span><h3>Graduate gallery</h3><p>Celebrate the students whose next chapter starts here.</p><a href="graduates.html">View graduates ↗</a></article></div></div></div></section><section class="journey-section" data-reveal-group><div class="wrap"><div class="journey-heading"><div><div class="eyebrow">YOUR CMFI JOURNEY</div><h2>A clearer path through school life.</h2></div><p>Each page has one job, so families can find the right information quickly on a phone, tablet or desktop.</p></div><div class="journey-grid"><article><b>01</b><h3>Discover</h3><p>Learn about our school, values and admissions process.</p></article><article><b>02</b><h3>Learn</h3><p>Use practical resources to build confident study habits.</p></article><article><b>03</b><h3>Connect</h3><p>Explore student life, graduates and school updates.</p></article><article><b>04</b><h3>Verify</h3><p>Open the official student record behind a credential.</p></article></div><div class="platform-contact"><div><span class="eyebrow">NEED HELP?</span><h3>Talk with the school office.</h3></div><div class="platform-contact-links"><a href="https://wa.me/231880755412" target="_blank" rel="noopener noreferrer">WhatsApp +231 88 075 5412 ↗</a><a href="tel:+231777755413">Call 0777 755 413 ↗</a></div></div></div></section>`;
 if(cta)cta.insertAdjacentHTML('beforebegin',html+platformHtml);else main.insertAdjacentHTML('beforeend',html+platformHtml);
}
injectHomeEssentials();
function enhancePublicExperience(){
 document.querySelectorAll('main>section,main>header,.platform-card,.essential-card,.journey-grid article').forEach((element,index)=>{element.dataset.reveal='true';element.style.setProperty('--reveal-delay',`${Math.min(index%6,5)*70}ms`)})
 const reveal=()=>{document.querySelectorAll('[data-reveal]').forEach(element=>{if(element.getBoundingClientRect().top<window.innerHeight*.9)element.classList.add('is-visible')})};
 if(typeof IntersectionObserver==='undefined'){reveal()}else{const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}),{threshold:.12});document.querySelectorAll('[data-reveal]').forEach(element=>observer.observe(element))}
 addEventListener('scroll',()=>document.querySelector('.school-header')?.classList.toggle('is-scrolled',scrollY>18),{passive:true});
 document.querySelectorAll('.mobile-school-links a').forEach(link=>link.addEventListener('click',()=>{const menu=link.closest('details');if(menu)menu.open=false}));
}
enhancePublicExperience();
function handlePageLink(){
 const id=location.hash.slice(1),page=location.pathname.split('/').pop()||'index.html';
 // Preserve bookmarks and links shared before the individual pages were created.
 if(page==='index.html'&&id){
  const target=routes[id]||(id.startsWith('guide-')?'learning-hub.html#'+encodeURIComponent(id):null);
  if(target){location.replace(new URL(target,location.href).href);return;}
 }
 const target=document.getElementById(id);
 if(target?.matches('details.learning-guide'))target.open=true;
}
for(const link of document.querySelectorAll('.nav-links a,.mobile-school-links a')){
 const target=new URL(link.href,location.href).pathname.replace(/index\.html$/,'').replace(/\/$/,'');
 const current=location.pathname.replace(/index\.html$/,'').replace(/\/$/,'');
 if(target===current){link.setAttribute('aria-current','page');link.classList.add('is-current');}
}
for(const more of document.querySelectorAll('.nav-more')){
 const active=more.querySelector('a[aria-current="page"]');
 if(active){more.open=true;more.querySelector('summary')?.setAttribute('aria-current','page')}
}
addEventListener('hashchange',handlePageLink);
handlePageLink();
