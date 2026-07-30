
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

/* ===== CREATIVE WORKSTATION ===== */
const PROJECTS=[{"id": "xu1q9g6cG6Q", "title": "Awakening Protocol", "subtitle": "Ascensão, energia e impacto visual.", "category": "Anime Edit", "year": "2025", "duration": "00:23", "software": "After Effects", "tags": ["SYNC", "VFX", "MOTION", "COLOR"], "accent": "#62e7ff", "file": "Awakening_Protocol_FINAL_V1.aep"}, {"id": "efcKAYV2TkU", "title": "Limitless", "subtitle": "Ritmo agressivo e composição de alto contraste.", "category": "Anime Edit", "year": "2025", "duration": "00:26", "software": "After Effects", "tags": ["SYNC", "VFX", "MOTION", "GLITCH"], "accent": "#ff315d", "file": "Limitless_FINAL_V2.aep"}, {"id": "WgfzsT_FNdU", "title": "Fallen Kingdom", "subtitle": "Atmosfera dramática construída em camadas.", "category": "Anime Edit", "year": "2025", "duration": "00:29", "software": "After Effects", "tags": ["SYNC", "VFX", "MOTION", "SHAKE"], "accent": "#f59e0b", "file": "Fallen_Kingdom_FINAL_V3.aep"}, {"id": "5hD0dbfG0KQ", "title": "Crimson Pulse", "subtitle": "Cortes rápidos, glow e intensidade crescente.", "category": "Anime Edit", "year": "2025", "duration": "00:32", "software": "After Effects", "tags": ["SYNC", "VFX", "MOTION", "GLOW"], "accent": "#49e2a7", "file": "Crimson_Pulse_FINAL_V4.aep"}, {"id": "QMFi8eKfy80", "title": "Beyond the Frame", "subtitle": "Transições cinematográficas e movimento contínuo.", "category": "Anime Edit", "year": "2025", "duration": "00:35", "software": "After Effects", "tags": ["SYNC", "VFX", "MOTION", "COLOR"], "accent": "#8b5cf6", "file": "Beyond_the_Frame_FINAL_V5.aep"}, {"id": "wlF-JE-bYCk", "title": "Shadow Requiem", "subtitle": "Uma composição sombria guiada pela trilha.", "category": "Anime Edit", "year": "2025", "duration": "00:38", "software": "After Effects", "tags": ["SYNC", "VFX", "MOTION", "GLITCH"], "accent": "#62e7ff", "file": "Shadow_Requiem_FINAL_V6.aep"}, {"id": "J38rMJNGTPY", "title": "Final Resolve", "subtitle": "Clímax, tensão e sincronização precisa.", "category": "Anime Edit", "year": "2025", "duration": "00:41", "software": "After Effects", "tags": ["SYNC", "VFX", "MOTION", "SHAKE"], "accent": "#ff315d", "file": "Final_Resolve_FINAL_V7.aep"}, {"id": "-ZbRzfAF3ws", "title": "Neon Memory", "subtitle": "Cor, velocidade e distorção digital.", "category": "Anime Edit", "year": "2025", "duration": "00:44", "software": "After Effects", "tags": ["SYNC", "VFX", "MOTION", "GLOW"], "accent": "#f59e0b", "file": "Neon_Memory_FINAL_V8.aep"}, {"id": "OYmjtbdIAF8", "title": "Unbreakable", "subtitle": "Uma narrativa de força e transformação.", "category": "Anime Edit", "year": "2025", "duration": "00:47", "software": "After Effects", "tags": ["SYNC", "VFX", "MOTION", "COLOR"], "accent": "#49e2a7", "file": "Unbreakable_FINAL_V9.aep"}, {"id": "0vd1HhMuG9w", "title": "Chaos Theory", "subtitle": "Glitch, impacto e energia imprevisível.", "category": "Anime Edit", "year": "2025", "duration": "00:50", "software": "After Effects", "tags": ["SYNC", "VFX", "MOTION", "GLITCH"], "accent": "#8b5cf6", "file": "Chaos_Theory_FINAL_V10.aep"}, {"id": "O1Q-cv9F9iM", "title": "Last Horizon", "subtitle": "Escala épica e acabamento cinematográfico.", "category": "Anime Edit", "year": "2025", "duration": "00:53", "software": "After Effects", "tags": ["SYNC", "VFX", "MOTION", "SHAKE"], "accent": "#62e7ff", "file": "Last_Horizon_FINAL_V11.aep"}, {"id": "7UY6gU4TFIg", "title": "Silent Rage", "subtitle": "Contraste entre silêncio, tensão e explosão.", "category": "Anime Edit", "year": "2025", "duration": "00:56", "software": "After Effects", "tags": ["SYNC", "VFX", "MOTION", "GLOW"], "accent": "#ff315d", "file": "Silent_Rage_FINAL_V12.aep"}, {"id": "fS4uOKkMqPE", "title": "Redline", "subtitle": "Velocidade, shakes e edição de alta intensidade.", "category": "Cinematic Edit", "year": "2025", "duration": "00:20", "software": "After Effects", "tags": ["SYNC", "VFX", "MOTION", "COLOR"], "accent": "#f59e0b", "file": "Redline_FINAL_V13.aep"}, {"id": "_896l21-Id0", "title": "Lost Signal", "subtitle": "Ruído, scanlines e estética tecnológica.", "category": "Cinematic Edit", "year": "2025", "duration": "00:23", "software": "After Effects", "tags": ["SYNC", "VFX", "MOTION", "GLITCH"], "accent": "#49e2a7", "file": "Lost_Signal_FINAL_V14.aep"}, {"id": "AsMrSA5xBNM", "title": "Eclipse", "subtitle": "Luz e sombra em uma composição atmosférica.", "category": "Cinematic Edit", "year": "2025", "duration": "00:26", "software": "After Effects", "tags": ["SYNC", "VFX", "MOTION", "SHAKE"], "accent": "#8b5cf6", "file": "Eclipse_FINAL_V15.aep"}, {"id": "hYoBa3BQjNY", "title": "Afterimage", "subtitle": "Movimento residual, trails e sincronização.", "category": "Cinematic Edit", "year": "2025", "duration": "00:29", "software": "After Effects", "tags": ["SYNC", "VFX", "MOTION", "GLOW"], "accent": "#62e7ff", "file": "Afterimage_FINAL_V16.aep"}, {"id": "SBSTOTKcIAo", "title": "The Final Cut", "subtitle": "Uma síntese da identidade visual G3nos.", "category": "Cinematic Edit", "year": "2025", "duration": "00:32", "software": "After Effects", "tags": ["SYNC", "VFX", "MOTION", "COLOR"], "accent": "#ff315d", "file": "The_Final_Cut_FINAL_V17.aep"}];
const workstation=document.getElementById('workstation');
const wsProjects=document.getElementById('wsProjects');
const wsInfo=document.getElementById('wsInfo');
const wsInspector=document.getElementById('wsInspector');
const wsPreviewImage=document.getElementById('wsPreviewImage');
let selectedProject=0;

