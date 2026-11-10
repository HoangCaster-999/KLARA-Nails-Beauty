/* KLARA Nails & Beauty – Seitenlogik. Inhalte: siehe assets/js/content.js */
(function () {
  "use strict";

  var C = window.KLARA || {};
  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DRAFT = !!C.draft;
  // Fehlende Angaben ([PLATZHALTER]) werden nie angezeigt – die Seite blendet sie einfach aus,
  // bis echte Werte in content.js stehen. (draft markiert nur noch zu bestätigende Preisangaben.)
  var SHOW_MISSING = false;

  /* ---------- Helfer ---------- */
  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  // Ein Wert gilt als gesetzt, wenn er nicht leer und kein [PLATZHALTER] ist.
  function isSet(v) { return typeof v === "string" && v.trim() !== "" && !/^\[.*\]$/.test(v.trim()); }
  function placeholder(v) { return SHOW_MISSING ? '<span class="placeholder">' + esc(v || "[FEHLT]") + "</span>" : ""; }
  function money(v) { return v == null ? null : (C.showCurrency ? v + " €" : v); }

  var biz = C.business || {};
  var contact = C.contact || {};
  var hours = C.hours || [];
  var fullAddress = [biz.street, (biz.zip || "") + " " + (biz.city || ""), biz.countryName].filter(Boolean).join(", ");

  if (DRAFT) {
    root.classList.add("is-draft");
    var bar = $("[data-draft-bar]");
    if (bar) bar.hidden = false;
  }

  /* ---------- Öffnungszeiten ---------- */
  var DAY_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  var DAY_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  function hoursFor(dow) { for (var i = 0; i < hours.length; i++) if (hours[i].dow === dow) return hours[i]; return null; }
  function known(h) { return h && h.open && h.close; }
  function toMin(t) { var p = t.split(":"); return +p[0] * 60 + +p[1]; }
  var weekOrder = [1, 2, 3, 4, 5, 6, 0];

  function berlinNow() {
    try {
      var parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Berlin", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
      }).formatToParts(new Date());
      var o = {};
      parts.forEach(function (p) { o[p.type] = p.value; });
      var dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday);
      return { dow: dow, min: (+o.hour % 24) * 60 + +o.minute };
    } catch (e) {
      var d = new Date();
      return { dow: d.getDay(), min: d.getHours() * 60 + d.getMinutes() };
    }
  }

  function compactHours(sep) {
    // Gruppiert aufeinanderfolgende Tage mit gleichen Zeiten: "Mo–Fr 09:30–19:00"
    var groups = [];
    weekOrder.forEach(function (dow) {
      var h = hoursFor(dow);
      if (!known(h)) { groups.push(null); return; }
      var key = h.open + "–" + h.close;
      var last = groups[groups.length - 1];
      if (last && last.key === key) last.to = dow;
      else groups.push({ key: key, from: dow, to: dow });
    });
    return groups.filter(Boolean).map(function (g) {
      var days = g.from === g.to ? DAY_SHORT[g.from] : DAY_SHORT[g.from] + "–" + DAY_SHORT[g.to];
      return days + " " + g.key;
    }).join(sep);
  }

  function renderHours() {
    var table = $("[data-hours]");
    var now = berlinNow();
    if (table) {
      table.innerHTML = "<caption class='sr-only'>Öffnungszeiten</caption><tbody>" + weekOrder.map(function (dow) {
        var h = hoursFor(dow);
        if (!h) return "";
        if (!known(h) && !SHOW_MISSING) return ""; // Unbekannte Tage öffentlich nicht anzeigen (keine Vermutung)
        var val = known(h) ? h.open + " – " + h.close : placeholder(h.placeholder);
        return '<tr class="' + (dow === now.dow ? "is-today" : "") + '"><th scope="row">' + esc(h.day) + "</th><td>" + val + "</td></tr>";
      }).join("") + "</tbody>";
    }
    var compact = $("[data-hours-compact]");
    if (compact) compact.innerHTML = compactHours("<br>") + (SHOW_MISSING && !known(hoursFor(0)) ? "<br>So " + placeholder(hoursFor(0) && hoursFor(0).placeholder) : "");

    var status = $("[data-open-status]");
    if (status) {
      var s = openStatus(now);
      status.innerHTML = s ? '<span class="status-dot status-dot--' + s.state + '"></span>' + esc(s.text) : esc(compactHours(" · "));
    }
  }

  function openStatus(now) {
    var today = hoursFor(now.dow);
    if (!known(today)) return null; // keine Angabe → neutrale Wochenübersicht
    var o = toMin(today.open), c = toMin(today.close);
    if (now.min >= o && now.min < c) return { state: "open", text: "Jetzt geöffnet · bis " + today.close + " Uhr" };
    if (now.min < o) return { state: "closed", text: "Öffnet heute um " + today.open + " Uhr" };
    // Nach Ladenschluss: nur "morgen" nennen, wenn für morgen Zeiten hinterlegt sind
    var next = hoursFor((now.dow + 1) % 7);
    if (!known(next)) return { state: "closed", text: "Für heute geschlossen" };
    return { state: "closed", text: "Geschlossen · öffnet morgen um " + next.open + " Uhr" };
  }

  /* ---------- Leistungen ---------- */
  function renderServices() {
    var list = $("[data-services]");
    if (!list) return;
    list.innerHTML = (C.services || []).map(function (s, i) {
      return '<li class="service reveal">' +
        '<span class="service__no" aria-hidden="true">' + String(i + 1).padStart(2, "0") + "</span>" +
        '<h3 class="service__title">' + esc(s.title) + "</h3>" +
        '<p class="service__text">' + esc(s.text) + "</p>" +
        '<div class="service__meta">' +
        (s.from ? '<span class="service__from">ab <strong>' + esc(money(s.from)) + "</strong></span>" : "") +
        (s.priceRef ? '<a class="link-arrow" href="#preis-' + esc(s.priceRef) + '">Preise<span class="sr-only"> ' + esc(s.title) + "</span></a>" : "") +
        "</div></li>";
    }).join("");

    // Kleiner Preis-Hinweis am Hero-Foto (aus den Leistungen, nie hart codiert)
    var chip = $("[data-hero-chip]"), first = (C.services || [])[0];
    if (chip && first && first.from) {
      chip.innerHTML = esc(first.title) + " ab <strong>" + esc(money(first.from)) + "</strong>";
      chip.hidden = false;
    }
  }

  /* ---------- Preise ---------- */
  function renderPrices() {
    var wrap = $("[data-prices]"), tabs = $("[data-price-tabs]");
    if (!wrap) return;
    var cats = C.prices || [];

    if (tabs) tabs.innerHTML = cats.map(function (c) {
      return '<a href="#preis-' + esc(c.id) + '">' + esc(c.title) + "</a>";
    }).join("");

    wrap.innerHTML = cats.map(function (cat, ci) {
      var cols = cat.columns || [];
      var single = cols.length === 0;
      var n = Math.max(cols.length, 1);
      var head = '<thead><tr><th scope="col"><span class="sr-only">Leistung</span></th>' +
        (single ? '<th scope="col" class="num">Preis</th>' : cols.map(function (col) {
          var lbl = esc(col.label);
          if (col.unconfirmed) lbl = '<span class="unconfirmed" title="Spaltenüberschrift im Original nicht eindeutig lesbar – bitte bestätigen">' + lbl + "</span>";
          return '<th scope="col" class="num">' + lbl + "</th>";
        }).join("")) + "</tr></thead>";

      var body = "<tbody>" + cat.items.map(function (it) {
        var name = esc(it.name);
        if (it.unconfirmed) name = '<span class="unconfirmed" title="' + esc(it.unconfirmed) + ' – bitte bestätigen">' + name + "</span>";
        var cells = "";
        for (var i = 0; i < n; i++) {
          var p = (it.prices || [])[i];
          cells += '<td class="num">' + (p == null
            ? '<span class="dash" aria-hidden="true">–</span><span class="sr-only">keine Angabe</span>'
            : esc(money(p))) + "</td>";
        }
        return "<tr" + (it.surcharge ? ' class="is-surcharge"' : "") + '><th scope="row"><span class="price-table__name">' + name + "</span></th>" + cells + "</tr>";
      }).join("") + "</tbody>";

      // Kategorien mit 3+ Preisspalten (z. B. Wimpern) bekommen die volle Breite
      var wide = cols.length >= 3;
      return '<section class="price-cat reveal' + (wide ? " price-cat--wide" : "") + '" id="preis-' + esc(cat.id) + '" aria-labelledby="pc-' + ci + '">' +
        '<h3 class="price-cat__title" id="pc-' + ci + '"><small>' + String(ci + 1).padStart(2, "0") + "</small>" + esc(cat.title) + "</h3>" +
        '<table class="price-table' + (single ? " price-table--single" : " price-table--cols-" + n) + '">' +
        "<caption class=\"sr-only\">" + esc(cat.title) + " – Preise</caption>" + head + body + "</table></section>";
    }).join("");

    var note = $("[data-price-note]");
    if (note && DRAFT) {
      var notes = [];
      if (C.showCurrency && !C.currencyConfirmed) notes.push("Währungszeichen „€“ (im Original nicht angegeben)");
      // Hinweise aus den Daten ableiten, damit sie nach einer Bestätigung automatisch verschwinden
      cats.forEach(function (cat) {
        (cat.columns || []).forEach(function (col) {
          if (col.unconfirmed) notes.push("Spaltenüberschrift „" + col.label + "“ (" + cat.title + (typeof col.unconfirmed === "string" ? ", " + col.unconfirmed : "") + ")");
        });
        cat.items.forEach(function (it) {
          if (it.unconfirmed) notes.push("„" + it.name + "“" + (typeof it.unconfirmed === "string" ? " – " + it.unconfirmed : ""));
        });
      });
      if (notes.length) note.innerHTML = '<span class="placeholder">Vorschau</span> Noch zu bestätigen: ' + notes.map(esc).join(" · ");
    }

    // Aktive Kategorie in den Tabs markieren
    if (tabs && "IntersectionObserver" in window) {
      var links = $$("a", tabs);
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          links.forEach(function (a) {
            var on = a.getAttribute("href") === "#" + e.target.id;
            if (on) {
              a.setAttribute("aria-current", "true");
              tabs.scrollTo({ left: a.offsetLeft - 16, behavior: reduceMotion ? "auto" : "smooth" });
            } else a.removeAttribute("aria-current");
          });
        });
      }, { rootMargin: "-35% 0px -55% 0px" });
      $$(".price-cat", wrap).forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- Galerie ---------- */
  function smallSrc(src) { return /-1440\.webp$/.test(src) ? src.replace(/-1440\.webp$/, "-720.webp") : null; }

  function renderGallery() {
    var grid = $("[data-gallery]");
    if (!grid) return;
    var items = (C.gallery || []).filter(function (g) { return g.src && g.src.trim(); });
    var initial = C.galleryInitial || items.length;
    grid.innerHTML = items.map(function (g, i) {
      var small = smallSrc(g.src);
      var alt = g.alt || g.label || "";
      var dims = g.w && g.h ? ' width="' + (+g.w) + '" height="' + (+g.h) + '"' : "";
      return '<figure class="tile reveal"' + (i >= initial ? " hidden" : "") + ">" +
        '<button type="button" data-lightbox-open="' + esc(g.src) + '" data-lightbox-alt="' + esc(alt) + '" data-lightbox-caption="' + esc(g.label || "") + '" data-lightbox-group="galerie">' +
        '<img src="' + esc(small || g.src) + '"' + (small ? ' srcset="' + esc(small) + " 720w, " + esc(g.src) + ' 1440w" sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 400px"' : "") +
        dims + ' alt="' + esc(alt) + '" loading="lazy" decoding="async">' +
        '<span class="sr-only">Vergrößern</span></button>' +
        (g.label ? '<figcaption class="tile__label">' + esc(g.label) + "</figcaption>" : "") +
        "</figure>";
    }).join("");

    var more = $("[data-gallery-more]"), toggle = $("[data-gallery-toggle]");
    if (more && toggle && items.length > initial) {
      more.hidden = false;
      toggle.textContent = "Alle " + items.length + " Arbeiten zeigen";
      toggle.addEventListener("click", function () {
        var hiddenTiles = $$(".tile[hidden]", grid);
        hiddenTiles.forEach(function (t) { t.hidden = false; t.classList.add("is-visible"); });
        more.hidden = true;
        var firstNew = hiddenTiles[0] && $("button", hiddenTiles[0]);
        if (firstNew) firstNew.focus({ preventScroll: true });
      });
    }
  }

  /* ---------- Kontakt & Social ---------- */
  var CHANNELS = [
    { key: "phone", label: "Telefon", href: function (v) { return "tel:" + v.replace(/[^\d+]/g, ""); }, text: function () { return isSet(contact.phoneDisplay) ? contact.phoneDisplay : contact.phone; } },
    { key: "email", label: "E-Mail", href: function (v) { return "mailto:" + v; } },
    { key: "whatsapp", label: "WhatsApp", href: function (v) { return "https://wa.me/" + v.replace(/\D/g, ""); }, ext: true, text: function () { return "Nachricht schreiben"; } },
    { key: "instagram", label: "Instagram", href: function (v) { return v; }, ext: true, text: function () { return "Instagram"; } },
    { key: "facebook", label: "Facebook", href: function (v) { return v; }, ext: true, text: function () { return "Facebook"; } }
  ];

  function renderContact() {
    var list = $("[data-contact-list]");
    if (list) {
      var rows = CHANNELS.map(function (ch) {
        var v = contact[ch.key];
        if (isSet(v)) {
          return '<div class="row"><span>' + ch.label + '</span><a href="' + esc(ch.href(v)) + '"' + (ch.ext ? ' target="_blank" rel="noopener"' : "") + ">" + esc(ch.text ? ch.text() : v) + "</a></div>";
        }
        return SHOW_MISSING ? '<div class="row"><span>' + ch.label + "</span>" + placeholder(v) + "</div>" : "";
      }).join("");
      list.innerHTML = rows;
      list.hidden = !rows;
    }

    var social = $("[data-social]");
    if (social) {
      var items = ["instagram", "facebook"].map(function (k) {
        var v = contact[k], name = k === "instagram" ? "Instagram" : "Facebook";
        if (isSet(v)) return '<li><a href="' + esc(v) + '" target="_blank" rel="noopener">' + name + "</a></li>";
        return SHOW_MISSING ? "<li>" + placeholder(v) + "</li>" : "";
      }).join("");
      social.innerHTML = items;
      if (!items) social.parentElement.hidden = true;
    }

    var routeUrl = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(biz.name + ", " + fullAddress);
    $$("[data-route-link]").forEach(function (a) { a.href = routeUrl; });
  }

  /* ---------- Terminanfrage ---------- */
  function renderBooking() {
    var form = $("[data-booking-form]");
    if (!form) return;
    var select = $("[data-service-select]", form);
    var dateInput = $("#bf-date", form);
    var hint = $("[data-date-hint]", form);
    var sendWrap = $("[data-send-buttons]", form);
    var status = $("[data-booking-status]", form);
    var direct = $("[data-direct-contact]");

    select.innerHTML = '<option value="">Bitte wählen …</option>' + (C.prices || []).map(function (cat) {
      return '<optgroup label="' + esc(cat.title) + '">' + cat.items.filter(function (it) { return !it.surcharge; }).map(function (it) {
        var v = cat.title + " – " + it.name;
        return '<option value="' + esc(v) + '">' + esc(it.name) + "</option>";
      }).join("") + "</optgroup>";
    }).join("") + '<option value="Beratung / Sonstiges">Beratung / Sonstiges</option>';

    // Frühestes Datum: heute
    var t = new Date();
    dateInput.min = t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0") + "-" + String(t.getDate()).padStart(2, "0");
    dateInput.addEventListener("change", function () {
      dateInput.removeAttribute("aria-invalid");
      if (!dateInput.value) { hint.textContent = ""; return; }
      var h = hoursFor(new Date(dateInput.value + "T12:00:00").getDay());
      hint.textContent = known(h)
        ? "Öffnungszeiten an diesem Tag: " + h.open + "–" + h.close + " Uhr"
        : "Für diesen Tag sind keine Öffnungszeiten hinterlegt.";
    });

    var hasWa = isSet(contact.whatsapp), hasMail = isSet(contact.email), hasPhone = isSet(contact.phone), hasUrl = isSet(contact.bookingUrl);
    var btns = "";
    if (hasUrl) btns += '<a class="btn btn--dark" href="' + esc(contact.bookingUrl) + '" target="_blank" rel="noopener">Online buchen</a>';
    if (hasWa || SHOW_MISSING) btns += '<button class="btn btn--dark" type="submit" data-send="whatsapp"' + (hasWa ? "" : ' disabled title="WhatsApp-Nummer fehlt"') + ">Per WhatsApp senden</button>";
    if (hasMail || SHOW_MISSING) btns += '<button class="btn btn--outline" type="submit" data-send="email"' + (hasMail ? "" : ' disabled title="E-Mail-Adresse fehlt"') + ">Per E-Mail senden</button>";
    sendWrap.innerHTML = btns;

    if (direct) {
      var d = "";
      if (hasPhone) d += '<a class="btn btn--outline" href="tel:' + esc(contact.phone.replace(/[^\d+]/g, "")) + '">Anrufen</a>';
      direct.innerHTML = d;
    }
    // Ohne WhatsApp/E-Mail kann das Formular nichts senden → ausblenden und
    // stattdessen ruhig auf einen Besuch im Studio verweisen (keine Platzhalter).
    if (!SHOW_MISSING && !hasWa && !hasMail) {
      form.hidden = true;
      var section = form.closest(".booking");
      if (section) section.classList.add("booking--visit");
      var lead = $("[data-booking-lead]");
      if (lead) lead.textContent = hasPhone
        ? "Rufen Sie uns an oder kommen Sie einfach vorbei – wir finden gemeinsam einen passenden Termin."
        : "Kommen Sie einfach im Studio vorbei – wir finden gemeinsam einen passenden Termin.";
      var visit = $("[data-booking-visit]");
      if (visit) {
        visit.innerHTML =
          '<div><span class="booking-visit__label">Studio</span><p>' + esc(biz.street) + "<br>" + esc(biz.zip + " " + biz.city) + "</p></div>" +
          '<div><span class="booking-visit__label">Öffnungszeiten</span><p>' + compactHours("<br>") + "</p></div>" +
          '<a class="btn btn--dark" href="' + esc("https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(biz.name + ", " + fullAddress)) + '" target="_blank" rel="noopener">Route planen</a>';
        visit.hidden = false;
      }
    }

    var lastSubmitter = null;
    form.addEventListener("click", function (e) { var b = e.target.closest("[data-send]"); if (b) lastSubmitter = b.getAttribute("data-send"); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var via = (e.submitter && e.submitter.getAttribute("data-send")) || lastSubmitter;
      var data = new FormData(form);
      var bad = [];
      ["service", "date", "name"].forEach(function (k) {
        var el = form.elements[k];
        var ok = String(data.get(k) || "").trim() !== "";
        el.setAttribute("aria-invalid", ok ? "false" : "true");
        if (!ok) bad.push(el);
      });
      if (bad.length) { status.textContent = "Bitte Leistung, Wunschdatum und Name angeben."; bad[0].focus(); return; }

      var dt = new Date(data.get("date") + "T12:00:00");
      var dateStr = dt.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" });
      var msg = "Hallo " + biz.name + ",\n\nich möchte gern einen Termin anfragen:\n\n" +
        "Leistung: " + data.get("service") + "\n" +
        "Wunschdatum: " + dateStr + " (" + data.get("time") + ")\n" +
        "Name: " + data.get("name") + "\n" +
        (String(data.get("note") || "").trim() ? "Anmerkung: " + data.get("note") + "\n" : "") +
        "\nVielen Dank!";

      if (via === "whatsapp" && hasWa) {
        window.open("https://wa.me/" + contact.whatsapp.replace(/\D/g, "") + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
        status.textContent = "WhatsApp wird geöffnet – bitte die Nachricht dort absenden.";
      } else if (via === "email" && hasMail) {
        window.location.href = "mailto:" + contact.email + "?subject=" + encodeURIComponent("Terminanfrage – " + data.get("service")) + "&body=" + encodeURIComponent(msg);
        status.textContent = "Ihr E-Mail-Programm wird geöffnet – bitte die Nachricht dort absenden.";
      }
    });
  }

  /* ---------- Karte (2-Klick, DSGVO) ---------- */
  function initMap() {
    var map = $("[data-map]");
    if (!map) return;
    (function () {
      var f = doc.createElement("iframe");
      f.src = "https://www.google.com/maps?q=" + encodeURIComponent(biz.name + ", " + fullAddress) + "&output=embed";
      f.title = "Karte: " + biz.name + ", " + fullAddress;
      f.loading = "lazy";
      f.referrerPolicy = "no-referrer-when-downgrade";
      // Pin-Platzhalter bleibt sichtbar, bis die Karte da ist, dann sanft einblenden
      f.style.opacity = "0";
      f.style.transition = "opacity .6s ease";
      f.addEventListener("load", function () {
        f.style.opacity = "1";
        var ph = $(".map__consent", map);
        setTimeout(function () { if (ph) ph.remove(); }, 700);
      });
      map.appendChild(f);
    })();
  }

  /* ---------- Strukturierte Daten (Local SEO) ---------- */
  function injectSchema() {
    var groups = {};
    hours.forEach(function (h) {
      if (!known(h)) return;
      var k = h.open + "-" + h.close;
      (groups[k] = groups[k] || { "@type": "OpeningHoursSpecification", dayOfWeek: [], opens: h.open, closes: h.close }).dayOfWeek.push(DAY_EN[h.dow]);
    });
    var data = {
      "@context": "https://schema.org",
      "@type": "NailSalon",
      name: biz.name,
      address: { "@type": "PostalAddress", streetAddress: biz.street, postalCode: biz.zip, addressLocality: biz.city, addressCountry: biz.country },
      areaServed: "Köln",
      openingHoursSpecification: Object.keys(groups).map(function (k) { return groups[k]; }),
      makesOffer: (C.services || []).map(function (s) { return { "@type": "Offer", itemOffered: { "@type": "Service", name: s.title } }; })
    };
    if (isSet(biz.siteUrl)) { data.url = biz.siteUrl; data.logo = biz.siteUrl.replace(/\/?$/, "/") + "assets/img/klara-logo.svg"; }
    if (isSet(contact.phone)) data.telephone = contact.phone;
    if (isSet(contact.email)) data.email = contact.email;
    var same = [contact.instagram, contact.facebook].filter(isSet);
    if (same.length) data.sameAs = same;
    var s = doc.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(data);
    doc.head.appendChild(s);
  }

  /* ---------- Header, Navigation ---------- */
  function initHeader() {
    var header = $("[data-header]");
    var toggle = $("[data-menu-toggle]");
    var nav = $("[data-nav]");
    var mobileBar = $("[data-mobile-bar]");
    var hero = $(".hero");
    var booking = $("#termin");
    var floatEl = $(".hero__photo--small");
    var ticking = false;

    function onScroll() {
      var y = window.scrollY;
      header.classList.toggle("is-scrolled", y > 10);
      if (mobileBar && hero) {
        var past = y > hero.offsetHeight * 0.7;
        var r = booking ? booking.getBoundingClientRect() : null;
        var inBooking = r && r.top < window.innerHeight && r.bottom > 0;
        mobileBar.classList.toggle("is-visible", past && !inBooking && !doc.body.classList.contains("nav-open"));
      }
      if (floatEl && !reduceMotion && window.innerWidth > 860 && y < window.innerHeight * 1.2) {
        floatEl.style.transform = "translate3d(0," + (y * -0.12).toFixed(1) + "px,0)";
      }
      ticking = false;
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();

    function setMenu(open) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      doc.body.classList.toggle("nav-open", open);
      if (open) { var first = $("a", nav); if (first) first.focus(); }
    }
    toggle.addEventListener("click", function () { setMenu(toggle.getAttribute("aria-expanded") !== "true"); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); toggle.focus(); }
    });

    // Aktiven Abschnitt in der Navigation markieren
    if ("IntersectionObserver" in window) {
      var links = $$(".nav ul a");
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          links.forEach(function (a) {
            if (a.getAttribute("href") === "#" + e.target.id) a.setAttribute("aria-current", "true");
            else a.removeAttribute("aria-current");
          });
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      links.forEach(function (a) { var s = $(a.getAttribute("href")); if (s) io.observe(s); });
    }
  }

  /* ---------- Scroll-Reveal ---------- */
  function initReveal() {
    var els = $$(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("is-visible"); }); return; }
    els.forEach(function (el) {
      var sibs = $$(":scope > .reveal", el.parentElement);
      var i = sibs.indexOf(el);
      if (i > 0) el.style.setProperty("--d", Math.min(i * 0.08, 0.48) + "s");
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Lightbox ---------- */
  function initLightbox() {
    var dlg = $("[data-lightbox]");
    if (!dlg || typeof dlg.showModal !== "function") {
      // Fallback: Bild in neuem Tab öffnen
      doc.addEventListener("click", function (e) {
        var t = e.target.closest("[data-lightbox-open]");
        if (t) window.open(t.getAttribute("data-lightbox-open"), "_blank", "noopener");
      });
      return;
    }
    var img = $("[data-lightbox-img]", dlg);
    var cap = $("[data-lightbox-text]", dlg);
    var prev = $("[data-lightbox-prev]", dlg), next = $("[data-lightbox-next]", dlg);
    var group = [], idx = 0, opener = null;

    function show(t) {
      img.src = t.getAttribute("data-lightbox-open");
      img.alt = t.getAttribute("data-lightbox-alt") || "";
      var c = t.getAttribute("data-lightbox-caption") || "";
      cap.textContent = c + (group.length > 1 ? (c ? " · " : "") + (idx + 1) + " / " + group.length : "");
      cap.hidden = !cap.textContent;
    }
    function step(d) {
      if (group.length < 2) return;
      idx = (idx + d + group.length) % group.length;
      show(group[idx]);
    }
    doc.addEventListener("click", function (e) {
      var t = e.target.closest("[data-lightbox-open]");
      if (!t) return;
      var g = t.getAttribute("data-lightbox-group");
      // Nur sichtbare Bilder der Gruppe durchblättern
      group = g ? $$('[data-lightbox-group="' + g + '"]').filter(function (el) { return !el.closest("[hidden]"); }) : [t];
      idx = Math.max(0, group.indexOf(t));
      dlg.classList.toggle("is-single", group.length < 2);
      opener = t;
      show(t);
      dlg.showModal();
    });
    prev.addEventListener("click", function () { step(-1); });
    next.addEventListener("click", function () { step(1); });
    dlg.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    });
    // Wischen auf Touch-Geräten
    var sx = null;
    dlg.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    dlg.addEventListener("touchend", function (e) {
      if (sx == null) return;
      var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    });
    $("[data-lightbox-close]", dlg).addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("close", function () { if (opener) opener.focus(); });
  }

  /* ---------- Preloader ---------- */
  function initPreloader() {
    var root = document.documentElement;
    var el = $("[data-preloader]");
    if (!el || !root.classList.contains("is-loading")) { if (el) el.remove(); return; }
    var bar = $("[data-preloader-bar]", el), count = $("[data-preloader-count]", el);
    var start = performance.now(), MIN = 1500, shown = 0, loaded = false, done = false;

    function finish() {
      if (done) return; done = true;
      el.classList.add("is-leaving");
      setTimeout(function () { root.classList.remove("is-loading"); }, 450);
      setTimeout(function () { el.remove(); }, 1600);
    }
    function tick(now) {
      var t = now - start;
      // bis zum load-Event langsam gegen 90 % kriechen, danach zügig auf 100 %
      var target = loaded && t >= MIN ? 100 : Math.min(90, (t / MIN) * 90);
      shown += (target - shown) * (loaded ? 0.16 : 0.08);
      if (target === 100 && 100 - shown < 0.5) shown = 100;
      bar.style.transform = "scaleX(" + (shown / 100) + ")";
      count.textContent = Math.round(shown);
      if (shown === 100) { setTimeout(finish, 250); return; }
      requestAnimationFrame(tick);
    }
    if (document.readyState === "complete") loaded = true;
    else window.addEventListener("load", function () { loaded = true; });
    setTimeout(function () { loaded = true; }, 5000); // langsame Netze nicht ewig warten lassen
    requestAnimationFrame(tick);
  }

  /* ---------- Start ---------- */
  initPreloader();
  renderHours();
  renderServices();
  renderPrices();
  renderGallery();
  renderContact();
  renderBooking();
  initMap();
  injectSchema();
  initHeader();
  initReveal();
  initLightbox();
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  setInterval(renderHours, 60 * 1000);
})();
