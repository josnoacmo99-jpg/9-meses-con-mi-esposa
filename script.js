
(() => {
  const photos = [...document.querySelectorAll('.interactive-photo')];
  const modal = document.getElementById('secretModal');
  const tip = document.getElementById('exploreTip');
  let z = 20;
  let drag = null;

  // Give every photo an independent starting position across the entire viewport.
  function scatter() {
    const W = window.innerWidth, H = window.innerHeight;
    photos.forEach((p, i) => {
      const w = 82 + Math.random()*48;
      const h = w * 1.22;
      const x = Math.random() * Math.max(1, W-w);
      const y = Math.random() * Math.max(1, H-h);
      const r = -14 + Math.random()*28;
      p.style.width = w + 'px';
      p.style.height = h + 'px';
      p.style.setProperty('--x', x+'px');
      p.style.setProperty('--y', y+'px');
      p.style.setProperty('--r', r+'deg');
      p.style.zIndex = 7 + i;
      p.dataset.x=x; p.dataset.y=y; p.dataset.r=r;
    });
  }
  scatter();

  // Gentle floating motion, never constrained to one side.
  let t0 = performance.now();
  function floatPhotos(now) {
    const t = (now-t0)/1000;
    photos.forEach((p,i)=>{
      if (drag && drag.p===p) return;
      const bx = parseFloat(p.dataset.x||0);
      const by = parseFloat(p.dataset.y||0);
      const br = parseFloat(p.dataset.r||0);
      const dx = Math.sin(t*(0.45+i*0.013)+i)*5;
      const dy = Math.cos(t*(0.38+i*0.011)+i*0.7)*7;
      const dr = Math.sin(t*0.32+i)*2;
      p.style.setProperty('--x',(bx+dx)+'px');
      p.style.setProperty('--y',(by+dy)+'px');
      p.style.setProperty('--r',(br+dr)+'deg');
    });
    requestAnimationFrame(floatPhotos);
  }
  requestAnimationFrame(floatPhotos);

  photos.forEach((p)=>{
    let downX=0, downY=0, baseX=0, baseY=0, moved=false, timer=null;

    p.addEventListener('pointerdown',(e)=>{
      e.preventDefault();
      e.stopPropagation();
      p.setPointerCapture?.(e.pointerId);
      const rect=p.getBoundingClientRect();
      downX=e.clientX; downY=e.clientY;
      baseX=rect.left; baseY=rect.top;
      moved=false;
      drag={p};
      p.classList.add('dragging');
      p.style.zIndex=++z;
      clearTimeout(timer);
      timer=setTimeout(()=>{
        if(!moved) p.classList.toggle('zoomed');
      },600);
    });

    p.addEventListener('pointermove',(e)=>{
      if(!drag || drag.p!==p) return;
      e.preventDefault();
      const dx=e.clientX-downX, dy=e.clientY-downY;
      if(Math.hypot(dx,dy)>6){
        moved=true;
        clearTimeout(timer);
        p.classList.remove('zoomed');
      }
      const nx=Math.max(-10,Math.min(window.innerWidth-20,baseX+dx));
      const ny=Math.max(-10,Math.min(window.innerHeight-20,baseY+dy));
      p.dataset.x=nx; p.dataset.y=ny;
      p.style.setProperty('--x',nx+'px');
      p.style.setProperty('--y',ny+'px');
    });

    function release(e){
      if(!drag || drag.p!==p) return;
      clearTimeout(timer);
      p.releasePointerCapture?.(e.pointerId);
      p.classList.remove('dragging');
      drag=null;
    }
    p.addEventListener('pointerup',release);
    p.addEventListener('pointercancel',release);

    p.addEventListener('click',(e)=>{
      e.stopPropagation();
      if(moved) return;
      if(p.dataset.secret==='true'){
        modal?.classList.add('show');
        modal?.setAttribute('aria-hidden','false');
      }
    });
  });

  document.getElementById('closeTip')?.addEventListener('click',()=>tip?.remove());
  setTimeout(()=>tip?.remove(),10000);
  document.getElementById('modalClose')?.addEventListener('click',()=>{
    modal?.classList.remove('show');
    modal?.setAttribute('aria-hidden','true');
  });
  modal?.addEventListener('click',(e)=>{
    if(e.target===modal){
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden','true');
    }
  });

  window.addEventListener('resize',()=>{
    photos.forEach(p=>{
      const w=p.getBoundingClientRect().width;
      const x=Math.min(parseFloat(p.dataset.x||0),Math.max(0,innerWidth-w));
      const y=Math.min(parseFloat(p.dataset.y||0),Math.max(0,innerHeight-p.getBoundingClientRect().height));
      p.dataset.x=x; p.dataset.y=y;
    });
  });
})();