function cleanYouTubeTitle(title){
  return title.replace(/\s*[-|]\s*(G3nos Editz|G3nos).*$/i,'').replace(/\s*#\w+/g,'').trim();
}

async function hydrateYouTubeTitles(){
  for(let i=0;i<PROJECTS.length;i++){
    try{
      const url=`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${PROJECTS[i].id}&format=json`;
      const response=await fetch(url);
      if(!response.ok)continue;
      const data=await response.json();
      const title=cleanYouTubeTitle(data.title||'');
      if(title && !/^edit\s*\d*$/i.test(title)){
        PROJECTS[i].youtubeTitle=title;
        const name=document.querySelector(`[data-ws-project="${i}"] .ws-project-name`);
        if(name)name.textContent=title;
      }
    }catch(error){}
  }
}

function renderWsProjects(){
  wsProjects.innerHTML=PROJECTS.map((p,i)=>`
    <article class="ws-project ${i===selectedProject?'active':''}" data-ws-project="${i}" style="--project-accent:${p.accent}">
      <img src="https://i.ytimg.com/vi/${p.id}/hqdefault.jpg" alt="">
      <div class="ws-project-body">
        <strong class="ws-project-name">${p.youtubeTitle||p.title}</strong>
        <span>${p.file}</span>
      </div>
    </article>`).join('');
  document.querySelectorAll('.ws-project').forEach(card=>card.addEventListener('click',()=>selectProject(Number(card.dataset.wsProject),true)));
}

function selectProject(index,openComposition=false){
  selectedProject=index;
  const p=PROJECTS[index];
  document.querySelectorAll('.ws-project').forEach((el,i)=>el.classList.toggle('active',i===index));
  wsPreviewImage.src=`https://i.ytimg.com/vi/${p.id}/maxresdefault.jpg`;
  wsPreviewImage.onerror=()=>{wsPreviewImage.src=`https://i.ytimg.com/vi/${p.id}/hqdefault.jpg`};
  wsInfo.innerHTML=`<h3>${p.youtubeTitle||p.title}</h3><p>${p.subtitle}</p><div><span>TYPE</span><b>${p.category}</b></div><div><span>DURATION</span><b>${p.duration}</b></div><div><span>SOFTWARE</span><b>${p.software}</b></div><div><span>YEAR</span><b>${p.year}</b></div>`;
  wsInspector.innerHTML=`<small>${p.category.toUpperCase()}</small><h3>${p.youtubeTitle||p.title}</h3><p>${p.subtitle}</p><div class="ws-meta-grid"><div><span>DURAÇÃO</span><strong>${p.duration}</strong></div><div><span>ANO</span><strong>${p.year}</strong></div><div><span>SOFTWARE</span><strong>${p.software}</strong></div><div><span>FORMATO</span><strong>4K / H.264</strong></div></div><div class="ws-tags">${p.tags.map(t=>`<i>${t}</i>`).join('')}</div>`;
  document.documentElement.style.setProperty('--ws-accent',p.accent);
  if(openComposition)activateWsTab('composition');
}

function activateWsTab(name){
  document.querySelectorAll('[data-ws-tab]').forEach(b=>b.classList.toggle('active',b.dataset.wsTab===name));
  document.querySelectorAll('[data-ws-view]').forEach(v=>v.classList.toggle('active',v.dataset.wsView===name));
}

document.getElementById('openWorkstation')?.addEventListener('click',()=>{
  workstation.classList.add('open');workstation.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');
  selectProject(selectedProject);
});
document.getElementById('closeWorkstation')?.addEventListener('click',()=>{
  workstation.classList.remove('open');workstation.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');
});
document.querySelectorAll('[data-ws-tab]').forEach(button=>button.addEventListener('click',()=>activateWsTab(button.dataset.wsTab)));
document.getElementById('wsPreviewPlay')?.addEventListener('click',()=>openVideo(selectedProject));

const wave=document.querySelector('.ws-wave');
if(wave)wave.innerHTML=Array.from({length:90},(_,i)=>`<i style="height:${18+(i*37)%78}%"></i>`).join('');
if(wave)wave.style.background='none';
if(wave)wave.querySelectorAll('i').forEach(i=>{i.style.background='rgba(73,226,167,.65)';i.style.display='inline-block';i.style.marginRight='2px';i.style.width='2px'});

let renderTimer;
document.getElementById('startRender')?.addEventListener('click',()=>{
  clearInterval(renderTimer);let value=0;
  const valueEl=document.getElementById('renderPercent'),log=document.getElementById('renderLog');
  log.innerHTML='<span>Preparing composition...</span>';
  renderTimer=setInterval(()=>{
    value=Math.min(100,value+Math.ceil(Math.random()*5));valueEl.textContent=value+'%';
    const messages=['Encoding video frames...','Applying color management...','Rendering motion blur...','Processing audio...','Writing final output...'];
    log.innerHTML+=`<span><br>${messages[Math.min(messages.length-1,Math.floor(value/21))]}</span>`;
    if(value>=100){clearInterval(renderTimer);log.innerHTML+='<span><br>Render complete.</span>'}
  },140);
});

setInterval(()=>{const c=document.getElementById('wsClock');if(c)c.textContent=new Date().toLocaleTimeString('pt-BR')},1000);
renderWsProjects();selectProject(0);hydrateYouTubeTitles();

document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&workstation.classList.contains('open'))document.getElementById('closeWorkstation').click();
});
