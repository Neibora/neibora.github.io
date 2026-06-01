<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml"
  xmlns:xo="http://panax.io/xover"
  xmlns:state="http://panax.io/state">

  <xsl:output method="html" indent="yes" encoding="utf-8"/>
  <xsl:strip-space elements="*"/>

  <xsl:key name="conceptos-deuda" match="Deuda/Concepto/@monto" use="'deuda'"/>
  <xsl:key name="pagos" match="Pagos/Pago" use="'pagos'"/>
  <xsl:key name="firmas" match="Firmas/Firma" use="'firmas'"/>

  <xsl:template name="money">
    <xsl:param name="v"/>
    <xsl:text>$</xsl:text>
    <xsl:value-of select="format-number(number($v), '#,##0.00')"/>
  </xsl:template>

  <xsl:template name="sum-values">
    <xsl:param name="nodes" select="."/>
    <xsl:param name="i" select="1"/>
    <xsl:param name="acc" select="0"/>
    <xsl:choose>
      <xsl:when test="$i &gt; count($nodes)">
        <xsl:value-of select="$acc"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="sum-values">
          <xsl:with-param name="nodes" select="$nodes"/>
          <xsl:with-param name="i" select="$i + 1"/>
          <xsl:with-param name="acc" select="$acc + number($nodes[$i])"/>
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="/Convenio">
    <xsl:variable name="totalDeuda">
      <xsl:call-template name="sum-values">
        <xsl:with-param name="nodes" select="Deuda/Concepto/@monto"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="totalDeudaN" select="number($totalDeuda)"/>

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
              <img alt="Neibora Property Management" class="h-16 mb-4" src="/assets/img/logo.png" />
              <h2 class="text-sm font-semibold tracking-wider text-primary dark:text-accent uppercase">Administración de Condominios</h2>
            </div>
            <div class="text-right">
              <p class="text-slate-500 dark:text-slate-400 text-sm mb-1"><xsl:value-of select="@lugar"/></p>
              <xsl:apply-templates select="@fecha"/>
            </div>
          </div>

          <div class="mb-8">
            <h1 class="text-2xl font-bold text-primary dark:text-white border-b-2 border-accent inline-block pb-1 mb-4">
              <xsl:value-of select="Condominio/@nombre"/>
            </h1>
            <p class="text-lg font-medium text-slate-700 dark:text-slate-300">
              <xsl:value-of select="@titulo"/>
            </p>

            <div class="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed max-w-none space-y-2">
              <p>
                <xsl:apply-templates select="Intro/*|Intro/text()"/>
              </p>
            </div>
          </div>

          <div class="mt-10">
            <h3 class="text-[10px] font-bold text-primary dark:text-accent uppercase tracking-widest mb-4">Desglose detallado de deuda</h3>
            <div class="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 mb-4">
              <table class="w-full text-sm text-left">
                <thead class="bg-slate-50 dark:bg-slate-800 text-primary dark:text-accent uppercase text-xs font-bold">
                  <tr>
                    <th class="px-6 py-4">Concepto</th>
                    <th class="px-6 py-4 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                  <xsl:for-each select="Deuda/Concepto">
                    <tr>
                      <td class="px-6 py-3">
                        <xsl:value-of select="@nombre"/>
                      </td>
                      <td class="px-6 py-3 text-right font-medium font-mono">
                        <xsl:call-template name="money">
                          <xsl:with-param name="v" select="@monto"/>
                        </xsl:call-template>
                      </td>
                    </tr>
                  </xsl:for-each>
                </tbody>
              </table>
            </div>

            <div class="mt-4 flex items-center justify-between p-4 bg-green-50 dark:bg-emerald-950/40 rounded-lg border border-green-100 dark:border-emerald-900">
              <div>
                <p class="text-xs font-bold text-primary dark:text-accent uppercase">Total deuda pendiente</p>
              </div>
              <div class="text-right">
                <p class="text-lg font-black text-primary dark:text-accent font-mono">
                  <xsl:call-template name="money">
                    <xsl:with-param name="v" select="$totalDeudaN"/>
                  </xsl:call-template>
                </p>
              </div>
            </div>
          </div>

          <div class="mt-10 border-l-4 border-accent pl-6">
            <h3 class="text-[10px] font-bold text-primary dark:text-accent uppercase tracking-widest mb-4">Calendario de pagos comprometido</h3>
            <div class="space-y-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              <xsl:apply-templates select="Pagos/Texto/*|Pagos/Texto/text()"/>
              <div class="space-y-3">
                <xsl:for-each select="Pagos/Pago">
                  <p>
                    <strong><xsl:value-of select="position()"/>. <xsl:value-of select="@titulo"/>:</strong>
                    <xsl:text> Pagando el día </xsl:text>
                    <strong><xsl:value-of select="@fecha"/></strong>
                    <xsl:text> la cantidad de </xsl:text>
                    <strong>
                      <xsl:call-template name="money">
                        <xsl:with-param name="v" select="@monto"/>
                      </xsl:call-template>
                    </strong>
                    <xsl:if test="@detalle and normalize-space(@detalle)!=''">
                      <xsl:text> </xsl:text>
                      <xsl:value-of select="@detalle"/>
                    </xsl:if>
                  </p>
                </xsl:for-each>
              </div>
              <xsl:if test="normalize-space(Clausulas/Incumplimiento)!=''">
                <p class="mt-6 italic text-xs bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                  <strong>Nota:</strong>
                  <xsl:text> </xsl:text>
                  <xsl:value-of select="normalize-space(Clausulas/Incumplimiento)"/>
                </p>
              </xsl:if>
            </div>
          </div>

          <xsl:if test="Clausulas/Clausula">
            <div class="mt-10 border-l-4 border-accent pl-6">
              <h3 class="text-[10px] font-bold text-primary dark:text-accent uppercase tracking-widest mb-4">Cláusulas del convenio</h3>
              <ol class="list-decimal pl-5 space-y-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                <xsl:for-each select="Clausulas/Clausula">
                  <li><xsl:apply-templates select="node()"/></li>
                </xsl:for-each>
              </ol>
            </div>
          </xsl:if>

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
                  <p class="font-bold text-slate-800 dark:text-slate-100"><xsl:value-of select="@nombre"/></p>
                  <p class="text-sm text-slate-500 dark:text-slate-400 italic"><xsl:value-of select="@cargo"/></p>
                  <xsl:if test="@telefono">
                    <div class="mt-3 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <span class="material-icons text-primary dark:text-accent text-base">phone</span>
                      <span><xsl:value-of select="@telefono"/></span>
                    </div>
                  </xsl:if>
                </div>
              </xsl:for-each>
            </div>
          </div>
        </div>

        <footer class="bg-slate-50 dark:bg-slate-800/50 p-6 flex flex-wrap justify-center gap-8 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
          <div class="flex items-center gap-2">
            <span class="material-icons text-primary dark:text-accent text-base">language</span>
            <span><xsl:value-of select="@sitio"/></span>
          </div>
          <div class="flex items-center gap-2">
            <span class="material-icons text-primary dark:text-accent text-base">email</span>
            <span><xsl:value-of select="@correo"/></span>
          </div>
          <div class="flex items-center gap-2">
            <span class="material-icons text-primary dark:text-accent text-base">business_center</span>
            <span><xsl:value-of select="@marca"/> Administración</span>
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
    <span class="{$class}"><xsl:value-of select="."/></span>
  </xsl:template>

  <xsl:template match="@fecha">
    <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">
      <xsl:value-of select="."/>
    </p>
  </xsl:template>

  <xsl:template match="p">
    <p><xsl:apply-templates select="node()"/></p>
  </xsl:template>

  <xsl:template match="text()">
    <xsl:value-of select="."/>
  </xsl:template>

</xsl:stylesheet>