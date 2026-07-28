(function () {
	"use strict";

	var host = document.getElementById("portal-host");
	var status = document.getElementById("portal-status");

	function wait(milliseconds) {
		return new Promise(function (resolve) {
			window.setTimeout(resolve, milliseconds);
		});
	}

	function sourceDocument(source) {
		if (!source) return null;
		if (source.nodeType === 9) return source;
		if (source.document && source.document.nodeType === 9) return source.document;
		return source.documentElement ? source : null;
	}

	async function fetchXmlSource(name) {
		await xover.ready;

		var source = xover.sources[name];
		if (!source) throw new Error("No se encontró la fuente " + name + ".");
		var lastError = null;

		/*
		 * `ready` indica que la fuente fue inicializada, pero durante el arranque
		 * puede resolverse antes de que la primera respuesta se haya incorporado
		 * al documento. Esperamos esa carga y, si quedó vacío, hacemos un reintento
		 * acotado en lugar de transformar un XML sin contenido.
		 */
		for (var attempt = 0; attempt < 2; attempt += 1) {
			try {
				await source.ready;
			} catch (error) {
				lastError = error;
			}

			var xml = sourceDocument(source);
			if (xml && xml.documentElement) return xml;

			if (typeof source.fetch !== "function") break;
			try {
				await source.fetch();
				await source.ready;
			} catch (error) {
				lastError = error;
			}

			xml = sourceDocument(source);
			if (xml && xml.documentElement) return xml;
			if (attempt === 0) await wait(100);
		}

		throw new Error(name + " no devolvió contenido" +
			(lastError && lastError.message ? ": " + lastError.message : "."));
	}

	async function fetchText(url) {
		var response = await fetch(url, { cache: "no-store" });
		if (!response.ok) throw new Error(url + " respondió " + response.status + ".");

		var text = await response.text();
		if (!text.trim()) throw new Error(url + " no devolvió contenido.");
		return text;
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

	Promise.all([fetchXmlSource("#menu"), fetchText("menu.xslt")])
		.then(function (sources) {
			var processor = new XSLTProcessor();
			processor.importStylesheet(parse(sources[1], "El XSLT"));
			var fragment = processor.transformToFragment(sources[0], document);
			if (!fragment.childNodes.length) throw new Error("La transformación no produjo contenido.");
			host.replaceChildren(fragment);
			activateScripts(host);
		})
		.catch(function (error) {
			status.classList.add("error");
			status.innerHTML = '<div><span class="material-icons">error_outline</span>No fue posible cargar el menú.<br><small></small></div>';
			status.querySelector("small").textContent = error.message;
		});
}());
