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
| `robots.txt` | Permite la indexación y apunta al sitemap |
| `sitemap.xml` | Lista de páginas públicas para buscadores |

> Lo propio del proyecto vive en `psiconutre.css` y `psiconutre.js`. El resto de `assets/`
> es la plantilla base y conviene no tocarlo.

## Publicación

El sitio se despliega en **Vercel**, conectado a este repositorio: cada push a `main`
publica. Como el sitio está en la raíz del repo, **no hay que configurar Root Directory**.

Dominio oficial: **https://psiconutresalud.com** (el `www` redirige al dominio sin `www`).

## SEO

- `robots.txt` permite la indexación y declara el sitemap.
- `canonical`, `og:url`, `og:image` y `twitter:image` usan URL absoluta con el dominio oficial.
- Los datos estructurados (JSON-LD) de `index.html` incluyen `url`, `logo` e `image` absolutos.
- Si se agrega una página pública nueva, sumarla a `sitemap.xml` y darle su `canonical`.
- Pendiente fuera del repo: dar de alta el dominio en Google Search Console y enviar el sitemap.
