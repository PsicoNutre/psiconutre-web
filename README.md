# PsicoNutre — sitio web

Sitio de **PsicoNutre** (Psic. David Andrés Nieto Martínez), consultorio de psicología con
acompañamiento nutricional en Teusaquillo, Bogotá.

## Cómo está hecho

Sitio **estático**: HTML, CSS y JavaScript. No hay framework, no hay build y no hay
dependencias que instalar. Para trabajarlo en local alcanza con abrir `index.html` en el
navegador.

| Ruta | Qué es |
|---|---|
| `index.html` | La portada, en una sola página |
| `politica-privacidad.html` | Política de tratamiento de datos |
| `assets/css/style.css` | Hoja de la plantilla base |
| `assets/css/psiconutre.css` | **Estilos propios.** Carga después de `style.css` |
| `assets/js/psiconutre.js` | **JavaScript propio.** Scroll, menú activo, "Ver más", línea de tiempo |
| `robots.txt` | Hoy bloquea la indexación a propósito |

> Lo propio del proyecto vive en `psiconutre.css` y `psiconutre.js`. El resto de `assets/`
> es la plantilla base y conviene no tocarlo.

## Publicación

El sitio se despliega en **Vercel**, conectado a este repositorio: cada push a `main`
publica. Como el sitio está en la raíz del repo, **no hay que configurar Root Directory**.

⚠️ `robots.txt` contiene `Disallow: /`. Mientras esté así, Google no indexa el sitio. Es a
propósito, hasta que el dominio definitivo esté conectado.

## Antes de publicar en el dominio real

1. Reemplazar `robots.txt` por la versión de producción que está comentada en el archivo.
2. Descomentar el `<link rel="canonical">` en las dos páginas y completar el dominio.
3. Pasar `og:image` y `twitter:image` a URL absoluta.
4. Agregar `"url"` al bloque de datos estructurados de `index.html`.
5. Crear `sitemap.xml`.
6. Dar de alta el dominio en Google Search Console.
