/**
 * WARZONE TRACKER - SYSTÈME DE RÉCOMPENSES, NIVEAUX & PERSONNALISATION
 * Fichier autonome prêt pour GitHub Pages / Hébergement statique
 */

const REWARDS_CONFIG = {
  // Paliers de Niveaux (XP requise)
  levels: [
    { level: 1,  xp: 0,      rank: "Recrue" },
    { level: 2,  xp: 2500,   rank: "Soldat" },
    { level: 3,  xp: 6000,   rank: "Caporal" },
    { level: 4,  xp: 12000,  rank: "Sergent" },
    { level: 5,  xp: 20000,  rank: "Lieutenant" },
    { level: 6,  xp: 32000,  rank: "Commandant" },
    { level: 7,  xp: 50000,  rank: "Général" },
    { level: 8,  xp: 75000,  rank: "Prestige 1" },
    { level: 9,  xp: 110000, rank: "Maître Prestige" },
    { level: 10, xp: 150000, rank: "Légende Warzone" }
  ],

  // 1. TITRES D'OPÉRATEUR
  titles: [
    { id: "t_default", name: "Opérateur Saison 1",     reqXP: 0,      rarity: "Commun" },
    { id: "t_hunter",  name: "Chasseur de Primes",     reqXP: 5000,   rarity: "Rare" },
    { id: "t_demon",   name: "Démon de la Résurgence", reqXP: 15000,  rarity: "Épique" },
    { id: "t_reaper",  name: "Faucheuse du Goulag",    reqXP: 35000,  rarity: "Épique" },
    { id: "t_nuke",    name: "Porteur de Bombe Nuke",  reqXP: 75000,  rarity: "Légendaire" },
    { id: "t_iri",     name: "Seigneur Iridescent",    reqXP: 120000, rarity: "Ultime" }
  ],

  // 2. EMBLÈMES (Pour le cadre en haut à gauche)
  emblems: [
    { id: "e_crosshair", name: "Viseur Tactique", icon: "fa-crosshair", color: "text-purple-400", reqXP: 0 },
    { id: "e_skull",     name: "Crâne Élite",     icon: "fa-skull",     color: "text-slate-200",  reqXP: 8000 },
    { id: "e_fire",      name: "Série Sanglante", icon: "fa-fire",      color: "text-orange-400", reqXP: 25000 },
    { id: "e_crown",     name: "Roi du Top 1",    icon: "fa-crown",     color: "text-amber-400",  reqXP: 50000 },
    { id: "e_dragon",    name: "Bête Mythique",   icon: "fa-dragon",    color: "text-rose-500",   reqXP: 90000 },
    { id: "e_gem",       name: "Diamant Pur",     icon: "fa-gem",       color: "text-cyan-400",   reqXP: 140000 }
  ],

  // 3. BORDURES D'AVATAR (Contour du carré en haut à gauche)
  borders: [
    { id: "b_purple", name: "Néon Dark Matter",  css: "from-purple-600 via-fuchsia-600 to-pink-500", reqXP: 0 },
    { id: "b_gold",   name: "Or Prestige",       css: "from-amber-400 via-yellow-500 to-orange-600", reqXP: 12000 },
    { id: "b_toxic",  name: "Gaz Nova 6",        css: "from-emerald-400 via-green-500 to-teal-600",  reqXP: 30000 },
    { id: "b_crimson",name: "Sang Crimson",      css: "from-red-600 via-rose-600 to-orange-500",     reqXP: 65000 },
    { id: "b_iri",    name: "Prisme Iridescent", css: "from-cyan-400 via-purple-500 to-pink-500 animate-pulse", reqXP: 110000 }
  ],

  // 4. THÈMES DE COULEURS DU SITE
  themes: [
    {
      id: "th_default",
      name: "Dark Matter (Défaut)",
      reqXP: 0,
      preview: "bg-gradient-to-r from-purple-600 to-pink-600",
      glow: "radial-gradient(circle at 15% 15%, rgba(124, 58, 237, 0.18) 0%, transparent 45%), radial-gradient(circle at 85% 65%, rgba(236, 72, 153, 0.14) 0%, transparent 50%)"
    },
    {
      id: "th_gold",
      name: "Or & Carbone",
      reqXP: 20000,
      preview: "bg-gradient-to-r from-amber-500 to-yellow-600",
      glow: "radial-gradient(circle at 15% 15%, rgba(245, 158, 11, 0.18) 0%, transparent 45%), radial-gradient(circle at 85% 65%, rgba(234, 179, 8, 0.12) 0%, transparent 50%)"
    },
    {
      id: "th_emerald",
      name: "Vision Nocturne",
      reqXP: 45000,
      preview: "bg-gradient-to-r from-emerald-500 to-teal-600",
      glow: "radial-gradient(circle at 15% 15%, rgba(16, 185, 129, 0.18) 0%, transparent 45%), radial-gradient(circle at 85% 65%, rgba(20, 184, 166, 0.12) 0%, transparent 50%)"
    },
    {
      id: "th_crimson",
      name: "Alerte Rouge",
      reqXP: 85000,
      preview: "bg-gradient-to-r from-red-600 to-orange-600",
      glow: "radial-gradient(circle at 15% 15%, rgba(220, 38, 38, 0.20) 0%, transparent 45%), radial-gradient(circle at 85% 65%, rgba(234, 88, 12, 0.14) 0%, transparent 50%)"
    }
  ]
};

