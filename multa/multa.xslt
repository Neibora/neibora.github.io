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

	<xsl:template name="money">
		<xsl:param name="v"/>
		<xsl:text>$</xsl:text>
		<xsl:value-of select="format-number(number($v), '#,##0.00')"/>
	</xsl:template>

	<xsl:template match="/Multa">
		<section class="mx-auto py-8 px-4 sm:px-6 max-w-5xl">
			<style>
				<![CDATA[
@media print {
	@page {
		size: letter;
		margin: 10mm;
	}

	html, body {
		margin: 0 !important;
		padding: 0 !important;
	}

	body {
		zoom: 0.92;
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
		padding: 14px !important;
	}

	tr {
		page-break-inside: avoid;
	}

	.print-text {
		font-size: 12px !important;
		line-height: 1.45 !important;
	}
}

.logo {
	height: 7rem;
}
]]>
			</style>

			<div class="bg-white dark:bg-slate-900 shadow-2xl rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
				<div class="h-2 bg-gradient-to-r from-primary via-secondary to-accent"></div>

				<div class="p-8 md:p-12">
					<div class="grid grid-cols-[220px_1fr] items-start gap-6">
						<div class="pt-2">
							<img alt="Logo" class="logo w-auto" src="/assets/desarrollos/{$state:desarrollo}/logo.png"/>
						</div>

						<div>
							<h1 class="text-[22px] leading-tight font-bold text-primary dark:text-white text-center uppercase">
								<xsl:value-of select="@titulo"/>
							</h1>

							<div class="mt-6 flex justify-end text-sm gap-8">
								<div>
									<span class="font-bold">Fecha:</span>
									<span class="border-b border-slate-700 px-6 ml-2">
										<xsl:value-of select="@fecha"/>
									</span>
								</div>

								<div>
									<span class="font-bold">Domicilio:</span>
									<span class="border-b border-slate-700 px-8 ml-2 font-bold">
										<xsl:value-of select="@domicilio"/>
									</span>
								</div>
							</div>
						</div>
					</div>

					<div class="mt-4 text-center">
						<div class="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase">
							<xsl:value-of select="@fraccionamiento"/>
						</div>
						<div class="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase">
							<xsl:value-of select="@coto"/>
						</div>
					</div>

					<div class="mt-4 border border-black">
						<div class="bg-primary text-white font-bold text-center px-4 py-2 uppercase">
							Asunto
						</div>
						<div class="px-5 py-4 text-center font-semibold text-slate-900 dark:text-white">
							<xsl:value-of select="@asunto"/>
						</div>
					</div>

					<xsl:variable name="conImagen" select="Imagen/@src"/>

					<div class="mt-4">
						<xsl:choose>
							<xsl:when test="$conImagen">
								<div class="grid grid-cols-[1fr_280px] gap-6 items-start">

									<!-- TEXTO -->
									<div class="space-y-5 text-[15px] leading-relaxed text-slate-900 dark:text-slate-100 print-text">
										<xsl:apply-templates select="Hechos|Fundamento|Antecedente|Resolucion"/>
									</div>

									<!-- IMAGEN -->
									<div class="border border-slate-300 p-1 bg-white">
										<img class="w-full h-auto object-cover" src="{Imagen/@src}" />
									</div>
								</div>
							</xsl:when>

							<xsl:otherwise>
								<div class="space-y-5 text-[15px] leading-relaxed text-slate-900 dark:text-slate-100 print-text">
									<xsl:apply-templates select="Hechos|Fundamento|Antecedente|Resolucion"/>
								</div>
							</xsl:otherwise>
						</xsl:choose>
					</div>

					<div class="overflow-x-auto mt-4 border border-black">
						<table class="w-full text-sm text-left border-collapse">
							<colgroup>
								<col style="width:38%"/>
								<col style="width:12%"/>
								<col style="width:17%"/>
								<col style="width:18%"/>
								<col style="width:15%"/>
							</colgroup>
							<thead>
								<tr class="bg-primary text-white font-bold text-center">
									<th class="border border-black px-4 py-2">CONDUCTA INFRACTORA</th>
									<th class="border border-black px-4 py-2">UMAS</th>
									<th class="border border-black px-4 py-2">VALOR UMA</th>
									<th class="border border-black px-4 py-2">IMPORTE</th>
									<th class="border border-black px-4 py-2">REINCIDENCIA</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td class="border border-black px-4 py-3">
										<xsl:value-of select="Sancion/@conducta"/>
									</td>
									<td class="border border-black px-4 py-3 text-center font-mono">
										<xsl:value-of select="Sancion/@umas"/>
									</td>
									<td class="border border-black px-4 py-3 text-center font-mono">
										<xsl:call-template name="money">
											<xsl:with-param name="v" select="Sancion/@valorUma"/>
										</xsl:call-template>
									</td>
									<td class="border border-black px-4 py-3 text-center font-mono font-bold">
										<xsl:call-template name="money">
											<xsl:with-param name="v" select="Sancion/@importe"/>
										</xsl:call-template>
									</td>
									<td class="border border-black px-4 py-3 text-center">
										<xsl:value-of select="Sancion/@reincidencia"/>
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					<div class="mt-6 text-[15px] leading-relaxed text-slate-900 dark:text-slate-100 print-text">
						<p>
							Con fundamento en el Catálogo de Multas y Sanciones del Reglamento Interno del Coto Cantabria, se determina la aplicación de la multa correspondiente por un monto de
							<strong>
								<xsl:value-of select="Sancion/@umas"/><xsl:text> Unidades de Medida y Actualización (UMA)</xsl:text>
							</strong>,
							equivalentes a
							<strong>
								<xsl:call-template name="money">
									<xsl:with-param name="v" select="Sancion/@importe"/>
								</xsl:call-template>
								<xsl:text> (</xsl:text>
								<xsl:value-of select="Sancion/@importeTexto"/>
								<xsl:text>)</xsl:text>
							</strong>,
							conforme al valor vigente de la UMA para 2026.
						</p>

						<p class="mt-5">
							El pago deberá realizarse mediante depósito a la cuenta oficial del condominio, dentro de un plazo no mayor a
							<strong>
								<xsl:value-of select="Pago/@plazo"/>
							</strong>,
							y enviar el comprobante vía WhatsApp al número
							<strong>
								<xsl:value-of select="Pago/@telefono"/>
							</strong>.
							En caso de no realizar el pago dentro del plazo establecido, se aplicará un recargo mensual del 10% sobre el monto de la multa. A falta de pago, podrán suspenderse
							los servicios correspondientes (tag, jardinería, recolección de basura, entre otros).
						</p>

						<p class="mt-5">
							<xsl:value-of select="DerechoReplica"/>
						</p>
					</div>

					<div class="mt-14 text-center">
						<p class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-8">
							Atentamente
						</p>
						<div class="border-t border-slate-700 w-[220px] mx-auto"></div>
						<p class="mt-2 text-sm font-bold text-slate-900 dark:text-white">
							<xsl:value-of select="Firma/@nombre"/>
						</p>
					</div>
				</div>
			</div>
		</section>
	</xsl:template>
	
	<xsl:template match="Hechos|Fundamento|Antecedente|Resolucion">
		<p>
			<xsl:apply-templates/>
		</p>
	</xsl:template>

	<xsl:template match="b|strong">
		<strong>
			<xsl:apply-templates/>
		</strong>
	</xsl:template>

	<xsl:template match="@xo:*"/>
</xsl:stylesheet>