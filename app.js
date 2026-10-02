/**
 * THE SMOKE FARM — Official Interactive Vault Script
 */

// ============================================================================
// CONFIGURATION: Customize links easily here
// ============================================================================
const CONFIG = {
  brandName: "THE SMOKE FARM",
  telegramUrl: "https://t.me/TheSmokeFarm",
  signalUrl: "https://signal.me/#eu/TheSmokeFarm"
};

// ============================================================================
// DEFAULT VIDEO DATABASE: Fallback if JSON fetch is offline
// ============================================================================
const DEFAULT_PRODUCTS = [
  {
    id: "ash-1",
    category: "ash",
    title: "TSF ASH SELECTION #1",
    videoSrc: "assets/videos/ash-video-1.mp4",
    availability: "Disponibile su Lista Privata",
    description: "Selezione speciale The Smoke Farm. Estrazione artigianale ad altissima densità terpenica, morbida e resinosa, aroma marcato e finitura scenica di primo livello.",
    tags: ["SPECIAL EXTRACTION", "TOP BATCH"]
  },
  {
    id: "ash-2",
    category: "ash",
    title: "TSF ASH SELECTION #2",
    videoSrc: "assets/videos/ash-video-2.mp4",
    availability: "Disponibile su Lista Privata",
    description: "Static Sift a grana purissima selezionata. Struttura compatta e lavorabile, profilo aromatico denso con apertura gassosa e scia duratura.",
    tags: ["STATIC SIFT", "PREMIUM CUT"]
  },
  {
    id: "weed-1",
    category: "weed",
    title: "ZUSHI x COOKIES",
    videoSrc: "",
    availability: "Drop in Arrivo",
    description: "Selezione Cali Indoor. Cime dense e croccanti cariche di tricomi brillanti, bouquet dolce e cremoso con spinta energica.",
    tags: ["CALI INDOOR", "TOP SHELF"]
  },
  {
    id: "weed-2",
    category: "weed",
    title: "RUNTZ 2.0",
    videoSrc: "",
    availability: "Drop in Arrivo",
    description: "Incrocio californiano esotico. Gusto tropicale caramellato candy-gas, fumo denso e chiusura vellutata.",
    tags: ["CALI EXOTIC", "CANDY GAS"]
  },
  {
    id: "ice-1",
    category: "ice",
    title: "TROPICANA ICE 90u",
    videoSrc: "",
    availability: "Drop in Arrivo",
    description: "Ice Water Hash 90u di prima battuta. Fusione a 6 stelle, zero residuo, note tropicali fresche e pienezza aromatica assoluta.",
    tags: ["90u FIRST WASH", "COLD CURE"]
  },
  {
    id: "ice-2",
    category: "ice",
    title: "SUPER BOOF ICE",
    videoSrc: "",
    availability: "Drop in Arrivo",
    description: "Ice Full Spectrum a freddo controllato. Profilo arancia rossa e frutti di bosco, presenza scenica e resa pura.",
    tags: ["FULL SPECTRUM", "HEAVY MELT"]
  }
];

let productsDatabase = {};
let allProductsList = [];

function registerProducts(list) {
  allProductsList = list;
  productsDatabase = {};
  list.forEach((item) => {
    productsDatabase[item.id] = item;
  });
}

// Inizializza con i prodotti di default
registerProducts(DEFAULT_PRODUCTS);

// ============================================================================
// DOM ELEMENTS
// ============================================================================
const catalogModal = document.getElementById("catalogModal");
const catalogModalClose = document.getElementById("catalogModalClose");
const vaultBackBtn = document.getElementById("vaultBackBtn");
const vaultCategoryTitle = document.getElementById("vaultCategoryTitle");
const vaultTabs = document.querySelectorAll(".vault-tab");
const videoGrid = document.getElementById("videoGrid");

const videoDrawer = document.getElementById("videoDrawer");
const drawerBackdrop = document.getElementById("drawerBackdrop");
const drawerClose = document.getElementById("drawerClose");
const drawerMediaWrap = document.getElementById("drawerMediaWrap");
const drawerBadge = document.getElementById("drawerBadge");
const drawerAvailText = document.getElementById("drawerAvailText");
const drawerTitle = document.getElementById("drawerTitle");
const drawerDescription = document.getElementById("drawerDescription");
const drawerTags = document.getElementById("drawerTags");
const drawerTelegramBtn = document.getElementById("drawerTelegramBtn");
const drawerSignalBtn = document.getElementById("drawerSignalBtn");

// ============================================================================
// DYNAMIC PRODUCTS LOADER
// ============================================================================
async function loadDynamicProducts() {
  try {
    const res = await fetch("data/products.json?v=" + Date.now());
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        registerProducts(data);
      }
    }
  } catch (err) {
    // offline o fallback locale
  }

  // Controlla se l'admin ha salvato drop recenti in localStorage (preview immediata)
  try {
    const custom = localStorage.getItem("tsf_custom_products");
    if (custom) {
      const parsed = JSON.parse(custom);
      if (Array.isArray(parsed) && parsed.length > 0) {
        registerProducts(parsed);
      }
    }
  } catch (e) {}

  renderCategoryGrid();
}

/**
 * Renderizza le card video nella pagina di categoria
 */
