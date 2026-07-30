
const VIDEO_IDS = ["xu1q9g6cG6Q", "efcKAYV2TkU", "WgfzsT_FNdU", "5hD0dbfG0KQ", "QMFi8eKfy80", "wlF-JE-bYCk", "J38rMJNGTPY", "-ZbRzfAF3ws", "OYmjtbdIAF8", "0vd1HhMuG9w", "O1Q-cv9F9iM", "7UY6gU4TFIg", "fS4uOKkMqPE", "_896l21-Id0", "AsMrSA5xBNM", "hYoBa3BQjNY", "SBSTOTKcIAo"];
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Image fallback */
$$('img[data-fallback]').forEach(img => {
  img.addEventListener('error', () => {
    if (img.src !== img.dataset.fallback) img.src = img.dataset.fallback;
  }, { once: true });
});

/* Navigation */
const menuToggle = $('#menuToggle');
const nav = $('#nav');
menuToggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
$$('.nav a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}));

/* Reveal */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .12 });
$$('.reveal').forEach(el => observer.observe(el));

/* Scroll progress */
const progress = $('#progress');
function updateProgress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
}
addEventListener('scroll', updateProgress, { passive:true });
updateProgress();

/* Space canvas */
const canvas = $('#space');
const ctx = canvas.getContext('2d');
let stars = [];
let mouseX = innerWidth / 2;
let mouseY = innerHeight / 2;
function resizeCanvas() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
  stars = Array.from({length:Math.min(95,Math.floor(innerWidth/13))}, () => ({
    x:Math.random()*innerWidth,y:Math.random()*innerHeight,z:.25+Math.random()*.9,r:.3+Math.random()*1.25,s:.025+Math.random()*.12
  }));
}
function renderStars() {
  ctx.clearRect(0,0,innerWidth,innerHeight);
  const ox=(mouseX-innerWidth/2)*.007, oy=(mouseY-innerHeight/2)*.007;
  stars.forEach(star => {
    if (!reducedMotion) star.y -= star.s;
    if(star.y < -4) {star.y=innerHeight+4;star.x=Math.random()*innerWidth}
    ctx.globalAlpha=.12+star.z*.42;
    ctx.fillStyle=star.z>.82?'#62e7ff':'#ffffff';
    ctx.beginPath();ctx.arc(star.x+ox*star.z,star.y+oy*star.z,star.r*star.z,0,Math.PI*2);ctx.fill();
  });
  ctx.globalAlpha=1;
  if (!reducedMotion) requestAnimationFrame(renderStars);
}
resizeCanvas();renderStars();
addEventListener('resize', resizeCanvas);

/* Cursor */
const cursorDot=$('#cursorDot'), cursorRing=$('#cursorRing');
let ringX=mouseX, ringY=mouseY, cursorStarted=false;
addEventListener('pointermove', e => {
  mouseX=e.clientX;mouseY=e.clientY;
  if(!cursorStarted){cursorStarted=true;cursorDot.style.opacity='1';cursorRing.style.opacity='1'}
  cursorDot.style.transform=`translate(${mouseX-3}px,${mouseY-3}px)`;
});
function animateCursor(){
  ringX+=(mouseX-ringX)*.16;ringY+=(mouseY-ringY)*.16;
  cursorRing.style.transform=`translate(${ringX-cursorRing.offsetWidth/2}px,${ringY-cursorRing.offsetHeight/2}px)`;
  requestAnimationFrame(animateCursor);
}
if(!reducedMotion)animateCursor();
$$('a,button,.project-card').forEach(el=>{
  el.addEventListener('mouseenter',()=>cursorRing.classList.add('hover'));
  el.addEventListener('mouseleave',()=>{cursorRing.classList.remove('hover','play')});
});
$$('[data-open-index],.project-card,.ring-card').forEach(el=>{
  el.addEventListener('mouseenter',()=>cursorRing.classList.add('play'));
});

