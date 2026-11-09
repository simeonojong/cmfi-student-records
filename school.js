// Keep in-page links to a study guide useful even when that guide is collapsed.
function openLinkedGuide(){
 const id=location.hash.slice(1);if(!id)return;
 const target=document.getElementById(id);
 if(target?.matches('details.learning-guide'))target.open=true;
}
addEventListener('hashchange',openLinkedGuide);
openLinkedGuide();
