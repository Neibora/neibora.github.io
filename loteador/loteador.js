window.loteador = {};
window.loteador.inicializar = function () {
  xo.state.desarrollo = xo.site.seed.replace(/^#/, '');
  for (let map of window.document.querySelectorAll('map')) {
    map.dispatch('loteador:init');
  }
}

xover.listener.on(`beforeRender::*:has(map)`, function beforeRender({ target }) {
  if (target.querySelector('img')) {
    event.preventDefault()
  }
})

const DEFAULT_IMAGE = '/assets/img/logo_invertido.png'

function default_image(event) {
  let img = event?.target || this

  if (!(img instanceof HTMLImageElement)) return

  let src = img.getAttribute('src') || ''

  // Si ya falló la imagen por defecto, no hacer nada
  if (src.endsWith(DEFAULT_IMAGE) || src === DEFAULT_IMAGE) return

  // Si todavía tiene placeholders sin resolver
  if (src.includes('{')) {
    console.warn('Placeholder sin resolver:', src)
    return
  }
  img.closest("a").href = `javascript:void(0); loteador.randomize();`
  img.onerror = null
  img.src = DEFAULT_IMAGE
}

document.addEventListener('error', default_image, true)

window.loteador.randomize = function () {
  let items = [...xo.sources.seed.select(`//data/item[@Numero]`)];

  // Mezclar aleatoriamente
  items.sort(() => Math.random() - 0.5);

  let total = items.length;

  let morosidad = Math.round(total * 0.03);
  let atrasado = Math.round(total * 0.10);
  let anticipado = Math.round(total * 0.10);

  items.slice(0, morosidad)
    .forEach(item => item.set("Status", "Morosidad"));

  items.slice(morosidad, morosidad + atrasado)
    .forEach(item => item.set("Status", "Atrasado"));

  items.slice(morosidad + atrasado, morosidad + atrasado + anticipado)
    .forEach(item => item.set("Status", "Anticipado"));

  items.slice(morosidad + atrasado + anticipado)
    .forEach(item => item.set("Status", "Pagado"));
}
xover.listener.on(`randomize`, window.loteador.randomize);