/* Magnetic */
if(!reducedMotion && matchMedia('(pointer:fine)').matches){
  $$('.magnetic').forEach(el=>{
    el.addEventListener('pointermove',e=>{
      const r=el.getBoundingClientRect();
      el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.11}px,${(e.clientY-r.top-r.height/2)*.11}px)`;
    });
    el.addEventListener('pointerleave',()=>el.style.transform='');
  });
}

/* Studio tilt */
const studio=$('#studio'), screenRig=$('#screenRig');
if(!reducedMotion && matchMedia('(pointer:fine)').matches){
  studio.addEventListener('pointermove',e=>{
    const r=studio.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    screenRig.style.transform=`rotateX(${-5-y*10}deg) rotateY(${-11+x*18}deg) translateZ(12px)`;
  });
  studio.addEventListener('pointerleave',()=>screenRig.style.transform='rotateX(-5deg) rotateY(-11deg)');
}

/* Card tilt */
if(!reducedMotion && matchMedia('(pointer:fine)').matches){
  $$('.project-card').forEach(card=>{
    card.addEventListener('pointermove',e=>{
      const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`perspective(900px) rotateX(${-y*7}deg) rotateY(${x*9}deg) translateY(-6px)`;
    });
    card.addEventListener('pointerleave',()=>card.style.transform='');
  });
}

/* Modal */
const modal=$('#modal'), modalVideo=$('#modalVideo'), modalTitle=$('#modalTitle'), modalCount=$('#modalCount'), modalLink=$('#modalLink');
let activeIndex=0;
function openVideo(index){
  activeIndex=(index+VIDEO_IDS.length)%VIDEO_IDS.length;
  const id=VIDEO_IDS[activeIndex];
  const number=String(activeIndex+1).padStart(2,'0');
  modalVideo.innerHTML=`<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title="Edit ${number}" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture;web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
  modalTitle.textContent=`Edit ${number}`;
  modalCount.textContent=`${number} / ${VIDEO_IDS.length}`;
  modalLink.href=`https://www.youtube.com/watch?v=${id}`;
  modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');
  $('.modal-close')?.focus();
}
function closeVideo(){
  modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');modalVideo.innerHTML='';
}
$$('[data-open-index]').forEach(el=>el.addEventListener('click',()=>openVideo(Number(el.dataset.openIndex))));
$$('.project-card').forEach(card=>card.querySelector('.project-open').addEventListener('click',()=>openVideo(Number(card.dataset.index))));
$$('[data-close]').forEach(el=>el.addEventListener('click',closeVideo));
$('#modalPrev').addEventListener('click',()=>openVideo(activeIndex-1));
$('#modalNext').addEventListener('click',()=>openVideo(activeIndex+1));
addEventListener('keydown',e=>{
  if(!modal.classList.contains('open'))return;
  if(e.key==='Escape')closeVideo();
  if(e.key==='ArrowLeft')openVideo(activeIndex-1);
  if(e.key==='ArrowRight')openVideo(activeIndex+1);
});

/* Filters */
$$('.filter').forEach(button=>button.addEventListener('click',()=>{
  $$('.filter').forEach(b=>b.classList.remove('active'));button.classList.add('active');
  const filter=button.dataset.filter;
  $$('.project-card').forEach(card=>card.classList.toggle('hidden',filter!=='all'&&!card.classList.contains(filter)));
}));

/* 17-item 3D ring */
const ring=$('#ring'), viewport=$('#ringViewport');
const step=360/VIDEO_IDS.length;
let angle=0, dragging=false, moved=false, startX=0, startAngle=0;
function renderRing(immediate=false){
  if(immediate)ring.style.transition='none';
  ring.style.transform=`translate(-50%,-50%) rotateY(${angle}deg)`;
  if(immediate)requestAnimationFrame(()=>ring.style.transition='');
}
renderRing();
$('#ringNext').addEventListener('click',()=>{angle-=step;renderRing()});
$('#ringPrev').addEventListener('click',()=>{angle+=step;renderRing()});
viewport.addEventListener('pointerdown',e=>{
  dragging=true;moved=false;startX=e.clientX;startAngle=angle;viewport.setPointerCapture(e.pointerId);ring.style.transition='none';
});
viewport.addEventListener('pointermove',e=>{
  if(!dragging)return;
  const delta=e.clientX-startX;if(Math.abs(delta)>7)moved=true;
  angle=startAngle+delta*.22;renderRing(true);
});
function endDrag(){
  if(!dragging)return;dragging=false;angle=Math.round(angle/step)*step;ring.style.transition='';renderRing();
}
viewport.addEventListener('pointerup',endDrag);viewport.addEventListener('pointercancel',endDrag);
$$('.ring-card').forEach(card=>card.addEventListener('click',e=>{if(moved){e.preventDefault();return}openVideo(Number(card.dataset.index))}));

/* MAX interactions */
const cinematicTransition=document.getElementById('cinematicTransition');
const cinematicTitle=document.getElementById('cinematicTitle');
const baseOpenVideo=openVideo;
openVideo=function(index){
  const safe=(index+VIDEO_IDS.length)%VIDEO_IDS.length;
  cinematicTitle.textContent=`EDIT ${String(safe+1).padStart(2,'0')}`;
  cinematicTransition.classList.add('active');
  setTimeout(()=>{baseOpenVideo(safe);cinematicTransition.classList.remove('active')},590);
};
document.querySelectorAll('.project-card').forEach(card=>card.addEventListener('pointermove',e=>{
  const r=card.getBoundingClientRect();
  card.style.setProperty('--mx',`${e.clientX-r.left}px`);
  card.style.setProperty('--my',`${e.clientY-r.top}px`);
}));
const hud=document.getElementById('hudCoordinates');
window.addEventListener('pointermove',e=>{if(hud)hud.textContent=`X ${String(Math.round(e.clientX)).padStart(3,'0')} / Y ${String(Math.round(e.clientY)).padStart(3,'0')}`});
