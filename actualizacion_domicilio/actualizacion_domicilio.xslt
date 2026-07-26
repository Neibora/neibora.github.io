<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" encoding="UTF-8" indent="yes"/>
	<xsl:template match="/ActualizacionDomicilio">
		<div class="app-shell">
			<style><![CDATA[
				:root{--primary:#075f55;--secondary:#0d8172;--accent:#f2a900;--ink:#12302c;--muted:#64748b;--line:#dbe6e3;--surface:#fff;--bg:#f4f8f7}
				*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:Inter,system-ui,sans-serif}
				#domicilio-status{padding:3rem;text-align:center;color:var(--muted)}.app-shell{min-height:100vh}
				.topbar{position:sticky;top:0;z-index:10;background:rgba(255,255,255,.94);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
				.topbar-inner{max-width:1120px;margin:auto;padding:14px 22px;display:flex;align-items:center;justify-content:space-between;gap:16px}
				.brand{display:flex;align-items:center;gap:12px}.brand img{width:42px}.brand strong{display:block}.brand span{font-size:12px;color:var(--muted)}
				.progress{height:4px;background:#e6efed}.progress span{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--primary),#23aa8f);transition:width .25s}
				.container{max-width:1120px;margin:auto;padding:28px 22px 100px}.hero{display:grid;grid-template-columns:1fr auto;gap:20px;align-items:end;margin-bottom:24px}
				h1{margin:0;font-size:clamp(25px,4vw,38px);letter-spacing:-.04em}.hero p{margin:8px 0 0;color:var(--muted)}.unit{padding:9px 14px;background:#e5f4f1;color:var(--primary);border-radius:999px;font-weight:700}
				.notice{display:flex;gap:12px;padding:15px 17px;margin-bottom:20px;background:#fff8e6;border:1px solid #f4d88e;border-radius:14px;font-size:14px}
				.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.card{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:22px;box-shadow:0 10px 30px rgba(18,48,44,.05)}
				.card.wide{grid-column:1/-1}.card-title{display:flex;align-items:center;gap:10px;margin:0 0 18px;font-size:17px}.card-title .material-icons{color:var(--secondary)}
				.fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}.field.full{grid-column:1/-1}label{display:block;font-size:13px;font-weight:600;margin-bottom:6px}
				input,select,textarea{width:100%;border:1px solid #cbd8d5;border-radius:10px;padding:11px 12px;background:#fff;color:var(--ink);font:inherit;outline:none}
				input:focus,select:focus,textarea:focus{border-color:var(--secondary);box-shadow:0 0 0 3px rgba(13,129,114,.12)}input[readonly]{background:#f2f6f5;color:#59716d}
				textarea{min-height:96px;resize:vertical}.hint{font-size:11px;color:var(--muted);margin-top:5px}.required::after{content:" *";color:#c2413b}
				.section-help{margin:-8px 0 16px;color:var(--muted);font-size:13px}.record-list{display:grid;gap:14px}.record{border:1px solid var(--line);border-radius:14px;padding:17px;background:#fbfdfc}.record-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}.record-head strong{color:var(--primary)}.record-id{font-size:11px;color:var(--muted);background:#edf4f2;padding:4px 8px;border-radius:999px}
				.actions{position:fixed;left:0;right:0;bottom:0;z-index:12;background:rgba(255,255,255,.96);border-top:1px solid var(--line);backdrop-filter:blur(12px)}
				.actions-inner{max-width:1120px;margin:auto;padding:12px 22px;display:flex;align-items:center;justify-content:space-between;gap:12px}.save-state{font-size:13px;color:var(--muted)}
				.buttons{display:flex;gap:10px}.btn{border:0;border-radius:10px;padding:11px 16px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:7px}.btn.secondary{background:#e7f0ee;color:var(--primary)}.btn.primary{background:var(--primary);color:#fff}
				.invalid{border-color:#c2413b!important;box-shadow:0 0 0 3px rgba(194,65,59,.1)!important}
				@media(max-width:720px){.hero{grid-template-columns:1fr}.unit{justify-self:start}.form-grid,.fields{grid-template-columns:1fr}.card.wide,.field.full{grid-column:auto}.container{padding:22px 14px 110px}.topbar-inner,.actions-inner{padding-left:14px;padding-right:14px}.save-state{display:none}.buttons{width:100%}.btn{flex:1;justify-content:center}}
			]]></style>
			<header class="topbar">
				<div class="topbar-inner">
					<div class="brand"><img src="/assets/img/logo.png" alt="Neibora"/><div><strong>Neibora</strong><span>Información residencial</span></div></div>
					<span class="unit"><xsl:value-of select="Domicilio/@id"/></span>
				</div>
				<div class="progress"><span id="form-progress"></span></div>
			</header>
			<div class="container">
				<div class="hero"><div><h1>Actualiza la información de tu domicilio</h1><p>Verifica los datos de la propiedad y mantén actualizados tus medios de contacto.</p></div></div>
				<div class="notice"><span class="material-icons">privacy_tip</span><div><strong>Información protegida.</strong> Los datos se utilizarán únicamente para la administración, seguridad y comunicación del residencial.</div></div>
				<form id="domicilio-form" novalidate="novalidate">
					<div class="form-grid">
						<section class="card wide">
							<h2 class="card-title"><span class="material-icons">home</span>Domicilio</h2>
							<div class="fields">
								<xsl:call-template name="input"><xsl:with-param name="node">Domicilio</xsl:with-param><xsl:with-param name="attr">calle</xsl:with-param><xsl:with-param name="label">Calle o circuito</xsl:with-param><xsl:with-param name="required">1</xsl:with-param></xsl:call-template>
								<xsl:call-template name="input"><xsl:with-param name="node">Domicilio</xsl:with-param><xsl:with-param name="attr">numero</xsl:with-param><xsl:with-param name="label">Número exterior</xsl:with-param><xsl:with-param name="required">1</xsl:with-param></xsl:call-template>
								<xsl:call-template name="input"><xsl:with-param name="node">Domicilio</xsl:with-param><xsl:with-param name="attr">interior</xsl:with-param><xsl:with-param name="label">Interior</xsl:with-param></xsl:call-template>
								<xsl:call-template name="input"><xsl:with-param name="node">Domicilio</xsl:with-param><xsl:with-param name="attr">codigoPostal</xsl:with-param><xsl:with-param name="label">Código postal</xsl:with-param></xsl:call-template>
							</div>
						</section>
						<section class="card">
							<h2 class="card-title"><span class="material-icons">person</span>Contacto principal</h2>
							<div class="fields">
								<xsl:call-template name="input"><xsl:with-param name="node">Contacto</xsl:with-param><xsl:with-param name="attr">nombre</xsl:with-param><xsl:with-param name="label">Nombre completo</xsl:with-param><xsl:with-param name="required">1</xsl:with-param><xsl:with-param name="full">1</xsl:with-param></xsl:call-template>
								<xsl:call-template name="input"><xsl:with-param name="node">Contacto</xsl:with-param><xsl:with-param name="attr">telefono</xsl:with-param><xsl:with-param name="label">Teléfono / WhatsApp</xsl:with-param><xsl:with-param name="type">tel</xsl:with-param><xsl:with-param name="required">1</xsl:with-param></xsl:call-template>
								<xsl:call-template name="input"><xsl:with-param name="node">Contacto</xsl:with-param><xsl:with-param name="attr">correo</xsl:with-param><xsl:with-param name="label">Correo electrónico</xsl:with-param><xsl:with-param name="type">email</xsl:with-param></xsl:call-template>
							</div>
						</section>
						<section class="card">
							<h2 class="card-title"><span class="material-icons">groups</span>Ocupación</h2>
							<div class="fields">
								<xsl:call-template name="number"><xsl:with-param name="attr">adultos</xsl:with-param><xsl:with-param name="label">Adultos</xsl:with-param></xsl:call-template>
								<xsl:call-template name="number"><xsl:with-param name="attr">menores</xsl:with-param><xsl:with-param name="label">Menores</xsl:with-param></xsl:call-template>
								<xsl:call-template name="number"><xsl:with-param name="attr">adultosMayores</xsl:with-param><xsl:with-param name="label">Adultos mayores</xsl:with-param></xsl:call-template>
								<xsl:call-template name="number"><xsl:with-param name="attr">personasConDiscapacidad</xsl:with-param><xsl:with-param name="label">Personas con discapacidad</xsl:with-param></xsl:call-template>
							</div>
						</section>
						<section class="card wide">
							<h2 class="card-title"><span class="material-icons">group</span>Residentes</h2>
							<p class="section-help">Personas que viven en el domicilio y medios para contactarlas.</p>
							<div class="record-list"><xsl:apply-templates select="Residentes/Residente"/></div>
						</section>
						<section class="card wide">
							<h2 class="card-title"><span class="material-icons">pets</span>Mascotas</h2>
							<p class="section-help">Identificación de mascotas y la persona responsable de cada una.</p>
							<div class="record-list"><xsl:apply-templates select="Mascotas/Mascota"/></div>
						</section>
						<section class="card">
							<h2 class="card-title"><span class="material-icons">directions_car</span>Accesos</h2>
							<div class="fields">
								<xsl:call-template name="access-number"><xsl:with-param name="attr">vehiculos</xsl:with-param><xsl:with-param name="label">Vehículos</xsl:with-param></xsl:call-template>
								<xsl:call-template name="access-number"><xsl:with-param name="attr">tags</xsl:with-param><xsl:with-param name="label">Tags activos</xsl:with-param></xsl:call-template>
								<xsl:call-template name="access-number"><xsl:with-param name="attr">cajones</xsl:with-param><xsl:with-param name="label">Cajones</xsl:with-param></xsl:call-template>
							</div>
						</section>
						<section class="card">
							<h2 class="card-title"><span class="material-icons">emergency</span>Contacto de emergencia</h2>
							<div class="fields">
								<xsl:call-template name="input"><xsl:with-param name="node">Emergencia</xsl:with-param><xsl:with-param name="attr">nombre</xsl:with-param><xsl:with-param name="label">Nombre</xsl:with-param></xsl:call-template>
								<xsl:call-template name="input"><xsl:with-param name="node">Emergencia</xsl:with-param><xsl:with-param name="attr">telefono</xsl:with-param><xsl:with-param name="label">Teléfono</xsl:with-param><xsl:with-param name="type">tel</xsl:with-param></xsl:call-template>
								<xsl:call-template name="input"><xsl:with-param name="node">Emergencia</xsl:with-param><xsl:with-param name="attr">relacion</xsl:with-param><xsl:with-param name="label">Relación</xsl:with-param><xsl:with-param name="full">1</xsl:with-param></xsl:call-template>
							</div>
						</section>
						<section class="card wide">
							<h2 class="card-title"><span class="material-icons">notifications</span>Comunicación y observaciones</h2>
							<div class="fields">
								<div class="field"><label>Canal preferido</label><select data-node="Preferencias" data-attr="canal"><xsl:call-template name="option"><xsl:with-param name="value">WhatsApp</xsl:with-param><xsl:with-param name="current" select="Preferencias/@canal"/></xsl:call-template><xsl:call-template name="option"><xsl:with-param name="value">Correo</xsl:with-param><xsl:with-param name="current" select="Preferencias/@canal"/></xsl:call-template><xsl:call-template name="option"><xsl:with-param name="value">Llamada</xsl:with-param><xsl:with-param name="current" select="Preferencias/@canal"/></xsl:call-template></select></div>
								<div class="field full"><label>Observaciones</label><textarea data-node="Notas" data-text="1"><xsl:value-of select="Notas"/></textarea><p class="hint">Incluye indicaciones de acceso, necesidades de apoyo o cambios relevantes.</p></div>
							</div>
						</section>
					</div>
				</form>
			</div>
			<div class="actions"><div class="actions-inner"><span class="save-state" id="save-state">Sin cambios pendientes</span><div class="buttons"><button type="button" class="btn secondary" id="download-button"><span class="material-icons">download</span>Descargar XML</button><button type="button" class="btn primary" id="save-button"><span class="material-icons">save</span>Guardar cambios</button></div></div></div>
		</div>
	</xsl:template>

	<xsl:template name="input">
		<xsl:param name="node"/><xsl:param name="attr"/><xsl:param name="label"/><xsl:param name="type">text</xsl:param><xsl:param name="required">0</xsl:param><xsl:param name="full">0</xsl:param>
		<div><xsl:attribute name="class"><xsl:text>field</xsl:text><xsl:if test="$full='1'"><xsl:text> full</xsl:text></xsl:if></xsl:attribute>
			<label><xsl:if test="$required='1'"><xsl:attribute name="class">required</xsl:attribute></xsl:if><xsl:value-of select="$label"/></label>
			<input type="{$type}" data-node="{$node}" data-attr="{$attr}" value="{*[name()=$node]/@*[name()=$attr]}"><xsl:if test="$required='1'"><xsl:attribute name="required">required</xsl:attribute></xsl:if></input>
		</div>
	</xsl:template>
	<xsl:template name="number"><xsl:param name="attr"/><xsl:param name="label"/><div class="field"><label><xsl:value-of select="$label"/></label><input type="number" min="0" data-node="Residentes" data-attr="{$attr}" value="{Residentes/@*[name()=$attr]}"/></div></xsl:template>
	<xsl:template name="access-number"><xsl:param name="attr"/><xsl:param name="label"/><div class="field"><label><xsl:value-of select="$label"/></label><input type="number" min="0" data-node="Acceso" data-attr="{$attr}" value="{Acceso/@*[name()=$attr]}"/></div></xsl:template>
	<xsl:template name="option"><xsl:param name="value"/><xsl:param name="current"/><option value="{$value}"><xsl:if test="$current=$value"><xsl:attribute name="selected">selected</xsl:attribute></xsl:if><xsl:value-of select="$value"/></option></xsl:template>

	<xsl:template match="Residente">
		<div class="record">
			<div class="record-head"><strong><xsl:value-of select="@nombre"/></strong><span class="record-id"><xsl:value-of select="@id"/></span></div>
			<div class="fields">
				<xsl:call-template name="record-input"><xsl:with-param name="element">Residente</xsl:with-param><xsl:with-param name="attr">nombre</xsl:with-param><xsl:with-param name="label">Nombre completo</xsl:with-param><xsl:with-param name="required">1</xsl:with-param></xsl:call-template>
				<xsl:call-template name="record-input"><xsl:with-param name="element">Residente</xsl:with-param><xsl:with-param name="attr">rol</xsl:with-param><xsl:with-param name="label">Rol en el domicilio</xsl:with-param><xsl:with-param name="required">1</xsl:with-param></xsl:call-template>
				<xsl:call-template name="record-input"><xsl:with-param name="element">Residente</xsl:with-param><xsl:with-param name="attr">telefono</xsl:with-param><xsl:with-param name="label">Teléfono / WhatsApp</xsl:with-param><xsl:with-param name="type">tel</xsl:with-param></xsl:call-template>
				<xsl:call-template name="record-input"><xsl:with-param name="element">Residente</xsl:with-param><xsl:with-param name="attr">correo</xsl:with-param><xsl:with-param name="label">Correo electrónico</xsl:with-param><xsl:with-param name="type">email</xsl:with-param></xsl:call-template>
				<div class="field full"><label>Recibe avisos</label><select data-selector="Residente[id='{@id}']" data-attr="recibeAvisos"><option value="Sí"><xsl:if test="@recibeAvisos='Sí'"><xsl:attribute name="selected">selected</xsl:attribute></xsl:if>Sí</option><option value="No"><xsl:if test="@recibeAvisos='No'"><xsl:attribute name="selected">selected</xsl:attribute></xsl:if>No</option></select></div>
			</div>
		</div>
	</xsl:template>

	<xsl:template match="Mascota">
		<div class="record">
			<div class="record-head"><strong><xsl:value-of select="@nombre"/></strong><span class="record-id"><xsl:value-of select="@id"/></span></div>
			<div class="fields">
				<xsl:call-template name="record-input"><xsl:with-param name="element">Mascota</xsl:with-param><xsl:with-param name="attr">nombre</xsl:with-param><xsl:with-param name="label">Nombre</xsl:with-param><xsl:with-param name="required">1</xsl:with-param></xsl:call-template>
				<xsl:call-template name="record-input"><xsl:with-param name="element">Mascota</xsl:with-param><xsl:with-param name="attr">especie</xsl:with-param><xsl:with-param name="label">Especie</xsl:with-param><xsl:with-param name="required">1</xsl:with-param></xsl:call-template>
				<xsl:call-template name="record-input"><xsl:with-param name="element">Mascota</xsl:with-param><xsl:with-param name="attr">raza</xsl:with-param><xsl:with-param name="label">Raza</xsl:with-param></xsl:call-template>
				<xsl:call-template name="record-input"><xsl:with-param name="element">Mascota</xsl:with-param><xsl:with-param name="attr">identificacion</xsl:with-param><xsl:with-param name="label">Placa o identificación</xsl:with-param></xsl:call-template>
				<div class="field"><label>Responsable</label><select data-selector="Mascota[id='{@id}']" data-attr="responsable"><xsl:for-each select="../../Residentes/Residente"><option value="{@id}"><xsl:if test="@id=current()/@responsable"><xsl:attribute name="selected">selected</xsl:attribute></xsl:if><xsl:value-of select="@nombre"/></option></xsl:for-each></select></div>
				<xsl:call-template name="record-input"><xsl:with-param name="element">Mascota</xsl:with-param><xsl:with-param name="attr">observaciones</xsl:with-param><xsl:with-param name="label">Observaciones</xsl:with-param></xsl:call-template>
			</div>
		</div>
	</xsl:template>

	<xsl:template name="record-input">
		<xsl:param name="element"/><xsl:param name="attr"/><xsl:param name="label"/><xsl:param name="type">text</xsl:param><xsl:param name="required">0</xsl:param>
		<div class="field"><label><xsl:if test="$required='1'"><xsl:attribute name="class">required</xsl:attribute></xsl:if><xsl:value-of select="$label"/></label><input type="{$type}" data-selector="{$element}[id='{@id}']" data-attr="{$attr}" value="{@*[name()=$attr]}"><xsl:if test="$required='1'"><xsl:attribute name="required">required</xsl:attribute></xsl:if></input></div>
	</xsl:template>
</xsl:stylesheet>
