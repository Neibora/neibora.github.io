function extractNumberSmart(text) {
	const cleaned = String(text).replace(/,/g, "")
	const match = cleaned === "" ? "  " : cleaned.match(/^(?:\s*\$?)(-?\d+\.?\d*)?/);
	return match != null ? Number(match[1]) : null
}

function normalizarCotizacion({ document }) {
	let condominio = document.single(`//Condominio`);
	let casas = condominio.getAttribute("casas");
	for (let partida of document.select(`//Partida[@precioPorCasa][not(@precio)]`)) {
		partida.setAttribute("precio", partida.getAttribute("precioPorCasa") * casas)
	}
}
xover.listener.on('beforeTransform?stylesheet=cotizacion.xslt', normalizarCotizacion)

// FECHAS
function capitalizeMonth(text) {
	return text.replace(
		/\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\b/,
		m => m.charAt(0).toUpperCase() + m.slice(1)
	)
}

function isValidDate(dt) {
	return dt instanceof Date && !isNaN(dt)
}

function makeDateStrict(y, m0, d) {
	const dt = new Date(y, m0, d)
	if (!isValidDate(dt)) return null
	if (dt.getFullYear() !== y) return null
	if (dt.getMonth() !== m0) return null
	if (dt.getDate() !== d) return null
	return dt
}

function normalizeESMonthToken(token) {
	return String(token || "")
		.trim()
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
}

function monthIndexES(token) {
	const t = normalizeESMonthToken(token)
	if (!t) return null

	const months = {
		enero: 0, ene: 0,
		febrero: 1, feb: 1,
		marzo: 2, mar: 2,
		abril: 3, abr: 3,
		mayo: 4, may: 4,
		junio: 5, jun: 5,
		julio: 6, jul: 6,
		agosto: 7, ago: 7,
		septiembre: 8, sep: 8,
		octubre: 9, oct: 9,
		noviembre: 10, nov: 10,
		diciembre: 11, dic: 11
	}

	// primero full, luego 3 letras (mantiene autocompletado)
	if (t in months) return months[t]
	const t3 = t.slice(0, 3)
	return (t3 in months) ? months[t3] : null
}

function formatFechaISO(dt) {
	if (!isValidDate(dt)) return ""
	const y = dt.getFullYear()
	const m = String(dt.getMonth() + 1).padStart(2, "0")
	const d = String(dt.getDate()).padStart(2, "0")
	return `${y}-${m}-${d}`
}

function formatFechaLargaES(dt) {
	if (!isValidDate(dt)) return ""
	const months = [
		"enero", "febrero", "marzo", "abril", "mayo", "junio",
		"julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
	]
	const d = String(dt.getDate()).padStart(2, "0")
	const m = months[dt.getMonth()]
	const y = dt.getFullYear()
	return `${d} de ${m} de ${y}`
}

/**
 * parseFechaES(text, fallback)
 * - fallback: Date (por ejemplo la fecha previa "old") para autocompletar mes/año
 * Regresa Date o null
 */
function parseFechaES(text, fallback) {
	if (text == null) return null

	const raw = String(text).trim()
	if (!raw) return null

	const base = isValidDate(fallback) ? fallback : new Date()

	// 1) Solo día: "15"  -> usa mes/año de fallback o hoy
	if (/^\d{1,2}$/.test(raw)) {
		const d = parseInt(raw, 10)
		if (d < 1 || d > 31) return null
		return makeDateStrict(base.getFullYear(), base.getMonth(), d)
	}

	const s = raw.toLowerCase()

	// 2) ISO: YYYY-MM-DD con o sin hora/zona (ignora hora y evita desfase)
	{
		// acepta: 2026-03-15
		//         2026-03-15T00:00:00
		//         2026-03-15T00:00:00Z
		//         2026-03-15T00:00:00-06:00
		//         2026-03-15 00:00:00
		const m = String(raw).trim().match(
			/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s]\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+\-]\d{2}:\d{2})?)?$/
		)
		if (m) {
			const y = parseInt(m[1], 10)
			const m0 = parseInt(m[2], 10) - 1
			const d = parseInt(m[3], 10)
			return makeDateStrict(y, m0, d)
		}
	}

	// 3) dd/mm o dd/mm/yyyy (MX: DÍA/MES)
	//    Si no trae año, toma el del fallback/hoy
	{
		const m = raw.match(/^(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?$/)
		if (m) {
			const d = parseInt(m[1], 10)
			const m0 = parseInt(m[2], 10) - 1
			let y
			if (m[3]) {
				y = parseInt(m[3], 10)
				if (y < 100) y += 2000
			} else {
				y = base.getFullYear()
			}
			return makeDateStrict(y, m0, d)
		}
	}

	// 4) "15 sep 2026" | "15 de sep de 2026" | "15 septiembre 2026"
	//    año requerido; (si quieres aceptar sin año, dime y lo completo con fallback)
	{
		const m = s.match(/^(\d{1,2})\s*(?:de)?\s*([a-záéíóú]{3,})\s*(?:de)?\s*(\d{2,4})$/)
		if (m) {
			const d = parseInt(m[1], 10)
			const month = monthIndexES(m[2])
			if (month == null) return null
			let y = parseInt(m[3], 10)
			if (y < 100) y += 2000
			return makeDateStrict(y, month, d)
		}
	}

	// 5) Si llega aquí, NO parseamos strings ambiguos con Date()
	//    (evita US parsing tipo 03/02 => 3 de abril)
	return null
}

