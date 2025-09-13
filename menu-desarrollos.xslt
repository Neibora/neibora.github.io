<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns="http://www.w3.org/1999/xhtml"
  exclude-result-prefixes="xsl"
>
	<xsl:template match="/*">
		<div class="row px-desarrollos card-desarrollos">
			<xsl:apply-templates mode="menu-item">
				<xsl:sort select="comment"/>
				<xsl:sort select="value"/>
			</xsl:apply-templates>
		</div>
	</xsl:template>

	<xsl:template mode="menu-item" match="*"/>

	<xsl:template mode="menu-item" match="data">
		<div class="col-10 col-sm-6 col-md-4 d-flex align-items-stretch justify-content-center">
			<div class="card bg-transparent grid-slot">
				<a href="desarrollos.html#{@name}">
					<img src="assets/desarrollos/{@name}/fachada.jpg" alt="" class="cover" xo-static="@src"/>
					<img src="assets/desarrollos/{@name}/logo-cintillo.png" xo-static="@src" alt="" class="logo" onerror="this.onerror=undefined; if (src.indexOf('-cintillo')!=-1) src=src.replace(/-cintillo/,'');"/>
				</a>
			</div>
		</div>
	</xsl:template>
</xsl:stylesheet>