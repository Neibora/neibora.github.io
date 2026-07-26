<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" encoding="UTF-8" indent="yes"/>
	<xsl:decimal-format name="mx" decimal-separator="." grouping-separator=","/>
	<xsl:key name="eventos-por-fecha" match="evento/fechas/fecha" use="@valor"/>
	<xsl:key name="categoria-por-id" match="categoria" use="@id"/>

	<xsl:template match="/calendario">
		<section class="calendar-app" data-year="{@anio}">
			<style>
				.calendar-app{
					--cal-primary:#005a4f;--cal-primary-dark:#00483f;--cal-accent:#57bd63;
					--cal-ink:#24343b;--cal-muted:#6b7780;--cal-line:#dce4e1;
					--cal-paper:#fff;--cal-canvas:#f4f7f6;
					max-width:1600px;margin:0 auto;padding:26px 28px 70px;color:var(--cal-ink);
				}
				.calendar-app *{box-sizing:border-box}
				.calendar-hero{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;margin-bottom:20px}
				.calendar-kicker{margin:0 0 5px;color:var(--cal-accent);font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.1em}
				.calendar-hero h1{margin:0;color:var(--cal-primary);font-size:clamp(25px,3vw,40px);line-height:1.05}
				.calendar-hero h1 span{color:#ef6c00;font-weight:500}
				.calendar-year{font-size:42px;font-weight:800;color:#34413f;line-height:1}
				.calendar-toolbar{position:sticky;top:73px;z-index:30;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:13px 16px;margin:0 -4px 22px;background:rgba(244,247,246,.96);border:1px solid var(--cal-line);border-radius:12px;box-shadow:0 6px 18px rgba(0,72,63,.06);backdrop-filter:blur(10px)}
				.filter-set{display:flex;align-items:center;flex-wrap:wrap;gap:7px}.filter-label{margin-right:3px;color:var(--cal-muted);font-size:11px;font-weight:800;text-transform:uppercase}
				.filter-chip{display:flex;align-items:center;gap:6px;padding:7px 10px;border:1px solid var(--cal-line);border-radius:20px;background:#fff;color:var(--cal-ink);cursor:pointer;transition:.2s}
				.filter-chip:before{content:"";width:9px;height:9px;border-radius:50%;background:var(--chip-color,var(--cal-primary))}
				.filter-chip.active{border-color:var(--cal-primary);box-shadow:inset 0 0 0 1px var(--cal-primary);color:var(--cal-primary);font-weight:700}
				.type-switch,.view-switch{display:flex;padding:3px;background:#e5ecea;border-radius:8px}
				.type-switch button,.view-switch button{border:0;border-radius:6px;background:transparent;padding:7px 11px;color:var(--cal-muted);cursor:pointer}
				.type-switch button.active,.view-switch button.active{background:var(--cal-primary);color:#fff;box-shadow:0 2px 5px rgba(0,90,79,.18)}
				.month-picker{display:none;min-width:125px;padding:7px 28px 7px 9px;border:1px solid var(--cal-line);border-radius:7px;background:#fff}
				.calendar-grid{display:grid;grid-template-columns:repeat(4,minmax(230px,1fr));gap:22px}
				.month-card{overflow:hidden;background:var(--cal-paper);border:1px solid var(--cal-line);border-radius:11px;box-shadow:0 7px 22px rgba(26,62,57,.06);transition:.2s}
				.month-card:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(26,62,57,.1)}
				.month-title{display:flex;align-items:center;justify-content:space-between;padding:10px 11px 7px;color:#ef6c00;font-size:13px;font-weight:800}
				.month-total{display:inline-grid;place-items:center;min-width:22px;height:22px;padding:0 6px;border-radius:11px;background:#eff7f5;color:var(--cal-primary);font-size:10px}
				.weekdays,.days{display:grid;grid-template-columns:repeat(7,1fr)}
				.weekdays span{padding:6px 2px;background:#394441;color:#fff;text-align:center;font-size:8px;font-weight:700}
				.day,.empty-day{position:relative;min-height:38px;border:0;border-right:1px solid var(--cal-line);border-bottom:1px solid var(--cal-line);background:#fff;color:#4b565a}
				.day{display:flex;flex-direction:column;align-items:flex-start;padding:4px;cursor:pointer}
				.day:hover,.day:focus{z-index:2;outline:none;background:#edf8f4;box-shadow:inset 0 0 0 2px var(--cal-primary)}
				.day-number{font-size:10px}.day.is-today .day-number{display:grid;place-items:center;width:19px;height:19px;border-radius:50%;background:var(--cal-primary);color:#fff}
				.event-dots{display:flex;align-items:center;flex-wrap:wrap;gap:3px;margin-top:auto}
				.event-dot{width:7px;height:7px;border-radius:50%;background:var(--event-color);box-shadow:0 0 0 1px rgba(255,255,255,.7)}
				.event-dot[data-type="renta"]{width:11px;border-radius:2px}
				.day.has-events{background:linear-gradient(145deg,#fff 55%,#f0faf6)}
				.day.events-filtered{background:#fff}.day.events-filtered .day-number{opacity:.5}
				.calendar-app.month-mode .calendar-grid{display:block;max-width:980px;margin:0 auto}
				.calendar-app.month-mode .month-card{display:none}
				.calendar-app.month-mode .month-card.selected{display:block}
				.calendar-app.month-mode .month-title{padding:17px 20px 12px;font-size:20px}
				.calendar-app.month-mode .weekdays span{padding:10px 4px;font-size:11px}
				.calendar-app.month-mode .day,.calendar-app.month-mode .empty-day{min-height:105px;padding:8px}
				.calendar-app.month-mode .day-number{font-size:13px}
				.calendar-app.month-mode .event-dot{width:auto;height:auto;max-width:100%;padding:3px 6px;border-radius:4px;color:#fff;font-size:9px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
				.calendar-app.month-mode .event-dot:after{content:attr(data-title)}
				.calendar-app.month-mode .event-dot[data-type="renta"]{border-radius:4px}
				.calendar-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:22px}
				.summary-card{padding:14px 16px;background:#fff;border:1px solid var(--cal-line);border-radius:10px}
				.summary-card small{display:block;color:var(--cal-muted);font-size:10px;text-transform:uppercase}.summary-card strong{display:block;margin-top:2px;color:var(--cal-primary);font-size:22px}
				.detail-drawer{position:fixed;inset:0;z-index:100;display:none}.detail-drawer.open{display:block}
				.drawer-backdrop{position:absolute;inset:0;background:rgba(15,23,42,.42);backdrop-filter:blur(2px)}
				.drawer-panel{position:absolute;top:0;right:0;width:min(460px,94vw);height:100%;overflow:auto;padding:24px;background:#f7faf9;box-shadow:-18px 0 45px rgba(15,23,42,.18)}
				.drawer-head{display:flex;align-items:flex-start;justify-content:space-between;gap:15px;padding-bottom:16px;border-bottom:1px solid var(--cal-line)}
				.drawer-head p{margin:0 0 4px;color:var(--cal-muted);font-size:11px;text-transform:uppercase}.drawer-head h2{margin:0;color:var(--cal-primary);font-size:22px}
				.drawer-close{display:grid;place-items:center;width:36px;height:36px;border:0;border-radius:50%;background:#e5ecea;color:var(--cal-primary);cursor:pointer}
				.drawer-events{display:grid;gap:12px;padding-top:16px}.drawer-empty{color:var(--cal-muted);text-align:center;padding:35px 15px}
				.event-card{overflow:hidden;background:#fff;border:1px solid var(--cal-line);border-left:5px solid var(--event-color);border-radius:9px}
				.event-card-main{padding:15px}.event-card-top{display:flex;justify-content:space-between;gap:12px}
				.event-kind{color:var(--event-color);font-size:10px;font-weight:800;text-transform:uppercase}.event-card h3{margin:3px 0 9px;font-size:16px}
				.event-status{align-self:flex-start;padding:3px 7px;border-radius:10px;background:#edf3f1;color:var(--cal-primary);font-size:9px;font-weight:800;text-transform:uppercase}
				.event-description{margin:0 0 12px;color:var(--cal-muted);font-size:11px}
				.event-facts{display:grid;grid-template-columns:1fr 1fr;gap:8px}.event-fact{display:flex;gap:6px;color:#4b5a60;font-size:10px}.event-fact .material-icons{color:var(--event-color);font-size:15px}
				.event-amount{padding:9px 15px;background:#f3f7f6;text-align:right;color:var(--cal-primary);font-weight:800}
				.event-data{display:none}
				.dark .calendar-app{--cal-ink:#e2e8f0;--cal-muted:#94a3b8;--cal-line:#334155;--cal-paper:#172033;--cal-canvas:#0f172a}
				.dark .calendar-toolbar{background:rgba(15,23,42,.96)}.dark .filter-chip,.dark .month-picker,.dark .day,.dark .empty-day,.dark .summary-card{background:#172033;color:#e2e8f0}
				.dark .day.has-events{background:linear-gradient(145deg,#172033 55%,#14332f)}.dark .drawer-panel{background:#0f172a}.dark .event-card{background:#172033}.dark .event-amount{background:#202c40}
				@media(max-width:1180px){.calendar-grid{grid-template-columns:repeat(3,1fr)}.calendar-toolbar{align-items:flex-start;flex-direction:column}.toolbar-right{width:100%;display:flex;justify-content:space-between}}
				@media(max-width:820px){.calendar-app{padding:18px 12px 60px}.calendar-grid{grid-template-columns:repeat(2,1fr);gap:12px}.calendar-toolbar{top:72px}.calendar-year{font-size:30px}.calendar-summary{grid-template-columns:1fr}.filter-label{width:100%}}
				@media(max-width:520px){.calendar-grid{grid-template-columns:1fr}.calendar-hero{align-items:flex-start}.calendar-hero h1{font-size:25px}.calendar-year{font-size:25px}.type-switch{width:100%}.type-switch button{flex:1}.toolbar-right{gap:8px}.calendar-app.month-mode .day,.calendar-app.month-mode .empty-day{min-height:66px}.calendar-app.month-mode .event-dot{width:8px;height:8px;padding:0;border-radius:50%}.calendar-app.month-mode .event-dot:after{content:""}.event-facts{grid-template-columns:1fr}}
				@media print{@page{size:landscape;margin:7mm}.calendar-app{max-width:none;padding:0}.calendar-toolbar,.calendar-summary,.detail-drawer{display:none!important}.calendar-grid{grid-template-columns:repeat(4,1fr);gap:8px}.month-card{box-shadow:none;break-inside:avoid}.day,.empty-day{min-height:27px}.calendar-hero{margin-bottom:10px}.calendar-hero h1{font-size:25px}}
			</style>

			<header class="calendar-hero">
				<div>
					<p class="calendar-kicker"><xsl:value-of select="@desarrollo"/> · Agenda operativa</p>
					<h1>Calendario <span>de servicios y rentas</span></h1>
				</div>
				<div class="calendar-year"><xsl:value-of select="@anio"/></div>
			</header>

			<div class="calendar-toolbar no-print">
				<div class="filter-set" aria-label="Filtros por categoría">
					<span class="filter-label">Mostrar</span>
					<xsl:for-each select="categorias/categoria">
						<button type="button" class="filter-chip active" data-filter-category="{@id}" style="--chip-color:{@color}">
							<xsl:value-of select="@nombre"/>
						</button>
					</xsl:for-each>
				</div>
				<div class="toolbar-right">
					<div class="type-switch" aria-label="Tipo de evento">
						<button type="button" class="active" data-filter-type="todos">Todos</button>
						<button type="button" data-filter-type="servicio">Servicios</button>
						<button type="button" data-filter-type="renta">Rentas</button>
					</div>
					<select class="month-picker" id="monthPicker" aria-label="Mes">
						<xsl:for-each select="meses/mes">
							<option value="{@numero}"><xsl:value-of select="@nombre"/></option>
						</xsl:for-each>
					</select>
					<div class="view-switch" aria-label="Vista">
						<button type="button" class="active" data-view="year">Año</button>
						<button type="button" data-view="month">Mes</button>
					</div>
				</div>
			</div>

			<div class="calendar-grid">
				<xsl:apply-templates select="meses/mes"/>
			</div>

			<div class="calendar-summary">
				<div class="summary-card"><small>Servicios programados</small><strong><xsl:value-of select="count(eventos/evento[@tipo='servicio']/fechas/fecha)"/></strong></div>
				<div class="summary-card"><small>Rentas registradas</small><strong><xsl:value-of select="count(eventos/evento[@tipo='renta']/fechas/fecha)"/></strong></div>
				<div class="summary-card"><small>Categorías activas</small><strong><xsl:value-of select="count(categorias/categoria)"/></strong></div>
			</div>

			<div class="event-data-source">
				<xsl:apply-templates select="eventos/evento" mode="data"/>
			</div>

			<aside class="detail-drawer no-print" id="detailDrawer" aria-hidden="true">
				<div class="drawer-backdrop" data-close-drawer="true"></div>
				<div class="drawer-panel" role="dialog" aria-modal="true" aria-labelledby="drawerTitle">
					<div class="drawer-head">
						<div><p>Agenda del día</p><h2 id="drawerTitle">Fecha</h2></div>
						<button class="drawer-close" type="button" data-close-drawer="true" aria-label="Cerrar"><span class="material-icons">close</span></button>
					</div>
					<div class="drawer-events" id="drawerEvents"></div>
				</div>
			</aside>

			<script><![CDATA[
				(function(){
					var app=document.querySelector('.calendar-app');
					var activeCategories=new Set(Array.from(app.querySelectorAll('[data-filter-category]')).map(function(button){return button.dataset.filterCategory;}));
					var activeType='todos';
					var drawer=app.querySelector('#detailDrawer');
					var drawerEvents=app.querySelector('#drawerEvents');
					var drawerTitle=app.querySelector('#drawerTitle');
					var picker=app.querySelector('#monthPicker');

					function refresh(){
						app.querySelectorAll('.event-dot').forEach(function(dot){
							var categoryVisible=activeCategories.has(dot.dataset.category);
							var typeVisible=activeType==='todos'||dot.dataset.type===activeType;
							dot.hidden=!(categoryVisible&&typeVisible);
						});
						app.querySelectorAll('.day').forEach(function(day){
							var visible=day.querySelectorAll('.event-dot:not([hidden])').length;
							day.classList.toggle('events-filtered',day.classList.contains('has-events')&&!visible);
							day.setAttribute('aria-label',day.dataset.date+(visible?' · '+visible+' eventos':''));
						});
					}

					function selectMonth(month){
						app.querySelectorAll('.month-card').forEach(function(card){card.classList.toggle('selected',card.dataset.month===month);});
					}

					function formatDate(value){
						return new Intl.DateTimeFormat('es-MX',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z'));
					}

					function openDay(day){
						var ids=Array.from(day.querySelectorAll('.event-dot:not([hidden])')).map(function(dot){return dot.dataset.event;});
						if(!ids.length)return;
						drawerEvents.innerHTML='';
						ids.forEach(function(id){
							var source=app.querySelector('.event-data[data-event="'+id+'"]');
							if(source)drawerEvents.appendChild(source.firstElementChild.cloneNode(true));
						});
						drawerTitle.textContent=formatDate(day.dataset.date);
						drawer.classList.add('open');
						drawer.setAttribute('aria-hidden','false');
						document.body.style.overflow='hidden';
					}

					function closeDrawer(){
						drawer.classList.remove('open');
						drawer.setAttribute('aria-hidden','true');
						document.body.style.overflow='';
					}

					app.addEventListener('click',function(event){
						var category=event.target.closest('[data-filter-category]');
						if(category){
							var id=category.dataset.filterCategory;
							if(activeCategories.has(id)){activeCategories.delete(id);category.classList.remove('active');}
							else{activeCategories.add(id);category.classList.add('active');}
							refresh();return;
						}
						var type=event.target.closest('[data-filter-type]');
						if(type){
							activeType=type.dataset.filterType;
							app.querySelectorAll('[data-filter-type]').forEach(function(button){button.classList.toggle('active',button===type);});
							refresh();return;
						}
						var view=event.target.closest('[data-view]');
						if(view){
							var monthly=view.dataset.view==='month';
							app.classList.toggle('month-mode',monthly);
							app.querySelectorAll('[data-view]').forEach(function(button){button.classList.toggle('active',button===view);});
							picker.style.display=monthly?'block':'none';
							selectMonth(picker.value);return;
						}
						var day=event.target.closest('.day');
						if(day){openDay(day);return;}
						if(event.target.closest('[data-close-drawer]'))closeDrawer();
					});
					picker.addEventListener('change',function(){selectMonth(this.value);});
					document.addEventListener('keydown',function(event){if(event.key==='Escape')closeDrawer();});
					selectMonth(picker.value);
					refresh();
				}());
			]]></script>
		</section>
	</xsl:template>

	<xsl:template match="mes">
		<xsl:variable name="prefix" select="concat(/calendario/@anio,'-',@numero,'-')"/>
		<article class="month-card" data-month="{@numero}">
			<div class="month-title">
				<span><xsl:value-of select="@nombre"/></span>
				<span class="month-total"><xsl:value-of select="count(/calendario/eventos/evento/fechas/fecha[starts-with(@valor,$prefix)])"/></span>
			</div>
			<div class="weekdays"><span>Do.</span><span>Lu.</span><span>Ma.</span><span>Mi.</span><span>Ju.</span><span>Vi.</span><span>Sá.</span></div>
			<div class="days">
				<xsl:call-template name="empty-days"><xsl:with-param name="remaining" select="@inicia"/></xsl:call-template>
				<xsl:call-template name="days">
					<xsl:with-param name="day" select="1"/>
					<xsl:with-param name="total" select="@dias"/>
					<xsl:with-param name="month" select="@numero"/>
				</xsl:call-template>
			</div>
		</article>
	</xsl:template>

	<xsl:template name="empty-days">
		<xsl:param name="remaining"/>
		<xsl:if test="$remaining &gt; 0">
			<span class="empty-day"></span>
			<xsl:call-template name="empty-days"><xsl:with-param name="remaining" select="$remaining - 1"/></xsl:call-template>
		</xsl:if>
	</xsl:template>

	<xsl:template name="days">
		<xsl:param name="day"/>
		<xsl:param name="total"/>
		<xsl:param name="month"/>
		<xsl:if test="$day &lt;= $total">
			<xsl:variable name="day-padded">
				<xsl:choose><xsl:when test="$day &lt; 10">0<xsl:value-of select="$day"/></xsl:when><xsl:otherwise><xsl:value-of select="$day"/></xsl:otherwise></xsl:choose>
			</xsl:variable>
			<xsl:variable name="date" select="concat(/calendario/@anio,'-',$month,'-',$day-padded)"/>
			<xsl:variable name="occurrences" select="key('eventos-por-fecha',$date)"/>
			<button type="button" data-date="{$date}">
				<xsl:attribute name="class">day<xsl:if test="count($occurrences)"> has-events</xsl:if></xsl:attribute>
				<span class="day-number"><xsl:value-of select="$day"/></span>
				<span class="event-dots">
					<xsl:for-each select="$occurrences">
						<xsl:variable name="category" select="../../@categoria"/>
						<span class="event-dot" data-event="{../../@id}" data-category="{$category}" data-type="{../../@tipo}" data-title="{../../@titulo}" title="{../../@titulo}" style="--event-color:{key('categoria-por-id',$category)/@color}"></span>
					</xsl:for-each>
				</span>
			</button>
			<xsl:call-template name="days">
				<xsl:with-param name="day" select="$day + 1"/>
				<xsl:with-param name="total" select="$total"/>
				<xsl:with-param name="month" select="$month"/>
			</xsl:call-template>
		</xsl:if>
	</xsl:template>

	<xsl:template match="evento" mode="data">
		<xsl:variable name="category" select="@categoria"/>
		<div class="event-data" data-event="{@id}">
			<article class="event-card" style="--event-color:{key('categoria-por-id',$category)/@color}">
				<div class="event-card-main">
					<div class="event-card-top">
						<div>
							<span class="event-kind"><xsl:value-of select="key('categoria-por-id',$category)/@nombre"/> · <xsl:value-of select="@tipo"/></span>
							<h3><xsl:value-of select="@titulo"/></h3>
						</div>
						<span class="event-status"><xsl:value-of select="@estado"/></span>
					</div>
					<p class="event-description"><xsl:value-of select="descripcion"/></p>
					<div class="event-facts">
						<div class="event-fact"><span class="material-icons">schedule</span><span><xsl:value-of select="@inicio"/>–<xsl:value-of select="@fin"/></span></div>
						<div class="event-fact"><span class="material-icons">location_on</span><span><xsl:value-of select="@ubicacion"/></span></div>
						<xsl:if test="@proveedor"><div class="event-fact"><span class="material-icons">engineering</span><span><xsl:value-of select="@proveedor"/></span></div></xsl:if>
						<xsl:if test="@cliente"><div class="event-fact"><span class="material-icons">person</span><span><xsl:value-of select="@cliente"/></span></div></xsl:if>
					</div>
				</div>
				<div class="event-amount">$<xsl:value-of select="format-number(number(@importe),'#,##0.00','mx')"/></div>
			</article>
		</div>
	</xsl:template>
</xsl:stylesheet>
