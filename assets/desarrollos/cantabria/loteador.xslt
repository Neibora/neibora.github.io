<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml" xmlns:state="http://panax.io/state" xmlns:session="http://panax.io/session">
	<xsl:param name="state:desarrollo">(xover.site.seed || '').replace(/^#/,'')</xsl:param>
	<xsl:param name="session:status"></xsl:param>
	<xsl:param name="session:user_login"></xsl:param>
	<xsl:template match="/">
		<div class="draggable" style=" width: 100px;
            height: 100vh;
            width: 100vw;
            position: absolute;
            top: 0;
            left: 0;
            cursor: grab;
            user-select: none;
            transition: transform 0.1s ease-out; ">
			<script type="text/javascript" defer="defer" src="../../../loteador/jquery.maphilight.js"></script>
			<script type="text/javascript" defer="defer" src="../../../loteador/mapselection.js?v={$state:desarrollo}_20250121">loteador.inicializar()</script>
			<style>
				<![CDATA[#Mapa .map {
	background: url('../assets/desarrollos/]]><xsl:value-of select="$state:desarrollo"/><![CDATA[/loteador.png');
	background-size: 100%;
	background-repeat: no-repeat;
	width: 100%;
}]]>
			</style>
			<script defer="">
				<![CDATA[ 
		draggableDiv = document.querySelector('.draggable');
        let isDragging = false;
        let startX, startY, initialX = 0, initialY = 0;
        let currentX = 0, currentY = 0;

        draggableDiv.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isDragging = true;
            startX = e.clientX - currentX;
            startY = e.clientY - currentY;

            draggableDiv.style.cursor = 'grabbing';
            requestAnimationFrame(updatePosition);
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                currentX = e.clientX - startX;
                currentY = e.clientY - startY;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            draggableDiv.style.cursor = 'grab';
        });

        function updatePosition() {
            if (isDragging) {
                draggableDiv.style.transform = `translate(${currentX}px, ${currentY}px)`;
                requestAnimationFrame(updatePosition);
            }
        }]]>
			</script>
			<img src="/assets/desarrollos/{$state:desarrollo}/loteador.jpg" orgwidth="1809" width="1809" border="0" usemap="#map" class="map" />

			<map name="map">
				<!-- #$-:Image map file created by GIMP Image Map plug-in -->
				<!-- #$-:GIMP Image Map plug-in by Maurits Rijk -->
				<!-- #$-:Please do not edit lines starting with "#$" -->
				<!-- #$VERSION:2.3 -->
				<!-- #$AUTHOR:Uriel Gomez   -->
				<area shape="poly" coords="61,235,169,235,171,297,61,298" alt="1" target="lote_1" href="#" />
				<area shape="poly" coords="62,298,172,297,172,353,62,355" alt="2" target="lote_2" href="#" />
				<area shape="poly" coords="62,355,172,353,173,411,63,413" alt="3" target="lote_3" href="#" />
				<area shape="poly" coords="63,413,173,411,174,471,63,473" alt="4" target="lote_4" href="#" />
				<area shape="poly" coords="63,473,174,471,175,529,64,531" alt="5" target="lote_5" href="#" />
				<area shape="poly" coords="64,531,175,529,176,588,65,588" alt="6" target="lote_6" href="#" />
				<area shape="poly" coords="65,588,176,587,177,643,65,646" alt="7" target="lote_7" href="#" />
				<area shape="poly" coords="65,646,176,642,178,698,66,699" alt="8" target="lote_8" href="#" />
				<area shape="poly" coords="66,699,178,698,180,754,66,757" alt="9" target="lote_9" href="#" />
				<area shape="poly" coords="66,757,179,754,180,810,67,814" alt="10" target="lote_10" href="#" />
				<area shape="poly" coords="67,814,180,810,181,869,67,872" alt="11" target="lote_11" href="#" />
				<area shape="poly" coords="67,872,181,869,182,927,69,930" alt="12" target="lote_12" href="#" />
				<area shape="poly" coords="69,930,181,927,184,992,69,995" alt="13" target="lote_13" href="#" />
				<area shape="poly" coords="585,1119,591,1006,672,1014,654,1127,619,1119" alt="14" target="lote_14" href="#" />
				<area shape="poly" coords="654,1125,676,1014,727,1025,704,1136" alt="15" target="lote_15" href="#" />
				<area shape="poly" coords="704,1136,727,1025,782,1036,761,1145" alt="16" target="lote_16" href="#" />
				<area shape="poly" coords="761,1145,782,1034,835,1046,811,1155" alt="17" target="lote_17" href="#" />
				<area shape="poly" coords="810,1156,836,1046,889,1056,866,1165" alt="18" target="lote_18" href="#" />
				<area shape="poly" coords="866,1165,888,1055,941,1065,921,1175" alt="19" target="lote_19" href="#" />
				<area shape="poly" coords="921,1175,941,1065,995,1075,972,1185" alt="20" target="lote_20" href="#" />
				<area shape="poly" coords="972,1185,995,1075,1048,1086,1025,1195" alt="21" target="lote_21" href="#" />
				<area shape="poly" coords="1025,1195,1049,1085,1101,1095,1078,1204" alt="22" target="lote_22" href="#" />
				<area shape="poly" coords="1078,1204,1101,1095,1154,1105,1133,1215" alt="23" target="lote_23" href="#" />
				<area shape="poly" coords="1133,1215,1154,1105,1207,1115,1186,1224" alt="24" target="lote_24" href="#" />
				<area shape="poly" coords="1186,1224,1207,1115,1261,1126,1238,1234" alt="25" target="lote_25" href="#" />
				<area shape="poly" coords="1238,1234,1261,1125,1315,1136,1293,1244" alt="26" target="lote_26" href="#" />
				<area shape="poly" coords="1293,1244,1315,1135,1368,1146,1347,1254" alt="27" target="lote_27" href="#" />
				<area shape="poly" coords="1347,1254,1367,1146,1421,1155,1399,1264" alt="28" target="lote_28" href="#" />
				<area shape="poly" coords="1399,1263,1421,1155,1449,1161,1507,1262,1438,1271" alt="29" target="lote_29" href="#" />
				<area shape="poly" coords="1448,1160,1507,1261,1535,1258,1564,1246,1588,1232,1599,1209,1512,1149" alt="30" target="lote_30" href="#" />
				<area shape="poly" coords="1512,1149,1598,1208,1608,1182,1620,1124,1524,1103" alt="31" target="lote_31" href="#" />
				<area shape="poly" coords="1524,1103,1620,1124,1632,1056,1536,1039" alt="32" target="lote_32" href="#" />
				<area shape="poly" coords="1536,1039,1633,1054,1644,996,1550,980" alt="33" target="lote_33" href="#" />
				<area shape="poly" coords="1550,980,1643,996,1653,940,1562,923" alt="34" target="lote_34" href="#" />
				<area shape="poly" coords="1562,923,1652,940,1679,800,1574,871" alt="35" target="lote_35" href="#" />
				<area shape="poly" coords="1574,870,1680,800,1696,731,1623,718,1553,827" alt="36" target="lote_36" href="#" />
				<area shape="poly" coords="1553,827,1498,800,1532,701,1623,718" alt="37" target="lote_37" href="#" />
				<area shape="poly" coords="1498,800,1532,700,1458,687,1439,789" alt="38" target="lote_38" href="#" />
				<area shape="poly" coords="1439,789,1458,687,1401,677,1383,778" alt="39" target="lote_39" href="#" />
				<area shape="poly" coords="1383,778,1401,677,1343,666,1326,767" alt="40" target="lote_40" href="#" />
				<area shape="poly" coords="1326,767,1343,666,1287,656,1268,756" alt="41" target="lote_41" href="#" />
				<area shape="poly" coords="1268,756,1287,656,1230,646,1211,745" alt="42" target="lote_42" href="#" />
				<area shape="poly" coords="1211,745,1230,645,1174,635,1155,734" alt="43" target="lote_43" href="#" />
				<area shape="poly" coords="1155,734,1174,635,1117,625,1096,723" alt="44" target="lote_44" href="#" />
				<area shape="poly" coords="1096,723,1117,624,1060,614,1042,712" alt="45" target="lote_45" href="#" />
				<area shape="poly" coords="1042,712,1060,614,1003,604,983,702" alt="46" target="lote_46" href="#" />
				<area shape="poly" coords="983,702,1003,604,947,594,928,691" alt="47" target="lote_47" href="#" />
				<area shape="poly" coords="928,691,947,593,890,583,871,680" alt="48" target="lote_48" href="#" />
				<area shape="poly" coords="871,680,890,583,834,573,814,669" alt="49" target="lote_49" href="#" />
				<area shape="poly" coords="814,669,834,573,778,563,757,658" alt="50" target="lote_50" href="#" />
				<area shape="poly" coords="757,658,778,563,719,552,702,648" alt="51" target="lote_51" href="#" />
				<area shape="poly" coords="702,648,719,552,664,542,644,636" alt="52" target="lote_52" href="#" />
				<area shape="poly" coords="644,636,664,542,605,531,588,626" alt="53" target="lote_53" href="#" />
				<area shape="poly" coords="588,626,605,531,560,523,512,611" alt="54" target="lote_54" href="#" />
				<area shape="poly" coords="642,945,535,925,545,867,653,886" alt="55" target="lote_55" href="#" />
				<area shape="poly" coords="653,886,545,867,556,806,664,827" alt="56" target="lote_56" href="#" />
				<area shape="poly" coords="664,827,556,807,566,752,675,774" alt="57" target="lote_57" href="#" />
				<area shape="poly" coords="675,774,566,752,576,697,685,719" alt="58" target="lote_58" href="#" />
				<area shape="poly" coords="685,719,740,730,718,838,665,828" alt="59" target="lote_59" href="#" />
				<area shape="poly" coords="740,730,718,838,772,848,792,740" alt="60" target="lote_60" href="#" />
				<area shape="poly" coords="792,739,772,848,825,858,846,750" alt="61" target="lote_61" href="#" />
				<area shape="poly" coords="845,749,825,859,878,868,899,760" alt="62" target="lote_62" href="#" />
				<area shape="poly" coords="899,760,878,869,932,879,953,771" alt="63" target="lote_63" href="#" />
				<area shape="poly" coords="953,771,932,879,984,889,1004,781" alt="64" target="lote_64" href="#" />
				<area shape="poly" coords="1004,781,984,888,1037,900,1057,791" alt="65" target="lote_65" href="#" />
				<area shape="poly" coords="1057,791,1037,899,1091,909,1111,801" alt="66" target="lote_66" href="#" />
				<area shape="poly" coords="1111,801,1091,910,1143,919,1165,812" alt="67" target="lote_67" href="#" />
				<area shape="poly" coords="1165,812,1143,920,1197,930,1218,821" alt="68" target="lote_68" href="#" />
				<area shape="poly" coords="1218,821,1197,930,1250,941,1269,832" alt="69" target="lote_69" href="#" />
				<area shape="poly" coords="1269,832,1250,940,1301,950,1323,842" alt="70" target="lote_70" href="#" />
				<area shape="poly" coords="1323,842,1301,950,1359,963,1377,853" alt="71" target="lote_71" href="#" />
				<area shape="poly" coords="1488,874,1377,852,1367,916,1476,935" alt="72" target="lote_72" href="#" />
				<area shape="poly" coords="1476,935,1367,916,1359,963,1466,987" alt="73" target="lote_73" href="#" />
				<area shape="poly" coords="1466,987,1358,963,1347,1021,1455,1042" alt="74" target="lote_74" href="#" />
				<area shape="poly" coords="1455,1042,1347,1021,1335,1074,1443,1097" alt="75" target="lote_75" href="#" />
				<area shape="poly" coords="1335,1074,1359,962,1302,951,1280,1065" alt="76" target="lote_76" href="#" />
				<area shape="poly" coords="1280,1065,1302,951,1250,940,1229,1055" alt="77" target="lote_77" href="#" />
				<area shape="poly" coords="1229,1055,1250,941,1197,930,1174,1045" alt="78" target="lote_78" href="#" />
				<area shape="poly" coords="1174,1044,1197,930,1142,920,1120,1035" alt="79" target="lote_79" href="#" />
				<area shape="poly" coords="1120,1035,1142,920,1090,909,1069,1024" alt="80" target="lote_80" href="#" />
				<area shape="poly" coords="1069,1024,1090,909,1037,900,1014,1015" alt="81" target="lote_81" href="#" />
				<area shape="poly" coords="1014,1014,1036,900,983,888,960,1004" alt="82" target="lote_82" href="#" />
				<area shape="poly" coords="960,1004,983,888,932,879,905,994" alt="83" target="lote_83" href="#" />
				<area shape="poly" coords="905,994,932,879,878,869,854,985" alt="84" target="lote_84" href="#" />
				<area shape="poly" coords="854,985,878,868,825,859,800,975" alt="85" target="lote_85" href="#" />
				<area shape="poly" coords="800,975,825,859,772,848,748,965" alt="86" target="lote_86" href="#" />
				<area shape="poly" coords="748,965,772,848,718,838,694,955" alt="87" target="lote_87" href="#" />
				<area shape="poly" coords="694,955,718,838,664,827,642,946" alt="88" target="lote_88" href="#" />
				<area shape="poly" coords="512,610,560,523,527,474,430,541" alt="89" target="lote_89" href="#" />
				<area shape="poly" coords="430,541,527,474,494,424,397,489" alt="90" target="lote_90" href="#" />
				<area shape="poly" coords="397,489,494,424,465,381,369,449" alt="91" target="lote_91" href="#" />
				<area shape="poly" coords="370,448,466,381,434,336,339,401" alt="92" target="lote_92" href="#" />
				<area shape="poly" coords="339,401,434,336,403,291,311,359" alt="93" target="lote_93" href="#" />
				<area shape="poly" coords="311,359,403,291,369,241,301,289" alt="94" target="lote_94" href="#" />
				<area shape="poly" coords="275,615,277,817,407,815,408,752,456,752,454,680,345,684,342,613" alt="casa_club" target="casa_club" href="#" />
				<area shape="poly" coords="247,411,252,603,244,920,254,930,269,933,454,941,466,933,474,922,478,910,480,835,493,755,503,721,514,692,512,667,468,652,438,629,387,578,317,493,271,406,262,402,252,403" alt="AV1" target="area_verde_1" href="#" />
				<area shape="poly" coords="59,18,62,236,170,235,156,128,107,104,77,67,69,50" alt="AV2" target="area_verde_2" href="#" />
				<area shape="poly" coords="301,289,273,105,369,241" alt="AV_3" target="area_verde_3" href="#" />
				<area shape="poly" coords="202,143,208,203,239,200,232,139" alt="C1" target="caseta_1" href="#" />
			</map>
		</div>
	</xsl:template>
</xsl:stylesheet>