<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml">

	<xsl:output method="html" indent="yes" encoding="utf-8"/>
	<xsl:strip-space elements="*"/>

	<!-- ===== Helpers ===== -->

	<!-- Formato moneda simple (MXN). -->
	<xsl:template name="money">
		<xsl:param name="v"/>
		<xsl:text>$</xsl:text>
		<xsl:value-of select="format-number(number($v), '#,##0.00')"/>
	</xsl:template>

	<!-- porcentaje con 1 decimal: round(x*10)/10 -->
	<xsl:template name="pct1">
		<xsl:param name="num"/>
		<xsl:param name="den"/>
		<xsl:choose>
			<xsl:when test="number($den) &gt; 0">
				<xsl:variable name="p" select="round( (number($num) * 1000) div number($den) ) div 10"/>
				<xsl:value-of select="format-number($p, '0.0')"/>
			</xsl:when>
			<xsl:otherwise>0.0</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<xsl:template name="sumPrecios">
		<xsl:param name="nodes" select="/Cotizacion/Tabla/Seccion/Partida"/>
		<xsl:param name="i" select="1"/>
		<xsl:param name="acc" select="0"/>

		<xsl:choose>
			<xsl:when test="$i &gt; count($nodes)">
				<xsl:value-of select="$acc"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:variable name="n" select="$nodes[$i]"/>
				<xsl:variable name="v" select="number($n/@precio)"/>
				<xsl:call-template name="sumPrecios">
					<xsl:with-param name="nodes" select="$nodes"/>
					<xsl:with-param name="i" select="$i + 1"/>
					<xsl:with-param name="acc" select="$acc + $v"/>
				</xsl:call-template>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<!-- ===== Root ===== -->

	<xsl:template match="/Cotizacion">
		<xsl:variable name="ingreso"
	select="
		(number(Condominio/departamentos/@cantidad) * number(Condominio/departamentos/@cuota)) +
		(number(Condominio/casas/@cantidad) * number(Condominio/casas/@cuota)) +
		(number(Condominio/lotes/@cantidad) * number(Condominio/lotes/@cuota))
	"/>

		<xsl:variable name="total">
			<xsl:call-template name="sumPrecios">
				<xsl:with-param name="nodes" select="Tabla/Seccion/Partida"/>
			</xsl:call-template>
		</xsl:variable>
		<xsl:variable name="totalN" select="number($total)"/>
		<section class="mx-auto py-8 px-4 sm:px-6 max-w-7xl">
			<style>
				<![CDATA[
.warning {
	background-color: #ffe5e5 !important;
	border-left: 6px solid #dc3545;
	color: #7f1d1d;
	font-weight: 600;
}]]>
			</style>
			<div class="bg-white dark:bg-slate-900 shadow-2xl rounded-xl overflow-hidden print-shadow-none border border-slate-200 dark:border-slate-800">
				<div class="h-2 bg-gradient-to-r from-primary via-secondary to-accent"></div>

				<div class="p-8 md:p-12">
					<div class="flex flex-col md:flex-row justify-between items-start mb-10 gap-8">
						<div>
							<img alt="Neibora Property Management" class="h-16 mb-4" src="/assets/img/logo.png" />
							<h2 class="text-sm font-semibold tracking-wider text-primary dark:text-accent uppercase">Administración de Condominios</h2>
						</div>
						<div class="text-right">
							<p class="text-slate-500 dark:text-slate-400 text-sm mb-1">
								<xsl:value-of select="@lugar"/>
							</p>
							<xsl:apply-templates select="@fecha"/>
						</div>
					</div>

					<div class="mb-8">
						<h1 class="text-2xl font-bold text-primary dark:text-white border-b-2 border-accent inline-block pb-1 mb-4">
							<xsl:value-of select="Condominio/@nombre"/>
						</h1>
						<p class="text-lg font-medium text-slate-700 dark:text-slate-300">
							<xsl:value-of select="Condominio/@saludo"/>
						</p>

						<div class="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed max-w-none space-y-2">
							<p>
								Por medio de la presente se pone a su consideración la propuesta de costos de
								<span class="font-medium">Administración y Mantenimiento mensual</span>
								para el condominio denominado
								<span class="font-bold">
									<xsl:value-of select="Condominio/@razon"/>
								</span>.
								Ubicado en el Municipio de <xsl:value-of select="Condominio/@municipio"/>,
								y conformado por <xsl:apply-templates select="Condominio/@departamentos"/> en su totalidad.
							</p>
						</div>
					</div>

					<div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 mb-10">
						<table class="w-full text-sm text-left">
							<thead class="bg-slate-50 dark:bg-slate-800 text-primary dark:text-accent uppercase text-xs font-bold">
								<tr>
									<th class="px-6 py-4">Concepto</th>
									<th class="px-6 py-4 text-center">Precio</th>
									<th class="px-6 py-4">Descripción</th>
								</tr>
							</thead>

							<tbody class="divide-y divide-slate-200 dark:divide-slate-800">
								<xsl:for-each select="Tabla/Seccion">

									<tr class="bg-primary text-white">
										<td class="px-6 py-2 font-bold uppercase text-xs tracking-wider" colspan="3">
											<xsl:value-of select="@titulo"/>
										</td>
									</tr>

									<xsl:for-each select="Partida">
										<xsl:variable name="precio" select="number(@precio)"/>
										<xsl:variable name="pct">
											<xsl:call-template name="pct1">
												<xsl:with-param name="num" select="$precio"/>
												<xsl:with-param name="den" select="$ingreso"/>
											</xsl:call-template>
										</xsl:variable>

										<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
											<td class="px-6 py-4 font-medium">
												<xsl:value-of select="@concepto"/>
											</td>
											<td class="px-6 py-4 text-center font-mono">
												<xsl:apply-templates select="@precio"/>
											</td>
											<td class="px-6 py-4 text-slate-600 dark:text-slate-400 italic">
												<xsl:value-of select="normalize-space(.)"/>
												<span class="not-italic text-slate-500 dark:text-slate-400">
													<xsl:text> | </xsl:text>
												</span>
												<span class="not-italic font-medium">
													<xsl:value-of select="$pct"/>%
												</span>
												<span class="not-italic text-slate-500 dark:text-slate-400">del ingreso mensual</span>
											</td>
										</tr>

									</xsl:for-each>
								</xsl:for-each>

								<!-- TOTAL -->
								<xsl:variable name="pctTotal">
									<xsl:call-template name="pct1">
										<xsl:with-param name="num" select="$totalN"/>
										<xsl:with-param name="den" select="$ingreso"/>
									</xsl:call-template>
								</xsl:variable>
								<tr>
									<xsl:variable name="status">
										<xsl:choose>
											<xsl:when test="$pctTotal>100">warning</xsl:when>
										</xsl:choose>
									</xsl:variable>
									<xsl:attribute name="class">
										<xsl:value-of select="$status"/>
										<xsl:text> bg-slate-100 dark:bg-slate-800 text-primary dark:text-accent font-bold text-base</xsl:text>
									</xsl:attribute>
									<td class="px-6 py-4">COSTO TOTAL MENSUAL</td>
									<td class="px-6 py-4 text-center font-mono text-lg">
										<xsl:call-template name="money">
											<xsl:with-param name="v" select="$totalN"/>
										</xsl:call-template>
									</td>
									<td class="px-6 py-4">
										Operación mensual estimada.
										<span class="block font-semibold mt-1">
											Equivale a <xsl:value-of select="$pctTotal"/>% del ingreso mensual de referencia.
										</span>
										<span class="block mt-2 font-normal text-slate-600 dark:text-slate-400">
											Los importes se presentan como referencia con respecto al gasto actual; se está considerando mantener a los proveedores actuales y/o reemplazarlos por opciones equivalentes en precio y nivel de servicio.
										</span>
									</td>
								</tr>

								<!-- INGRESO -->
								<tr class="bg-accent text-white font-bold text-lg">
									<td class="px-6 py-4">INGRESO MENSUAL (REFERENCIA)</td>
									<td class="px-6 py-4 text-center font-mono">
										<xsl:call-template name="money">
											<xsl:with-param name="v" select="$ingreso"/>
										</xsl:call-template>
									</td>
									<td class="px-6 py-4 text-sm leading-snug">
										<div>
											<xsl:apply-templates mode="leyenda-pago-mensual" select="Referencia/@cuota_mensual"/>
										</div>
										<div>
											Total mensual esperado (<xsl:value-of select="Condominio/@departamentos"/> departamentos)
										</div>
										<div class="text-white/90 font-normal">Referencia: ingreso basado en la cuota mensual vigente</div>
									</td>
								</tr>

							</tbody>
						</table>
					</div>

					<div class="space-y-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-l-4 border-accent pl-6 mb-12">
						<xsl:for-each select="Texto/P">
							<p>
								<xsl:value-of select="normalize-space(.)"/>
							</p>
						</xsl:for-each>
					</div>

					<div class="mt-5 pt-2 border-t border-slate-100 dark:border-slate-800">
						<p class="text-slate-500 mb-6 uppercase text-xs tracking-widest font-bold text-center">Atentamente</p>

						<xsl:variable name="firmasCount" select="count(Firmas/Firma)"/>

						<xsl:variable name="gridClass">
							<xsl:choose>
								<xsl:when test="$firmasCount = 1">grid grid-cols-1 justify-center</xsl:when>
								<xsl:when test="$firmasCount = 2">grid grid-cols-1 sm:grid-cols-2</xsl:when>
								<xsl:when test="$firmasCount = 3">grid grid-cols-1 sm:grid-cols-3</xsl:when>
								<xsl:when test="$firmasCount = 4">grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4</xsl:when>
								<xsl:when test="$firmasCount &lt;= 6">grid grid-cols-1 sm:grid-cols-3</xsl:when>
								<xsl:otherwise>grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4</xsl:otherwise>
							</xsl:choose>
						</xsl:variable>

						<div class="{$gridClass} gap-8 items-start">
							<xsl:for-each select="Firmas/Firma">

								<div class="text-center">
									<div class="w-48 h-1 bg-slate-200 dark:bg-slate-700 mx-auto mb-4"></div>
									<p class="font-bold text-slate-800 dark:text-slate-100">
										<xsl:value-of select="@nombre"/>
									</p>
									<p class="text-sm text-slate-500 dark:text-slate-400 italic">
										<xsl:value-of select="@cargo"/>
									</p>
									<div class="mt-3 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
										<span class="material-icons text-primary dark:text-accent text-base">phone</span>
										<span>
											<xsl:value-of select="@telefono"/>
										</span>
									</div>
								</div>
							</xsl:for-each>
						</div>
					</div>

				</div>

				<footer class="bg-slate-50 dark:bg-slate-800/50 p-6 flex flex-wrap justify-center gap-8 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
					<div class="flex items-center gap-2">
						<span class="material-icons text-primary dark:text-accent text-base">language</span>
						<span>
							<xsl:value-of select="@sitio"/>
						</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="material-icons text-primary dark:text-accent text-base">email</span>
						<span>
							<xsl:value-of select="@correo"/>
						</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="material-icons text-primary dark:text-accent text-base">business_center</span>
						<span>
							<xsl:value-of select="@marca"/> Administración
						</span>
					</div>
				</footer>
			</div>

			<div class="no-print mt-8 text-center text-slate-500 text-xs italic">
				<xsl:value-of select="normalize-space(AvisoBorrador)"/>
			</div>
		</section>
	</xsl:template>

	<xsl:template match="@*">
		<xsl:param name="class">font-medium text-slate-800 dark:text-slate-200</xsl:param>
		<p class="{$class}">
			<xsl:value-of select="."/>
		</p>
	</xsl:template>

	<xsl:template match="@precio" name="money-value">
		<xsl:param name="class">font-medium text-slate-800 dark:text-slate-200</xsl:param>
		<span>
			<xsl:call-template name="money">
				<xsl:with-param name="v" select="."/>
			</xsl:call-template>
		</span>
	</xsl:template>

	<xsl:template match="Referencia/@cuota_mensual" mode="leyenda-pago-mensual">
		Pago mensual por casa!!:
		<span class="font-mono">
			<xsl:call-template name="money-value"/>
		</span>
	</xsl:template>

	<xsl:template match="@departamentos|@casas">
		<xsl:param name="class">text-primary dark:text-accent font-bold</xsl:param>
		<span class="{$class}">
			<xsl:value-of select="number(.)"/>
			<xsl:text> </xsl:text>
			<xsl:value-of select="name()"/>
		</span>
	</xsl:template>

</xsl:stylesheet>