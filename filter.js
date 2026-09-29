// Chip filters: <div class="chips" data-items="CSS selector"> with buttons data-key/data-val;
// each item carries data-<key>="a|b|c". Headings .grp-h hide when their list is empty.
document.querySelectorAll('.chips').forEach(ch=>{
  ch.hidden=false;
  const items=[...document.querySelectorAll(ch.dataset.items)],count=ch.querySelector('.count'),sel={};
  const run=()=>{let n=0;
    items.forEach(it=>{const ok=Object.entries(sel).every(([k,v])=>!v||it.dataset[k].split('|').includes(v));it.hidden=!ok;n+=ok});
    document.querySelectorAll('.grp-h').forEach(h=>{const list=h.nextElementSibling,k=[...list.children].filter(c=>!c.hidden).length;h.hidden=list.hidden=!k;if(/\(\d+\)/.test(h.textContent))h.textContent=h.textContent.replace(/\(\d+\)/,`(${k})`)});
    count.textContent=`${n} of ${items.length} ${ch.dataset.noun}`;
    if(Object.values(sel).some(Boolean))document.querySelectorAll('details.completed').forEach(d=>d.open=true);
  };
  ch.addEventListener('click',e=>{const b=e.target.closest('button[data-key]');if(!b)return;sel[b.dataset.key]=b.dataset.val;
    b.parentElement.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));run()});
  run();
});
