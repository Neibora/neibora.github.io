<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml" xmlns:html="http://www.w3.org/1999/xhtml" xmlns:env="http://panax.io/state/environment" xmlns:xo="http://panax.io/xover">
	<xsl:import href="keys.xslt"/>
	<xsl:variable name="lowercase" select="'abcdefghijklmnopqrstuvwxyz'" />
	<xsl:variable name="uppercase" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'" />
	<xsl:template mode="src-attribute" match="value">
		<xsl:param name="path">/assets/</xsl:param>
		<xsl:attribute name="src">
			<xsl:value-of select="$path"/>
			<xsl:value-of select="translate(translate(substring-before(.,';'),'\','/'), $uppercase, $lowercase)"/>
		</xsl:attribute>
	</xsl:template>

	<xsl:template mode="src-attribute" match="data">
		<xsl:comment>debug:info</xsl:comment>
		<xsl:apply-templates mode="src-attribute" select="key('file', @name)"/>
	</xsl:template>

	<xsl:template mode="image-src" match="value">
		<xsl:param name="path">/assets/</xsl:param>
		<xsl:attribute name="src">
			<xsl:value-of select="$path"/>
			<xsl:value-of select="translate(translate(substring-before(.,';'),'\','/'), $uppercase, $lowercase)"/>
		</xsl:attribute>
	</xsl:template>

	<xsl:template mode="image-src" match="data">
		<xsl:apply-templates mode="image-src" select="key('image', @name)"/>
	</xsl:template>

	<xsl:template mode="title" match="data">
		<xsl:comment>debug:info</xsl:comment>
		<xsl:apply-templates mode="title" select="value"/>
	</xsl:template>

	<xsl:template mode="title" match="@name">
		<xsl:comment>debug:info</xsl:comment>
		<xsl:value-of select="normalize-space(substring-after(.,':'))" disable-output-escaping="yes"/>
	</xsl:template>

	<xsl:template mode="title" match="value">
		<xsl:comment>debug:info</xsl:comment>
		<xsl:value-of select="normalize-space(substring-before(.,':'))" disable-output-escaping="yes"/>
	</xsl:template>

	<xsl:template mode="body" match="value">
		<xsl:comment>debug:info</xsl:comment>
		<xsl:value-of select="." disable-output-escaping="yes"/>
	</xsl:template>

	<xsl:template mode="body" match="value[contains(.,':')]">
		<xsl:comment>debug:info</xsl:comment>
		<xsl:value-of select="normalize-space(substring-after(.,':'))" disable-output-escaping="yes"/>
	</xsl:template>

	<xsl:template mode="paragraph" match="*">
		<xsl:param name="class"/>
		<xsl:comment>debug:info</xsl:comment>
		<xsl:variable name="body">
			<xsl:apply-templates mode="body" select="."/>
		</xsl:variable>
		<xsl:choose>
			<xsl:when test="substring($body,1,1)='&lt;'">
				<xsl:value-of select="$body" disable-output-escaping="yes"/>
			</xsl:when>
			<xsl:otherwise>
				<p class="$class">
					<xsl:value-of select="$body" disable-output-escaping="yes"/>
				</p>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
</xsl:stylesheet>