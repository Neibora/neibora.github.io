<xsl:stylesheet version="1.0" xmlns="http://www.w3.org/1999/xhtml" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xo="http://panax.io/xover" xmlns:state="http://panax.io/state" xmlns:searchParams="http://panax.io/site/searchParams" exclude-result-prefixes="xsl xo state">
	<xsl:import href="gallery.xslt"/>
	<xsl:param name="state:desarrollo"></xsl:param>
	<!--<xsl:param name="searchParams:edit">xover.site.querystring.has("edit")</xsl:param>-->
	<xsl:param name="searchParams:edit">(value)=>value!=undefined</xsl:param>
	<xsl:key name="section" match="data[starts-with(@name,'section_')]" use="''"/>
	<xsl:key name="section" match="data[starts-with(@name,'section_')]" use="string(comment)"/>
	<xsl:key name="section" match="data[starts-with(@name,'section_')]" use="substring-after(@name,'_')"/>
	<xsl:key name="section" match="data[contains(@type,'System.Resources.ResXFileRef')]/value" use="../@name"/>
	<xsl:key name="image" match="data[contains(@type,'System.Resources.ResXFileRef')]/value" use="../@name"/>
	<xsl:key name="image" match="data[not(contains(@type,'System.Resources.ResXFileRef'))][not(comment=../data/@name)]" use="comment"/>
	<xsl:key name="label" match="data" use="@name"/>
	<xsl:template match="/*">
		<xsl:variable name="sections" select="key('section','')"/>
		<main class="desarrollo-info">
			<xsl:attribute name="xo-source">#{$state:desarrollo}:info</xsl:attribute>
			<!-- Section Desarrollos -->
			<header class="d-flex align-items-center no-background banner" style="background: repeating-linear-gradient( 55deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2) 9px, rgba(0, 0, 1, 0.3) 9px, rgba(0, 0, 1, 0.3) 18px); height: 230px;" >
				<script>context.addEventListener('error', function(){alert()})</script>
				<style>
					<![CDATA[
.section {
  background-color: orange;
  color: var(--main-bg-color);
  border-top: 1px solid #000;
  padding: 10px;
}

section div.row {
    min-width: 80vw;
}

section img {
    width: 100%;
}

section > div {
    justify-content: center;
    display: flex;
    flex-direction: column;
}

.contenteditable {
	border: dashed gray 2pt;
}

header .desarrollos-content img {
    max-width: 90%;
    height: auto;
}
]]>
				</style>
				<script>
					<![CDATA[
				function duplicar(source) {
					let new_name = source.getAttribute("name")+'_bis';
					let new_node = xo.xml.createNode(`<data xml:space="preserve" name="${new_name}"><value/><comment/></data>`);
					source.appendAfter(new_node)
				}
			]]>
				</script>
				<!--background: url(/assets/desarrollos/{$state:desarrollo}/banner.png)-->
				<div style="height: 100%; width: 100%; background: url(/assets/desarrollos/{$state:desarrollo}/cintillo.jpg) no-repeat center center/cover; background-position-y: center;">
					<div class="container">
						<div class="desarrollos-content position-relative">
							<div class="container">
								<div class="row">
									<div class="col-sm-12">
										<div class="desarrollos-info">
											<!--<h2 class="banner-title text-uppercase text-center headline">
										
									</h2>
									<p class="py-3 h5 text-uppercase text-center">
										<xsl:value-of select="key('label','motto')"/>
									</p>-->
											<div class="d-flex justify-content-center align-items-center" style="height: 230px;">
												<img src="/assets/desarrollos/{$state:desarrollo}/logo.png" alt="" class="me-4 rounded logo-footer" style="max-height: 200px; filter: brightness(0) invert(1); width: auto;"/>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</header>
			<xsl:apply-templates mode="section" select="$sections">
				<xsl:sort select="@name"/>
			</xsl:apply-templates>
			<footer>
				<xsl:apply-templates mode="store-buttons" select="."/>
			</footer>
		</main>
	</xsl:template>

	<xsl:template mode="title" match="*|@name">
	</xsl:template>

	<xsl:template mode="title" match="data/value[contains(.,':')]">
		<xsl:value-of select="substring-before(.,':')"/>
	</xsl:template>

	<xsl:template mode="title" match="data/@name[contains(.,':')]">
		<xsl:value-of select="substring-after(.,':')"/>
	</xsl:template>

	<xsl:template mode="title" match="data[contains(concat(value,@name),':')]">
		<xsl:variable name="extra-classes">
			<xsl:if test="$searchParams:edit='true'">pb-4</xsl:if>
		</xsl:variable>
		<div class="text-center pb-2 {$extra-classes}">
			<h4 class="text-uppercase">
				<xsl:apply-templates mode="title" select="value|@name"/>
			</h4>
		</div>
	</xsl:template>

	<xsl:template mode="content" match="*">
		<xsl:value-of select="."/>
	</xsl:template>

	<xsl:template mode="content" match="value[contains(text(),':')]">
		<xsl:value-of select="substring-after(.,':')"/>
	</xsl:template>

	<xsl:template mode="content" match="data">
		<xsl:variable name="extra-classes">
			<xsl:if test="$searchParams:edit='true'">pb-4</xsl:if>
		</xsl:variable>
		<xsl:variable name="contenteditable">
			<xsl:if test="$searchParams:edit='true'">contenteditable</xsl:if>
		</xsl:variable>
		<div style="text-align: center;" class="{$contenteditable}" xo-scope="{value/@xo:id}" xo-slot="text()">
			<p style="display: inline-block; text-align: justify; max-width: 100%;" xo-scope="{value/@xo:id}" xo-slot="text()">
				<xsl:if test="$searchParams:edit='true'">
					<xsl:attribute name="contenteditable"/>
				</xsl:if>
				<xsl:apply-templates mode="content" select="value"/>
			</p>
		</div>
	</xsl:template>

	<xsl:template mode="position" match="*">
		<xsl:text>1</xsl:text>
	</xsl:template>

	<xsl:template mode="position" match="data[contains(@name,'_')]">
		<xsl:value-of select="substring-after(substring-before(concat(@name,':'),':'),'_')"/>
	</xsl:template>

	<xsl:template mode="section" match="data">
	</xsl:template>

	<xsl:template mode="section" match="key('section','')">
		<xsl:variable name="title" select="substring-before(concat(value,':'),':')"/>
		<xsl:variable name="paragraph" select="normalize-space(substring-after(concat(value,':'),':'))"/>
		<xsl:variable name="position">
			<xsl:apply-templates mode="position" select="."/>
		</xsl:variable>
		<xsl:variable name="section-background">
			<xsl:choose>
				<xsl:when test="$position mod 2 =1">section-light</xsl:when>
				<xsl:otherwise>section-dark</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<section class="{$section-background} section-hd align-items-center py-4 d-flex flex-column" id="{@name}">
			<div class="container py-3">
				<xsl:apply-templates mode="title" select="."/>
				<xsl:apply-templates mode="content" select="."/>
				<xsl:apply-templates mode="section-image" select="key('image',comment)"/>
			</div>
		</section>
		<xsl:apply-templates mode="section-divider" select="."/>
	</xsl:template>

	<xsl:template mode="section-image-src" match="*">
	</xsl:template>

	<xsl:template mode="section-image-src" match="value">
		<xsl:attribute name="src">
			<xsl:text>/assets/desarrollos/</xsl:text>
			<xsl:value-of select="$state:desarrollo"/>
			<xsl:text>/</xsl:text>
			<xsl:value-of select="substring-before(.,';')"/>
		</xsl:attribute>
	</xsl:template>

	<xsl:template mode="section-image" match="*">
	</xsl:template>

	<xsl:template mode="section-image" match="data[count(key('image',comment))=1]">
		<div class="row pt-2">
			<div class="text-center">
				<img src="/assets/desarrollos/{$state:desarrollo}/{comment}.jpg" alt=""/>
			</div>
		</div>
	</xsl:template>

	<xsl:template mode="section-image" match="data[contains(@type,'System.Resources.ResXFileRef')]/value">
		<div class="row pt-2">
			<div class="text-center">
				<img src="/assets/desarrollos/{$state:desarrollo}/{substring-before(.,';')}" alt=""/>
			</div>
		</div>
	</xsl:template>

	<xsl:template mode="section-image" match="key('section','loteador')" priority="5">
		<div class="row pt-2">
			<a href="/loteador#{$state:desarrollo}">
				<img class="map" src="/assets/desarrollos/{$state:desarrollo}/loteador.png" border="0" orgwidth="3800" style="width: 100%; height: 100%; background: var(--brand-dark-color);" alt="">
					<xsl:apply-templates mode="section-image-src" select="."/>
				</img>
				<label style="
    color: var(--brand-creen-snow);
    text-align: right;
    position: absolute;
	bottom: 7vh;
    right: 7vw;
	cursor: pointer;
