function initCotizadorDragDrop(table) {

  let dragged = null
  table.querySelectorAll('tbody>tr[data-seccion]:not([data-seccion="--"])').forEach(row => {

    row.draggable = true

    row.addEventListener('dragstart', e => {
      dragged = row
      row.classList.add('dragging')
    })

    row.addEventListener('dragend', () => {
      dragged.classList.remove('dragging')
      dragged = null
    })

    row.addEventListener('dragover', e => {
      e.preventDefault()
    })

    row.addEventListener('drop', e => {
      e.preventDefault()

      if (!dragged || dragged === row) return

      const tbody = row.parentNode
      const rect = row.getBoundingClientRect()
      const after = e.clientY > rect.top + rect.height / 2
      let target = after ? row.nextSibling : row;

      tbody.insertBefore(
        dragged,
        target
      )

      updateXML(dragged)
    })
  })
}

function updateXML(row) {
  let scope = row.scope;
  let previousSibling = row.previousElementSibling;
  if (scope.nodeType === Node.ATTRIBUTE_NODE) { //Es una sección la que se está moviendo, va a convertir todos los que hayan quedado debajo a esta sección
    let nextElement = row.nextElementSibling;
    while (nextElement && nextElement.closest("*[data-seccion][draggable=true]:not(:has(th))")) {
      let next_scope = nextElement.scope;
      next_scope.setAttributeNode(scope.cloneNode())
      nextElement = nextElement.nextElementSibling
    }

    let next_scope = (row.nextElementSibling || {}).scope;
    if (next_scope && next_scope.nodeType) {
      next_scope.closest("*").before(...scope.parentNode.select(`self::*|preceding-sibling::*[@${scope.nodeName}="${scope.value}"]|following-sibling::*[@${scope.nodeName}="${scope.value}"]`));
    }
    return
  }
  const seccionRow = (previousSibling || row).closest("*");
    let refScope = seccionRow.scope;
    if (!refScope) return false;
    const nuevaSeccion = seccionRow.dataset.seccion
  if (refScope.nodeType === Node.ATTRIBUTE_NODE) {
    refScope.closest("*").before(scope)
  } else {
    refScope.closest("*").after(scope)
  }
  scope.setAttribute('seccion', nuevaSeccion)
}

xo.listener.on('render?stylesheet.href=cotizacion.xslt', function () {
  initCotizadorDragDrop(this.querySelector("table"))
})
