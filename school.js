const routes={'our-school':'about.html',academics:'academics.html','student-life':'student-life.html','learning-hub':'learning-hub.html',verification:'verify.html'};
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
addEventListener('hashchange',handlePageLink);
handlePageLink();
