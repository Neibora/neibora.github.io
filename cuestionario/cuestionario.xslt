<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns="http://www.w3.org/1999/xhtml"
  xmlns:xo="http://panax.io/xover"
	xmlns:js="http://panax.io/languages/javascript"
>
	<xsl:output method="html" indent="yes" encoding="utf-8"/>
	<xsl:strip-space elements="*"/>
	<xsl:param name="js:today">new Date().toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })</xsl:param>

	<xsl:template match="/ChecklistCotizacion">
		<section class="mx-auto py-8 px-4 sm:px-6 max-w-7xl">
			<style>
				<![CDATA[
				@media print {
					.no-print { display:none !important; }
					.break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
					body { background:white !important; }
					input, textarea, select {
						border: 0 !important;
						border-bottom: 1px solid #94a3b8 !important;
						border-radius: 0 !important;
						box-shadow: none !important;
						background: transparent !important;
					}
				}

				.neibora-field {
					width: 100%;
					border: 1px solid #cbd5e1;
					border-radius: 0.5rem;
					padding: 0.45rem 0.65rem;
					background: transparent;
					outline: none;
				}

				.neibora-field:focus {
					border-color: #0f766e;
					box-shadow: 0 0 0 2px rgba(15, 118, 110, 0.15);
				}

				.neibora-textarea {
					min-height: 4.5rem;
					resize: vertical;
				}

				.neibora-check {
					width: 1rem;
					height: 1rem;
					accent-color: #0f766e;
				}
			]]>
			</style>

			<form class="cotizacion-checklist" method="post">
				<div class="bg-white dark:bg-slate-900 shadow-2xl rounded-xl overflow-hidden print-shadow-none border border-slate-200 dark:border-slate-800">
					<div class="h-2 bg-gradient-to-r from-primary via-secondary to-accent"></div>

					<div class="p-8 md:p-10">
						<header class="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
							<div>
								<img alt="Neibora Gestión Residencial Integral" class="h-14 mb-4" src="/assets/img/logo.png"/>
								<h1 class="text-2xl font-bold text-primary dark:text-white">
									<xsl:value-of select="@titulo"/>
								</h1>
								<p class="text-slate-500 dark:text-slate-400 mt-1">
									<xsl:value-of select="@subtitulo"/>
								</p>
							</div>
							<div class="text-sm text-slate-500 dark:text-slate-400 md:text-right">
								<p>
									<xsl:value-of select="@lugar"/>
								</p>
								<p>
									<xsl:choose>
										<xsl:when test="normalize-space(@fecha)!=''">
											<xsl:value-of select="@fecha"/>
										</xsl:when>
										<xsl:otherwise>
											Fecha: <xsl:value-of select="$js:today"/>
										</xsl:otherwise>
									</xsl:choose>
								</p>
							</div>
						</header>

						<div class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-l-4 border-accent pl-5 mb-8 space-y-2">
							<xsl:apply-templates select="Descripcion/p"/>
						</div>

						<div class="grid grid-cols-1 gap-5">
							<xsl:apply-templates select="Grupo"/>
						</div>

						<xsl:if test="Criterios/Criterio">
							<div class="mt-8 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden break-inside-avoid">
								<div class="bg-primary text-white px-5 py-2 font-bold text-sm uppercase tracking-wide">
									Criterios para determinar la cuota administrativa
								</div>
								<ul class="p-5 text-sm text-slate-600 dark:text-slate-300 space-y-2 list-disc ml-5">
									<xsl:for-each select="Criterios/Criterio">
										<li>
											<xsl:value-of select="."/>
										</li>
									</xsl:for-each>
								</ul>
							</div>
						</xsl:if>

						<div class="no-print mt-8 flex flex-wrap gap-3 justify-end">
							<button type="reset" class="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 dark:text-slate-300">
								Limpiar
							</button>
							<button type="button" onclick="cuestionario.save()" class="px-4 py-2 rounded-lg bg-primary text-white font-semibold">
								Guardar encuesta
							</button>
						</div>
						<xsl:for-each select="Firmas">
							<div class="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800 break-inside-avoid">
								<p class="text-slate-500 mb-8 uppercase text-xs tracking-widest font-bold text-center">Firmas</p>
								<div class="grid grid-cols-1 sm:grid-cols-2 gap-10">
									<xsl:for-each select="Firma">
										<div class="text-center">
											<div class="w-56 h-1 bg-slate-200 dark:bg-slate-700 mx-auto mb-4"></div>
											<p class="font-bold text-slate-800 dark:text-slate-100">
												<xsl:choose>
													<xsl:when test="normalize-space(@nombre)!=''">
														<xsl:value-of select="@nombre"/>
													</xsl:when>
													<xsl:otherwise>____________________________</xsl:otherwise>
												</xsl:choose>
											</p>
											<p class="text-sm text-slate-500 dark:text-slate-400 italic">
												<xsl:value-of select="@cargo"/>
											</p>
										</div>
									</xsl:for-each>
								</div>
							</div>
						</xsl:for-each>
					</div>

					<footer class="bg-slate-50 dark:bg-slate-800/50 p-5 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
						<xsl:value-of select="@marca"/> · Gestión Residencial Integral
					</footer>
				</div>
			</form>
		</section>
	</xsl:template>

	<xsl:template match="Descripcion/p">
		<p>
			<xsl:value-of select="normalize-space(.)"/>
		</p>
	</xsl:template>

	<xsl:template match="Grupo">
		<div class="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden break-inside-avoid">
			<div class="bg-primary text-white px-5 py-2 font-bold text-sm uppercase tracking-wide">
				<xsl:value-of select="@nombre"/>
			</div>
			<div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
				<xsl:apply-templates select="Campo|Grupo"/>
			</div>
		</div>
	</xsl:template>

	<xsl:template match="Grupo/Grupo">
		<fieldset class="md:col-span-2 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
			<legend class="px-2 font-bold text-primary dark:text-accent">
				<xsl:value-of select="@nombre"/>
			</legend>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
				<xsl:apply-templates select="Campo"/>
			</div>
		</fieldset>
	</xsl:template>

	<xsl:template match="Campo">
		<xsl:variable name="fieldName">
			<xsl:choose>
				<xsl:when test="@name">
					<xsl:value-of select="@name"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="translate(@etiqueta,
						' ÁÉÍÓÚÜÑáéíóúüñ/.¿?,-',
						'_AEIOUUNaeiouun_______')"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>

		<div class="text-sm">
			<xsl:if test="@tipo='checklist' or @tipo='textarea'">
				<xsl:attribute name="class">text-sm md:col-span-2</xsl:attribute>
			</xsl:if>

			<label class="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
				<xsl:attribute name="for">
					<xsl:value-of select="$fieldName"/>
				</xsl:attribute>
				<xsl:value-of select="@etiqueta"/>
			</label>

			<xsl:choose>
				<xsl:when test="@tipo='checklist'">
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
						<xsl:for-each select="Opcion">
							<xsl:variable name="optionValue" select="normalize-space(.)"/>
							<label class="flex items-center gap-2 text-slate-600 dark:text-slate-300">
								<input type="checkbox" class="neibora-check" xo-slot="selected">
									<xsl:attribute name="data-label">
										<xsl:value-of select="../@etiqueta"/>
									</xsl:attribute>
									<xsl:attribute name="name">
										<xsl:value-of select="$fieldName"/>[]
									</xsl:attribute>
									<xsl:attribute name="value">1</xsl:attribute>
									<xsl:if test="@selected='1' or @checked='1'">
										<xsl:attribute name="checked">checked</xsl:attribute>
									</xsl:if>
								</input>
								<span>
									<xsl:value-of select="."/>
								</span>
							</label>
						</xsl:for-each>
					</div>
				</xsl:when>

				<xsl:when test="@tipo='opcion'">
					<div class="space-y-1">
						<xsl:for-each select="Opcion">
							<xsl:variable name="optionValue" select="normalize-space(.)"/>
							<label class="inline-flex items-center gap-2 mr-4 text-slate-600 dark:text-slate-300" xo-scope="{../@xo:id}" xo-slot="selected">
								<input type="radio" class="neibora-check">
									<xsl:attribute name="data-label">
										<xsl:value-of select="../@etiqueta"/>
									</xsl:attribute>
									<xsl:attribute name="name">
										<xsl:value-of select="$fieldName"/>
									</xsl:attribute>
									<xsl:attribute name="value">
										<xsl:value-of select="$optionValue"/>
									</xsl:attribute>
									<xsl:if test="@selected='1' or @checked='1' or ../@selected=$optionValue">
										<xsl:attribute name="checked">checked</xsl:attribute>
									</xsl:if>
								</input>
								<span>
									<xsl:value-of select="."/>
								</span>
							</label>
						</xsl:for-each>
					</div>
				</xsl:when>

				<xsl:when test="@tipo='si_no'">
					<div class="space-y-1">
						<label class="inline-flex items-center gap-2 mr-5 text-slate-600 dark:text-slate-300">
							<input type="radio" value="Sí" class="neibora-check" xo-slot="value">
								<xsl:attribute name="data-label">
									<xsl:value-of select="@etiqueta"/>
								</xsl:attribute>
								<xsl:attribute name="name">
									<xsl:value-of select="$fieldName"/>
								</xsl:attribute>
								<xsl:if test="@value='Sí'">
									<xsl:attribute name="checked">checked</xsl:attribute>
								</xsl:if>
							</input>
							<span>Sí</span>
						</label>
						<label class="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
							<input type="radio" value="No" class="neibora-check" xo-slot="value">
								<xsl:attribute name="data-label">
									<xsl:value-of select="@etiqueta"/>
								</xsl:attribute>
								<xsl:attribute name="name">
									<xsl:value-of select="$fieldName"/>
								</xsl:attribute>
								<xsl:if test="@value='No'">
									<xsl:attribute name="checked">checked</xsl:attribute>
								</xsl:if>
							</input>
							<span>No</span>
						</label>
					</div>
				</xsl:when>

				<xsl:when test="@tipo='textarea' or @tipo='observaciones'">
					<textarea class="neibora-field neibora-textarea" xo-slot="value">
						<xsl:attribute name="data-label">
							<xsl:value-of select="@etiqueta"/>
						</xsl:attribute>
						<xsl:attribute name="id">
							<xsl:value-of select="$fieldName"/>
						</xsl:attribute>
						<xsl:attribute name="name">
							<xsl:value-of select="$fieldName"/>
						</xsl:attribute>
						<xsl:value-of select="@value"/>
					</textarea>
				</xsl:when>

				<xsl:otherwise>
					<input class="neibora-field" xo-slot="value">
						<xsl:attribute name="data-label">
							<xsl:value-of select="@etiqueta"/>
						</xsl:attribute>
						<xsl:attribute name="id">
							<xsl:value-of select="$fieldName"/>
						</xsl:attribute>
						<xsl:attribute name="name">
							<xsl:value-of select="$fieldName"/>
						</xsl:attribute>
						<xsl:attribute name="value">
							<xsl:value-of select="@value"/>
						</xsl:attribute>
						<xsl:attribute name="type">
							<xsl:choose>
								<xsl:when test="@tipo='numero'">number</xsl:when>
								<xsl:when test="@tipo='dinero'">number</xsl:when>
								<xsl:when test="@tipo='porcentaje'">number</xsl:when>
								<xsl:otherwise>text</xsl:otherwise>
							</xsl:choose>
						</xsl:attribute>
						<xsl:if test="@tipo='dinero'">
							<xsl:attribute name="step">0.01</xsl:attribute>
							<xsl:attribute name="placeholder">$</xsl:attribute>
						</xsl:if>
						<xsl:if test="@tipo='porcentaje'">
							<xsl:attribute name="step">0.01</xsl:attribute>
							<xsl:attribute name="placeholder">%</xsl:attribute>
						</xsl:if>
					</input>
				</xsl:otherwise>
			</xsl:choose>
		</div>
	</xsl:template>
</xsl:stylesheet>
