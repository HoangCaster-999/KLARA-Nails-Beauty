/* =====================================================================
   KLARA Nails & Beauty – INHALTE DER WEBSITE
   ---------------------------------------------------------------------
   Diese Datei ist die zentrale Stelle für alle Daten, die sich ändern:
   Kontakt, Öffnungszeiten, Leistungen, Preise, Galerie.

   Regeln:
   • Werte in [ECKIGEN KLAMMERN] sind Platzhalter. Solange ein Platzhalter
     drinsteht, ist die zugehörige Funktion (Anruf-, E-Mail-, Social-Button)
     automatisch AUSGEBLENDET. Einfach echten Wert eintragen → Button erscheint.
   • draft: true  → Vorschau-Modus: noch zu bestätigende Preis-
     angaben werden markiert (fehlende Kontaktdaten werden NIE angezeigt).
     Vor dem Veröffentlichen auf false setzen.
   ===================================================================== */

window.KLARA = {
  draft: false,

  business: {
    name: "KLARA Nails & Beauty",
    street: "Höninger Weg 208",
    zip: "50969",
    city: "Köln",
    country: "DE",
    countryName: "Deutschland",
    // Öffentliche Adresse der Website (für SEO), z. B. "https://www.klara-nails.de/"
    siteUrl: "[WEBSITE-URL]"
  },

  contact: {
    // Telefon im internationalen Format, z. B. "+49221123456"
    phone: "[TELEFON]",
    // Anzeige-Format, z. B. "0221 123 456"
    phoneDisplay: "[TELEFON]",
    // WhatsApp-Nummer ohne +/Leerzeichen, z. B. "49176123456" (optional)
    whatsapp: "[WHATSAPP]",
    email: "[E-MAIL]",
    instagram: "[INSTAGRAM-URL]",
    facebook: "[FACEBOOK-URL]",
    // Link zu einem Online-Buchungssystem (optional). Achtung: der QR-Code auf
    // der Original-Preisliste wurde NICHT geprüft und ist hier nicht eingetragen.
    bookingUrl: "https://klaranailsbeauty.setmore.com"
  },

  /* Öffnungszeiten. dow: 0 = Sonntag … 6 = Samstag.
     open/close: "HH:MM". Für Sonntag liegt noch keine Angabe vor → null
     (die Seite behauptet dann weder "geöffnet" noch "geschlossen"). */
  hours: [
    { dow: 1, day: "Montag",     open: "09:30", close: "19:00" },
    { dow: 2, day: "Dienstag",   open: "09:30", close: "19:00" },
    { dow: 3, day: "Mittwoch",   open: "09:30", close: "19:00" },
    { dow: 4, day: "Donnerstag", open: "09:30", close: "19:00" },
    { dow: 5, day: "Freitag",    open: "09:30", close: "19:00" },
    { dow: 6, day: "Samstag",    open: "09:30", close: "17:00" },
    { dow: 0, day: "Sonntag",    open: null,    close: null, placeholder: "[SONNTAG – BITTE ANGEBEN]" }
  ],

  /* Preise – übernommen aus KLARA-Preisliste.svg (abgeglichen mit dem Originalbild).
     Werte OHNE Währung eintragen; das Währungszeichen wird automatisch ergänzt,
     solange showCurrency true ist. */
  showCurrency: true,      // "€" hinter jedem Preis – bitte vom Studio bestätigen
  currencyConfirmed: false, // auf true setzen, wenn "€" bestätigt ist

  prices: [
    {
      id: "uv-gel-acryl",
      title: "UV-Gel / Acryl",
      // Originalbild zeigt "Autf | Neu". "Auffüllen" ist eine Lesart – bitte bestätigen.
      columns: [
        { label: "Auffüllen", unconfirmed: "Original: „Autf“" },
        { label: "Neu" }
      ],
      items: [
        { name: "Natur",            prices: ["30", "35"] },
        // Originalbild: "Faber - Babyboom" – Schreibweise bitte bestätigen
        { name: "Babyboomer",       prices: ["35", "40"], unconfirmed: "Original: „Faber - Babyboom“" },
        { name: "French",           prices: ["40", "45"] },
        { name: "Chrome / Cat Eyes", prices: [null, "+10"], surcharge: true },
        { name: "Mit Gel",          prices: [null, "+5"],  surcharge: true }
      ]
    },
    {
      id: "manikuere",
      title: "Maniküre",
      columns: [],
      items: [
        { name: "Maniküre",             prices: ["15"] },
        { name: "Maniküre mit Shellac", prices: ["35"] },
        { name: "Nur Shellac",          prices: ["25"] }
      ]
    },
    {
      id: "pedikuere",
      title: "Pediküre",
      columns: [],
      items: [
        { name: "Pediküre",             prices: ["30"] },
        { name: "Pediküre mit Shellac", prices: ["45"] },
        { name: "Nur Shellac",          prices: ["35"] },
        { name: "Mit Acryl",            prices: ["55"] },
        { name: "Nur Acryl",            prices: ["45"] }
      ]
    },
    {
      id: "extras",
      title: "Extras",
      columns: [],
      items: [
        { name: "Reparatur",        prices: ["ab 5"] },
        { name: "Ablösung",         prices: ["15"] },
        { name: "Strasssteine",     prices: ["ab 0,50"] },
        { name: "Design pro Nagel", prices: ["ab 2"] }
      ]
    },
    {
      id: "wimpern",
      title: "Wimpern",
      columns: [{ label: "Neu" }, { label: "2 Wochen" }, { label: "3 Wochen" }],
      items: [
        { name: "Classic",      prices: ["50", "40", "45"] },
        { name: "Volumen",      prices: ["60", "50", "55"] },
        { name: "Mega Volumen", prices: ["75", "60", "65"] }
      ]
    }
  ],

  /* Leistungen (Übersicht oben auf der Seite). priceRef = id aus "prices". */
  services: [
    {
      title: "Maniküre",
      text: "Gepflegte Hände in Form gebracht – klassisch oder mit Shellac für ein glänzendes, langanhaltendes Finish.",
      from: "15",
      priceRef: "manikuere"
    },
    {
      title: "Pediküre",
      text: "Pflege für die Füße – klassisch, mit Shellac oder mit Acryl.",
      from: "30",
      priceRef: "pedikuere"
    },
    {
      title: "UV-Gel & Acryl",
      text: "Natur, Babyboomer oder French – auf Wunsch veredelt mit Chrome- oder Cat-Eye-Effekt, Strasssteinen und Nail-Design.",
      from: "30",
      priceRef: "uv-gel-acryl"
    },
    {
      title: "Wimpern",
      text: "Wimpernverlängerung in Classic, Volumen oder Mega Volumen – vom natürlichen bis zum ausdrucksstarken Look.",
      from: "40",
      priceRef: "wimpern"
    }
  ],

  /* Galerie – echte Fotos (WebP, je 720 px und 1440 px breit, in assets/img/galerie/).
     src = Pfad zur 1440er-Datei; die kleinere "-720.webp"-Version wird automatisch genutzt.
     w/h = Seitenverhältnis (verhindert Springen beim Laden). Reihenfolge = Reihenfolge auf der Seite.
     Die ersten "galleryInitial" Bilder sind sofort sichtbar, der Rest über "Alle Arbeiten zeigen". */
  galleryInitial: 9,
  gallery: [
    { src: "assets/img/galerie/perlen-milchweiss-1440.webp",    w: 1024, h: 1536, label: "Perlen",        alt: "Milchweiße Mandel-Nägel mit Perlen und feinen Goldlinien" },
    { src: "assets/img/galerie/strass-square-1440.webp",        w: 1440, h: 1504, label: "Strass",        alt: "Lange Square-Nägel in Nude mit Strass und 3D-Schleifen" },
    { src: "assets/img/galerie/kirschbluete-french-1440.webp",  w: 1440, h: 1920, label: "Kirschblüte",   alt: "Rosa French-Nägel mit Kirschblüten-Design und Glitzersteinen" },
    { src: "assets/img/galerie/gold-chrome-1440.webp",          w: 1440, h: 1236, label: "Gold-Chrome",   alt: "Nude-Nägel mit goldenen Chrome-Ornamenten" },
    { src: "assets/img/galerie/babyboomer-1440.webp",           w: 1170, h: 1172, label: "Babyboomer",    alt: "Lange Square-Nägel im Babyboomer-Verlauf von Rosé zu Weiß" },
    { src: "assets/img/galerie/flammen-stiletto-1440.webp",     w: 1085, h: 1331, label: "Flammen",       alt: "Stiletto-Nägel mit buntem Flammen-Design und Blüten" },
    { src: "assets/img/galerie/marmor-gold-1440.webp",          w: 941,  h: 1672, label: "Marmor",        alt: "Mandel-Nägel in Milchweiß mit goldener Marmor-Optik" },
    { src: "assets/img/galerie/ornament-rot-1440.webp",         w: 1080, h: 1440, label: "Ornament",      alt: "Lange Stiletto-Nägel in Nude und Rot mit Ornament-Malerei" },
    { src: "assets/img/galerie/orange-french-1440.webp",        w: 1320, h: 1745, label: "Orange French", alt: "Nägel mit orangefarbener French-Spitze und 3D-Blüte" },
    { src: "assets/img/galerie/chrome-steine-1440.webp",        w: 1200, h: 1600, label: "Chrome & Steine", alt: "Mandel-Nägel mit Chrome-Spitzen und farbigen Schmucksteinen" },
    { src: "assets/img/galerie/french-gold-stiletto-1440.webp", w: 1170, h: 1569, label: "French Gold",   alt: "Stiletto-Nägel mit weißer French-Spitze und Gold-Akzenten" },
    { src: "assets/img/galerie/halloween-1440.webp",            w: 1164, h: 2048, label: "Halloween",     alt: "Halloween-Nail-Art mit Kürbis, Geist und schwarzer Katze" },
    { src: "assets/img/galerie/pastell-blueten-1440.webp",      w: 1090, h: 2048, label: "Pastell",       alt: "Nägel mit pastellfarbenen 3D-Blüten und Strass" },
    { src: "assets/img/galerie/nude-perlen-1440.webp",          w: 735,  h: 919,  label: "Nude & Perlen", alt: "Nude-Mandel-Nägel mit Perlen und goldenen Details" }
    /* Nicht eingebunden (enthalten Wasserzeichen fremder Namen, bitte Rechte klären):
       IMG_4576.JPG („Kenvin Trần“) und IMG_4624.JPG („Hoàng Hải“) im Projektordner „Ảnh móng tay (đã chỉnh sáng)“ */
  ]
};
