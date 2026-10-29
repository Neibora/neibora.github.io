// Explicit integration check against a disposable contest in the local Neibora platform.
// Does not write participants or votes to the real Halloween contest.
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
async function main(){
 const root=process.env.NEIBORA_CONTEST_ROOT;if(!root)throw Error('Specify NEIBORA_CONTEST_ROOT explicitly.');
 const base=new URL(process.env.NEIBORA_CONTEST_API||'https://api.neibora.com/contest-api'),id=crypto.randomUUID(),directory=path.resolve(root,'repository','concursos',id),privateKey=path.resolve(root,'App_Data','concurso',id+'.key');
 if(path.basename(directory)!==id||!directory.startsWith(path.resolve(root,'repository','concursos')+path.sep))throw Error('Unsafe test directory.');
 await fs.mkdir(directory);await fs.writeFile(path.join(directory,'concurso.json'),JSON.stringify({id,version:0,phase:'registro',participants:[],votes:{},actions:[]}));
 const voter=crypto.randomBytes(32).toString('hex'),other=crypto.randomBytes(32).toString('hex');
 async function request(action,body,adminKey='',session=voter){const url=new URL(base);url.searchParams.set('concurso',id);url.searchParams.set('action',action);const response=await fetch(url,{method:body?'POST':'GET',headers:{Origin:'https://neibora.com','Content-Type':'application/json','X-Contest-Voter':session,...(adminKey?{'X-Contest-Admin':adminKey}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(15000)});return {status:response.status,result:await response.json()};}
 try{
  assert.equal((await request('state')).status,200);const key=(await fs.readFile(privateKey,'utf8')).trim();
  const photo='data:image/jpeg;base64,'+(await fs.readFile(path.join(__dirname,'costume.jpg'))).toString('base64'),input={requestId:crypto.randomUUID(),name:'Prueba técnica',costume:'Foto de prueba',consent:true,coto:'Galicia',domicilio:'Calle de prueba 1',photo};
  const first=await request('register',input);assert.equal(first.status,200,JSON.stringify(first));assert.equal((await request('register',input)).result.id,first.result.id);
  const spectator=await request('state',undefined,'',other);assert.equal(spectator.result.participants.length,1);assert.equal(spectator.result.participants[0].name,'Prueba técnica');assert.equal(spectator.result.participants[0].votes,undefined);assert.equal(spectator.result.participants[0].coto,'Galicia');assert.equal(spectator.result.participants[0].domicilio,undefined);const privateView=await request('state',undefined,key);assert.equal(privateView.result.participants[0].domicilio,'Calle de prueba 1');
  const photoURL=new URL(base);photoURL.searchParams.set('action','photo');photoURL.searchParams.set('concurso',id);photoURL.searchParams.set('id',first.result.id);const image=await fetch(photoURL);assert.equal(image.status,200);assert.equal(image.headers.get('content-type').split(';')[0],'image/jpeg');assert.equal((await image.arrayBuffer()).byteLength,Buffer.from(photo.split(',')[1],'base64').length);
  assert.equal((await request('admin',{action:'phase',phase:'votacion'},key)).status,200);
  assert.equal((await request('register',{...input,requestId:crypto.randomUUID()})).status,409);
  assert.equal((await request('state')).result.participants[0].ownHouse,true);
  assert.equal((await request('vote',{id:first.result.id})).status,403);
  assert.equal((await request('vote',{id:first.result.id},'',other)).status,200);assert.equal((await request('vote',{id:first.result.id},'',other)).status,200);
  assert.equal((await request('state')).result.totalVotes,undefined);assert.equal((await request('state',undefined,'',other)).result.ballots,undefined);const audit=(await request('state',undefined,key)).result.ballots;assert.equal(audit[0].voterName,null);assert.match(audit[0].browserId,/^NAV-/);assert.equal(audit[0].candidateId,first.result.id);assert.equal((await request('state',undefined,key)).result.totalVotes,1);
  assert.equal((await request('admin',{action:'phase',phase:'resultados'},key)).status,200);assert.equal((await request('state')).result.participants[0].votes,1);
  assert.equal((await request('admin',{action:'remove',id:first.result.id},key)).status,200);
  assert.equal((await request('state')).result.participants.length,0);assert.equal((await fetch(photoURL)).status,404);
  assert.equal((await request('admin',{action:'restore',id:first.result.id},key)).status,200);
  assert.equal((await request('state')).result.totalVotes,1);assert.equal((await fetch(photoURL)).status,200);
  assert.equal((await request('admin',{action:'phase',from:'resultados',phase:'votacion'},key)).status,200);
  assert.equal((await request('admin',{action:'phase',from:'votacion',phase:'registro'},key)).status,200);
  assert.equal((await request('state')).result.phase,'registro');assert.equal((await request('state',undefined,'',other)).result.voted,true);
  assert.equal((await fetch(base.origin+'/repository/concursos/'+id+'/concurso.json')).status,404);
  const rejected=await fetch(base+'?action=register',{method:'POST',headers:{Origin:'https://example.invalid','Content-Type':'application/json'},body:'{}'});assert.equal(rejected.status,403);
  console.log('PASS HTTPS: anonymous voting, persistent uploader self-vote block, private browser audit, photos and reversible operations.');
 }finally{await fs.rm(directory,{recursive:true,force:true});await fs.unlink(privateKey).catch(()=>{});}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
