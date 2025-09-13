// Función para generar colores complementarios
function generateComplementaryColors(baseColor, numColors) {
    // Convertir el color base a formato RGB
    const rgbBaseColor = hexToRgb(baseColor);

    // Verificar si el color base es válido
    if (!rgbBaseColor) {
        console.error("El formato del color base no es válido.");
        return [];
    }

    // Calcular el ángulo de separación para los colores complementarios
    const separationAngle = 360 / numColors;

    // Array para almacenar los colores generados
    const colors = [];

    // Generar los colores complementarios
    for (let i = 0; i < numColors; i++) {
        // Calcular el ángulo para el color actual
        const angle = separationAngle * i;

        // Calcular el color complementario para el ángulo actual
        const complementaryColor = calculateComplementaryColor(rgbBaseColor, angle);

        // Convertir el color complementario a formato hexadecimal
        const hexColor = rgbToHex(complementaryColor);

        // Agregar el color a la lista
        colors.push(hexColor);
    }

    return colors;
}


// Función para convertir un color hexadecimal a RGB
function hexToRgb(hexColor) {
    const shorthandRegex = /^#?([a-f\d]{1,2})([a-f\d]{1,2})([a-f\d]{1,2})$/i;
    const result = shorthandRegex.exec(hexColor);
    if (result) {
        return {
            r: parseInt(result[1].length === 1 ? result[1] + result[1] : result[1], 16),
            g: parseInt(result[2].length === 1 ? result[2] + result[2] : result[2], 16),
            b: parseInt(result[3].length === 1 ? result[3] + result[3] : result[3], 16)
        };
    }
    return null;
}

// Función para calcular un color complementario dado un color base y un ángulo
function calculateComplementaryColor(baseColor, angle) {
    // Convertir el ángulo a radianes
    const radians = (angle * Math.PI) / 180;

    // Calcular las componentes RGB del color complementario
    const r = 255 - baseColor.r;
    const g = 255 - baseColor.g;
    const b = 255 - baseColor.b;

    // Aplicar el ángulo para obtener una versión más clara u oscura del color complementario
    const delta = Math.round(Math.cos(radians) * 128);
    const complementColor = {
        r: clamp(r + delta),
        g: clamp(g + delta),
        b: clamp(b + delta)
    };

    return complementColor;
}

// Función para asegurarse de que un valor RGB está dentro del rango válido (0-255)
function clamp(value) {
    return Math.min(Math.max(value, 0), 255);
}

