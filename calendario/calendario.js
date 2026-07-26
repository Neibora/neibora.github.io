(function () {
	"use strict";

	var host = document.getElementById("calendar-host");
	var status = document.getElementById("calendar-status");

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

	var source = location.hash === "#ejemplo" ? "ejemplo.xml" : "calendario.xml";
	Promise.all([fetchText(source), fetchText("calendario.xslt")])
		.then(function (sources) {
			var processor = new XSLTProcessor();
			processor.importStylesheet(parse(sources[1], "El XSLT"));
			var fragment = processor.transformToFragment(parse(sources[0], "El XML"), document);
			status.remove();
			host.appendChild(fragment);
			activateScripts(host);
		})
		.catch(function (error) {
			status.classList.add("error");
			status.innerHTML = '<div><span class="material-icons">error_outline</span>No fue posible cargar el calendario.<br><small></small></div>';
			status.querySelector("small").textContent = error.message;
		});
}());
