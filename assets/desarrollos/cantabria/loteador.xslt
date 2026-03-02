<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml" xmlns:state="http://panax.io/state" xmlns:session="http://panax.io/session">
	<xsl:param name="state:desarrollo">(xover.site.seed || '').replace(/^#/,'')</xsl:param>
	<xsl:param name="session:status"></xsl:param>
	<xsl:param name="session:user_login"></xsl:param>
	<xsl:template match="/">
		<div id="loteador" class="draggable" style=" width: 100px;
            height: 100vh;
            width: 100vw;
            position: absolute;
            top: 0;
            left: 0;
            cursor: grab;
            user-select: none;
            transition: transform 0.1s ease-out; ">
			<script type="text/javascript" defer="defer" src="../../../loteador/jquery.maphilight.js"></script>
			<script type="text/javascript" defer="defer" src="../../../loteador/mapselection.js?v={$state:desarrollo}_20250121">loteador.inicializar()</script>
			<style>
				<![CDATA[#Mapa .map {
	background: url('../assets/desarrollos/]]><xsl:value-of select="$state:desarrollo"/><![CDATA[/loteador.png');
	background-size: 100%;
	background-repeat: no-repeat;
	width: 100%;
}]]>
			</style>
			<img src="/assets/desarrollos/{$state:desarrollo}/loteador.jpg" orgwidth="1809" width="1809" border="0" usemap="#map" class="map" />

			<map name="map" xo-source="/assets/desarrollos/{$state:desarrollo}/loteador.map" shadowrootmode="composed" xo-swap="self::*">
			</map>
		</div>
	</xsl:template>
</xsl:stylesheet>