// Función para convertir un color RGB a hexadecimal
function rgbToHex(rgbColor) {
    const { r, g, b } = rgbColor;
    return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

// Función para convertir un componente RGB a su representación hexadecimal
function componentToHex(component) {
    const hex = component.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

// Ejemplo de uso
var baseColor = "#FF0000"; // Color base en formato hexadecimal (rojo)
var numColors = 2; // Número de colores complementarios a generar

var color_array = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
    '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
    '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
    '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
    '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
    '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
    '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
    '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
    '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
    '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF']/*generateComplementaryColors(baseColor, numColors);*/

var filters = {}
var attributes, attribute_pattern, value_attribute, text_attribute, oSource; //Definimos a este nivel para que sean accesibles dentro de las funciones jquery
async function actualizaColores(oSource) {
    function rgbToHex(rgb) {
        if (!rgb) return undefined;
        // Get the RGB values by extracting the numbers
        const rgbValues = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

        // Convert each RGB value to hexadecimal
        const r = parseInt(rgbValues[1]).toString(16).padStart(2, '0');
        const g = parseInt(rgbValues[2]).toString(16).padStart(2, '0');
        const b = parseInt(rgbValues[3]).toString(16).padStart(2, '0');

        // Return the hexadecimal color
        return `#${r}${g}${b}`;
    }

    let xmlData = xo.stores.active;
    await xmlData.ready;
    xmlData = xmlData.document;

    let desarrollo_id = xo.state.desarrollo || xo.site.seed.replace(/^#/, '').toLowerCase();
    let xmlFilters = xover.sources[`#${desarrollo_id}:settings`];
    await xmlFilters.ready;
    let sFilters_bind = `${xmlFilters.find('filters').attr('bind')}`;
    let sElement_id = xmlFilters.find('filters').attr('id');
    attributes = {};
    attribute_pattern = undefined;
    value_attribute = undefined;
    text_attribute = undefined;
    let bind;
    //first = $(xmlData).find('filters').select('filter').first().attr("bind");

    let filter = xmlFilters.select('//filters/filter').filter(function (filter) {
        bind = $(oSource).closest('div.filter').attr("bind");
        return filter.attr("bind") == bind || bind === undefined && $(this).find('option').length > 0
    }).pop();

    filter = (filter || xmlFilters.selectFirst('//filters/filter'));
    attributes["value"] = (attributes["value"] || filter.attr('bind'));
    attributes["text"] = (attributes["text"] || filter.attr('bind_text') || attributes["value"]);
    //attribute_pattern = "{{@value}}"
    //if (filter.select('option').length > 0) {
    //    attribute_pattern = "{{@text}}::{{@value}}"
    //    //if ($("#Filtros #" + attributes["value"].replace(/[\W@]/ig, '_') + " :checkbox:checked").length > 0) first = attributes["value"];
    //}
    //attribute_pattern = eval("'" + attribute_pattern.replace(/\{\{\@([^\}]+)\}\}/ig, '{{\'+attributes["$1"]+\'}}') + "'");

    //$(xmlData).find('filters').select('filter[bind="' + first + '"]').select('option').each(function () {
    //    filters[filter.attr("value")] = filter.attr("color") //.replace(/\s+/gi, "-")
    //})
    let binding = String(attributes["value"]).match(/^(.+)?(@[^\]]+?)$/);
    let path = binding[1];
    let attribute = binding[2];
    if (path) path = String(path).replace(/\/$/, '').replace(/\//, '>');
    attribute = attribute.replace(/^@/, '');
    [document.querySelector(`[name="filter_headers"]:checked`)].filter(el => el).map(radio => radio.closest(`.filter[bind]`)).pop()
    let active_filter = [document.querySelector(`[name="filter_headers"]:checked`)].filter(el => el).map(radio => radio.closest(`.filter[bind]`)).pop() || oSource && oSource.closest('.filter[bind]');// || [document.querySelector(`.filter[bind]`)].concat(document.querySelectorAll('[type="checkbox"]:checked').toArray().map(checkbox => checkbox.closest('.filter[bind]'))).concat([document.querySelector(`.filter[bind]`)]).filter(filter => !oSource).distinct().pop();
    if (!active_filter && oSource && oSource.closest('.filter[bind]')) {
        active_filter = oSource.closest('.filter[bind]');

    }
    let color_list = active_filter && Object.fromEntries([[active_filter].map(filter => [filter.getAttribute("bind"), new Map(filter.querySelectorAll(`.filter [type="checkbox"]`).toArray().filter(checkbox => checkbox.previousElementSibling).map(checkbox => [checkbox.getAttribute("filtervalue"), checkbox.previousElementSibling.style.backgroundColor]))]).filter(([key, values]) => values.size)[0]]);
    if (!color_list) return;
    for (let element of xmlData.select(sFilters_bind)) {
        let oLote = document.querySelector(`area[target="${desarrollo_id}_${element.attr(sElement_id)}"],area[target="${element.attr(sElement_id)}"]`)
        if (oLote) {
            let color = Object.entries(color_list).map(([selector, options]) => [...options].find((test) => testConditions(element, Object.fromEntries([[selector, new Map([test])]]))) || []).filter(el => el).map(([, value]) => value).pop();
            //let color = Object.entries(color_list).map(([selector, options]) => [attributes.find(attr => attr.matches(selector)), options]).map(([attr, options]) => options.get(attr.value)).pop();
            coloreaLote(oLote, rgbToHex(color));
        }
    };
}

function coloreaLote(oLote, color = '') {
    let data = $(oLote).data('maphilight') || {};
    //data.alwaysOn = false;
    data.fillColor = color && color.replace(/^0x|^#/ig, "") || "000000";
    data.fillOpacity = color ? 0.5 : 0.2;
    data.strokeColor = "ffffff";
    $(this).data('maphilight', data).trigger('alwaysOn.maphilight');
    $(this).data('maphilight', data).trigger('fillColor.maphilight');

    $(oLote).attr("data-maphilight", '{"fillColor":"' + color.replace(/^0x/ig, "") + '","fillOpacity":0.5,"strokeColor":"ffffff"}');
}

function renderFilterOption(filter, values, target) {
    if (typeof values == 'object' && values.length) {
        for (let i = 0; i < nodes.length; ++i) {
            let value = nodes[i];
            renderFilterOption(filter, value, target);
        }
    } else if (typeof values == 'object' && values["_type"] == "attribute") {
        let filter_name = filter.attr("bind").replace(/[\W@]/ig, '_');
        /*renderFilterOption(filter, values["text"]);*/
        //let attribute_pattern = "{{@value}}"
        //if (filter.selectFirst('option')) {
        //    attribute_pattern = "{{@text}}::{{@value}}"
        //if ($("#Filtros #" + attributes["value"].replace(/[\W@]/ig, '_') + " :checkbox:checked").length > 0) first = attributes["value"];
        //}
        //let filter_value = eval("'" + attribute_pattern.replace(/\{\{\@([^\}]+)\}\}/ig, '\'+values["$1"]+\'') + "'");
        let checkbox = xo.xml.createFragment(renderOption(filter_name, (filter.id + '_' + values.text + '__' + (values.value || '')), values.value, values.text, values.value, values.color, values.selected));
        target.append(checkbox);
    } else if (typeof values == 'object') {
        for (let value in values) {
            renderFilterOption(filter, values[value], target);
        }
    } else {
        let filter_name = filter.attr("bind").replace(/[\W@]/ig, '_');
        let txtCheckbox = `<input id="${values}" value="${values}" onclick='Colorea(this);' type="checkbox" class="${filter_name}" name="${filter_name}">${values}<br>`;
        $("<span class='filter_option'></span>").html(txtCheckbox).appendTo("#Filtros #" + filter_name);
    }
}

function fillTree(tree, path, value, text, color, selected) {
    path = String(path).match(/^([^\/]+)(\/.+)?$/);
    let partial_path = String(path[1] || '');
    let new_path = String(path[2] || '').replace(/^\//, '');
    if (!tree.hasOwnProperty(partial_path)) { tree[partial_path] = {}; }
    if (String(partial_path).match(/^@/)) {
        let attr_name = (text !== undefined ? text + "::" + value : value)
        tree[partial_path][attr_name] = {}
        tree[partial_path][attr_name]["_type"] = "attribute";
        tree[partial_path][attr_name]["color"] = color;
        tree[partial_path][attr_name]["value"] = value;
        tree[partial_path][attr_name]["text"] = text;
        tree[partial_path][attr_name]["selected"] = selected;
        ////tree[partial_path][text] = value;
        return tree[partial_path][text];
    }
    if (new_path) {
        return fillTree(tree[partial_path], new_path, value, text, color, selected);
    }
}


function fillOptions(txtNombreFiltro, tree, oNode, full_path, full_text_path, text, color) {
    let path = String(full_path).match(/^([^\/]+)(\/.+)?$/);
    let partial_path = String(path[1] || '');
    let new_path = String(path[2] || '').replace(/^\//, '');
    let text_path, partial_text_path, new_text_path
    if (full_text_path) {
        let text_path = String(full_text_path).match(/^([^\/]+)(\/.+)?$/);
        let partial_text_path = String(text_path[1] || '');
        let new_text_path = String(text_path[2] || '').replace(/^\//, '');
        if (partial_text_path != partial_path) {
            text = String(getValueFromTree($(oNode), full_text_path) || "")
            new_text_path = undefined;
        }
    }

    if (!tree.hasOwnProperty(partial_path)) {
        tree[partial_path] = {};
    }
    if (partial_path.match(/^@/)) {
        $(oNode).attr(partial_path.replace(/^@/, ''));
        let value = String(getValueFromTree($(oNode), partial_path) || "undefined")//$(oNode).attr(partial_path.replace(/^@/, ''));
        if (!tree[partial_path].hasOwnProperty(value)) {
            color = (color !== undefined ? color : color_array.shift()); //Permite nulos para indicar que no lleva color
            tree[partial_path][value] = {}
            tree[partial_path][value]["_type"] = "attribute";
            tree[partial_path][value]["color"] = color;
            tree[partial_path][value]["value"] = value;
            tree[partial_path][value]["text"] = (text || value || "Sin definir");
            //renderOption(txtNombreFiltro, value, value, value);
        }
    } else {
        $(oNode).select(partial_path).each(function () {
            fillOptions(txtNombreFiltro, tree[partial_path], this, new_path, new_text_path, text, color);
        })
    }
}

function getValueObjectFromTree(oNode, full_path) {
    let xmlTree = oNode;
    let binding = full_path.match(/^(.+)?(@[^\]]+?)$/);
    let path = binding[1];
    let attribute = binding[2];
    attribute = attribute.replace(/^@/, '');

    let values = {};
    if (path) {
        path = String(path).replace(/\/$/, '').replace(/\//, '>'); /*Primer replace quita última diagonal*//*Segundo replace cambia diagonales por "mayor que" para buscarlo como selector*/
        $(xmlTree).find(path).each(function () {
            let oNode = $(this);
            let val = oNode.attr(attribute);
            values[val] = val;
        })
    } else {
        let val = oNode.attr(attribute);
        values[val] = val;
    }
    return values;

}

function getValueFromTree(oNode, full_path) {
    let xmlTree = oNode;
    let binding = full_path.match(/^(.+)?(@[^\]]+?)$/);
    let path = binding[1];
    let attribute = binding[2];
    attribute = attribute.replace(/^@/, '');

    let values = [];
    if (path) {
        path = String(path).replace(/\/$/, '').replace(/\//, '>'); /*Primer replace quita última diagonal*//*Segundo replace cambia diagonales por "mayor que" para buscarlo como selector*/
        $(xmlTree).find(path).each(function () {
            let element = $(this);
            values.push(element.attr(attribute));
        })
    } else {
        values.push(oNode.attr(attribute));
    }
    return values;
}

function renderOption(filter_name, id, value, text, filter_value, color, selected) {
    let txtCheckbox = `<span class="filter_option">${(color ? "<span style='background-color: #" + color.replace(/^0x|^#/i, '') + "'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span> " : "")} <input id="${id}" value="${(value || '').replace(/'/gi, "\\'")}" filterValue="${filter_value || value}" onclick="Colorea(this);"  type="checkbox" ${selected == 'true' ? 'checked="true"' : ''} class="${filter_name}" name="${filter_name}"/><label for="${id}" onclick="mutuallyExclusiveClick(); Colorea(this.previousSibling, true);">${text || value}</label><br/></span>`;
    return txtCheckbox;
}

function getValueFromObject(oNode, path) {
    path = String(path).match(/^([^\/]+)(\/.+)?$/);
    let partial_path = String(path[1] || '');
    let new_path = String(path[2] || '').replace(/^\//, '');

    if (!oNode.hasOwnProperty(partial_path)) return undefined;
    if (partial_path.match(/^@/)) {
        value = oNode[partial_path];
        return value;
    } else {
        value = getValueFromObject(oNode[partial_path], new_path);
    }
    return value;
}

function buildConditions(conditions) {
    let compliesOverall = true;
    let and_array = [];
    for (let property in conditions) {
        let or_array = [];
        let entries = typeof (conditions[property].keys) == 'function' ? conditions[property].keys() : Object.keys(conditions[property]);
        for (let value of entries) {
            if (value.indexOf(`~`) != -1) {
                let [min, max] = value.split("~");
                or_array.push(`${property}>=${min} and ${property}<=${max}`);
            } else {
                or_array.push(`${property}="${value.replace('"', '&quot;')}"`);
            }
        }
        and_array.push(`[${or_array.join(' or ')}]`)
    }
    return and_array.join('');
}

function testConditions(oNode, conditions) {
    if (typeof (conditions) != "string") {
        conditions = buildConditions(conditions);
    }
    let complies = !!oNode.selectFirst(`self::*${conditions}`)
    return complies;
}

async function Colorea(oSource) {
    let xmlData = xo.stores[xo.site.seed || location.hash];
    try {
        if (!xmlData.documentElement) await xmlData.fetch();
    } catch (e) {
        console.error(e)
        return;
    }
    xmlData = xmlData.document;

    let desarrollo_id = xo.site.seed.replace(/^#/, '').toLowerCase();
    let xmlFilters = xover.sources[`#${desarrollo_id}:settings`];
    if (!xmlFilters.documentElement) await xmlFilters.fetch();
    if (oSource instanceof HTMLAreaElement) {
        coloreaLote(oSource, '#ffffff')
    }
    if (oSource && oSource.closest(`.filter`) && !oSource.closest("#Filtros,body").querySelector(`[name="filter_headers"]:checked`)) {
        oSource.closest(`.filter`).querySelector(`[name="filter_headers"]`).checked = true;
    }
    let conditions = Object.fromEntries(document.querySelector(`#Filtros`).querySelectorAll(`.filter[bind]`).toArray().map(filter => [filter.getAttribute("bind"), new Map(filter.querySelectorAll(`.filter [type="checkbox"]:checked`).toArray().map(checkbox => [checkbox.getAttribute("value"), checkbox.previousElementSibling ? checkbox.previousElementSibling.style.backgroundColor : '']))]).filter(([key, values]) => values.size))
    //for (let filter of xmlFilters.select(`//filters/filter`)) {
    //    let bind = filter.attr('bind');

    //    //if (bind.match(/^@/)) {
    //    let sBind = bind.replace(/[\W@]/ig, '_');
    //    for (let selection of [...document.querySelectorAll(`#Filtros #${sBind} input[type=checkbox]:checked`)]) {
    //        fillTree(conditions, bind, selection.value);
    //    }
    //}
    actualizaColores(oSource);
    iluminarMapa(conditions);
}

function mutuallyExclusiveClick() {
    let source = event.srcElement;
    let domain = source.closest('.filter,body');
    let source_checkbox = domain.querySelector(`[id="${source.attributes["for"]}"]`);
    if (source_checkbox.checked) return;
    source.closest('.filter').querySelectorAll('[type="checkbox"]:checked').toArray().filter(checkbox => checkbox.closest('.filter') == source.closest('.filter')).forEach(checkbox => checkbox.checked = false)
}

async function iluminarMapa(conditions) {
    conditions = (conditions || {});

    let xmlData = xo.stores.active;
    if (xover.session.status == 'unauthorized') xmlData.remove();
    await xmlData.ready;
    xmlData = xmlData.document;
    let desarrollo_id = xo.site.seed.replace(/^#/, '').toLowerCase();

    let xmlFilters = xover.sources[`#${desarrollo_id}:settings`];
    if (!xmlFilters.documentElement) await xmlFilters.fetch();

    let sFilters_bind = $(xmlFilters).find('filters').attr('bind');
    let sElement_id = $(xmlFilters).find('filters').attr('id');
    conditions = buildConditions(conditions);
    for (let element of xmlData.select(sFilters_bind)) {
        let txtIdentificador = `area[target="${desarrollo_id}_${element.attr(sElement_id)}"],area[target="${element.attr(sElement_id)}"]`;
        let oLote = document.querySelector(txtIdentificador);
        if (!oLote) {
            console.log(txtIdentificador + ' no existe')
        } else {
            let data = $(oLote).mouseout().data('maphilight') || {};
            let turnOff = false;
            turnOff = !testConditions(element, conditions);
            data.alwaysOn = !turnOff;

            $(oLote).data('maphilight', data);
        }
    };
    if (!(document.querySelector(`[name="filter_headers"]:checked`) || Object.keys(conditions).length)) return;
    $("map").trigger('alwaysOn.maphilight');
}


var ubicacion_seleccionada = undefined;
var binding = {}
binding.bindData = function (scope, attribute, x_source, removeAttribute) {
    scope.find('*[' + attribute + ']').each(function () { // Buscamos dentro del detalle todos los nodos que son visibles dependiendo de un atributo (Sólo uno. TODO: que puedan ser más de un atributo y con operadores and y or)
        let condition = $(this).attr('visible');
        let bindings = condition.match(/{{[^}]+}}/);
        for (let b = 0; b < bindings.length; b++) {
            let attr = bindings[b]; //Recuperamos el nombre del atributo a enlazar.
            let value = String(getValueFromTree(x_source, attr.replace(/[{}]/gi, ''))); //Recuperamos el valor sin importar la profundidad a la que está definido
            value = (value.length ? "'" + value + "'" : value);
            condition = condition.replace(attr, value)
        }

        if (!eval(condition)) {
            $(this).remove();
        } else {
            $(this).removeAttr(attribute); //Quitamos el atributo para que no se renderee
        }
    });
}

var previousWidth = 0
function resize() {
    let ImageMap = function (map) {
        let n,
            areas = map.getElementsByTagName('area'),
            len = areas.length,
            coords = [];
        let img = document.querySelector('#Mapa img');
        previousWidth = previousWidth || img.getAttribute("orgwidth"); /*Tamaño original de la imagen*/

        for (n = 0; n < len; n++) {
            coords[n] = areas[n].coords.split(',');
        }
        this.resize = function () {
            let n, m, clen,
                x = img.clientWidth / previousWidth;
            //x = document.body.clientWidth / previousWidth;
            for (n = 0; n < len; n++) {
                clen = coords[n].length;
                for (m = 0; m < clen; m++) {
                    coords[n][m] *= x;
                }
                areas[n].coords = coords[n].join(',');
            }
            previousWidth = img.clientWidth;
            //previousWidth = document.body.clientWidth;
            Colorea();
            return true;
        };
        window.removeEventListener('resize', resize);
        window.addEventListener('resize', resize);
    },
        imageMap = new ImageMap(document.querySelector(`map`));

    imageMap.resize();
}

loteador = {};
loteador.limpiar = function () {
    window.document.querySelectorAll(`.loteador,#Filtros`).select(`.//html:canvas|.//@data-maphilight|*[@bind]`).remove()
}
loteador.inicializar = async function () {
    (function () {
        //$('.map').maphilight();
        img = document.querySelector('img[usemap]');
        previousWidth = 0;
        $('img[usemap]').maphilight();
    })();

    let color, txtBind;
    let xmlData = xo.stores.active;
    if (loteador.inicializado == xmlData) return;
    loteador.inicializado = xmlData;
    await xmlData.ready;
    xmlData = xmlData.document;
    let desarrollo_id = xo.site.seed.replace(/^#/, '').toLowerCase();
    let xmlFilters = xover.sources[`#${desarrollo_id}:settings`];

    //let mapDoc = xo.sources[location.hash + ':loteador'];
    //if (!mapDoc.firstElementChild) await mapDoc.fetch();

    //let source_img = mapDoc.querySelector('img');
    //let target_img = document.querySelector("img.map");
    //if (!(target_img && source_img)) return;
    //target_img.setAttribute("orgwidth", source_img.getAttribute("width"));

    //let map = mapDoc.querySelector("map");
    //target_img.parentNode.querySelector("map").replaceWith(map);

    await xmlFilters.ready;
    let sFilters_bind = $(xmlFilters).find('filters').attr('bind');

    let defined_options = (xmlFilters.select('//filters/filter/option').length > 0)
    let target = document.querySelector("#Filtros");
    container = target.cloneNode();
    //target.replaceChildren('');
    if (!target) return;
    for (let filter of xmlFilters.select('//filters/filter')) {
        let bind = filter.attr("bind");
        let bind_text = filter.attr("bind_text");
        let xo_source = filter.attributes["xo-source"];
        let txtNombreFiltro = filter.id || bind.replace(/[\W@]/ig, '_');
        let div = xo.xml.createNode(`<div xmlns="http://www.w3.org/1999/xhtml" id="${txtNombreFiltro}" bind="${bind}" class="filter col-12 col-sm-6 col-md-4 col-xs-4 col-lg-3 col-xl-2"><h4 style='cursor:pointer;'><input type="radio" id="radio_${txtNombreFiltro}" name="filter_headers" onchange="Colorea(this)"/><label for="radio_${txtNombreFiltro}">${filter.attr("title")}</label></h4></div>`)
        div.applyAttributes(filter.attributes);
        if (xo_source) {
            div.querySelector('[type=radio]').setAttribute("onclick", `xo.site.active = '${xo_source}'`);

        }
        container.append(div);

        let values;
        let filter_options = filter.select('option');
        let options = {};

        if (filter_options.length) {
            //Checkboxes de colores
            colors = color_array//generateComplementaryColors(baseColor, filter_options.length);
            for (let option of filter_options) {
                options[option.attr('value')] = { "_type": 'attribute', color: (option.attr('color') || colors.pop()), value: option.attr('value'), text: option.innerHTML || option.attr('text'), selected: option.attr('selected') }
            }
        } else {
            //Checkboxes de otros filtros
            values = xmlData.select(`${sFilters_bind}/${bind}`).map(attr => attr.value).distinct();
            colors = color_array//generateComplementaryColors(baseColor, values.length);
            options = Object.fromEntries(values.map(value => [value, { "_type": 'attribute', color: colors.pop(), value: value, text: value }]));
        }
        renderFilterOption(filter, options, div);
    }
    xover.dom.combine(target, container);
    actualizaColores();
    resize()
    mostrarNumerosDeCasa();
    Colorea();
    setTimeout(Colorea, 100);
}

xover.listener.on(`click`, async function (e) {
    document.querySelector(".card-flipper").classList.remove("toggled")
    Colorea();
})

xover.listener.on(`click::area`, async function (e) {
    e.preventDefault();
    e.stopImmediatePropagation()
    let txtIdentificador = $(this).attr('id') || `#${$(this).attr('target')}`.replace(/^#|^${xover.site.seed}_/, '');
    if (ubicacion_seleccionada == txtIdentificador) {
        ubicacion_seleccionada = undefined;
    }
    else {
        ubicacion_seleccionada = txtIdentificador
    }

    //$('#DetalleSeleccion').show();
    let xmlData = xo.stores[xo.site.seed || location.hash];
    if (!xmlData.documentElement) await xmlData.fetch();
    xmlData = xmlData.document;

    let desarrollo_id = xo.site.seed.replace(/^#/, '').toLowerCase();
    let xmlFilters = xover.sources[`#${desarrollo_id}:settings`];
    if (!xmlFilters.documentElement) await xmlFilters.fetch();
    let template = xmlFilters.querySelector('template.details');
    if (!template) return;
    template = template.content.cloneNode(true);
    let sFilters_bind = $(xmlFilters).find('filters').attr('bind'); //Recuperamos el nombre del nodo con el que se hace el binding principal
    let sElement_id = $(xmlFilters).find('filters').attr('id'); //Recuperamos el nombre del atributo del nodo principal
    let target_node = undefined;
    if (ubicacion_seleccionada) {
        target_node = xmlData.single(`${sFilters_bind}[@${sElement_id}="${ubicacion_seleccionada}"]`); //Recuperamos el nodo en el XML correspondiente al nodo seleccionado.
        // TODO: Informar que si el nodo seleccionado no tiene correspondencia, considerar que a veces esto es con toda la intención, pues el rango obtenido podría estar filtrado.
        if (!target_node) return;
        for (let input of template.querySelectorAll('[id]')) {
            attr = target_node.attributes[input.id] || [...target_node.attributes].find(attr => attr.localName.toLowerCase() == (input.id || "").toLowerCase()) || {};
            if (input instanceof HTMLInputElement) {
                input.value = attr.value
            } else {
                input.textContent = attr.value
            }
        }
        let svg = areaToSvg(this)
        template.querySelector("img").replaceWith(svg);
        document.querySelector("#Detalles").setAttribute("xo-source", "active")
        document.querySelector("#Detalles").setAttribute("xo-scope", target_node.getAttribute("xo:id"))
        document.querySelector("#Detalles").replaceChildren(...template.childNodes)
        document.querySelector(".card-flipper").classList.add("toggled")
    }
    if (ubicacion_seleccionada) {
        coloreaLote(this, '#80FF00');
        let conditions = { "@Id": {} }
        conditions["@Id"][ubicacion_seleccionada] = { "color": "blue" }
        iluminarMapa(conditions);
    } else {
        Colorea();
    }
    return false;
})

function areaToSvg(areaElement) {
    if (!areaElement || areaElement.tagName !== "AREA") {
        throw new Error("Invalid area element");
    }

    // Get the coordinates from the area element
    const coords = areaElement.getAttribute("coords").split(",").map(Number);

    // Split coordinates into pairs of [x, y]
    const points = [];
    for (let i = 0; i < coords.length; i += 2) {
        points.push({ x: coords[i], y: coords[i + 1] });
    }

    // Find minimum x and y to offset the points
    const minX = Math.min(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));

    // Offset the points to start at (0, 0)
    const adjustedPoints = points.map(p => `${p.x - minX},${p.y - minY}`).join(" ");

    // Create the SVG element
    const svgNamespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNamespace, "svg");
    svg.setAttribute("xmlns", svgNamespace);
    svg.setAttribute("viewBox", `0 0 ${Math.max(...points.map(p => p.x - minX))} ${Math.max(...points.map(p => p.y - minY))}`);
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");

    // Create the polygon element
    const polygon = document.createElementNS(svgNamespace, "polygon");
    polygon.setAttribute("points", adjustedPoints);
    polygon.setAttribute("fill", "current");
    polygon.setAttribute("stroke", "black");
    polygon.setAttribute("stroke-width", "2");

    // Append the polygon to the SVG
    svg.appendChild(polygon);

    return svg;
}
function mostrarNumerosDeCasa() {
    // Quitar etiquetas anteriores si las hay
    document.querySelectorAll(".numero-casa").forEach(e => e.remove());

    let xmlData = xo.stores[xo.site.seed || location.hash];
    if (!xmlData.documentElement) return;

    let desarrollo_id = xo.site.seed.replace(/^#/, '').toLowerCase();

    for (let item of xmlData.querySelectorAll("item[Numero]")) {
        let numero = item.getAttribute("Numero");
        let id = item.getAttribute("Id");
        let selector = `area[target="${desarrollo_id}_${id}"], area[target="${id}"]`;
        let area = document.querySelector(selector);
        if (!area) continue;

        // Calcular centroide
        let coords = area.coords.split(',').map(Number);
        let xs = coords.filter((_, i) => i % 2 === 0);
        let ys = coords.filter((_, i) => i % 2 === 1);
        let x = xs.reduce((a, b) => a + b, 0) / xs.length;
        let y = ys.reduce((a, b) => a + b, 0) / ys.length;

        // Crear etiqueta
        let label = document.createElement("div");
        label.className = "numero-casa";
        label.textContent = numero;
        Object.assign(label.style, {
            position: "absolute",
            left: `${x}px`,
            top: `${y}px`,
            transform: "translate(-50%, -50%)",
            fontSize: "10px",
            fontWeight: "bold",
            color: "black",
            fontSize: ".8rem",
            pointerEvents: "none"
        });
        // Adjuntar sobre imagen
        area.closest("map").parentElement.appendChild(label);
    }
}