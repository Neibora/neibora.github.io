<xsl:stylesheet version="1.0" xmlns="http://www.w3.org/1999/xhtml" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
xmlns:resx="http://panax.io/resx">
	<xsl:key name="resx:title" match="data/value[contains(.,':')]" use="../@name"/>

	<xsl:key name="resx:data" match="data" use="@name"/>

	<xsl:key name="resx:data" match="data[not(contains(@type,'System.Resources.ResXFileRef'))][not(contains(@name,'title'))]" use="'body'"/>
	<xsl:key name="resx:data" match="data[not(contains(@type,'System.Resources.ResXFileRef'))][not(contains(@name,'title'))]" use="'*'"/>
	<xsl:key name="resx:data" match="data/value" use="concat('#',../@name)"/>

	<xsl:key name="resx:widget" match="data[contains(@type,'System.Resources.ResXFileRef')][contains(value,'System.Byte')]/value" use="'video'"/>
	<xsl:key name="resx:widget" match="data[contains(@type,'System.Resources.ResXFileRef')][contains(value,'System.Drawing')]/value" use="'image'"/>

	<xsl:key name="resx:image" match="data[contains(@type,'System.Resources.ResXFileRef')][contains(value,'System.Drawing')]/value" use="'*'"/>
	<xsl:key name="resx:image" match="data[contains(@type,'System.Resources.ResXFileRef')][contains(value,'System.Drawing')]/value" use="concat('#',../@name)"/>
	<xsl:key name="resx:image" match="data[contains(@type,'System.Resources.ResXFileRef')][contains(value,'System.Drawing')]/value" use="../@name"/>
	<xsl:key name="resx:image" match="data[contains(@type,'System.Resources.ResXFileRef')][contains(value,'System.Drawing')]/value" use="substring-after(../@name,':')"/>
	<xsl:key name="resx:image" match="data[contains(@type,'System.Resources.ResXFileRef')][contains(value,'System.Drawing')]/value" use="concat('#',substring-before(../@name,' ('))"/>
	<xsl:key name="resx:image" match="data[not(contains(@type,'System.Resources.ResXFileRef'))][not(comment=../data/@name)]/value" use="comment"/>

	<xsl:key name="resx:file" match="data[contains(@type,'System.Resources.ResXFileRef')]/value" use="'*'"/>
	<xsl:key name="resx:file" match="data[contains(@type,'System.Resources.ResXFileRef')]/value" use="concat('#',../@name)"/>
	<xsl:key name="resx:file" match="data[contains(@type,'System.Resources.ResXFileRef')]/value" use="../@name"/>
	<xsl:key name="resx:file" match="data[contains(@type,'System.Resources.ResXFileRef')]/value" use="substring-after(../@name,':')"/>
	<xsl:key name="resx:file" match="data[contains(@type,'System.Resources.ResXFileRef')]/value" use="concat('#',substring-before(../@name,' ('))"/>
	<xsl:key name="resx:file" match="data[not(contains(@type,'System.Resources.ResXFileRef'))][not(comment=../data/@name)]/value" use="comment"/>

	<xsl:template mode="resx:image" match="data">
		<xsl:value-of select="normalize-space(comment)" disable-output-escaping="yes"/>
	</xsl:template>

	<xsl:template mode="resx:value" match="data/value" priority="0">
		<xsl:value-of select="." disable-output-escaping="yes"/>
	</xsl:template>

	<xsl:template mode="resx:value" match="data[key('resx:title',@name)]/value" priority="0">
		<xsl:value-of select="normalize-space(substring-after(.,':'))" disable-output-escaping="yes"/>
	</xsl:template>

	<xsl:template mode="resx:title" match="data/value"></xsl:template>

	<xsl:template mode="resx:title" match="data[key('resx:title',@name)]/value">
		<xsl:value-of select="normalize-space(substring-before(.,':'))" disable-output-escaping="yes"/>
	</xsl:template>

	<xsl:template mode="resx:date" match="value">
		<xsl:apply-templates mode="resx:date" select=".."/>
	</xsl:template>

	<xsl:template mode="resx:date" match="data">
		<xsl:variable name="date" select="substring-after(@name,'_')" />
		<xsl:value-of select="concat(substring($date, 7, 2), '-', substring($date, 5, 2), '-', substring($date, 1, 4))" disable-output-escaping="yes"/>
	</xsl:template>

	<xsl:template match="data/value" priority="-1">
		<xsl:apply-templates mode="resx:value" select="."/>
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
		<br/>
		<xsl:value-of select="$value" disable-output-escaping="yes"/>
	</xsl:template>
</xsl:stylesheet>