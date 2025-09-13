<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml" xmlns:session="http://panax.io/session">
	<xsl:param name="session:phone">'0000000000'</xsl:param>
	<xsl:template match="/*">
		<nav class="navbar navbar-expand-lg fixed-top navbar-dark" xo-stylesheet="navbar.xslt">
			<script src="./js/script.js" defer="defer"></script>
			<div class="container">
				<a class="navbar-brand logo-text text-uppercase" href="/#" style="max-width: 35vw;">
					<img src="/assets/img/brand.png" class="inverted" style="height: 5mm;"/>
				</a>
				<button class="navbar-toggler p-0 border-0" type="button" data-bs-toggle="collapse" data-bs-target="#site-navbar" aria-controls="navbarToggleExternalContent" aria-label="Toggle navigation">
					<span class="navbar-toggler-icon"></span>
				</button>

				<div class="navbar-collapse offcanvas-collapse px-3" id="site-navbar" style="background-color: var(--title-bg-color);
    ">		</div>
				<div class="bandcontact px-3" style="background-color: var(--contactband-bg-color); max-width: 35vw;">
					<div class="bandcontactbox" style="justify-content: center; display: flex; align-items: center; flex-direction: column; height: 60px;">
						<xsl:variable name="phone" select="translate($session:phone,'-','')"/>
						<a href="tel:{$phone}" title="Contacto" class="bandcontactinfo" style="line-height: 1.5rem;">
							<xsl:value-of select="concat(
							  substring($phone, 1, 3), '-', 
							  substring($phone, 4, 3), '-', 
							  substring($phone, 7))"/>
						</a>
						<p class="bandcontactlabel mt-1 d-none d-sm-flex">
							Contáctanos
						</p>
					</div>
				</div>
			</div>
		</nav>
	</xsl:template>
</xsl:stylesheet>