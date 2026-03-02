function extractNumberSmart(text) {
	const cleaned = String(text).replace(/,/g, "")
	const match = cleaned.match(/-?\d+(\.\d+)?/)
	return match ? Number(match[0]) : null
}

xo.listener.on("change::Condominio/@departamentos", "change::@precio|@cuota_mensual", function ({ value }) {
	value = extractNumberSmart(value)

	if (value == null) {
		alert("Número inválido")
		this.value = old
		return
	}

	if (String(this.value) !== String(value)) {
		this.value = value
	}
})

function normalizarCotizacion({ document }) {
	let condominio = document.single(`//Condominio`);
	let casas = condominio.getAttribute("casas");
	for (let partida of document.select(`//Partida[@precioPorCasa][not(@precio)]`)) {
		partida.setAttribute("precio", partida.getAttribute("precioPorCasa") * casas)
	}
}
xover.listener.on('beforeTransform?stylesheet=cotizacion.xslt', normalizarCotizacion)

// FECHAS
function parseFechaES(text) {

	if (!text) return null

	let s = String(text).trim()
	if (!s) return null

	// normaliza
	s = s
		.replace(/\s+/g, " ")
		.replace(/\./g, "")
		.replace(/del\s+/gi, "")
		.trim()

	// 1) ISO: YYYY-MM-DD
	let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
	if (m) {
		const y = +m[1], mo = +m[2], d = +m[3]
		const dt = new Date(y, mo - 1, d)
		return (dt && dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d) ? dt : null
	}

	// 2) DD/MM/YYYY o DD-MM-YYYY
	m = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/)
	if (m) {
		const d = +m[1], mo = +m[2], y = +m[3]
		const dt = new Date(y, mo - 1, d)
		return (dt && dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d) ? dt : null
	}

	// 3) "8 de septiembre de 2025"
	const meses = {
		enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
		julio: 7, agosto: 8, septiembre: 9, setiembre: 9, octubre: 10, noviembre: 11, diciembre: 12
	}

	m = s.toLowerCase().match(/^(\d{1,2})\s+de\s+([a-záéíóúñ]+)\s+de\s+(\d{4})$/i)
	if (m) {
		const d = +m[1]
		const mes = (m[2] || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
		const mo = meses[mes]
		const y = +m[3]
		if (!mo) return null
		const dt = new Date(y, mo - 1, d)
		return (dt && dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d) ? dt : null
	}

	return null

}

function formatFechaISO(dt) {
	const y = dt.getFullYear()
	const m = String(dt.getMonth() + 1).padStart(2, "0")
	const d = String(dt.getDate()).padStart(2, "0")
	return `${y}-${m}-${d}`
}
function capitalizeMonth(text) {
	return text.replace(
		/\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\b/,
		m => m.charAt(0).toUpperCase() + m.slice(1)
	)
}
function formatFechaLargaES(dt) {

	const meses = [
		"enero", "febrero", "marzo", "abril", "mayo", "junio",
		"julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
	]

	const dd = String(dt.getDate()).padStart(2, "0")
	const mm = meses[dt.getMonth()]
	const yy = dt.getFullYear()

	return `${dd} de ${mm} de ${yy}`

}

function toISODate(text) {
	const dt = parseFechaES(text)
	return dt ? formatFechaISO(dt) : null
}

function toLongDate(text) {
	const dt = parseFechaES(text)
	return dt ? formatFechaLargaES(dt) : null
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
xo.listener.on("dblclick::[xo-scope]", function () {
	if (this.isContentEditable) return
	this.setAttribute("contenteditable", "true")
	this.focus()
})

xover.listener.on("input::[contenteditable]", function () {
	this.classList.add("is-editing")
	this.classList.add("is-typing")
	//TODO: remove is-typing with delay
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