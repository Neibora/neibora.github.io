<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" encoding="UTF-8" indent="yes"/>
	<xsl:decimal-format name="mx" decimal-separator="." grouping-separator=","/>
	<xsl:param name="unidad" select="'30'"/>

	<xsl:template match="/estado-resultados">
		<xsl:variable name="unit" select="cartera/lote[@id=$unidad]"/>
		<xsl:variable name="number" select="$unit/@numero"/>
		<xsl:variable name="periods" select="periodo[position() &gt; 1]"/>
		<xsl:variable name="monthly" select="number($unit/@cuotas) div count($periods)"/>
		<xsl:variable name="other-charges" select="number($unit/@recargos)+number($unit/@multas)+number($unit/@tags)"/>
		<xsl:variable name="payments" select="sum($periods/ingresos/partida/movimiento[@lote=$number]/@monto)"/>
		<xsl:variable name="opening" select="number($unit/@saldo)-number($unit/@cuotas)-$other-charges+$payments"/>
		<xsl:variable name="excluded-payments" select="sum(periodo[1]/ingresos/partida/movimiento[@lote=$number]/@monto)"/>

		<section class="account-app">
			<style>
				.account-app{--primary:#005a4f;--primary-dark:#00483f;--accent:#57bd63;--aqua:#dff2ed;--ink:#28343c;--muted:#6d7882;--line:#d5dfdc;--paper:#fff;--canvas:#f4f7f6;max-width:1050px;margin:0 auto;padding:28px 24px 70px;color:var(--ink)}
				.account-app *{box-sizing:border-box}.statement{overflow:hidden;background:var(--paper);border:1px solid var(--line);border-top:7px solid var(--primary);border-radius:12px;box-shadow:0 16px 40px rgba(28,72,64,.1)}
				.statement-head{display:grid;grid-template-columns:1.2fr .8fr;gap:28px;padding:27px 30px 22px;border-bottom:1px solid var(--line)}
				.brand{display:flex;align-items:flex-start;gap:15px}.brand img{width:58px;height:68px;object-fit:contain}.brand-kicker{color:var(--accent);font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.1em}.brand h1{margin:3px 0 4px;color:#093866;font-size:25px;text-transform:uppercase}.brand p{margin:0;color:var(--muted)}
				.cutoff{text-align:right}.cutoff small{display:block;color:var(--muted);font-size:10px;text-transform:uppercase}.cutoff strong{display:block;color:var(--primary);font-size:18px}.status-pill{display:inline-flex;margin-top:9px;padding:5px 10px;border-radius:14px;background:#eaf7ed;color:#237733;font-size:10px;font-weight:800;text-transform:uppercase}.status-pill.due{background:#fff0e7;color:#c75b14}.status-pill.credit{background:#e8f2ff;color:#1e64a6}
				.identity{display:grid;grid-template-columns:1fr 1fr;gap:22px;padding:20px 30px;background:#f8faf9}.identity-block{display:grid;grid-template-columns:130px 1fr;gap:5px 10px;font-size:11px}.identity-block dt{font-weight:800}.identity-block dd{margin:0}.identity-block .money{color:var(--primary);font-size:14px;font-weight:800}
				.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--line);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}.summary-item{padding:14px 18px;background:#fff}.summary-item small{display:block;color:var(--muted);font-size:9px;text-transform:uppercase}.summary-item strong{display:block;margin-top:3px;font-size:18px;font-variant-numeric:tabular-nums}.summary-item.balance{background:var(--primary);color:#fff}.summary-item.balance small{color:#cde8e2}
				.movement-section{padding:24px 30px}.section-title{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:9px}.section-title h2{margin:0;color:var(--primary);font-size:13px;text-transform:uppercase}.section-title span{color:var(--muted);font-size:9px}
				.account-table{width:100%;border-collapse:collapse;font-size:10px}.account-table th{padding:7px 8px;background:var(--primary);color:#fff;text-align:left;text-transform:uppercase}.account-table th.amount,.account-table td.amount{text-align:right}.account-table td{padding:7px 8px;border-bottom:1px solid #e2e8e6}.account-table tbody tr:nth-child(4n+1){background:#f7f9f8}.account-table .opening-row td{background:var(--aqua);font-weight:700}.account-table .supplemental td{background:#fff8ec}.account-table .period-row.has-payments{cursor:pointer}.account-table .period-row.has-payments:hover td{background:#edf8f4}.account-table .period-row.has-payments .period-label:after{content:"+";display:inline-grid;place-items:center;float:right;width:16px;height:16px;border-radius:50%;background:var(--primary);color:#fff}.account-table .period-row.open .period-label:after{content:"−"}
				.payment-detail{display:none}.payment-detail.open{display:table-row}.payment-detail>td{padding:0;background:#f3f7f6}.payment-list{width:100%;border-collapse:collapse}.payment-list td{padding:5px 8px;border-color:#dde6e3;color:#526167;font-size:9px}.payment-list .date{width:95px}.payment-list .reference{width:125px}.payment-list .amount{width:110px;color:var(--primary);font-weight:800}
				.balance-band{display:grid;grid-template-columns:1fr auto;align-items:center;padding:15px 20px;background:linear-gradient(100deg,var(--primary),#08796c);color:#fff}.balance-band small{display:block;color:#d8eee9;text-transform:uppercase}.balance-band strong{font-size:28px}.balance-band .amount{text-align:right}.balance-band.due{background:linear-gradient(100deg,#c95c19,#ef7c2b)}
				.notes{margin:0 30px 27px;padding:14px 16px;background:#f1f5f4;border-left:4px solid var(--accent);font-size:10px;line-height:1.55}.notes strong{display:block;color:var(--primary);text-transform:uppercase}.statement-footer{padding:13px 30px;background:#edf4f2;color:var(--muted);font-size:9px;text-align:center}
				.dark .account-app{--ink:#e2e8f0;--muted:#94a3b8;--line:#334155;--paper:#172033}.dark .identity,.dark .summary-item,.dark .account-table tbody tr:nth-child(4n+1){background:#1b263a}.dark .account-table td{border-color:#334155}.dark .payment-detail>td,.dark .notes,.dark .statement-footer{background:#202c40}.dark .brand h1{color:#dbeafe}
				@media(max-width:720px){.account-app{padding:12px 8px 50px}.statement{border-radius:0}.statement-head{grid-template-columns:1fr;padding:20px 16px}.cutoff{text-align:left}.identity{grid-template-columns:1fr;padding:16px}.summary{grid-template-columns:1fr 1fr}.movement-section{padding:18px 8px;overflow-x:auto}.account-table{min-width:680px}.notes{margin:0 14px 20px}.balance-band{grid-template-columns:1fr}.balance-band .amount{text-align:left;margin-top:7px}}
				@media print{@page{size:letter;margin:8mm}.account-app{max-width:none;padding:0}.statement{border:0;border-top:5px solid var(--primary);border-radius:0;box-shadow:none}.statement-head{padding:16px 20px}.identity{padding:13px 20px}.summary-item{padding:9px 12px}.movement-section{padding:14px 20px}.payment-detail{display:none!important}.period-row .period-label:after{display:none!important}.notes{margin:0 20px 15px}.statement-footer{padding:8px 20px}}
			</style>

			<article class="statement">
				<header class="statement-head">
					<div class="brand">
						<img src="../assets/img/logo.png" alt="Neibora"/>
						<div><span class="brand-kicker">Gestión residencial integral</span><h1>Estado de cuenta</h1><p><xsl:value-of select="@desarrollo"/></p></div>
					</div>
					<div class="cutoff">
						<small>Fecha de corte</small><strong><xsl:value-of select="cartera/@fecha-corte"/></strong>
						<span>
							<xsl:attribute name="class">status-pill<xsl:choose><xsl:when test="number($unit/@saldo)&gt;0"> due</xsl:when><xsl:when test="number($unit/@saldo)&lt;0"> credit</xsl:when></xsl:choose></xsl:attribute>
							<xsl:choose><xsl:when test="number($unit/@saldo)&gt;0">Saldo pendiente</xsl:when><xsl:when test="number($unit/@saldo)&lt;0">Saldo a favor</xsl:when><xsl:otherwise>Al corriente</xsl:otherwise></xsl:choose>
						</span>
					</div>
				</header>

				<div class="identity">
					<dl class="identity-block"><dt>Desarrollo</dt><dd><xsl:value-of select="@desarrollo"/></dd><dt>Unidad</dt><dd><xsl:value-of select="$unit/@calle"/><xsl:text> </xsl:text><xsl:value-of select="$unit/@numero"/></dd><dt>Identificador</dt><dd><xsl:value-of select="$unit/@id"/></dd></dl>
					<dl class="identity-block"><dt>Cuota mensual</dt><dd class="money">$<xsl:value-of select="format-number($monthly,'#,##0.00','mx')"/></dd><dt>Periodos</dt><dd><xsl:value-of select="count($periods)"/> meses</dd><dt>Moneda</dt><dd><xsl:value-of select="@moneda"/></dd></dl>
				</div>

				<div class="summary">
					<div class="summary-item"><small>Saldo anterior calculado</small><strong>$<xsl:value-of select="format-number($opening,'#,##0.00;(#,##0.00)','mx')"/></strong></div>
					<div class="summary-item"><small>Cargos del periodo</small><strong>$<xsl:value-of select="format-number(number($unit/@cuotas)+$other-charges,'#,##0.00','mx')"/></strong></div>
					<div class="summary-item"><small>Pagos identificados</small><strong>$<xsl:value-of select="format-number($payments,'#,##0.00','mx')"/></strong></div>
					<div class="summary-item balance"><small>Saldo al corte</small><strong>$<xsl:value-of select="format-number(number($unit/@saldo),'#,##0.00;(#,##0.00)','mx')"/></strong></div>
				</div>

				<section class="movement-section">
					<div class="section-title"><h2>Detalle de movimientos</h2><span>Selecciona un periodo para consultar sus pagos</span></div>
					<table class="account-table">
						<thead><tr><th>Periodo</th><th class="amount">Cargo</th><th class="amount">Abono</th><th class="amount">Saldo</th><th>Fecha de pago</th><th>Referencia</th></tr></thead>
						<tbody>
							<tr class="opening-row"><td>Saldo anterior</td><td class="amount">—</td><td class="amount">—</td><td class="amount">$<xsl:value-of select="format-number($opening,'#,##0.00;(#,##0.00)','mx')"/></td><td>—</td><td>Histórico</td></tr>
							<xsl:for-each select="$periods">
								<xsl:variable name="period-payments" select="ingresos/partida/movimiento[@lote=$number]"/>
								<xsl:variable name="paid" select="sum($period-payments/@monto)"/>
								<xsl:variable name="cumulative-paid" select="sum((preceding-sibling::periodo | .)/ingresos/partida/movimiento[@lote=$number]/@monto)-$excluded-payments"/>
								<xsl:variable name="running" select="$opening+(position()*$monthly)-$cumulative-paid"/>
								<tr data-detail="detail-{@id}">
									<xsl:attribute name="class">period-row<xsl:if test="count($period-payments)"> has-payments</xsl:if></xsl:attribute>
									<td class="period-label"><xsl:call-template name="period-label"><xsl:with-param name="id" select="@id"/></xsl:call-template></td>
									<td class="amount">$<xsl:value-of select="format-number($monthly,'#,##0.00','mx')"/></td>
									<td class="amount"><xsl:choose><xsl:when test="$paid">$<xsl:value-of select="format-number($paid,'#,##0.00','mx')"/></xsl:when><xsl:otherwise>—</xsl:otherwise></xsl:choose></td>
									<td class="amount">$<xsl:value-of select="format-number($running,'#,##0.00;(#,##0.00)','mx')"/></td>
									<td><xsl:choose><xsl:when test="$period-payments"><xsl:value-of select="$period-payments[last()]/@fecha"/></xsl:when><xsl:otherwise>Pendiente</xsl:otherwise></xsl:choose></td>
									<td><xsl:choose><xsl:when test="$period-payments[last()]/@referencia"><xsl:value-of select="$period-payments[last()]/@referencia"/></xsl:when><xsl:otherwise>—</xsl:otherwise></xsl:choose></td>
								</tr>
								<xsl:if test="$period-payments">
									<tr class="payment-detail" id="detail-{@id}"><td colspan="6"><table class="payment-list"><tbody>
										<xsl:for-each select="$period-payments"><tr><td class="date"><xsl:value-of select="@fecha"/></td><td><xsl:value-of select="@concepto"/></td><td class="reference"><xsl:value-of select="@referencia"/></td><td class="amount">$<xsl:value-of select="format-number(number(@monto),'#,##0.00','mx')"/></td></tr></xsl:for-each>
									</tbody></table></td></tr>
								</xsl:if>
							</xsl:for-each>
							<xsl:if test="$other-charges!=0"><tr class="supplemental"><td>Otros cargos del corte</td><td class="amount">$<xsl:value-of select="format-number($other-charges,'#,##0.00','mx')"/></td><td class="amount">—</td><td class="amount">$<xsl:value-of select="format-number(number($unit/@saldo),'#,##0.00;(#,##0.00)','mx')"/></td><td>—</td><td>Recargos, multas o tags</td></tr></xsl:if>
						</tbody>
					</table>
				</section>

				<div>
					<xsl:attribute name="class">balance-band<xsl:if test="number($unit/@saldo)&gt;0"> due</xsl:if></xsl:attribute>
					<div><small><xsl:choose><xsl:when test="number($unit/@saldo)&gt;0">Saldo pendiente</xsl:when><xsl:when test="number($unit/@saldo)&lt;0">Saldo a favor</xsl:when><xsl:otherwise>Estado</xsl:otherwise></xsl:choose></small><strong><xsl:choose><xsl:when test="number($unit/@saldo)&gt;0">Pago requerido</xsl:when><xsl:when test="number($unit/@saldo)&lt;0">Crédito disponible</xsl:when><xsl:otherwise>Al corriente</xsl:otherwise></xsl:choose></strong></div>
					<div class="amount"><small>Total</small><strong>$<xsl:value-of select="format-number(number($unit/@saldo),'#,##0.00;(#,##0.00)','mx')"/></strong></div>
				</div>
				<div class="notes"><strong>Observaciones de la administración</strong>Al realizar un pago, indica el desarrollo, la calle y el número de unidad. Conserva tu comprobante para facilitar su identificación y conciliación.</div>
				<footer class="statement-footer">Información generada a partir de <xsl:value-of select="@fuente"/> · <xsl:value-of select="@generado"/></footer>
			</article>
			<script><![CDATA[
				(function(){
					var statement=document.querySelector('.account-app');
					statement.onclick=function(event){
						var row=event.target.closest('.period-row.has-payments[data-detail]');
						if(!row)return;
						var detail=statement.querySelector('#'+row.dataset.detail);
						if(!detail)return;
						var open=detail.classList.toggle('open');
						row.classList.toggle('open',open);
					};
				}());
			]]></script>
		</section>
	</xsl:template>

	<xsl:template name="period-label">
		<xsl:param name="id"/>
		<xsl:variable name="month" select="substring($id,6,2)"/>
		<xsl:choose>
			<xsl:when test="$month='01'">Enero</xsl:when><xsl:when test="$month='02'">Febrero</xsl:when><xsl:when test="$month='03'">Marzo</xsl:when><xsl:when test="$month='04'">Abril</xsl:when>
			<xsl:when test="$month='05'">Mayo</xsl:when><xsl:when test="$month='06'">Junio</xsl:when><xsl:when test="$month='07'">Julio</xsl:when><xsl:when test="$month='08'">Agosto</xsl:when>
			<xsl:when test="$month='09'">Septiembre</xsl:when><xsl:when test="$month='10'">Octubre</xsl:when><xsl:when test="$month='11'">Noviembre</xsl:when><xsl:otherwise>Diciembre</xsl:otherwise>
		</xsl:choose>
		<xsl:text> </xsl:text><xsl:value-of select="substring($id,1,4)"/>
	</xsl:template>
</xsl:stylesheet>
