<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml">
	<xsl:template match="/*">
		<div class="list-group" id="list-tab" role="tablist">
			<xsl:apply-templates select="data">
				<xsl:sort select="comment"/>
				<xsl:sort select="value"/>				
			</xsl:apply-templates>
		</div>
	</xsl:template>

	<xsl:template match="data">
		<xsl:variable name="active">
			<xsl:if test="position()=1">active</xsl:if>
		</xsl:variable>
		<a class="list-group-item list-group-item-action {$active}" id="list-{@name}-list" data-bs-toggle="list" href="#list-{@name}" role="tab" aria-controls="list-{@name}">
			Residencial <xsl:value-of select="value"/>
		</a>
	</xsl:template>
</xsl:stylesheet>