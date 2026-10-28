# Concurso de disfraces · Neibora

Módulo independiente para `https://neibora.com/concurso/`, con API Node en `https://api.neibora.com/contest-api`. La página pública es HTML/JS y puede servirse desde GitHub Pages. No depende de Classic ASP, de un subdominio nuevo para la página, de `localhost` en el navegador, ni de las versiones locales modificadas de xover/widgets.

## Participación

1. En `/concurso/`, inscribir nombre o apodo, disfraz, coto, domicilio y fotografía desde cámara o archivos. Es obligatoria la autorización del participante o tutor. El navegador convierte la foto a JPEG de hasta 800 píxeles y descarta los metadatos originales.
2. La galería se actualiza cada dos segundos, al reconectar y al volver a la pestaña.
3. En `/concurso/admin.html`, entrar con la clave privada. Retirar o reincorporar disfraces en cualquier etapa, siempre con confirmación.
4. Abrir votación: se cierran las inscripciones. Antes de votar, indicar nombre, coto y domicilio y aceptar que estos datos y la elección sean visibles para administración. No se permite votar por disfraces de la misma vivienda. Confirmar un voto por navegador; los conteos se ocultan al público.
5. Cerrar votación y publicar resultados. Los empates comparten posición, sin desempates arbitrarios. Administración puede retroceder una etapa: resultados → votación → inscripciones. No se borran participantes ni votos.

El control es **por navegador, no por persona**: borrar almacenamiento o usar otro navegador/dispositivo permite otro voto. Una votación verificada por persona necesita códigos o cuentas y no forma parte de esta versión.

## Servidor y almacenamiento

Ejecutar `node concurso/runner.cjs` desde la plataforma, o `concurso/start-concurso.ps1` en Windows. Node no necesita paquetes externos para este módulo. El proceso escucha solo en loopback: puerto 3000 para el proxy de `api.neibora.com` y puerto 8028 para compatibilidad local. Ambos puertos comparten la misma instancia y cola de guardado; no ejecutar dos escritores sobre los mismos datos.

Variables opcionales: `NEIBORA_PLATFORM_ROOT` (carpeta de datos de la plataforma), `PORT` (3000) y `NEIBORA_CONTEST_LOCAL_PORT` (8028). `/health` indica el estado del proceso. El proxy HTTPS debe reenviar a `http://127.0.0.1:3000` sin cambiar la ruta ni el encabezado Origin. No se instalan tareas de inicio ni servicios de Windows; reiniciar el equipo requiere volver a iniciar el proceso.

La API admite solicitudes del navegador desde `https://neibora.com`, `https://www.neibora.com`, `https://neibora.panax.io` y `https://api.neibora.com`. Responde al preflight OPTIONS para los encabezados Content-Type, X-Contest-Voter y X-Contest-Admin, sin cookies ni credenciales entre dominios. Se rechazan escrituras sin Origin permitido. Esto evita escrituras cruzadas del navegador; no es verificación de identidad del votante.

Datos, fotografías JPEG codificadas y votos: `repository/concursos/<UUID>/concurso.json`. Halloween: `15cceb26-b380-4b50-9d1f-0893c9e7cb13`. El parámetro `?concurso=<UUID>` selecciona otro concurso existente; visitar UUID desconocidos no crea directorios.

La clave se genera en `App_Data/concurso/<UUID>.key`. Nunca incluir claves, fotos ni registros reales en Git. Las reglas de `.gitignore` excluyen los directorios de datos y claves; `repository/concursos/web.config` bloquea descargas directas de JSON en IIS. Solo los endpoints controlados entregan las fotografías y la galería. El frontend mantiene la clave de administración en memoria, sin guardarla en la URL ni en almacenamiento del navegador.

El coto se muestra en la galería. El domicilio solo aparece en las respuestas autenticadas de administración, nunca en la galería pública ni en los resultados. Los registros anteriores que no tengan estos campos se conservan y aparecen en administración como no registrados.

Los datos no se borran automáticamente. La administración debe definir la conservación de las fotos después del evento. Retirar un participante oculta su disfraz y su fotografía del acceso público. El registro y la foto se conservan en el archivo privado para poder reincorporarlo; sus votos no cuentan en los resultados mientras esté retirado. Si alguien votó por un participante retirado, puede elegir otro durante la votación. Al reincorporarlo se recuperan los votos que no hayan sido reemplazados. Los registros antiguos cuya foto ya fue eliminada no pueden recuperarla.

## Validación

`node --test concurso/tests/contest.test.cjs concurso/tests/http.test.cjs`

Cubre persistencia, concurrencia, deduplicación de reintentos, etapas, fotos, validación, votos repetidos, claves, conteos ocultos, CORS y preflight. Las pruebas usan carpetas temporales aisladas.

Prueba HTTPS explícita con datos temporales, nunca en el concurso real:

```powershell
$env:NEIBORA_CONTEST_ROOT='C:/ruta/a/neibora'
node concurso/tests/https-smoke.cjs
```

Opcional: `NEIBORA_CONTEST_API` cambia la URL de la prueba, sin cambiar el endpoint del frontend.

## Publicación

GitHub Pages publica `neibora.com` desde la rama `codex/concurso-disfraces`, carpeta raíz. No es necesario fusionar el PR con master para mantener esta publicación. Los cambios enviados a la rama seleccionada actualizan el sitio completo; los cambios enviados solo a master no se publican mientras no se cambie la fuente. El PR permanece abierto en borrador para revisión. Mantener la API Node activa y verificar desde una red externa `/health`, preflight desde Origin `https://neibora.com`, galería y fotografías. No publicar con una API que responda 502.

## Identificación y detalle privado de votos

La API guarda el perfil declarado del votante por sesión de navegador antes de aceptar un voto. Compara coto y domicilio normalizados (mayúsculas, acentos, espacios y puntuación) para bloquear el voto a la misma vivienda; la galería deshabilita ese botón. Un participante sin domicilio completo no puede recibir votos nuevos hasta que administración lo complete mediante Editar domicilio. El perfil no puede cambiar después de votar.

Los datos son declarados por la persona, sin verificación documental ni códigos de vivienda. Escribir otra dirección o usar una sesión nueva puede eludir la identificación; no presentar el sistema como verificación de residencia. Sigue siendo un voto por navegador, no un voto por persona o vivienda.

Solo administración recibe el detalle privado: nombre declarado, coto, domicilio, fecha y disfraz elegido. Cada votante puede consultar únicamente su propio perfil con su token de sesión. Los votos anteriores sin identificación no se atribuyen retrospectivamente: aparecen como voto anterior sin identificación. Las fotos se abren en grande al tocarlas, tanto en la galería como en administración; la vista se cierra con X, Esc o el fondo.
