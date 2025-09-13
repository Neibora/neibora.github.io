<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml">
	<xsl:template match="/*">
		<div>
			<xsl:for-each select="data">
				<xsl:variable name="show">
					<xsl:if test="position()=1">show active</xsl:if>
				</xsl:variable>
				<xsl:variable name="desarrollo" select="@name"/>
				<div class="tab-pane fade {$show}" id="list-{$desarrollo}" role="tabpanel" aria-labelledby="list-{$desarrollo}-list">
					<xsl:apply-templates select="current()" mode="gallery">
						<xsl:sort select="comment"/>
						<xsl:sort select="value"/>
					</xsl:apply-templates>
				</div>
			</xsl:for-each>
		</div>
	</xsl:template>

	<xsl:template match="*" mode="gallery">
		<xsl:param name="desarrollo" select="@name"/>
		<div id="carousel_{$desarrollo}" class="carousel slide" data-bs-ride="carousel" data-bs-interval="5000">
			<div class="carousel-inner" xo-source="#{$desarrollo}:gallery" xo-stylesheet="desarrollos-gallery.xslt" desarrollo="{$desarrollo}">
				<div class="carousel-item">
					<img src="./assets/desarrollos/{$desarrollo}/cover.jpg" alt="" class="img-fluid d-block w-100" />
				</div>
			</div>
			<button class="carousel-control-prev" type="button" data-bs-target="#carousel_{$desarrollo}" data-bs-slide="prev">
				<span class="carousel-control-prev-icon" aria-hidden="true"></span>
				<span class="visually-hidden">Previous</span>
			</button>
			<button class="carousel-control-next" type="button" data-bs-target="#carousel_{$desarrollo}" data-bs-slide="next">
				<span class="carousel-control-next-icon" aria-hidden="true"></span>
				<span class="visually-hidden">Next</span>
			</button>
		</div>
		<xsl:if test="position()=last()">
			<script>
				<![CDATA[
			initialize_carousel();
			]]>
			</script>
		</xsl:if>
		<!--<div class="tab-pane fade" id="list-{$desarrollo}" role="tabpanel" aria-labelledby="list-{$desarrollo}-list">
			<img src="/assets/desarrollos/{$desarrollo}/cover.png" alt="" class="img-fluid"/>
		</div>-->
		<!--<div class="tab-pane fade" id="list-altanna" role="tabpanel" aria-labelledby="list-altanna-list" xo-source="#altanna:gallery" xo-stylesheet="gallery.xslt">
		</div>-->
	</xsl:template>

</xsl:stylesheet>