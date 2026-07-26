(function () {
	"use strict";

	var host = document.getElementById("estado-resultados-host");
	var status = document.getElementById("report-status");

	function fetchText(url) {
		return fetch(url).then(function (response) {
			if (!response.ok) {
				throw new Error(url + " respondió " + response.status);
			}
			return response.text();
		});
	}

	function parseXml(source, type, label) {
		var documentNode = new DOMParser().parseFromString(source, type);
		var parserError = documentNode.querySelector("parsererror");
		if (parserError) {
			throw new Error("El archivo " + label + " no es válido.");
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
		fetchText("ejemplo.xml"),
		fetchText("estado_resultados.xslt")
	]).then(function (sources) {
		var xml = parseXml(sources[0], "application/xml", "XML");
		var xslt = parseXml(sources[1], "application/xml", "XSLT");
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
