/* ==================================================
 * PsicoNutre — aparicion al hacer scroll
 * --------------------------------------------------
 * Vanilla, sin dependencias. NO toca main.js ni jQuery:
 * los efectos de la plantilla (header sticky, slick,
 * magnific, cursor, back-to-top) siguen intactos.
 *
 * La clase .pn-anim la pone el script en linea del
 * <head>, antes del primer pintado. Este archivo solo
 * se encarga de ir agregando .pn-in a medida que los
 * elementos entran en pantalla.
 * ================================================== */

(function () {
  "use strict";

  // Si el navegador no soporta IntersectionObserver, el script
  // del <head> nunca puso .pn-anim, asi que no hay nada oculto
  // y no hay nada que hacer.
  if (!("IntersectionObserver" in window)) return;
  if (!document.documentElement.classList.contains("pn-anim")) return;

  var SELECTOR = [
    ".hero_content_wrap",
    ".hero_image_wrap",
    ".section_heading",
    ".about_content",
    ".image_widget",
    ".images_group_widget",
    ".work_process_item",
    ".service_item",
    ".team_item",
    ".consultation_form",
    ".btn_wrap"
  ].join(",");

  // Grupos donde conviene escalonar la entrada, para que las
  // tarjetas no aparezcan todas de golpe.
  var ESCALONAR = ".service_item, .team_item, .work_process_item";
  var PASO_MS = 80;
  var TOPE = 3; // el retraso deja de crecer al cuarto elemento

  var elementos = document.querySelectorAll(SELECTOR);
  if (!elementos.length) {
    document.documentElement.classList.remove("pn-anim");
    return;
  }

  // Retraso por posicion dentro de su contenedor.
  var contadores = [];
  Array.prototype.forEach.call(elementos, function (el) {
    if (!el.matches(ESCALONAR)) return;
    var padre = el.parentNode && el.parentNode.parentNode; // col > row
    var i = contadores.indexOf(padre);
    if (i === -1) { contadores.push(padre); i = contadores.length - 1; }
    padre.__pnIdx = (padre.__pnIdx || 0);
    el.style.transitionDelay = Math.min(padre.__pnIdx, TOPE) * PASO_MS + "ms";
    padre.__pnIdx++;
  });

  var observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add("pn-in");
      observador.unobserve(entrada.target); // una sola vez, no al volver a subir
    });
  }, {
    // Se dispara un poco antes de que el elemento llegue al borde,
    // asi la animacion termina cuando ya se esta mirando.
    rootMargin: "0px 0px -12% 0px",
    threshold: 0.08
  });

  Array.prototype.forEach.call(elementos, function (el) {
    observador.observe(el);
  });

  // Avisa al script del <head> que todo arranco bien, para que
  // cancele su red de seguridad.
  window.__pnAnimReady = true;
})();


/* ==================================================
 * Menu: marcar la seccion en la que se esta
 * --------------------------------------------------
 * La plantilla deja .active fijo en "Inicio" porque
 * nunca previo una landing de una sola pagina.
 * ================================================== */

(function () {
  "use strict";

  var enlaces = document.querySelectorAll('.main_menu_list a[href^="#"]');
  if (!enlaces.length) return;

  // Solo los enlaces cuya seccion existe de verdad.
  var items = [];
  Array.prototype.forEach.call(enlaces, function (a) {
    var id = a.getAttribute("href").slice(1);
    var sec = id && document.getElementById(id);
    if (sec) items.push({ li: a.parentNode, sec: sec });
  });
  if (!items.length) return;

  var header = document.querySelector(".site_header");

  function marcar(activo) {
    items.forEach(function (it) {
      it.li.classList.toggle("active", it === activo);
    });
  }

  function actual() {
    // El umbral acompana al header fijo, para que la seccion
    // cambie cuando su titulo pasa por debajo del menu.
    var umbral = window.scrollY + (header ? header.offsetHeight : 0) + 40;
    var elegido = items[0];
    items.forEach(function (it) {
      if (it.sec.offsetTop <= umbral) elegido = it;
    });
    // Al final de la pagina gana siempre la ultima seccion:
    // si no, la ultima nunca se marca porque no llega a cruzar
    // el umbral.
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4) {
      elegido = items[items.length - 1];
    }
    return elegido;
  }

  var pendiente = false;
  function alScroll() {
    if (pendiente) return;
    pendiente = true;
    window.requestAnimationFrame(function () {
      marcar(actual());
      pendiente = false;
    });
  }

  window.addEventListener("scroll", alScroll, { passive: true });
  window.addEventListener("resize", alScroll);

  // Al hacer clic se marca de inmediato, sin esperar al scroll.
  items.forEach(function (it) {
    var a = it.li.querySelector("a");
    if (a) a.addEventListener("click", function () { marcar(it); });
  });

  alScroll();
})();


/* ==================================================
 * "Ver mas" en parrafos largos
 * --------------------------------------------------
 * Recorta a 3 lineas y despliega al hacer clic.
 *
 * Dos decisiones que importan:
 *
 * 1. El recorte lo aplica el JS, no el CSS. Si el script
 *    no corre, el texto se ve entero. Nunca se esconde
 *    contenido sin manera de recuperarlo.
 *
 * 2. El boton aparece SOLO si el texto de verdad supera
 *    las 3 lineas. Un "Ver mas" que no despliega nada es
 *    peor que no tenerlo.
 * ================================================== */