">
					<button class="btn btn-primary" style="margin: .7rem; font-size: 18pt;">Click para ver disponibilidad</button>
				</label>
			</a>
		</div>
	</xsl:template>

	<xsl:template mode="section-image" match="key('section','gallery')" priority="5">
		<style>
			<![CDATA[
			.carousel-item img {
				min-height: 65vh;
				max-height: 65vh;
			}]]>
		</style>
		<xsl:apply-templates mode="gallery" select=".">
			<xsl:with-param name="desarrollo" select="$state:desarrollo"/>
		</xsl:apply-templates>
	</xsl:template>

	<xsl:template mode="store-buttons" match="*">
		<xsl:if test="$searchParams:edit='true'">
			<div class="d-flex justify-content-center align-items-center py-3">
				<button class="" onclick="saveResx(scope)">Guardar</button>
			</div>
		</xsl:if>
	</xsl:template>

	<xsl:template mode="section-divider" match="*">
		<xsl:if test="$searchParams:edit='true'">
			<div class="section">
				<a id="{@xo:id}" href="#" onclick="duplicar(scope)" class="d-flex justify-content-center align-items-center">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle-dotted" viewBox="0 0 16 16">
						<path d="M8 0c-.176 0-.35.006-.523.017l.064.998a7.117 7.117 0 0 1 .918 0l.064-.998A8.113 8.113 0 0 0 8 0zM6.44.152c-.346.069-.684.16-1.012.27l.321.948c.287-.098.582-.177.884-.237L6.44.153zm4.132.271a7.946 7.946 0 0 0-1.011-.27l-.194.98c.302.06.597.14.884.237l.321-.947zm1.873.925a8 8 0 0 0-.906-.524l-.443.896c.275.136.54.29.793.459l.556-.831zM4.46.824c-.314.155-.616.33-.905.524l.556.83a7.07 7.07 0 0 1 .793-.458L4.46.824zM2.725 1.985c-.262.23-.51.478-.74.74l.752.66c.202-.23.418-.446.648-.648l-.66-.752zm11.29.74a8.058 8.058 0 0 0-.74-.74l-.66.752c.23.202.447.418.648.648l.752-.66zm1.161 1.735a7.98 7.98 0 0 0-.524-.905l-.83.556c.169.253.322.518.458.793l.896-.443zM1.348 3.555c-.194.289-.37.591-.524.906l.896.443c.136-.275.29-.54.459-.793l-.831-.556zM.423 5.428a7.945 7.945 0 0 0-.27 1.011l.98.194c.06-.302.14-.597.237-.884l-.947-.321zM15.848 6.44a7.943 7.943 0 0 0-.27-1.012l-.948.321c.098.287.177.582.237.884l.98-.194zM.017 7.477a8.113 8.113 0 0 0 0 1.046l.998-.064a7.117 7.117 0 0 1 0-.918l-.998-.064zM16 8a8.1 8.1 0 0 0-.017-.523l-.998.064a7.11 7.11 0 0 1 0 .918l.998.064A8.1 8.1 0 0 0 16 8zM.152 9.56c.069.346.16.684.27 1.012l.948-.321a6.944 6.944 0 0 1-.237-.884l-.98.194zm15.425 1.012c.112-.328.202-.666.27-1.011l-.98-.194c-.06.302-.14.597-.237.884l.947.321zM.824 11.54a8 8 0 0 0 .524.905l.83-.556a6.999 6.999 0 0 1-.458-.793l-.896.443zm13.828.905c.194-.289.37-.591.524-.906l-.896-.443c-.136.275-.29.54-.459.793l.831.556zm-12.667.83c.23.262.478.51.74.74l.66-.752a7.047 7.047 0 0 1-.648-.648l-.752.66zm11.29.74c.262-.23.51-.478.74-.74l-.752-.66c-.201.23-.418.447-.648.648l.66.752zm-1.735 1.161c.314-.155.616-.33.905-.524l-.556-.83a7.07 7.07 0 0 1-.793.458l.443.896zm-7.985-.524c.289.194.591.37.906.524l.443-.896a6.998 6.998 0 0 1-.793-.459l-.556.831zm1.873.925c.328.112.666.202 1.011.27l.194-.98a6.953 6.953 0 0 1-.884-.237l-.321.947zm4.132.271a7.944 7.944 0 0 0 1.012-.27l-.321-.948a6.954 6.954 0 0 1-.884.237l.194.98zm-2.083.135a8.1 8.1 0 0 0 1.046 0l-.064-.998a7.11 7.11 0 0 1-.918 0l-.064.998zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z"/>
					</svg>
				</a>
			</div>
		</xsl:if>
	</xsl:template>
</xsl:stylesheet>