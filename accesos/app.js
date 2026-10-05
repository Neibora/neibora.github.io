import * as M from './model.js';
import * as E from './engine.js';
import {scenarios} from './examples.js';
import * as W from './comunicaciones.js';
const app=document.querySelector('#app'), storageKey='neibora-accesos-demo-v2';
let db, flow, draft, cursor=0, view='home', saved, filter='Todos', query='', error='', cancelOpen=false, saveBusy=false, destinationMenu=null;
try {db=JSON.parse(localStorage.getItem(storageKey)) || M.newDatabase();if(db.version!==2) db=M.newDatabase();} catch {db=M.newDatabase();}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(label,act,primary=false)=>'<button type="button" class="btn '+(primary?'primary':'')+'" data-act="'+act+'">'+esc(label)+'</button>';
const timestamp=t=>new Date(t).toLocaleString('es-MX',{timeZone:'America/Mexico_City',dateStyle:'medium',timeStyle:'short'});
const current=()=>E.steps(flow,draft.data,db).filter(s=>!(s.collection==='destinos' && s.field && s.group.getAttribute('selector')==='jerarquico'));
const homeOptions=()=>[...flow.querySelector('Campo[name="operacion"]').children].filter(n=>n.nodeName==='Opcion');
function persist(){localStorage.setItem(storageKey,JSON.stringify(db));}
function start(operation,data) {
  draft={id:M.uid(),data:data?M.clone(data):{operacion:operation},changes:[],created:M.now()};
  draft.data.operacion=operation;cursor=0;view='wizard';saved=null;error='';destinationMenu=null;render();
  draft.data.caso_id ||= draft.id;
}
function catalog(step) {
  const f=step.field,d=draft.data,local=step.local;
  switch(f?.getAttribute('catalogo')) {
    case 'calles':return (M.streets[local.coto]||[]).map(c=>({value:c,label:c}));
    case 'domicilios':return (M.houses[local.coto]||[]).filter(h=>!local.calle||h.calle===local.calle);
    case 'destinos':return (d.destinos||[]).map(x=>({value:x.id,label:M.destLabel(x)}));
    case 'origenes':return (d.destinos||[]).filter(x=>x.tipo_destino==='Domicilio').map(x=>({value:x.id,label:M.destLabel(x)}));
    case 'personas':return (d.personas||[]).map(x=>({value:x.id,label:x.nombre||'Persona sin nombre'}));
    case 'personas_dentro': {
      const entry=db.entries.find(x=>x.id===d.ingreso_id);
      return (entry?.data.personas||[]).filter(x=>entry.inside.includes(x.id)).map(x=>({value:x.id,label:x.nombre}));
    }
    case 'tags':return ['T-01','T-02','T-03','T-04','T-05','T-06'].filter(n=>!db.tags.some(t=>t.number===n && t.status!=='Devuelto')).map(n=>({value:n,label:n}));
    case 'ingresos':return [...db.entries.filter(x=>x.inside?.length || x.vehicleInside).map(x=>({value:x.id,label:[x.data.personas.map(p=>p.nombre).join(', '),x.data.placas,db.tags.find(t=>t.entryId===x.id && t.status!=='Devuelto')?.number,x.data.destinos?.map(M.destLabel).join('; ')].filter(Boolean).join(' · ')})),{value:'sin_ingreso',label:'No se encuentra el ingreso · registrar incidencia'}];
    case 'objetos':return db.objects.filter(x=>x.status==='En resguardo').map(x=>({value:x.id,label:[x.data.tipo_objeto,x.data.descripcion_objeto,x.data.referencia_objeto,x.data.destinos?.map(M.destLabel).join('; ')].filter(Boolean).join(' · ')}));
    default:return [...f?.children||[]].filter(n=>n.nodeName==='Opcion' && E.visible(n,M.derived(d,db),local)).map(n=>({value:n.getAttribute('valor')||n.textContent.trim(),label:n.textContent.trim()}));
  }
}
function title(step) {
  if(step.collection==='destinos') {
    const op=draft.data.operacion;
    return step.field.getAttribute('etiqueta_'+(op==='salida'?'salida':op==='objetos'?'objetos':'entrada'))||step.field.getAttribute('etiqueta');
  }
  return step.field.getAttribute('etiqueta');
}
function notices(step) {
  const g=M.derived(draft.data,db),local=step.local||{};
  return [...step.group?.children||[]].filter(n=>['Aviso','Descripcion'].includes(n.nodeName)&&E.visible(n,g,local)).map(n=>'<div class="notice '+esc(n.getAttribute('clase')||'')+'">'+esc(n.textContent.trim())+'</div>').join('');
}
function liveSummary(d,compact=false) {
  if(d.objeto_recuperado)d={...d.objeto_recuperado,...d};
  const allowed=M.allowedDestinations(d);
  let html='<p><b>Operación:</b> '+esc(homeOptions().find(n=>n.getAttribute('valor')===d.operacion)?.textContent||d.operacion)+'</p>';
  if(d.servicio) html+='<p><b>Servicio:</b> '+esc(d.servicio)+' · '+(d.emergencia_activa==='Sí'?'Emergencia activa':'Visita ordinaria')+'</p>';
  if(d.asunto) html+='<p><b>Asunto:</b> '+esc(d.asunto)+' '+esc(d.movimiento_muebles||d.movimiento_vehiculo||d.trabajo_servicio||'')+'</p>';
  if(d.tipo_salida) html+='<p><b>Salida:</b> '+esc(d.tipo_salida)+'</p>';
  if(d.ubicacion_aproximada) html+='<p><b>Ubicación por precisar:</b> '+esc(d.ubicacion_aproximada)+'</p>';
  for(const p of d.personas||[]) html+='<p><b>'+esc(p.nombre||'Persona por identificar')+'</b>'+(!compact?'<br>'+esc([p.empresa,p.identificacion,p.identificacion_verificada==='Sí'?'Identificación verificada':'Revisión pendiente',p.relacion_residente,p.tag_residente].filter(Boolean).join(' · ')):'')+'</p>';
  if(d.nombre_salida) html+='<p>'+esc(d.nombre_salida)+' · Sin ingreso localizado</p>';
  for(const x of d.destinos||[]) html+='<div class="card"><b>'+esc(M.destLabel(x))+'</b><br><span class="badge">'+esc(d.operacion==='objetos'?'Destino del objeto':d.emergencia_activa==='Sí'?'Atención prioritaria':M.destinationState(x,d.autorizaciones))+'</span></div>';
  if(!compact) {
    for(const a of d.autorizaciones||[]) html+='<div class="card"><b>'+esc(a.respaldo||'Respaldo incompleto')+'</b> · '+esc(a.autoriza_nombre)+'<p>'+esc(a.resultado||'Pendiente')+' · '+esc(a.canal)+' · '+esc(a.verificado==='Sí'?'Verificado':'Sin verificar')+'</p><p>'+esc((a.alcance||[]).map(id=>M.destLabel((d.destinos||[]).find(x=>x.id===id)||{})).join('; '))+'</p><p>'+esc([a.folio,a.documento?.name,a.relacion_residente,a.relacion_titular,a.coto_admin].filter(Boolean).join(' · '))+'</p>'+(a.hora?'<small>'+timestamp(a.hora)+'</small>':'')+'</div>';
    for(const f of d.documentos||[]) html+='<div class="card"><b>Formato de muebles</b> · '+esc(f.folio||f.documento?.name||'Faltante')+'<p>'+esc(f.autoriza_nombre)+' · '+esc(f.descripcion)+'</p><p>'+esc((f.alcance||[]).map(id=>M.destLabel((d.destinos||[]).find(x=>x.id===id)||{})).join('; '))+'</p><span class="badge">'+(f.verificado==='Sí'?'Verificado':'Pendiente de verificar')+'</span></div>';
    if(d.operacion==='objetos') html+='<div class="card"><b>'+esc(d.movimiento_objeto)+'</b><p>'+esc([d.tipo_objeto,d.descripcion_objeto,'Cantidad: '+(d.cantidad_objeto||'—'),d.referencia_objeto].filter(Boolean).join(' · '))+'</p><p>Entrega: '+esc(d.entrega_nombre)+'<br>Recibe: '+esc(d.recibe_nombre)+'</p><p>'+esc(d.receptor_verificado==='Sí'?'Receptor verificado':d.movimiento_objeto==='Recibir en caseta'?'Recepción del vigilante; todavía no entregado al destinatario':'Receptor pendiente de verificar')+'</p></div>';
    if(d.personas_salen?.length) html+='<p><b>Personas que salen:</b> '+esc((d.personas||[]).filter(p=>d.personas_salen.includes(p.id)).map(p=>p.nombre).join(', '))+'</p>';
    if(d.vehiculo_sale) html+='<p><b>Sale el vehículo:</b> '+esc(d.vehiculo_sale)+'</p>';
    if(d.devolvio_tag) html+='<p><b>Devuelve tag:</b> '+esc(d.devolvio_tag)+' · '+esc(d.incidencia_tag)+'</p>';
    html+='<p><b>Observaciones / incidencias:</b> '+esc([d.observaciones,d.incidencias,d.incidencia_sin_ingreso,d.incidencia_hechos].filter(Boolean).join(' · ')||'Sin observaciones')+'</p>';
    if(d.operacion==='salida' && d.ingreso_id!=='sin_ingreso') html+='<p><b>Origen recuperado del ingreso.</b> Agregar destinos exige iniciar una nueva verificación.</p>';
  }
  if(d.medio_ingreso) html+='<p><b>Medio:</b> '+esc([d.medio_ingreso,d.placas,d.descripcion_vehiculo,d.motivo_sin_placas].filter(Boolean).join(' · '))+'</p>';
  if(d.entrega_tag) html+='<p><b>Tag temporal:</b> '+esc(d.entrega_tag==='Sí'?d.numero_tag||'Por seleccionar':'Sin préstamo · '+(d.motivo_sin_tag||''))+'</p>';
  if(d.numero_tag && !compact) html+='<p>Responsable: '+esc((d.personas||[]).find(x=>x.id===d.responsable_tag)?.nombre)+'</p>';
  return html;
}
function home() {
  const inside=db.entries.reduce((n,e)=>n+e.inside.length,0),pending=db.drafts.filter(x=>x.status==='Pendiente de autorización').length;
  return '<div class="hero"><span class="eyebrow">Caseta · Turno de demostración</span><h1>Todo listo para<br>recibir y acompañar.</h1><p class="muted">Elige el movimiento. Te guiamos paso a paso y dejamos cada registro en su lugar.</p></div><div class="tiles">'+homeOptions().map(n=>'<button class="tile '+(n.getAttribute('valor')==='emergencia'?'emergency':'')+'" data-start="'+esc(n.getAttribute('valor'))+'"><span class="icon" aria-hidden="true">'+esc(n.getAttribute('icono'))+'</span><strong>'+esc(n.textContent.trim())+'</strong><small>'+esc(n.getAttribute('detalle'))+'</small></button>').join('')+'</div><div class="metrics"><div class="metric"><b>'+inside+'</b>personas dentro</div><div class="metric"><b>'+pending+'</b>casos pendientes</div><div class="metric"><b>'+db.objects.filter(x=>x.status==='En resguardo').length+'</b>objetos en resguardo</div><div class="metric"><b>'+db.tags.filter(t=>t.status!=='Devuelto').length+'</b>tags prestados / por recuperar</div></div><div class="notice">Solo información ficticia. Los cambios se guardan en este navegador para probar el flujo.</div><div class="actions">'+button('Exportar registros ficticios','export')+button('Reiniciar demostración','reset')+'</div>';
}
function question(step) {
  const f=step.field,name=f.getAttribute('name'),type=f.getAttribute('tipo'),value=step.local[name],options=catalog(step);
  let html='<h2 id="question-title" tabindex="-1" data-question="'+name+'">'+esc(title(step))+'</h2>'+notices(step);
  if(type==='captura') {
    const c=value||{},names=['INE','Licencia','Pasaporte','Credencial institucional','Otra','No presenta'],media=['A pie','Bicicleta','Moto','Automóvil','Vehículo de carga'];
    html+='<div class="notice">Primero captura y revisa. El lector de este prototipo usa un ejemplo ficticio; el OCR y la cámara se integrarán mediante el servidor. No se leen las imágenes reales compartidas.</div><div class="actions">'+button('Simular lectura de identificación y placa','demo-read')+'</div><label for="capture-name">Nombre de la identificación</label><input id="capture-name" value="'+esc(c.nombre)+'" autocomplete="off"><label for="capture-id">Identificación presentada</label><select id="capture-id">'+names.map(n=>'<option '+(c.identificacion===n?'selected':'')+'>'+esc(n)+'</option>').join('')+'</select><label for="capture-medium">Medio de ingreso</label><select id="capture-medium">'+media.map(n=>'<option '+(c.medio_ingreso===n?'selected':'')+'>'+esc(n)+'</option>').join('')+'</select><label for="capture-plate">Placas del vehículo (vacío si no tiene o llega a pie)</label><input id="capture-plate" value="'+esc(c.placas)+'" autocomplete="off"><label class="check"><input type="checkbox" id="capture-reviewed" '+(c.revisado?'checked':'')+'>Revisé y corregí el nombre y las placas; estos datos pueden usarse en el anuncio.</label><p class="muted mini">Esta revisión no sustituye la verificación visual de la identificación. No se copia ni retiene el documento.</p>';
  } else if(['opcion','si_no','checklist','catalogo','referencia'].includes(type)) {
    const opts=type==='si_no'?[{value:'Sí',label:'Sí'},{value:'No',label:'No'}]:options;
    if(type==='referencia') html+='<label for="reference-search">Buscar por nombre, placas, tag o destino</label><input class="search" id="reference-search" placeholder="Escribe para filtrar" type="search">';
    if(type==='checklist') html+='<p class="muted">Selecciona una o varias opciones y continúa.</p>';
    html+='<div class="tiles" id="options">'+opts.map(o=>{
      const chosen=Array.isArray(value)?value.includes(o.value):value===o.value;
      return '<button type="button" class="tile" data-value="'+esc(o.value)+'" aria-pressed="'+chosen+'" data-search="'+esc(o.label.toLowerCase())+'"><strong>'+esc(o.label)+'</strong>'+(chosen?'<small>✓ Seleccionado</small>':'')+'</button>';
    }).join('')+'</div>';
    if(!opts.length) html+='<p class="empty">No hay opciones disponibles. Vuelve para revisar el origen o guarda el borrador.</p>';
    if(type!=='checklist') html+='<p class="muted mini">Toca una opción para avanzar.</p>';
  } else {
    html+='<label for="answer">'+esc(title(step))+(f.getAttribute('obligatorio')==='true'?' · obligatorio':' · opcional')+'</label>';
    if(type==='archivo') html+='<input id="answer" type="file" accept=".pdf,.png,.jpg,.jpeg"><p class="muted mini">Usa un archivo ficticio. Se conserva solo su nombre, tamaño y tipo; no se sube su contenido.</p>'+(value?'<div class="notice">Referencia guardada: '+esc(value.name)+'. Puedes continuar sin adjuntarla otra vez.</div>'+button('Quitar referencia','clear-file'):'');
    else html+='<input id="answer" type="'+(type==='numero'?'number':'text')+'" '+(type==='numero'?'min="'+esc(f.getAttribute('min')||0)+'" step="1"':'')+' value="'+esc(value)+'" autocomplete="off">';
  }
  if(['autorizaciones','documentos'].includes(step.collection))html+='<div class="actions">'+button('Continuar con respaldo pendiente','defer-backing')+'</div>';
  return html;
}
function manage(step) {
  const list=draft.data[step.collection]||[],g=step.group;
  return '<h2 id="question-title" tabindex="-1">'+esc(g.getAttribute('nombre'))+'</h2>'+notices(step)+list.map((x,i)=>'<div class="card"><b>'+esc(step.collection==='destinos'?M.destLabel(x):step.collection==='personas'?x.nombre:step.collection==='autorizaciones'?[x.respaldo,x.autoriza_nombre,x.resultado].filter(Boolean).join(' · '):[x.folio||x.documento?.name||'Sin documento',x.verificado==='Sí'?'Verificado':'Pendiente'].join(' · '))+'</b><div class="actions"><button class="link" data-edit="'+i+'">Revisar</button><button class="link" data-remove="'+i+'">Eliminar</button></div></div>').join('')+(!list.length?'<p class="empty">Sin registros. Puedes continuar pendiente si falta el formato.</p>':'')+'<div class="actions">'+button(g.getAttribute('etiqueta_agregar'),'add')+'</div>';
}
function summary() {
  const d=draft.data,allowed=M.allowedDestinations(d),ordinary=M.derived(d,db).necesita_autorizacion==='Sí';
  let html='<h2 id="question-title" tabindex="-1">Revisa antes de registrar</h2><p class="muted">Obtener autorización y registrar el ingreso físico son eventos distintos.</p>'+liveSummary(d);
  if(ordinary && allowed.length<(d.destinos||[]).length && allowed.length) html+='<div class="notice warn"><b>Acceso limitado a los destinos autorizados.</b><p>Permitidos: '+esc(allowed.map(M.destLabel).join('; '))+'</p><p>Excluidos: '+esc(d.destinos.filter(x=>!allowed.includes(x)).map(M.destLabel).join('; '))+'</p><label class="check"><input type="checkbox" id="limited" '+(d.alcance_limitado?'checked':'')+'>Confirmo expresamente el alcance limitado; los demás destinos quedan excluidos.</label></div>';
  if(M.derived(d,db).requiere_muebles==='Sí'&&!M.furnitureValid(d)) html+='<div class="notice warn">Formato de muebles faltante o sin verificar. Guarda pendiente. Si una salida física ya ocurrió, registra sus hechos e incidencia sin autorizar el movimiento.</div>';
  html+='<details><summary>Evidencias de la bitácora · referencias ficticias</summary><p class="mini">La API podrá agrupar fotos del vehículo, carga y formato. Las identificaciones quedan fuera de la publicación.</p><div class="actions">'+['vehiculo','carga','formato','identificacion'].map(category=>'<button class="btn" data-evidence="'+category+'">Ejemplo: '+esc(category)+'</button>').join('')+'</div>'+(d.evidencias_bitacora||[]).map(x=>'<p class="mini">'+esc(x.categoria)+' · referencia ficticia'+(x.categoria==='identificacion'?' · excluida del grupo':'')+'</p>').join('')+'</details>';
  const action=d.operacion==='entrada'?'entrada':d.operacion==='salida'?'salida':d.operacion==='objetos'?'objeto':d.operacion==='emergencia'?(d.emergencia_activa==='Sí'?'emergencia':'entrada'):null;
  if(action)html+=publicationPanel(W.publication(d,{id:'vista_previa',action,time:M.now(),status:action==='entrada'?'Entrada propuesta; aún no registrada':action==='salida'?'Salida propuesta; aún no registrada':'Movimiento propuesto',vigilante:'Vigilante Demo'},W.policyFromFlow(flow)),'Vista previa · se publica al registrar el movimiento');
  html+='<div class="actions">'+[...flow.querySelectorAll('Acciones > Accion')].filter(n=>E.visible(n,M.derived(d,db))).map(n=>button(n.getAttribute('etiqueta'),'commit:'+n.getAttribute('id'),!['pendiente','denegacion'].includes(n.getAttribute('id')))).join('')+'</div>';
  return html;
}
function publicationPanel(post,title){
  return '<details class="post-preview"'+(title==='Anuncio en preparación'?' open':' ')+'><summary>'+esc(title)+'</summary><p class="muted mini">Destino de API: grupo de bitácora · '+esc(post.profile)+' · simulación</p><pre class="whatsapp-preview">'+esc(post.text)+'</pre><p class="mini">Referencias de medios: '+post.media.length+' · Identificaciones excluidas: '+post.suppressedMedia+'</p><details><summary>Contrato para la API</summary><pre>'+esc(JSON.stringify(post,null,2))+'</pre></details></details>';
}
function openDestinations() {
  destinationMenu={rows:M.clone(draft.data.destinos||[]),stack:[{level:'coto',before:M.clone(draft.data.destinos||[])}]};error='';render();
}
function menuDown(level,values={}) {
  const parent=destinationMenu.stack.at(-1);
  destinationMenu.stack.push({...parent,...values,level,before:M.clone(destinationMenu.rows)});render();
}
function toggleDestination(candidate) {
  const key=M.destinationKey(candidate),i=destinationMenu.rows.findIndex(x=>M.destinationKey(x)===key);
  if(i>=0)destinationMenu.rows.splice(i,1);
  else if(destinationMenu.rows.length<Number(flow.querySelector('Grupo[name="destinos"]').getAttribute('maximo')))destinationMenu.rows.push({...candidate,id:M.uid()});
  else error='Puedes seleccionar hasta 20 destinos.';
  render();
}
function destinationPicker() {
  const state=destinationMenu.stack.at(-1),rows=destinationMenu.rows,g=flow.querySelector('Grupo[name="destinos"]'),field=name=>g.querySelector('Campo[name="'+name+'"]');
  const tiles=(values,attr)=>'<div class="tiles">'+values.map(({value,label,candidate})=>{const selected=candidate&&rows.some(x=>M.destinationKey(x)===M.destinationKey(candidate));return '<button class="tile" data-menu-'+attr+'="'+esc(value)+'" aria-pressed="'+!!selected+'"><strong>'+esc(label)+'</strong>'+(selected?'<small>✓ Seleccionado</small>':'')+'</button>';}).join('')+'</div>';
  let html='<h2 id="question-title" tabindex="-1">'+esc({coto:'¿Qué coto?',lugar:draft.data.operacion==='salida'?'¿De dónde sale?':draft.data.operacion==='objetos'?'¿A qué destino corresponde?':'¿Qué lugar?',calle:'¿Qué calle?',numero:'Selecciona números o toda la calle',detalle:'Detalle de ubicación'}[state.level])+'</h2><p>'+esc([state.coto,state.lugar,state.calle].filter(Boolean).join(' › '))+'</p><p class="muted">Continuar vuelve al menú anterior conservando la selección. Cancelar descarta los cambios de este menú.</p>';
  if(state.level==='coto')html+=tiles([...field('coto').children].map(n=>({value:n.textContent,label:n.textContent})),'coto');
  if(state.level==='lugar')html+=tiles([...field('tipo_destino').children].filter(n=>n.nodeName==='Opcion'&&n.textContent!=='Toda la calle').map(n=>({value:n.textContent,label:n.textContent})),'lugar');
  if(state.level==='calle')html+=tiles(M.streets[state.coto].map(c=>({value:c,label:c})),'calle');
  if(state.level==='numero'){
    const numbers=M.houses[state.coto].filter(h=>h.calle===state.calle).map(h=>({value:h.value,label:'Casa '+h.numero,candidate:{coto:state.coto,tipo_destino:'Domicilio',calle:state.calle,domicilio:h.value}}));
    if(M.streetWork(draft.data))numbers.push({value:'toda',label:'Toda la calle · trabajos',candidate:{coto:state.coto,tipo_destino:'Toda la calle',calle:state.calle}});
    html+='<p class="muted">Puedes marcar varios números sin salir. Los números son ficticios.</p>'+tiles(numbers,'numero')+'<div class="notice">Toda la calle requiere un asunto de trabajos o servicios y autorización de administración para esa calle.</div>';
  }
  if(state.level==='detalle')html+='<label for="menu-detail">Detalle opcional</label><input id="menu-detail" autocomplete="off"><p>Continuar agrega este lugar a la selección.</p>';
  html+='<div role="alert">'+esc(error)+'</div><div class="actions">'+button(state.level==='coto'?'Continuar · usar selección':'Continuar','menu-next',true)+button('Cancelar este menú','menu-cancel')+'</div><h3>Destinos seleccionados · '+rows.length+'</h3>'+rows.map(x=>'<div class="card">'+esc(M.destLabel(x))+' · '+esc(M.destinationState(x,draft.data.autorizaciones))+'</div>').join('');
  return html;
}
function requestsWhenReady() {
  const d=draft.data;
  if(d.destinos_confirmados && (!d.captura_inicial||d.captura_inicial.revisado) && M.derived(d,db).necesita_identificacion==='Sí' && d.personas?.[0]?.nombre && d.tipo_persona && d.asunto)W.prepareRequests(d,draft.id);
}
function finishMenu(cancel=false) {
  const state=destinationMenu.stack.pop();
  if(cancel)destinationMenu.rows=M.clone(state.before);
  else if(state.level==='detalle'){
    const x={id:M.uid(),coto:state.coto,tipo_destino:state.lugar,detalle_destino:document.querySelector('#menu-detail')?.value.trim()||''};
    if(!destinationMenu.rows.some(row=>M.destinationKey(row)===M.destinationKey(x)))destinationMenu.rows.push(x);
  }
  if(!destinationMenu.stack.length){
    if(!cancel){
      const old=draft.data.destinos||[],rows=destinationMenu.rows;
      for(const x of old)if(!rows.some(r=>r.id===x.id))M.invalidateDestination(draft.data,x.id);
      draft.data.destinos=rows;draft.data.destinos_confirmados=true;recordChange('destinos',M.clone(rows),old);W.syncRequests(draft.data);requestsWhenReady();
    }
    destinationMenu=null;
  }
  error='';render();
}
function wizard() {
  const list=current();cursor=Math.max(0,Math.min(cursor,list.length-1));const step=list[cursor];
  const pct=Math.round((cursor+1)/list.length*100);
  const groups=[...new Set(list.filter(s=>s.group).map(s=>s.group))];
  const navigation='<nav class="filters" aria-label="Completar en otro orden">'+groups.map(g=>'<button class="btn" data-jump="'+esc(g.getAttribute('nombre'))+'">'+esc(g.getAttribute('nombre'))+'</button>').join('')+'<button class="btn" data-jump="summary">Resumen</button></nav>';
  const preview=destinationMenu?{...draft.data,destinos:destinationMenu.rows}:draft.data;
  const announcement=W.publication(preview,{action:'borrador',status:'Anuncio en preparación · aún sin ingreso físico',time:draft.created,id:draft.id},W.policyFromFlow(flow));
  return '<div class="progress"><span>'+esc(homeOptions().find(n=>n.getAttribute('valor')===draft.data.operacion)?.textContent)+'</span><div class="track"><span style="width:'+pct+'%"></span></div><span>'+(cursor+1)+' / '+list.length+'</span></div>'+(!destinationMenu?navigation:'')+'<div class="layout"><section class="panel question">'+(destinationMenu?destinationPicker():(step.summary?summary():step.manage?manage(step):question(step))+'<div id="error" role="alert">'+(error?'<div class="error">'+esc(error)+'</div>':'')+'</div><div class="actions">'+button('Atrás','back')+(!step.summary?button(step.manage?step.group.getAttribute('etiqueta_listo')||'Continuar':'Continuar','next',true):'')+button('Cancelar','cancel')+'</div>'+(cancelOpen?'<div class="notice warn">¿Quieres conservar lo capturado como borrador?<div class="actions">'+button('Guardar borrador y volver','save-draft')+button('Descartar y volver','discard')+button('Seguir capturando','keep')+'</div></div>':''))+'</section><aside class="panel aside"><details open><summary>Lo seleccionado · Borrador</summary>'+liveSummary(preview,true)+'</details>'+publicationPanel(announcement,'Anuncio en preparación')+communicationsPanel(draft.data)+'</aside></div>';
}
function communicationsPanel(d) {
  const requests=d.solicitudes_whatsapp||[];
  return '<div class="communications"><h3>WhatsApp · API simulada</h3><p class="muted mini">La solicitud privada se prepara al terminar los destinos. Puedes simular la respuesta mientras completas los demás datos.</p>'+requests.map(r=>'<div class="card"><b>'+esc(M.destLabel((d.destinos||[]).find(x=>x.id===r.destinationId)||{coto:r.coto}))+'</b><br><span class="badge">'+esc(r.status)+'</span><details><summary>Solicitud privada</summary><pre>'+esc(r.text)+'</pre></details>'+(['Esperando respuesta simulada','No contesta'].includes(r.status)?'<div class="actions">'+['Autorizado','No autorizado','No contesta'].map(result=>'<button class="btn mini" data-reply="'+esc(r.id)+'" data-result="'+result+'">Simular: '+result+'</button>').join('')+'</div>':'')+'</div>').join('')+(requests.some(r=>r.status==='Invalidada por cambios')?button('Preparar nueva solicitud simulada','prepare-requests'):'')+'<p class="mini">Grupo: visita con nombre y placas; repartidor con empresa, nombre abreviado y placas parciales. Sin imágenes de identificación.</p></div>';
}
function searchable(value) {return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
function listPage() {
  const records=[
    ...db.entries.map(e=>({id:e.id,category:e.inside.length||e.vehicleInside?'Personas dentro':'Historial',title:e.data.personas.map(p=>p.nombre).join(', '),details:[e.data.placas,e.data.destinos?.map(M.destLabel).join('; '),db.tags.find(t=>t.entryId===e.id&&t.status!=='Devuelto')?.number].filter(Boolean).join(' · '),status:e.status,kind:'entry',source:e})),
    ...db.drafts.map(e=>({id:e.id,category:e.status==='Borrador'?'Borradores':['Denegado','Entrada registrada'].includes(e.status)?'Historial':'Accesos pendientes',title:e.data.personas?.map(p=>p.nombre).join(', ')||e.data.contacto_referencia||'Caso '+e.data.operacion,details:[e.data.placas,e.data.destinos?.map(M.destLabel).join('; ')].filter(Boolean).join(' · '),status:e.status,kind:e.linkedEntryId?'closed':'draft',source:e})),
    ...db.objects.map(e=>({id:e.id,category:e.status==='En resguardo'?'Objetos en resguardo':'Historial',title:e.data.tipo_objeto+' · '+e.data.descripcion_objeto,details:[e.data.referencia_objeto,e.data.destinos?.map(M.destLabel).join('; ')].join(' · '),status:e.status,kind:'object',source:e})),
    ...db.tags.filter(t=>t.status!=='Devuelto').map(t=>({id:t.id,category:'Tags por recuperar',title:'Tag '+t.number,details:(db.entries.find(e=>e.id===t.entryId)?.data.personas||[]).map(p=>p.nombre).join(', '),status:t.status,kind:'tag',source:t})),
    ...db.events.filter(e=>e.action==='emergencia').map(e=>({id:e.id,category:'Atenciones',title:e.data.servicio,details:e.data.destinos?.map(M.destLabel).join('; ')||e.data.ubicacion_aproximada,status:e.status,kind:'emergency',source:e}))
  ].filter(x=>(filter==='Todos'||x.category===filter)&&searchable(x.title+' '+x.details).includes(searchable(query)));
  return '<div class="hero"><span class="eyebrow">Bitácora ficticia</span><h1>Personas dentro / pendientes</h1></div><label for="list-search">Buscar por nombre, placas, tag o destino</label><input id="list-search" type="search" value="'+esc(query)+'" placeholder="Por ejemplo: DEMO-001 o Asturias"><div class="filters">'+['Todos','Accesos pendientes','Personas dentro','Objetos en resguardo','Tags por recuperar','Borradores','Atenciones','Historial'].map(f=>button(f,'filter:'+f,filter===f)).join('')+'</div><div id="records">'+records.map(x=>'<article class="card"><span class="eyebrow">'+esc(x.category)+'</span><h3>'+esc(x.title)+'</h3><p>'+esc(x.details)+'</p><span class="badge">'+esc(x.status)+'</span><div class="actions">'+(x.kind==='entry'&&x.category==='Personas dentro'?'<button class="btn" data-exit="'+esc(x.id)+'">Registrar salida</button>':'')+(x.kind==='draft'?'<button class="btn" data-resume="'+esc(x.id)+'">Revisar / continuar</button>':'')+(x.kind==='object'&&x.status==='En resguardo'?'<button class="btn" data-deliver="'+esc(x.id)+'">Entregar objeto</button>':'')+(x.kind==='tag'?'<button class="btn" data-return="'+esc(x.id)+'">Registrar recuperación</button>':'')+(x.kind==='emergency'?'<button class="btn" data-attention="'+esc(x.id)+'">Completar atención</button>':'')+'</div></article>').join('')+(!records.length?'<p class="empty">Sin registros para esta búsqueda.</p>':'')+'</div><div class="actions">'+button('Volver al inicio','home')+'</div>';
}
function savedPage() {
  return '<section class="panel saved"><span class="success-icon" aria-hidden="true">✓</span><span class="eyebrow">Registro ficticio guardado</span><h1>'+esc(saved.status)+'</h1><p>'+timestamp(saved.time)+' · Vigilante Demo</p><div class="notice">'+(saved.action==='entrada'?'Se registró la entrada física a los destinos permitidos.':saved.action==='llamada'?'La llamada simulada no creó una entrada.':saved.action==='hechos'?'Se registró la salida física. El movimiento especial sigue pendiente de respaldo.':saved.action==='salida'?'La salida física y la recuperación del tag se guardaron por separado.':'Registro de demostración guardado en este navegador.')+'</div>'+liveSummary(saved.data)+'<div class="actions">'+(saved.action==='llamada'&&M.allowedDestinations(saved.data).length?button('Continuar a Entrada','call-entry',true):'')+button('Nuevo movimiento','home',true)+button('Ver personas / pendientes','list')+'</div></section>';
}
function render(focus=true) {
  const examples='<details><summary>Probar los 18 escenarios ficticios</summary><label for="example">Escenario</label><select id="example">'+scenarios.map((s,i)=>'<option value="'+i+'">'+s.id+'. '+esc(s.label)+'</option>').join('')+'</select><div class="actions">'+button('Abrir escenario en el resumen','example')+'</div><p class="muted mini">Puedes volver atrás para revisar las preguntas. Los casos 6 y 17 deben bloquear la confirmación.</p></details>';
  app.innerHTML=view==='home'?home()+examples:view==='list'?listPage():view==='saved'?savedPage()+(saved.publicacion?publicationPanel(saved.publicacion,'Publicación de bitácora simulada'):''):wizard();
  if(focus) (document.querySelector('#question-title')||document.querySelector('h1'))?.focus({preventScroll:true});
}
function recordChange(key,value,previous) {
  draft.changes.push({key,previous,value,time:M.now(),vigilante:'Vigilante Demo'});
}
function answer(step,value) {
  const name=step.field.getAttribute('name'),old=M.clone(step.local[name]??null);
  if(E.setAnswer(flow,draft.data,db,step,value)) {
    recordChange(step.key,value,old);
    if(step.field.getAttribute('accion')==='recuperar_ingreso') M.recoverEntry(draft.data,db,value);
    if(step.field.getAttribute('accion')==='recuperar_objeto') M.recoverObject(draft.data,db,value);
    W.syncRequests(draft.data);
    requestsWhenReady();
  }
}
function capture(step) {
  if(!step?.field)return;
  if(step.field.getAttribute('tipo')==='captura'){
    const name=document.querySelector('#capture-name');
    const medium=document.querySelector('#capture-medium')?.value;
    if(name)answer(step,{nombre:name.value.trim(),identificacion:document.querySelector('#capture-id').value,medio_ingreso:medium,placas:['Moto','Automóvil','Vehículo de carga'].includes(medium)?document.querySelector('#capture-plate').value.trim():'',revisado:document.querySelector('#capture-reviewed').checked,fuente:step.local.captura_inicial?.fuente||'manual'});
    return;
  }
  const input=document.querySelector('#answer');
  if(input&&step.field.getAttribute('tipo')!=='archivo')answer(step,input.value.trim());
}
function advance() {
  const step=current()[cursor];capture(step);
  if(step.field) {
    error=E.fieldError(step,catalog(step));
    if(error){render();return;}
  }
  if(step.manage) {
    const rows=draft.data[step.collection]||[];
    if(rows.length<Number(step.group.getAttribute('minimo'))) {error='Agrega al menos un registro.';render();return;}
    if(step.collection==='destinos'&&!M.ruleOperators.destinos_unicos(draft.data)){error='Ese destino ya existe. Elimina el duplicado.';render();return;}
    if(step.collection==='autorizaciones') for(const a of rows) if(a.respaldo==='Formato'&&a.resultado==='Autorizado'&&!(a.folio||a.documento)){error='Un formato autorizado necesita folio o documento y verificación.';render();return;}
    if(step.collection==='destinos' && M.derived(draft.data,db).necesita_identificacion==='Sí' && flow.querySelector('Comunicaciones')?.getAttribute('solicitud_en')==='destinos_listos'){
      draft.data.destinos_confirmados=true;requestsWhenReady();
    }
  }
  const list=current(),index=list.findIndex(x=>x.key===step.key);cursor=index<0?Math.min(cursor,list.length-1):Math.min(index+1,list.length-1);error='';render();
}
function close(action) {
  if(saveBusy)return;
  const d=draft.data;
  E.prune(flow,d,db);
  W.syncRequests(d);
  const errors=E.validate(flow,d,db,action,catalog);
  if(errors.length){error=errors.map(e=>e.message).join(' ');render();return;}
  saveBusy=true;
  try {
    const next=M.clone(db);
    if(draft.sourceAttention)d.atencion_id=draft.sourceAttention;
    saved=M.commit(next,d,action,draft.id);
    if(['entrada','salida','hechos','objeto','emergencia'].includes(action) && flow.querySelector('Comunicaciones')?.getAttribute('publicacion_en')==='movimiento_registrado'){
      const post=W.publication(saved.data,saved,W.policyFromFlow(flow));
      next.publicaciones_whatsapp ||= [];
      if(!next.publicaciones_whatsapp.some(p=>p.idempotencyKey===post.idempotencyKey))next.publicaciones_whatsapp.push(post);
      saved.publicacion=post;
    }
    next.events.at(-1).changes=M.clone(draft.changes);
    if(draft.sourceDraft) next.drafts=next.drafts.filter(x=>x.id!==draft.sourceDraft);
    localStorage.setItem(storageKey,JSON.stringify(next));db=next;view='saved';error='';cancelOpen=false;render();
  } catch(e) {error='No se guardó: '+e.message;render();}
  finally{saveBusy=false;}
}
app.addEventListener('click',event=>{
  const el=event.target.closest('button');if(!el)return;
  if(el.hasAttribute('data-jump')){
    capture(current()[cursor]);cursor=current().findIndex(s=>el.dataset.jump==='summary'?s.summary:s.group?.getAttribute('nombre')===el.dataset.jump);error='';render();return;
  }
  if(el.dataset.act==='menu-next'||el.dataset.act==='menu-cancel'){finishMenu(el.dataset.act==='menu-cancel');return;}
  if(destinationMenu){
    const s=destinationMenu.stack.at(-1);
    if(el.hasAttribute('data-menu-coto'))menuDown('lugar',{coto:el.dataset.menuCoto});
    if(el.hasAttribute('data-menu-lugar'))menuDown(el.dataset.menuLugar==='Domicilio'?'calle':'detalle',{lugar:el.dataset.menuLugar});
    if(el.hasAttribute('data-menu-calle'))menuDown('numero',{calle:el.dataset.menuCalle});
    if(el.hasAttribute('data-menu-numero'))toggleDestination({coto:s.coto,calle:s.calle,tipo_destino:el.dataset.menuNumero==='toda'?'Toda la calle':'Domicilio',...(el.dataset.menuNumero==='toda'?{}:{domicilio:el.dataset.menuNumero})});
    return;
  }
  if(el.hasAttribute('data-start')) {const op=el.dataset.start;if(op==='lista'){view='list';render();}else start(op);return;}
  if(el.hasAttribute('data-value')) {
    const step=current()[cursor],type=step.field.getAttribute('tipo'),value=el.dataset.value;
    if(type==='checklist') {const values=step.local[step.field.getAttribute('name')]||[];answer(step,values.includes(value)?values.filter(x=>x!==value):[...values,value]);render();}
    else{answer(step,value);advance();}
    return;
  }
  if(el.hasAttribute('data-reply')){
    const step=current()[cursor],key=step.key;capture(step);
    try{W.reply(draft.data,el.dataset.reply,el.dataset.result);recordChange('whatsapp.respuesta',el.dataset.result,null);const index=current().findIndex(s=>s.key===key);if(index>=0)cursor=index;error='';}catch(e){error=e.message;}
    render();return;
  }
  if(el.hasAttribute('data-evidence')){
    draft.data.evidencias_bitacora ||= [];
    draft.data.evidencias_bitacora.push({id:M.uid(),categoria:el.dataset.evidence,ref:'demo://medio/'+M.uid(),simulation:true});
    render();return;
  }
  if(el.hasAttribute('data-edit')) {
    const step=current()[cursor],item=draft.data[step.collection][Number(el.dataset.edit)];
    if(step.collection==='destinos'){openDestinations();return;}
    cursor=current().findIndex(x=>x.local?.id===item.id);render();return;
  }
  if(el.hasAttribute('data-remove')) {
    const step=current()[cursor],list=draft.data[step.collection],removed=list[Number(el.dataset.remove)];
    if(step.collection==='destinos')M.invalidateDestination(draft.data,removed.id);
    list.splice(Number(el.dataset.remove),1);recordChange(step.collection+'.remove',removed.id,null);
    W.syncRequests(draft.data);
    cursor=current().findIndex(x=>x.key===step.key);render();return;
  }
  if(el.hasAttribute('data-exit')) {start('salida');draft.data.ingreso_id=el.dataset.exit;M.recoverEntry(draft.data,db,el.dataset.exit);cursor=current().findIndex(x=>x.key==='tipo_salida');render();return;}
  if(el.hasAttribute('data-deliver')) {start('objetos');Object.assign(draft.data,{movimiento_objeto:'Entregar desde caseta',objeto_id:el.dataset.deliver});M.recoverObject(draft.data,db,el.dataset.deliver);cursor=current().findIndex(x=>x.key==='recibe_nombre');render();return;}
  if(el.hasAttribute('data-resume')) {
    const source=db.drafts.find(x=>x.id===el.dataset.resume);start(source.data.operacion,source.data);draft.sourceDraft=source.id;render();return;
  }
  if(el.hasAttribute('data-return')) {
    const t=db.tags.find(x=>x.id===el.dataset.return);t.status='Devuelto';t.updated=M.now();db.events.push({id:M.uid(),action:'recuperar_tag',tag:t.number,time:t.updated,vigilante:'Vigilante Demo'});persist();render();return;
  }
  if(el.hasAttribute('data-attention')) {
    const source=db.events.find(x=>x.id===el.dataset.attention);start('emergencia',source.data);draft.sourceAttention=source.id;render();return;
  }
  const action=el.dataset.act;
  if(!action)return;
  if(action.startsWith('commit:')){close(action.split(':')[1]);return;}
  if(action.startsWith('filter:')){filter=action.slice(7);render(false);return;}
  switch(action) {
    case 'next':advance();break;
    case 'demo-read':{
      const step=current()[cursor];answer(step,{nombre:'Lucía Persona Demo',identificacion:'INE',medio_ingreso:'Automóvil',placas:'DEMO-204',revisado:false,fuente:'lectura_simulada'});
      render();break;
    }
    case 'prepare-requests':{
      capture(current()[cursor]);try{W.prepareRequests(draft.data,draft.id);error='';}catch(e){error=e.message;}render();break;
    }
    case 'defer-backing': {
      const step=current()[cursor];capture(step);
      if(step.collection==='autorizaciones'){step.local.resultado='Pendiente de verificar';step.local.verificado='No';}
      else step.local.verificado='No';
      cursor=current().findIndex(x=>x.key===step.collection+'.manage')+1;error='';render();break;
    }
    case 'back':capture(current()[cursor]);cursor=Math.max(0,cursor-1);error='';render();break;
    case 'cancel':capture(current()[cursor]);cancelOpen=true;render();break;
    case 'keep':cancelOpen=false;render();break;
    case 'discard':W.cancelRequests(draft.data);view='home';cancelOpen=false;render();break;
    case 'save-draft':db.drafts.push({id:M.uid(),data:M.clone(draft.data),status:'Borrador',created:M.now(),changes:draft.changes,vigilante:'Vigilante Demo'});persist();view='home';cancelOpen=false;render();break;
    case 'add': {
      const step=current()[cursor],list=draft.data[step.collection],max=Number(step.group.getAttribute('maximo'));
      if(step.collection==='destinos'){openDestinations();break;}
      if(list.length>=max){error='Límite de registros para este prototipo.';render();break;}
      const row={id:M.uid()};list.push(row);W.syncRequests(draft.data);cursor=current().findIndex(x=>x.local?.id===row.id);error='';render();break;
    }
    case 'clear-file':{const step=current()[cursor];answer(step,undefined);render();break;}
    case 'home':view='home';render();break;
    case 'list':view='list';render();break;
    case 'reset':db=M.newDatabase();persist();render();break;
    case 'example': {
      const index=Number(document.querySelector('#example').value),example=scenarios[index];
      start(example.data.operacion,example.data);cursor=current().length-1;render();break;
    }
    case 'call-entry': {
      const data=M.clone(saved.data),reference=saved.id;start('entrada',data);draft.data.llamada_id=reference;
      // El contacto ya capturado se conserva; la identidad es un evento diferente.
      render();break;
    }
    case 'export': {
      const url=URL.createObjectURL(new Blob([JSON.stringify(db,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='neibora-registros-ficticios.json';link.click();URL.revokeObjectURL(url);break;
    }
  }
});
app.addEventListener('input',event=>{
  const input=event.target;
  if(input.id==='reference-search') {
    for(const tile of document.querySelectorAll('#options .tile'))tile.hidden=!searchable(tile.dataset.search).includes(searchable(input.value));
  }
  if(input.id==='list-search') {
    query=input.value;const pos=input.selectionStart;render(false);const replacement=document.querySelector('#list-search');replacement.focus();replacement.setSelectionRange(pos,pos);
  }
});
app.addEventListener('change',event=>{
  if(event.target.id==='limited'){draft.data.alcance_limitado=event.target.checked;recordChange('alcance_limitado',event.target.checked,null);}
  if(event.target.id==='answer' && event.target.type==='file') {
    const file=event.target.files[0];if(file){answer(current()[cursor],{name:file.name,size:file.size,type:file.type,soloReferencia:true});render();}
  }
});
try {
  const response=await fetch('./flujo.xml',{cache:'no-store'});if(!response.ok)throw Error('No se pudo cargar el XML.');
  flow=E.parseFlow(await response.text());W.policyFromFlow(flow);render();
} catch(e) {app.innerHTML='<section class="panel"><h1>No se pudo abrir el prototipo</h1><p>'+esc(e.message)+'</p><p>Ejecuta el servidor local indicado en README.md; no abras el HTML directamente como archivo.</p></section>';}
