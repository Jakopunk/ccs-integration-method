console.log("JavaScript is running!");

// Phase-bezogene Inhalte
const phaseInfo = {
  ccs_selection: {
    title: "CCS Selection Process",
    html: `
      <p>This phase filters out product types unsuitable for CCS integration.</p>
      <ul>
        <li>Worn or carried products → excluded</li>
        <li>Insufficient volume → excluded</li>
        <li>Safety or environmental constraints</li>
      </ul>
      <div class="example-box">
        <strong>Example:</strong><br>
        Wall-mounted devices are feasible; smartwatches are not.
      </div>
    `
  },
  pcf_evaluation: {
    title: "PCF Evaluation",
    html: `
      <p>Determines whether CCS compensation is needed, based on the product carbon footprint.</p>
      <ul>
        <li>Life cycle inventory (LCI)</li>
        <li>Annualised CO₂ output over 10-year lifetime</li>
      </ul>
    `
  },
  detail_01: {
    title: "Initial Assessment (Detailed)",
    html: `
      <p>Decision tree logic applied to determine CCS feasibility for the product category.</p>
    `
  }
};

// Lädt ein neues SVG in den uml-container
function loadSVG(path, phaseId = "") {
  fetch(path)
    .then(res => res.text())
    .then(svgText => {
      const container = document.getElementById("uml-container");
      container.innerHTML = svgText;

      // Info-Panel aktualisieren (wenn Phase angegeben)
      if (phaseId) updateInfoPanel(phaseId);

      // Nach kurzem Timeout: Interaktivität erneut aktivieren
      setTimeout(() => {
        attachInteractivity();
      }, 20);
    })
    .catch(err => console.error("Fehler beim Laden der SVG:", err));
}

// Initialer Aufruf bei Seitenstart
window.addEventListener("load", () => {
  attachInteractivity();
  updateInfoPanel("ccs_selection"); // Start-Ansicht
});

// Setzt die Inhalte des Info-Panels je nach Phase
function updateInfoPanel(phaseId) {
  const panel = document.getElementById("info-panel");
  const content = phaseInfo[phaseId];

  if (!panel || !content) {
    console.warn("Keine Info für Phase:", phaseId);
    panel.style.display = "none";
    return;
  }

  panel.innerHTML = `
    <h2>${content.title}</h2>
    ${content.html}
  `;

  // Jetzt anzeigen
  panel.style.display = "block";
}

// Interaktivität setzen für SVG im uml-container
function attachInteractivity() {
  const svg = document.querySelector("#uml-container svg");
  if (!svg) {
    console.warn("Kein SVG im Container gefunden.");
    return;
  }

  const grp = svg.getElementById("ccs_selection");
  if (!grp) {
    console.warn("ID 'ccs_selection' nicht gefunden.");
    return;
  }

  grp.style.cursor = "pointer";
  grp.setAttribute("pointer-events", "bounding-box");

  const bbox = grp.getBBox();
  const overlay = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  overlay.setAttribute("x", bbox.x - 4);
  overlay.setAttribute("y", bbox.y - 2);
  overlay.setAttribute("width", bbox.width + 8);
  overlay.setAttribute("height", bbox.height + 4);
  overlay.setAttribute("fill", "#99dd99");
  overlay.setAttribute("opacity", "0.4");
  overlay.setAttribute("pointer-events", "none");

  svg.appendChild(overlay);

  grp.addEventListener("click", () => {
    console.log("Klick auf 'ccs_selection' → Wechsel zur Detailansicht");
    loadSVG("assets/images/01_1_CCS_Inital_Assesment.svg", "detail_01");
  });
}
