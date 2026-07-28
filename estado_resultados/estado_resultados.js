(function () {
	"use strict";

	var host = document.getElementById("estado-resultados-host");
	var status = document.getElementById("report-status");
	var reportSource = location.hash || "#ejemplo";

	async function fetchXml(url) {
		await xover.ready;
		var source = await xover.sources[url].ready;
		var documentNode = source.nodeType === 9 ? source : source.document;
		if (!documentNode || !documentNode.documentElement) {
			throw new Error("La fuente " + url + " no devolvió un documento XML.");
		}
		return documentNode;
	}

	async function fetchStylesheet(url) {
		var response = await fetch(url, { cache: "no-store" });
		if (!response.ok) {
			throw new Error(url + " respondió " + response.status + ".");
		}

		var source = await response.text();
		var documentNode = new DOMParser().parseFromString(source, "application/xml");
		if (documentNode.querySelector("parsererror")) {
			throw new Error("El archivo " + url + " no es válido.");
		}
		return documentNode;
	}

	function activateScripts(container) {
		container.querySelectorAll("script").forEach(function (oldScript) {
			var newScript = document.createElement("script");
			Array.prototype.forEach.call(oldScript.attributes, function (attribute) {
				newScript.setAttribute(attribute.name, attribute.value);
			});
			newScript.textContent = oldScript.textContent;
			oldScript.replaceWith(newScript);
		});
	}

	Promise.all([
		fetchXml(reportSource),
		fetchStylesheet("estado_resultados.xslt")
	]).then(function (sources) {
		var xml = sources[0];
		var xslt = sources[1];
		var processor = new XSLTProcessor();
		processor.importStylesheet(xslt);

		var reportDocument = processor.transformToDocument(xml);
		var reportStyle = reportDocument.querySelector("style");
		var reportControls = reportDocument.querySelector(".controls");
		var reportStage = reportDocument.querySelector(".periods-stage");
		var reportScript = reportDocument.querySelector("script");

		if (!reportControls || !reportStage) {
			throw new Error("El XSLT no generó la estructura esperada.");
		}

		if (reportStyle) {
			reportStyle.id = "estado-resultados-styles";
			document.head.appendChild(document.importNode(reportStyle, true));
		}

		status.remove();
		host.appendChild(document.importNode(reportControls, true));
		host.appendChild(document.importNode(reportStage, true));

		if (reportScript) {
			host.appendChild(document.importNode(reportScript, true));
		}
		activateScripts(host);
	}).catch(function (error) {
		status.classList.add("report-error");
		status.innerHTML =
			'<div><span class="material-icons" aria-hidden="true">error_outline</span>' +
			"No fue posible cargar el reporte.<br><small>" +
			String(error.message).replace(/[&<>"']/g, function (character) {
				return {
					"&": "&amp;",
					"<": "&lt;",
					">": "&gt;",
					'"': "&quot;",
					"'": "&#39;"
				}[character];
			}) +
			"</small></div>";
	});
}());
