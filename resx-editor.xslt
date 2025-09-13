<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml">
	<!-- Template for the root element -->
	<xsl:template match="/">
		<dialog class="xover-component" open="" style="position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 800px;
    z-index: 999;">
			<style><![CDATA[
				table {
				border-collapse: collapse;
				width: 100%;
				}

				th, td {
				border: 1px solid #ddd;
				padding: 8px;
				text-align: left;
				}

				th {
				background-color: #f2f2f2;
				}

				tr:nth-child(even) {
				background-color: #f9f9f9;
				}

				input[type="text"],
				textarea {
				width: 100%;
				padding: 4px;
				border: none;
				box-sizing: border-box;
				}

				textarea {
				height: 80px;
				}

				input[type="file"] {
				width: auto;
				padding: 4px;
				border: none;
				background-color: transparent;
				color: blue;
				text-decoration: underline;
				cursor: pointer;
				}
			]]></style>
			<form method="dialog" onsubmit="saveResx(this.scope); closest('dialog').remove()">
				<table>
					<thead>
						<tr>
							<th>Recurso</th>
							<th>Contenido</th>
							<th>Comentario</th>
						</tr>
						<tbody>
							<xsl:apply-templates select="root/data">
								<xsl:sort select="@name"/>
							</xsl:apply-templates>
						</tbody>
					</thead>
				</table>
				<menu class="d-flex justify-content-around">
					<button type="submit">Guardar cambios</button>
					<button type="button" onclick="closest('dialog').remove()">Cerrar</button>
				</menu>
			</form>
		</dialog>
	</xsl:template>

	<!-- Template for data elements -->
	<xsl:template match="data">
		<tr>
			<xsl:apply-templates select="@name" />
			<xsl:apply-templates select="value" />
			<xsl:apply-templates select="comment" />
		</tr>
	</xsl:template>

	<xsl:template match="value|comment">
		<td contenteditable="" xo-slot="text()">
			<xsl:value-of select="."/>
		</td>
	</xsl:template>

	<xsl:template match="@name">
		<td contenteditable="">
			<xsl:value-of select="."/>
		</td>
	</xsl:template>
</xsl:stylesheet>