xo.listener.on("change::Cotizacion/@fecha", function ({ old }) {
	const dtNew = parseFechaES(this.value)
	if (!dtNew) return

	const longNew = capitalizeMonth(formatFechaLargaES(dtNew))

	const longOld = old != null ? (() => {
		const dtOld = parseFechaES(old)
		return dtOld ? capitalizeMonth(formatFechaLargaES(dtOld)) : null
	})() : null

	// ✅ Solo salir si ya está formateado en largo
	if ((longOld || '').toLowerCase() == (longNew || '').toLowerCase() && this.value === longNew.toLowerCase()) return

	if (this.value !== longNew) {
		this.value = longNew
	}
})

xo.listener.on("change::@fecha", function ({ old }) {
	const dtNew = parseFechaES(this.value)
	if (this.value && !dtNew) {
		alert("Fecha inválida")
		this.value = old;
		//event.detail.stopPropagation = false;
		return false;
	}

	const isoNew = formatFechaISO(dtNew)

	const isoOld = old != null ? (() => {
		const dtOld = parseFechaES(old)
		return dtOld ? formatFechaISO(dtOld) : null
	})() : null

	// ✅ Solo salir si NO hay nada que normalizar
	if (isoOld && isoOld === isoNew) return

	// Si el valor actual no está en ISO, normaliza
	if (this.value !== isoNew) {
		this.value = isoNew
	}
})

//editable
xo.listener.on("click::[xo-slot]", function () {
	if (this.isContentEditable) return
	this.setAttribute("contenteditable", "true")
	this.classList.add("is-editing")
	this.tabIndex = -1
	this.focus()

	// select all text
	const range = document.createRange()
	range.selectNodeContents(this)

	const sel = window.getSelection()
	sel.removeAllRanges()
	sel.addRange(range)

})

// typing indicator
xover.listener.on("input::[contenteditable]", function () {

	this.classList.add("is-editing")
	this.classList.add("is-typing")

	// remove is-typing with delay (debounce)
	clearTimeout(this.__xo_typing_to)
	this.__xo_typing_to = setTimeout(() => {
		this.classList.remove("is-typing")
	}, 250)
})
xo.listener.on("focusout::[contenteditable][xo-scope]", function () {
	this.removeAttribute("contenteditable")
	this.classList.remove("is-typing")
	this.classList.remove("is-editing")
})

xo.listener.on("change::@fecha[.='hoy']", function () {
	this.value = new Date().toISOString()
})

function concepto_listener({ element, value, old }) {
	let cantidad = extractNumberSmart(value);
	if (value === "" || cantidad === 0) {
		if (element.getAttributeNodeNS(xo.spaces.state, "mock") || !element.getAttribute("precio") || confirm(`Esta acción eliminaría el registro ${old}`)) {
			element.remove()
			event.stopImmediatePropagation()
			return false
		}
		this.value = old
		return
	}
	if (cantidad) {
		element.setAttribute("cantidad", cantidad)
		let regex = new RegExp(`^${cantidad}\\s*`)
		value = value.replace(regex, "")
		value = value || old
	}
	this.value = value
}
xo.listener.on("change::@concepto", concepto_listener)

xo.listener.on("change::Condominio/*/@cantidad", function ({ element, value, old }) {
	let cantidad = extractNumberSmart(value)
	if (cantidad === 0) {
		if (confirm(`Esta acción eliminaría el registro ${element.nodeName}`)) {
			element.remove()
			event.stopImmediatePropagation()
			return false
		}
		this.value = old
		return
	}
	if (cantidad == null) {
		alert("Número inválido")
		this.value = old
		return
	}
	if (String(this.value) !== String(value)) {
		this.value = value
	}
})

//xover.listener.on("focusout::[contenteditable][xo-scope]", function (e) {

//	const scope = this.scope
//	if (!(scope && scope.nodeType === Node.ATTRIBUTE_NODE)) return

//	const value = this.innerText.trim()

//	if (scope.value !== value) {
//		scope.value = value
//		this.classList.add("is-dirty")
//	}

//	this.removeAttribute("contenteditable")
//	this.classList.remove("is-editing")

//})


cotizador = {}
cotizador.download = function () {
	let document = xo.sources["cotizacion.xml"];
	document.select(`//@xo:*`).remove();
	document.download()
}
cotizador.save = function () {
	let document = xo.sources["cotizacion.xml"];
	document.select(`//@xo:*`).remove();
	document.upload()
}


cotizador.nuevaPartida = function () {
	let new_node = this.duplicate({ seed: true });
	new_node.attributes.filterNS("").forEach(attr => attr.value = "");
	new_node.setAttribute("cantidad", "1")
	new_node.setAttribute("seccion", "Otros datos")
	new_node.setAttribute("concepto", "Nueva partida")
	new_node.setAttribute("state:mock", "true")
}

xo.listener.on(`change::Partida[@state:mock]`, function ({ attributes }) {
	if ("mock" in (attributes[xo.spaces.state] || {})) return;
	if (Object.values(attributes[""]).every(([attr]) => !attr.value)) return;
	this.removeAttribute("state:mock")
})

xo.listener.on(`change::@seccion`, function ({ element, value, old }) {
	if (instanceOf.call(event.srcEvent, DragEvent)) return;
	let scope = this;
	element.select(`preceding-sibling::*[@${scope.nodeName}="${old}"]|following-sibling::*[@${scope.nodeName}="${old}"]`).forEach(partida => partida.setAttribute("seccion", value));
})