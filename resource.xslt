<xsl:stylesheet version="1.0" xmlns="http://www.w3.org/1999/xhtml" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
xmlns:resx="http://panax.io/resx">
	<xsl:import href="resx.xslt"/>
	<xsl:param name="key"/>
	
	<xsl:output method="xml"/>
	<xsl:template match="/*">
		<p class="branded-message">
			<xsl:apply-templates select="data[@name=$key]"/>
		</p>
	</xsl:template>

	<xsl:template match="data[key('resx:title',@name)]/value" priority="-1">
		<xsl:param name="title">
			<xsl:apply-templates mode="resx:title" select="."/>
		</xsl:param>
		<xsl:param name="value">
			<xsl:apply-templates mode="resx:value" select="."/>
		</xsl:param>
		<strong>
			<xsl:value-of select="$title" disable-output-escaping="yes"/>
		</strong>
		<xsl:text/>
		<br/>
		<xsl:text/>
		<xsl:value-of select="$value" disable-output-escaping="yes"/>
	</xsl:template>
</xsl:stylesheet>