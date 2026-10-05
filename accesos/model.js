// Operaciones del prototipo: funciones puras, sin red ni control físico.
export const clone = value => JSON.parse(JSON.stringify(value));
export const now = () => new Date().toISOString();
export const uid = () => globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
export const cotOS = ['Asturias', 'Cantabria', 'Galicia', 'Andalucía'];
export const streets = {Asturias:['Asturias','Oviedo','Avilés'],Galicia:['Asturias','Oviedo','Avilés'],Cantabria:['Cantabria','Santander'],'Andalucía':['Andalucía','Malaga','Córdoba']};
export const houses = Object.fromEntries(cotOS.map(c => [c, streets[c].flatMap((calle,i)=>[12,18,24,36].map(n=>({value:i?c+'-'+calle+'-'+n:c+'-'+n,calle,numero:n,label:calle+' · Casa '+n})))]));
export const streetWork = d => ['Trabajos / mantenimiento / instalación','Limpieza / jardinería','Servicios públicos / telecomunicaciones'].includes(d.asunto);
export function present(v) { return v !== undefined && v !== null && v !== '' && (!Array.isArray(v) || v.length > 0); }
export function condition(actual, expression) {
  // Valores exactos, OR y negación. No se admiten regex, XPath ni JavaScript.
  if (typeof expression !== 'string' || !expression || /[\[\]{}();<>\\=]/.test(expression)) throw Error('Condición inválida: ' + expression);
  const negative = expression.startsWith('!');
  const body = negative ? expression.slice(1) : expression;
  if (!body || body.includes('!') || body.split('|').some(v => !v.trim())) throw Error('Condición inválida: ' + expression);
  if (!present(actual)) return false;
  const values = Array.isArray(actual) ? actual : [String(actual)];
  const matched = body.split('|').some(v => values.includes(v));
  return negative ? !matched : matched;
}
export function derived(d, db) {
  const record = db.entries.find(x => x.id === d.ingreso_id);
  const active = d.operacion === 'emergencia' && d.emergencia_activa === 'Sí';
  const special = d.operacion === 'salida' && present(d.tipo_salida) && d.tipo_salida !== 'Salida normal';
  return {...d,
    ordinario: active ? 'No' : 'Sí',
    necesita_destinos: (['entrada','llamada'].includes(d.operacion) || d.operacion === 'emergencia' && (!active || d.ubicacion_conocida === 'Sí') || d.operacion === 'objetos' && d.movimiento_objeto === 'Recibir en caseta' || special && d.ingreso_id === 'sin_ingreso') ? 'Sí' : 'No',
    necesita_identificacion: (d.operacion === 'entrada' || d.operacion === 'emergencia' && d.emergencia_activa === 'No') ? 'Sí' : 'No',
    necesita_autorizacion: (!active && ['entrada','llamada','emergencia'].includes(d.operacion) || special) ? 'Sí' : 'No',
    requiere_muebles: (d.operacion === 'salida' ? d.tipo_salida === 'Salida de muebles' : ['entrada','llamada'].includes(d.operacion) && d.asunto === 'Movimiento de muebles' && ['Salida','Entrada y salida'].includes(d.movimiento_muebles)) ? 'Sí' : 'No',
    tenia_tag: record && db.tags.some(t => t.entryId === record.id && t.status !== 'Devuelto') ? 'Sí' : 'No',
    vehiculo_dentro: record?.vehicleInside ? 'Sí' : 'No'
  };
}
export function destLabel(x) {
  return [x.coto, x.tipo_destino === 'Domicilio' ? (houses[x.coto]?.find(h => h.value === x.domicilio)?.label || x.domicilio || 'Domicilio') : x.tipo_destino === 'Toda la calle'?x.calle+' · Toda la calle':x.tipo_destino, x.detalle_destino].filter(Boolean).join(' · ');
}
export function destinationKey(x) { return [x.coto, x.tipo_destino, x.tipo_destino === 'Domicilio' ? x.domicilio : x.tipo_destino === 'Toda la calle'?x.calle:(x.detalle_destino || '').trim().toLowerCase()].join('|'); }
export function authorizationValid(a, dest) {
  if (!a.alcance?.includes(dest.id) || a.resultado !== 'Autorizado' || a.verificado !== 'Sí' || !a.autoriza_nombre || !a.canal) return false;
  if (['Todo este coto','Toda la calle'].includes(dest.tipo_destino) && a.respaldo !== 'Administración del coto') return false;
  if (a.respaldo === 'Administración del coto' && a.coto_admin !== dest.coto) return false;
  if (a.respaldo === 'Formato' && !(a.folio || a.documento)) return false;
  if (a.respaldo === 'Residente' && (dest.tipo_destino !== 'Domicilio' || !a.relacion_residente)) return false;
  if (a.respaldo === 'Titular de la vivienda' && (dest.tipo_destino !== 'Domicilio' || !a.relacion_titular || a.relacion_titular === 'Otro' && !a.relacion_otro)) return false;
  return true;
}
export function destinationState(dest, authorizations = []) {
  if (authorizations.some(a => authorizationValid(a, dest))) return 'Autorizado';
  if (authorizations.some(a => a.alcance?.includes(dest.id) && a.resultado === 'No autorizado')) return 'Denegado';
  return 'Pendiente';
}
export function allowedDestinations(d) { return (d.destinos || []).filter(x => destinationState(x, d.autorizaciones) === 'Autorizado'); }
export function furnitureValid(d) {
  const origins = (d.destinos || []).filter(x => x.tipo_destino === 'Domicilio');
  return origins.length > 0 && origins.every(x => (d.documentos || []).some(f => f.alcance?.includes(x.id) && (f.folio || f.documento) && f.autoriza_nombre && f.descripcion && f.verificado === 'Sí'));
}
export const ruleOperators = {
  alcance_calle: d => !(d.destinos||[]).some(x=>x.tipo_destino==='Toda la calle') || streetWork(d),
  direcciones_validas: d => (d.destinos||[]).every(x=>cotOS.includes(x.coto) && (x.tipo_destino==='Domicilio'?houses[x.coto].some(h=>h.value===x.domicilio && (!x.calle||h.calle===x.calle)):x.tipo_destino==='Toda la calle'?streets[x.coto].includes(x.calle):true)),
  destinos_unicos: d => new Set((d.destinos || []).map(destinationKey)).size === (d.destinos || []).length,
  referencias_validas: (d, db) => (d.operacion !== 'salida' || d.ingreso_id === 'sin_ingreso' || db.entries.some(x => x.id === d.ingreso_id && (x.inside?.length || x.vehicleInside))) && (d.operacion !== 'objetos' || d.movimiento_objeto === 'Recibir en caseta' || db.objects.some(x => x.id === d.objeto_id && x.status === 'En resguardo')),
  tag_disponible: (d, db) => d.entrega_tag !== 'Sí' || !!d.numero_tag && !!d.responsable_tag && !db.tags.some(t => t.number === d.numero_tag && t.status !== 'Devuelto'),
  identidad_verificada: d => !!d.personas?.length && d.personas.every(p => p.nombre && p.identificacion && p.identificacion !== 'No presenta' && p.identificacion_verificada === 'Sí' && (d.tipo_persona !== 'Residente' || p.relacion_residente && p.residente_verificado === 'Sí')),
  alcance_autorizado: d => allowedDestinations(d).length > 0 && (allowedDestinations(d).length === (d.destinos || []).length || d.alcance_limitado === true),
  formatos_muebles: (d, db) => derived(d, db).requiere_muebles !== 'Sí' || furnitureValid(d),
  receptor_verificado: d => d.movimiento_objeto === 'Recibir en caseta' || d.receptor_verificado === 'Sí'
};
export function invalidateDestination(d, id) {
  for (const list of ['autorizaciones','documentos']) for (const a of d[list] || []) {
    if (a.alcance?.includes(id)) { a.alcance = a.alcance.filter(v => v !== id); if(!a.alcance.length){delete a.verificado; delete a.resultado;} }
  }
  delete d.alcance_limitado;
}
export function recoverEntry(d, db, id) {
  for (const k of ['destinos','personas','documentos','autorizaciones','placas','medio_ingreso','descripcion_vehiculo','asunto','tipo_persona']) delete d[k];
  const record = db.entries.find(x => x.id === id);
  if (record) for (const k of ['destinos','personas','documentos','autorizaciones','placas','medio_ingreso','descripcion_vehiculo','asunto','tipo_persona']) if (record.data[k] !== undefined) d[k] = clone(record.data[k]);
}
export function recoverObject(d, db, id) {
  const o = db.objects.find(x => x.id === id);
  if (o) { d.objeto_recuperado=clone(o.data);d.destinos=clone(o.data.destinos); }
}
export function newDatabase() {
  const destination = {id:'demo-d1', coto:'Asturias',tipo_destino:'Domicilio',domicilio:'Asturias-12'};
  const data = {operacion:'entrada',tipo_persona:'Visita',asunto:'Visita personal',destinos:[destination],personas:[{id:'demo-p1',nombre:'Alex Ejemplo',identificacion:'INE',identificacion_verificada:'Sí'},{id:'demo-p2',nombre:'Sam Demostración',identificacion:'INE',identificacion_verificada:'Sí'}],medio_ingreso:'Automóvil',tiene_placas:'Sí',placas:'DEMO-001',descripcion_vehiculo:'Sedán azul ficticio',autorizaciones:[{id:'demo-a1',alcance:['demo-d1'],respaldo:'Residente',autoriza_nombre:'Residente Ejemplo',relacion_residente:'Ocupante de Casa 12',canal:'Presencial',verificado:'Sí',resultado:'Autorizado',hora:'2026-10-04T14:00:00Z'}],entrega_tag:'Sí',numero_tag:'T-01',responsable_tag:'demo-p1'};
  return {version:2,entries:[{id:'demo-entry',data,status:'Entrada registrada',inside:['demo-p1','demo-p2'],vehicleInside:true,allowed:['demo-d1'],created:'2026-10-04T14:00:00Z',vigilante:'Vigilante Demo'}],objects:[{id:'demo-object',status:'En resguardo',data:{tipo_objeto:'Paquete',descripcion_objeto:'Caja de libros de demostración',cantidad_objeto:1,referencia_objeto:'GUIA-DEMO-01',entrega_nombre:'Mensajero Demo',recibe_nombre:'Vigilante Demo',destinos:[clone(destination)]},created:'2026-10-04T15:00:00Z'}],tags:[{id:'demo-tag',entryId:'demo-entry',number:'T-01',responsible:'demo-p1',status:'Prestado'}],events:[],drafts:[],commits:{}};
}
export function commit(db, d, action, token) {
  if (db.commits[token]) return db.commits[token];
  const linkedCall=db.drafts.find(x=>x.id===d.llamada_id);
  if(action==='entrada' && linkedCall?.linkedEntryId)throw Error('Esta llamada ya se vinculó a un ingreso. Inicia una nueva verificación.');
  const time = now(), id = uid();
  let status;
  if (action === 'pendiente' || action === 'denegacion' || action === 'llamada') {
    status = action === 'denegacion' ? 'Denegado' : action === 'llamada' && allowedDestinations(d).length ? 'Autorizado' : 'Pendiente de autorización';
    db.drafts.push({id,data:clone(d),status,created:time,vigilante:'Vigilante Demo',kind:action});
  } else if (action === 'entrada') {
    if (!ruleOperators.tag_disponible(d,db)) throw Error('Tag ya prestado');
    status = 'Entrada registrada';
    const entry = {id,data:clone(d),status,inside:d.personas.map(p=>p.id),vehicleInside:['Moto','Automóvil','Vehículo de carga'].includes(d.medio_ingreso),allowed:allowedDestinations(d).map(x=>x.id),destinationStates:(d.destinos||[]).map(x=>({id:x.id,status:destinationState(x,d.autorizaciones),permitted:destinationState(x,d.autorizaciones)==='Autorizado'})),created:time,vigilante:'Vigilante Demo'};
    db.entries.push(entry);
    if(linkedCall){linkedCall.linkedEntryId=id;linkedCall.status='Entrada registrada';linkedCall.updated=time;}
    if (d.entrega_tag === 'Sí') db.tags.push({id:uid(),entryId:id,number:d.numero_tag,responsible:d.responsable_tag,status:'Prestado',kind:'Préstamo temporal',created:time});
  } else if (action === 'salida' || action === 'hechos') {
    const entry = db.entries.find(x=>x.id===d.ingreso_id);
    if (entry) {
      const outgoing = d.personas_salen || [];
      if (outgoing.some(x=>!entry.inside.includes(x))) throw Error('Una persona seleccionada ya salió');
      entry.inside = entry.inside.filter(x=>!outgoing.includes(x));
      if(d.vehiculo_sale==='Sí') entry.vehicleInside=false;
      entry.status = entry.inside.length || entry.vehicleInside ? 'Salida parcial' : 'Salida registrada';
      entry.updated=time;
      status=entry.status;
      for (const t of db.tags.filter(t=>t.entryId===entry.id && t.status!=='Devuelto')) {
        t.status=d.devolvio_tag==='Sí'?'Devuelto':entry.inside.length?'Prestado':'Por recuperar';t.updated=time;
      }
    } else status='Salida registrada';
    // Hechos físicos no autorizan el movimiento especial.
    if(action==='hechos') db.drafts.push({id:uid(),data:clone(d),status:'Pendiente de autorización',created:time,kind:'incidencia_hechos'});
  } else if (action === 'objeto') {
    status = d.movimiento_objeto==='Recibir en caseta'?'En resguardo':d.movimiento_objeto==='Devolución'?'Devuelto':'Entregado';
    if(status==='En resguardo') db.objects.push({id,data:clone(d),status,created:time});
    else {
      const object=db.objects.find(x=>x.id===d.objeto_id && x.status==='En resguardo');
      if(!object) throw Error('Objeto ya entregado o inexistente');
      object.status=status;object.receiver=d.recibe_nombre;object.updated=time;object.receptor_verificado=d.receptor_verificado;
    }
  } else if(action==='emergencia') {
    status='Atención registrada';
    if(d.atencion_id) {
      const attention=db.events.find(e=>e.id===d.atencion_id && e.action==='emergencia');
      if(!attention)throw Error('Atención original no localizada');
      attention.data=clone(d);attention.updated=time;
      action='emergencia_actualizacion';
    }
  }
  else throw Error('Acción desconocida');
  const result={id,status,action,time,data:clone(d),vigilante:'Vigilante Demo',authorizationState:action==='hechos'?'Pendiente de autorización':undefined,authorizations:(d.autorizaciones||[]).map(a=>({person:{name:a.autoriza_nombre,role:a.respaldo==='Formato'?'Emisor / firmante':a.respaldo,relationship:a.relacion_residente||a.relacion_titular},evidence:a.respaldo==='Formato'?{folio:a.folio,file:a.documento}:null,scope:a.alcance,channel:a.canal,result:a.resultado,verified:a.verificado==='Sí',time:a.hora}))};
  db.events.push(result); db.commits[token]=result;
  return result;
}

