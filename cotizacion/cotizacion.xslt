<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml"
	xmlns:xo="http://panax.io/xover"
	xmlns:state="http://panax.io/state"
	>

	<xsl:output method="html" indent="yes" encoding="utf-8"/>
	<xsl:strip-space elements="*"/>

	<xsl:key name="secciones" match="Partida/@seccion" use="'*'"/>
	<xsl:key name="secciones" match="Partida/@seccion" use="."/>

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

	<xsl:key name="named_nodes" match="Condominio/*/@*" use="name()"/>
	<xsl:template name="sum-costo">
		<xsl:param name="nodes" select="."/>
		<xsl:param name="i" select="1"/>
		<xsl:param name="acc" select="0"/>

		<xsl:choose>
			<xsl:when test="$i &gt; count($nodes)">
				<xsl:value-of select="$acc"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:variable name="n" select="$nodes[$i]"/>
				<xsl:variable name="v" select="$n"/>
				<xsl:variable name="q">
					<xsl:choose>
						<xsl:when test="$n/../@cantidad">
							<xsl:value-of select="$n/../@cantidad"/>
						</xsl:when>
						<xsl:otherwise>1</xsl:otherwise>
					</xsl:choose>
				</xsl:variable>
				<xsl:variable name="current" select="number($v) * number($q)"/>
				<xsl:choose>
					<xsl:when test="not(number($n)=$n)">
						<xsl:variable name="named_nodes" select="key('named_nodes',$n)"/>
						<xsl:variable name="acc_nombrado">
							<xsl:call-template name="sum-costo">
								<xsl:with-param name="nodes" select="$named_nodes"/>
							</xsl:call-template>
						</xsl:variable>
						<xsl:call-template name="sum-costo">
							<xsl:with-param name="nodes" select="$nodes"/>
							<xsl:with-param name="i" select="$i + 1"/>
							<xsl:with-param name="acc" select="$acc + $acc_nombrado"/>
						</xsl:call-template>
					</xsl:when>
					<xsl:otherwise>
						<xsl:call-template name="sum-costo">
							<xsl:with-param name="nodes" select="$nodes"/>
							<xsl:with-param name="i" select="$i + 1"/>
							<xsl:with-param name="acc" select="$acc + number($v) * number($q)"/>
						</xsl:call-template>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<xsl:template mode="subtotal" match="@*">
		<xsl:call-template name="sum-costo">
			<xsl:with-param name="nodes" select="."/>
		</xsl:call-template>
	</xsl:template>

	<!-- ===== Root ===== -->

	<xsl:template match="/Cotizacion">
		<xsl:variable name="ingreso">
			<xsl:call-template name="sum-ingreso">
				<xsl:with-param name="nodes" select="Condominio/*/@cuota"/>
			</xsl:call-template>
		</xsl:variable>
		<xsl:variable name="total">
			<xsl:call-template name="sum-costo">
				<xsl:with-param name="nodes" select="/Cotizacion/*/Partida/@precio"/>
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
}

[xo-slot] {
	cursor: pointer;
}