function renderCategoryGrid() {
  if (!videoGrid) return;
  const targetCategory = videoGrid.getAttribute("data-category");
  if (!targetCategory) return; // Non è una pagina categoria (es. index.html)

  const filtered = allProductsList.filter(
    (item) => item.category && item.category.toLowerCase() === targetCategory.toLowerCase()
  );

  if (!filtered.length) return;

  videoGrid.innerHTML = filtered
    .map((item) => {
      const isVideo = Boolean(item.videoSrc);
      const catUpper = item.category.toUpperCase();
      let badgeClass = "badge-" + item.category.toLowerCase();
      let emoji = catUpper === "ASH" ? "🔥" : catUpper === "WEED" ? "🌿" : "❄️";

      let mediaHtml = "";
      if (isVideo) {
        mediaHtml = `
          <video src="${item.videoSrc}" muted loop playsinline preload="metadata"></video>
          <div class="video-card__badge ${badgeClass}">${catUpper} ${emoji}</div>
          <div class="video-card__play-hint">
            <div class="play-icon">▶</div>
          </div>
        `;
      } else {
        let bgClass = catUpper === "WEED" ? "weed-bg" : "ice-bg";
        mediaHtml = `
          <div class="placeholder-visual ${bgClass}">
            <span class="placeholder-emoji">${emoji}</span>
            <span class="placeholder-label">${item.availability || "DROP IN ARRIVO"}</span>
          </div>
          <div class="video-card__badge ${badgeClass}">${catUpper} ${emoji}</div>
          <div class="video-card__play-hint">
            <div class="play-icon">ℹ️</div>
          </div>
        `;
      }

      const tagsHtml = (item.tags || [])
        .map((tag) => `<span>${tag}</span>`)
        .join("");

      return `
        <article class="video-card" data-video-id="${item.id}" role="button" tabindex="0">
          <div class="video-card__media ${isVideo ? "" : "placeholder-media"}">
            ${mediaHtml}
          </div>
          <div class="video-card__body">
            <div class="video-card__meta">
              ${tagsHtml}
            </div>
            <h3 class="video-card__title">${item.title}</h3>
            <p class="video-card__desc">${item.description}</p>
          </div>
        </article>
      `;
    })
    .join("");

  bindVideoCardEvents();
  initPreviewObserver();
}

function bindVideoCardEvents() {
  document.querySelectorAll(".video-card").forEach((card) => {
    card.addEventListener("click", () => {
      const videoId = card.getAttribute("data-video-id");
      openDrawer(videoId);
    });

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const videoId = card.getAttribute("data-video-id");
        openDrawer(videoId);
      }
    });

    // Hover play
    const video = card.querySelector("video");
    if (video) {
      card.addEventListener("mouseenter", () => {
        video.play().catch(() => {});
      });
    }
  });
}

// ============================================================================
// INTERSECTION OBSERVER FOR PREVIEW VIDEOS
// ============================================================================
let previewObserver = null;

function initPreviewObserver() {
  const videos = document.querySelectorAll(".video-card__media video");
  if (!videos.length) return;

  if (previewObserver) {
    previewObserver.disconnect();
  }

  previewObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting && !video.closest(".video-card.is-hidden")) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    },
    {
      root: null, // Natural document viewport scroll
      threshold: 0.2
    }
  );

  videos.forEach((video) => previewObserver.observe(video));
}

// ============================================================================
// VIDEO DRAWER / DETAIL MODAL
// ============================================================================
function openDrawer(videoId) {
  const item = productsDatabase[videoId];
  if (!item) return;

  // Set Media
  if (item.videoSrc) {
    drawerMediaWrap.innerHTML = `
      <video src="${item.videoSrc}" controls autoplay playsinline loop></video>
    `;
    const video = drawerMediaWrap.querySelector("video");
    if (video) video.play().catch(() => {});
  } else {
    // Coming soon placeholder
    const cat = (item.category || "").toUpperCase();
    const emoji = cat === "WEED" ? "🌿" : cat === "ICE" ? "❄️" : "🔥";
    const bgClass = cat === "WEED" ? "weed-bg" : "ice-bg";
    drawerMediaWrap.innerHTML = `
      <div class="placeholder-visual ${bgClass}">
        <span class="placeholder-emoji">${emoji}</span>
        <span class="placeholder-label">${item.availability || "DROP IN ARRIVO"}</span>
      </div>
    `;
  }

  // Set Info
  drawerBadge.textContent = (item.category || "").toUpperCase();
  drawerAvailText.textContent = item.availability || "Disponibile su Lista Privata";
  drawerTitle.textContent = item.title;
  drawerDescription.textContent = item.description;

  // Set Tags
  drawerTags.innerHTML = (item.tags || []).map((tag) => `<span>${tag}</span>`).join("");

  // Set Direct Contact Link Parameters
  const message = encodeURIComponent(`Ciao, vorrei maggiori dettagli su: ${item.title}`);
  if (drawerTelegramBtn) {
    drawerTelegramBtn.href = `${CONFIG.telegramUrl}?text=${message}`;
  }
  if (drawerSignalBtn) {
    drawerSignalBtn.href = CONFIG.signalUrl;
  }

  videoDrawer.classList.add("is-open");
  videoDrawer.setAttribute("aria-hidden", "false");
}

function closeDrawer() {
  if (!videoDrawer) return;
  videoDrawer.classList.remove("is-open");
  videoDrawer.setAttribute("aria-hidden", "true");

  setTimeout(() => {
    if (!videoDrawer.classList.contains("is-open")) {
      drawerMediaWrap.innerHTML = "";
    }
  }, 250);
}

// Close drawer listeners
if (drawerClose) drawerClose.addEventListener("click", closeDrawer);
if (drawerBackdrop) drawerBackdrop.addEventListener("click", closeDrawer);

// Keyboard Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && videoDrawer && videoDrawer.classList.contains("is-open")) {
    closeDrawer();
  }
});

// ============================================================================
// INITIALIZATION
// ============================================================================
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    bindVideoCardEvents();
    loadDynamicProducts();
  });
} else {
  bindVideoCardEvents();
  loadDynamicProducts();
}
