<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml" xmlns:env="http://panax.io/state/environment">
	<xsl:import href="keys.xslt"/>
	<xsl:import href="common.xslt"/>
	<xsl:key name="valid-model" match="root[@env:store='#aviso_privacidad']" use="generate-id()"/>
	<xsl:key name="valid-model" match="root[@env:store='#codigo_etica']" use="generate-id()"/>
	<xsl:key name="valid-model" match="root[@env:store='#terminos_condiciones']" use="generate-id()"/>
	<xsl:template match="/*">
		<div class="offcanvas offcanvas-bottom" xo-static="@style @role @aria-modal">
			<script><![CDATA[bootstrap.Offcanvas.getOrCreateInstance(context.closest('.offcanvas')).show()]]></script>
			<div class="offcanvas-header">
				<xsl:apply-templates select="data[@name='title']"/>
				<button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
			</div>
			<div class="offcanvas-body small">
				<xsl:apply-templates select="data[@name!='title']"/>
			</div>
		</div>
	</xsl:template>

	<xsl:template match="data[contains(@name,'title')]">
		<h5 class="offcanvas-title" id="offcanvasBottomLabel">
			<xsl:apply-templates/>
		</h5>
	</xsl:template>

	<xsl:template match="data[contains(@name,'paragraph')]">
		<p>
			<xsl:apply-templates/>
		</p>
	</xsl:template>

	<xsl:template match="root[not(key('valid-model', generate-id()))]/data">
		<script><![CDATA[bootstrap.Offcanvas.getOrCreateInstance(context.closest('.offcanvas')).hide()]]></script>
	</xsl:template>

</xsl:stylesheet>