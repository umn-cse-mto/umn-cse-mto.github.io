const form=document.querySelector('.filters');
if(form){
  form.hidden=false;
  const fields=[...form.elements].filter(e=>e.name),items=[...document.querySelectorAll('.pubs li')],years=[...document.querySelectorAll('.pub-year')],count=form.querySelector('.count');
  const saved=new URLSearchParams(location.search);fields.forEach(e=>{if(saved.has(e.name))e.value=saved.get(e.name)});
  const run=()=>{
    const v=Object.fromEntries(fields.map(e=>[e.name,e.value.trim().toLowerCase()]));let n=0;
    items.forEach(li=>{const d=li.dataset;const ok=(!v.q||d.search.includes(v.q))&&(!v.year||d.year===v.year)&&(!v.group||d.group.split(' ').includes(v.group))&&(!v.type||d.type===v.type)&&(!v.topic||d.topics.split('|').includes(v.topic));li.hidden=!ok;n+=ok});
    years.forEach(y=>y.hidden=!y.querySelector('li:not([hidden])'));
    count.textContent=`${n} of ${items.length} papers`;
    const u=new URLSearchParams(Object.entries(v).filter(([,x])=>x));history.replaceState(null,'',u.size?'?'+u:location.pathname);
  };
  form.addEventListener('input',run);form.addEventListener('reset',()=>setTimeout(run));form.addEventListener('submit',e=>e.preventDefault());run();
}
document.addEventListener('click',e=>{const b=e.target.closest('.copy');if(!b)return;navigator.clipboard.writeText(b.previousElementSibling.textContent).then(()=>{b.textContent='Copied';setTimeout(()=>b.textContent='Copy BibTeX',1500)})});
