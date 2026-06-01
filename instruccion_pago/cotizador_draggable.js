function initCotizadorDragDrop(table) {

	let dragged = null

	table.addEventListener('dragstart', e => {
		const row = e.target.closest('tr[draggable="true"]')
		if (!row || !table.contains(row)) return

		dragged = row
		row.classList.add('dragging')
	})

	table.addEventListener('dragend', e => {
		if (!dragged) return
		dragged.classList.remove('dragging')
		dragged = null
	})

	table.addEventListener('dragover', e => {
		const row = e.target.closest('tr[draggable="true"], tr[droptarget]')
		if (!row || !table.contains(row)) return
		e.preventDefault()
	})

	table.addEventListener('drop', e => {

		const row = e.target.closest('tr[draggable="true"], tr[droptarget]')
		if (!row || !table.contains(row)) return

		e.preventDefault()

		if (!dragged || dragged === row) return

		const tbody = row.parentNode
		const rect = row.getBoundingClientRect()
		const after = e.clientY > rect.top + rect.height / 2
		let target = after ? row.nextSibling : row

		tbody.insertBefore(dragged, target)

		updateXML(dragged)
	})
}

function updateXML(row) {
	let scope = row.scope;
	let previousSibling = row.previousElementSibling;
	let nextElement = row.nextElementSibling;
	if (scope.nodeType === Node.ATTRIBUTE_NODE) { //Es una sección la que se está moviendo, va a convertir todos los que hayan quedado debajo a esta sección
		while (nextElement && nextElement.closest("*[data-seccion][draggable=true]:not(:has(th))")) {
			let next_scope = nextElement.scope;
			if (scope.closest("*") !== next_scope) {
				next_scope.setAttributeNode(scope.cloneNode())
			}
			nextElement = nextElement.nextElementSibling
		}
		let next_scope = (row.nextElementSibling || {}).scope;
		if (next_scope && next_scope.nodeType) {
			next_scope.closest("*").before(...scope.parentNode.select(`self::*|preceding-sibling::*[@${scope.nodeName}="${scope.value}"]|following-sibling::*[@${scope.nodeName}="${scope.value}"]`));
		}
		return
	}
	const seccionRow = (previousSibling || row);
	let refScope = seccionRow.closest("*").scope;
	if (!refScope) return false;
	if (scope === refScope.closest("*")) {
		scope = (row.querySelector("[xo-slot].reference") || {}).scope;
		if (!scope) {
			row.section.render()
		} else if (nextElement.closest("*[data-seccion][draggable=true]:not(:has(th)):has(.reference)")) {
			let next_scope = (nextElement.querySelector("[xo-slot].reference") || {}).scope;
			if (next_scope && next_scope.closest("*").parentNode === scope.closest("*").parentNode) {
				next_scope.closest("*").before(scope.closest("*"));
			} else {
				debugger
			}
		}
		return
	}
	const nuevaSeccion = (seccionRow.dataset || {}).seccion;
	if (nuevaSeccion == undefined) return;
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
