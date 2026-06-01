<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:xo="http://panax.io/xover"
  xmlns:state="http://panax.io/state"
  xmlns:js="http://panax.io/languages/javascript">

	<xsl:output method="html" indent="yes" encoding="utf-8"/>
	<xsl:param name="state:desarrollo"/>
	<xsl:param name="js:today">new Date().toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })</xsl:param>
	<xsl:strip-space elements="*"/>

	<xsl:key name="proveedor-por-id" match="Proveedores/Proveedor" use="@id"/>
	<xsl:key name="partidas-por-proveedor-seccion"
           match="Secciones/Seccion/Partida"
           use="concat(generate-id(..), '|', @proveedor)"/>

	<xsl:template name="money">
		<xsl:param name="v"/>
		<xsl:text>$</xsl:text>
		<xsl:value-of select="format-number(number($v), '#,##0.00')"/>
	</xsl:template>

	<xsl:template name="sum-importe">
		<xsl:param name="nodes" select="."/>
		<xsl:param name="i" select="1"/>
		<xsl:param name="acc" select="0"/>
		<xsl:choose>
			<xsl:when test="$i &gt; count($nodes)">
				<xsl:value-of select="$acc"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:call-template name="sum-importe">
					<xsl:with-param name="nodes" select="$nodes"/>
					<xsl:with-param name="i" select="$i + 1"/>
					<xsl:with-param name="acc" select="$acc + number($nodes[$i])"/>
				</xsl:call-template>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<xsl:template match="/InstruccionPago">
		<xsl:variable name="total">
			<xsl:call-template name="sum-importe">
				<xsl:with-param name="nodes" select="Secciones/Seccion/Partida/@importe"/>
			</xsl:call-template>
		</xsl:variable>

		<section class="mx-auto py-8 px-4 sm:px-6 max-w-7xl">
			<style>
				<![CDATA[
@media print {
	@page {
		size: letter;
		margin: 8mm;
	}

	html, body {
		margin: 0 !important;
		padding: 0 !important;
	}

	body {
		zoom: 0.88;
	}

	section {
		max-width: none !important;
		width: 100% !important;
		margin: 0 !important;
		padding: 0 !important;
	}

	.shadow-2xl {
		box-shadow: none !important;
	}

	.rounded-xl {
		border-radius: 0 !important;
	}

	.p-8, .md\:p-12 {
		padding: 10px !important;
	}

	table {
		width: 100% !important;
		table-layout: fixed;
	}

	thead {
		display: table-header-group;
	}

	tfoot {
		display: table-footer-group;
	}

	tr {
		page-break-inside: avoid;
	}

	th, td {
		word-break: break-word;
		overflow-wrap: anywhere;
	}

	.datos-bancarios {
		line-height: 1.3 !important;
	}

	.monto {
		font-size: 13px !important;
	}

	.periodo-print {
		white-space: normal !important;
		word-break: break-word;
	}
}
]]>
			</style>
			<div class="bg-white dark:bg-slate-900 shadow-2xl rounded-xl overflow-hidden print-shadow-none border border-slate-200 dark:border-slate-800">
				<div class="h-2 bg-gradient-to-r from-primary via-secondary to-accent"></div>
				<div class="p-8 md:p-12">
					<div class="grid grid-cols-[220px_1fr] items-start gap-6">
						<div class="pt-2">
							<img alt="Logo" class="w-[220px] h-auto" src="/assets/desarrollos/{$state:desarrollo}/logo.png" />
						</div>

						<div>
							<h1 class="text-[22px] leading-tight font-bold text-primary dark:text-white text-center">
								<xsl:value-of select="@titulo"/>
							</h1>

							<div class="mt-6 grid grid-cols-[180px_180px] justify-end items-end gap-x-3 text-sm">
								<div class="text-right font-bold text-slate-800 dark:text-slate-200">
									Fecha de Emisión:
								</div>
								<div class="border-b border-slate-700 text-center pb-1 text-slate-900 dark:text-slate-100 whitespace-nowrap">
									<xsl:value-of select="$js:today"/>
								</div>
							</div>

							<div class="mt-4 grid grid-cols-[100px_260px] justify-end items-end gap-x-3 text-sm">
								<div class="text-right font-bold text-slate-800 dark:text-slate-200">
									Período
								</div>
								<div class="border-b border-slate-700 text-center pb-1 font-bold text-red-600 text-[18px] leading-tight periodo-print">
									<xsl:value-of select="@periodo"/>
								</div>
							</div>
						</div>
					</div>

					<div class="overflow-x-auto mt-8 border border-black">
						<table class="w-full text-sm text-left border-collapse">
							<colgroup>
								<col style="width:20%"/>
								<col style="width:21%"/>
								<col style="width:13%"/>
								<col style="width:16%"/>
								<col style="width:30%"/>
							</colgroup>
							<thead>
								<tr class="font-bold text-center">
									<th class="border border-black px-4 py-2" colspan="2">
										<xsl:value-of select="@comite"/>
									</th>
									<th class="border border-black px-4 py-2" colspan="3">
										<xsl:value-of select="@fraccionamiento"/>
									</th>
								</tr>
								<tr class="font-bold text-center">
									<th class="border border-black px-4 py-2">PROVEEDOR</th>
									<th class="border border-black px-4 py-2">CONCEPTO</th>
									<th class="border border-black px-4 py-2">IMPORTE</th>
									<th class="border border-black px-4 py-2">SUBTOTAL PROVEEDOR</th>
									<th class="border border-black px-4 py-2">DATOS DE PAGO</th>
								</tr>
							</thead>
							<tbody>
								<xsl:for-each select="Secciones/Seccion">
									<xsl:variable name="seccionId" select="generate-id(.)"/>

									<xsl:variable name="subtotalSeccion">
										<xsl:call-template name="sum-importe">
											<xsl:with-param name="nodes" select="Partida/@importe"/>
										</xsl:call-template>
									</xsl:variable>
									<tr class="bg-primary text-white font-bold text-center uppercase">
										<td class="border border-black px-4 py-1" colspan="5">
											<xsl:value-of select="@nombre"/> (<xsl:call-template name="money">
											<xsl:with-param name="v" select="$subtotalSeccion"/>
										</xsl:call-template>)
										</td>
									</tr>
									<xsl:for-each select="Partida">
										<xsl:variable name="proveedorId" select="@proveedor"/>
										<xsl:variable name="proveedor" select="key('proveedor-por-id', $proveedorId)"/>
										<xsl:variable name="grupo" select="key('partidas-por-proveedor-seccion', concat($seccionId, '|', $proveedorId))"/>
										<xsl:variable name="esPrimeraDelGrupo"
											select="generate-id() = generate-id($grupo[1])"/>
										<xsl:variable name="rowspanGrupo"
											select="count($grupo)"/>
										<xsl:variable name="subtotalProveedor">
											<xsl:call-template name="sum-importe">
												<xsl:with-param name="nodes" select="$grupo/@importe"/>
											</xsl:call-template>
										</xsl:variable>

										<tr>
											<xsl:if test="$esPrimeraDelGrupo">
												<td class="border border-black px-4 py-3 text-center align-middle" rowspan="{$rowspanGrupo}">
													<xsl:value-of select="$proveedor/@nombre"/>
												</td>
											</xsl:if>

											<td class="border border-black px-4 py-3 text-center">
												<xsl:value-of select="@concepto"/>
											</td>

											<td class="border border-black px-4 py-3 text-center align-middle font-mono whitespace-nowrap">
												<xsl:call-template name="money">
													<xsl:with-param name="v" select="@importe"/>
												</xsl:call-template>
											</td>

											<xsl:if test="$esPrimeraDelGrupo">
												<td class="border border-black px-4 py-3 text-center align-middle font-mono font-bold monto" rowspan="{$rowspanGrupo}">
													<xsl:call-template name="money">
														<xsl:with-param name="v" select="$subtotalProveedor"/>
													</xsl:call-template>
												</td>
											</xsl:if>

											<xsl:if test="$esPrimeraDelGrupo">
												<td class="border border-black px-3 py-2 text-center align-middle datos-bancarios" rowspan="{$rowspanGrupo}">
													<xsl:for-each select="$proveedor/cuenta_bancaria/@*|@indicaciones">
														<div>
															<xsl:apply-templates select="."/>
														</div>
													</xsl:for-each>
												</td>
											</xsl:if>
										</tr>
									</xsl:for-each>
								</xsl:for-each>
							</tbody>
							<tfoot>
								<tr class="bg-primary text-white font-bold">
									<td class="border border-black px-4 py-3 text-center">TOTAL A PAGAR</td>
									<td class="border border-black px-4 py-3">&#160;</td>
									<td class="border border-black px-4 py-3 text-center font-mono font-bold whitespace-nowrap">
										<xsl:call-template name="money">
											<xsl:with-param name="v" select="$total"/>
										</xsl:call-template>
									</td>
									<td class="border border-black px-4 py-3">&#160;</td>
									<td class="border border-black px-4 py-3">&#160;</td>
								</tr>
							</tfoot>
						</table>
					</div>

					<div class="mt-10 grid grid-cols-2 gap-16 text-center">
						<xsl:for-each select="Firmas/Firma">
							<div>
								<p class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-6">
									<xsl:value-of select="@rol"/>
								</p>
								<div class="border-t border-slate-700 w-[180px] mx-auto"></div>
								<p class="mt-2 text-sm font-medium text-slate-900 dark:text-white">
									<xsl:value-of select="@nombre"/>
								</p>
								<p class="text-xs text-slate-600 dark:text-slate-400">
									<xsl:value-of select="@cargo"/>
								</p>
							</div>
						</xsl:for-each>
					</div>

				</div>
			</div>
		</section>
	</xsl:template>

	<xsl:template match="@xo:*"/>

	<xsl:template match="@banco|@cuenta|@clabe">
		<xsl:value-of select="translate(name(), 'banco|cuenta|clabe', 'BANCO|CUENTA|CLABE')"/>: <strong style="white-space:nowrap">
			<xsl:value-of select="."/>
		</strong>
	</xsl:template>

	<xsl:template match="@tarjeta">
		No. TARJETA: <strong style="white-space:nowrap">
			<xsl:value-of select="."/>
		</strong>
	</xsl:template>
</xsl:stylesheet>