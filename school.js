const routes={'our-school':'about.html',admissions:'admissions.html',academics:'academics.html','student-life':'student-life.html',news:'news.html','learning-hub':'learning-hub.html',graduates:'graduates.html',verification:'verify.html'};
const orderedNav=['./','about.html','admissions.html','academics.html','student-life.html','news.html','learning-hub.html','graduates.html','verify.html','contact.html'];
const addedNavLabels={'admissions.html':'Admissions','news.html':'News & events','graduates.html':'Graduates'};
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
}
for(const footer of document.querySelectorAll('.school-footer-grid>div:last-child')){
 if(!footer.querySelector('a[href*="facebook.com"]')){const link=document.createElement('a');link.href='https://www.facebook.com/cmfibilingualhighschool';link.target='_blank';link.rel='noopener noreferrer';link.dataset.schoolFacebook='true';link.textContent='Follow us on Facebook ↗';footer.appendChild(link)}
}
for(const explore of document.querySelectorAll('.school-footer-grid>div:nth-child(2)')){
 for(const [href,label] of [['admissions.html','Admissions'],['news.html','News & events'],['graduates.html','Graduates']]){
  if(!explore.querySelector(`a[href="${href}"]`)){const link=document.createElement('a');link.href=href;link.textContent=label;explore.appendChild(link)}
 }
}
if(!document.querySelector('link[data-site-essentials]')){const link=document.createElement('link');link.rel='stylesheet';link.href='site-essentials.css?v=school-pages-20261110';link.dataset.siteEssentials='true';document.head.appendChild(link)}
function injectHomeEssentials(){
 const main=document.querySelector('main');
 if(!main||!main.querySelector('.school-hero')||main.querySelector('.essential-home-section'))return;
 const cta=main.querySelector('.standalone-cta');
 const html=`<section class="essential-section essential-home-section"><div class="wrap"><div class="essential-intro"><div class="eyebrow">ESSENTIAL SCHOOL INFORMATION</div><h2>Everything families need,<br><em>in one place.</em></h2><p>Learn how to join CMFI, follow school announcements, and find the services that keep students and families connected.</p></div><div class="essential-grid"><article class="essential-card featured"><div class="eyebrow">FOR NEW FAMILIES</div><h3>Admissions & enrolment</h3><p>Understand the enquiry process, prepare your documents and contact the school office for current dates and requirements.</p><a href="admissions.html">Explore admissions ↗</a></article><article class="essential-card"><div class="eyebrow">STAY CONNECTED</div><h3>News & events</h3><p>Find the latest school announcements, learning highlights, community moments and links to the official Facebook page.</p><a href="news.html">Read school news ↗</a></article><article class="essential-card"><div class="eyebrow">PUBLIC SERVICE</div><h3>Verify a document</h3><p>Scan a QR code or enter a document ID to open the official CMFI student record and verification status.</p><a href="verify.html">Open verification ↗</a></article></div></div></section>`;
 if(cta)cta.insertAdjacentHTML('beforebegin',html);else main.insertAdjacentHTML('beforeend',html);
}
injectHomeEssentials();
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
