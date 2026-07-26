<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  <xsl:strip-space elements="*"/>

  <xsl:template match="/convocatoria">
    <html lang="es">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title><xsl:value-of select="encabezado/subtitulo"/> — <xsl:value-of select="organizacion/circuito"/></title>
        <style>
          :root {
            --azul: #003f4c;
            --azul-claro: #0b7b83;
            --verde: #238b4b;
            --verde-claro: #e9f5ed;
            --gris: #52636a;
            --linea: #cddfe2;
            --papel: #ffffff;
            --fondo: #eef4f4;
          }

          * { box-sizing: border-box; }

          body {
            margin: 0;
            background: var(--fondo);
            color: #102d36;
            font-family: "Segoe UI", Arial, sans-serif;
            font-size: 8.6pt;
            line-height: 1.22;
          }

          .documento {
            width: 216mm;
            min-height: 279.4mm;
            margin: 18px auto;
            padding: 12mm 13mm 13mm;
            background: var(--papel);
            box-shadow: 0 5px 24px rgba(0, 63, 76, .14);
          }

          .encabezado {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 20px;
            align-items: end;
            padding-bottom: 4px;
            border-bottom: 4px solid var(--azul);
          }

          .logo {
            display: block;
            width: 142px;
            max-height: 44px;
            object-fit: contain;
            object-position: left center;
          }

          .marca {
            font-size: 29pt;
            line-height: 1;
            font-weight: 750;
            letter-spacing: -.8px;
            color: var(--azul);
          }

          .marca span { color: var(--verde); }

          .lema {
            margin-top: 5px;
            color: var(--verde);
            font-size: 11pt;
          }

          .emision {
            color: var(--gris);
            font-size: 9.5pt;
            text-align: right;
          }

          h1 {
            margin: 8px 0 0;
            color: var(--azul);
            font-size: 20pt;
            line-height: 1.05;
            text-transform: uppercase;
            letter-spacing: .8px;
          }

          .subtitulo {
            margin: 2px 0 7px;
            color: var(--verde);
            font-size: 13pt;
            font-weight: 650;
          }

          .datos {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 1px;
            overflow: hidden;
            margin: 0 0 6px;
            border: 1px solid var(--linea);
            border-radius: 11px;
            background: var(--linea);
          }

          .dato {
            min-height: 39px;
            padding: 5px 9px;
            background: #f7fbfb;
          }

          .dato-principal { grid-column: span 3; }
          .dato-hora { grid-column: span 2; }

          .etiqueta {
            display: block;
            margin-bottom: 2px;
            color: var(--azul-claro);
            font-size: 8pt;
            font-weight: 750;
            letter-spacing: .65px;
            text-transform: uppercase;
          }

          .valor { font-weight: 650; }

          .introduccion {
            margin: 0 0 5px;
            text-align: justify;
          }

          .introduccion p { margin: 4px 0; }

          .fundamento {
            margin-top: 8px;
            color: var(--gris);
            font-size: 9pt;
          }

          h2 {
            margin: 6px 0 3px;
            padding-bottom: 3px;
            border-bottom: 2px solid var(--verde);
            color: var(--azul);
            font-size: 12.5pt;
            text-transform: uppercase;
            letter-spacing: .35px;
          }

          .punto {
            display: grid;
            grid-template-columns: 23px 1fr auto;
            gap: 6px;
            align-items: start;
            padding: 1px 0;
            border-bottom: 1px solid #e5eeee;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .numero {
            display: flex;
            width: 20px;
            height: 20px;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: var(--azul-claro);
            color: white;
            font-size: 8pt;
            font-weight: 750;
          }

          .punto-titulo { font-weight: 650; }

          .detalle {
            margin-top: 2px;
            color: var(--gris);
            font-size: 7.8pt;
          }

          .subpuntos {
            margin: 4px 0 0;
            padding-left: 18px;
            color: var(--gris);
            font-size: 9.3pt;
          }

          .votacion {
            margin-top: 2px;
            padding: 1px 5px;
            border-radius: 9px;
            background: var(--verde-claro);
            color: var(--verde);
            font-size: 6.5pt;
            font-weight: 750;
            white-space: nowrap;
            text-transform: uppercase;
          }

          .bloque {
            margin-top: 7px;
            padding: 6px 10px;
            border-left: 4px solid var(--azul-claro);
            border-radius: 5px;
            background: #f3f8f8;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .bloque h3 {
            margin: 0 0 3px;
            color: var(--azul);
            font-size: 9.2pt;
          }

          .bloque ul { margin: 0; padding-left: 14px; }
          .bloque li { margin: 1px 0; }

          .complementos {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 9px;
          }

          .aviso {
            margin: 6px 0 0;
            padding: 5px 8px;
            border: 1px solid #9bc7ad;
            border-radius: 7px;
            background: var(--verde-claro);
            color: #185c35;
            font-size: 8pt;
          }

          .firma {
            width: 65%;
            margin: 9px auto 8px;
            text-align: center;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .firma .linea {
            margin-top: 10px;
            border-top: 1px solid var(--azul);
            padding-top: 3px;
            font-weight: 700;
          }

          .pie {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            margin-top: 7px;
            padding-top: 5px;
            border-top: 3px solid var(--azul);
            color: var(--gris);
            font-size: 7.2pt;
          }

          .pie strong { color: var(--azul); }

          @page {
            size: Letter;
            margin: 12mm 13mm 13mm;
          }

          @media print {
            body { background: #fff; }
            .documento {
              width: auto;
              min-height: 0;
              margin: 0;
              padding: 0;
              box-shadow: none;
            }
            .bloque { background: #f3f8f8 !important; }
            h2 { break-after: avoid; page-break-after: avoid; }
          }

          @media screen and (max-width: 850px) {
            .documento {
              width: 100%;
              min-height: 0;
              margin: 0;
              padding: 24px;
            }

            .complementos { grid-template-columns: 1fr; }
          }
        </style>
      </head>
      <body>
        <main class="documento">
          <header class="encabezado">
            <div>
              <img class="logo" src="/assets/img/logo.png" alt="Neibora Gestión Residencial Integral"/>
            </div>
            <div class="emision">
              <strong><xsl:value-of select="organizacion/nombre"/></strong><br/>
              Circuito <xsl:value-of select="organizacion/circuito"/><br/>
              Emisión: <xsl:value-of select="encabezado/fecha_emision"/>
            </div>
          </header>

          <h1><xsl:value-of select="encabezado/titulo"/></h1>
          <div class="subtitulo"><xsl:value-of select="encabezado/subtitulo"/></div>

          <section class="datos">
            <div class="dato dato-principal">
              <span class="etiqueta">Fecha</span>
              <span class="valor"><xsl:value-of select="datos_asamblea/fecha"/></span>
            </div>
            <div class="dato dato-principal">
              <span class="etiqueta">Lugar</span>
              <span class="valor"><xsl:value-of select="datos_asamblea/lugar"/></span>
            </div>
            <div class="dato dato-hora">
              <span class="etiqueta">Primera convocatoria</span>
              <span class="valor"><xsl:value-of select="datos_asamblea/primera_convocatoria"/></span>
            </div>
            <div class="dato dato-hora">
              <span class="etiqueta">Segunda convocatoria</span>
              <span class="valor"><xsl:value-of select="datos_asamblea/segunda_convocatoria"/></span>
            </div>
            <div class="dato dato-hora">
              <span class="etiqueta">Tercera convocatoria</span>
              <span class="valor"><xsl:value-of select="datos_asamblea/tercera_convocatoria"/></span>
            </div>
          </section>

          <section class="introduccion">
            <p><strong><xsl:value-of select="convocante"/></strong>, con fundamento en <xsl:value-of select="fundamento"/>, comunica lo siguiente:</p>
            <p><xsl:value-of select="normalize-space(mensaje)"/></p>
          </section>

          <h2>Orden del día</h2>
          <section class="orden">
            <xsl:for-each select="orden_del_dia/punto">
              <article class="punto">
                <div class="numero"><xsl:value-of select="position()"/></div>
                <div>
                  <div class="punto-titulo"><xsl:value-of select="titulo"/></div>
                  <xsl:if test="detalle">
                    <div class="detalle"><xsl:value-of select="detalle"/></div>
                  </xsl:if>
                  <xsl:if test="subpuntos/subpunto">
                    <ul class="subpuntos">
                      <xsl:for-each select="subpuntos/subpunto">
                        <li><xsl:value-of select="."/></li>
                      </xsl:for-each>
                    </ul>
                  </xsl:if>
                </div>
                <xsl:if test="@votacion='Sí'">
                  <span class="votacion">Sujeto a votación!</span>
                </xsl:if>
              </article>
            </xsl:for-each>
          </section>

          <div class="complementos">
            <section class="bloque">
              <h3>Información disponible para consulta</h3>
              <ul>
                <xsl:for-each select="documentos_disponibles/documento">
                  <li><xsl:value-of select="."/></li>
                </xsl:for-each>
              </ul>
            </section>

            <section class="bloque">
              <h3>Registro y participación</h3>
              <ul>
                <xsl:for-each select="reglas/regla">
                  <li><xsl:value-of select="."/></li>
                </xsl:for-each>
              </ul>
            </section>
          </div>

          <div class="aviso">
            Los acuerdos formales se limitarán a los asuntos expresamente incluidos en esta convocatoria. Los temas planteados en asuntos generales podrán registrarse para seguimiento o para una convocatoria posterior cuando requieran votación.
          </div>

          <section class="firma">
            <div><xsl:value-of select="firma/leyenda"/></div>
            <div class="linea"><xsl:value-of select="firma/nombre"/></div>
            <div><xsl:value-of select="firma/cargo"/></div>
          </section>

          <footer class="pie">
            <div><strong><xsl:value-of select="pie/marca"/></strong> · <xsl:value-of select="pie/descripcion"/></div>
            <div><xsl:value-of select="pie/contacto"/></div>
          </footer>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
