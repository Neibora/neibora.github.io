/*
	Loteador — enfoque por ÁREAS (arquitectura por eventos / métodos de <map>)
	--------------------------------------------------------------------------
	- No expone window.loteador: todo se invoca con node.dispatch('loteador:...')
	- Métodos (listeners) del componente <map>:
			• 'loteador:init'                → prepara maphilight + primera coloración + números
			• 'loteador:colorea'             → recorre <area> y pinta según reglas activas
			• 'loteador:mostrarNumerosDeCasa'→ coloca/actualiza labels con @Numero
			• 'loteador:resize'              → reescala coords desde originales y recolorea + relabel
			• 'loteador:iluminar'            → sólo toggle alwaysOn según predicado (sin recolorear colores)
	- Se apoya en: jQuery, jquery.maphilight, xo/xover, helpers select()/single(), toArray(), distinct().
*/

(function () {
	// -------------------- Utilidades --------------------
	function getDesarrolloId() {
		return (xo.site.seed || location.hash || '').replace(/^#/, '').toLowerCase();
	}

	async function getActiveDocs() {
		let store = xo.stores.active;
		await store.ready;
		const dataDoc = store.document;
		const desarrollo_id = getDesarrolloId();
		const settings = xover.sources[`#${desarrollo_id}:settings`];
		await settings.ready;
		const settingsDoc = settings;
		return { dataDoc, settingsDoc, settings };
	}

	function getSettingsPaths(settingsDoc) {
		const filters = settingsDoc.find('filters');
		if (!filters) return {};
		return { bindPath: String(filters.attr('bind') || ''), idAttr: String(filters.attr('id') || 'Id') };
	}

	function parseBinding(binding) {
		const m = String(binding || '').match(/^(.+)?(@[^\]]+?)$/) || ['', '', ''];
		let path = m[1] || '';
		let attr = (m[2] || '').replace(/^@/, '');
		if (path) path = path.replace(/\/$/, '').replace(/\//, '>');
		return { path, attr };
	}

	function getValueFromBinding(itemNode, binding) {
		const { path, attr } = parseBinding(binding);
		if (!attr) return undefined;
		if (path) {
			const nodes = itemNode.select(path) || [];
			const first = nodes[0];
			return first ? first.attr(attr) : undefined;
		}
		return itemNode.attr(attr);
	}

	function buildConditionsFromUI() {
		const root = document.querySelector('#Filtros');
		if (!root) return {};
		const entries = root.querySelectorAll('.filter[bind]').toArray().map(filter => {
			const bind = filter.getAttribute('bind');
			const picked = filter.querySelectorAll('.filter [type="checkbox"]:checked').toArray();
			const map = new Map(picked.map(cb => [cb.getAttribute('value'), cb.previousElementSibling ? cb.previousElementSibling.style.backgroundColor : '']));
			return [bind, map];
		}).filter(([k, v]) => v.size);
		return Object.fromEntries(entries);
	}

	function buildXPathPredicate(conditions) {
		if (conditions === false) return false;
		const andParts = [];
		for (const prop in conditions) {
			const map = conditions[prop];
			const orParts = [];
			const keys = typeof map.keys === 'function' ? map.keys() : Object.keys(map);
			for (const value of keys) {
				if (String(value).includes('~')) {
					const [min, max] = String(value).split('~');
					orParts.push(`${prop}>=${min} and ${prop}<=${max}`);
				}
				else {
					orParts.push(`${prop}="${String(value).replace('"', '&quot;')}"`);
				}
			}
			andParts.push(`[${orParts.join(' or ')}]`);
		}
		return andParts.join('');
	}

	function testItemWithPredicate(itemNode, predicate) {
		if (!itemNode || predicate === false) return false;
		if (!predicate) return true;
		return !!itemNode.selectFirst(`self::*${predicate}`);
	}

	function getActiveFilterAndPalette() {
		const chosen = document.querySelector('[name="filter_headers"]:checked');
		const container = chosen ? chosen.closest('.filter[bind]') : null;
		if (!container) return null;
		const bind = container.getAttribute('bind');
		const palette = new Map(
			container.querySelectorAll('.filter [type="checkbox"]').toArray()
				.filter(cb => cb.previousElementSibling)
				.map(cb => [cb.getAttribute('filtervalue') || cb.getAttribute('value'), cb.previousElementSibling.style.backgroundColor])
		);
		return { bind, palette };
	}

	function cssColorToHex(s) {
		if (!s) return '';
		if (/^#/.test(s)) return s;
		const m = /^rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(s);
		if (!m) return '';
		const r = (+m[1]).toString(16).padStart(2, '0'), g = (+m[2]).toString(16).padStart(2, '0'), b = (+m[3]).toString(16).padStart(2, '0');
		return `#${r}${g}${b}`;
	}

	function setAreaColor(area, options) {
		if (typeof options === 'string') {
			options = { fillColor: options };
		}

		options ??= {};

		const defaults = $(area).data('maphilight') || {};

		const {
			fillColor = '97d933',
			fillOpacity = 0.5,
			strokeColor = 'ffffff',
			alwaysOn = false
		} = {
			...defaults,
			...options
		};

		const data = {
			...defaults,
			fillColor,
			fillOpacity,
			strokeColor,
			alwaysOn
		};
		data.fillColor = data.fillColor.replace(/^0x|^#/i, '');
		$(area)
			.data('maphilight', data)
			.trigger('alwaysOn.maphilight')
			.trigger('fillColor.maphilight');

		area.setAttribute('data-maphilight', JSON.stringify(data));
	}

	function extractAreaId(area, desarrollo_id) {
		const t = area.getAttribute('target') || area.getAttribute('id') || '';
		const pref = `${desarrollo_id}_`;
		return t.startsWith(pref) ? t.slice(pref.length) : t;
	}

	function areaToSvg(areaElement) {
		if (!areaElement || areaElement.tagName !== 'AREA') return document.createElement('svg');
		const nums = (areaElement.getAttribute('coords') || '').split(',').map(Number);
		const pts = [];
		for (let i = 0; i < nums.length; i += 2) pts.push({ x: nums[i], y: nums[i + 1] });
		if (!pts.length) return document.createElement('svg');
		const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
		const minX = Math.min(...xs), minY = Math.min(...ys), maxX = Math.max(...xs), maxY = Math.max(...ys);
		const w = Math.max(1, maxX - minX), h = Math.max(1, maxY - minY);
		const adj = pts.map(p => `${p.x - minX},${p.y - minY}`).join(' ');
		const NS = 'http://www.w3.org/2000/svg';
		const svg = document.createElementNS(NS, 'svg');
		svg.setAttribute('xmlns', NS);
		svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
		svg.setAttribute('width', '100%');
		svg.setAttribute('height', '100%');
		const poly = document.createElementNS(NS, 'polygon');
		poly.setAttribute('points', adj);
		poly.setAttribute('fill', 'currentColor');
		poly.setAttribute('stroke', 'black');
		poly.setAttribute('stroke-width', '2');
		svg.appendChild(poly);
		return svg;
	}

	function destroyMaphilight(img) {
		let map = this
		const areas = map.querySelectorAll('area[data-maphilight]');
		for (const area of areas) {
			area.removeAttribute('data-maphilight')
			$(area).removeData('maphilight')
		}
		if (!img) return
		const wrapper = img.parentElement
		const hasCanvas = wrapper && wrapper.querySelector && wrapper.querySelector('canvas, var')
		const isWrapped = wrapper && wrapper.tagName === 'DIV' && hasCanvas

		// Unbind handlers del mapa actual (si existe)
		const usemap = img.getAttribute('usemap') || ''
		const mapName = usemap.replace(/^#/, '')
		if (mapName) {
			const map = document.querySelector(`map[name="${mapName}"]`)
			if (map) $(map).unbind('.maphilight')
		}

		// Si está “maphilighted” o hay canvas/VML wrapper, lo destruimos completo
		if (img.classList.contains('maphilighted') || isWrapped) {
			try { img.classList.remove('maphilighted') } catch (e) { }

			// El plugin crea canvas/var como hermanos del img dentro del wrapper
			if (wrapper && wrapper.querySelectorAll) {
				wrapper.querySelectorAll('canvas, var').forEach(node => {
					if (node !== img) node.remove()
				})
			}

			// Des-wrap (si el wrapper corresponde al wrapper del plugin)
			if (isWrapped && wrapper.parentNode) {
				wrapper.parentNode.insertBefore(img, wrapper)
				wrapper.remove()
			}
		}
	}
	xo.listener.on(['loteador:init::map'], async function () {
		// 1) maphilight (reset + init)
		const img = this.parentElement && this.parentElement.querySelector('img[usemap]')
		if (img) {
			// Eliminar overlay/labels previos (si quedaron de un map anterior)
			const container = this.parentElement
			if (container) {
				const labels = container.querySelector('.map-labels')
				if (labels) labels.remove()
			}

			// Destruir wrapper/canvas anterior si existe
			destroyMaphilight.call(this, img)

			// Inicializar de nuevo
			$(img).maphilight()

			// Si la imagen aún no carga, re-escala al cargar (evita canvas desplazado)
			if (!img.complete) {
				img.addEventListener('load', () => {
					try {
						this.dispatch('loteador:resize')
					} catch (e) { }
				}, { once: true })
			}
		}

		// 2) Asegurar escala correcta antes del primer pintado
		this.dispatch('loteador:resize')
		await this.dispatch('loteador:mostrarNumerosDeCasa')

		// 3) Construir filtros en #Filtros
		const filtros = document.querySelector('#Filtros')
		if (filtros && typeof filtros.dispatch === 'function') {
			await filtros.dispatch('loteador:buildFilters')
		}

		// 4) Pintar y numerar
		await this.dispatch('loteador:init-scopes')
		await this.dispatch('loteador:colorea')
		await this.dispatch('loteador:init-draggable')
		await this.dispatch('loteador:iluminar')
	})

	xo.listener.on(['loteador:init-draggable::map'], function () {
		const map = this
		const draggableDiv = map.closest('#loteador') || map.parentElement
		if (!draggableDiv) return

		// evitar doble inicialización
		if (draggableDiv.__loteador_draggable_initialized) return
		draggableDiv.__loteador_draggable_initialized = true

		let isDragging = false
		let startX = 0, startY = 0
		let currentX = 0, currentY = 0

		draggableDiv.style.cursor = 'grab'
		draggableDiv.style.willChange = 'transform'

		draggableDiv.addEventListener('mousedown', (e) => {
			// No arrastrar si se está interactuando con el mapa/áreas
			if (e.target && (e.target.tagName === 'AREA' || e.target.closest('map'))) return

			e.preventDefault()
			isDragging = true

			startX = e.clientX - currentX
			startY = e.clientY - currentY

			draggableDiv.style.cursor = 'grabbing'
			requestAnimationFrame(updatePosition)
		})

		document.addEventListener('mousemove', (e) => {
			if (!isDragging) return
			currentX = e.clientX - startX
			currentY = e.clientY - startY
		})

		document.addEventListener('mouseup', () => {
			if (!isDragging) return
			isDragging = false
			draggableDiv.style.cursor = 'grab'
		})

		function updatePosition() {
			if (!isDragging) return
			draggableDiv.style.transform = `translate(${currentX}px, ${currentY}px)`
			requestAnimationFrame(updatePosition)
		}
	})

	xo.listener.on(['loteador:buildFilters::#Filtros'], async function () {

		const root = this.cloneNode(true);
		root.replaceChildren();

		const { dataDoc, settingsDoc } = await getActiveDocs();
		const { bindPath } = getSettingsPaths(settingsDoc);

		const basePalette = (window.color_array && window.color_array.slice()) || [
			'#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
			'#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
			'#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC', '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
			'#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680', '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
			'#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3', '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'
		];

		const filters = settingsDoc.select('//filters/filter');
		let firstRadio;

		for (const filter of filters) {
			const bind = filter.attr('bind');
			const title = filter.attr('title') || bind;
			const id = filter.id || bind.replace(/[\W@]/g, '_');

			const div = document.createElement('div');
			div.className = 'filter col-12 col-sm-6 col-md-4 col-xs-4 col-lg-3 col-xl-2';
			div.setAttribute('bind', bind);
			div.id = id;

			// Header
			const h4 = document.createElement('h4');
			h4.style.cursor = 'pointer';
			const radio = document.createElement('input');
			radio.type = 'radio';
			radio.name = 'filter_headers';
			radio.id = `radio_${id}`;
			const label = document.createElement('label');
			label.setAttribute('for', radio.id);
			label.textContent = title;
			h4.appendChild(radio);
			h4.appendChild(label);
			div.appendChild(h4);
			if (!firstRadio) firstRadio = radio;
			if (filter.attributes.selected) radio.checked = true;
			radio.addEventListener('change', () => {
				const map = document.querySelector('map');
				if (map && typeof map.dispatch === 'function') map.dispatch('loteador:colorea');
			});

			function mutuallyExclusiveClick() {
				let source = event.target;
				let domain = source.closest('.filter,body');
				const forId = source.getAttribute('for');
				let source_checkbox = domain.querySelector(`[id="${forId}"]`);
				if (source_checkbox.checked) return;
				source.closest('.filter').querySelectorAll('[type="checkbox"]:checked').toArray().filter(checkbox => checkbox.closest('.filter') == source.closest('.filter')).forEach(checkbox => checkbox.checked = false)
			}

			function wireOption(chk, text) {
				// Checkbox ⇒ acumulativo
				chk.addEventListener('change', () => {
					if (!document.querySelector('[name="filter_headers"]:checked')) {
						radio.checked = true;
					}
					const map = document.querySelector('map');
					if (map && typeof map.dispatch === 'function') map.dispatch('loteador:colorea');
				});

				const lb = document.createElement('label');
				lb.setAttribute('for', chk.id);
				lb.textContent = text;
				lb.addEventListener('click', mutuallyExclusiveClick);

				return lb;
			}

			// Opciones (declaradas) o derivadas
			const options = filter.select('option');
			let palette = basePalette.slice();

			if (options.length) {
				for (const opt of options) {
					const value = opt.attr('value');
					const text = opt.innerHTML || opt.attr('text') || value;
					const color = opt.attr('color') || palette.pop();
					const selected = opt.attr('selected') === 'true' || opt.attr('selected') === 'selected';

					const span = document.createElement('span');
					span.className = 'filter_option';
					const sw = document.createElement('span');
					sw.style.backgroundColor = color;
					sw.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
					const chk = document.createElement('input');
					chk.type = 'checkbox';
					chk.id = `${id}_${value}`;
					chk.name = id;
					chk.value = value;
					chk.setAttribute('filterValue', value);
					if (selected) chk.checked = true;

					const lb = wireOption(chk, text);
					const br = document.createElement('br');

					span.appendChild(sw);
					span.appendChild(document.createTextNode(' '));
					span.appendChild(chk);
					span.appendChild(lb);
					span.appendChild(br);
					div.applyAttributes(filter.attributes)
					div.appendChild(span);
				}
			} else {
				// Deriva valores desde datos para bind tipo path@Attr
				const items = dataDoc.select(bindPath) || [];
				const vals = items.map(n => getValueFromBinding(n, bind))
					.filter(v => v !== undefined && v !== null && String(v).length)
					.distinct();

				for (const value of vals) {
					const color = palette.pop();
					const text = String(value);

					const span = document.createElement('span');
					span.className = 'filter_option';
					const sw = document.createElement('span');
					sw.style.backgroundColor = color;
					sw.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
					const chk = document.createElement('input');
					chk.type = 'checkbox';
					chk.id = `${id}_${value}`;
					chk.name = id;
					chk.value = value;
					chk.setAttribute('filterValue', value);

					const lb = wireOption(chk, text);
					const br = document.createElement('br');

					span.appendChild(sw);
					span.appendChild(document.createTextNode(' '));
					span.appendChild(chk);
					span.appendChild(lb);
					span.appendChild(br);
					div.appendChild(span);
				}
			}

			root.appendChild(div);
		}

		await xover.dom.combine(this, root)

		const selected_radio = this.querySelector(`#Filtros:not(:has(:checked)) div.filter[xo-source="${xo.site.active}"] input[type="radio"]`);

		if (selected_radio) {
			selected_radio.checked = true;
		}
	});

	// Scopes
	xo.listener.on(['loteador:init-scopes'], async function () {
		const { dataDoc, settingsDoc } = await getActiveDocs();
		const desarrollo_id = getDesarrolloId();
		const map = this;
		const { bindPath = '', idAttr = 'id' } = getSettingsPaths(settingsDoc);

		for (const area of map.querySelectorAll('area')) {
			const id = extractAreaId(area, desarrollo_id);

			const scope = id
				? dataDoc.single(`${bindPath}[@${idAttr}="${id}"]`)
				: null;

			Object.defineProperty(area, "scope", {
				value: scope,
				writable: true,
				configurable: true,
				enumerable: true
			});
		}
	});

	async function colorea_area({
		scope = this.scope,
		predicate,
		active = getActiveFilterAndPalette(),
		fillColor,
		fillOpacity,
		strokeColor,
		alwaysOn
	} = {}) {

		const area = this;

		const match = testItemWithPredicate(scope, predicate);

		const defaults = {};

		if (!scope) {
			defaults.fillColor = '000000'
			defaults.fillOpacity = 0.5
			defaults.strokeColor = 'ff0000'
		} else if (active) {
			const value = getValueFromBinding(scope, active.bind);
			const css = active.palette.get(value) || '';
			defaults.fillColor = match ? cssColorToHex(css) : '';
			defaults.fillOpacity = 0.5
		}

		const data = {
			...defaults
		};

		if (fillColor !== undefined) data.fillColor = fillColor;
		if (fillOpacity !== undefined) data.fillOpacity = fillOpacity;
		if (strokeColor !== undefined) data.strokeColor = strokeColor;
		if (alwaysOn !== undefined) data.alwaysOn = alwaysOn;

		setAreaColor(area, data);
	}
	xo.listener.on(['loteador:colorea::area'], colorea_area);

	xo.listener.on(['loteador:colorea::map'], async function () {
		const { dataDoc } = await getActiveDocs();

		const loteador = this.closest("#loteador");
		if (!loteador) return;

		loteador.tag = dataDoc.store.tag;

		const conditions = buildConditionsFromUI();
		const predicate = buildXPathPredicate(conditions);
		const active = getActiveFilterAndPalette();

		for (const area of this.querySelectorAll('area')) {
			area.dispatch('loteador:colorea', {
				predicate,
				active
			});
		}

		$(this).trigger('alwaysOn.maphilight');
	});

	// Mostrar/actualizar números (@Numero)
	// Mostrar/actualizar números (@Numero)
	xo.listener.on(['loteador:mostrarNumerosDeCasa::map'], async function () {
		const map = this;
		const container = map.parentElement;
		if (!container) return;

		// Wrapper para overlays (labels). Evita ensuciar el contenedor padre.
		if (getComputedStyle(container).position === 'static') container.style.position = 'relative';
		let wrapper = container.querySelector('.map-labels');
		if (!wrapper) {
			wrapper = document.createElement('div');
			wrapper.className = 'map-labels';
			Object.assign(wrapper.style, {
				position: 'absolute',
				left: '0',
				top: '0',
				right: '0',
				bottom: '0',
				pointerEvents: 'none'
			});
			container.appendChild(wrapper);
		}
		wrapper.querySelectorAll('.numero-casa').forEach(e => e.remove());

		const { dataDoc, settingsDoc } = await getActiveDocs();
		const { bindPath = '', idAttr = 'id' } = getSettingsPaths(settingsDoc);
		const desarrollo_id = getDesarrolloId();
		const items = dataDoc.querySelectorAll(`${bindPath.split('/').join('>')}[Numero]`);

		for (const item of items) {
			const id = item.getAttribute(idAttr), numero = item.getAttribute('Numero');
			if (!id || !numero) continue;

			const area_selector = `area[target="${desarrollo_id}_${id}"], area[target="${id}"]`;
			const area = map.querySelector(area_selector) || document.querySelector(area_selector);
			if (!area) continue;

			const coords = (area.coords || '').split(',').map(Number);
			if (!coords.length) continue;

			const xs = coords.filter((_, i) => i % 2 === 0), ys = coords.filter((_, i) => i % 2 === 1);
			const x = xs.reduce((a, b) => a + b, 0) / xs.length;
			const y = ys.reduce((a, b) => a + b, 0) / ys.length;

			const label = document.createElement('div');
			label.className = 'numero-casa';
			label.textContent = numero;
			Object.assign(label.style, {
				position: 'absolute',
				left: `${x}px`,
				top: `${y}px`,
				transform: 'translate(-50%, -50%)',
				fontWeight: 'bold',
				color: 'black',
				fontSize: '.8rem',
				pointerEvents: 'none',
				textShadow: '0 1px 2px rgba(255,255,255,.8)'
			});

			wrapper.appendChild(label);
		}
	});

	xo.listener.on(['loteador:iluminar::area'], async function (enable = true) {
		const area = this;
		const map = this.closest("map");
		let data = $(area).mouseout().data('maphilight') || {};
		data.alwaysOn = !!enable;
		$(map).trigger('alwaysOn.maphilight');
	})

	// Iluminar (toggle only)
	xo.listener.on(['loteador:iluminar::map'], async function (conditions) {
		const map = this;
		const { dataDoc, settingsDoc } = await getActiveDocs();
		const { bindPath, idAttr } = getSettingsPaths(settingsDoc);
		const desarrollo_id = getDesarrolloId();

		const predicate = buildXPathPredicate(conditions);
		for (const area of map.querySelectorAll('area')) {
			const lotId = extractAreaId(area, desarrollo_id);
			if (!lotId) continue;
			const item = dataDoc.single(`${bindPath}[@${idAttr}="${lotId}"]`);
			let data = $(area).mouseout().data('maphilight') || {};
			data.alwaysOn = !!testItemWithPredicate(item, predicate);
			$(area).data('maphilight', data);
		}
		$(map).trigger('alwaysOn.maphilight');
	});

	// Resize (reescala desde coord originales y recolorea + relabel)
	xo.listener.on(['loteador:resize::map'], async function () {
		const map = this;
		const img = map.parentElement && map.parentElement.querySelector('img[usemap]');
		if (!img) return;
		const baseWidth = Number(img.getAttribute('orgwidth')) || img.naturalWidth || img.clientWidth;
		const x = img.clientWidth / baseWidth;
		const areas = map.querySelectorAll('area');
		for (const area of areas) {
			const original = area.getAttribute('data-original-coords') || area.coords;
			const nums = original.split(',');
			if (!area.hasAttribute('data-original-coords')) area.setAttribute('data-original-coords', original);
			const scaled = new Array(nums.length);
			for (let i = 0; i < nums.length; i++) {
				scaled[i] = +nums[i] * x;
			}
			area.coords = scaled.join(',');
		}
		// tras reescalar, recolorea y reubica números
		await map.dispatch('loteador:init-scopes')
		await map.dispatch('loteador:colorea');
		await map.dispatch('loteador:mostrarNumerosDeCasa');
	});

	xo.listener.on(['click::#Filtros input[type="radio"]'], function () {
		let store = this.store;
		if (store != xo.stores.active) {
			let map = this.ownerDocument.querySelector("map");
			const loteador = map.closest("#loteador");
			loteador.tag = store.tag;
			xo.stores.active = store;
		}
	});
	xo.listener.on(['click::#Filtros input[type="checkbox"]'], function () {
		const map = document.querySelector('map');
		if (map && typeof map.dispatch === 'function') map.dispatch('loteador:colorea');
	});
	xo.listener.on(['change::#Filtros input[name="filter_headers"]'], function () {
		const map = document.querySelector('map');
		if (map && typeof map.dispatch === 'function') map.dispatch('loteador:colorea');
	});
	xo.listener.on(['change::#state:desarrollo'], function ({ value }) {
		const map = document.querySelector('map')
		const loteador = map.closest("#loteador")
		loteador.setAttribute("xo-stylesheet", `../assets/desarrollos/${value}/loteador.xslt`)
		xo.site.seed = `#${value}`

		// Re-init cuando el nuevo map ya esté renderizado
		requestAnimationFrame(() => {
			const newMap = document.querySelector('map')
			if (newMap && typeof newMap.dispatch === 'function') newMap.dispatch('loteador:init')
		})
	})
	xo.listener.on(['pageshow', 'popstate'], function () {
		let value = xo.site.seed.replace(/^#/, '')
		xo.state.desarrollo = value
		const map = document.querySelector('map')
		const loteador = map.closest("#loteador")
		loteador.setAttribute("xo-stylesheet", `../assets/desarrollos/${value}/loteador.xslt`)

		// Re-init cuando el nuevo map ya esté renderizado
		requestAnimationFrame(() => {
			const newMap = document.querySelector('map')
			if (newMap && typeof newMap.dispatch === 'function') newMap.dispatch('loteador:init')
		})
	})
	async function click_area(e) {
		const area = this;
		const map = area.closest('map');
		const scope = area.scope;
		map.selectedAreas ??= new Map();
		try {
			const desarrollo_id = getDesarrolloId();
			const raw = area.getAttribute('id') || area.getAttribute('target') || '';
			const id = raw.replace(new RegExp(`^${desarrollo_id}_`, 'i'), '');

			const selection = map.selectedAreas;

			const multi = e.ctrlKey || e.metaKey;
			//await map.dispatch('loteador:colorea');
			if (selection.has(id)) {
				selection.delete(id);
				area.dispatch('loteador:colorea'); //restaurar colores
				area.dispatch('loteador:iluminar', false);
			} else {
				const selected = [...map.querySelectorAll('area')].filter(area => $(area).data('maphilight')?.alwaysOn);
				if (!multi) {
					selection.clear();
				}
				if (!selection.size) {
					for (let area of selected) {
						area.dispatch('loteador:colorea'); //restaurar colores
						area.dispatch('loteador:iluminar', false);
					}
				}
				selection.set(id, area);
				area.dispatch('loteador:colorea', { fillOpacity: scope ? .7 : undefined });
				area.dispatch('loteador:iluminar');
			}

			const { dataDoc, settings } = await getActiveDocs();
			const { bindPath, idAttr } = getSettingsPaths(settings);

			//for (const [selectedId, selectedArea] of [...selection]) {
			//	await selectedArea.dispatch('loteador:colorea', {fillOpacity: .7});
			//	await selectedArea.dispatch('loteador:iluminar');
			//}

			// Panel lateral
			const flipper = document.querySelector('.card-flipper');
			let templates = new Map()
			let sections = flipper.queryChildrenAll("[id]");
			for (let section of sections) {
				let template = settings.querySelector(`template#${section.id}`) || settings.querySelector(`template#${section.id.toLowerCase()}`);
				template && templates.set(section, template)

			}
			let template = selection.size == 1 ? settings.querySelector('template#detalles') : settings.querySelector('template#multiselection');
			const detalles = document.querySelector('#Detalles');
			if (selection.size === 1 && template) {
				const [selectedId, area] = [...selection][0];
				const scope = area.scope;

				if (![Node.ELEMENT_NODE].includes(scope && scope.nodeType)) return false;
				template = template.dispatch("loteador:fillCard", { scope, settings }) || template;

				const area_selector = `area[target="${desarrollo_id}_${id}"], area[target="${id}"]`;
				const selectedArea = map.querySelector(area_selector);
				const svg = areaToSvg(selectedArea);
				const img = template.querySelector('img');
				if (img) img.replaceWith(svg);

				if (detalles) {
					detalles.setAttribute('xo-source', 'active');
					const xoId = scope.getAttribute('xo:id') || '';
					if (xoId) detalles.setAttribute('xo-scope', xoId);
					detalles.replaceChildren(...template.childNodes);
				}
				flipper?.classList.add('toggled');
			} else if (selection.size > 1 && template) {
				template = template.dispatch("loteador:fillCard", { selection, settings }) || template;
				if (detalles) {
					//detalles.setAttribute('xo-source', 'active');
					//const xoId = scope.getAttribute('xo:id') || '';
					//if (xoId) detalles.setAttribute('xo-scope', xoId);
					detalles.replaceChildren(...template.childNodes);
				}
				flipper?.classList.add('toggled');
			} else {
				flipper?.classList.remove('toggled');
			}
			return false;
		} catch (e) {
			return Promise.reject(e)
		} finally {
			if (!map.selectedAreas.size) {
				await map.dispatch("loteador:colorea")
				await map.dispatch('loteador:iluminar');
			}
			e.preventDefault();
			e.stopImmediatePropagation();
		}
	}
	xover.listener.on('click::area', click_area);

	// Resize global → cada <map> reescala y repinta (debounce interno del navegador)
	window.addEventListener('resize', function () {
		document.querySelectorAll('map').forEach(map => {
			if (typeof map.dispatch === 'function') map.dispatch('loteador:resize');
		});
	}, { passive: true });
})();

xo.listener.on(['loteador:fillCard::.money'], function ({ value }) {
	if (value === "") return;
	const n = Number(
		String(value ?? '')
			.replace(/[$,\s]/g, '')
	);

	if (!isNaN(n)) {
		this.textContent = n.toLocaleString('es-MX', {
			style: 'currency',
			currency: 'MXN'
		});

		this.classList.toggle('negative', n < 0);
	}
})

xo.listener.on(['loteador:fillCard'], function ({ value }) {
	let self = this;
	if (self instanceof HTMLInputElement) self.value = value;
	else self.textContent = value;
})

xo.listener.on(['loteador:fillCard::#cantidad'], function ({ selection }) {
	this.textContent = selection.size
	event.stopImmediatePropagation()
})

xo.listener.on(['loteador:fillCard::#selection-list'], function ({ selection }) {
	Object.defineProperty(this, "scope", {
		value: selection,
		writable: true,
		configurable: true,
		enumerable: true
	});
	for (const [index, item] of [...selection.values()].entries()) {
		const scope = item.scope || document.createElement('p');
		const li = document.createElement('li');
		li.setAttribute("id", scope.getAttribute("Id"));
		li.textContent = `${scope.getAttribute("Calle") || item.id || 'Elemento'} ${scope.getAttribute("Numero") || index + 1}`;
		Object.defineProperty(li, "scope", {
			value: item,
			writable: true,
			configurable: true,
			enumerable: true
		});
		this.appendChild(li)
	}
	event.stopImmediatePropagation()
})

xo.listener.on(['loteador:fillCard::template'], function (args) {
	template = this.content.cloneNode(true);
	for (let input of template.querySelectorAll('[id]:not([name])')) {
		const k = input.id;
		const { scope = document.createElement('p'), selection, settings, template } = args;
		const attr = scope.nodeType ? (scope.attributes[k] || [...scope.attributes].find(a => a.localName.toLowerCase() === k.toLowerCase()) || { value: '' }) : null;
		input.dispatch("loteador:fillCard", { selection, settings, template, attr, value: (attr || {}).value })
	}
	event.stopImmediatePropagation()
	return template
})

class SortableList extends HTMLUListElement {
	connectedCallback() {
		this.init();
	}

	init() {
		let ul = this;
		let dragged;
		let selection = ul.scope || ul.closest(":has(map)")?.querySelector("map")?.selectedAreas;

		for (const li of ul.children) {
			li.draggable = true;

			li.addEventListener('dragstart', () => {
				dragged = li;
				li.classList.add('dragging');
			});

			li.addEventListener('dragend', () => {
				li.classList.remove('dragging');
				dragged = null;

				let ordered = [...ul.children].map(li => [li.id, selection.get(li.id)]);

				selection.clear();
				for (const [id, area] of ordered) {
					selection.set(id, area);
				}
			});

			li.addEventListener('dragover', e => {
				e.preventDefault();

				const rect = li.getBoundingClientRect();
				const before = e.clientY < rect.top + rect.height / 2;

				if (before)
					ul.insertBefore(dragged, li);
				else
					ul.insertBefore(dragged, li.nextSibling);
			});
		}
	}
}

customElements.define('sortable-list', SortableList, { extends: 'ul' });