<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml" exclude-result-prefixes="xsl"
>
	<xsl:key name="icon" match="data[starts-with(@name,'icon_')]" use="''"/>
	<xsl:key name="icon" match="data[starts-with(@name,'icon_')]" use="string(comment)"/>

	<xsl:template match="/*">
		<div class="col-md-2 col-sm-3 d-flex justify-content-center">
			<p class="d-flex">
			</p>
			<xsl:apply-templates mode="caracteristicas-item" select="key('icon','')">
				<xsl:sort select="@name"/>
			</xsl:apply-templates>
			<p></p>
		</div>
	</xsl:template>

	<xsl:template mode="caracteristicas-item-title" match="*">
		<xsl:value-of select="substring-before(.,':')"/>
	</xsl:template>

	<xsl:template mode="caracteristicas-item-text" match="*">
		<xsl:value-of select="substring-after(.,':')"/>
	</xsl:template>

	<xsl:template mode="caracteristicas-item" match="*">
		<div class="me-3">
			<a href="{value}">
				<xsl:apply-templates mode="caracteristicas-item-icon" select="."/>
			</a>
		</div>
	</xsl:template>

	<xsl:template mode="caracteristicas-item-icon" match="*">
		<i class="fab fa-{comment} fa-2x py-2"></i>
	</xsl:template>
</xsl:stylesheet>