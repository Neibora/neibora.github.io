(()=>{
 'use strict';const $=id=>document.getElementById(id),labels={registro:'Inscripciones abiertas',votacion:'Votación abierta',resultados:'Resultados publicados'};
 let key='',state,busy=false,syncing=false,version=-1;
 async function api(action,body){const response=await fetch(neiboraContest.url(action),{method:body?'POST':'GET',headers:{'Content-Type':'application/json','X-Contest-Admin':key},body:body?JSON.stringify(body):undefined,cache:'no-store',signal:AbortSignal.timeout(20000)});const result=await response.json();if(!response.ok)throw Error(result.message||'No se pudo completar la acción.');return result;}
 const node=(tag,text)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el;};
 async function sync(){if(!key||syncing||document.hidden)return;syncing=true;try{
  const next=await api('state');if(next.totalVotes===undefined)throw Error('Clave incorrecta.');
  state=next;$('login').hidden=true;$('controls').hidden=false;$('admin-phase').textContent=labels[next.phase];
  const active=next.participants.filter(p=>!p.removed).length,removed=next.participants.length-active;
  $('admin-count').textContent=active+' participantes activos · '+removed+' retirados · '+next.totalVotes+' votos'+(next.retiredVotes?' · '+next.retiredVotes+' votos de retirados conservados':'');
  $('advance').hidden=next.phase==='resultados';$('advance').textContent=next.phase==='registro'?'Cerrar inscripciones y abrir votación':'Cerrar votación y mostrar resultados';
  $('back').hidden=next.phase==='registro';$('back').textContent=next.phase==='resultados'?'Reabrir votación':'Volver a inscripciones';
  if(version===next.version)return;version=next.version;
  const fragment=document.createDocumentFragment();
  for(const p of next.participants){
   const card=node('article');card.className='card'+(p.removed?' retired':'');
   const image=p.removed?node('div','Registro retirado'):node('img');
   if(p.removed)image.className='retired-placeholder';else{image.src=neiboraContest.url('photo',{id:p.id});image.alt=p.costume;image.loading='lazy';}
   const body=node('div');body.className='card-body';
   body.append(node('h3','#'+p.number+' · '+p.costume),node('p',p.name),node('p','Coto: '+(p.coto||'No registrado')),node('p','Domicilio: '+(p.domicilio||'No registrado')),node('p',p.votes+' votos'+(p.removed?' conservados, fuera del resultado':'')));
   const button=node('button',p.removed?'Reincorporar participante':'Retirar participante');button.className='secondary';
   if(p.removed){button.disabled=!p.canRestore;button.dataset.locked=String(!p.canRestore);button.onclick=()=>act({action:'restore',id:p.id},'¿Reincorporar el disfraz de '+p.name+' a la galería y al conteo de votos?');if(!p.canRestore)body.append(node('p','Este registro antiguo ya no conserva su foto.'));}
   else button.onclick=()=>act({action:'remove',id:p.id},'¿Retirar el disfraz de '+p.name+'? Dejará de aparecer en la galería y sus votos no contarán mientras esté retirado. Se conservará el registro para poder reincorporarlo.');
   body.append(button);card.append(p.removed?image:neiboraPhotoViewer.button(image,p.costume+' · '+p.name),body);fragment.append(card);
   const edit=node('button',p.homePending?'Completar domicilio':'Editar domicilio');edit.className='secondary';edit.onclick=()=>openHome(p);body.append(edit);
  }
  $('admin-gallery').replaceChildren(fragment);
  const rows=document.createDocumentFragment();
  for(const ballot of next.ballots||[]){
   const row=node('tr');
   const values=[ballot.voterName||'Voto anterior sin identificación',ballot.coto||'—',ballot.domicilio||'—',ballot.candidateNumber?'#'+ballot.candidateNumber+' · '+ballot.costume+' · '+ballot.candidateName:'Participante no disponible',ballot.votedAt?new Date(ballot.votedAt).toLocaleString('es-MX',{timeZone:'America/Mexico_City'}):'Sin fecha registrada',ballot.removed?'Retirado · fuera del conteo':'En el conteo'];
   for(const value of values)row.append(node('td',value));rows.append(row);
  }
  $('ballot-rows').replaceChildren(rows);$('ballot-empty').hidden=!!next.ballots?.length;
 }catch(e){$('admin-status').textContent=e.message;}finally{syncing=false;}}
 async function act(body,message){if(busy||!confirm(message))return;busy=true;document.querySelectorAll('button').forEach(b=>b.disabled=true);try{await api('admin',body);$('admin-status').textContent='Cambio guardado.';await sync();}catch(e){$('admin-status').textContent=e.message;}finally{busy=false;document.querySelectorAll('button').forEach(b=>b.disabled=b.dataset.locked==='true');}}
 $('login').onsubmit=e=>{e.preventDefault();key=$('admin-key').value.trim();$('admin-key').value='';version=-1;sync();};
 $('advance').onclick=()=>act({action:'phase',from:state.phase,phase:state.phase==='registro'?'votacion':'resultados'},state.phase==='registro'?'¿Cerrar las inscripciones y abrir la votación? Se conservarán los votos previos, si los hay.':'¿Cerrar la votación y publicar los resultados? Podrás reabrirla desde administración.');
 $('back').onclick=()=>act({action:'phase',from:state.phase,phase:state.phase==='resultados'?'votacion':'registro'},state.phase==='resultados'?'¿Reabrir la votación? Los resultados dejarán de mostrarse y se conservarán los participantes y votos emitidos.':'¿Volver a inscripciones? Se pausará la votación y se conservarán los participantes y votos emitidos.');
 $('logout').onclick=()=>{key='';state=null;version=-1;$('login').hidden=false;$('controls').hidden=true;$('admin-gallery').replaceChildren();$('admin-status').textContent='Sesión cerrada.';};
 $('public-link').value=new URL('./?concurso='+encodeURIComponent(new URLSearchParams(location.search).get('concurso')||'15cceb26-b380-4b50-9d1f-0893c9e7cb13'),location.href).href;
 $('copy-link').onclick=async()=>{try{await navigator.clipboard.writeText($('public-link').value);$('admin-status').textContent='Enlace copiado.';}catch{$('public-link').select();$('admin-status').textContent='Copia el enlace seleccionado.';}};
 function openHome(participant){const form=$('home-form');form.elements.namedItem('id').value=participant.id;form.elements.namedItem('coto').value=participant.coto||'';form.elements.namedItem('domicilio').value=participant.domicilio||'';$('home-status').textContent='';$('home-dialog').showModal();}
 $('close-home').onclick=()=>{if(!busy)$('home-dialog').close();};
 $('home-dialog').addEventListener('cancel',event=>{if(busy)event.preventDefault();});
 $('home-form').onsubmit=async event=>{
  event.preventDefault();if(busy||!confirm('¿Guardar el coto y domicilio? Estos datos se usarán para impedir votos de la misma vivienda.'))return;
  busy=true;document.querySelectorAll('button').forEach(button=>button.disabled=true);
  try{const data=new FormData(event.target);await api('admin',{action:'updateHome',id:data.get('id'),coto:data.get('coto'),domicilio:data.get('domicilio')});$('home-dialog').close();$('admin-status').textContent='Domicilio actualizado.';await sync();}catch(error){$('home-status').textContent=error.message;}finally{busy=false;document.querySelectorAll('button').forEach(button=>button.disabled=button.dataset.locked==='true');}
 };
 setInterval(sync,2000);
})();
