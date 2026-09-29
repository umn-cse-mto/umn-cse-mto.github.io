// Segmented toggles: a .swap container holds buttons [data-show=x] and views [data-view=x].
// Without JS every view stays visible; with JS only the pressed button's view is shown.
document.querySelectorAll('.swap').forEach(box=>{
  const show=b=>{
    box.querySelectorAll('[data-view]').forEach(v=>v.hidden=v.dataset.view!==b.dataset.show);
    box.querySelectorAll('[data-show]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  };
  box.addEventListener('click',e=>{const b=e.target.closest('[data-show]');if(b)show(b)});
  const start=box.querySelector(`[data-show="${location.hash.slice(1)}"]`)||box.querySelector('[data-show][aria-pressed=true]');
  if(start){show(start);box.classList.add("on")}
});
