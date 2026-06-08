<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml" exclude-result-prefixes="xsl"
>
	<xsl:key name="title" match="data[@name='title']" use="''"/>
	<xsl:key name="feature" match="data[starts-with(@name,'item_')]" use="''"/>
	<xsl:key name="feature" match="data[starts-with(@name,'item_')]" use="string(comment)"/>

	<xsl:template match="/*">
		<xsl:variable name="title" select="key('title','')"/>
		<div class="container text-dark">
			<div class="text-center pb-4">
				<h4 class="py-2"><xsl:apply-templates select="$title"/></h4>
			</div>
			<div class="container-fluid">
				<div class="row text-dark">
					<xsl:apply-templates mode="caracteristicas-item" select="key('feature','')">
						<!--<xsl:sort select="@name" data-type="text"/>-->
					</xsl:apply-templates>
				</div>
			</div>

		</div>
	</xsl:template>

	<xsl:template mode="caracteristicas-item-title" match="*">
		<xsl:value-of select="substring-before(.,':')"/>
	</xsl:template>

	<xsl:template mode="caracteristicas-item-text" match="*">
		<xsl:value-of select="substring-after(.,':')"/>
	</xsl:template>

	<xsl:template mode="caracteristicas-item" match="*">
		<div class="col-lg-4 text-center p-5" data-aos="zoom-in">
			<xsl:apply-templates mode="caracteristicas-item-icon" select="."/>
			<h4 class="py-3">
				<xsl:apply-templates select="value" mode="caracteristicas-item-title"/>
			</h4>
			<p class="para-light">
				<xsl:apply-templates select="value" mode="caracteristicas-item-text"/>
			</p>
		</div>
	</xsl:template>

	<xsl:template mode="caracteristicas-item-icon" match="*">
		<i class="{comment} fa-2x py-2"></i>
	</xsl:template>

	<xsl:template mode="caracteristicas-item-icon" match="key('feature','marker')">
		<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor" class="bi bi-geo-alt fas fa-3x p-2" viewBox="0 0 16 16">
			<path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z" />
			<path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
		</svg>
	</xsl:template>

	<xsl:template mode="caracteristicas-item-icon" match="key('feature','camera')">
		<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor" class="bi bi-camera-video fas fa-3x p-2" viewBox="0 0 16 16">
			<path fill-rule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556v4.35zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H2z" />
		</svg>
	</xsl:template>

	<xsl:template mode="caracteristicas-item-icon" match="key('feature','pine')">
		<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor" class="bi bi-tree fas fa-3x p-2" viewBox="0 0 16 16">
			<path d="M8.416.223a.5.5 0 0 0-.832 0l-3 4.5A.5.5 0 0 0 5 5.5h.098L3.076 8.735A.5.5 0 0 0 3.5 9.5h.191l-1.638 3.276a.5.5 0 0 0 .447.724H7V16h2v-2.5h4.5a.5.5 0 0 0 .447-.724L12.31 9.5h.191a.5.5 0 0 0 .424-.765L10.902 5.5H11a.5.5 0 0 0 .416-.777l-3-4.5zM6.437 4.758A.5.5 0 0 0 6 4.5h-.066L8 1.401 10.066 4.5H10a.5.5 0 0 0-.424.765L11.598 8.5H11.5a.5.5 0 0 0-.447.724L12.69 12.5H3.309l1.638-3.276A.5.5 0 0 0 4.5 8.5h-.098l2.022-3.235a.5.5 0 0 0 .013-.507z" />
		</svg>
	</xsl:template>
</xsl:stylesheet>