// État sauvegardé du joueur
const STORAGE_REWARDS_KEY = "wz_tracker_profile_rewards_v1";

function getPlayerProfile() {
  const defaultProfile = {
    xp: 0,
    equippedTitle: "t_default",
    equippedEmblem: "e_crosshair",
    equippedBorder: "b_purple",
    equippedTheme: "th_default"
  };
  try {
    return { ...defaultProfile, ...JSON.parse(localStorage.getItem(STORAGE_REWARDS_KEY) || "{}") };
  } catch (e) {
    return defaultProfile;
  }
}

function savePlayerProfile(profile) {
  localStorage.setItem(STORAGE_REWARDS_KEY, JSON.stringify(profile));
  applyProfileCosmetics();
  renderRewardsLocker();
}

// Ajouter de l'XP (à appeler quand un défi est validé ou un match joué)
function addPlayerXP(amount) {
  const profile = getPlayerProfile();
  profile.xp = Math.max(0, (parseInt(profile.xp, 10) || 0) + (parseInt(amount, 10) || 0));
  savePlayerProfile(profile);
}

// Définir l'XP exacte (utile pour synchroniser avec le total de vos défis)
function syncPlayerXP(totalXP) {
  const profile = getPlayerProfile();
  profile.xp = Math.max(0, parseInt(totalXP, 10) || 0);
  savePlayerProfile(profile);
}

// Équiper un élément débloqué
function equipCosmetic(category, id) {
  const profile = getPlayerProfile();
  if (category === "title") profile.equippedTitle = id;
  if (category === "emblem") profile.equippedEmblem = id;
  if (category === "border") profile.equippedBorder = id;
  if (category === "theme") profile.equippedTheme = id;
  savePlayerProfile(profile);
}

// Calculer le niveau actuel du joueur
function getLevelInfo(xp) {
  let current = REWARDS_CONFIG.levels[0];
  let next = null;
  for (let i = 0; i < REWARDS_CONFIG.levels.length; i++) {
    if (xp >= REWARDS_CONFIG.levels[i].xp) {
      current = REWARDS_CONFIG.levels[i];
      next = REWARDS_CONFIG.levels[i + 1] || null;
    }
  }
  return { current, next };
}

// Appliquer visuellement les récompenses équipées sur tout le site
function applyProfileCosmetics() {
  const profile = getPlayerProfile();
  const { current, next } = getLevelInfo(profile.xp);

  // 1. Appliquer l'Emblème et la Bordure dans le Header (carré en haut à gauche)
  const headerBorderEl = document.getElementById("headerAvatarBorder");
  const headerIconEl = document.getElementById("headerAvatarIcon");
  const borderObj = REWARDS_CONFIG.borders.find(b => b.id === profile.equippedBorder) || REWARDS_CONFIG.borders[0];
  const emblemObj = REWARDS_CONFIG.emblems.find(e => e.id === profile.equippedEmblem) || REWARDS_CONFIG.emblems[0];

  if (headerBorderEl) {
    headerBorderEl.className = `w-10 h-10 rounded-xl bg-gradient-to-tr ${borderObj.css} p-0.5 shadow-lg transition-all duration-300`;
  }
  if (headerIconEl) {
    headerIconEl.className = `fa-solid ${emblemObj.icon} ${emblemObj.color} text-base transition-all duration-300`;
  }

  // 2. Appliquer le Titre équipé
  const titleObj = REWARDS_CONFIG.titles.find(t => t.id === profile.equippedTitle) || REWARDS_CONFIG.titles[0];
  const headerTitleBadge = document.getElementById("headerEquippedTitle");
  if (headerTitleBadge) {
    headerTitleBadge.textContent = `NIV. ${current.level} • ${titleObj.name}`;
  }

  // 3. Appliquer le Thème de fond
  const themeObj = REWARDS_CONFIG.themes.find(th => th.id === profile.equippedTheme) || REWARDS_CONFIG.themes[0];
  const glowBg = document.querySelector(".bg-ambient-glow");
  if (glowBg) {
    glowBg.style.background = themeObj.glow;
  }

  // 4. Mettre à jour la carte de profil dans l'onglet Récompenses / Défis
  const lvlNumEl = document.getElementById("lockerLevelNum");
  const lvlRankEl = document.getElementById("lockerRankName");
  const xpTextEl = document.getElementById("lockerXpText");
  const xpBarEl = document.getElementById("lockerXpBar");
  const activeTitleEl = document.getElementById("lockerActiveTitle");

  if (lvlNumEl) lvlNumEl.textContent = `NIVEAU ${current.level}`;
  if (lvlRankEl) lvlRankEl.textContent = current.rank;
  if (activeTitleEl) activeTitleEl.textContent = `« ${titleObj.name} »`;

  if (xpTextEl && xpBarEl) {
    if (next) {
      const pct = Math.min(100, Math.round(((profile.xp - current.xp) / (next.xp - current.xp)) * 100));
      xpTextEl.textContent = `${profile.xp.toLocaleString("fr-FR")} / ${next.xp.toLocaleString("fr-FR")} XP`;
      xpBarEl.style.width = `${pct}%`;
    } else {
      xpTextEl.textContent = `${profile.xp.toLocaleString("fr-FR")} XP (NIVEAU MAX)`;
      xpBarEl.style.width = "100%";
    }
  }
}

