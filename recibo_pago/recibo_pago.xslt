<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml"
  xmlns:xo="http://panax.io/xover"
  xmlns:state="http://panax.io/state">

	<xsl:output method="html" indent="yes" encoding="utf-8"/>
	<xsl:strip-space elements="*"/>

	<xsl:key name="cuotas" match="Cuotas/Cuota" use="'cuotas'"/>
	<xsl:key name="firmas" match="Firmas/Firma" use="'firmas'"/>

	<xsl:template name="money">
		<xsl:param name="v"/>
		<xsl:text>$</xsl:text>
		<xsl:value-of select="format-number(number($v), '#,##0.00')"/>
	</xsl:template>

	<xsl:template match="/ReciboPago">
		<section class="mx-auto py-8 px-4 sm:px-6 max-w-7xl">
			<style>
				<![CDATA[
[xo-slot] { cursor: pointer; }
.mock td, .mock p, .mock li { color: silver; }
]]>
			</style>
			<div class="bg-white dark:bg-slate-900 shadow-2xl rounded-xl overflow-hidden print-shadow-none border border-slate-200 dark:border-slate-800">
				<div class="h-2 bg-gradient-to-r from-primary via-secondary to-accent"></div>

				<div class="p-8 md:p-12">
					<div class="flex flex-col md:flex-row justify-between items-start mb-10 gap-8">
						<div>
							<img alt="Neibora Property Management" class="h-16 mb-4" src="/assets/img/logo.png"/>
							<h2 class="text-sm font-semibold tracking-wider text-primary dark:text-accent uppercase">
								Administración de Condominios
							</h2>
						</div>

						<div class="text-right">
							<p class="text-slate-500 dark:text-slate-400 mb-1">
								<xsl:value-of select="@lugar"/>
							</p>
							<xsl:apply-templates select="@fecha"/>
							<p class="text-slate-500 dark:text-slate-400 mt-2">
								Folio:
								<span class="font-bold text-red-600">
									<xsl:value-of select="@folio"/>
								</span>
							</p>
						</div>
					</div>

					<div class="mb-8">
						<h1 class="text-2xl font-bold text-primary dark:text-white border-b-2 border-accent inline-block pb-1 mb-4">
							<div>
								At'n. <xsl:value-of select="Propietario/@nombre"/>
							</div>
							<div>
								<xsl:value-of select="Propietario/@domicilio"/>
							</div>
						</h1>

						<p class="text-lg font-medium text-slate-700 dark:text-slate-300">
							<xsl:value-of select="@titulo"/>
						</p>

						<div class="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed max-w-none space-y-2">
							<p>
								Por medio del presente, se hace constar la recepción del pago registrado para la propiedad
								<strong>
									<xsl:value-of select="Propietario/@domicilio"/>
								</strong>,
								con estatus de pago
								<strong>
									<xsl:apply-templates mode="estatus" select="Pago"/>
								</strong>,
								por la cantidad de
								<strong>
									<xsl:call-template name="money">
										<xsl:with-param name="v" select="Pago/@monto"/>
									</xsl:call-template>
								</strong>.
							</p>
						</div>
					</div>

					<div class="mt-10">
						<h3 class="text-[10px] font-bold text-primary dark:text-accent uppercase tracking-widest mb-4">
							Datos del pago
						</h3>

						<div class="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
							<table class="w-full text-sm text-left">
								<tbody class="divide-y divide-slate-200 dark:divide-slate-800">
									<tr class="bg-green-50 dark:bg-emerald-950/40">
										<td class="px-6 py-4 font-bold text-primary dark:text-accent uppercase text-xs">
											Monto recibido
										</td>
										<td class="px-6 py-4 text-right font-black text-xl text-primary dark:text-accent font-mono">
											<xsl:call-template name="money">
												<xsl:with-param name="v" select="Pago/@monto"/>
											</xsl:call-template>
										</td>
									</tr>

									<tr>
										<td class="px-6 py-3 font-bold">Cantidad con letra</td>
										<td class="px-6 py-3 font-bold">
											<xsl:value-of select="Pago/@montoLetra"/>
										</td>
									</tr>

									<tr>
										<td class="px-6 py-3 font-bold">Método de pago</td>
										<td class="px-6 py-3">
											<xsl:value-of select="Pago/@metodo"/>
										</td>
									</tr>

									<tr>
										<td class="px-6 py-3 font-bold">Fecha y hora de operación</td>
										<td class="px-6 py-3">
											<xsl:value-of select="Pago/@fechaOperacion"/>
											<span class="mx-3">
												<xsl:apply-templates select="Pago/@referenciaOperacion"/>
											</span>
										</td>
									</tr>

									<tr>
										<td class="px-6 py-3 font-bold">Fecha y hora de aplicación</td>
										<td class="px-6 py-3">
											<xsl:value-of select="Pago/@fechaAplicacion"/>
											<span class="mx-3">
												<xsl:apply-templates select="Pago/@referenciaAplicacion"/>
											</span>
										</td>
									</tr>

									<tr>
										<td class="px-6 py-3 font-bold">Estatus</td>
										<td class="px-6 py-3">
											<xsl:apply-templates mode="estatus" select="Pago"/>
										</td>
									</tr>

									<tr>
										<td class="px-6 py-3 font-bold">Banco</td>
										<td class="px-6 py-3">
											<xsl:value-of select="Pago/@banco"/>
										</td>
									</tr>

									<tr>
										<td class="px-6 py-3 font-bold">Beneficiario</td>
										<td class="px-6 py-3">
											<xsl:value-of select="Pago/@beneficiario"/>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>

					<div class="mt-10">
						<h3 class="text-[10px] font-bold text-primary dark:text-accent uppercase tracking-widest mb-4">
							Desglose de aplicación de pago
						</h3>

						<div class="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 mb-4">
							<table class="w-full text-sm text-left">
								<thead class="bg-slate-50 dark:bg-slate-800 text-primary dark:text-accent uppercase text-xs font-bold">
									<tr>
										<th class="px-6 py-4">Periodo</th>
										<th class="px-6 py-4">Concepto</th>
										<th class="px-6 py-4 text-right">Importe</th>
										<th class="px-6 py-4 text-right">Cubierto</th>
										<th class="px-6 py-4 text-right">Estado</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-slate-200 dark:divide-slate-800">
									<xsl:for-each select="Pago/Aplicacion/Cuota">
										<tr>
											<td class="px-6 py-3 font-medium">
												<xsl:value-of select="@periodo"/>
											</td>
											<td class="px-6 py-3">
												<xsl:value-of select="@concepto"/>
											</td>
											<td class="px-6 py-3 text-right font-mono">
												<xsl:call-template name="money">
													<xsl:with-param name="v" select="@importe"/>
												</xsl:call-template>
											</td>
											<td class="px-6 py-3 text-right font-mono">
												<xsl:call-template name="money">
													<xsl:with-param name="v" select="@cubierto"/>
												</xsl:call-template>
											</td>
											<td class="px-6 py-3 text-right font-bold">
												<xsl:value-of select="@estado"/>
											</td>
										</tr>
									</xsl:for-each>
								</tbody>
							</table>
						</div>
					</div>

					<div class="mt-10 border-l-4 border-accent pl-6">
						<h3 class="text-[10px] font-bold text-primary dark:text-accent uppercase tracking-widest mb-4">
							Observaciones
						</h3>

						<div class="space-y-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
							<xsl:if test="Cuotas/Cuota[@estado='Liquidado']">
								<p>
									<strong>Cubre en su totalidad</strong> las siguientes cuotas mensuales de mantenimiento de
									<strong>
										<xsl:value-of select="Propietario/@domicilio"/>
									</strong>:
									<xsl:for-each select="Cuotas/Cuota[@estado='Liquidado']">
										<xsl:value-of select="@periodo"/>
										<xsl:if test="position() != last()">, </xsl:if>
									</xsl:for-each>.
								</p>
							</xsl:if>

							<xsl:if test="Cuotas/Cuota[@estado='Parcial']">
								<p>
									<strong>Cubre parcialmente</strong> las siguientes cuotas mensuales de mantenimiento de
									<strong>
										<xsl:value-of select="Propietario/@domicilio"/>
									</strong>:
									<xsl:for-each select="Cuotas/Cuota[@estado='Parcial']">
										<xsl:value-of select="@periodo"/>
										<xsl:if test="position() != last()">, </xsl:if>
									</xsl:for-each>.
								</p>
							</xsl:if>
							<xsl:for-each select="Observaciones/Texto">
								<p class="mt-6 italic text-xs bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
									<strong>
										Nota <xsl:value-of select="position()"/>:
									</strong>
									<xsl:text> </xsl:text>
									<xsl:value-of select="normalize-space(.)"/>
								</p>
							</xsl:for-each>
						</div>
					</div>

					<div class="mt-16 pt-2 border-t border-slate-100 dark:border-slate-800">
						<p class="text-slate-500 mb-6 uppercase text-xs tracking-widest font-bold text-center">Atentamente</p>

						<xsl:variable name="firmasCount" select="count(Firmas/Firma)"/>
						<xsl:variable name="gridClass">
							<xsl:choose>
								<xsl:when test="$firmasCount = 1">grid grid-cols-1 justify-center</xsl:when>
								<xsl:when test="$firmasCount = 2">grid grid-cols-1 sm:grid-cols-2</xsl:when>
								<xsl:when test="$firmasCount = 3">grid grid-cols-1 sm:grid-cols-3</xsl:when>
								<xsl:when test="$firmasCount = 4">grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4</xsl:when>
								<xsl:otherwise>grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4</xsl:otherwise>
							</xsl:choose>
						</xsl:variable>

						<div class="{$gridClass} gap-8 items-start">
							<xsl:for-each select="Firmas/Firma">
								<div class="text-center">
									<div class="w-48 h-1 bg-slate-200 dark:bg-slate-700 mx-auto mb-4"></div>
									<p class="font-bold text-slate-800 dark:text-slate-100">
										<xsl:choose>
											<xsl:when test="normalize-space(@nombre)!=''">
												<xsl:value-of select="@nombre"/>
											</xsl:when>
											<xsl:otherwise>
												<xsl:text>____________________________</xsl:text>
											</xsl:otherwise>
										</xsl:choose>
									</p>
									<p class="text-sm text-slate-500 dark:text-slate-400 italic">
										<xsl:value-of select="@cargo"/>
									</p>
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
		</section>
	</xsl:template>

	<xsl:template match="@fecha">
		<p class="text-sm font-semibold text-slate-700 dark:text-slate-200">
			<xsl:value-of select="."/>
		</p>
	</xsl:template>

	<xsl:template match="Pago" mode="estatus">
		<xsl:choose>
			<xsl:when test="@fechaAplicacion!=''">
				En firme
			</xsl:when>
			<xsl:otherwise>
				En proceso
			</xsl:otherwise>
		</xsl:choose>
		<xsl:value-of select="@estatus"/>
	</xsl:template>

	<xsl:template match="@referenciaOperacion|@referenciaAplicacion">
		Ref. bancaria: <xsl:value-of select="."/>
	</xsl:template>

</xsl:stylesheet>
