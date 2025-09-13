<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml" xmlns:html="http://www.w3.org/1999/xhtml" xmlns:env="http://panax.io/state/environment" xmlns:xo="http://panax.io/xover">
	<xsl:key name="data" match="data[value!='']" use="@name"/>
	<!--<xsl:key name="data" match="data/@name" use="."/>-->

	<xsl:key name="data" match="data[not(contains(@type,'System.Resources.ResXFileRef'))][not(contains(@name,'title'))]" use="'body'"/>
	<xsl:key name="data" match="data[not(contains(@type,'System.Resources.ResXFileRef'))][not(contains(@name,'title'))]" use="'*'"/>
	<xsl:key name="data" match="data/value" use="concat('#',../@name)"/>

	<xsl:key name="widget" match="data[contains(@type,'System.Resources.ResXFileRef')][contains(value,'System.Byte')]/value" use="'video'"/>
	<xsl:key name="widget" match="data[contains(@type,'System.Resources.ResXFileRef')][contains(value,'System.Drawing')]/value" use="'image'"/>

	<xsl:key name="image" match="data[contains(@type,'System.Resources.ResXFileRef')][contains(value,'System.Drawing')]/value" use="'*'"/>
	<xsl:key name="image" match="data[contains(@type,'System.Resources.ResXFileRef')][contains(value,'System.Drawing')]/value" use="concat('#',../@name)"/>
	<xsl:key name="image" match="data[contains(@type,'System.Resources.ResXFileRef')][contains(value,'System.Drawing')]/value" use="../@name"/>
	<xsl:key name="image" match="data[contains(@type,'System.Resources.ResXFileRef')][contains(value,'System.Drawing')]/value" use="substring-after(../@name,':')"/>
	<xsl:key name="image" match="data[contains(@type,'System.Resources.ResXFileRef')][contains(value,'System.Drawing')]/value" use="concat('#',substring-before(../@name,' ('))"/>
	<xsl:key name="image" match="data[not(contains(@type,'System.Resources.ResXFileRef'))][not(comment=../data/@name)]/value" use="comment"/>

	<xsl:key name="file" match="data[contains(@type,'System.Resources.ResXFileRef')]/value" use="'*'"/>
	<xsl:key name="file" match="data[contains(@type,'System.Resources.ResXFileRef')]/value" use="concat('#',../@name)"/>
	<xsl:key name="file" match="data[contains(@type,'System.Resources.ResXFileRef')]/value" use="../@name"/>
	<xsl:key name="file" match="data[contains(@type,'System.Resources.ResXFileRef')]/value" use="substring-after(../@name,':')"/>
	<xsl:key name="file" match="data[contains(@type,'System.Resources.ResXFileRef')]/value" use="concat('#',substring-before(../@name,' ('))"/>
	<xsl:key name="file" match="data[not(contains(@type,'System.Resources.ResXFileRef'))][not(comment=../data/@name)]/value" use="comment"/>
</xsl:stylesheet>