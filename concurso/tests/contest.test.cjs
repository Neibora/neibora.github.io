const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const {createContest,jpeg,registerContest}=require('../server.cjs');
const {DEFAULT_ID}=require('../server.cjs');
const token=()=>crypto.randomBytes(32).toString('hex');
async function cast(contest,input){return contest.vote(input);}
async function setup(t){const root=await fs.mkdtemp(path.join(__dirname,'runtime-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));const contest=createContest({root});const {key}=await contest.ready;const photo='data:image/jpeg;base64,'+(await fs.readFile(path.join(__dirname,'costume.jpg'))).toString('base64');const entry=(extra={})=>({voter:token(),requestId:crypto.randomUUID(),name:'Luna',costume:'Brujita',consent:true,coto:'Cantabria',domicilio:'Calle de prueba 1',photo,...extra});return {root,contest,key,entry};}
test('registration publishes gallery, strips internal fields, retries once and survives restart',async t=>{const {root,contest,entry}=await setup(t);const input=entry(),result=await contest.register(input);assert.equal(result.number,1);assert.deepEqual(await contest.register(input),result);const state=await contest.snapshot();assert.equal(state.participants.length,1);assert.deepEqual(Object.keys(state.participants[0]).sort(),['costume','coto','homePending','id','name','number','ownHouse']);assert.equal(state.totalVotes,undefined);assert.equal((await createContest({root}).snapshot()).participants.length,1);});
test('simultaneous registrations get unique numbers and votes are counted once',async t=>{const {contest,entry,key}=await setup(t);await Promise.all(Array.from({length:12},()=>contest.register(entry())));let snapshot=await contest.snapshot();assert.equal(new Set(snapshot.participants.map(p=>p.number)).size,12);await contest.administer({action:'phase',phase:'votacion'},key);const voter=token(),id=snapshot.participants[0].id;await Promise.all(Array.from({length:15},()=>cast(contest,{voter,id})));snapshot=await contest.snapshot(voter,true);assert.equal(snapshot.totalVotes,1);assert.equal(snapshot.voted,true);await assert.rejects(cast(contest,{voter,id:snapshot.participants[1].id}),/Ya votaste/);});
test('phase transitions, authorizations, registrations and vote visibility enforced server-side',async t=>{const {contest,entry,key}=await setup(t);await assert.rejects(contest.administer({action:'phase',phase:'votacion'},key),/Primero/);const {id}=await contest.register(entry());await assert.rejects(cast(contest,{voter:token(),id}),/no está abierta/);await assert.rejects(contest.administer({action:'phase',phase:'votacion'},token()),/incorrecta/);await contest.administer({action:'phase',phase:'votacion'},key);await assert.rejects(contest.register(entry()),/cerradas/);await contest.administer({action:'remove',id},key);assert.equal((await contest.snapshot()).participants.length,0);await contest.administer({action:'restore',id},key);const voter=token();await cast(contest,{voter,id});let state=await contest.snapshot(voter);assert.equal(state.voted,true);assert.equal(state.participants[0].votes,undefined);assert.equal(state.totalVotes,undefined);await contest.administer({action:'phase',phase:'resultados'},key);state=await contest.snapshot();assert.equal(state.participants[0].votes,1);assert.equal(state.totalVotes,1);await assert.rejects(cast(contest,{voter:token(),id}),/no está abierta/);await assert.rejects(contest.administer({action:'phase',phase:'registro'},key),/etapas/);});
test('invalid entries and photo formats rejected; retiring a trial entry preserves photo for restoration',async t=>{const {contest,entry,key}=await setup(t);await assert.rejects(contest.register(entry({consent:false})),/autorización/);await assert.rejects(contest.register(entry({photo:'data:image/svg+xml;base64,PHN2Zz4='})),/fotografía/);await assert.rejects(contest.register(entry({voter:'invalid'})),/sesión/);await assert.rejects(contest.register(entry({name:' '})),/nombre/);assert.throws(()=>jpeg('data:image/jpeg;base64,'+Buffer.alloc(1000).toString('base64')),/JPEG/);const {id}=await contest.register(entry());await contest.administer({action:'remove',id},key);assert.equal((await contest.snapshot()).participants.length,0);assert.notEqual((await contest.read()).participants[0].photo,'');await contest.administer({action:'restore',id},key);assert.equal((await contest.snapshot()).participants.length,1);});
test('concurrent phase closure cannot accept late registrations',async t=>{const {contest,entry,key}=await setup(t);await contest.register(entry());const outcomes=await Promise.allSettled([contest.administer({action:'phase',phase:'votacion'},key),...Array.from({length:10},()=>contest.register(entry()))]);const state=await contest.snapshot();assert.equal(state.phase,'votacion');assert.equal(state.participants.length,1+outcomes.slice(1).filter(r=>r.status==='fulfilled').length);await assert.rejects(contest.register(entry()),/cerradas/);});
test('gateway routes reject non-loopback access and do not reveal administration',async t=>{const {root}=await setup(t),routes=new Map(),contest=registerContest({root,router:{get:(url,handler)=>routes.set('GET '+url,handler),post:(url,handler)=>routes.set('POST '+url,handler)}});await contest.ready;let status=200,result;const res={set(){return this},status(code){status=code;return this},json(value){result=value;return this}};await routes.get('GET /contest-api')({socket:{remoteAddress:'10.0.0.12'},query:{},headers:{}},res);assert.equal(status,403);status=200;await routes.get('GET /contest-api')({method:'GET',socket:{remoteAddress:'127.0.0.1'},query:{},headers:{}},res);assert.equal(status,200);assert.equal(result.totalVotes,undefined);assert.equal(JSON.stringify(result).includes('key'),false);});
test('all four cotos accepted; domicile is private during registration, voting and results',async t=>{
 const {contest,entry,key}=await setup(t);
 for(const coto of ['Asturias','Cantabria','Galicia','Andalucía'])await contest.register(entry({coto}));
 await assert.rejects(contest.register(entry({coto:'Otro'})),/coto válido/);
 await assert.rejects(contest.register(entry({domicilio:''})),/actualiza la página/);
 await assert.rejects(contest.register(entry({domicilio:'x'.repeat(141)})),/domicilio/);
 for(const phase of ['registro','votacion','resultados']){
  if(phase!=='registro')await contest.administer({action:'phase',phase},key);
  const publicState=await contest.snapshot();assert.equal(publicState.participants.length,4);
  assert.equal(publicState.participants.every(p=>!Object.hasOwn(p,'domicilio')),true);
  assert.equal(JSON.stringify(publicState).includes('Calle de prueba'),false);
  const adminState=await contest.snapshot(undefined,true);assert.equal(adminState.participants.every(p=>p.domicilio==='Calle de prueba 1'),true);
 }
});
test('legacy participants survive restart without inventing a coto or domicile',async t=>{
 const {contest,entry,root}=await setup(t);await contest.register(entry());
 const legacy=structuredClone(await contest.read());delete legacy.participants[0].coto;delete legacy.participants[0].domicilio;
 await fs.writeFile(path.join(root,'repository','concursos',DEFAULT_ID,'concurso.json'),JSON.stringify(legacy));
 const loaded=createContest({root});assert.equal((await loaded.snapshot()).participants[0].coto,'');assert.equal((await loaded.snapshot(undefined,true)).participants[0].domicilio,'');
});
test('administration reverses stages one step at a time and keeps participants and ballots',async t=>{
 const {contest,entry,key}=await setup(t),{id}=await contest.register(entry()),voter=token();
 await contest.administer({action:'phase',phase:'votacion'},key);await cast(contest,{voter,id});await contest.administer({action:'phase',phase:'resultados'},key);
 await assert.rejects(contest.administer({action:'phase',phase:'registro'},key),/una en una/);
 await assert.rejects(contest.administer({action:'phase',from:'registro',phase:'votacion'},key),/otra sesión/);
 await contest.administer({action:'phase',from:'resultados',phase:'votacion'},key);
 let state=await contest.snapshot(voter,true);assert.equal(state.totalVotes,1);assert.equal(state.voted,true);assert.equal(state.participants.length,1);
 await contest.administer({action:'phase',from:'votacion',phase:'registro'},key);
 await contest.register(entry());state=await contest.snapshot(voter,true);assert.equal(state.phase,'registro');assert.equal(state.totalVotes,1);assert.equal(state.participants.length,2);
 await assert.rejects(contest.administer({action:'phase',phase:'resultados'},key),/una en una/);
});
test('retiring and restoring in results preserves votes and keeps photos out of the public gallery',async t=>{
 const {contest,entry,key}=await setup(t),{id}=await contest.register(entry()),voter=token();
 await contest.administer({action:'phase',phase:'votacion'},key);await cast(contest,{voter,id});await contest.administer({action:'phase',phase:'resultados'},key);
 await assert.rejects(contest.administer({action:'remove',id},token()),/incorrecta/);
 await contest.administer({action:'remove',id},key);
 const publicState=await contest.snapshot(voter),privateState=await contest.snapshot(undefined,true);
 assert.equal(publicState.participants.length,0);assert.equal(publicState.totalVotes,0);assert.equal(publicState.voteWithdrawn,true);
 assert.equal(privateState.participants[0].removed,true);assert.equal(privateState.participants[0].canRestore,true);assert.equal(privateState.participants[0].votes,1);assert.equal(privateState.retiredVotes,1);
 await assert.rejects(contest.administer({action:'restore',id},token()),/incorrecta/);
 await contest.administer({action:'restore',id},key);
 const restored=await contest.snapshot(voter);assert.equal(restored.participants.length,1);assert.equal(restored.totalVotes,1);assert.equal(restored.vote,id);
 await contest.administer({action:'remove',id},key);await contest.administer({action:'phase',phase:'votacion'},key);await contest.administer({action:'phase',phase:'registro'},key);assert.equal((await contest.snapshot()).phase,'registro');
});
test('a withdrawn choice can be replaced without adding a second vote when restored',async t=>{
 const {contest,entry,key}=await setup(t),first=await contest.register(entry()),second=await contest.register(entry()),voter=token();
 await contest.administer({action:'phase',phase:'votacion'},key);await cast(contest,{voter,id:first.id});await contest.administer({action:'remove',id:first.id},key);
 assert.equal((await contest.snapshot(voter)).voted,false);
 await cast(contest,{voter,id:second.id});await contest.administer({action:'restore',id:first.id},key);
 const state=await contest.snapshot(voter,true);assert.equal(state.totalVotes,1);assert.equal(state.vote,second.id);assert.equal(state.participants.find(p=>p.id===first.id).votes,0);assert.equal(state.participants.find(p=>p.id===second.id).votes,1);
});
test('persistent uploader ID blocks self-voting without registering voters',async t=>{
 const {contest,entry,key,root}=await setup(t),uploader=token(),guest=token(),candidate=await contest.register(entry({voter:uploader}));
 await contest.administer({action:'phase',phase:'votacion'},key);
 assert.equal((await contest.snapshot(uploader)).participants[0].ownHouse,true);
 assert.equal((await contest.snapshot(guest)).participants[0].ownHouse,false);
 await assert.rejects(contest.vote({voter:uploader,id:candidate.id}),/mismo navegador/);
 await contest.vote({voter:guest,id:candidate.id});
 const reloaded=createContest({root});assert.equal((await reloaded.snapshot(uploader)).participants[0].ownHouse,true);assert.equal((await reloaded.snapshot(guest)).voted,true);
 assert.equal((await contest.read()).voters,undefined);
});
test('anonymous ballot audit uses a stable browser ID and keeps old personal details private',async t=>{
 const {contest,entry,key}=await setup(t),candidate=await contest.register(entry()),guest=token();
 await contest.administer({action:'phase',phase:'votacion'},key);await contest.vote({voter:guest,id:candidate.id});
 const receipt=await contest.snapshot(guest),stranger=await contest.snapshot(token());assert.match(receipt.voterId,/^NAV-[a-f0-9]{12}$/);assert.equal(receipt.ballots,undefined);assert.equal(stranger.ballots,undefined);
 const audit=(await contest.snapshot(undefined,true)).ballots;assert.equal(audit[0].browserId,receipt.voterId);assert.equal(audit[0].voterName,null);assert.equal(audit[0].candidateId,candidate.id);assert.ok(audit[0].votedAt);
 const legacyOwner=crypto.createHash('sha256').update(token()).digest('hex'),state=await contest.read();state.votes[legacyOwner]=candidate.id;state.voteDetails[legacyOwner]={name:'Votante anterior',coto:'Asturias',domicilio:'Dirección privada anterior',participantId:candidate.id};
 const legacy=(await contest.snapshot(undefined,true)).ballots.find(ballot=>ballot.identified);assert.equal(legacy.voterName,'Votante anterior');assert.equal(legacy.domicilio,'Dirección privada anterior');assert.equal(JSON.stringify(await contest.snapshot(token())).includes('Dirección privada anterior'),false);
});
test('legacy uploads without domicile still use the uploader ID to block self-votes',async t=>{
 const {contest,entry,key}=await setup(t),uploader=token(),candidate=await contest.register(entry({voter:uploader})),guest=token();
 delete (await contest.read()).participants[0].domicilio;
 await contest.administer({action:'phase',phase:'votacion'},key);
 await assert.rejects(contest.vote({voter:uploader,id:candidate.id}),/mismo navegador/);
 await contest.vote({voter:guest,id:candidate.id});assert.equal((await contest.snapshot(guest)).voted,true);
 await assert.rejects(contest.administer({action:'updateHome',id:candidate.id,coto:'Cantabria',domicilio:'Casa 12'},token()),/incorrecta/);
 await contest.administer({action:'updateHome',id:candidate.id,coto:'Cantabria',domicilio:'Casa 12'},key);
 assert.equal((await contest.snapshot(uploader)).participants[0].ownHouse,true);
});
