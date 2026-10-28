(()=>{
 'use strict';const $=id=>document.getElementById(id),labels={registro:'Inscripciones abiertas',votacion:'Votación abierta',resultados:'Resultados publicados'};
 let key='',state,busy=false,syncing=false,version=-1;
 async function api(action,body){const response=await fetch(neiboraContest.url(action),{method:body?'POST':'GET',headers:{'Content-Type':'application/json','X-Contest-Admin':key},body:body?JSON.stringify(body):undefined,cache:'no-store',signal:AbortSignal.timeout(20000)});const result=await response.json();if(!response.ok)throw Error(result.message||'No se pudo completar la acción.');return result;}
 const node=(tag,text)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el;};
 async function sync(){if(!key||syncing||document.hidden)return;syncing=true;try{
  const next=await api('state');if(next.totalVotes===undefined)throw Error('Clave incorrecta.');
  state=next;$('login').hidden=true;$('controls').hidden=false;$('admin-phase').textContent=labels[next.phase];$('admin-count').textContent=next.participants.length+' participantes · '+next.totalVotes+' votos';$('advance').hidden=next.phase==='resultados';$('advance').textContent=next.phase==='registro'?'Cerrar inscripciones y abrir votación':'Cerrar votación y mostrar resultados';
  if(version===next.version)return;version=next.version;
  const fragment=document.createDocumentFragment();
  for(const p of next.participants){const card=node('article');card.className='card';const img=node('img');img.src=neiboraContest.url('photo',{id:p.id});img.alt=p.costume;img.loading='lazy';const body=node('div');body.className='card-body';body.append(node('h3','#'+p.number+' · '+p.costume),node('p',p.name),node('p',p.votes+' votos'));if(next.phase==='registro'){const remove=node('button','Retirar participante');remove.className='secondary';remove.onclick=()=>act({action:'remove',id:p.id},'¿Retirar el disfraz de '+p.name+'? También se quitará su fotografía.');body.append(remove);}card.append(img,body);fragment.append(card);}
  $('admin-gallery').replaceChildren(fragment);
 }catch(e){$('admin-status').textContent=e.message;}finally{syncing=false;}}
 async function act(body,message){if(busy||!confirm(message))return;busy=true;document.querySelectorAll('button').forEach(b=>b.disabled=true);try{await api('admin',body);$('admin-status').textContent='Cambio guardado.';await sync();}catch(e){$('admin-status').textContent=e.message;}finally{busy=false;document.querySelectorAll('button').forEach(b=>b.disabled=false);}}
 $('login').onsubmit=e=>{e.preventDefault();key=$('admin-key').value.trim();$('admin-key').value='';version=-1;sync();};
 $('advance').onclick=()=>act({action:'phase',phase:state.phase==='registro'?'votacion':'resultados'},state.phase==='registro'?'¿Cerrar las inscripciones y abrir la votación? Ya no se podrán agregar ni retirar concursantes.':'¿Cerrar definitivamente la votación y publicar los resultados?');
 $('logout').onclick=()=>{key='';state=null;version=-1;$('login').hidden=false;$('controls').hidden=true;$('admin-gallery').replaceChildren();$('admin-status').textContent='Sesión cerrada.';};
 $('public-link').value=new URL('./?concurso='+encodeURIComponent(new URLSearchParams(location.search).get('concurso')||'15cceb26-b380-4b50-9d1f-0893c9e7cb13'),location.href).href;
 $('copy-link').onclick=async()=>{try{await navigator.clipboard.writeText($('public-link').value);$('admin-status').textContent='Enlace copiado.';}catch{$('public-link').select();$('admin-status').textContent='Copia el enlace seleccionado.';}};
 setInterval(sync,2000);
})();
