import {clone,uid,now,destLabel,destinationState,allowedDestinations,furnitureValid} from './model.js';
export const POLICY={version:'demo-1',visita:'completo_operativo',repartidor:'parcial',identificacionImagen:'no_publicar'};
export function policyFromFlow(flow){
 const config=flow.querySelector('Comunicaciones');
 if(!config)return POLICY;
 if(config.getAttribute('modo')!=='simulado')throw Error('Este prototipo solo admite comunicaciones simuladas.');
 const perfiles={};
 for(const node of config.querySelectorAll('Perfil')){
  const profile=node.getAttribute('datos');
  if(!['completo_operativo','parcial'].includes(profile))throw Error('Perfil de publicación no admitido.');
  perfiles[node.getAttribute('tipo_persona')]=profile;
 }
 return {...POLICY,perfiles};
}
const delivery=d=>d.tipo_persona==='Repartidor / paquetería';
export function briefName(name=''){const parts=name.trim().split(/\s+/);return [parts[0],...parts.slice(1).map(s=>s[0]+'.')].join(' ');}
export function briefPlate(plate=''){return plate?plate.slice(0,2)+'•••'+plate.slice(-2):'';}
export function requestFingerprint(d,dest){
 return JSON.stringify({personas:(d.personas||[]).map(p=>p.nombre||'Por identificar'),medio:d.medio_ingreso,placas:d.placas,tipo:d.tipo_persona,asunto:d.asunto,detalle:d.detalle_asunto,muebles:d.movimiento_muebles,vehiculo:d.movimiento_vehiculo,servicio:d.trabajo_servicio,destino:destLabel(dest)});
}
export function requestMessage(d,dest){
 return ['*NEIBORA · Solicitud de autorización · DEMO*','Destino: '+destLabel(dest),'Solicita acceso: '+(d.personas?.[0]?.nombre||'Por identificar'),'Acompañantes: '+((d.personas||[]).slice(1).map(p=>p.nombre||'Por identificar').join(', ')||'Sin acompañantes registrados'),'Tipo: '+(d.tipo_persona||'Por clasificar'),'Asunto: '+(d.asunto||'Por especificar'),d.personas?.[0]?.empresa?'Empresa: '+d.personas[0].empresa:'',d.placas?'Placas: '+d.placas:'Medio: '+(d.medio_ingreso||'Por verificar'),'Responde Autorizar o Denegar para este destino y este movimiento.','La persona aún no tiene una entrada registrada.'].filter(Boolean).join('\n');
}
export function syncRequests(d){
 for(const request of d.solicitudes_whatsapp||[]){
  const dest=d.destinos?.find(x=>x.id===request.destinationId);
  if(!dest || request.fingerprint!==requestFingerprint(d,dest)){
   request.status='Invalidada por cambios';request.invalidated=now();
   d.autorizaciones=(d.autorizaciones||[]).filter(a=>a.solicitud_id!==request.id);
   delete d.alcance_limitado;
  }
 }
}
export function prepareRequests(d,caseId){
 syncRequests(d);
 if(!d.personas?.[0]?.nombre || !d.tipo_persona || !d.asunto)throw Error('Identifica a la persona y completa tipo y asunto antes de solicitar autorización.');
 d.solicitudes_whatsapp ||= [];
 for(const dest of d.destinos||[]){
  const fingerprint=requestFingerprint(d,dest);
  if(d.solicitudes_whatsapp.some(r=>r.destinationId===dest.id&&r.fingerprint===fingerprint&&r.status!=='Invalidada por cambios'))continue;
  if(destinationState(dest,d.autorizaciones)==='Autorizado')continue;
  const id=uid(),caseRef=d.caso_id||caseId;
  d.solicitudes_whatsapp.push({id,requestId:id,caseId:caseRef,idempotencyKey:caseRef+':solicitud:'+id,destinationId:dest.id,coto:dest.coto,fingerprint,status:'Esperando respuesta simulada',created:now(),audience:dest.tipo_destino==='Domicilio'?'domicilio':'administracion_coto',recipientRef:dest.tipo_destino==='Domicilio'?dest.domicilio:dest.coto,text:requestMessage(d,dest),simulation:true});
 }
 return d.solicitudes_whatsapp;
}
export function reply(d,requestId,result){
 if(!['Autorizado','No autorizado','No contesta'].includes(result))throw Error('Resultado no admitido.');
 syncRequests(d);
 const r=d.solicitudes_whatsapp?.find(r=>r.id===requestId);
  if(!r||['Invalidada por cambios','Cancelada'].includes(r.status))throw Error('La solicitud ya no corresponde a los datos actuales.');
 if(!['Esperando respuesta simulada','No contesta'].includes(r.status))throw Error('La solicitud ya tiene una respuesta final.');
 const dest=d.destinos.find(x=>x.id===r.destinationId);
 r.status=result;r.responded=now();
 const admin=dest.tipo_destino!=='Domicilio';
 const a={id:uid(),solicitud_id:r.id,alcance:[dest.id],respaldo:admin?'Administración del coto':'Residente',autoriza_nombre:admin?'Administración Demo · '+dest.coto:'Residente Demo',...(admin?{coto_admin:dest.coto}:{relacion_residente:'Contacto ficticio vinculado a '+destLabel(dest)}),canal:'WhatsApp',verificado:result==='Autorizado'?'Sí':'No',resultado:result,hora:r.responded,simulation:true};
 d.autorizaciones=(d.autorizaciones||[]).filter(a=>a.solicitud_id!==r.id && (a.alcance?.length || a.autoriza_nombre));
 d.autorizaciones.push(a);
 return a;
}
export function cancelRequests(d){
 for(const r of d.solicitudes_whatsapp||[])if(r.status==='Esperando respuesta simulada'){r.status='Cancelada';r.cancelled=now();}
}
export function publication(d,event,policy=POLICY){
 const people=d.operacion==='salida'?d.personas?.filter(p=>d.personas_salen?.includes(p.id))||[{nombre:d.nombre_salida}]:d.personas||[];
 const partial=policy.perfiles?.[d.tipo_persona]?policy.perfiles[d.tipo_persona]==='parcial':delivery(d),names=people.map(p=>partial?briefName(p.nombre):p.nombre).filter(Boolean);
 const destinations=event.action==='entrada'?allowedDestinations(d):d.destinos||[];
 const authorizers=(d.autorizaciones||[]).filter(a=>a.resultado==='Autorizado'&&a.verificado==='Sí').map(a=>a.respaldo);
 const furniture=d.tipo_salida==='Salida de muebles'||d.asunto==='Movimiento de muebles';
 const text=['*NEIBORA · Bitácora de caseta · DEMO*',new Date(event.time).toLocaleString('es-MX',{timeZone:'America/Mexico_City'}),event.action==='hechos'?'*Salida física con incidencia · respaldo pendiente*':event.status,
  (d.operacion==='salida'?'Sale: ':d.operacion==='objetos'?'Objeto: ':d.operacion==='emergencia'&&d.emergencia_activa==='Sí'?'Servicio: ':'Ingresa: ')+(d.operacion==='objetos'?(d.descripcion_objeto||d.objeto_recuperado?.descripcion_objeto||'Objeto recuperado'):names.join(', ')||d.servicio||'Registro de atención'),
  partial?'Perfil: repartidor / paquetería · información parcial':'Perfil: información operativa completa',
  'Destino'+(destinations.length>1?'s':'')+': '+(destinations.map(destLabel).join('; ')||d.ubicacion_aproximada||'No localizado; ver incidencia'),
  'Asunto: '+(d.tipo_salida||d.asunto||d.movimiento_objeto||d.servicio||'Atención'),
  d.personas?.[0]?.empresa?'Empresa: '+d.personas[0].empresa:'',
  d.placas?'Placas: '+(partial?briefPlate(d.placas):d.placas):'',
  'Autoriza: '+(authorizers.length?[...new Set(authorizers)].join(', '):'Respaldo pendiente / no aplica'),
  furniture?'Formato de muebles: '+(furnitureValid(d)?'Verificado para todos los domicilios de origen':'Pendiente; no autoriza el movimiento'):'',
  furniture?'Movimiento: '+(d.documentos||[]).map(f=>f.descripcion).filter(Boolean).join('; '):'',
  d.operacion==='objetos'?'Cantidad: '+(d.cantidad_objeto||d.objeto_recuperado?.cantidad_objeto||'Por verificar'):'',
  d.operacion==='objetos'?'Entrega: '+(d.entrega_nombre||d.objeto_recuperado?.entrega_nombre||'Caseta')+' · Recibe: '+(d.recibe_nombre||'Por verificar'):'',
  d.incidencia_hechos?'Incidencia: '+d.incidencia_hechos:'',
  'Vigilante: '+event.vigilante
 ].filter(Boolean).join('\n');
 return {id:uid(),eventId:event.id,caseId:d.caso_id||event.id,idempotencyKey:event.id+':bitacora:'+policy.version,eventType:'caseta.movimiento.registrado',audience:'grupo_bitacora',recipientRef:'grupo_demo_caseta',policy,profile:partial?'parcial':'completo_operativo',text,simulation:true,media:(d.evidencias_bitacora||[]).filter(x=>x.categoria!=='identificacion').map(x=>clone(x)),suppressedMedia:(d.evidencias_bitacora||[]).filter(x=>x.categoria==='identificacion').length};
}
