/* ─────────────────────────────────────────────────────────────────────────
   Monotributo Listo — wizard de alta (12 pasos).
   Depende de config.js: WA, CRM, ORIGEN, VARIANTE, PRECIO, MP_FALLBACK,
   crmSave, crmAsk, trackMeta, trackAds, esPrueba, waLink.
   ───────────────────────────────────────────────────────────────────────── */
const PROVINCES=["Buenos Aires","CABA","Córdoba","Santa Fe","Mendoza","Tucumán","Entre Ríos","Salta","Chaco","Corrientes","Misiones","Santiago del Estero","San Juan","Jujuy","Río Negro","Neuquén","Formosa","Chubut","San Luis","Catamarca","La Rioja","La Pampa","Santa Cruz","Tierra del Fuego"];
const pos={contact:1,cuit:2,dniStatus:3,residence:4,billing:5,eligible:6,key:7,activity:8,sector:9,province:10,premises:11,identity:12,qualified:12,redirect:12,manual:5,duplicate:12,already:12,sinpago:12};
const back={cuit:"contact",dniStatus:"cuit",residence:"dniStatus",billing:"dniStatus",key:"eligible",activity:"key",sector:"activity",province:"sector",premises:"province",identity:"premises"};
let stage="contact", warnedEmail="", lead={nombre:"",apellido:"",telefono:"",email:"",website:"",tiene_cuit:"",dni_argentino:"",tiene_precaria:"",sabe_facturacion:"",monto_estimado:"",clave_fiscal:"",actividad_tipo:"",rubro:"",provincia:"",local:"",dni:"",cuit:""};
const funnel=document.getElementById("funnel"), esc=s=>String(s??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;"}[c]));
/* Cada "Siguiente" guarda el avance: si la persona abandona a mitad de camino,
   igual queda en el CRM lo que completó hasta ahí. */
function save(estado,extra={}){crmSave({...lead,...extra,estado});trackClarity(estado)}
function validCuit(v){const c=v.replace(/\D/g,"");if(!/^\d{11}$/.test(c))return false;const m=[5,4,3,2,7,6,5,4,3,2];let sum=0;for(let i=0;i<10;i++)sum+=+c[i]*m[i];let d=11-sum%11;if(d===11)d=0;return d!==10&&d===+c[10]}
function distance(a,b){const m=Array.from({length:b.length+1},()=>Array(a.length+1).fill(0));for(let i=0;i<=b.length;i++)m[i][0]=i;for(let j=0;j<=a.length;j++)m[0][j]=j;for(let i=1;i<=b.length;i++)for(let j=1;j<=a.length;j++)m[i][j]=b[i-1]===a[j-1]?m[i-1][j-1]:Math.min(m[i-1][j-1],m[i][j-1],m[i-1][j])+1;return m[b.length][a.length]}
function suggestEmail(email){const p=email.split("@");if(p.length!==2)return null;const ds=["gmail.com","hotmail.com","outlook.com","yahoo.com","yahoo.com.ar","icloud.com","live.com","hotmail.com.ar","outlook.com.ar"];if(ds.includes(p[1].toLowerCase()))return null;const d=ds.find(x=>distance(p[1].toLowerCase(),x)<=2);return d?`${p[0]}@${d}`:null}
function legal(){return `<small class="legal">Al continuar aceptás que Monotributo Listo y el prestador identificado en los <a href="terminos.html">Términos y condiciones</a> te contacten, y declarás haber leído la <a href="privacidad.html">Política de privacidad</a>. No te pediremos la clave fiscal en este formulario. El trámite básico también puede realizarse gratis en ARCA.</small>`}
function q(k,t,p,inside){return `<div class="form-step question"><small>${k}</small><h2>${t}</h2><p>${p}</p>${inside}</div>`}
function result(icon,k,t,p,inside,danger=false){return `<div class="success ${danger?"danger":""}"><div>${icon}</div><small>${k}</small><h2>${t}</h2><p>${p}</p>${inside}</div>`}
function choices(field,arr){return `<div class="choices ${arr.length<=3?"row":""}">${arr.map(([v,l])=>`<button type="button" data-choice="${field}" data-value="${v}" class="${lead[field]===v?"selected":""}">${l}</button>`).join("")}</div>`}
function nav(disabled=false){return `<div class="form-actions">${back[stage]?`<button type="button" class="back" data-back>← Anterior</button>`:""}<button type="button" class="primary" data-next ${disabled?"disabled":""}>Siguiente <span>↗</span></button></div>`}
function error(text){return text?`<div class="error" role="alert">${esc(text)}</div>`:""}
function render(err=""){
 document.getElementById("step-now").textContent=pos[stage];document.getElementById("progress").style.width=`${pos[stage]/12*100}%`;document.getElementById("form-label").textContent=stage==="sinpago"?"Necesitamos ayudarte":stage==="already"?"Tu solicitud":"Empezá tu solicitud";
 if(stage==="contact")funnel.innerHTML=`<form id="contact-form" novalidate><div class="honeypot" aria-hidden="true"><input id="website" tabindex="-1" autocomplete="off"></div>${q("Tus datos","¿Con quién hablamos?","Guardamos este primer paso aunque después no termines el formulario.",`<div class="fields two"><label>Nombre<input id="nombre" autofocus value="${esc(lead.nombre)}" placeholder="Tu nombre"></label><label>Apellido<input id="apellido" value="${esc(lead.apellido)}" placeholder="Tu apellido"></label></div><label>WhatsApp<input id="telefono" type="tel" inputmode="numeric" pattern="[0-9]*" maxlength="10" value="${esc(lead.telefono)}" placeholder="11 2345 6789"></label><label>Email<input id="email" type="email" value="${esc(lead.email)}" placeholder="nombre@correo.com"></label>`) }${error(err)}<div class="form-actions"><button class="primary">Empezar mi alta <span>↗</span></button></div>${legal()}</form>`;
 else if(stage==="cuit")funnel.innerHTML=q("Calificación","¿Tenés CUIT o CUIL?","No pasa nada si todavía no lo tenés.",choices("tiene_cuit",[["si","Sí"],["no","No"]])+nav(!lead.tiene_cuit));
 else if(stage==="dniStatus")funnel.innerHTML=q("Calificación","¿Tenés DNI argentino?","Esto define si el alta puede continuar completamente online.",choices("dni_argentino",[["si","Sí"],["no","No"]])+nav(!lead.dni_argentino));
 else if(stage==="residence")funnel.innerHTML=q("Residencia","¿Tenés residencia precaria o permanente en Argentina?","La necesitamos para determinar si podemos gestionar el alta por este medio.",choices("tiene_precaria",[["si","Sí"],["no","No"]])+nav(!lead.tiene_precaria));
 else if(stage==="billing")funnel.innerHTML=q("Ingresos estimados","¿Tenés una idea de cuánto vas a facturar por mes?","Es una estimación; sirve para orientar correctamente tu categoría.",choices("sabe_facturacion",[["si","Sí"],["no","No"]])+(lead.sabe_facturacion==="si"?`<label>Monto estimado por mes <span class="optional">(opcional)</span><input id="monto_estimado" inputmode="numeric" value="${lead.monto_estimado?`${Number(lead.monto_estimado).toLocaleString("es-AR")}`:""}" placeholder="$0"></label>`:"")+nav(!lead.sabe_facturacion));
 else if(stage==="eligible")funnel.innerHTML=result("✓","Precalificación completa","¡Muy bien! Podés darte de alta.","Ahora sí, necesitamos los últimos datos para armar tu trámite.",`<button class="primary" data-next>Continuar <span>↗</span></button>`);
 else if(stage==="key")funnel.innerHTML=q("Tu situación","¿Tenés clave fiscal?","No te la vamos a pedir en este formulario.",choices("clave_fiscal",[["si","Sí"],["no","No"],["no_se","No sé"]])+nav(!lead.clave_fiscal));
 else if(stage==="activity")funnel.innerHTML=q("Tu actividad","¿A qué te dedicás?","Elegí la opción que más se acerque a tu caso.",choices("actividad_tipo",[["servicios","Servicios · freelance, delivery, oficios"],["ventas","Venta de productos"],["ambos","Ambos"]])+nav(!lead.actividad_tipo));
 else if(stage==="sector")funnel.innerHTML=q("Tu actividad","Contanos tu rubro.","Con una descripción breve es suficiente.",`<label>Rubro o actividad<input id="rubro" autofocus value="${esc(lead.rubro)}" placeholder="Ej. diseño, delivery, clases particulares…"></label>`+nav(lead.rubro.trim().length<3));
 else if(stage==="province")funnel.innerHTML=q("Tu jurisdicción","¿En qué provincia estás?","La jurisdicción es parte de la inscripción.",`<label>Provincia<select id="provincia"><option value="">Seleccioná</option>${PROVINCES.map(p=>`<option ${lead.provincia===p?"selected":""}>${p}</option>`).join("")}</select></label>`+nav(!lead.provincia));
 else if(stage==="premises")funnel.innerHTML=q("Tu actividad","¿Tenés local comercial?","Este dato puede influir en la categoría.",choices("local",[["no","No tengo"],["si","Sí tengo"]])+nav(!lead.local));
 else if(stage==="identity")funnel.innerHTML=q("Últimos datos","Validemos tu identidad.","Usamos el DNI para evitar trámites o pagos duplicados.",`<label>DNI<input id="dni" autofocus inputmode="numeric" maxlength="8" value="${esc(lead.dni)}" placeholder="30123456"></label><label>CUIT / CUIL <span class="optional">(opcional)</span><input id="cuit" inputmode="numeric" maxlength="11" value="${esc(lead.cuit)}" placeholder="Si no tenés, lo gestionamos nosotros"></label>${error(err)}${nav(!lead.dni)}`);
 else if(stage==="qualified")funnel.innerHTML=result("✓","Solicitud calificada","¡Listo! Tu alta puede iniciarse hoy.","Con tus datos ya tenemos todo lo necesario. Confirmá para coordinar el pago y arrancar el trámite.",`<button class="primary" id="confirm">Confirmar y continuar <span>↗</span></button>${legal()}`);
 else if(stage==="redirect")funnel.innerHTML=result("◷","Datos guardados","Te estamos llevando al pago.","Si la redirección no se abre, podés continuar desde el botón.",`<button type="button" class="primary" data-pay>Ir a Mercado Pago <span>↗</span></button>`);
 else if(stage==="manual")funnel.innerHTML=result("×","Revisión manual","Por ahora no podemos avanzar online.","Según tus respuestas, tu caso necesita una revisión particular. Te ayudamos igual por WhatsApp.",`<a class="primary" href="https://wa.me/${WA}?text=${encodeURIComponent("Hola, completé el formulario y necesito ayuda con mi alta de Monotributo")}">Hablar por WhatsApp <span>↗</span></a><button class="back standalone-back" id="review-answer">← Revisar mi respuesta</button>`,true);
 else if(stage==="duplicate")funnel.innerHTML=result("!","Trámite detectado","Ya tenés un trámite iniciado.","Encontramos un pago confirmado con este DNI. Escribinos y seguimos tu caso sin generar otro cobro.",`<a class="primary" href="https://wa.me/${WA}?text=${encodeURIComponent("Hola, ya había pagado mi alta de Monotributo y quiero consultar el estado")}">Consultar por WhatsApp <span>↗</span></a>`,true);
 else if(stage==="already")funnel.innerHTML=result("✓","Solicitud guardada","Ya completaste el formulario.","Si todavía no pagaste, continuá desde el mismo enlace. Si es para otra persona, empezá de nuevo.",`<button type="button" class="primary" data-pay>Ir a Mercado Pago <span>↗</span></button><button class="back standalone-back" id="reset">Completar otra solicitud</button>`);
 else funnel.innerHTML=result("!","No pudimos abrir el pago","Seguimos por WhatsApp.","Tus datos ya quedaron guardados y no se generó ningún cobro. Escribinos y te pasamos el link de pago a mano.",`<a class="primary" href="${waLink("Hola, completé el formulario de alta de Monotributo pero no se abrió el pago. ¿Me pasan el link?")}">Hablar por WhatsApp <span>↗</span></a><button type="button" class="back standalone-back" data-pay>Reintentar</button>`,true);
 bind();
}
function updateInputs(){["nombre","apellido","telefono","email","website","monto_estimado","rubro","provincia","dni","cuit"].forEach(id=>{const el=document.getElementById(id);if(!el)return;el.addEventListener(id==="provincia"?"change":"input",()=>{let v=el.value;if(["telefono","dni","cuit","monto_estimado"].includes(id)){v=v.replace(/[^0-9]/g,"");if(el.value!==v)el.value=v}lead[id]=v;const next=document.querySelector("[data-next]");if(next){if(id==="rubro")next.disabled=lead.rubro.trim().length<3;if(id==="provincia")next.disabled=!lead.provincia;if(id==="dni")next.disabled=!lead.dni}})})}
function bind(){updateInputs();document.querySelectorAll("[data-choice]").forEach(b=>b.onclick=()=>{lead[b.dataset.choice]=b.dataset.value;render()});document.querySelector("[data-back]")?.addEventListener("click",()=>{stage=stage==="billing"&&lead.dni_argentino==="no"?"residence":back[stage];render()});document.querySelector("[data-next]")?.addEventListener("click",next);document.querySelectorAll("[data-pay]").forEach(b=>b.addEventListener("click",()=>{yaRedirigiendo=false;irAPagar()}));document.getElementById("contact-form")?.addEventListener("submit",contact);document.getElementById("confirm")?.addEventListener("click",confirm);document.getElementById("review-answer")?.addEventListener("click",()=>{stage="residence";render()});document.getElementById("reset")?.addEventListener("click",()=>{localStorage.removeItem("ts_completado");stage="contact";render()})}
function contact(e){e.preventDefault();["nombre","apellido","telefono","email","website"].forEach(id=>{const el=document.getElementById(id);lead[id]=el?el.value.trim():lead[id]});const phone=lead.telefono.replace(/\D/g,"");if(lead.website)return;if(lead.nombre.length<2)return render("Ingresá tu nombre.");if(phone.length!==10)return render("El celular debe tener 10 dígitos, sin 0 ni 15. Ejemplo: 11 1234-5678.");if(!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(lead.email))return render("Ingresá un email válido.");const s=suggestEmail(lead.email);if(s&&warnedEmail!==lead.email){warnedEmail=lead.email;return render(`¿Quisiste decir ${s}? Corregilo o volvé a continuar si tu email es correcto.`)}lead.telefono=phone;save("paso_1",{telefono:phone});trackMeta("MonotributoListo_Lead_Paso1",{variante:VARIANTE});stage="cuit";render()}
/* ─── Paso a paso del wizard ─────────────────────────────────────────────
   Cada rama guarda su estado en el CRM antes de avanzar. Los nombres de
   estado tienen que coincidir con el mapa ESTADOS de api/lead-intake.js del
   CRM: si mandás uno que no está ahí, el lead se guarda igual pero el
   tablero lo muestra con el código crudo en vez del texto. */
async function next(){
  if(stage==="cuit"){save("progreso_cuit");stage="dniStatus"}
  else if(stage==="dniStatus"){save("progreso_dni");stage=lead.dni_argentino==="no"?"residence":"billing"}
  else if(stage==="residence"){
    if(lead.tiene_precaria==="no"){save("no_apto");stage="manual"}
    else{save("progreso_residencia");stage="billing"}
  }
  else if(stage==="billing"){save("apto");stage="eligible"}
  else if(stage==="eligible")stage="key";
  else if(stage==="key"){save("progreso_clave_fiscal");stage="activity"}
  else if(stage==="activity"){save("progreso_actividad");stage="sector"}
  else if(stage==="sector"){save("progreso_rubro");stage="province"}
  else if(stage==="province"){save("progreso_provincia");stage="premises"}
  else if(stage==="premises"){save("progreso_local");stage="identity"}
  else if(stage==="identity"){
    const dni=lead.dni.replace(/\D/g,""),cuit=lead.cuit.replace(/\D/g,"");
    if(dni.length<7||dni.length>8)return render("Ingresá un DNI válido, sin puntos.");
    if(cuit&&!validCuit(cuit))return render("Ese CUIT/CUIL no es válido. Si no lo tenés, dejalo vacío.");
    /* El CRM responde dos cosas distintas:
       duplicate  = este DNI ya tiene un pago confirmado → no dejamos cobrar de nuevo.
       completado = ya llegó al pago alguna vez pero no pagó → lo mandamos
                    directo al checkout en vez de hacerle repetir el formulario. */
    const r=await crmAsk({action:"check_dni",dni});
    lead.dni=dni;lead.cuit=cuit;
    if(r.duplicate){save("dni_duplicado",{dni,cuit});stage="duplicate"}
    else if(r.completado){save("calificado",{dni,cuit});stage="already"}
    else{
      save("calificado",{dni,cuit});
      trackMeta("MonotributoListo_Formulario_Completo",{variante:VARIANTE});
      stage="qualified";
    }
  }
  render();
}

function confirm(){
  save("completo");
  /* Guardamos la identidad para poder avisarle al CRM que pagó cuando vuelva
     de Mercado Pago a pago-aprobado.html (esa página no tiene el formulario). */
  try{
    localStorage.setItem("ts_completado",JSON.stringify({ts:new Date().toISOString()}));
    localStorage.setItem("ts_lead_pago",JSON.stringify({telefono:lead.telefono,nombre:lead.nombre,apellido:lead.apellido,email:lead.email,dni:lead.dni}));
  }catch{}
  trackMeta("MonotributoListo_Pago_Iniciado",{value:PRECIO,currency:"ARS",variante:VARIANTE});
  stage="redirect";render();
  irAPagar();
}

/* ─── Redirect a Mercado Pago ────────────────────────────────────────────
   ⚠️ REGLA: el navegador NUNCA espera a que conteste un fetch para irse.
   Entre el 20 y el 22/7 hubo 22 intentos de pago con CERO llegadas a MP
   porque el fetch quedaba colgado en el navegador in-app de Instagram y la
   persona se quedaba mirando "te estamos redirigiendo…" para siempre.
   Por eso: corte a los 3,5s, red final a los 6s, y el link dinámico es una
   mejora oportunista, no un requisito. */
let yaRedirigiendo=false;
function irAPagar(){
  const CORTE_MS=3500, TOPE_MS=6000;
  const ir=destino=>{
    if(yaRedirigiendo)return;
    yaRedirigiendo=true;
    if(!destino){stage="sinpago";render();return}
    /* Distinto de 'completo' (que solo dice "apretó pagar"): esto confirma que
       el navegador EFECTIVAMENTE se fue. Un lead con 'completo' y sin
       'redirigido_mp' = el redirect se colgó. Sin esta señal tardamos 3 días
       en ver el problema, cruzando datos de Meta a mano. */
    save("redirigido_mp",{via:destino===MP_FALLBACK?"respaldo":"dinamico"});
    location.href=destino;
  };
  setTimeout(()=>ir(MP_FALLBACK||null),TOPE_MS);
  Promise.race([
    crearLinkPago(),
    new Promise(r=>setTimeout(()=>r(MP_FALLBACK||null),CORTE_MS)),
  ]).then(destino=>setTimeout(()=>ir(destino),700)).catch(()=>ir(MP_FALLBACK||null));
}

/* Pide al CRM una preferencia de MP atada a este lead. El external_reference
   (el teléfono) es lo único que después le permite al webhook de MP encontrar
   al lead y marcarlo como pagado. Un link fijo no tiene eso: el pago entra
   pero queda huérfano. */
async function crearLinkPago(){
  if(esPrueba())return "pago-aprobado.html";   // previsualización local del flujo
  const d=await crmAsk({action:"create_payment",telefono:lead.telefono,nombre:lead.nombre,apellido:lead.apellido,email:lead.email,dni:lead.dni,origen:ORIGEN},5000);
  return (d&&d.init_point)?d.init_point:(MP_FALLBACK||null);
}

/* Si ya completó el formulario antes en este navegador, lo retomamos donde
   estaba en vez de hacerle empezar de cero.
   ⚠️ Hay que restaurar también la identidad: si el objeto `lead` queda vacío,
   create_payment genera la preferencia SIN external_reference válido y el
   webhook de Mercado Pago no puede reconciliar el pago con nadie. Se pierde
   sobre todo con los pagos en efectivo, donde el webhook es el único aviso
   (la persona paga en el kiosco días después, sin volver al sitio). */
try{
  if(JSON.parse(localStorage.getItem("ts_completado")||"null")){
    stage="already";
    const id=JSON.parse(localStorage.getItem("ts_lead_pago")||"{}");
    ["telefono","nombre","apellido","email","dni"].forEach(k=>{ if(id[k]) lead[k]=id[k] });
  }
}catch{}
render();
document.querySelectorAll(".faq-list article button").forEach(btn=>btn.onclick=()=>{const item=btn.closest("article"),was=item.classList.contains("open");document.querySelectorAll(".faq-list article").forEach(x=>{x.classList.remove("open");x.querySelector("b").textContent="+"});if(!was){item.classList.add("open");btn.querySelector("b").textContent="−"}});
const observer=new IntersectionObserver(entries=>entries.forEach(e=>e.isIntersecting&&e.target.classList.add("visible")),{threshold:.12});document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));