.mock td {color:silver}
]]>
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
							<xsl:apply-templates select="Condominio/@nombre"/>
							<xsl:apply-templates select="Condominio/@desarrollo"/>
						</h1>
						<p class="text-lg font-medium text-slate-700 dark:text-slate-300">
							<xsl:value-of select="Condominio/@saludo"/>
						</p>

						<div class="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed max-w-none space-y-2">
							<p>
								Por medio de la presente se pone a su consideración la propuesta de costos de
								<span class="font-medium">Administración y gestión de la operación mensual</span>
								para el condominio denominado
								<xsl:apply-templates select="Condominio/@nombre">
									<xsl:with-param name="class">font-bold</xsl:with-param>
								</xsl:apply-templates> <xsl:apply-templates select="Condominio/@desarrollo"/>
								<xsl:text>, </xsl:text>
								ubicado en el Municipio de <xsl:apply-templates select="Condominio/@municipio"/>,
								<xsl:text>y conformado por </xsl:text>
								<xsl:apply-templates mode="leyenda" select="Condominio/*/@cantidad">
									<xsl:with-param name="class">text-primary dark:text-accent font-bold</xsl:with-param>
								</xsl:apply-templates>
								<xsl:text> en su totalidad.</xsl:text>
							</p>
						</div>
					</div>

					<div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 mb-10">
						<table class="w-full text-sm text-left">
							<thead class="bg-slate-50 dark:bg-slate-800 text-primary dark:text-accent uppercase text-xs font-bold">
								<tr>
									<th class="px-6 py-4">Concepto</th>
									<th class="px-6 py-4 text-center">Costo mensual</th>
									<th class="px-6 py-4 text-center">Costo unitario</th>
									<th class="px-6 py-4">Descripción</th>
								</tr>
							</thead>

							<tbody class="divide-y divide-slate-200 dark:divide-slate-800">
								<xsl:variable name="secciones" select="key('secciones', '*')"/>
								<xsl:for-each select="$secciones[count(.|key('secciones', .)[1])=1]">
									<tr class="bg-primary text-white" data-seccion="{.}" draggable="true">
										<th class="px-6 py-2 font-bold uppercase text-xs tracking-wider" colspan="4">
											<xsl:value-of select="."/>
										</th>
									</tr>
									<xsl:apply-templates mode="table-row" select="key('secciones', .)/../@precio">
										<xsl:with-param name="ingreso" select="$ingreso"/>
									</xsl:apply-templates>
								</xsl:for-each>
								<xsl:for-each select="$secciones[not(../@state:mock)][last()]/..">
									<tr class="bg-primary text-white cursor-pointer" onclick="scope.dispatch('cotizador.nuevaPartida')" data-seccion="--">
										<th class="px-6 py-1 font-bold uppercase text-xs tracking-wider" colspan="4"></th>
									</tr>
									<tr data-seccion="--" droptarget="">
										<td class="py-3" colspan="4"></td>
									</tr>
								</xsl:for-each>
							</tbody>
							<tfoot>
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
									<td class="px-6 py-4" colspan="2">
										Operación mensual estimada.
										<xsl:if test="$ingreso>0">
											<span class="block font-semibold mt-1">
												Equivale a <xsl:value-of select="$pctTotal"/>% del ingreso mensual de referencia.
											</span>
										</xsl:if>
										<span class="block mt-2 font-normal text-slate-600 dark:text-slate-400">
											Los importes se presentan como referencia con respecto al gasto actual; se está considerando mantener a los proveedores actuales y/o reemplazarlos por opciones equivalentes en precio y nivel de servicio.
										</span>
									</td>
								</tr>

								<xsl:if test="$ingreso>0">
									<!-- INGRESO -->
									<tr class="bg-accent text-white font-bold text-lg">
										<td class="px-6 py-4">INGRESO MENSUAL</td>
										<td class="px-6 py-4 text-center font-mono">
											<xsl:call-template name="money">
												<xsl:with-param name="v" select="$ingreso"/>
											</xsl:call-template>
										</td>
										<td class="px-6 py-4 text-sm leading-snug" colspan="2">
											<div>
												<xsl:apply-templates mode="leyenda-pago-mensual" select="Condominio/*/@cuota"/>
											</div>
											<div class="text-white/90 font-normal">Referencia: ingreso basado en la cuota mensual vigente</div>
										</td>
									</tr>
								</xsl:if>
							</tfoot>
						</table>
					</div>

					<div class="space-y-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-l-4 border-accent pl-6 mb-12">
						<p>
							De acuerdo con este presupuesto, se considera como referencia la cuota mensual de mantenimiento de <xsl:apply-templates mode="leyenda" select="Condominio/*/@cantidad"/><xsl:if test="$ingreso>0">
								, con un ingreso mensual estimado de <strong>
									<xsl:call-template name="money">
										<xsl:with-param name="v" select="$ingreso"/>
									</xsl:call-template>
								</strong>
							</xsl:if>. Todos los importes son netos (IVA incluído, donde aplique).
						</p>
						<xsl:apply-templates select="Texto/*|Texto/text()"/>
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
		<span class="{$class}">
			<xsl:value-of select="."/>
		</span>
	</xsl:template>

	<xsl:template match="@desarrollo">
		<xsl:param name="class">font-medium text-slate-800 dark:text-slate-200</xsl:param><xsl:text>, </xsl:text>
		<span class="{$class}">
			<xsl:value-of select="."/>
		</span>
	</xsl:template>

	<xsl:template match="@*" mode="money-field">
		<xsl:param name="class">font-medium text-slate-800 dark:text-slate-200</xsl:param>
		<xsl:param name="value">
			<xsl:choose>
				<xsl:when test=".=''">0</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="."/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:param>
		<span class="$class">
			<xsl:call-template name="money">
				<xsl:with-param name="v" select="$value"/>
			</xsl:call-template>
		</span>
	</xsl:template>

	<xsl:template match="@*" mode="leyenda-pago-mensual">
		<p class="font-mono" xo-scope="">
			Cuota mensual de <xsl:apply-templates mode="field" select="../@cantidad"/>:
			<xsl:apply-templates mode="money-field" select="."/>
			<label> unitario</label>
		</p>
	</xsl:template>

	<xsl:template match="@*" mode="field">
		<xsl:param name="class"></xsl:param>
		<span class="{$class}">
			<xsl:value-of select="."/>
		</span>
	</xsl:template>

	<xsl:template match="@cantidad[.=.5]" mode="field">
		<xsl:param name="class"></xsl:param>
		<span class="{$class}">
			(bimestral)
		</span>
	</xsl:template>

	<xsl:template match="Condominio/*/@*" mode="field">
		<xsl:param name="class"></xsl:param>
		<span class="{$class}">
			<xsl:value-of select="number(.)"/>
			<xsl:text> </xsl:text>
			<xsl:value-of select="translate(name(..),'_',' ')"/>
		</span>
	</xsl:template>

	<xsl:template match="Condominio/*[@etiqueta]/@*" mode="field">
		<xsl:param name="class"></xsl:param>
		<span class="{$class}">
			<xsl:value-of select="number(.)"/>
			<xsl:text> </xsl:text>
			<xsl:value-of select="../@etiqueta"/>
		</span>
	</xsl:template>

	<xsl:template name="sum-ingreso">
		<xsl:param name="nodes" select="current()"/>
		<xsl:param name="i" select="1"/>
		<xsl:param name="acc" select="0"/>

		<xsl:choose>
			<xsl:when test="$i &gt; count($nodes)">
				<xsl:value-of select="$acc"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:variable name="n" select="$nodes[$i]"/>
				<xsl:variable name="acc2" select="$acc + (number($n/../@cantidad) * number($n))"/>
				<xsl:call-template name="sum-ingreso">
					<xsl:with-param name="nodes" select="$nodes"/>
					<xsl:with-param name="i" select="$i + 1"/>
					<xsl:with-param name="acc" select="$acc2"/>
				</xsl:call-template>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<xsl:template mode="table-row" match="@*">
		<xsl:param name="ingreso" select="0"/>
		<xsl:param name="concepto" select="../@concepto"/>
		<xsl:param name="ref" select="self::*"/>
		<xsl:param name="seccion" select="../@seccion"/>
		<xsl:param name="precio" select="../@precio"/>
		<xsl:param name="descripcion" select=".."/>
		<xsl:variable name="subtotal">
			<xsl:apply-templates mode="subtotal" select="$precio"/>
		</xsl:variable>
		<xsl:variable name="pct">
			<xsl:call-template name="pct1">
				<xsl:with-param name="num" select="$subtotal"/>
				<xsl:with-param name="den" select="$ingreso"/>
			</xsl:call-template>
		</xsl:variable>
		<xsl:variable name="mock">
			<xsl:if test="../@state:mock"> mock</xsl:if>
		</xsl:variable>
		<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 {$mock}" xo-slot="" xo-scope="{$concepto/../@xo:id}" data-seccion="{$seccion}" draggable="true">
			<td class="px-6 py-4 font-medium">
				<xsl:apply-templates mode="leyenda" select="$concepto">
					<xsl:with-param name="detail" select="$ref"/>
				</xsl:apply-templates>
			</td>
			<td class="px-6 py-4 text-center font-mono">
				<strong>
					<xsl:call-template name="money">
						<xsl:with-param name="v" select="$subtotal"/>
					</xsl:call-template>
				</strong>
			</td>
			<td class="px-6 py-4 text-center font-mono">
				<xsl:apply-templates mode="money-field" select="$precio"/>
			</td>
			<td class="px-6 py-4 text-slate-600 dark:text-slate-400 italic">
				<span xo-slot="text()">
					<xsl:choose>
						<xsl:when test="normalize-space($descripcion)=''">&#8212;</xsl:when>
						<xsl:otherwise>
							<xsl:value-of select="$descripcion"/>
						</xsl:otherwise>
					</xsl:choose>
				</span>
				<xsl:if test="$ingreso>0">
					<span class="not-italic text-slate-500 dark:text-slate-400">
						<xsl:text> | </xsl:text>
					</span>
					<span class="not-italic font-medium">
						<xsl:value-of select="$pct"/>%
					</span>
					<span class="not-italic text-slate-500 dark:text-slate-400">del ingreso mensual</span>
				</xsl:if>
			</td>
		</tr>
	</xsl:template>

	<xsl:template mode="table-row" match="@*[.!=''][number(.)!=.]">
		<xsl:param name="ingreso" select="0"/>
		<xsl:param name="concepto" select="../@concepto"/>
		<xsl:param name="seccion" select="../@seccion"/>
		<xsl:param name="precio" select="../@precio"/>
		<xsl:param name="descripcion" select=".."/>
		<xsl:variable name="pct">
			<xsl:call-template name="pct1">
				<xsl:with-param name="num" select="$precio"/>
				<xsl:with-param name="den" select="$ingreso"/>
			</xsl:call-template>
		</xsl:variable>
		<xsl:variable name="ref" select="key('named_nodes',.)"/>
		<xsl:for-each select="$ref">
			<xsl:apply-templates mode="table-row" select=".">
				<xsl:with-param name="ingreso" select="$ingreso"/>
				<xsl:with-param name="concepto" select="$concepto"/>
				<xsl:with-param name="ref" select="."/>
				<xsl:with-param name="seccion" select="$seccion"/>
				<xsl:with-param name="precio" select="."/>
				<xsl:with-param name="descripcion">
					<xsl:choose>
						<xsl:when test="../@notas">
							<xsl:value-of select="../@notas"/>
						</xsl:when>
						<xsl:otherwise>
							<xsl:value-of select="$descripcion"/>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:with-param>
			</xsl:apply-templates>
		</xsl:for-each>
	</xsl:template>

	<xsl:template mode="leyenda" match="@*">
		<xsl:param name="class"></xsl:param>
		<xsl:if test="position() &gt; 1">
			<xsl:choose>
				<xsl:when test="position() = last()">
					<xsl:text> y </xsl:text>
				</xsl:when>
				<xsl:otherwise>
					<xsl:text>, </xsl:text>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:if>
		<xsl:apply-templates select="." mode="field">
			<xsl:with-param name="class" select="$class"/>
		</xsl:apply-templates>
	</xsl:template>

	<xsl:template mode="leyenda" match="@concepto">
		<xsl:param name="class"></xsl:param>
		<xsl:param name="detail" select="self::*"/>
		<xsl:choose>
			<xsl:when test="not(../@cantidad) or ../@cantidad='1' or ../@cantidad='0'"></xsl:when>
			<xsl:otherwise>
				<xsl:apply-templates mode="field" select="../@cantidad">
					<xsl:with-param name="class" select="$class"/>
				</xsl:apply-templates>
				<xsl:text> </xsl:text>
			</xsl:otherwise>
		</xsl:choose>
		<xsl:apply-templates mode="field" select="."/>
		<xsl:text> </xsl:text>
		<xsl:apply-templates mode="leyenda" select="$detail">
			<xsl:with-param name="class">
				<xsl:apply-templates mode="concepto_detalle-class" select="$detail"/>
			</xsl:with-param>
		</xsl:apply-templates>
	</xsl:template>

	<xsl:template mode="leyenda" match="Condominio/*/@cuota_administracion">
		<xsl:param name="class"></xsl:param>
		<xsl:text> de </xsl:text>
		<xsl:apply-templates select="../@cantidad">
			<xsl:with-param name="class" select="$class"/>
		</xsl:apply-templates>
		<xsl:text> </xsl:text>
		<xsl:value-of select="translate(name(..),'_',' ')"/>
	</xsl:template>

	<xsl:template match="Texto/*">
		<xsl:element name="{name()}" namespace="http://www.w3.org/1999/xhtml">
			<xsl:attribute name="xo-slot">text()</xsl:attribute>
			<xsl:value-of select="normalize-space()"/>
		</xsl:element>
	</xsl:template>

	<xsl:template match="Texto/text()">
		<p xo-slot="text()">
			<xsl:copy-of select="."/>
		</p>
	</xsl:template>

	<xsl:template mode="concepto_detalle-class" match="@*|*">otro</xsl:template>
	<xsl:template mode="concepto_detalle-class" match="Condominio/*/@cuota_administracion">reference</xsl:template>

</xsl:stylesheet>