(function () {
	"use strict";

	var host = document.getElementById("account-host");
	var status = document.getElementById("account-status");
	var picker = document.getElementById("lotePicker");
	var sourceState = document.getElementById("accountSourceState");
	var xmlDocument;
	var xsltDocument;

	function fetchText(url) {
		return fetch(url).then(function (response) {
			if (!response.ok) throw new Error(url + " respondió " + response.status);
			return response.text();
		});
	}

	function parse(source, label) {
		var node = new DOMParser().parseFromString(source, "application/xml");
		if (node.querySelector("parsererror")) throw new Error(label + " no es válido.");
		return node;
	}

	function activateScripts(container) {
		container.querySelectorAll("script").forEach(function (oldScript) {
			var script = document.createElement("script");
			script.textContent = oldScript.textContent;
			oldScript.replaceWith(script);
		});
	}

	function render(unidad) {
		var processor = new XSLTProcessor();
		processor.importStylesheet(xsltDocument);
		processor.setParameter(null, "unidad", unidad);
		host.replaceChildren(processor.transformToFragment(xmlDocument, document));
		activateScripts(host);
		if (history.replaceState) {
			var url = new URL(location.href);
			url.searchParams.set("unidad", unidad);
			url.hash = "";
			history.replaceState(null, "", url.pathname + url.search);
		}
	}

	function fillPicker() {
		var lots = Array.prototype.slice.call(xmlDocument.querySelectorAll("cartera > lote"));
		lots.sort(function (a, b) {
			return a.getAttribute("calle").localeCompare(b.getAttribute("calle"), "es", { numeric: true }) ||
				a.getAttribute("numero").localeCompare(b.getAttribute("numero"), "es", { numeric: true });
		});
		lots.forEach(function (lot) {
			var option = document.createElement("option");
			var balance = Number(lot.getAttribute("saldo") || 0);
			option.value = lot.getAttribute("id");
			option.textContent = lot.getAttribute("calle") + " " + lot.getAttribute("numero") +
				(balance > 0 ? " · debe $" + balance.toLocaleString("es-MX", { minimumFractionDigits: 2 }) : "");
			picker.appendChild(option);
		});
		var requested = new URLSearchParams(location.search).get("unidad");
		var initial = requested && lots.some(function (lot) { return lot.getAttribute("id") === requested; })
			? requested
			: (lots.some(function (lot) { return lot.getAttribute("id") === "30"; }) ? "30" : lots[0].getAttribute("id"));
		picker.value = initial;
		sourceState.textContent = lots.length + " unidades · corte " +
			(xmlDocument.querySelector("cartera").getAttribute("fecha-corte") || "actual");
		render(initial);
	}

	Promise.all([
		fetchText("../estado_resultados/ejemplo.xml"),
		fetchText("estado_cuenta.xslt")
	]).then(function (sources) {
		xmlDocument = parse(sources[0], "El XML");
		xsltDocument = parse(sources[1], "El XSLT");
		status.remove();
		fillPicker();
		picker.addEventListener("change", function () { render(this.value); });
	}).catch(function (error) {
		status.classList.add("error");
		status.innerHTML = '<div><span class="material-icons">error_outline</span>No fue posible cargar el estado de cuenta.<br><small></small></div>';
		status.querySelector("small").textContent = error.message;
	});
}());
