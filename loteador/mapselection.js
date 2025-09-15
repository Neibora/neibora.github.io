/*
  Loteador — enfoque por ÁREAS (arquitectura por eventos / métodos de <map>)
  --------------------------------------------------------------------------
  - No expone window.loteador: todo se invoca con node.dispatch('loteador:...')
  - Métodos (listeners) del componente <map>:
      • 'loteador:init'                → prepara maphilight + primera coloración + números
      • 'loteador:colorea'             → recorre <area> y pinta según reglas activas
      • 'loteador:mostrarNumerosDeCasa'→ coloca/actualiza labels con @Numero
      • 'loteador:resize'              → reescala coords desde originales y recolorea + relabel
      • 'loteador:iluminar'            → sólo toggle alwaysOn según predicado (sin recolorear colores)
  - Se apoya en: jQuery, jquery.maphilight, xo/xover, helpers select()/single(), toArray(), distinct().
*/

(function(){
  // -------------------- Utilidades --------------------
  function getDesarrolloId(){
    return (xo.site.seed || location.hash || '').replace(/^#/, '').toLowerCase();
  }

  async function getActiveDocs(){
    let store = xo.stores.active; await store.ready;
    const dataDoc = store.document;
    const desarrollo_id = getDesarrolloId();
    const settings = xover.sources[`#${desarrollo_id}:settings`];
    await settings.ready; const settingsDoc = settings;
    return { dataDoc, settingsDoc };
  }

  function getSettingsPaths(settingsDoc){
    const filters = settingsDoc.find('filters');
    return { bindPath: String(filters.attr('bind')||''), idAttr: String(filters.attr('id')||'Id') };
  }

  function parseBinding(binding){
    const m = String(binding||'').match(/^(.+)?(@[^\]]+?)$/) || ['', '', ''];
    let path = m[1] || ''; let attr = (m[2]||'').replace(/^@/, '');
    if (path) path = path.replace(/\/$/, '').replace(/\//, '>');
    return { path, attr };
  }

  function getValueFromBinding(itemNode, binding){
    const { path, attr } = parseBinding(binding);
    if(!attr) return undefined;
    if(path){ const nodes = itemNode.select(path)||[]; const first = nodes[0]; return first ? first.attr(attr) : undefined; }
    return itemNode.attr(attr);
  }

  function buildConditionsFromUI(){
    const root = document.querySelector('#Filtros'); if(!root) return {};
    const entries = root.querySelectorAll('.filter[bind]').toArray().map(filter=>{
      const bind = filter.getAttribute('bind');
      const picked = filter.querySelectorAll('.filter [type="checkbox"]:checked').toArray();
      const map = new Map(picked.map(cb => [cb.getAttribute('value'), cb.previousElementSibling ? cb.previousElementSibling.style.backgroundColor : '']));
      return [bind, map];
    }).filter(([k,v])=>v.size);
    return Object.fromEntries(entries);
  }

  function buildXPathPredicate(conditions){
    const andParts = [];
    for(const prop in conditions){
      const map = conditions[prop]; const orParts = [];
      const keys = typeof map.keys === 'function' ? map.keys() : Object.keys(map);
      for(const value of keys){
        if(String(value).includes('~')){ const [min,max] = String(value).split('~'); orParts.push(`${prop}>=${min} and ${prop}<=${max}`); }
        else { orParts.push(`${prop}="${String(value).replace('"','&quot;')}"`); }
      }
      andParts.push(`[${orParts.join(' or ')}]`);
    }
    return andParts.join('');
  }

  function testItemWithPredicate(itemNode, predicate){
    if(!predicate) return true; return !!itemNode.selectFirst(`self::*${predicate}`);
  }

  function getActiveFilterAndPalette(){
    const chosen = document.querySelector('[name="filter_headers"]:checked');
    const container = chosen ? chosen.closest('.filter[bind]') : null; if(!container) return null;
    const bind = container.getAttribute('bind');
    const palette = new Map(
      container.querySelectorAll('.filter [type="checkbox"]').toArray()
        .filter(cb => cb.previousElementSibling)
        .map(cb => [cb.getAttribute('filtervalue')||cb.getAttribute('value'), cb.previousElementSibling.style.backgroundColor])
    );
    return { bind, palette };
  }

  function cssColorToHex(s){ if(!s) return ''; if(/^#/.test(s)) return s; const m = /^rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(s); if(!m) return ''; const r=(+m[1]).toString(16).padStart(2,'0'), g=(+m[2]).toString(16).padStart(2,'0'), b=(+m[3]).toString(16).padStart(2,'0'); return `#${r}${g}${b}`; }

  function setAreaColor(area, hex){
    const data = $(area).data('maphilight') || {};
    const clean = (hex||'').replace(/^0x|^#/ig, '');
    data.fillColor = clean || '000000'; data.fillOpacity = hex ? 0.5 : 0.2; data.strokeColor = 'ffffff';
    $(area).data('maphilight', data).trigger('alwaysOn.maphilight');
    $(area).data('maphilight', data).trigger('fillColor.maphilight');
    if(hex) area.setAttribute('data-maphilight', `{"fillColor":"${clean}","fillOpacity":0.5,"strokeColor":"ffffff"}`);
  }

  function extractAreaId(area, desarrollo_id){ const t=area.getAttribute('target')||area.getAttribute('id')||''; const pref=`${desarrollo_id}_`; return t.startsWith(pref) ? t.slice(pref.length) : t; }

  function areaToSvg(areaElement){
    if (!areaElement || areaElement.tagName !== 'AREA') return document.createElement('svg');
    const nums = (areaElement.getAttribute('coords')||'').split(',').map(Number); const pts=[]; for(let i=0;i<nums.length;i+=2) pts.push({x:nums[i],y:nums[i+1]}); if(!pts.length) return document.createElement('svg');
    const xs=pts.map(p=>p.x), ys=pts.map(p=>p.y); const minX=Math.min(...xs), minY=Math.min(...ys), maxX=Math.max(...xs), maxY=Math.max(...ys); const w=Math.max(1,maxX-minX), h=Math.max(1,maxY-minY);
    const adj=pts.map(p=>`${p.x-minX},${p.y-minY}`).join(' ');
    const NS='http://www.w3.org/2000/svg'; const svg=document.createElementNS(NS,'svg'); svg.setAttribute('xmlns',NS); svg.setAttribute('viewBox',`0 0 ${w} ${h}`); svg.setAttribute('width','100%'); svg.setAttribute('height','100%');
    const poly=document.createElementNS(NS,'polygon'); poly.setAttribute('points',adj); poly.setAttribute('fill','currentColor'); poly.setAttribute('stroke','black'); poly.setAttribute('stroke-width','2'); svg.appendChild(poly); return svg;
  }

  // -------------------- Listeners del componente <map> --------------------

  // Inicializar
  xo.listener.on(['loteador:init::map'], async function(){
      // 1) maphilight
      const img = this.parentElement && this.parentElement.querySelector('img[usemap]');
      if (img) {
        $('img[usemap]').maphilight();
        // Si la imagen aún no carga, re-escala al cargar (evita canvas desplazado)
        if (!img.complete) {
          img.addEventListener('load', ()=>{ try{ this.dispatch('loteador:resize'); }catch(e){} }, { once:true });
        }
      }
      // 2) Asegurar escala correcta antes del primer pintado
      this.dispatch('loteador:resize');

      // 3) Construir filtros en #Filtros
      const filtros = document.querySelector('#Filtros');
      if (filtros && typeof filtros.dispatch === 'function') {
        filtros.dispatch('loteador:buildFilters');
      }

      // 4) Pintar y numerar (por si la construcción de filtros no dispara recolor)
      this.dispatch('loteador:colorea');
      this.dispatch('loteador:mostrarNumerosDeCasa');
  });

// Construir/actualizar #Filtros a partir de settings
// Construir/actualizar #Filtros a partir de settings (con label EXCLUSIVO)
xo.listener.on(['loteador:buildFilters::#Filtros'], async function(){
  const root = this;
  root.replaceChildren();

  const { dataDoc, settingsDoc } = await getActiveDocs();
  const { bindPath } = getSettingsPaths(settingsDoc);

  const basePalette = (window.color_array && window.color_array.slice()) || [
    '#FF6633','#FFB399','#FF33FF','#FFFF99','#00B3E6','#E6B333','#3366E6','#999966','#99FF99','#B34D4D',
    '#80B300','#809900','#E6B3B3','#6680B3','#66991A','#FF99E6','#CCFF1A','#FF1A66','#E6331A','#33FFCC',
    '#66994D','#B366CC','#4D8000','#B33300','#CC80CC','#66664D','#991AFF','#E666FF','#4DB3FF','#1AB399',
    '#E666B3','#33991A','#CC9999','#B3B31A','#00E680','#4D8066','#809980','#E6FF80','#1AFF33','#999933',
    '#FF3380','#CCCC00','#66E64D','#4D80CC','#9900B3','#E64D66','#4DB380','#FF4D4D','#99E6E6','#6666FF'
  ];

  const filters = settingsDoc.select('//filters/filter');
  let firstRadio;

  for (const filter of filters){
    const bind = filter.attr('bind');
    const title = filter.attr('title') || bind;
    const id = filter.id || bind.replace(/[\W@]/g,'_');

    const div = document.createElement('div');
    div.className = 'filter col-12 col-sm-6 col-md-4 col-xs-4 col-lg-3 col-xl-2';
    div.setAttribute('bind', bind);
    div.id = id;

    // Header
    const h4 = document.createElement('h4'); h4.style.cursor='pointer';
    const radio = document.createElement('input'); radio.type='radio'; radio.name='filter_headers'; radio.id = `radio_${id}`;
    const label = document.createElement('label'); label.setAttribute('for', radio.id); label.textContent = title;
    h4.appendChild(radio); h4.appendChild(label); div.appendChild(h4);
    if (!firstRadio) firstRadio = radio;

    radio.addEventListener('change', ()=>{
      const map=document.querySelector('map');
      if (map && typeof map.dispatch==='function') map.dispatch('loteador:colorea');
    });

    // Helper: cablea checkbox y label
    function wireOption(chk, text){
      // Checkbox ⇒ acumulativo
      chk.addEventListener('change', ()=>{
        if (!document.querySelector('[name="filter_headers"]:checked')) { radio.checked = true; }
        const map=document.querySelector('map');
        if (map && typeof map.dispatch==='function') map.dispatch('loteador:colorea');
      });

      // Label ⇒ exclusivo (mutuallyExclusiveClick)
      const lb = document.createElement('label');
      lb.setAttribute('for', chk.id);
      lb.textContent = text;
      lb.addEventListener('click', (ev)=>{
        const domain = lb.closest('.filter');
        const target = domain.querySelector(`#${(window.CSS && CSS.escape) ? CSS.escape(chk.id) : chk.id}`) || document.getElementById(chk.id);

        // Si no hay header activo aún, selecciona el de este filtro
        if (!document.querySelector('[name="filter_headers"]:checked')) { radio.checked = true; }

        // Si ya estaba seleccionado, evita “destoggle” del label
        if (target && target.checked) {
          ev.preventDefault();
          const map=document.querySelector('map');
          if (map && typeof map.dispatch==='function') map.dispatch('loteador:colorea');
          return;
        }

        // Exclusividad dentro del filtro
        domain.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => { if (cb !== target) cb.checked = false; });
        if (target) target.checked = true;

        ev.preventDefault();
        const map=document.querySelector('map');
        if (map && typeof map.dispatch==='function') map.dispatch('loteador:colorea');
      });

      return lb;
    }

    // Opciones (declaradas) o derivadas
    const options = filter.select('option');
    let palette = basePalette.slice();

    if (options.length){
      for (const opt of options){
        const value = opt.attr('value');
        const text  = opt.innerHTML || opt.attr('text') || value;
        const color = opt.attr('color') || palette.pop();
        const selected = opt.attr('selected') === 'true' || opt.attr('selected') === 'selected';

        const span = document.createElement('span'); span.className='filter_option';
        const sw   = document.createElement('span'); sw.style.backgroundColor = color; sw.innerHTML='&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
        const chk  = document.createElement('input');
        chk.type='checkbox'; chk.id = `${id}_${value}`; chk.name = id; chk.value = value; chk.setAttribute('filterValue', value);
        if (selected) chk.checked = true;

        const lb = wireOption(chk, text);
        const br = document.createElement('br');

        span.appendChild(sw); span.appendChild(document.createTextNode(' '));
        span.appendChild(chk); span.appendChild(lb); span.appendChild(br);
        div.applyAttributes(filter.attributes)
        div.appendChild(span);
      }
    } else {
      // Deriva valores desde datos para bind tipo path@Attr
      const items = dataDoc.select(bindPath) || [];
      const vals  = items.map(n=> getValueFromBinding(n, bind))
                         .filter(v=> v!==undefined && v!==null && String(v).length)
                         .distinct();

      for (const value of vals){
        const color = palette.pop();
        const text  = String(value);

        const span = document.createElement('span'); span.className='filter_option';
        const sw   = document.createElement('span'); sw.style.backgroundColor = color; sw.innerHTML='&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
        const chk  = document.createElement('input');
        chk.type='checkbox'; chk.id = `${id}_${value}`; chk.name = id; chk.value = value; chk.setAttribute('filterValue', value);

        const lb = wireOption(chk, text);
        const br = document.createElement('br');

        span.appendChild(sw); span.appendChild(document.createTextNode(' '));
        span.appendChild(chk); span.appendChild(lb); span.appendChild(br);
        div.appendChild(span);
      }
    }

    root.appendChild(div);
  }

  // Si nadie quedó marcado, marca el primero
  if (firstRadio && !root.querySelector('[name="filter_headers"]:checked')) {
    firstRadio.checked = true;
  }
});

  // Colorear (recorrer ÁREAS)
  xo.listener.on(['loteador:colorea::map'], async function(){
    const map = this; const { dataDoc, settingsDoc } = await getActiveDocs(); const { bindPath, idAttr } = getSettingsPaths(settingsDoc);
    const conditions = buildConditionsFromUI(); const predicate = buildXPathPredicate(conditions);
    const active = getActiveFilterAndPalette(); const desarrollo_id = getDesarrolloId();

    const areas = map.querySelectorAll('area');
    for (const area of areas) {
      const lotId = extractAreaId(area, desarrollo_id); if(!lotId){ setAreaColor(area,''); continue; }
      const item = dataDoc.single(`${bindPath}[@${idAttr}="${lotId}"]`);
      if(!item){ const d=$(area).data('maphilight')||{}; d.alwaysOn=false; $(area).data('maphilight',d); continue; }
      const match = testItemWithPredicate(item, predicate); const d=$(area).data('maphilight')||{}; d.alwaysOn=!!match; $(area).data('maphilight',d);
      if(active){ const value = getValueFromBinding(item, active.bind); const css = active.palette.get(value)||''; const hex = cssColorToHex(css); setAreaColor(area, match ? hex : ''); }
    }
    $(map).trigger('alwaysOn.maphilight');
  });

  // Mostrar/actualizar números (@Numero)
  xo.listener.on(['loteador:mostrarNumerosDeCasa::map'], async function(){
    const map = this; const container = map.parentElement; if (!container) return;
    if (getComputedStyle(container).position === 'static') container.style.position = 'relative';
    container.querySelectorAll('.numero-casa').forEach(e=>e.remove());

    const { dataDoc, settingsDoc } = await getActiveDocs(); const { bindPath, idAttr } = getSettingsPaths(settingsDoc); const desarrollo_id = getDesarrolloId();
    const items = dataDoc.querySelectorAll(`${bindPath.split('/').join('>')}[Numero]`);
    for (const item of items){
      const id = item.getAttribute(idAttr), numero = item.getAttribute('Numero'); if(!id||!numero) continue;
      const selector = `area[target="${desarrollo_id}_${id}"], area[target="${id}"]`; const area = map.querySelector(selector) || document.querySelector(selector); if(!area) continue;
      const coords = (area.coords||'').split(',').map(Number); if(!coords.length) continue;
      const xs=coords.filter((_,i)=>i%2===0), ys=coords.filter((_,i)=>i%2===1); const x=xs.reduce((a,b)=>a+b,0)/xs.length; const y=ys.reduce((a,b)=>a+b,0)/ys.length;
      const label=document.createElement('div'); label.className='numero-casa'; label.textContent=numero; Object.assign(label.style,{position:'absolute',left:`${x}px`,top:`${y}px`,transform:'translate(-50%, -50%)',fontWeight:'bold',color:'black',fontSize:'.8rem',pointerEvents:'none',textShadow:'0 1px 2px rgba(255,255,255,.8)'});
      container.appendChild(label);
    }
  });

  // Iluminar (toggle only)
  xo.listener.on(['loteador:iluminar::map'], async function(){
    const map=this; const conditions = event.detail || {}; const { dataDoc, settingsDoc } = await getActiveDocs(); const { bindPath, idAttr } = getSettingsPaths(settingsDoc); const desarrollo_id=getDesarrolloId();
    const predicate = buildXPathPredicate(conditions);
    for (const area of map.querySelectorAll('area')){
      const lotId = extractAreaId(area, desarrollo_id); if(!lotId) continue; const item = dataDoc.single(`${bindPath}[@${idAttr}="${lotId}"]`); if(!item) continue;
      let data = $(area).mouseout().data('maphilight') || {}; data.alwaysOn = !!testItemWithPredicate(item, predicate); $(area).data('maphilight', data);
    }
    $(map).trigger('alwaysOn.maphilight');
  });

  // Resize (reescala desde coord originales y recolorea + relabel)
  xo.listener.on(['loteador:resize::map'], function(){
    const map=this; const img = map.parentElement && map.parentElement.querySelector('img[usemap]'); if(!img) return;
    const baseWidth = Number(img.getAttribute('orgwidth')) || img.naturalWidth || img.clientWidth; const x = img.clientWidth / baseWidth;
    const areas = map.querySelectorAll('area');
    for (const area of areas){
      const original = area.getAttribute('data-original-coords') || area.coords; const nums = original.split(','); if(!area.hasAttribute('data-original-coords')) area.setAttribute('data-original-coords', original);
      const scaled = new Array(nums.length); for (let i=0;i<nums.length;i++){ scaled[i] = +nums[i] * x; } area.coords = scaled.join(',');
    }
    // tras reescalar, recolorea y reubica números
    map.dispatch('loteador:colorea');
    map.dispatch('loteador:mostrarNumerosDeCasa');
  });

  // -------------------- Integración con el ciclo de vida --------------------

  // Cambios de filtros → recolorear
  xo.listener.on(['click::#Filtros input[type="checkbox"]'], function(){ const map=document.querySelector('map'); if(map && typeof map.dispatch==='function') map.dispatch('loteador:colorea'); });
  xo.listener.on(['change::#Filtros input[name="filter_headers"]'], function(){ const map=document.querySelector('map'); if(map && typeof map.dispatch==='function') map.dispatch('loteador:colorea'); });

  // Click de área → detalle e iluminación focal
  if (typeof window.ubicacion_seleccionada === 'undefined') window.ubicacion_seleccionada = undefined;
  xover.listener.on('click::area', async function(e){
    e.preventDefault(); e.stopImmediatePropagation(); const area=this; const map=area.closest('map');
    const desarrollo_id = getDesarrolloId(); const raw = area.getAttribute('id') || area.getAttribute('target') || ''; const id = raw.replace(new RegExp(`^${desarrollo_id}_`, 'i'), '');

    window.ubicacion_seleccionada = (window.ubicacion_seleccionada === id) ? undefined : id;

    const { dataDoc, settingsDoc } = await getActiveDocs(); const { bindPath, idAttr } = getSettingsPaths(settingsDoc);
    let template = settingsDoc.querySelector('template.details'); if (!template) return false; template = template.content.cloneNode(true);

    if (window.ubicacion_seleccionada){
      const node = dataDoc.single(`${bindPath}[@${idAttr}="${window.ubicacion_seleccionada}"]`); if(!node) return false;
      for (let input of template.querySelectorAll('[id]')){
        const k=input.id; const attr = node.attributes[k] || [...node.attributes].find(a=>a.localName.toLowerCase()===k.toLowerCase()) || { value:'' };
        if (input instanceof HTMLInputElement) input.value = attr.value; else input.textContent = attr.value;
      }
      const svg = areaToSvg(area); const img = template.querySelector('img'); if (img) img.replaceWith(svg);
      const detalles=document.querySelector('#Detalles'); if(detalles){ detalles.setAttribute('xo-source','active'); const xoId=node.getAttribute('xo:id')||''; if(xoId) detalles.setAttribute('xo-scope', xoId); detalles.replaceChildren(...template.childNodes); }
      const flipper=document.querySelector('.card-flipper'); if (flipper) flipper.classList.add('toggled');
    } else {
      const flipper=document.querySelector('.card-flipper'); if (flipper) flipper.classList.remove('toggled');
    }

    if (window.ubicacion_seleccionada){
      setAreaColor(area, '#80FF00');
      const cond={}; cond[`@${idAttr}`]={}; cond[`@${idAttr}`][window.ubicacion_seleccionada] = { color:'blue' };
      if (map && typeof map.dispatch==='function') map.dispatch('loteador:iluminar', cond);
    } else {
      if (map && typeof map.dispatch==='function') map.dispatch('loteador:colorea');
    }
    return false;
  });

  // Resize global → cada <map> reescala y repinta (debounce interno del navegador)
  window.addEventListener('resize', function(){
    document.querySelectorAll('map').forEach(map => { if (typeof map.dispatch==='function') map.dispatch('loteador:resize'); });
  }, { passive:true });

})();