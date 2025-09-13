////xo.listener.on('error', function () {
////    if (!(this instanceof HTMLImageElement)) return;
////    this.appendBefore(this.ownerDocument.createComment(`No se pudo descargar ${this.getAttribute("src")}`));
////    let svg = this.replaceWith(xo.xml.createNode(`<html:div class="p-4 m-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-image" viewBox="0 0 16 16">
////  <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
////  <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
////</svg></html:div>`))
////    svg.style.background = `repeating-linear-gradient( 55deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2) 9px, rgba(0, 0, 1, 0.3) 9px, rgba(0, 0, 1, 0.3) 18px)`;
////})

xover.listener.on('beforeHashChange', function (new_hash, old_hash) {
    if (!['#', ''].includes(old_hash) && ["#aviso_privacidad", "#codigo_etica", "#terminos_condiciones"].includes(new_hash)) {
        event.preventDefault();
        if (xo.site.active == old_hash) {
            history.state.seed = new_hash;
        }
        xo.site.active = new_hash;
    }
})

xo.listener.on('beforeTransform::root[data]', function () {
    this.select(`/root/*[not(self::data)]|root/comment()|root/data[comment='disabled']`).remove()
})

xo.listener.on('fetch::root[data[not(comment)]]', function () {
    this.select(`/root/data[not(comment)]`).forEach(data => data.append(xo.xml.createNode("<comment/>")))
})

xo.listener.on('fetch::root[data/@name="telefono"]', function () {
    let phone = this.selectFirst(`/root/data[@name="telefono"]/value/text()`);
    xo.session.phone = phone;
})

xo.listener.on('error::[xo-stylesheet=desarrollos-info.xslt] section .row img', function () {
    this.closest('.row').remove()
})

xo.listener.on('error', function () {
    if (this.style) this.style.background = `repeating-linear-gradient( 55deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2) 9px, rgba(0, 0, 1, 0.3) 9px, rgba(0, 0, 1, 0.3) 18px );`;
})

xo.listener.on('render::desarrollos-info.xslt', async function () {
    let active_map = document.querySelector("#map.in-viewport");
    if (active_map) {
        await initMap();
        await xo.delay(500);
        active_map.scrollIntoView();
    } else {
        window.scrollTo({ left: 0, top: 0 });
    }
})

xo.listener.on('beforeSet::data/value/text()', function ({ value, old }) {
    let new_text = value.toString()
    if (new_text.indexOf(':') == -1) {
        let title = old.substring(0, old.indexOf(':') + 1);
        new_text = `${title}${new_text}`
        value.textContent = new_text
    }
})

xo.listener.on('change::session:edit', function ({ value: editing }) {
    if (editing) {
        let store = new xo.Store(xo.stores.seed.document, { tag: `${xo.stores.seed.tag}~edit` });
        store.addStylesheet({
            "href": "resx-editor.xslt",
            "target": "body"
            , "action": "append"
        });
        store.render();
    }
})

xo.listener.on('click::div.list-group > a', function () {
    let selection = this.getAttribute("href");
    for (let component of this.closest(".carousel-container").querySelectorAll(".carousel")) {
        component.carousel && component.carousel.pause && component.carousel.pause()
        delete component.carousel;
        if (component.parentNode.matches(selection)) {
            initialize_carousel(component)
        }
    }
})

xo.listener.silence('root/data[@name="pin"]/value/text()');

function initialize_carousel() {
    for (let target_carousel of document.querySelectorAll(".tab-pane.active .carousel, .desarrollo-info .carousel ")) {
        target_carousel.carousel = target_carousel.carousel || new bootstrap.Carousel(target_carousel, {
            interval: 5000
        });

        target_carousel.carousel.cycle();
    }
}

function saveXMLToFile(xmlContent, fileName) {
    var link = document.createElement('a');
    link.href = 'data:text/xml;charset=utf-8,' + encodeURIComponent(xmlContent);
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


function saveResx(scope) {
    let xml = scope.cloneNode(true);
    xml.select(`//@xo:*|//@state:*`).remove();
    saveXMLToFile(xml.toString(), 'file.resx')
}

function formatPhoneNumber(number) {
    const cleaned = String(number).replace(/\D/g, '');

    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }

    return cleaned;
}

Phone = () => formatPhoneNumber(xo.session.phone || "");

xo.listener.on('logout', function () {
    window.loteador && window.loteador.limpiar()
    xover.stores.seed.clear()
})

xo.listener.on('Response:reject?response.response_value.message', function ({ response }) {
    for (let container of [document.querySelector('.toast-container')]) {
        container.replaceContent(HTML(`<div class="toast align-items-center text-bg-danger" role="alert" aria-live="assertive" aria-atomic="true">
  <div class="d-flex">
    <div class="toast-body">
      ${response.response_value.message}
    </div>
    <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
  </div>
</div>`))
        container.dispatch('show')
    }
    event.preventDefault()
    event.stopPropagation()
})

xo.listener.on(`show::.toast-container`, function () {
    for (let toastTrigger of this.findAll('.toast')) {
        const toast = new bootstrap.Toast(toastTrigger);
        toast.show();
    }
})