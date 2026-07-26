<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  <xsl:decimal-format name="mx" decimal-separator="." grouping-separator=","/>

  <xsl:template match="/">
    <html lang="es">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>Estado de resultados · <xsl:value-of select="estado-resultados/@desarrollo"/></title>
        <style>
          :root{
            --neibora:#005a4f;--neibora-dark:#00483f;--accent:#57bd63;
            --accent-soft:#edf8ef;--aqua:#d9f1ec;--ink:#28343c;
            --muted:#6d7882;--line:#cfd8d5;--paper:#fff;--canvas:#f5f7f7;
            --danger:#bf3030;--warning:#f4c842;
          }
          *{box-sizing:border-box}
          html{scroll-behavior:smooth}
          body{margin:0;background:var(--canvas);color:var(--ink);font:12px/1.4 Arial,Helvetica,sans-serif}
          button,select{font:inherit}
          .appbar{height:76px;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:10px 28px;background:#fff;border-bottom:1px solid #e2e7e5;box-shadow:0 1px 8px rgba(0,72,63,.05)}
          .appbrand{display:flex;align-items:center;gap:11px;color:var(--accent);font-size:20px;font-weight:700}.appbrand img{width:38px;height:48px;object-fit:contain}.appmeta{color:var(--muted);text-align:right}.appmeta strong{display:block;color:var(--neibora);font-size:12px}
          .controls{position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 28px;background:rgba(245,247,247,.96);border-bottom:1px solid #dfe5e3;backdrop-filter:blur(8px)}
          .control-group{display:flex;align-items:center;gap:8px}.controls label{font-weight:700;color:var(--neibora)}select{min-width:150px;padding:7px 30px 7px 9px;border:1px solid var(--line);border-radius:5px;background:#fff;color:var(--ink)}
          .view-switch{display:flex;padding:3px;background:#e6ecea;border-radius:7px}.view-switch button{padding:6px 12px;border:0;border-radius:5px;background:transparent;color:var(--muted);cursor:pointer}.view-switch button.active{background:var(--neibora);color:#fff;box-shadow:0 2px 5px rgba(0,90,79,.2)}
          .periods-stage{padding:24px;display:flex;justify-content:center;scroll-behavior:smooth}.period-sheet{display:none;width:min(720px,100%);background:var(--paper);border:1px solid #dce3e1;border-top:7px solid var(--neibora);border-radius:10px;box-shadow:0 12px 32px rgba(27,70,63,.1);padding:24px 24px 28px}.period-sheet.active{display:block}
          body.compare-mode .periods-stage{justify-content:flex-start;align-items:flex-start;gap:22px;height:calc(100vh - 150px);overflow:auto;scroll-snap-type:x proximity;padding-bottom:18px}
          body.compare-mode .period-sheet{display:block;flex:0 0 640px;width:640px;scroll-snap-align:start;padding:20px}
          body.compare-mode .period-selector{opacity:.55}
          .sheet-header{position:relative;display:grid;grid-template-columns:95px 1fr 95px;align-items:center;min-height:76px;padding-bottom:13px;border-bottom:3px solid transparent;border-image:linear-gradient(90deg,var(--neibora),var(--accent)) 1}
          .sheet-logo{text-align:center;color:var(--neibora);font-size:13px;font-weight:700}.sheet-logo img{display:block;width:45px;height:52px;object-fit:contain;margin:0 auto -2px}.sheet-title{text-align:center;color:#093866}.sheet-title h1{margin:0;font-size:18px;text-transform:uppercase}.sheet-title strong{display:block;margin-top:5px;font-size:15px}.period-chip{justify-self:end;align-self:start;padding:3px 7px;border-radius:20px;background:var(--warning);font-size:9px;font-weight:700;text-transform:uppercase}
          .block{margin-top:18px}.sheet-table{width:100%;border-collapse:collapse;table-layout:fixed}.sheet-table th,.sheet-table td{border:1px solid #263238;padding:4px 6px}.sheet-table th{text-align:left;font-weight:700}.sheet-table .amount{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}.sheet-table .spacer td{height:12px;border:0}
          .assessment th,.assessment td{background:var(--aqua);font-size:12px}.assessment .count{width:62px;text-align:center}
          .result-table .label{width:66%}.result-table .amount{font-weight:500}.result-table .green{color:var(--accent);font-weight:700}.result-table .total-row td{background:var(--neibora);color:#fff;font-weight:700;border-color:var(--neibora-dark)}.result-table .total-row .amount{font-weight:700}.result-table .ending td{font-weight:700}.result-table .ending .amount{color:var(--accent)}.result-table .negative{color:var(--danger)!important}
          .section-band{margin-top:20px;padding:3px 8px;background:var(--neibora);color:#fff;text-align:center;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.02em;border-radius:3px 3px 0 0}
          .expense-table th{background:var(--aqua);text-align:center}.expense-table .index{width:34px;text-align:center}.expense-table .concept{width:36%;text-align:left}.expense-table .amount{font-weight:500}.expense-table .grand-total td{background:var(--aqua);font-weight:700}.expense-line,.income-line{cursor:pointer}.expense-line:hover td,.income-line:hover td{background:var(--accent-soft)}.has-detail .concept:after{content:"+";float:right;display:inline-grid;place-items:center;width:17px;height:17px;border-radius:50%;background:var(--neibora);color:#fff;font-size:11px}.has-detail.open .concept:after{content:"−"}
          .drill-row{display:none}.drill-row.open{display:table-row}.drill-row>td{padding:0!important;background:#f7faf9}.drill-table{width:100%;border-collapse:collapse}.drill-table td{border-color:#d9e2df!important;padding:4px 6px!important;font-size:10px}.drill-table .detail-date{width:76px;color:var(--muted)}.drill-table .detail-origin{width:86px;color:var(--neibora);font-weight:700}.drill-table .detail-amount{width:100px;text-align:right}
          .extra-table th{background:var(--aqua);text-align:center}.extra-table .index{width:34px;text-align:center}.extra-table .cost{width:120px;text-align:right}.extra-table td{height:26px}.extra-table .extra-total td{background:var(--aqua);font-weight:700}
          .sheet-footer{margin-top:14px;text-align:right;color:var(--muted);font-size:9px}.empty-note{text-align:center;color:var(--muted);font-style:italic}
          @media(max-width:760px){.appbar{height:auto;padding:8px 14px}.appbrand{font-size:15px}.appmeta{display:none}.controls{top:0;padding:9px 12px;align-items:flex-start;flex-direction:column}.periods-stage{padding:8px}.period-sheet{padding:14px 10px;border-radius:0}.sheet-header{grid-template-columns:72px 1fr 55px}.sheet-title h1{font-size:14px}.sheet-title strong{font-size:12px}.view-switch{width:100%}.view-switch button{flex:1}body.compare-mode .periods-stage{height:calc(100vh - 190px)}body.compare-mode .period-sheet{flex-basis:92vw;width:92vw}.optional{display:none}.sheet-table th,.sheet-table td{padding:4px 3px;font-size:10px}.expense-table .concept{width:53%}}
          @media print{@page{size:portrait;margin:8mm}body{background:#fff}.appbar,.controls{display:none}.periods-stage{display:block;padding:0}.period-sheet,.period-sheet.active,body.compare-mode .period-sheet{display:none;width:100%;border:0;border-top:5px solid var(--neibora);box-shadow:none;padding:0;break-after:page}.period-sheet.active{display:block}body.compare-mode .period-sheet{display:block}.has-detail .concept:after,.drill-row{display:none!important}.section-band,.result-table .total-row td,.assessment td,.assessment th,.expense-table th,.expense-table .grand-total td,.extra-table th,.extra-table .extra-total td{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
        </style>
      </head>
      <body>
        <header class="appbar">
          <div class="appbrand"><img src="../assets/img/logo.png" alt="Neibora"/>Neibora · Estado de resultados</div>
          <div class="appmeta"><strong><xsl:value-of select="estado-resultados/@desarrollo"/></strong>Información financiera mensual</div>
        </header>
        <div class="controls">
          <div class="control-group period-selector">
            <label for="periodPicker">Periodo</label>
            <select id="periodPicker">
              <xsl:for-each select="estado-resultados/periodo">
                <option value="{@id}">
                  <xsl:if test="position()=last()"><xsl:attribute name="selected">selected</xsl:attribute></xsl:if>
                  <xsl:call-template name="period-label"><xsl:with-param name="id" select="@id"/></xsl:call-template>
                  <xsl:if test="@estatus='parcial'"> · parcial</xsl:if>
                </option>
              </xsl:for-each>
            </select>
          </div>
          <div class="view-switch" aria-label="Modo de visualización">
            <button type="button" id="singleMode" class="active">Periodo individual</button>
            <button type="button" id="compareMode">Comparar periodos</button>
          </div>
        </div>
        <main class="periods-stage">
          <xsl:apply-templates select="estado-resultados/periodo"/>
        </main>
        <script>
          (function(){
            var picker=document.getElementById('periodPicker');
            var singleButton=document.getElementById('singleMode');
            var compareButton=document.getElementById('compareMode');
            var stage=document.querySelector('.periods-stage');
            function sheets(){return document.querySelectorAll('.period-sheet');}
            function selectPeriod(id,scroll){
              sheets().forEach(function(sheet){sheet.classList.toggle('active',sheet.dataset.period===id);});
              if(document.body.classList.contains('compare-mode') &amp;&amp; scroll){
                var target=document.querySelector('.period-sheet[data-period="'+id+'"]');
                if(target){
                  var paddingLeft=parseFloat(getComputedStyle(stage).paddingLeft)||0;
                  stage.scrollTo({left:Math.max(0,target.offsetLeft-paddingLeft),behavior:'smooth'});
                }
              }
              if(history.replaceState){
                var url=new URL(location.href);
                url.searchParams.set('periodo',id);
                url.hash='';
                history.replaceState(null,'',url.pathname+url.search);
              }
            }
            function setMode(compare){
              document.body.classList.toggle('compare-mode',compare);
              singleButton.classList.toggle('active',!compare);
              compareButton.classList.toggle('active',compare);
              if(compare)setTimeout(function(){selectPeriod(picker.value,true);},0);
            }
            picker.addEventListener('change',function(){selectPeriod(this.value,true);});
            singleButton.addEventListener('click',function(){setMode(false);});
            compareButton.addEventListener('click',function(){setMode(true);});
            document.addEventListener('click',function(event){
              var line=event.target.closest('.has-detail[data-detail]');if(!line)return;
              var id=line.getAttribute('data-detail');
              var detail=document.getElementById(id);
              var open=detail.classList.toggle('open');line.classList.toggle('open',open);
            });
            var requested=new URLSearchParams(location.search).get('periodo');
            if(requested &amp;&amp; document.querySelector('.period-sheet[data-period="'+requested+'"]'))picker.value=requested;
            selectPeriod(picker.value,false);
          }());
        </script>
      </body>
    </html>
  </xsl:template>

  <xsl:template match="periodo">
    <xsl:variable name="quota" select="sum(ingresos/partida[@codigo='cuota']/@monto)"/>
    <xsl:variable name="recovered" select="number(@cuotas-recuperadas)"/>
    <xsl:variable name="advanced" select="number(@cuotas-adelantadas)"/>
    <xsl:variable name="ordinaryQuota" select="$quota - $recovered - $advanced"/>
    <xsl:variable name="extraordinary" select="egresos/partida/movimiento[translate(@tipo,'ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÚ','abcdefghijklmnopqrstuvwxyzáéíóú')='extraordinario']"/>
    <section class="period-sheet" data-period="{@id}">
      <header class="sheet-header">
        <div class="sheet-logo"><img src="../assets/img/logo.png" alt="Neibora"/>Neibora</div>
        <div class="sheet-title">
          <h1>Estado de resultados <xsl:call-template name="period-label"><xsl:with-param name="id" select="@id"/></xsl:call-template></h1>
          <strong><xsl:value-of select="/estado-resultados/@desarrollo"/></strong>
        </div>
        <xsl:if test="@estatus='parcial'"><span class="period-chip">Parcial</span></xsl:if>
      </header>

      <div class="block">
        <table class="sheet-table assessment">
          <tr><th colspan="2">CUOTA DE MANTENIMIENTO MENSUAL POR CASA</th><td class="amount"><xsl:call-template name="money"><xsl:with-param name="value" select="@cuota-mensual"/></xsl:call-template></td></tr>
          <tr><td class="count"><xsl:value-of select="@casas"/></td><th>CUOTAS COBRABLES</th><td class="amount"><xsl:call-template name="money"><xsl:with-param name="value" select="@cuotas-cobrables"/></xsl:call-template></td></tr>
        </table>
      </div>

      <div class="block">
        <table class="sheet-table result-table">
          <tr><td class="label">REMANENTE PERIODO ANTERIOR</td><td></td><td class="amount green"><xsl:call-template name="money"><xsl:with-param name="value" select="@remanente-anterior"/></xsl:call-template></td></tr>
          <tr class="spacer"><td colspan="3"></td></tr>
          <xsl:call-template name="income-row"><xsl:with-param name="label" select="'INGRESOS CUOTAS DE MANTENIMIENTO'"/><xsl:with-param name="value" select="$ordinaryQuota"/><xsl:with-param name="code" select="'cuota'"/></xsl:call-template>
          <tr><td>INGRESOS CUOTAS DE MANTENIMIENTO ADELANTADAS</td><td></td><td class="amount"><xsl:call-template name="money"><xsl:with-param name="value" select="$advanced"/></xsl:call-template></td></tr>
          <tr><td>INGRESOS RECUPERACIÓN CUOTAS ATRASADAS</td><td></td><td class="amount"><xsl:call-template name="money"><xsl:with-param name="value" select="$recovered"/></xsl:call-template></td></tr>
          <xsl:call-template name="income-row"><xsl:with-param name="label" select="'INGRESOS POR RECARGOS'"/><xsl:with-param name="value" select="sum(ingresos/partida[@codigo='recargo']/@monto)"/><xsl:with-param name="code" select="'recargo'"/></xsl:call-template>
          <xsl:call-template name="income-row"><xsl:with-param name="label" select="'INGRESOS CUOTAS EXTRAORDINARIAS INTERNAS'"/><xsl:with-param name="value" select="sum(ingresos/partida[@codigo='cuota-interna']/@monto)"/><xsl:with-param name="code" select="'cuota-interna'"/></xsl:call-template>
          <xsl:call-template name="income-row"><xsl:with-param name="label" select="'INGRESOS CUOTAS EXTRAORDINARIAS EXTERNAS'"/><xsl:with-param name="value" select="sum(ingresos/partida[@codigo='cuota-externa']/@monto)"/><xsl:with-param name="code" select="'cuota-externa'"/></xsl:call-template>
          <xsl:call-template name="income-row"><xsl:with-param name="label" select="'INGRESOS POR RENTA DE AMENIDADES'"/><xsl:with-param name="value" select="sum(ingresos/partida[@codigo='renta']/@monto)"/><xsl:with-param name="code" select="'renta'"/></xsl:call-template>
          <xsl:call-template name="income-row"><xsl:with-param name="label" select="'INGRESOS MULTAS'"/><xsl:with-param name="value" select="sum(ingresos/partida[@codigo='multa']/@monto)"/><xsl:with-param name="code" select="'multa'"/></xsl:call-template>
          <xsl:call-template name="income-row"><xsl:with-param name="label" select="'INGRESO TAGS'"/><xsl:with-param name="value" select="sum(ingresos/partida[@codigo='tag']/@monto)"/><xsl:with-param name="code" select="'tag'"/></xsl:call-template>
          <xsl:call-template name="income-row"><xsl:with-param name="label" select="'DEPÓSITOS NO IDENTIFICADOS'"/><xsl:with-param name="value" select="sum(ingresos/partida[@codigo='sin-identificar']/@monto)"/><xsl:with-param name="code" select="'sin-identificar'"/></xsl:call-template>
          <tr class="total-row"><td colspan="2">TOTAL DE INGRESOS</td><td class="amount"><xsl:call-template name="money"><xsl:with-param name="value" select="ingresos/@total"/></xsl:call-template></td></tr>
          <tr><td colspan="2">EGRESOS ORDINARIOS</td><td class="amount"><xsl:call-template name="money"><xsl:with-param name="value" select="egresos/@ordinarios"/></xsl:call-template></td></tr>
          <tr><td colspan="2">EGRESOS EXTRAORDINARIOS</td><td class="amount"><xsl:call-template name="money"><xsl:with-param name="value" select="egresos/@extraordinarios"/></xsl:call-template></td></tr>
          <tr class="total-row"><td colspan="2">TOTAL EGRESOS DEL MES</td><td class="amount"><xsl:call-template name="money"><xsl:with-param name="value" select="egresos/@total"/></xsl:call-template></td></tr>
          <tr class="ending"><td colspan="2">REMANENTE PERIODO ACTUAL</td><td><xsl:attribute name="class">amount<xsl:if test="@saldo-final &lt; 0"> negative</xsl:if></xsl:attribute><xsl:call-template name="money"><xsl:with-param name="value" select="@saldo-final"/></xsl:call-template></td></tr>
        </table>
      </div>

      <div class="section-band">Egresos</div>
      <table class="sheet-table expense-table">
        <thead><tr><th class="index"></th><th class="concept">Concepto</th><th class="amount">Internos</th><th class="amount">Externos</th><th class="amount">Total</th></tr></thead>
        <tbody><xsl:apply-templates select="egresos/partida" mode="expense"/></tbody>
        <tfoot><tr class="grand-total"><td></td><td class="amount">TOTAL</td><td class="amount"><xsl:call-template name="money"><xsl:with-param name="value" select="sum(egresos/partida/@interno)"/></xsl:call-template></td><td class="amount"><xsl:call-template name="money"><xsl:with-param name="value" select="sum(egresos/partida/@externo)"/></xsl:call-template></td><td class="amount"><xsl:call-template name="money"><xsl:with-param name="value" select="egresos/@total"/></xsl:call-template></td></tr></tfoot>
      </table>

      <div class="section-band">Detalle de actividades extraordinarias</div>
      <table class="sheet-table extra-table">
        <thead><tr><th class="index"></th><th>Concepto</th><th class="cost">Costo</th></tr></thead>
        <tbody>
          <xsl:choose>
            <xsl:when test="$extraordinary">
              <xsl:for-each select="$extraordinary"><tr><td class="index"><xsl:value-of select="position()"/></td><td><xsl:value-of select="@concepto"/></td><td class="amount"><xsl:call-template name="money"><xsl:with-param name="value" select="@monto"/></xsl:call-template></td></tr></xsl:for-each>
            </xsl:when>
            <xsl:otherwise><tr><td></td><td class="empty-note">Sin actividades extraordinarias en el periodo</td><td class="amount">$0.00</td></tr></xsl:otherwise>
          </xsl:choose>
        </tbody>
        <tfoot><tr class="extra-total"><td></td><td class="amount">TOTAL</td><td class="amount"><xsl:call-template name="money"><xsl:with-param name="value" select="egresos/@extraordinarios"/></xsl:call-template></td></tr></tfoot>
      </table>
      <div class="sheet-footer">Fuente consolidada · <xsl:value-of select="/estado-resultados/@generado"/></div>
    </section>
  </xsl:template>

  <xsl:template name="income-row">
    <xsl:param name="label"/><xsl:param name="value"/><xsl:param name="code"/>
    <xsl:variable name="item" select="ingresos/partida[@codigo=$code]"/>
    <xsl:variable name="detailId" select="concat(@id,'-ingreso-', $code)"/>
    <tr>
      <xsl:attribute name="class">income-line<xsl:if test="$item/movimiento"> has-detail</xsl:if></xsl:attribute>
      <xsl:if test="$item/movimiento"><xsl:attribute name="data-detail"><xsl:value-of select="$detailId"/></xsl:attribute></xsl:if>
      <td class="concept"><xsl:value-of select="$label"/></td><td></td><td class="amount"><xsl:call-template name="money"><xsl:with-param name="value" select="$value"/></xsl:call-template></td>
    </tr>
    <xsl:if test="$item/movimiento">
      <tr class="drill-row" id="{$detailId}"><td colspan="3"><table class="drill-table"><tbody>
        <xsl:for-each select="$item/movimiento"><tr><td class="detail-date"><xsl:value-of select="@fecha"/></td><td><xsl:value-of select="@concepto"/><xsl:if test="@lote"><br/><span class="muted">Lote <xsl:value-of select="@lote"/></span></xsl:if></td><td class="detail-origin"><xsl:value-of select="@origen"/></td><td class="detail-amount"><xsl:call-template name="money"><xsl:with-param name="value" select="@monto"/></xsl:call-template></td></tr></xsl:for-each>
      </tbody></table></td></tr>
    </xsl:if>
  </xsl:template>

  <xsl:template match="partida" mode="expense">
    <xsl:variable name="detailId" select="concat(../../@id,'-',@codigo)"/>
    <tr>
      <xsl:attribute name="class">expense-line<xsl:if test="movimiento"> has-detail</xsl:if></xsl:attribute>
      <xsl:if test="movimiento"><xsl:attribute name="data-detail"><xsl:value-of select="$detailId"/></xsl:attribute></xsl:if>
      <td class="index"><xsl:value-of select="position()"/></td><td class="concept"><xsl:value-of select="@concepto"/></td>
      <td class="amount"><xsl:call-template name="money"><xsl:with-param name="value" select="@interno"/></xsl:call-template></td>
      <td class="amount"><xsl:call-template name="money"><xsl:with-param name="value" select="@externo"/></xsl:call-template></td>
      <td class="amount"><strong><xsl:call-template name="money"><xsl:with-param name="value" select="@monto"/></xsl:call-template></strong></td>
    </tr>
    <xsl:if test="movimiento"><tr class="drill-row" id="{$detailId}"><td colspan="5"><table class="drill-table"><tbody><xsl:for-each select="movimiento"><tr><td class="detail-date"><xsl:value-of select="@fecha"/></td><td><xsl:value-of select="@concepto"/><xsl:if test="@proveedor"><br/><span class="muted"><xsl:value-of select="@proveedor"/></span></xsl:if></td><td class="detail-origin"><xsl:value-of select="@origen"/></td><td class="detail-amount"><xsl:call-template name="money"><xsl:with-param name="value" select="@monto"/></xsl:call-template></td></tr></xsl:for-each></tbody></table></td></tr></xsl:if>
  </xsl:template>

  <xsl:template name="period-label">
    <xsl:param name="id"/><xsl:variable name="month" select="substring($id,6,2)"/>
    <xsl:choose><xsl:when test="$month='01'">Enero</xsl:when><xsl:when test="$month='02'">Febrero</xsl:when><xsl:when test="$month='03'">Marzo</xsl:when><xsl:when test="$month='04'">Abril</xsl:when><xsl:when test="$month='05'">Mayo</xsl:when><xsl:when test="$month='06'">Junio</xsl:when><xsl:when test="$month='07'">Julio</xsl:when><xsl:when test="$month='08'">Agosto</xsl:when><xsl:when test="$month='09'">Septiembre</xsl:when><xsl:when test="$month='10'">Octubre</xsl:when><xsl:when test="$month='11'">Noviembre</xsl:when><xsl:otherwise>Diciembre</xsl:otherwise></xsl:choose>
    <xsl:text> </xsl:text><xsl:value-of select="substring($id,1,4)"/>
  </xsl:template>

  <xsl:template name="money">
    <xsl:param name="value"/>
    <xsl:choose><xsl:when test="string($value)=''">$0.00</xsl:when><xsl:when test="number($value) &lt; 0">(<xsl:text>$</xsl:text><xsl:value-of select="format-number(0-number($value),'#,##0.00','mx')"/>)</xsl:when><xsl:otherwise><xsl:text>$</xsl:text><xsl:value-of select="format-number(number($value),'#,##0.00','mx')"/></xsl:otherwise></xsl:choose>
  </xsl:template>
</xsl:stylesheet>
