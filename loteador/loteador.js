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