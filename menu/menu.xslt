<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:site="http://panax.io/site"
	>
	<xsl:output method="html" encoding="UTF-8" indent="yes"/>
	<xsl:param name="site:location"></xsl:param>

	<xsl:template match="/portal">
		<section class="portal-app">
			<style>
				.portal-app{
					--portal-primary:#005a4f;--portal-primary-dark:#00483f;--portal-accent:#57bd63;
					--portal-ink:#19323a;--portal-muted:#667780;--portal-line:#dce7e3;
					--portal-paper:#fff;--portal-canvas:#f5f8f7;
					min-height:100vh;color:var(--portal-ink);
				}
				.portal-app *{box-sizing:border-box}
				.portal-topbar{
					position:sticky;top:0;z-index:50;display:flex;align-items:center;justify-content:space-between;
					height:74px;padding:10px max(22px,calc((100vw - 1280px)/2));
					background:rgba(255,255,255,.95);border-bottom:1px solid var(--portal-line);
					box-shadow:0 2px 14px rgba(0,72,63,.05);backdrop-filter:blur(12px);
				}
				.portal-brand{display:flex;align-items:center;gap:11px;text-decoration:none}.portal-brand img{width:39px;height:50px;object-fit:contain}.portal-brand strong{display:block;color:var(--portal-primary);font-size:21px}.portal-brand small{display:block;color:var(--portal-muted);font-size:9px;letter-spacing:.04em}
				.top-actions{display:flex;align-items:center;gap:8px}.icon-button{display:grid;place-items:center;width:40px;height:40px;border:1px solid var(--portal-line);border-radius:50%;background:#fff;color:var(--portal-primary);cursor:pointer}.icon-button:hover{background:#edf7f4}
				.portal-content{width:min(1280px,100%);margin:0 auto;padding:30px 26px 70px}
				.welcome{display:flex;align-items:flex-end;justify-content:space-between;gap:25px;margin-bottom:22px}
				.welcome-kicker{margin:0 0 5px;color:var(--portal-accent);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.1em}
				.welcome h1{margin:0;color:var(--portal-primary);font-size:clamp(25px,3.3vw,42px);letter-spacing:-.035em}.welcome p{margin:7px 0 0;color:var(--portal-muted);font-size:13px}
				.module-count{text-align:right}.module-count strong{display:block;color:var(--portal-primary);font-size:30px}.module-count span{color:var(--portal-muted);font-size:10px;text-transform:uppercase}
				.portal-controls{display:grid;grid-template-columns:minmax(240px,1fr) auto;align-items:center;gap:18px;margin-bottom:25px}
				.search-box{position:relative}.search-box .material-icons{position:absolute;top:50%;left:14px;transform:translateY(-50%);color:#7b8d93;font-size:20px}.search-box input{width:100%;height:46px;padding:0 42px;border:1px solid var(--portal-line);border-radius:12px;background:#fff;color:var(--portal-ink);box-shadow:0 5px 17px rgba(25,67,59,.04);outline:none}.search-box input:focus{border-color:var(--portal-primary);box-shadow:0 0 0 3px rgba(0,90,79,.12)}.clear-search{position:absolute;right:7px;top:7px;display:none;width:32px;height:32px;border:0;border-radius:50%;background:transparent;color:var(--portal-muted);cursor:pointer}.clear-search.visible{display:grid;place-items:center}
				.category-tabs{display:flex;gap:6px;padding:4px;background:#e8efed;border-radius:11px;overflow-x:auto;scrollbar-width:none}.category-tabs::-webkit-scrollbar{display:none}.category-tabs button{flex:0 0 auto;padding:8px 12px;border:0;border-radius:8px;background:transparent;color:var(--portal-muted);font-size:11px;font-weight:700;cursor:pointer}.category-tabs button.active{background:var(--portal-primary);color:#fff;box-shadow:0 3px 7px rgba(0,90,79,.2)}
				.module-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}
				.module-card{position:relative;display:flex;min-height:178px;overflow:hidden;padding:20px;border:1px solid var(--portal-line);border-radius:15px;background:var(--portal-paper);color:var(--portal-ink);text-decoration:none;box-shadow:0 8px 24px rgba(24,62,56,.055);transition:transform .2s,box-shadow .2s,border-color .2s}.module-card:hover,.module-card:focus{transform:translateY(-4px);border-color:var(--module-color);box-shadow:0 15px 34px rgba(24,62,56,.12);outline:none}.module-card:after{content:"";position:absolute;right:-34px;bottom:-43px;width:105px;height:105px;border-radius:50%;background:var(--module-color);opacity:.07}
				.card-body{position:relative;z-index:2;display:flex;flex:1;flex-direction:column;align-items:flex-start}.module-icon{display:grid;place-items:center;width:49px;height:49px;margin-bottom:19px;border-radius:13px;background:color-mix(in srgb,var(--module-color) 12%,white);color:var(--module-color)}.module-icon .material-icons{font-size:27px}.module-card h2{margin:0 0 5px;font-size:15px}.module-card p{margin:0;color:var(--portal-muted);font-size:10px;line-height:1.45}.card-foot{display:flex;align-items:center;justify-content:space-between;width:100%;margin-top:auto;padding-top:14px}.category-name{color:var(--module-color);font-size:9px;font-weight:800;text-transform:uppercase}.open-arrow{color:var(--module-color);font-size:18px;transition:transform .2s}.module-card:hover .open-arrow{transform:translateX(3px)}.featured-badge{position:absolute;top:13px;right:13px;z-index:3;padding:4px 7px;border-radius:10px;background:#eff8ef;color:#298137;font-size:8px;font-weight:800;text-transform:uppercase}
				.no-results{display:none;padding:50px 20px;border:1px dashed var(--portal-line);border-radius:15px;text-align:center;color:var(--portal-muted)}.no-results.visible{display:block}.no-results .material-icons{display:block;margin-bottom:8px;color:var(--portal-primary);font-size:35px}
				.portal-shortcuts{display:grid;grid-template-columns:1.4fr .6fr;gap:16px;margin-top:24px}.shortcut{display:flex;align-items:center;gap:14px;padding:17px 20px;border:1px solid var(--portal-line);border-radius:14px;background:#fff;color:var(--portal-ink);text-decoration:none}.shortcut .material-icons{display:grid;place-items:center;width:42px;height:42px;border-radius:50%;background:#e9f6f2;color:var(--portal-primary)}.shortcut strong{display:block;font-size:12px}.shortcut small{color:var(--portal-muted);font-size:9px}.shortcut-arrow{margin-left:auto;color:var(--portal-primary)}
				.portal-footer{padding:23px;text-align:center;color:var(--portal-muted);font-size:9px}
				.dark .portal-app{--portal-ink:#e2e8f0;--portal-muted:#94a3b8;--portal-line:#334155;--portal-paper:#172033;--portal-canvas:#0f172a}.dark .portal-topbar{background:rgba(15,23,42,.95)}.dark .icon-button,.dark .search-box input,.dark .shortcut{background:#172033;color:#e2e8f0}.dark .category-tabs{background:#202c40}.dark .module-icon{background:color-mix(in srgb,var(--module-color) 22%,#172033)}
				@media(max-width:1020px){.module-grid{grid-template-columns:repeat(3,1fr)}.portal-controls{grid-template-columns:1fr}.category-tabs{justify-content:flex-start}}
				@media(max-width:720px){.portal-topbar{height:66px;padding:8px 16px}.portal-brand img{width:33px;height:43px}.portal-brand strong{font-size:18px}.portal-brand small{display:none}.portal-content{padding:22px 15px 45px}.welcome{align-items:flex-start}.module-count{display:none}.portal-controls{gap:12px}.category-tabs{margin:0 -15px;padding:4px 15px;border-radius:0;background:transparent}.module-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.module-card{min-height:160px;padding:15px;border-radius:13px}.module-icon{width:45px;height:45px;margin-bottom:15px}.module-card h2{font-size:13px}.module-card p{font-size:9px}.featured-badge{top:9px;right:9px}.portal-shortcuts{grid-template-columns:1fr}.shortcut{padding:14px 16px}}
				@media(max-width:365px){.module-grid{grid-template-columns:1fr}.module-card{min-height:145px}.welcome h1{font-size:24px}}
				@media print{.portal-topbar,.portal-controls,.portal-shortcuts{display:none}.portal-content{padding:12px}.module-grid{grid-template-columns:repeat(4,1fr);gap:8px}.module-card{min-height:150px;box-shadow:none;break-inside:avoid}}
			</style>

			<header class="portal-topbar">
				<a class="portal-brand" href="../index.html">
					<img src="../assets/img/logo.png" alt="Neibora"/>
					<span><strong><xsl:value-of select="@nombre"/></strong><small><xsl:value-of select="@subtitulo"/></small></span>
				</a>
				<div class="top-actions">
					<button class="icon-button" type="button" id="themeToggle" title="Cambiar tema" aria-label="Cambiar tema"><span class="material-icons">dark_mode</span></button>
				</div>
			</header>

			<div class="portal-content">
				<header class="welcome">
					<div><p class="welcome-kicker">Herramientas Neibora</p><h1><xsl:value-of select="@titulo"/></h1><p>Selecciona un módulo para comenzar.</p></div>
					<div class="module-count"><strong><xsl:value-of select="count(modulos/modulo)"/></strong><span>Módulos disponibles</span></div>
				</header>

				<div class="portal-controls">
					<label class="search-box">
						<span class="material-icons">search</span>
						<input type="search" id="moduleSearch" placeholder="Buscar módulo… {$site:location}" autocomplete="off"/>
						<button class="clear-search" id="clearSearch" type="button" aria-label="Limpiar búsqueda"><span class="material-icons">close</span></button>
					</label>
					<div class="category-tabs" aria-label="Categorías">
						<xsl:for-each select="categorias/categoria">
							<button type="button" data-category="{@id}">
								<xsl:if test="position()=1"><xsl:attribute name="class">active</xsl:attribute></xsl:if>
								<xsl:value-of select="@nombre"/>
							</button>
						</xsl:for-each>
					</div>
				</div>

				<div class="module-grid" id="moduleGrid">
					<xsl:apply-templates select="modulos/modulo"/>
				</div>
				<div class="no-results" id="noResults"><span class="material-icons">search_off</span><strong>No encontramos módulos</strong><div>Prueba con otra palabra o categoría.</div></div>

				<div class="portal-shortcuts">
					<a class="shortcut" href="../index.html"><span class="material-icons">language</span><span><strong>Sitio institucional</strong><small>Información, servicios y desarrollos Neibora</small></span><span class="material-icons shortcut-arrow">arrow_forward</span></a>
					<!--<a class="shortcut" href="../mapa.html"><span class="material-icons">location_on</span><span><strong>Mapa de desarrollos</strong><small>Consulta ubicaciones</small></span><span class="material-icons shortcut-arrow">arrow_forward</span></a>-->
				</div>
			</div>
			<footer class="portal-footer">Neibora · <xsl:value-of select="@subtitulo"/> · Actualizado <xsl:value-of select="@actualizado"/></footer>

			<script><![CDATA[
				(function(){
					var app=document.querySelector('.portal-app');
					var search=app.querySelector('#moduleSearch');
					var clear=app.querySelector('#clearSearch');
					var cards=Array.from(app.querySelectorAll('.module-card'));
					var empty=app.querySelector('#noResults');
					var activeCategory='todos';

					function normalize(value){
						return (value||'').toLocaleLowerCase('es-MX').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
					}
					function filter(){
						var query=normalize(search.value.trim());
						var visible=0;
						cards.forEach(function(card){
							var categoryMatches=activeCategory==='todos'||card.dataset.category===activeCategory;
							var textMatches=!query||normalize(card.dataset.search).includes(query);
							var show=categoryMatches&&textMatches;
							card.hidden=!show;
							if(show)visible++;
						});
						clear.classList.toggle('visible',!!search.value);
						empty.classList.toggle('visible',visible===0);
					}
					app.onclick=function(event){
						var category=event.target.closest('[data-category]');
						if(category){
							activeCategory=category.dataset.category;
							app.querySelectorAll('[data-category]').forEach(function(button){button.classList.toggle('active',button===category);});
							filter();
							return;
						}
						if(event.target.closest('#clearSearch')){search.value='';search.focus();filter();return;}
						if(event.target.closest('#themeToggle')){document.documentElement.classList.toggle('dark');}
					};
					search.addEventListener('input',filter);
					filter();
				}());
			]]></script>
		</section>
	</xsl:template>

	<xsl:template match="modulo">
		<xsl:variable name="category" select="@categoria"/>
		<a class="module-card" href="{@href}" data-category="{$category}" data-search="{@titulo} {@descripcion}" style="--module-color:{@color}">
			<xsl:if test="@destacado='true'"><span class="featured-badge">Destacado</span></xsl:if>
			<div class="card-body">
				<span class="module-icon"><span class="material-icons"><xsl:value-of select="@icono"/></span></span>
				<h2><xsl:value-of select="@titulo"/></h2>
				<p><xsl:value-of select="@descripcion"/></p>
				<div class="card-foot">
					<span class="category-name"><xsl:value-of select="/portal/categorias/categoria[@id=$category]/@nombre"/></span>
					<span class="material-icons open-arrow">arrow_forward</span>
				</div>
			</div>
		</a>
	</xsl:template>
</xsl:stylesheet>
