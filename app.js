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
// VIDEO DATABASE: Details for the drawer & video player
// ============================================================================
const VIDEO_DATABASE = {
  "ash-1": {
    category: "ASH",
    title: "TSF ASH SELECTION #1",
    videoSrc: "assets/videos/ash-video-1.mp4",
    availability: "Disponibile su Lista Privata",
    description: "Selezione speciale The Smoke Farm. Estrazione artigianale ad altissima densità terpenica, morbida e resinosa, aroma marcato e finitura scenica di primo livello.",
    tags: ["Special Extraction", "Terpene Blast", "Top Batch", "Private Reserve"]
  },
  "ash-2": {
    category: "ASH",
    title: "TSF ASH SELECTION #2",
    videoSrc: "assets/videos/ash-video-2.mp4",
    availability: "Disponibile su Lista Privata",
    description: "Static Sift a grana purissima selezionata. Struttura compatta e lavorabile, profilo aromatico denso con apertura gassosa e scia duratura.",
    tags: ["Static Sift", "Selected Grain", "Gassy Aroma", "Clean Melt"]
  },
  "weed-1": {
    category: "WEED",
    title: "ZUSHI x COOKIES",
    videoSrc: null,
    availability: "Drop in Arrivo",
    description: "Selezione Cali Indoor. Cime dense e croccanti cariche di tricomi brillanti, bouquet dolce e cremoso con spinta energica.",
    tags: ["Cali Indoor", "Top Shelf", "Zushi Cut", "Frosty"]
  },
  "weed-2": {
    category: "WEED",
    title: "RUNTZ 2.0",
    videoSrc: null,
    availability: "Drop in Arrivo",
    description: "Incrocio californiano esotico. Gusto tropicale caramellato candy-gas, fumo denso e chiusura vellutata.",
    tags: ["Candy Gas", "Exotic Line", "Heavy Trichomes"]
  },
  "ice-1": {
    category: "ICE",
    title: "TROPICANA ICE 90u",
    videoSrc: null,
    availability: "Drop in Arrivo",
    description: "Ice Water Hash 90u di prima battuta. Fusione a 6 stelle, zero residuo, note tropicali fresche e pienezza aromatica assoluta.",
    tags: ["90u First Wash", "Cold Melt", "Tropical Terps", "6 Stars"]
  },
  "ice-2": {
    category: "ICE",
    title: "SUPER BOOF ICE",
    videoSrc: null,
    availability: "Drop in Arrivo",
    description: "Ice Full Spectrum a freddo controllato. Profilo arancia rossa e frutti di bosco, presenza scenica e resa pura.",
    tags: ["Full Spectrum", "Ice Water", "Super Boof", "Citrus Punch"]
  }
};

// ============================================================================
// DOM ELEMENTS
// ============================================================================
const catalogModal = document.getElementById("catalogModal");
const catalogModalClose = document.getElementById("catalogModalClose");
const vaultBackBtn = document.getElementById("vaultBackBtn");
const vaultCategoryTitle = document.getElementById("vaultCategoryTitle");
const vaultTabs = document.querySelectorAll(".vault-tab");
const videoCards = document.querySelectorAll(".video-card");

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
// CATALOG MODAL & FILTERING
// ============================================================================
const CATEGORY_TITLES = {
  ash: "ASH VAULT",
  weed: "WEED VAULT",
  ice: "ICE VAULT",
  all: "OFFICIAL VAULT"
};

/**
 * Filter video cards according to category
 */
function filterCategory(category) {
  videoCards.forEach((card) => {
    const cardCat = card.getAttribute("data-category");
    if (category === "all" || cardCat === category) {
      card.classList.remove("is-hidden");
    } else {
      card.classList.add("is-hidden");
      // Pause any video inside hidden cards
      const video = card.querySelector("video");
      if (video) video.pause();
    }
  });

  // Update Category Title
  if (vaultCategoryTitle) {
    vaultCategoryTitle.textContent = CATEGORY_TITLES[category] || "OFFICIAL VAULT";
  }

  // Update active tab button
  vaultTabs.forEach((tab) => {
    const tabCat = tab.getAttribute("data-tab");
    tab.classList.toggle("is-active", tabCat === category);
  });
}

/**
 * Open the full Video Vault
 */
function openVault(category = "ash") {
  filterCategory(category);
  catalogModal.classList.add("is-open");
  catalogModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  catalogModal.scrollTop = 0;
  initPreviewObserver();
}

/**
 * Close the full Video Vault
 */
function closeVault() {
  catalogModal.classList.remove("is-open");
  catalogModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");

  // Pause all preview videos
  document.querySelectorAll(".video-card__media video").forEach((v) => v.pause());
  closeDrawer();
}

// Hook up category buttons on Hero
document.querySelectorAll(".nav-btn[data-category]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const cat = btn.getAttribute("data-category");
    openVault(cat);
  });
});

// Hook up close & back buttons in Vault
if (catalogModalClose) {
  catalogModalClose.addEventListener("click", closeVault);
}
if (vaultBackBtn) {
  vaultBackBtn.addEventListener("click", closeVault);
}

// Hook up category tabs inside Vault
vaultTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const cat = tab.getAttribute("data-tab");
    filterCategory(cat);
  });
});

// ============================================================================
// INTERSECTION OBSERVER FOR PREVIEW VIDEOS
// ============================================================================
let previewObserver = null;

function initPreviewObserver() {
  if (previewObserver) return;

  const videos = document.querySelectorAll(".video-card__media video");
  if (!videos.length) return;

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

// Automatically start observing on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPreviewObserver);
} else {
  initPreviewObserver();
}

// Hover play support for desktop
videoCards.forEach((card) => {
  const video = card.querySelector("video");
  if (!video) return;

  card.addEventListener("mouseenter", () => {
    video.play().catch(() => {});
  });
});

// ============================================================================
// VIDEO DRAWER / DETAIL MODAL
// ============================================================================
function openDrawer(videoId) {
  const item = VIDEO_DATABASE[videoId];
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
    const emoji = item.category === "WEED" ? "🌿" : "❄️";
    const bgClass = item.category === "WEED" ? "weed-bg" : "ice-bg";
    drawerMediaWrap.innerHTML = `
      <div class="placeholder-visual ${bgClass}">
        <span class="placeholder-emoji">${emoji}</span>
        <span class="placeholder-label">DROP IN ARRIVO</span>
      </div>
    `;
  }

  // Set Info
  drawerBadge.textContent = item.category;
  drawerAvailText.textContent = item.availability;
  drawerTitle.textContent = item.title;
  drawerDescription.textContent = item.description;

  // Set Tags
  drawerTags.innerHTML = item.tags.map((tag) => `<span>${tag}</span>`).join("");

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

  // Clear video element to stop playback
  setTimeout(() => {
    if (!videoDrawer.classList.contains("is-open")) {
      drawerMediaWrap.innerHTML = "";
    }
  }, 250);
}

// Hook up cards to open drawer
videoCards.forEach((card) => {
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
});

// Close drawer listeners
if (drawerClose) drawerClose.addEventListener("click", closeDrawer);
if (drawerBackdrop) drawerBackdrop.addEventListener("click", closeDrawer);

// ============================================================================
// KEYBOARD NAVIGATION (ESCAPE KEY)
// ============================================================================
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (videoDrawer.classList.contains("is-open")) {
      closeDrawer();
    } else if (catalogModal.classList.contains("is-open")) {
      closeVault();
    }
  }
});
