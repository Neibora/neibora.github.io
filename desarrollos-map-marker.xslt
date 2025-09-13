<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml" exclude-result-prefixes="xsl">
	<xsl:param name="desarrollo"/>

	<xsl:key name="label" match="data" use="@name"/>
	<xsl:template match="/*">
		<xsl:variable name="pin" select="substring-before(key('label','pin'),'/')"/>
		<div class="od" style="{$pin}; position: absolute;">
			<div class="id" style="left:-3px;top:-3px">
				<svg xmlns="http://www.w3.org/2000/svg" width="7" height="7" fill="currentColor" class="bi bi-circle-fill map-marker" viewBox="0 0 16 16">
					<circle cx="8" cy="8" r="8" />
				</svg>
			</div>
			<div class="pr" style="font-size:91%;width:6em;left:4px">
				<div>
					<xsl:value-of select="$desarrollo" />
				</div>
			</div>
		</div>
	</xsl:template>
</xsl:stylesheet>