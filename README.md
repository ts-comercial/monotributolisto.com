# monotributolisto.com

Landing de **Monotributo Listo** — servicio privado de gestión del alta de Monotributo en Argentina.
Sitio estático publicado con GitHub Pages sobre el dominio `monotributolisto.com`.

## Estructura

```
index.html            Landing principal (formulario de 12 pasos)
nosotros.html         Acerca del servicio
terminos.html         Términos y condiciones
privacidad.html       Política de privacidad
pago-aprobado.html    Retorno de Mercado Pago — pago aprobado
pago-pendiente.html   Retorno de Mercado Pago — pago pendiente
pago-rechazado.html   Retorno de Mercado Pago — pago rechazado
404.html              Página de error
styles.css            Estilos
app.js                Lógica del formulario, tracking, CRM y Mercado Pago
images/               Assets (logo, hero, constancia, og-image)
CNAME                 Dominio propio de GitHub Pages
.nojekyll             Desactiva el procesamiento Jekyll
robots.txt sitemap.xml
```

## Integraciones (definidas en `app.js`)

| Constante | Destino |
|---|---|
| `CRM` | `https://crm-supabase-six.vercel.app/api/lead-intake` |
| `MP`  | Checkout de Mercado Pago (`pref_id`) |
| `WA`  | WhatsApp `5491124039191` |

En `localhost` y en `file://` el formulario corre en modo demo y **no** envía leads.

## Publicación

Cada push a `main` republica el sitio automáticamente (GitHub Pages → Deploy from branch `main` / `root`).

## DNS del dominio

| Tipo | Nombre | Valor |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `ts-comercial.github.io` |
