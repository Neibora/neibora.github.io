(()=>{
 'use strict';
 const $=id=>document.getElementById(id), labels={registro:'Inscripciones abiertas',votacion:'¡Es momento de votar!',resultados:'Los favoritos de La Cantera'};
 let voter, state, photo='', photoVersion=0, requestId='', busy=false, syncing=false, selected, lastVersion=-1;
 try {voter=localStorage.getItem('neibora:concurso:voter');if(!/^[a-f0-9]{64}$/.test(voter||'')){voter=Array.from(crypto.getRandomValues(new Uint8Array(32)),n=>n.toString(16).padStart(2,'0')).join('');localStorage.setItem('neibora:concurso:voter',voter);}}catch{$('status').textContent='Habilita el almacenamiento de este navegador para inscribirte y votar.';}
 async function api(action,body){const response=await fetch(neiboraContest.url(action),{method:body?'POST':'GET',cache:'no-store',headers:{'Content-Type':'application/json','X-Contest-Voter':voter||''},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(20000)});let result;try{result=await response.json();}catch{throw Error('El concurso no está disponible por el momento.');}if(!response.ok)throw Error(result.message||'No se pudo completar la solicitud.');return result;}
 const node=(tag,text,className)=>{const element=document.createElement(tag);if(text!==undefined)element.textContent=text;if(className)element.className=className;return element;};
 function render(next){
  state=next;$('connection').textContent='En vivo · actualiza cada 2 s';
  $('open-registration').disabled=next.phase!=='registro'||!voter;
  $('open-registration').firstChild.textContent=next.phase==='registro'?'Inscribir un disfraz ': 'Inscripciones cerradas ';
  $('phase-label').textContent=labels[next.phase];$('gallery-title').textContent=next.phase==='resultados'?'El aplauso de la comunidad':'La pasarela de La Cantera';
  $('phase-description').textContent=next.phase==='registro'?'Los nuevos disfraces aparecerán aquí automáticamente.':next.phase==='votacion'?'Mira todos los disfraces y elige tu favorito.':'¡Gracias a todos por participar! En caso de empate, los concursantes comparten posición.';
  $('vote-note').hidden=next.phase!=='votacion';$('vote-note').textContent=next.voted?'¡Tu voto quedó registrado! Espera los resultados al cerrar la votación.':!next.voterProfile?'Indica tu nombre, coto y domicilio para votar. No puedes votar por disfraces de tu misma vivienda.':next.voteWithdrawn?'El disfraz que elegiste fue retirado. Puedes votar por otro participante.':'Elige tu favorito. Los disfraces de tu mismo domicilio están deshabilitados. Tu elección será visible solo para administración.';
  $('open-voter-profile').hidden=next.phase!=='votacion'||next.voted;$('open-voter-profile').textContent=next.voterProfile?'Revisar mis datos':'Identificarme para votar';
  $('participant-count').textContent=next.participants.length+' participante'+(next.participants.length===1?'':'s');
  document.querySelectorAll('[data-stage]').forEach(el=>el.classList.toggle('active',el.dataset.stage===next.phase));
  $('empty').hidden=!!next.participants.length;
  if(next.version===lastVersion)return;
  lastVersion=next.version;
  const fragment=document.createDocumentFragment(), participants=[...next.participants];
  if(next.phase==='resultados')participants.sort((a,b)=>b.votes-a.votes||a.number-b.number);
  let lastCount=-1,rank=0;
  participants.forEach((p,index)=>{
   const card=node('article',undefined,'card'),img=node('img');img.src=neiboraContest.url('photo',{id:p.id});img.alt='Disfraz: '+p.costume;img.loading='lazy';img.width=400;img.height=500;
   const badge=node('span','#'+String(p.number).padStart(2,'0'),'number'),body=node('div',undefined,'card-body');
   body.append(node('h3',p.costume),node('p',p.name));
   if(p.coto)body.append(node('p',p.coto));
   if(next.phase==='resultados') {if(lastCount!==p.votes){rank=index+1;lastCount=p.votes;}body.append(node('p',p.votes?rank+'º lugar · '+p.votes+' voto'+(p.votes===1?'':'s'):'Sin votos','result'));}
   if(next.phase==='votacion'){
    const button=node('button',p.homePending?'Domicilio pendiente':p.ownHouse?'Tu domicilio · no puedes votar':next.vote===p.id?'✓ Tu favorito':next.voted?'Voto registrado':next.voterProfile?'Votar por este disfraz':'Identificarme para votar','primary');
    button.disabled=next.voted||!voter||p.ownHouse||p.homePending;
    button.onclick=()=>{if(!next.voterProfile)return openProfile();selected=p;$('vote-choice').textContent='#'+p.number+' · '+p.costume+' — '+p.name;$('vote-dialog').showModal();};body.append(button);
   }
   card.append(neiboraPhotoViewer.button(img,p.costume+' · '+p.name),badge,body);fragment.append(card);
  });
  $('gallery').replaceChildren(fragment);
 }
 async function sync(){if(syncing||document.hidden)return;syncing=true;try{render(await api('state'));}catch{$('connection').textContent='Sin conexión · reintentando';}finally{syncing=false;}}
 function openProfile(){const form=$('voter-form');form.reset();for(const name of ['name','coto','domicilio'])form.elements.namedItem(name).value=state?.voterProfile?.[name]||'';$('voter-status').textContent='';$('voter-dialog').showModal();}
 $('open-voter-profile').onclick=openProfile;
 $('close-voter-profile').onclick=()=>{if(!busy)$('voter-dialog').close();};
 $('voter-dialog').addEventListener('cancel',event=>{if(busy)event.preventDefault();});
 $('voter-form').onsubmit=async event=>{
  event.preventDefault();if(busy||!voter)return;busy=true;const button=event.target.querySelector('[type=submit]');button.disabled=true;
  try{const data=new FormData(event.target);await api('identify',{name:data.get('name'),coto:data.get('coto'),domicilio:data.get('domicilio'),privacyAccepted:data.get('privacy')==='on'});$('voter-dialog').close();lastVersion=-1;await sync();$('status').textContent='Datos guardados. Ya puedes elegir un disfraz de otra vivienda.';}catch(error){$('voter-status').textContent=error.message;}finally{busy=false;button.disabled=false;}
 };
 $('open-registration').onclick=()=>{requestId=requestId||crypto.randomUUID();$('registration').showModal();};
 document.querySelector('[data-close]').onclick=()=>{if(!busy)$('registration').close();};
 $('registration').addEventListener('cancel',e=>{if(busy)e.preventDefault();});
 $('photo').onchange=async()=>{
  const version=++photoVersion,file=$('photo').files[0];photo='';$('preview').hidden=true;$('form-status').textContent='';
  if(!file)return;
  try{
   if(file.size>20000000)throw Error('Selecciona una foto de menos de 20 MB.');
   const url=URL.createObjectURL(file),img=new Image();
   try{img.src=url;await img.decode();if(version!==photoVersion)return;const canvas=document.createElement('canvas'),scale=Math.min(1,800/Math.max(img.naturalWidth,img.naturalHeight));canvas.width=Math.round(img.naturalWidth*scale);canvas.height=Math.round(img.naturalHeight*scale);if(Math.min(canvas.width,canvas.height)<32)throw Error('La foto es demasiado pequeña.');const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);photo=canvas.toDataURL('image/jpeg',.78);if(photo.length>460000)photo=canvas.toDataURL('image/jpeg',.55);$('preview').src=photo;$('preview').hidden=false;}finally{URL.revokeObjectURL(url);}
  }catch(error){if(version===photoVersion){photo='';$('photo').value='';$('form-status').textContent=error.message||'No se pudo abrir la foto. Prueba con otra imagen.';}}
 };
 $('registration-form').onsubmit=async event=>{
  event.preventDefault();if(busy||!voter)return;
  if(!photo){$('form-status').textContent='Espera a que termine de cargar la foto o elige otra.';return;}
  busy=true;const button=event.target.querySelector('[type=submit]');button.disabled=true;$('form-status').textContent='Publicando tu disfraz…';
  try{const data=new FormData(event.target),result=await api('register',{name:data.get('name'),costume:data.get('costume'),coto:data.get('coto'),domicilio:data.get('domicilio'),photo,consent:data.get('consent')==='on',requestId});$('registration').close();event.target.reset();photo='';photoVersion++;$('preview').hidden=true;requestId='';$('status').textContent='¡Listo! Tu disfraz es el número '+result.number+'.';await sync();$('participantes').scrollIntoView({behavior:'smooth'});}catch(e){$('form-status').textContent=e.message;}finally{busy=false;button.disabled=false;}
 };
 $('confirm-vote').onclick=async()=>{
  if(busy||!selected)return;busy=true;$('confirm-vote').disabled=true;
  try{await api('vote',{id:selected.id});$('vote-dialog').close();$('status').textContent='¡Gracias! Tu voto quedó registrado.';lastVersion=-1;await sync();}catch(e){$('vote-dialog').close();$('status').textContent=e.message;await sync();}finally{busy=false;$('confirm-vote').disabled=false;}
 };
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync();});
 window.addEventListener('online',sync);sync();setInterval(sync,2000);
})();
