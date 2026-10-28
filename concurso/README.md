# Concurso de disfraces · Neibora

Módulo independiente para `https://neibora.com/concurso/`, con API Node en `https://api.neibora.com/contest-api`. La página pública es HTML/JS y puede servirse desde GitHub Pages. No depende de Classic ASP, de un subdominio nuevo para la página, de `localhost` en el navegador, ni de las versiones locales modificadas de xover/widgets.

## Participación

1. En `/concurso/`, inscribir nombre o apodo, disfraz y fotografía desde cámara o archivos. Es obligatoria la autorización del participante o tutor. El navegador convierte la foto a JPEG de hasta 800 píxeles y descarta los metadatos originales.
2. La galería se actualiza cada dos segundos, al reconectar y al volver a la pestaña.
3. En `/concurso/admin.html`, entrar con la clave privada. Retirar pruebas o duplicados antes de abrir votación.
4. Abrir votación: se cierran las inscripciones. Confirmar un voto por navegador; los conteos se ocultan al público.
5. Cerrar votación y publicar resultados. Los empates comparten posición, sin desempates arbitrarios. Las etapas avanzan sin retroceder.

El control es **por navegador, no por persona**: borrar almacenamiento o usar otro navegador/dispositivo permite otro voto. Una votación verificada por persona necesita códigos o cuentas y no forma parte de esta versión.

## Servidor y almacenamiento

Ejecutar `node concurso/runner.cjs` desde la plataforma, o `concurso/start-concurso.ps1` en Windows. Node no necesita paquetes externos para este módulo. El proceso escucha solo en loopback: puerto 3000 para el proxy de `api.neibora.com` y puerto 8028 para compatibilidad local. Ambos puertos comparten la misma instancia y cola de guardado; no ejecutar dos escritores sobre los mismos datos.

Variables opcionales: `NEIBORA_PLATFORM_ROOT` (carpeta de datos de la plataforma), `PORT` (3000) y `NEIBORA_CONTEST_LOCAL_PORT` (8028). `/health` indica el estado del proceso. El proxy HTTPS debe reenviar a `http://127.0.0.1:3000` sin cambiar la ruta ni el encabezado Origin. No se instalan tareas de inicio ni servicios de Windows; reiniciar el equipo requiere volver a iniciar el proceso.

La API admite solicitudes del navegador desde `https://neibora.com`, `https://www.neibora.com`, `https://neibora.panax.io` y `https://api.neibora.com`. Responde al preflight OPTIONS para los encabezados Content-Type, X-Contest-Voter y X-Contest-Admin, sin cookies ni credenciales entre dominios. Se rechazan escrituras sin Origin permitido. Esto evita escrituras cruzadas del navegador; no es verificación de identidad del votante.

Datos, fotografías JPEG codificadas y votos: `repository/concursos/<UUID>/concurso.json`. Halloween: `15cceb26-b380-4b50-9d1f-0893c9e7cb13`. El parámetro `?concurso=<UUID>` selecciona otro concurso existente; visitar UUID desconocidos no crea directorios.

La clave se genera en `App_Data/concurso/<UUID>.key`. Nunca incluir claves, fotos ni registros reales en Git. Las reglas de `.gitignore` excluyen los directorios de datos y claves; `repository/concursos/web.config` bloquea descargas directas de JSON en IIS. Solo los endpoints controlados entregan las fotografías y la galería. El frontend mantiene la clave de administración en memoria, sin guardarla en la URL ni en almacenamiento del navegador.

Los datos no se borran automáticamente. La administración debe definir la conservación de las fotos después del evento. El retiro de un participante durante inscripciones elimina su foto del estado actual.

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

Esta rama prepara el módulo para `/concurso/`. Empujar la rama no publica el sitio principal. La publicación general requiere revisar y fusionar el cambio en la rama usada por GitHub Pages, y mantener la API Node activa. Verificar antes desde una red externa `/health`, preflight desde Origin `https://neibora.com`, galería y fotografías. No publicar con una API que responda 502.
