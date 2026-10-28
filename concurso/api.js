/* Public API shared by the gallery and administration. Never accept an endpoint from URL parameters. */
(()=>{
 const id=new URLSearchParams(location.search).get('concurso')||'15cceb26-b380-4b50-9d1f-0893c9e7cb13';
 window.neiboraContest=Object.freeze({id,url(action,parameters={}){
  const url=new URL('https://api.neibora.com/contest-api');
  url.searchParams.set('concurso',id);url.searchParams.set('action',action);
  for(const [name,value]of Object.entries(parameters))url.searchParams.set(name,value);
  return url.href;
 }});
})();
