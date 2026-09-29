// Featured image toggle
document.querySelectorAll('.swap').forEach(fig=>fig.addEventListener('click',e=>{
  const b=e.target.closest('[data-show]');if(!b)return;
  fig.querySelectorAll('img').forEach(i=>i.hidden=i.dataset.view!==b.dataset.show);
  fig.querySelectorAll('[data-show]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
}));
