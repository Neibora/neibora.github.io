'use strict';
const http=require('node:http'),path=require('node:path'),fs=require('node:fs/promises');
const {registerContest,DEFAULT_ID}=require('./server.cjs');
function createApplication({root}) {
const routes=new Map();
const contest=registerContest({root,router:{get:(url,handler)=>routes.set('GET '+url,handler),post:(url,handler)=>routes.set('POST '+url,handler),options:(url,handler)=>routes.set('OPTIONS '+url,handler)}});
const handler=(req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1');req.query=Object.fromEntries(url.searchParams);
 res.set=(key,value)=>{res.setHeader(key,value);return res;};res.status=code=>{res.statusCode=code;return res;};res.type=value=>{res.setHeader('Content-Type',value);return res;};res.send=body=>res.end(body);res.json=body=>{res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(body));};
 if(req.method==='GET'&&url.pathname==='/health')return res.set('Cache-Control','no-store').json({ok:true,service:'neibora-concurso'});
 const route=routes.get(req.method+' '+url.pathname);if(!route)return res.status(404).json({message:'Ruta no disponible.'});route(req,res);
};
return {contest,handler};
}
async function start(){
 const root=path.resolve(process.env.NEIBORA_PLATFORM_ROOT||path.join(__dirname,'..'));
 const {contest,handler}=createApplication({root});await contest.ready;
 const ports=[...new Set([Number(process.env.PORT||3000),Number(process.env.NEIBORA_CONTEST_LOCAL_PORT||8028)])];
 if(ports.some(port=>!Number.isInteger(port)||port<1024||port>65535))throw Error('Puertos inválidos.');
 const servers=[];
 try{
  for(const port of ports){const server=http.createServer(handler);server.requestTimeout=25000;server.headersTimeout=15000;await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});servers.push(server);}
 }catch(error){for(const server of servers)server.close();throw error;}
 await fs.writeFile(path.join(root,'App_Data','concurso','server.pid'),String(process.pid));
 console.log('Concurso disponible en localhost:'+ports.join(', ')+'. ID: '+DEFAULT_ID);
 function shutdown(){for(const server of servers)server.close();}
 process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
}
if(require.main===module)start().catch(error=>{console.error('No se pudo iniciar el concurso:',error.code||error.message);process.exitCode=1;});
module.exports={createApplication};
