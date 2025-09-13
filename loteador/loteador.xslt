<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml" xmlns:state="http://panax.io/state">
	<xsl:param name="state:desarrollo">(location.hash || '').replace(/^#/,'')</xsl:param>
	<xsl:template match="/">
		<script type="text/javascript" defer="defer" src="./jquery.maphilight.js"></script>
		<script type="text/javascript" defer="defer" src="./mapselection.js?v={$state:desarrollo}_20250121">loteador.inicializar()</script>
		<style>
			<![CDATA[
#Mapa .map {
	background: url('/assets/]]><xsl:value-of select="$state:desarrollo"/><![CDATA[/loteador.png');
	background-size: 100%;
	background-repeat: no-repeat;
	width: 100%;
}
]]>
		</style>
		<img src="../assets/desarrollos/{$state:desarrollo}/loteador.png" orgwidth="4656" width="500" border="0" usemap="#map" class="map" />
		<map name="map"/>
	</xsl:template>
</xsl:stylesheet>