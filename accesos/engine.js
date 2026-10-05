import {condition, present, derived, uid, invalidateDestination, ruleOperators} from './model.js';
const types = new Set(['texto','numero','archivo','si_no','opcion','checklist','catalogo','referencia','captura']);
const actions = new Set(['pendiente','denegacion','entrada','salida','hechos','llamada','objeto','emergencia']);
const catalogs = new Set(['calles','domicilios','ingresos','objetos','destinos','origenes','personas','personas_dentro','tags']);
const derivedNames = new Set(['ordinario','necesita_destinos','necesita_identificacion','necesita_autorizacion','requiere_muebles','tenia_tag','vehiculo_dentro']);
export function parseFlow(text) {
  // DOMParser no carga DTD; además rechazamos DTD/entidades antes del parseo.
  if (/<!DOCTYPE|<!ENTITY/i.test(text)) throw Error('DTD y entidades externas no admitidas.');
  const doc = new DOMParser().parseFromString(text,'application/xml');
  if(doc.querySelector('parsererror') || doc.documentElement.nodeName!=='ChecklistAccesos') throw Error('XML de flujo inválido.');
  const globals = new Set(derivedNames);
  const repeats = new Map();
  const scopes = new Map();
  for(const group of doc.querySelectorAll('Grupo')) {
    if(group.parentElement!==doc.documentElement) throw Error('Esta versión requiere grupos de primer nivel.');
    if(group.getAttribute('repetible')==='true') {
      const name=group.getAttribute('name'),min=Number(group.getAttribute('minimo')),max=Number(group.getAttribute('maximo'));
      if(!name || !/^[a-z][a-z0-9_]*$/.test(name) || repeats.has(name) || !Number.isInteger(min) || !Number.isInteger(max) || min<0 || max<min || max>100) throw Error('Grupo repetible inválido.');
      repeats.set(name,group);
    }
  }
  for(const f of doc.querySelectorAll('Campo')) {
    const repeat=f.closest('Grupo[repetible="true"]');
    const scope=repeat?.getAttribute('name') || 'global';
    if(!scopes.has(scope)) scopes.set(scope,new Set());
    const name=f.getAttribute('name');
    if(!name || !/^[a-z][a-z0-9_]*$/.test(name) || scopes.get(scope).has(name)) throw Error('Identificador duplicado o inválido: '+name);
    scopes.get(scope).add(name);
    if(!repeat) globals.add(name); else repeats.set(scope,repeat);
    if(!types.has(f.getAttribute('tipo'))) throw Error('Tipo no admitido.');
    if(f.hasAttribute('catalogo') && !catalogs.has(f.getAttribute('catalogo'))) throw Error('Catálogo no admitido.');
    if(f.hasAttribute('accion') && !['recuperar_ingreso','recuperar_objeto'].includes(f.getAttribute('accion'))) throw Error('Operación de campo no admitida.');
    const opts=[...f.children].filter(x=>x.nodeName==='Opcion').map(x=>x.getAttribute('valor')||x.textContent.trim());
    if(new Set(opts).size!==opts.length) throw Error('Opciones duplicadas.');
  }
  for(const n of doc.querySelectorAll('*')) {
    const scope=n.closest('Grupo[repetible="true"]')?.getAttribute('name');
    for(const a of n.attributes) if(a.name.startsWith('condicion_')) {
      condition(undefined,a.value);
      if(!globals.has(a.name.slice(10)) && !scopes.get(scope)?.has(a.name.slice(10))) throw Error('Referencia de condición desconocida: '+a.name);
    }
    if(n.nodeName==='Regla' && !['campos_obligatorios',...Object.keys(ruleOperators)].includes(n.getAttribute('operador'))) throw Error('Validador desconocido.');
    if(n.nodeName==='Accion' && !actions.has(n.getAttribute('id'))) throw Error('Acción de cierre desconocida.');
  }
  for(const [scope,g] of repeats) {
    if(!scope || Number(g.getAttribute('maximo'))<Number(g.getAttribute('minimo'))) throw Error('Grupo repetible inválido.');
  }
  return doc;
}
export function visible(node, global, local={}) {
  for(const a of node.attributes) if(a.name.startsWith('condicion_')) {
    const name=a.name.slice(10);
    const repeat=node.nodeName==='Grupo'?null:node.closest('Grupo[repetible="true"]');
    const declaredLocally=repeat && groupFields(repeat).some(f=>f.getAttribute('name')===name);
    const value=declaredLocally || Object.prototype.hasOwnProperty.call(local,name)?local[name]:global[name];
    if(!condition(value,a.value)) return false;
  }
  return true;
}
export function groupFields(g) { return [...g.children].filter(n=>n.nodeName==='Campo'); }
export function steps(flow,d,db,initialize=true) {
  const global=derived(d,db), out=[];
  for(const g of flow.documentElement.children) {
    if(g.nodeName!=='Grupo' || g.getAttribute('nombre')==='Inicio' || !visible(g,global)) continue;
    const name=g.getAttribute('name');
    if(g.getAttribute('repetible')==='true') {
      if(initialize && !Array.isArray(d[name])) d[name]=[];
      if(initialize && !d[name].length && Number(g.getAttribute('minimo'))>0 && g.getAttribute('selector')!=='jerarquico') d[name].push({id:uid()});
      for(const item of d[name] || []) for(const f of groupFields(g)) {
        if(name==='autorizaciones' && item.solicitud_id)continue;
        if(f.getAttribute('omitir_captura')==='true' && d.captura_inicial && item.id===d.personas?.[0]?.id && present(item[f.getAttribute('name')]))continue;
        if(visible(f,global,item)) out.push({key:name+'.'+item.id+'.'+f.getAttribute('name'),field:f,group:g,local:item,collection:name});
      }
      out.push({key:name+'.manage',group:g,collection:name,manage:true});
    } else for(const f of groupFields(g)) {
      if(f.getAttribute('omitir_existente')==='personas.nombre' && !d.captura_inicial && present(d.personas?.[0]?.nombre))continue;
      if(f.getAttribute('omitir_captura')==='true' && d.captura_inicial && present(d[f.getAttribute('name')]))continue;
      if(visible(f,global))out.push({key:f.getAttribute('name'),field:f,group:g,local:d});
    }
  }
  out.push({key:'summary',summary:true});
  return out;
}
export function prune(flow,d,db) {
  // Punto fijo: una dependencia oculta puede ocultar otras respuestas.
  for(let pass=0;pass<10;pass++) {
    let changed=false;
    const global=derived(d,db);
    for(const g of flow.documentElement.children) {
      if(g.nodeName!=='Grupo') continue;
      const name=g.getAttribute('name');
      if(!visible(g,global)) {
        // Las referencias recuperadas son instantáneas del hecho original.
        // Los datos propios de una rama descartada se eliminan.
        const recoveredEntry=d.operacion==='salida' && d.ingreso_id && d.ingreso_id!=='sin_ingreso';
        const recoveredObject=d.operacion==='objetos' && d.objeto_recuperado;
        if(name && !recoveredEntry && !(name==='destinos' && recoveredObject) && Object.hasOwn(d,name)) {delete d[name];changed=true;}
        if(!name) for(const f of groupFields(g)) {
          const field=f.getAttribute('name');
          if(recoveredEntry && ['asunto','medio_ingreso','placas','descripcion_vehiculo','tipo_persona'].includes(field)) continue;
          if(Object.hasOwn(d,field)){delete d[field];changed=true;}
        }
        continue;
      }
      const locals=g.getAttribute('repetible')==='true'?(d[name]||[]):[d];
      for(const local of locals) for(const f of groupFields(g)) {
        const field=f.getAttribute('name');
        if(!visible(f,global,local) && Object.hasOwn(local,field)) {delete local[field];changed=true;}
        else if(visible(f,global,local) && ['opcion','checklist'].includes(f.getAttribute('tipo')) && !f.hasAttribute('catalogo') && present(local[field])) {
          const options=[...f.children].filter(n=>n.nodeName==='Opcion' && visible(n,global,local)).map(n=>n.getAttribute('valor')||n.textContent.trim());
          const values=Array.isArray(local[field])?local[field].filter(v=>options.includes(v)):options.includes(local[field])?local[field]:undefined;
          if(JSON.stringify(values)!==JSON.stringify(local[field])) {local[field]=values;changed=true;}
        }
      }
    }
    if(!changed) break;
  }
}
export function setAnswer(flow,d,db,step,value) {
  const name=step.field.getAttribute('name'), target=step.local;
  if(JSON.stringify(target[name])===JSON.stringify(value)) return false;
  for(const dep of (step.field.getAttribute('invalida')||'').split(' ').filter(Boolean)) {
    if(name==='tipo_salida' && value==='Salida normal') continue;
    if(dep.includes('.')) { const [list,field]=dep.split('.');for(const row of d[list]||[]) delete row[field]; }
    else delete target[dep];
  }
  if(step.collection==='destinos') invalidateDestination(d,target.id);
  if(step.collection==='autorizaciones' || step.collection==='destinos') delete d.alcance_limitado;
  target[name]=value;
  if(name==='captura_inicial' && value) {
    d.personas ||= [{id:uid()}];
    if(!d.personas.length)d.personas.push({id:uid()});
    const p=d.personas[0];
    if(p.nombre!==value.nombre || p.identificacion!==value.identificacion)delete p.identificacion_verificada;
    p.nombre=value.nombre;p.identificacion=value.identificacion;
    d.medio_ingreso=value.medio_ingreso;
    if(['Moto','Automóvil','Vehículo de carga'].includes(value.medio_ingreso)){
      d.tiene_placas=value.placas?'Sí':'No';
      if(value.placas)d.placas=value.placas;else delete d.placas;
      if(value.descripcion_vehiculo)d.descripcion_vehiculo=value.descripcion_vehiculo;
    }
  }
  if(step.collection==='autorizaciones') target.hora=new Date().toISOString();
  if(step.collection==='autorizaciones' && name!=='resultado' && target.resultado==='Autorizado') delete target.resultado;
  if(step.collection==='autorizaciones' && !['verificado','resultado'].includes(name)) delete target.verificado;
  if(step.collection==='documentos' && name!=='verificado') delete target.verificado;
  if(d.operacion==='emergencia' && name==='emergencia_activa' && value==='Sí') {
    for(const k of ['tipo_persona','asunto','personas','autorizaciones','documentos','entrega_tag','numero_tag','responsable_tag','medio_ingreso','placas','tiene_placas','descripcion_vehiculo','motivo_sin_placas','motivo_sin_tag']) delete d[k];
  }
  if(name==='ubicacion_conocida' && value==='No') delete d.destinos;
  prune(flow,d,db);
  return true;
}
export function fieldError(step,options=[]) {
  const f=step.field,name=f.getAttribute('name'),value=step.local[name];
  if(f.getAttribute('obligatorio')==='true' && !present(value)) return 'Selecciona o completa esta respuesta.';
  if(!present(value)) return '';
  if(f.getAttribute('tipo')==='captura' && (!value.nombre?.trim() || value.revisado!==true))return 'Revisa el nombre y confirma la lectura o captura. Las placas se obtienen del vehículo.';
  if(f.getAttribute('tipo')==='numero' && (!Number.isFinite(Number(value)) || Number(value)<Number(f.getAttribute('min')||0) || !Number.isInteger(Number(value)))) return 'Escribe un número entero válido.';
  if(options.length && ['catalogo','referencia','checklist'].includes(f.getAttribute('tipo'))) {
    const values=Array.isArray(value)?value:[value];
    if(values.some(v=>!options.some(o=>o.value===v))) return 'La selección ya no está disponible.';
  }
  return '';
}
export function validate(flow,d,db,action,catalog) {
  const errors=[], global=derived(d,db);
  for(const step of steps(flow,d,db,false)) {
    if(step.field) {
      if(['pendiente','denegacion','hechos'].includes(action) && ['autorizaciones','documentos'].includes(step.collection)) continue;
      const error=fieldError(step,catalog(step));
      if(error) errors.push({key:step.key,message:step.field.getAttribute('etiqueta')+': '+error});
    } else if(step.manage && (d[step.collection]||[]).length<Number(step.group.getAttribute('minimo'))) errors.push({key:step.key,message:'Agrega '+step.group.getAttribute('nombre')+'.'});
  }
  const stage=action==='salida' && d.tipo_salida!=='Salida normal'?'salida_especial':action;
  for(const rule of flow.querySelectorAll('Validaciones > Regla')) {
    const op=rule.getAttribute('operador');
    if(op==='campos_obligatorios') continue;
    const applies=rule.getAttribute('accion');
    if(applies && !applies.split('|').includes(stage)) continue;
    if(!visible(rule,global)) continue;
    if(!ruleOperators[op](d,db)) errors.push({key:op==='tag_disponible'?'numero_tag':'summary',message:rule.getAttribute('mensaje')});
  }
  if(action==='salida' && d.ingreso_id!=='sin_ingreso' && !d.personas_salen?.length && d.vehiculo_sale!=='Sí') errors.push({key:'personas_salen',message:'Selecciona las personas o el vehículo que salen.'});
  return errors;
}
