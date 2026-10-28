'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const fail = (message, status = 400) => Object.assign(new Error(message), {status});
const local = address => ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(address);
const phases = ['registro', 'votacion', 'resultados'];
const ALLOWED_ORIGINS = new Set(['https://neibora.com','https://www.neibora.com','https://neibora.panax.io','https://api.neibora.com']);
const COTOS = new Set(['Asturias','Cantabria','Galicia','Andalucía']);
const DEFAULT_ID = '15cceb26-b380-4b50-9d1f-0893c9e7cb13';
const validId = id => /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id);
function jpeg(value) {
 if (typeof value !== 'string' || !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(value)) throw fail('Selecciona una fotografía válida.');
 const bytes = Buffer.from(value.split(',')[1], 'base64');
 if (bytes.length > 350000 || bytes.length < 100 || bytes[0] !== 255 || bytes[1] !== 216 || bytes.at(-2) !== 255 || bytes.at(-1) !== 217) throw fail('La fotografía debe ser JPEG de hasta 350 KB.');
 // Validate dimensions from the JPEG frame, rather than trusting the file extension.
 let offset = 2, dimensions;
 while (offset + 4 < bytes.length) {
  if (bytes[offset++] !== 255) break;
  while (bytes[offset] === 255) offset++;
  const marker = bytes[offset++];
  if (marker === 218 || marker === 217) break;
  const length = bytes.readUInt16BE(offset);
  if (length < 2 || offset + length > bytes.length) break;
  if ([192,193,194].includes(marker) && length >= 8) {dimensions = [bytes.readUInt16BE(offset+3), bytes.readUInt16BE(offset+5)]; break;}
  offset += length;
 }
 if (!dimensions || dimensions.some(n => n < 32 || n > 1200)) throw fail('La fotografía debe medir entre 32 y 1200 píxeles por lado.');
 return bytes.toString('base64');
}
function createContest({root,id=DEFAULT_ID}) {
 if(!validId(id))throw fail('Identificador de concurso inválido.');
 const directory = path.join(root, 'repository', 'concursos', id);
 const privateDirectory = path.join(root, 'App_Data', 'concurso');
 const keyFile = path.join(privateDirectory,id+'.key');
 const file = path.join(directory, 'concurso.json');
 let queue = Promise.resolve();
 const ready = (async () => {
  await fs.mkdir(directory, {recursive:true});
  await fs.mkdir(privateDirectory, {recursive:true});
  try {await fs.writeFile(keyFile, crypto.randomBytes(32).toString('hex'), {flag:'wx',mode:0o600});} catch (e) {if(e.code !== 'EEXIST') throw e;}
  const key = (await fs.readFile(keyFile, 'utf8')).trim();
  let state;
  try {state = JSON.parse(await fs.readFile(file,'utf8'));} catch(e) {if(e.code !== 'ENOENT') throw e; state = {id,version:0, phase:'registro', participants:[], votes:{}, actions:[]};}
  return {key, state};
 })();
 async function read() {return (await ready).state;}
 function mutate(operation) {
  const pending = queue.then(async () => {
   const store = await ready, draft = structuredClone(store.state), result = operation(draft);
   draft.version++;
   const temporary = file+'.'+crypto.randomUUID()+'.tmp';
   try {await fs.writeFile(temporary, JSON.stringify(draft), {mode:0o600}); await fs.rename(temporary,file);} finally {await fs.unlink(temporary).catch(()=>{});}
   store.state = draft;
   return result;
  });
  queue = pending.catch(()=>{}); return pending;
 }
 async function isAdmin(key) {const saved = (await ready).key; return typeof key === 'string' && /^[a-f0-9]{64}$/.test(key) && crypto.timingSafeEqual(Buffer.from(saved),Buffer.from(key));}
 function identity(value) {if(typeof value !== 'string' || !/^[a-f0-9]{64}$/.test(value)) throw fail('Tu sesión no es válida. Recarga la página.'); return digest(value);}
 async function snapshot(voter, admin=false) {
  const state = await read(), hash = voter && /^[a-f0-9]{64}$/.test(voter) ? digest(voter) : '';
  const counts = {};
  if (state.phase === 'resultados' || admin) Object.values(state.votes).forEach(id => counts[id] = (counts[id]||0)+1);
  const active=new Set(state.participants.filter(p=>!p.removed).map(p=>p.id));
  const choice=state.votes[hash],vote=active.has(choice)?choice:null;
  const activeVotes=Object.values(state.votes).filter(candidate=>active.has(candidate)).length;
  return {id,version:state.version,phase:state.phase,voted:!!vote,vote,voteWithdrawn:!!choice&&!vote,totalVotes:state.phase==='resultados'||admin?activeVotes:undefined,...(admin?{retiredVotes:Object.keys(state.votes).length-activeVotes}:{}),participants:state.participants.filter(p=>admin||!p.removed).map(({id,number,name,costume,coto,domicilio,removed,photo})=>({id,number,name,costume,coto:coto||'',...(admin?{domicilio:domicilio||'',removed:!!removed,canRestore:!!removed&&!!photo}:{}),...(state.phase==='resultados'||admin?{votes:counts[id]||0}:{})}))};
 }
 async function register(input) {
  const owner = identity(input.voter);
  const clean = (value,label,max=60) => {if(typeof value!=='string'||!value.trim()||value.trim().length>max||/[\x00-\x1f]/.test(value))throw fail('Revisa '+label+'.');return value.trim();};
  const name = clean(input.name,'el nombre o apodo'), costume = clean(input.costume,'el disfraz');
  if(!input.coto||!input.domicilio)throw fail('Indica tu coto y domicilio. Si no ves esos campos, actualiza la página.');
  if(!COTOS.has(input.coto))throw fail('Selecciona un coto válido de La Cantera.');
  const coto=input.coto,domicilio=clean(input.domicilio,'el domicilio',140);
  if(input.consent !== true) throw fail('Confirma la autorización para compartir la fotografía.');
  if(typeof input.requestId!=='string'||!/^[a-f0-9-]{36}$/.test(input.requestId))throw fail('Identificador de registro inválido.');
  const photo = jpeg(input.photo);
  return mutate(state => {
   const prior = state.participants.find(p=>p.requestId===input.requestId && p.owner===owner);
   if(prior)return {id:prior.id,number:prior.number};
   if(state.phase!=='registro')throw fail('Las inscripciones ya están cerradas.',409);
   if(state.participants.length>=200 || state.participants.filter(p=>p.owner===owner).length>=10)throw fail('Se alcanzó el límite de registros. Consulta a administración.',409);
   const participant = {id:crypto.randomUUID(),number:state.participants.length+1,name,costume,coto,domicilio,photo,owner,requestId:input.requestId,consentAt:new Date().toISOString()};
   state.participants.push(participant);return {id:participant.id,number:participant.number};
  });
 }
 async function vote(input) {
  const owner = identity(input.voter);
  return mutate(state => {
   const previous=state.votes[owner];
   if(previous&&state.participants.some(p=>p.id===previous&&!p.removed)) {if(previous===input.id)return {ok:true};throw fail('Ya votaste desde este navegador.',409);}
   if(state.phase!=='votacion')throw fail('La votación no está abierta.',409);
   if(!state.participants.some(p=>p.id===input.id&&!p.removed))throw fail('El participante no está disponible.');
   state.votes[owner]=input.id;return {ok:true};
  });
 }
 async function administer(input,key) {
  if(!await isAdmin(key))throw fail('Clave de administración incorrecta.',401);
  return mutate(state => {
   if(input.action==='phase') {
    if(!phases.includes(input.phase))throw fail('Etapa inválida.');
    if(input.from!==undefined&&input.from!==state.phase)throw fail('La etapa cambió en otra sesión. Actualiza antes de continuar.',409);
    const current = phases.indexOf(state.phase), next = phases.indexOf(input.phase);
    if(Math.abs(next-current)>1)throw fail('Cambia las etapas de una en una, en orden.',409);
    if(input.phase==='votacion'&&next>current&&!state.participants.some(p=>!p.removed))throw fail('Primero inscribe un concursante.',409);
    state.phase=input.phase;
   } else if(input.action==='remove') {
    const participant=state.participants.find(p=>p.id===input.id);
    if(!participant)throw fail('Participante no encontrado.',404);
    participant.removed=true;
   } else if(input.action==='restore') {
    const participant=state.participants.find(p=>p.id===input.id);
    if(!participant)throw fail('Participante no encontrado.',404);
    if(!participant.photo)throw fail('Este registro antiguo ya no conserva su foto. Inscríbelo de nuevo durante el registro.',409);
    participant.removed=false;
   } else throw fail('Acción inválida.');
   state.actions.push({action:input.action,phase:state.phase,id:input.id||null,at:new Date().toISOString()});
   return {ok:true};
  });
 }
 return {snapshot,register,vote,administer,isAdmin,read,ready};
}
function registerContest({router,root}) {
 const contest=createContest({root}), buckets=new Map(),contests=new Map([[DEFAULT_ID,contest]]);
 async function getContest(id=DEFAULT_ID){
  if(!validId(id))throw fail('Identificador de concurso inválido.');
  if(contests.has(id))return contests.get(id);
  try{await fs.access(path.join(root,'repository','concursos',id,'concurso.json'));}catch{throw fail('El concurso no existe.',404);}
  const selected=createContest({root,id});contests.set(id,selected);return selected;
 }
 const route=async(req,res)=>{
  res.set('Cache-Control','no-store').set('X-Content-Type-Options','nosniff');
  try {
   if(!local(req.socket.remoteAddress))throw fail('Usa el acceso HTTPS del sitio.',403);
   const origin=req.headers.origin;
   res.set('Vary','Origin');
   if(origin&&!ALLOWED_ORIGINS.has(origin)||req.method==='POST'&&!ALLOWED_ORIGINS.has(origin))throw fail('Origen no permitido.',403);
   if(origin)res.set('Access-Control-Allow-Origin',origin);
   if(req.method==='OPTIONS'){
    if(!ALLOWED_ORIGINS.has(origin))throw fail('Origen no permitido.',403);
    const headers=String(req.headers['access-control-request-headers']||'').toLowerCase().split(',').map(value=>value.trim()).filter(Boolean);
    if(!['GET','POST'].includes(req.headers['access-control-request-method'])||headers.some(value=>!['content-type','x-contest-voter','x-contest-admin'].includes(value)))throw fail('Solicitud no permitida.',403);
    return res.set('Access-Control-Allow-Methods','GET, POST, OPTIONS').set('Access-Control-Allow-Headers','Content-Type, X-Contest-Voter, X-Contest-Admin').status(204).send('');
   }
   const contest=await getContest(req.query.concurso||DEFAULT_ID);
   const action=String(req.query.action||'state'), voter=String(req.headers['x-contest-voter']||''), key=String(req.headers['x-contest-admin']||'');
   if(key&&!await contest.isAdmin(key))throw fail('Clave de administración incorrecta.',401);
   if(req.method==='GET'&&action==='photo') {
    const participant=(await contest.read()).participants.find(p=>p.id===req.query.id&&!p.removed);
    if(!participant)throw fail('Fotografía no disponible.',404);
    return res.type('image/jpeg').send(Buffer.from(participant.photo,'base64'));
   }
   if(req.method==='GET'&&action==='state')return res.json(await contest.snapshot(voter,await contest.isAdmin(key)));
   if(req.method!=='POST')throw fail('Método no permitido.',405);
   const address=String(req.headers['cf-connecting-ip']||req.headers['x-contest-client']||req.socket.remoteAddress), now=Date.now(), bucket=buckets.get(address);
   if(!bucket||now-bucket.start>60000)buckets.set(address,{start:now,count:1});else if(++bucket.count>300)throw fail('Demasiadas solicitudes. Espera un minuto.',429);
   if(buckets.size>2000)for(const [address,bucket]of buckets)if(now-bucket.start>60000)buckets.delete(address);
   let input=req.body;
   if(!input) {let size=0,chunks=[];for await(const chunk of req){size+=chunk.length;if(size>500000)throw fail('La imagen es demasiado grande.',413);chunks.push(chunk);}try{input=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw fail('Solicitud inválida.');}}
   if(!input||typeof input!=='object'||Array.isArray(input))throw fail('Solicitud inválida.');
   input.voter=voter;
   if(action==='register')return res.json(await contest.register(input));
   if(action==='vote')return res.json(await contest.vote(input));
   if(action==='admin')return res.json(await contest.administer(input,key));
   throw fail('Acción no disponible.',404);
  } catch(e) {res.status(e.status||500).json({ok:false,message:e.status?e.message:'No se pudo guardar. Conserva tus datos e inténtalo de nuevo.'});}
 };
 router.get('/contest-api',route);router.post('/contest-api',route);router.options?.('/contest-api',route);
 return contest;
}
module.exports={createContest,registerContest,jpeg,DEFAULT_ID};
