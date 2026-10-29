(()=>{
 'use strict';
 let dialog,large,caption,trigger;
 function prepare(){
  if(dialog)return;
  dialog=document.createElement('dialog');dialog.className='photo-viewer';dialog.setAttribute('aria-label','Foto del disfraz en grande');
  const close=document.createElement('button');close.type='button';close.className='photo-close';close.setAttribute('aria-label','Cerrar foto');close.textContent='×';close.onclick=()=>dialog.close();
  const figure=document.createElement('figure');large=document.createElement('img');caption=document.createElement('figcaption');figure.append(large,caption);dialog.append(close,figure);document.body.append(dialog);
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  dialog.addEventListener('close',()=>{large.removeAttribute('src');if(trigger?.isConnected)trigger.focus();});
 }
 window.neiboraPhotoViewer=Object.freeze({button(image,label){
  const button=document.createElement('button');button.type='button';button.className='photo-open';button.setAttribute('aria-label','Ver foto de '+label+' en grande');button.setAttribute('aria-haspopup','dialog');button.append(image);
  button.onclick=()=>{prepare();trigger=button;large.src=image.currentSrc||image.src;large.alt=image.alt;caption.textContent=label;dialog.showModal();};
  return button;
 }});
})();