// Générer l'interface du Casier de Récompenses (Locker)
function renderRewardsLocker() {
  const container = document.getElementById("rewardsLockerContainer");
  if (!container) return;

  const profile = getPlayerProfile();
  const xp = profile.xp;

  const renderSection = (title, icon, items, categoryKey, equippedId, renderPreview) => `
    <div class="glass-card rounded-2xl p-5 space-y-3">
      <h3 class="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2 border-b border-slate-800/80 pb-2.5">
        <i class="fa-solid ${icon} text-purple-400"></i> ${title}
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        ${items.map(item => {
          const isUnlocked = xp >= item.reqXP;
          const isEquipped = equippedId === item.id;
          return `
            <div class="p-3.5 rounded-xl border transition flex flex-col justify-between gap-3 ${
              isEquipped
                ? "bg-purple-950/30 border-purple-500/60"
                : isUnlocked
                  ? "bg-slate-900/70 border-slate-800 hover:border-slate-600"
                  : "bg-slate-950/60 border-slate-900 opacity-60"
            }">
              <div class="flex items-center gap-3">
                ${renderPreview(item, isUnlocked)}
                <div>
                  <div class="text-xs font-bold text-white">${item.name}</div>
                  <div class="text-[10px] font-semibold ${isUnlocked ? "text-emerald-400" : "text-slate-400"}">
                    ${isUnlocked ? "Débloqué" : `<i class="fa-solid fa-lock mr-1"></i>Requis : ${item.reqXP.toLocaleString("fr-FR")} XP`}
                  </div>
                </div>
              </div>
              ${
                isEquipped
                  ? `<span class="w-full py-1.5 text-center rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-300 text-[10px] font-black uppercase tracking-wider">Équipé</span>`
                  : isUnlocked
                    ? `<button onclick="equipCosmetic('${categoryKey}', '${item.id}')" class="w-full py-1.5 rounded-lg btn-metal text-white text-[10px] font-extrabold uppercase tracking-wider">Équiper</button>`
                    : `<div class="w-full py-1.5 text-center rounded-lg bg-slate-900 text-slate-500 text-[10px] font-bold uppercase">Verrouillé</div>`
              }
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;

  container.innerHTML = `
    ${renderSection(
      "Emblèmes d'Opérateur",
      "fa-shield-halved",
      REWARDS_CONFIG.emblems,
      "emblem",
      profile.equippedEmblem,
      (item) => `<div class="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0"><i class="fa-solid ${item.icon} ${item.color} text-base"></i></div>`
    )}
    ${renderSection(
      "Bordures d'Avatar",
      "fa-square",
      REWARDS_CONFIG.borders,
      "border",
      profile.equippedBorder,
      (item) => `<div class="w-10 h-10 rounded-xl bg-gradient-to-tr ${item.css} p-0.5 shrink-0"><div class="w-full h-full bg-slate-950 rounded-[10px]"></div></div>`
    )}
    ${renderSection(
      "Titres de Profil",
      "fa-id-badge",
      REWARDS_CONFIG.titles,
      "title",
      profile.equippedTitle,
      (item) => `<div class="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 text-purple-400 font-black text-xs">ID</div>`
    )}
    ${renderSection(
      "Thèmes d'Interface",
      "fa-palette",
      REWARDS_CONFIG.themes,
      "theme",
      profile.equippedTheme,
      (item) => `<div class="w-10 h-10 rounded-xl ${item.preview} border border-white/10 shrink-0"></div>`
    )}
  `;
}

// Initialisation au chargement
document.addEventListener("DOMContentLoaded", () => {
  applyProfileCosmetics();
  renderRewardsLocker();
});
// Détection automatique de l'XP des défis terminés (100%)
function autoSyncDefisXP() {
  let detectedXP = 0;
  const defisSection = document.getElementById("sectionDefis");
  if (defisSection) {
    defisSection.querySelectorAll("div").forEach(card => {
      if (card.textContent.includes("(100%)") && card.textContent.includes("XP") && card.querySelectorAll("div").length < 6) {
        const match = card.textContent.match(/([\d\s,]+)\s*XP/i);
        if (match) {
          const val = parseInt(match[1].replace(/[\s,]/g, ""), 10);
          if (!isNaN(val) && val > 0 && val <= 50000) detectedXP += val;
        }
      }
    });
  }
  const profile = getPlayerProfile();
  if (detectedXP > profile.xp) {
    profile.xp = detectedXP;
    localStorage.setItem(STORAGE_REWARDS_KEY, JSON.stringify(profile));
  }
}

setInterval(() => {
  autoSyncDefisXP();
  applyProfileCosmetics();
}, 1500);
