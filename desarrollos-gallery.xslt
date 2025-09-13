<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml" exclude-result-prefixes="xsl">
	<xsl:param name="desarrollo"></xsl:param>
	<xsl:template match="/*">
		<xsl:variable name="images" select="data|self::*[not(data)]"/>
		<div class="carousel-inner" desarrollo="{$desarrollo}">
			<xsl:apply-templates select="$images">
				<xsl:sort select="comment"/>
				<xsl:sort select="value"/>
			</xsl:apply-templates>
		</div>
	</xsl:template>

	<xsl:template match="*">
		<div class="carousel-item active">
			<style>
				.wrapper_span {
				width: 300px;
				height: 60px;
				position: relative;
				left: 50%;
				transform: translate(-50%, -50%);
				}

				/*.wrapper_span span.loading_span {
				color: #000000;
				font-size: 20px;
				font-weight: 600;
				}*/
				.wrapper_span span.loading_span {
				color: var(--main-bg-color,#00B0AD);
				font-size: 20px;
				font-weight: 600;
				position: absolute;
				top: 95px;
				left: 35%;
				}

				.circle_loading {
				width: 20px;
				height: 20px;
				position: absolute;
				border-radius: 50%;
				background-color: #00B0AD;
				left: 15%;
				transform-origin: 50%;
				animation: circle_loading .5s alternate infinite ease;
				}

				@keyframes circle_loading {
				0% {
				top: 60px;
				height: 5px;
				border-radius: 50px 50px 25px 25px;
				transform: scaleX(1.7);
				}

				40% {
				height: 20px;
				border-radius: 50%;
				transform: scaleX(1);
				}

				100% {
				top: 0%;
				}
				}

				.circle_loading:nth-child(2) {
				left: 45%;
				animation-delay: .2s;
				}

				.circle_loading:nth-child(3) {
				left: auto;
				right: 15%;
				animation-delay: .3s;
				}

				.shadow_loading {
				width: 20px;
				height: 4px;
				border-radius: 50%;
				background-color: rgba(0,0,0,.5);
				position: absolute;
				top: 62px;
				transform-origin: 50%;
				z-index: -1;
				left: 15%;
				filter: blur(1px);
				animation: shadow_loading .5s alternate infinite ease;
				}

				@keyframes shadow_loading {
				0% {
				transform: scaleX(1.5);
				}

				40% {
				transform: scaleX(1);
				opacity: .7;
				}

				100% {
				transform: scaleX(.2);
				opacity: .4;
				}
				}

				.shadow_loading:nth-child(4) {
				left: 45%;
				animation-delay: .2s
				}

				.shadow_loading:nth-child(5) {
				left: auto;
				right: 15%;
				animation-delay: .3s;
				}
			</style>
			<img/>
			<div class="circle_loading"></div>
			<div class="circle_loading"></div>
			<div class="circle_loading"></div>
			<div class="shadow_loading"></div>
			<div class="shadow_loading"></div>
			<div class="shadow_loading"></div>
			<span class="loading_span">Cargando...</span>
		</div>
	</xsl:template>

	<xsl:template match="data">
		<xsl:variable name="src" select="substring-before(value,';')"/>
		<xsl:variable name="active">
			<xsl:if test="position()=1">active</xsl:if>
		</xsl:variable>
		<div class="carousel-item {$active}">
			<img class="d-block w-100" src="./assets/desarrollos/{$desarrollo}/{$src}" alt="{$desarrollo}" fetchPriority="low"/>
		</div>
	</xsl:template>
</xsl:stylesheet>