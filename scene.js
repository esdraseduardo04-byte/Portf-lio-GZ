
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.179.1/+esm';

const canvas=document.getElementById('webglScene');
const boot=document.getElementById('bootScreen');
const bar=document.getElementById('bootBar');
const percent=document.getElementById('bootPercent');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let renderer;
try{
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
}catch(error){
  boot?.classList.add('done');canvas.style.display='none';console.warn('WebGL indisponível.',error);
}
if(renderer){
  document.body.classList.add('webgl-ready');
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));
  renderer.setSize(innerWidth,innerHeight);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.15;

  const scene=new THREE.Scene();
  scene.fog=new THREE.FogExp2(0x07070b,.042);
  const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.1,150);
  camera.position.set(0,.4,13);
  const world=new THREE.Group();scene.add(world);
  scene.add(new THREE.AmbientLight(0x7777aa,.5));

  const lights=[[0x62e7ff,-5,3,5,28],[0x8b5cf6,5,-1,3,34],[0xff315d,0,5,-3,20]];
  lights.forEach(([c,x,y,z,p])=>{const l=new THREE.PointLight(c,p,28,2);l.position.set(x,y,z);scene.add(l)});

  const metal=new THREE.MeshStandardMaterial({color:0x111119,metalness:.92,roughness:.18});
  const glass=new THREE.MeshPhysicalMaterial({color:0x221f39,metalness:.15,roughness:.06,transmission:.45,transparent:true,opacity:.72,thickness:.7});
  const monitor=new THREE.Group();
  const frame=new THREE.Mesh(new THREE.BoxGeometry(5.7,3.25,.23),metal);monitor.add(frame);
  const pane=new THREE.Mesh(new THREE.BoxGeometry(5.35,2.92,.08),glass);pane.position.z=.16;monitor.add(pane);
  const glow=new THREE.Mesh(new THREE.PlaneGeometry(5.18,2.75),new THREE.MeshBasicMaterial({color:0x37207e,transparent:true,opacity:.22}));glow.position.z=.22;monitor.add(glow);
  const neck=new THREE.Mesh(new THREE.BoxGeometry(.42,1.25,.35),metal);neck.position.set(0,-2.12,-.12);monitor.add(neck);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(1.65,2,.18,48),metal);base.scale.z=.45;base.position.set(0,-2.78,-.05);monitor.add(base);
  monitor.position.set(2.5,.1,-1.2);monitor.rotation.set(-.04,-.08,0);world.add(monitor);


  /* Procedural editing studio: no external model files required. */
  const floorMat=new THREE.MeshStandardMaterial({color:0x08080d,metalness:.72,roughness:.2});
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(42,28),floorMat);
  floor.rotation.x=-Math.PI/2;floor.position.set(0,-3.02,-4);world.add(floor);

  const deskMat=new THREE.MeshStandardMaterial({color:0x09090d,metalness:.55,roughness:.24});
  const desk=new THREE.Mesh(new THREE.BoxGeometry(10,.34,4.2),deskMat);
  desk.position.set(1,-2.82,-.6);world.add(desk);

  function makeSpeaker(x){
    const g=new THREE.Group();
    const box=new THREE.Mesh(new THREE.BoxGeometry(1.15,2.25,.95),metal);g.add(box);
    [0.48,0.25].forEach((r,j)=>{
      const cone=new THREE.Mesh(new THREE.CylinderGeometry(r,r*.82,.08,36),new THREE.MeshStandardMaterial({color:j?0x62e7ff:0x161620,emissive:j?0x62e7ff:0x000000,emissiveIntensity:j?.35:0,metalness:.35,roughness:.34}));
      cone.rotation.x=Math.PI/2;cone.position.set(0,j?.55:-.35,.51);g.add(cone);
    });
    g.position.set(x,-1.65,-.25);world.add(g);
  }
  makeSpeaker(-1.05);makeSpeaker(6.05);

  const keyboard=new THREE.Group();
  const kbBase=new THREE.Mesh(new THREE.BoxGeometry(3.8,.16,1.15),metal);keyboard.add(kbBase);
  for(let row=0;row<4;row++)for(let col=0;col<12;col++){
    const key=new THREE.Mesh(new THREE.BoxGeometry(.24,.07,.18),new THREE.MeshStandardMaterial({color:0x171722,emissive:(row+col)%3===0?0x8b5cf6:0x12121a,emissiveIntensity:.28,roughness:.3}));
    key.position.set(-1.55+col*.285,.12,-.35+row*.23);keyboard.add(key);
  }
  keyboard.position.set(1,-2.48,1);keyboard.rotation.y=-.04;world.add(keyboard);

  const mouse=new THREE.Mesh(new THREE.SphereGeometry(.36,28,18,0,Math.PI*2,0,Math.PI*.56),new THREE.MeshStandardMaterial({color:0x15151e,metalness:.6,roughness:.2,emissive:0x62e7ff,emissiveIntensity:.1}));
  mouse.scale.set(.72,.5,1.05);mouse.position.set(3.55,-2.48,1);world.add(mouse);

  const ledStrip=new THREE.Mesh(new THREE.BoxGeometry(10.2,.035,.035),new THREE.MeshBasicMaterial({color:0x8b5cf6}));
  ledStrip.position.set(1,-2.6,-2.62);world.add(ledStrip);

  const rings=new THREE.Group();
  [0x62e7ff,0x8b5cf6,0xff315d,0x62e7ff,0x8b5cf6].forEach((color,i)=>{
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.1+i*.55,.012+i*.002,8,160),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.18-i*.018}));
    ring.rotation.set(Math.PI/2.4+i*.18,i*.37,0);ring.userData.speed=.0015+i*.00035;rings.add(ring);
  });
  rings.position.set(-3.8,.4,-3.8);world.add(rings);

  const colors=[0x8b5cf6,0x62e7ff,0xff315d,0x49e2a7];
  const panels=[];
  for(let i=0;i<17;i++){
    const color=colors[i%4];
    const panel=new THREE.Mesh(new THREE.BoxGeometry(1.75,.72,.12),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.12,metalness:.3,roughness:.42,transparent:true,opacity:.48}));
    const a=i/17*Math.PI*2,r=5.8+(i%3)*.7;
    panel.position.set(Math.cos(a)*r,Math.sin(a*1.7)*2.4,-5+Math.sin(a)*2);
    panel.rotation.set(Math.sin(a)*.35,-a+Math.PI/2,Math.cos(a)*.18);
    panel.userData={baseY:panel.position.y,phase:Math.random()*Math.PI*2};
    panels.push(panel);world.add(panel);
  }

  const count=innerWidth<700?650:1450;
  const pos=new Float32Array(count*3),cols=new Float32Array(count*3);
  const ca=new THREE.Color(0x62e7ff),cb=new THREE.Color(0x8b5cf6),mix=new THREE.Color();
  for(let i=0;i<count;i++){
    const r=7+Math.random()*30,t=Math.random()*Math.PI*2,p=Math.acos(2*Math.random()-1);
    pos[i*3]=r*Math.sin(p)*Math.cos(t);pos[i*3+1]=r*Math.sin(p)*Math.sin(t);pos[i*3+2]=r*Math.cos(p)-9;
    mix.copy(ca).lerp(cb,Math.random());cols[i*3]=mix.r;cols[i*3+1]=mix.g;cols[i*3+2]=mix.b;
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(cols,3));
  const particles=new THREE.Points(geo,new THREE.PointsMaterial({size:.045,transparent:true,opacity:.62,vertexColors:true,blending:THREE.AdditiveBlending,depthWrite:false}));scene.add(particles);

  let px=0,py=0,scrollTarget=0,scrollCurrent=0;
  addEventListener('pointermove',e=>{px=e.clientX/innerWidth*2-1;py=-(e.clientY/innerHeight)*2+1},{passive:true});
  addEventListener('scroll',()=>{const max=document.documentElement.scrollHeight-innerHeight;scrollTarget=max>0?scrollY/max:0},{passive:true});
  const clock=new THREE.Clock();
  function animate(){
    const t=clock.getElapsedTime();scrollCurrent+=(scrollTarget-scrollCurrent)*.035;
    camera.position.x+=(px*.85-camera.position.x)*.025;camera.position.y+=(.4+py*.55-camera.position.y)*.025;camera.position.z=13-scrollCurrent*7.2; camera.position.x+=(Math.sin(scrollCurrent*Math.PI*2)*1.15-camera.position.x)*.018;
    camera.lookAt(0,-.25,-2.5-scrollCurrent*5.2);
    world.rotation.y+=((px*.055+scrollCurrent*.42)-world.rotation.y)*.025;world.rotation.x+=((-py*.025)-world.rotation.x)*.025;
    monitor.position.y=.1+Math.sin(t*.65)*.08;monitor.rotation.y=-.08+Math.sin(t*.35)*.025;
    rings.children.forEach((r,i)=>{r.rotation.z+=r.userData.speed;r.rotation.y+=Math.sin(t*.25+i)*.0005});
    panels.forEach((p,i)=>{p.position.y=p.userData.baseY+Math.sin(t*.55+p.userData.phase)*.18;p.rotation.z+=Math.sin(t*.25+i)*.00035});
    particles.rotation.y=t*.008;particles.rotation.x=Math.sin(t*.08)*.035;
    renderer.render(scene,camera);if(!reduced)requestAnimationFrame(animate);
  }
  animate();
  addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));renderer.setSize(innerWidth,innerHeight)});

  let value=0;
  const timer=setInterval(()=>{value=Math.min(100,value+5+Math.random()*11);bar.style.transform=`scaleX(${value/100})`;percent.textContent=`${Math.round(value)}%`;if(value>=100){clearInterval(timer);setTimeout(()=>boot.classList.add('done'),280)}},70);
}