(function () {
  "use strict";

  var LINEAS = 3;
  var parrafos = document.querySelectorAll(".pn_clamp");
  if (!parrafos.length) return;

  function preparar(p) {
    // Se limpia lo de la pasada anterior para poder
    // recalcular al cambiar el ancho de la ventana.
    var previo = p.nextElementSibling;
    if (previo && previo.classList.contains("pn_vermas")) previo.remove();
    p.classList.remove("pn_clamped", "pn_open");

    p.classList.add("pn_clamped");

    // Si no se pasa de 3 lineas, no hay nada que recortar.
    if (p.scrollHeight <= p.clientHeight + 2) {
      p.classList.remove("pn_clamped");
      return;
    }

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pn_vermas";
    btn.textContent = "Ver más";
    btn.setAttribute("aria-expanded", "false");

    btn.addEventListener("click", function () {
      var abierto = p.classList.toggle("pn_open");
      btn.textContent = abierto ? "Ver menos" : "Ver más";
      btn.setAttribute("aria-expanded", abierto ? "true" : "false");
    });

    p.parentNode.insertBefore(btn, p.nextSibling);
  }

  function aplicar() {
    Array.prototype.forEach.call(parrafos, preparar);
  }

  // Se espera a las fuentes: medir antes de que carguen da
  // alturas equivocadas y aparecen botones de mas o de menos.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(aplicar);
  } else {
    window.addEventListener("load", aplicar);
  }

  var t;
  window.addEventListener("resize", function () {
    clearTimeout(t);
    t = setTimeout(aplicar, 200);
  });
})();



/* ==================================================
 * Linea de tiempo horizontal de "Como trabajamos"
 * --------------------------------------------------
 * Segunda version. La primera era vertical y guiada por
 * scroll; Joik la prefirio horizontal y navegada por el
 * usuario con una barra de progreso.
 *
 * Ya NO se activa sola al hacer scroll: en un carrusel
 * horizontal eso pelea con la persona, que es quien
 * decide donde parar.
 * ================================================== */

(function () {
  "use strict";

  var seccion = document.getElementById("proceso");
  if (!seccion) return;

  var viewport = seccion.querySelector(".pn_tl_viewport");
  var track = seccion.querySelector(".pn_tl_track");
  var rail = seccion.querySelector(".pn_tl_rail");
  var fill = seccion.querySelector(".pn_tl_fill");
  var pasos = Array.prototype.slice.call(seccion.querySelectorAll(".pn_tl_step"));
  var ticks = Array.prototype.slice.call(seccion.querySelectorAll(".pn_tl_tick"));
  if (!viewport || !track || !rail || !fill || pasos.length < 2) return;

  var meta = seccion.querySelector(".pn_tl_actual");
  var ultimo = pasos.length - 1;
  var activo = 0;

  // Los puntos se reparten a lo largo del riel.
  ticks.forEach(function (t, i) {
    t.style.left = (i / ultimo) * 100 + "%";
  });

  function centrar() {
    var card = pasos[activo];
    var centroCard = card.offsetLeft + card.offsetWidth / 2;
    var desplazamiento = viewport.clientWidth / 2 - centroCard;
    track.style.transform = "translateX(" + desplazamiento + "px)";
  }

  function pintar() {
    pasos.forEach(function (p, i) {
      p.classList.toggle("is-active", i === activo);
    });
    ticks.forEach(function (t, i) {
      t.classList.toggle("is-active", i === activo);
      t.classList.toggle("is-done", i < activo);
    });
    fill.style.width = (activo / ultimo) * 100 + "%";
    if (meta) meta.textContent = ("0" + (activo + 1)).slice(-2);
    rail.setAttribute("aria-valuenow", String(activo + 1));
    centrar();
  }

  function ir(i) {
    i = Math.max(0, Math.min(ultimo, i));
    if (i === activo) return;
    activo = i;
    pintar();
  }

  // --- Clic en una tarjeta o en un punto ---
  pasos.forEach(function (p, i) {
    p.addEventListener("click", function () { ir(i); });
  });
  ticks.forEach(function (t, i) {
    t.addEventListener("click", function (e) { e.stopPropagation(); ir(i); });
  });

  // --- Arrastre y clic sobre el riel ---
  function pasoDesdeX(clientX) {
    var r = rail.getBoundingClientRect();
    var razon = (clientX - r.left) / r.width;
    return Math.round(Math.max(0, Math.min(1, razon)) * ultimo);
  }

  var arrastrando = false;

  rail.addEventListener("pointerdown", function (e) {
    // Si el clic cayo sobre un punto, ya lo maneja el propio boton.
    if (e.target.classList.contains("pn_tl_tick")) return;
    arrastrando = true;
    rail.setPointerCapture(e.pointerId);
    ir(pasoDesdeX(e.clientX));
  });

  rail.addEventListener("pointermove", function (e) {
    if (!arrastrando) return;
    ir(pasoDesdeX(e.clientX));
  });

  function soltar(e) {
    if (!arrastrando) return;
    arrastrando = false;
    try { rail.releasePointerCapture(e.pointerId); } catch (err) {}
  }

  rail.addEventListener("pointerup", soltar);
  rail.addEventListener("pointercancel", soltar);

  // --- Teclado: el riel es un slider, tiene que responder ---
  rail.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); ir(activo + 1); }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); ir(activo - 1); }
    if (e.key === "Home") { e.preventDefault(); ir(0); }
    if (e.key === "End") { e.preventDefault(); ir(ultimo); }
  });

  window.addEventListener("resize", centrar);

  // Se centra despues de las fuentes: antes de que carguen las
  // tarjetas tienen otro alto y el calculo queda corrido.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(pintar);
  } else {
    window.addEventListener("load", pintar);
  }
  pintar();
})();
