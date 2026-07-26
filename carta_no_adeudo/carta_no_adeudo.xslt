<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns="http://www.w3.org/1999/xhtml">

	<xsl:output method="html" indent="yes" encoding="utf-8"/>
	<xsl:strip-space elements="*"/>

	<xsl:template match="/CartaNoAdeudo">
		<section class="mx-auto py-8 px-4 sm:px-6 max-w-5xl">
			<div class="bg-white dark:bg-slate-900 shadow-2xl rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
				<div class="h-2 bg-gradient-to-r from-primary via-secondary to-accent"></div>

				<div class="p-8 md:p-12">
					<div class="flex justify-between items-start mb-10 gap-8">
						<div>
							<img alt="Neibora" class="h-16 mb-4" src="/assets/img/logo.png"/>
							<h2 class="text-sm font-semibold tracking-wider text-primary uppercase">
								Administración de Condominios
							</h2>
						</div>

						<div class="text-right text-sm text-slate-600">
							<p>
								<xsl:value-of select="@lugar"/>
							</p>
							<p class="font-semibold">
								<xsl:value-of select="@fecha"/>
							</p>
						</div>
					</div>

					<div class="text-center mb-10">
						<h1 class="text-2xl font-bold text-primary border-b-2 border-accent inline-block pb-2">
							<xsl:value-of select="@titulo"/>
						</h1>
					</div>

					<div class="mb-8">
						<p class="font-bold text-slate-800 mb-4">A QUIEN CORRESPONDA:</p>

						<p class="text-slate-700 leading-relaxed mb-4">
							Por medio de la presente, la administración de
							<strong>
								<xsl:value-of select="Condominio/@nombre"/>
							</strong>
							hace constar que el inmueble ubicado en
							<strong>
								<xsl:value-of select="Propiedad/@domicilio"/>
							</strong>,
							a nombre de
							<strong>
								<xsl:value-of select="Propietario/@nombre"/>
							</strong>,
							se encuentra al corriente hasta el día
							<strong>
								<xsl:value-of select="Declaracion/@fechaCorte"/>
							</strong>.
						</p>

						<p class="text-slate-700 leading-relaxed mb-4">
							<xsl:value-of select="Declaracion"/>
						</p>

						<p class="text-slate-700 leading-relaxed mb-4">
							<xsl:value-of select="Uso"/>
						</p>

						<p class="text-slate-600 leading-relaxed text-sm italic mt-8">
							<strong>Observación: </strong>
							<xsl:value-of select="Observacion"/>
						</p>
					</div>

					<div class="mt-20 text-center">
						<p class="text-slate-500 mb-10 uppercase text-xs tracking-widest font-bold">
							Atentamente
						</p>

						<xsl:for-each select="Firmas/Firma">
							<div class="inline-block text-center min-w-72">
								<div class="w-64 h-px bg-slate-500 mx-auto mb-4"></div>
								<p class="font-bold text-slate-800">
									<xsl:value-of select="@nombre"/>
								</p>
								<p class="text-sm text-slate-500 italic">
									<xsl:value-of select="@cargo"/>
								</p>
								<p class="text-sm text-slate-500">
									<xsl:value-of select="/CartaNoAdeudo/@marca"/>
								</p>
							</div>
						</xsl:for-each>
					</div>
				</div>

				<footer class="bg-slate-50 p-6 flex flex-wrap justify-center gap-8 border-t border-slate-200 text-sm text-slate-500">
					<span>
						<xsl:value-of select="@sitio"/>
					</span>
					<span>
						<xsl:value-of select="@correo"/>
					</span>
					<span>
						<xsl:value-of select="@marca"/> Administración
					</span>
				</footer>
			</div>
		</section>
	</xsl:template>

</xsl:stylesheet>