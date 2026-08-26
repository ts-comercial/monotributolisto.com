/* ─────────────────────────────────────────────────────────────────────────
   Monotributo Listo — configuración e integraciones compartidas.
   Lo cargan index.html y las páginas pago-*.html.

   ⚠️ Casi todo lo raro de este archivo existe porque algo se rompió en
   producción. Leer los comentarios antes de "simplificar".
   ───────────────────────────────────────────────────────────────────────── */

const WA      = '5491178193961';
const CRM     = 'https://crm-supabase-six.vercel.app/api/lead-intake';
const ORIGEN  = 'monotributolisto.com';
const VARIANTE = 'B';
const PRECIO  = 60000;

/* Link de pago de respaldo. Se usa SOLO si create_payment no contesta a tiempo.
   ⚠️ PENDIENTE: regenerar con el Access Token de producción de la app nueva
   "MonotributoListo", con back_urls apuntando a este dominio. Hasta entonces
   queda vacío a propósito: es preferible mostrar una pantalla de ayuda que
   mandar a la persona a un checkout que después la devuelve a un dominio
   muerto. Un pago hecho por el respaldo NO trae external_reference, así que
   no se ata solo al lead y hay que reconciliarlo a mano. */
const MP_FALLBACK = '';

/* ─── IDs de medición (dataset propio de esta marca, separado del de
   altamonotributo.com para poder comparar el rendimiento de las dos webs).
   Mientras estén vacíos no se dispara nada: el sitio funciona igual. ─── */
const PIXEL_META    = '';   // ej: '1234567890123456'
const ADS_ID        = '';   // ej: 'AW-XXXXXXXXX'
const CONV_PAGO     = '';   // ej: 'AW-XXXXXXXXX/xxxxxxxxxxxxxxxxx'
const CONV_WHATSAPP = '';   // ej: 'AW-XXXXXXXXX/xxxxxxxxxxxxxxxxx'
const CLARITY_ID    = 'y8ipbja2zc';   // grabaciones de sesion y mapas de calor

const TRACK = ['gclid','gbraid','wbraid','utm_source','utm_medium','utm_campaign','utm_term','utm_content'];

/* Abrir la web desde el disco o desde un server local no debe ensuciar el
   píxel, las conversiones de Google Ads ni el CRM con leads de prueba. */
function esPrueba(){
  return location.protocol === 'file:' ||
         /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
}

function tracking(){
  try { return JSON.parse(localStorage.getItem('ts_tracking') || '{}'); } catch { return {}; }
}

/* Guarda gclid/utm_* la primera vez que la persona entra, para que sigan
   disponibles cuando complete el formulario tres pantallas después. */
function capturarTracking(){
  try {
    const q = new URLSearchParams(location.search), guardado = tracking();
    let cambio = false;
    TRACK.forEach(k => { const v = q.get(k); if (v) { guardado[k] = v; cambio = true; } });
    if (cambio) {
      guardado.captured_at = new Date().toISOString();
      localStorage.setItem('ts_tracking', JSON.stringify(guardado));
    }
  } catch {}
}

function waLink(mensaje){
  return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(mensaje);
}

/* ─── CRM ───────────────────────────────────────────────────────────────
   Escritura fire-and-forget. Va por sendBeacon porque el fetch común se
   descarta en el navegador in-app de Instagram/Facebook (de donde viene el
   grueso del tráfico pago) y el lead se perdía en silencio.
   text/plain = "simple request": no dispara preflight CORS, que era la otra
   mitad del mismo bug. NO agregar keepalive:true — rompe en mobile. */
function crmSave(datos){
  if (esPrueba()) return;
  const body = JSON.stringify({
    ...datos,
    ...tracking(),
    origen: ORIGEN,
    variante: VARIANTE,
    producto: 'alta_monotributo',
    landing_url: location.origin + location.pathname,
    referrer: document.referrer || null,
    user_agent: navigator.userAgent,
    ts: new Date().toISOString(),
  });
  try {
    if (navigator.sendBeacon &&
        navigator.sendBeacon(CRM, new Blob([body], { type: 'text/plain' }))) return;
  } catch {}
  fetch(CRM, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body }).catch(() => {});
}

/* Lectura: las únicas dos llamadas que necesitan respuesta (check_dni y
   create_payment). Timeout duro y SIEMPRE resuelve: ninguna pantalla puede
   quedar colgada esperando a un tercero. */
async function crmAsk(datos, ms = 4000){
  if (esPrueba()) return {};
  try {
    const r = await fetch(CRM, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(datos),
      signal: AbortSignal.timeout(ms),
    });
    return await r.json();
  } catch { return {}; }
}

/* ─── Medición ──────────────────────────────────────────────────────────
   Los eventos propios van con prefijo MonotributoListo_. Purchase es el
   único estándar de Meta. Todo se replica en dataLayer por si se suma GTM. */
function trackMeta(evento, params, esEstandar){
  if (esPrueba() || !PIXEL_META) return;
  if (typeof fbq === 'function') fbq(esEstandar ? 'track' : 'trackCustom', evento, params || {});
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: evento, ...(params || {}) });
}

function trackAds(sendTo, params){
  if (esPrueba() || !sendTo || typeof gtag !== 'function') return;
  gtag('event', 'conversion', { send_to: sendTo, ...(params || {}) });
}

/* Marca de sesión en Microsoft Clarity, para poder filtrar y saltar
   directo a las grabaciones de cada tramo del embudo (ej: "mostrame las
   sesiones donde se marcó no_apto"). Usa el mismo vocabulario que el CRM
   (los 'estado' de app.js y api/lead-intake.js) — misma taxonomía en los
   dos lados, sin inventar nombres nuevos. Clarity solo acepta un string por
   evento, sin parámetros. */
function trackClarity(evento){
  if (esPrueba() || !CLARITY_ID || typeof clarity !== 'function') return;
  clarity('event', evento);
}

/* Clic a WhatsApp = conversión secundaria (solo observación). Se excluye el
   botón post-pago: ese hito ya lo mide Purchase y contarlo dos veces
   distorsiona el costo por conversión. */
document.addEventListener('click', e => {
  const wa = e.target.closest('a[href*="wa.me"], a[href*="api.whatsapp.com"]');
  if (!wa || wa.id === 'wa-pospago') return;
  const contexto = wa.classList.contains('wa') ? 'burbuja_ayuda' : 'formulario';
  trackAds(CONV_WHATSAPP);
  trackMeta('MonotributoListo_Soporte_WhatsApp', { contexto, variante: VARIANTE });
  trackClarity('soporte_whatsapp_' + contexto);
});

capturarTracking();

/* ─── Microsoft Clarity ─── */
if (!esPrueba() && CLARITY_ID) {
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", CLARITY_ID);
}
