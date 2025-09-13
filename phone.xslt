<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml" xmlns:session="http://panax.io/session">
	<xsl:param name="session:phone">'0000000000'</xsl:param>
	<xsl:template match="/*">
		<xsl:variable name="phone" select="translate($session:phone,'-','')"/>
		<a href="tel:{$phone}">
			<xsl:value-of select="concat(
				substring($phone, 1, 3), '-', 
				substring($phone, 4, 3), '-', 
				substring($phone, 7)
			)"/>
		</a>
	</xsl:template>
</xsl:stylesheet>