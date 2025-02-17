import{G as ee,S as te,A as oe,V as j,H as ie,D as ne,T as se,a as _,M as U,B as ae,b as q,c as re,d as le,e as de,f as ce,P as ue,W as he,C as me,F as fe,g as pe,h as ge,L as ye,i as ve,j as we,k as be}from"./vendor-DaSGcodl.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const n of o)if(n.type==="childList")for(const a of n.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function i(o){const n={};return o.integrity&&(n.integrity=o.integrity),o.referrerPolicy&&(n.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?n.credentials="include":o.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function r(o){if(o.ep)return;o.ep=!0;const n=i(o);fetch(o.href,n)}})();function Me(e,t,i,r,o,n){const a=new ee(i);let l,f,h,I,P,x,V;a.load(r,function(k){l=k.scene,e.add(l),l.scale.set(o,o,o),l.position.set(n.x,n.y,n.z),l.rotation.set(0,0,0),l.traverse(function(p){p.isMesh&&(p.castShadow=!0)}),h=new te(l),h.visible=!1,e.add(h);const b=k.animations;f=new oe(l),b.forEach(p=>{f.clipAction(p).play()}),I=f.clipAction(b[0]),P=f.clipAction(b[2]),x=f.clipAction(b[1]),V=[I,P,x]});function Q(){return f}function Z(k){const b=l.position;l.position.copy(k);const p=new j(n.x,n.y,n.z);if(l.getWorldPosition(p),b.z!=l.position.z){const Y=l.rotation;l.rotation.set(Y.x,Y.y,Y.z*1.1)}t.position.set(p.x,p.y+2,p.z+10),t.lookAt(p)}return{getMixer:Q,skeleton:h,actions:V,updatePosition:Z}}function c(e,t,i,r){const o=new re,n=100;for(let a=0;a<n;a++){const l=new q(new _(Math.random()*1.2,16,16),new U({color:16777215,transparent:!0,opacity:Math.random()*.6}));l.position.set(t+Math.random()*4,i+Math.random()*4,r+Math.random()*4),o.add(l)}e.add(o)}function g(e,t,i,r,o,n,a,l,f){let h;var I=new le(r,{font:i,size:o,depth:.2,curveSegments:12,bevelEnabled:!0,bevelThickness:.03,bevelSize:.02,bevelOffset:0,bevelSegments:5});const P=new de({color:n,transparent:!0,opacity:1});h=new q(I,P),e.add(h),h.position.set(a,l,f);function x(){h&&(h.material.opacity=Math.max(0,1-Math.abs(t.position.z-15-h.position.z)/20))}return{updateTextOpacity:x}}function Ee(e,t,i,r,o){const a=new se(e).load(t),l=new _(i,r,o),f=new U({map:a,side:ae});return new q(l,f)}function Le(e){const t=new ie(16777215,9276813,3);t.position.set(0,20,200),e.add(t);const i=new ne(16777215,3);i.position.set(-3,10,190),i.castShadow=!0,i.shadow.camera.top=2,i.shadow.camera.bottom=-2,i.shadow.camera.left=-2,i.shadow.camera.right=2,i.shadow.camera.near=.1,i.shadow.camera.far=40,e.add(i)}class Se{audio;isInitialized=!1;soundIcon;isPlaying=!1;isIOS(){return/iPad|iPhone|iPod/.test(navigator.userAgent)||navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1}constructor(){this.audio=document.getElementById("bgMusic"),this.audio.volume=.3,this.audio.preload="auto",this.isIOS()?(console.log("iOS device detected, using iOS-specific initialization"),this.audio.playsInline=!0,this.audio.muted=!0):console.log("Non-iOS device detected, using standard initialization"),this.soundIcon=document.getElementById("soundIcon"),this.setupToggleButton()}initIOSAudio(){const t=()=>{this.isInitialized||(this.audio.muted=!1,this.audio.play().then(()=>{this.isInitialized=!0,console.log("iOS audio started successfully")}).catch(i=>{console.log("iOS audio start failed:",i),this.isInitialized=!1}))};document.addEventListener("touchend",()=>{this.isInitialized||t()},!1)}initStandardAudio(){const t=()=>{this.isInitialized||this.audio.play().then(()=>{this.isInitialized=!0,console.log("Standard audio started successfully")}).catch(i=>{console.log("Standard audio start failed:",i),this.isInitialized=!1})};["click","touchstart"].forEach(i=>{document.addEventListener(i,t,{once:!0})})}stop(){this.isInitialized&&(this.audio.pause(),this.audio.currentTime=0)}setupToggleButton(){const t=document.getElementById("toggleAudio");t&&t.addEventListener("click",i=>{i.preventDefault(),i.stopPropagation(),this.toggle()})}toggle(){this.isPlaying?this.pause():this.play(),this.updateIcon()}play(){this.isInitialized||(this.isIOS()?this.initIOSAudio():this.initStandardAudio()),this.audio.play().then(()=>{this.isPlaying=!0,this.updateIcon()}).catch(t=>console.log("Audio play failed:",t))}pause(){this.audio.pause(),this.isPlaying=!1,this.updateIcon()}updateIcon(){if(this.soundIcon){const t=this.isPlaying?"sound-on.svg":"sound-off.svg";this.soundIcon.src=`images/${t}`}}setVolume(t){this.audio.volume=Math.max(0,Math.min(1,t))}logAudioState(){console.log({isIOS:this.isIOS(),isInitialized:this.isInitialized,isMuted:this.audio.muted,volume:this.audio.volume,isPlaying:!this.audio.paused,currentTime:this.audio.currentTime,readyState:this.audio.readyState})}}class Ie{hamburger;mobileMenu;isHamburgerOpen=!1;constructor(){this.hamburger=document.getElementById("hamburger"),this.mobileMenu=document.getElementById("mobileMenu"),this.initializeMenu()}initializeMenu(){this.hamburger?.addEventListener("click",()=>this.toggleMobileMenu()),document.addEventListener("click",t=>{const i=t.target;this.isHamburgerOpen&&!this.hamburger?.contains(i)&&this.closeMobileMenu()}),window.addEventListener("resize",()=>{window.innerWidth>768&&this.isHamburgerOpen&&this.closeMobileMenu()})}toggleMobileMenu(){this.isHamburgerOpen=!this.isHamburgerOpen,this.mobileMenu?.classList.toggle("active")}closeMobileMenu(){this.isHamburgerOpen=!1,this.mobileMenu?.classList.remove("active")}}function K(){const e=document.querySelectorAll(".subpage-container");return Array.from(e).some(t=>t.style.transform==="translateY(0px)")}const B=/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);let z=0,L=0,T;const Pe=.95,xe=.1*.002;let D,s,d,N,E,M;const u=[],F=[],C=[],ke=new be;let m,H,X=!1,R;const y=document.getElementById("threeCanvas"),w=document.getElementById("loader"),$=document.getElementById("loaderImg"),v=document.getElementById("loaderStatus"),S=document.getElementById("startButton"),A=document.getElementById("topLogo"),O=[[0,0,200],[3,0,190],[5,0,180],[3,0,170],[0,3,160],[-3,3,150],[-3,3,140],[0,10,130],[0,10,120],[0,10,110],[0,5,100],[5,5,90],[5,5,80],[3,15,70],[0,15,60],[0,15,50],[-3,20,40],[-3,20,30],[-5,20,20],[-5,20,10],[-1,20,0]];function ze(){if(X){if(w&&$&&A){const e=A.getBoundingClientRect(),t=$.getBoundingClientRect(),i=e.left-t.right-(B?-60:0),r=e.top-t.bottom-(B?-100:80);w.style.opacity="0",w.style.transition="transform 1.5s ease, opacity 1.5s ease",B?w.style.transform=`translate(${i}px, ${r}px) scale(0.6)`:w.style.transform=`translate(${i}px, ${r}px) scale(0.4)`}S&&(S.style.display="none"),y.style.opacity="0",y.style.transition="opacity 1.5s ease",y.style.display="block",setTimeout(()=>{y.style.opacity="1"},500),setTimeout(()=>{w&&(w.style.display="none"),A&&(A.style.opacity="1")},1500),He()}}function Ae(){if(Ce(),S)S.addEventListener("click",ze);else{console.error("startButton_no");return}s=new ce,d=new ue(75,window.innerWidth/window.innerHeight,.1,2e3),E=new he({canvas:y,antialias:!0,powerPreference:"high-performance"}),E.shadowMap.enabled=!0,M=new me,M.setSize(window.innerWidth,window.innerHeight),M.domElement.id="css3d-container",W(),document.body.appendChild(E.domElement),document.body.appendChild(M.domElement),D=new we(()=>{console.log("Loading complete!"),X=!0,S.style.display="block",v&&(v.style.display="none")},(e,t,i)=>{v&&(v.style.display="block",v.textContent="Dron sa pripravuje na svoj štart ... "),console.log(`Loading file.
Loaded `+t+" of "+i+" files.")},e=>{v&&(v.style.display="block",v.textContent="Dronu sa nepodarilo vzlietnuť. Skúste refresh!"),console.error("There was an error loading")}),Be()}function W(){const e=window.innerWidth,t=window.innerHeight;d.fov=B?110:75,d.aspect=e/t,d.updateProjectionMatrix(),E.setSize(e,t,!1),M.setSize(e,t);const i=Math.min(window.devicePixelRatio,2);E.setPixelRatio(i)}function Oe(){window.addEventListener("resize",W),window.addEventListener("orientationchange",()=>{setTimeout(W,100)}),window.addEventListener("wheel",o=>{K()||(L+=o.deltaY*xe)}),document.addEventListener("touchmove",o=>{o.preventDefault()},{passive:!1}),window.addEventListener("contextmenu",o=>{o.preventDefault()}),y?.addEventListener("touchmove",o=>{o.preventDefault()},{passive:!1}),document.querySelectorAll("nav a, .logo, .about-link").forEach(o=>{o.addEventListener("touchstart",n=>{n.stopPropagation()},{passive:!0})});let t=0,i=!1;const r=.001;y?.addEventListener("touchstart",o=>{o.preventDefault(),t=o.touches[0].clientY,i=!0},{passive:!1}),y?.addEventListener("touchmove",o=>{o.preventDefault();const n=o.touches[0].clientY,a=n-t;i&&!K()&&(a>0||a<0)&&(L-=a*r),t=n},{passive:!1}),y?.addEventListener("touchend",o=>{o.preventDefault(),i=!1},{passive:!1}),y?.addEventListener("touchcancel",o=>{o.preventDefault(),i=!1},{passive:!1})}function Be(){Le(s);const e=Ee(D,"textures/sunshine-clouds-min.jpg",1350,900,500);s.add(e);const t=new j(0,0,200);Ge(s,d,t),N=Me(s,d,D,"models/drone6.glb",3,t),C.push(N),c(s,-5,0,190),c(s,-10,0,160),c(s,30,5,140),c(s,30,0,140),c(s,20,10,120),c(s,10,0,110),c(s,-20,0,100),c(s,-10,10,90),c(s,30,10,80),c(s,20,5,70),c(s,-10,-5,60),c(s,15,0,40),c(s,10,10,20),c(s,-10,0,20),c(s,0,0,20),c(s,-10,-5,20),c(s,5,5,20),new fe(D).load("font/Montserrat_Regular.json",function(r){m=r,u.push(g(s,d,m,"Portfólio",1,0,-7,20,30)),u.push(g(s,d,m,"Každý Príbeh",1,0,-9,19,60)),u.push(g(s,d,m,"Každá Emócia",1,0,2,19,60)),u.push(g(s,d,m,"Každý Detail",1,0,-3,17,60)),u.push(g(s,d,m,"si zaslúži byť zachytený tak",1,0,-7,13,60)),u.push(g(s,d,m,"ako ho cítite",1,0,-2,11,60)),u.push(g(s,d,m,`Videoprodukcia
príbehy
ktoré Vás vtiahnu do deja`,1,0,-3,7,90)),u.push(g(s,d,m,`Fotografovanie momenty,
ktoré hovoria za vás`,1,0,-8,15,120)),u.push(g(s,d,m,`Letecké zábery dronom
pohľad
ktorý mení perspektívu`,1,0,-10,5,150)),u.push(g(s,d,m,`Viac než len obraz
pocit, ktorý zostáva`,1,0,-3,4,180))})}function Te(){H=new Se;const e=()=>{H.play(),["click","touchstart","scroll","wheel"].forEach(t=>{document.removeEventListener(t,e)})};["click","touchstart","scroll","wheel"].forEach(t=>{document.addEventListener(t,e)})}async function G(e,t,i,r){e.id="subpage-"+r,e.classList.add("subpage-container");try{const l=await(await fetch("pages/"+t+".html")).text();e.innerHTML=l}catch(a){console.error("Nepodarilo sa načítať subpage: "+t,a),e.innerHTML="<div>Nepodarilo sa načítať obsah</div>"}document.body.appendChild(e);const o=a=>{const l=a.target;!e.contains(l)&&!l.closest("#"+r)&&(e.style.transform="translateY(100%)",setTimeout(()=>{document.body.style.overflow="auto"},500))},n=document.getElementById(i);return n&&n.addEventListener("click",()=>{e.style.transform="translateY(100%)",setTimeout(()=>{document.body.style.overflow="auto"},500),document.removeEventListener("click",o)}),De(e,r,o),e}function De(e,t,i){const r=document.querySelectorAll("#"+t);r&&r.forEach(o=>o.addEventListener("click",n=>{n.preventDefault(),document.querySelectorAll(".subpage-container").forEach(l=>{l.style.transform="translateY(100%)"}),document.body.style.overflow="hidden",e.style.transform="translateY(0)",H.pause(),document.addEventListener("click",i)}))}async function Ce(){new Ie,R=document.createElement("div"),await G(R,"portfolio","closePortfolio","portfolio-button");const e=document.createElement("div");await G(e,"klienti","closeKlienti","klienti-button");const t=document.createElement("div");await G(t,"about","closeAbout","about-button")}function He(){Oe(),J(),Te()}function Re(){z+=L/100,z=Math.max(0,Math.min(1,z));const e=T.getPointAt(z);N.updatePosition(e),L*=Pe,e.z<30&&R&&(document.body.style.overflow="hidden",R.style.transform="translateY(0)",H.pause())}function Ye(){if(u)for(let e=0;e<u.length;e++)u[e].updateTextOpacity();if(F)for(let e=0;e<F.length;e++)F[e].updateOpacity()}function Fe(){for(let e=0;e<C.length;e++)C[e].getMixer()&&C[e].getMixer().update(ke.getDelta())}function J(){requestAnimationFrame(J),Re(),Ye(),Fe(),E.render(s,d),M.render(s,d)}function Ge(e,t,i){const r=[];for(let a=0;a<O.length;a++)r.push(new j(O[a][0],O[a][1],O[a][2]));T=new pe(r),T.closed=!1;const o=new ge().setFromPoints(T.getPoints(100)),n=new ye({color:16776960});new ve(o,n),t.position.set(i.x,i.y+2,i.z),t.lookAt(i)}Ae();
