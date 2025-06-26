console.log("🔧 JavaScript is running!");
let diagramData = [];
let currentId = "";

// Lädt ein SVG in den Container
function loadSVG(path, phaseId = "") {
  console.log(`📄 Lade SVG: ${path}`);
  fetch(path)
    .then(res => res.text())
    .then(svgText => {
      const container = document.getElementById("uml-container");
      container.innerHTML = svgText;
      currentId = phaseId;

      const entry = diagramData.find(d => d.id === phaseId);
      if (entry && entry.umlWidth) {
        document.documentElement.style.setProperty('--uml-width', entry.umlWidth);
        console.log(`📏 Set UML width to ${entry.umlWidth} for phase ${phaseId}`);
      } else {
        document.documentElement.style.setProperty('--uml-width', '30%');
        console.log("📏 Set UML width to default (30%)");
      }
      

      if (phaseId) updateInfoPanel(phaseId);
      setTimeout(() => attachInteractivity(), 20);
    })
    .catch(err => console.error("❌ Fehler beim Laden der SVG:", err));
    window.location.hash = phaseId;
    console.log(`🔗 URL-Hash aktualisiert: ${window.location.hash}`)  ;
}


// Aktualisiert das Info-Panel
function updateInfoPanel(phaseId) {
  const panel = document.getElementById("info-panel");
  const item = diagramData.find(d => d.id === phaseId);
  if (!item || !panel) {
    console.warn("⚠️ Kein Panel oder Phase gefunden:", phaseId);
    panel.style.display = "none";
    return;
  }

  const mdPath = `data/content/${phaseId}.md`;
  console.log(`📥 Lade Markdown-Datei: ${mdPath}`);

  fetch(mdPath)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} – Datei nicht gefunden?`);
      }
      return res.text();
    })
    .then(markdown => {
      console.log("✅ Markdown erfolgreich geladen:", markdown.slice(0, 100) + "...");
      const html = marked.parse(markdown);
      panel.innerHTML = `<h2>${item.title}</h2>${html}`;
      panel.style.display = "block";
    })
    .catch(err => {
      console.error("Fehler beim Laden oder Parsen der Markdown-Datei:", err);
      panel.innerHTML = `<h2>${item.title}</h2><p><i>No content found for this phase.</i></p>`;
      panel.style.display = "block";
    });
}

// Fügt Interaktivität und Highlighting zu SVG-Elementen hinzu
function attachInteractivity() {
  const svg = document.querySelector("#uml-container svg");
  if (!svg) {
    console.warn("Kein SVG im Container gefunden.");
    return;
  }

  console.log("Füge Interaktivität hinzu...");

  // Sicherstellen, dass eine Gruppe für Overlays vorhanden ist
  let overlayGroup = svg.querySelector("#overlays");
  if (!overlayGroup) {
    overlayGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    overlayGroup.setAttribute("id", "overlays");
    svg.insertBefore(overlayGroup, svg.firstChild); // ganz nach vorne
  }

  diagramData.forEach(entry => {
    // Element per ID oder serif:id finden
    let el = svg.getElementById(entry.id);
    if (!el) {
      el = svg.querySelector(`[serif\\:id="${entry.id}"]`);
      if (!el) {
        console.warn(`Element mit ID ${entry.id} nicht gefunden`);
        return;
      } else {
        console.log(`Element für ${entry.id} über serif:id gefunden`);
      }
    } else {
      console.log(`Element für ${entry.id} über id gefunden`);
    }

    el.style.cursor = "pointer";
    el.setAttribute("pointer-events", "bounding-box");

    // Box bestimmen
    let bbox;
    try {
      bbox = el.getBBox();
    } catch (e) {
      console.warn(`⚠️ getBBox() fehlgeschlagen für ${entry.id}:`, e);
      return;
    }

    console.log(`📦 BBox für ${entry.id}:`, bbox);

    // Overlay zeichnen
    const overlay = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    overlay.setAttribute("x", bbox.x - 4);
    overlay.setAttribute("y", bbox.y - 2);
    overlay.setAttribute("width", bbox.width + 8);
    overlay.setAttribute("height", bbox.height + 4);
    overlay.setAttribute("fill", entry.color || "#d7d7cd");
    overlay.setAttribute("opacity", "0.2");
    overlay.setAttribute("pointer-events", "none");
    svg.appendChild(overlay);
    console.log(`🟢 Overlay für ${entry.id} hinzugefügt.`);

    // Klicklogik
    el.addEventListener("click", () => {
      const isCurrent = (entry.id === currentId);
      const target = isCurrent
        ? diagramData.find(p => p.id !== entry.id && entry.group && p.id === entry.group)
        : diagramData.find(d => d.id === entry.id);

      if (target) {
        loadSVG(target.svg, target.id);
      } else {
        const root = diagramData.find(p => p.id === "nav");
        if (root) loadSVG(root.svg, root.id);
      }
    });
  });
}

// Beim Laden der Seite initial starten
window.addEventListener("load", () => {
  fetch("data/structure.json")
    .then(res => res.json())
    .then(json => {
      diagramData = json;
      // Hash auslesen:
      const hashId = window.location.hash ? window.location.hash.slice(1) : null;
      let start;
      if (hashId && diagramData.some(d => d.id === hashId)) {
        start = diagramData.find(d => d.id === hashId);
      } else {
        start = diagramData.find(d => d.id === "nav");
      }
      if (start) {
        loadSVG(start.svg, start.id);
      } else {
        console.error("❌ Kein Startpunkt gefunden.");
      }
    })
    .catch(err => console.error("❌ Fehler beim Laden der JSON:", err));
});