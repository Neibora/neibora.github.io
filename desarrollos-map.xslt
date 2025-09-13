<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml" xmlns:state="http://panax.io/state" exclude-result-prefixes="xsl state">
	<xsl:param name="state:desarrollo">(xover.site.seed || '').replace(/^#/,'')</xsl:param>
	<xsl:key name="section" match="data" use="substring-after(@name,'_')"/>
	<xsl:key name="label" match="data" use="@name"/>
	<xsl:template match="/*">
		<xsl:variable name="desarrollos" select="data"/>
		<div class="row">
			<div class="col-lg-4 d-none d-lg-inline">
				<div class="post-entry-footer">
					<ul>
						<xsl:apply-templates select="$desarrollos[number(comment) mod 2 = 1]" mode="map-item">
							<xsl:sort select="comment" data-type="number"/>
							<xsl:sort select="value"/>
						</xsl:apply-templates>
					</ul>
				</div>
			</div>
			<div class="col-lg-4 col-12 align-items-center justify-content-center d-flex">
				<div class="image-navigator" style="overflow: clip; max-height: 60vh; background: repeating-linear-gradient( 55deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2) 9px, rgba(0, 0, 1, 0.3) 9px, rgba(0, 0, 1, 0.3) 18px ); background: #f6e1b9; position: relative;" onclick="event.stopImmediatePropagation(); return false;" xo-stylesheet="mapa-slp.xslt" xo-source="#desarrollos">
					<div class="image-container" style="position: relative;transform: scale(1);translate: 0%;">
						<xsl:attribute name="onclick">this.style.transform = `scale(${Math.abs(+this.style.transform.replace(/[^\d\.]/g, '') + .5)})`; this.style.translate = this.style.translate.split(/\s+/).map(percent => `${parseFloat(percent) * 2}%`).join(' '); return false" oncontextmenu="this.style.transform = `scale(${Math.abs(+this.style.transform.replace(/[^\d\.]/g, '') - .5)})`;  this.style.translate = this.style.translate.split(/\s+/).map(percent => `${parseFloat(percent) / 2}%`).join(' '); return false</xsl:attribute>
						<img src="/assets/img/desarrollos.png" style="width: 100%; height: 100%;"/>
					</div>
				</div>
			</div>
			<div class="col-lg-4 d-none d-lg-inline reversed">
				<div class="post-entry-footer">
					<ul>
						<xsl:apply-templates select="$desarrollos[number(comment) mod 2 = 0]" mode="map-item">
							<xsl:sort select="comment" data-type="number"/>
							<xsl:sort select="value"/>
						</xsl:apply-templates>
					</ul>
				</div>
			</div>
		</div>
	</xsl:template>

	<xsl:template match="data" mode="map-item">
		<li>
			<a href="desarrollos.html#{@name}" class="w-100">
				<div class="text">
					<img src="assets/desarrollos/{@name}/logo.png" alt="" class="ms-3 me-1 rounded logo"/>
				</div>
				<div class="text d-none d-md-table-cell" style="text-align: center;">
					<p>Residencial Boutique</p>
					<div class="post-meta">
						<h5 class="mr-2">
							<xsl:value-of select="value"/>
						</h5>
					</div>
				</div>
			</a>
		</li>
	</xsl:template>
</xsl:stylesheet>