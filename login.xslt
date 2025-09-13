<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml"
xmlns:xo="http://panax.io/xover"
xmlns:session="http://panax.io/session"
xmlns:sitemap="http://panax.io/sitemap"
xmlns:shell="http://panax.io/shell"
xmlns:state="http://panax.io/state"
xmlns:site="http://panax.io/site"
xmlns:debug="http://panax.io/debug"
xmlns:meta="http://panax.io/site/meta"
				
xmlns:js="http://panax.io/languages/javascript"
xmlns:login="http://widgets.panaxbi.com/login"
>
	<xsl:output method="xml"
	   omit-xml-declaration="yes"
	   indent="yes"/>

	<xsl:param name="session:debug"/>

	<xsl:param name="session:user_login"/>
	<xsl:param name="session:status"/>
	<xsl:param name="session:connection_id"/>
	<xsl:param name="js:year">new Date().getFullYear()</xsl:param>
	<xsl:param name="js:secure"><![CDATA[location.protocol.indexOf('https')!=-1 || location.hostname=='localhost']]></xsl:param>
	<xsl:param name="site:seed"/>
	<xsl:param name="site:location-host"/>
	<xsl:param name="site:location-pathname"/>
	<xsl:param name="meta:google-signin-client_id"/>

	<xsl:template match="/" priority="-1">
		<xsl:apply-templates mode="login:widget"/>
	</xsl:template>

	<xsl:template match="*" mode="login:widget">
		<div class="login" xo:use-attribute-sets="login:widget">
			<xsl:if test="$js:secure='true'">
				<link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" type="text/css"/>
				<script src="https://accounts.google.com/gsi/client" async="" defer=""></script>
				<!--<script src="https://apis.google.com/js/platform.js" async="" defer=""></script>-->
			</xsl:if>
			<script src="login.js" fetchpriority="high"/>
			<form class="form-signin" onsubmit="var username=document.getElementById('username'); var password=document.getElementById('password'); xover.session.login( username, password, `{$session:connection_id}`);" action="javascript:void(0);">
				<xsl:if test="$session:status='authorized'">
					<xsl:attribute name="onsubmit"></xsl:attribute>
					<xsl:attribute name="action">#</xsl:attribute>
				</xsl:if>
				<div class="container">
					<div>
						<xsl:apply-templates mode="login:button" select="."/>
					</div>
					<div xo-static="">
						<xsl:if test="$js:secure='true'">
							<xsl:if test="$meta:google-signin-client_id!='' and $js:secure='true' and $session:status!='authorizing'">
								<!--<div class="g-signin2" data-onsuccess="onGoogleLogin" ></div>-->
								<div id="g_id_onload"
								data-client_id="{$meta:google-signin-client_id}"
								data-callback="onGoogleLogin"
								data-auto_prompt="true"
								xo-scope=""
								>
								</div>
							</xsl:if>
						</xsl:if>
					</div>
				</div>
			</form>
		</div>
	</xsl:template>

	<xsl:template mode="login:button" match="*|@*">
		<button class="p-3" type="submit">
			<xsl:choose>
				<xsl:when test="$session:status='authorized'">
					<xsl:attribute name="type">button</xsl:attribute>
					<xsl:attribute name="onclick">xo.session.logout()</xsl:attribute>
					<xsl:text>Bienvenido, </xsl:text>
					<xsl:value-of select="$session:user_login"/>
				</xsl:when>
				<xsl:when test="$meta:google-signin-client_id!='' and $session:status!='authorized'">
					<xsl:attribute name="style">display:none !important;</xsl:attribute>
				</xsl:when>
				<xsl:when test="$session:status='authorizing'">
					Autorizando... <i class="fas fa-spinner fa-spin"></i>
				</xsl:when>
				<xsl:otherwise>Ingresar</xsl:otherwise>
			</xsl:choose>
		</button>
		<xsl:if test="$js:secure='true'">
			<div class="g_id_signin signup_button" 
				 data-type="standard"
				 data-size="large"
				 data-theme="outline"
				 data-text="sign_in_with"
				 data-shape="rectangular"
				 data-logo_alignment="left"
				 xo-scope=""
				 xo-static="*"
		>
				<xsl:choose>
					<xsl:when test="$session:status='authorized'">
						<xsl:attribute name="style">display:none !important;</xsl:attribute>
					</xsl:when>
				</xsl:choose>
			</div>
		</xsl:if>
	</xsl:template>
</xsl:stylesheet>
