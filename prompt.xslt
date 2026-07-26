<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:xo="http://panax.io/xover"
  xmlns="http://www.w3.org/1999/xhtml"
	>

	<xsl:output method="html" indent="yes"/>

	<xsl:template match="Routine">
		<script>
			<![CDATA[
xover.listener.on('append::dialog', function () {
	if (!this.open) {
		switch (this.getAttribute('role') || this.role) {
			case 'modeless':
				this.show?.();
				break;

			case 'modal':
			default:
				this.showModal?.();
				break;
		}
	}
});

submit_prompt = function (event) {
	if (event.submitter.value != 'ok') {
		return;
	}
	event.preventDefault();
	let dialog = this.closest('dialog');
	let values = Object.fromEntries(new FormData(this));
	let request = dialog.scope.source.url.request;
	for (let [name, value] of Object.entries(values)) {
		request.parameters[name] = value;
	}
	request.fetch();
	dialog.close('ok');
};
xover.listener.on('submit::dialog.prompt form', submit_prompt);
			]]>
		</script>
		<dialog class="prompt">
			<header>
				<h2>Información requerida para <xsl:value-of select="@Name"/></h2>
			</header>
			<form method="dialog">
				<xsl:for-each select="//parameter[@missing='true']">
					<div class="field">
						<label>
							<xsl:value-of select="@name"/>
						</label>
						<input name="{@name}" xo-slot="value">
							<xsl:if test="@value">
								<xsl:attribute name="value">
									<xsl:value-of select="@value"/>
								</xsl:attribute>
							</xsl:if>
					</input>
					</div>
				</xsl:for-each>
				<footer>
					<button value="cancel">
						Cancelar
					</button>

					<button value="ok">
						Continuar
					</button>
				</footer>

			</form>

		</dialog>

	</xsl:template>

</xsl:stylesheet>