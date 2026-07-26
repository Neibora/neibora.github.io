(function () {
	"use strict";
	var host = document.getElementById("domicilio-host");
	var status = document.getElementById("domicilio-status");
	var xmlDocument;

	function fetchText(url) {
		return fetch(url).then(function (response) {
			if (!response.ok) throw new Error("No se pudo cargar " + url);
			return response.text();
		});
	}

	function parse(text, type) {
		var documentNode = new DOMParser().parseFromString(text, type);
		if (documentNode.querySelector("parsererror")) throw new Error("El archivo no es válido.");
		return documentNode;
	}

	function syncField(field) {
		var node = xmlDocument.querySelector(field.dataset.selector || field.dataset.node);
		if (!node) return;
		if (field.dataset.text) node.textContent = field.value.trim();
		else node.setAttribute(field.dataset.attr, field.value.trim());
	}

	function updateProgress() {
		var required = Array.from(host.querySelectorAll("[required]"));
		var complete = required.filter(function (field) { return field.value.trim(); }).length;
		var percentage = required.length ? Math.round(complete * 100 / required.length) : 100;
		document.getElementById("form-progress").style.width = percentage + "%";
	}

	function validate() {
		var valid = true;
		host.querySelectorAll("[required]").forEach(function (field) {
			var fieldValid = Boolean(field.value.trim()) && field.checkValidity();
			field.classList.toggle("invalid", !fieldValid);
			if (!fieldValid) valid = false;
		});
		if (!valid) host.querySelector(".invalid").focus();
		return valid;
	}

	function serialize() {
		xmlDocument.documentElement.setAttribute("actualizado", new Date().toISOString());
		return '<?xml version="1.0" encoding="UTF-8"?>\n' +
			new XMLSerializer().serializeToString(xmlDocument.documentElement);
	}

	function download() {
		var blob = new Blob([serialize()], { type: "application/xml;charset=utf-8" });
		var link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = "actualizacion_domicilio_ejemplo.xml";
		link.click();
		URL.revokeObjectURL(link.href);
	}

	function initialize() {
		var saveState = document.getElementById("save-state");
		host.querySelectorAll("[data-node], [data-selector]").forEach(function (field) {
			field.addEventListener("input", function () {
				syncField(field);
				field.classList.remove("invalid");
				saveState.textContent = "Cambios pendientes de guardar";
				updateProgress();
			});
		});
		document.getElementById("save-button").addEventListener("click", function () {
			if (!validate()) {
				saveState.textContent = "Completa los campos obligatorios";
				return;
			}
			localStorage.setItem("neibora.actualizacionDomicilio.ejemplo", serialize());
			saveState.textContent = "Cambios guardados en este dispositivo";
		});
		document.getElementById("download-button").addEventListener("click", download);
		updateProgress();
	}

	Promise.all([fetchText("ejemplo.xml"), fetchText("actualizacion_domicilio.xslt")])
		.then(function (sources) {
			var saved = localStorage.getItem("neibora.actualizacionDomicilio.ejemplo");
			var savedDocument = saved ? parse(saved, "application/xml") : null;
			var savedIsCurrent = savedDocument &&
				savedDocument.querySelector("Residentes > Residente") &&
				savedDocument.querySelector("Mascotas");
			xmlDocument = savedIsCurrent ? savedDocument : parse(sources[0], "application/xml");
			var processor = new XSLTProcessor();
			processor.importStylesheet(parse(sources[1], "application/xml"));
			host.appendChild(processor.transformToFragment(xmlDocument, document));
			status.remove();
			initialize();
		})
		.catch(function (error) {
			status.textContent = "No fue posible cargar el módulo: " + error.message;
		});
}());
