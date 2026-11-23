(function () {
  const REWARDS_STORAGE_KEY = 'WZ_TRACKER_REWARDS_V1';

  const RANKS = [
    { minLevel: 1, name: 'Recrue', color: 'text-slate-300' },
    { minLevel: 5, name: 'Opérateur', color: 'text-sky-400' },
    { minLevel: 10, name: 'Vétéran', color: 'text-purple-400' },
    { minLevel: 15, name: 'Élite', color: 'text-fuchsia-400' },
    { minLevel: 20, name: 'Légende', color: 'text-amber-400' }
  ];

  const TITLES = [
    { id: 't_recrue', label: 'Opérateur Saison 1', unlockLevel: 1, rarity: 'Commun' },
    { id: 't_resurgence', label: 'Fléau de la Résurgence', unlockLevel: 3, rarity: 'Rare' },
    { id: 't_top1', label: 'Chasseur de Top 1', unlockLevel: 6, rarity: 'Épique' },
    { id: 't_sniper', label: 'Œil de Lynx', unlockLevel: 9, rarity: 'Épique' },
    { id: 't_warlord', label: 'Seigneur de Guerre MW4', unlockLevel: 15, rarity: 'Légendaire' }
  ];

  const AVATARS = [
    { id: 'a_crosshair', name: 'Viseur Tactique', icon: 'fa-crosshair', border: 'from-purple-600 via-fuchsia-600 to-pink-500', unlockLevel: 1 },
    { id: 'a_skull', name: 'Crâne Opérateur', icon: 'fa-skull', border: 'from-rose-600 via-pink-600 to-purple-500', unlockLevel: 4 },
    { id: 'a_crown', name: 'Couronne Royale', icon: 'fa-crown', border: 'from-amber-400 via-yellow-500 to-orange-500', unlockLevel: 8 },
    { id: 'a_bolt', name: 'Foudre de Zone', icon: 'fa-bolt', border: 'from-cyan-400 via-sky-500 to-indigo-500', unlockLevel: 12 },
    { id: 'a_dragon', name: 'Apex Mythique', icon: 'fa-fire-flame-curved', border: 'from-fuchsia-500 via-rose-500 to-amber-400', unlockLevel: 18 }
  ];

  function calculateLevelFromXp(xp) {
    const safeXp = Math.max(0, Number(xp) || 0);
    const xpPerLevel = 2500;
    const level = Math.floor(safeXp / xpPerLevel) + 1;
    const currentLevelXp = safeXp % xpPerLevel;
    return { level, currentLevelXp, xpPerLevel, totalXp: safeXp };
  }

  function getRankForLevel(level) {
    let current = RANKS[0];
    for (const r of RANKS) {
      if (level >= r.minLevel) current = r;
    }
    return current;
  }

  function loadRewardsState() {
    try {
      const saved = JSON.parse(localStorage.getItem(REWARDS_STORAGE_KEY) || '{}');
      return {
        equippedTitle: saved.equippedTitle || 't_recrue',
        equippedAvatar: saved.equippedAvatar || 'a_crosshair',
        totalXp: Number(saved.totalXp) || 0
      };
    } catch (_) {
      return { equippedTitle: 't_recrue', equippedAvatar: 'a_crosshair', totalXp: 0 };
    }
  }

  function saveRewardsState(state) {
    localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(state));
  }

  window.equipRewardTitle = function (titleId) {
    const state = loadRewardsState();
    const { level } = calculateLevelFromXp(state.totalXp);
    const item = TITLES.find(t => t.id === titleId);
    if (!item || level < item.unlockLevel) return;
    state.equippedTitle = titleId;
    saveRewardsState(state);
    window.syncPlayerXP(state.totalXp);
  };

  window.equipRewardAvatar = function (avatarId) {
    const state = loadRewardsState();
    const { level } = calculateLevelFromXp(state.totalXp);
    const item = AVATARS.find(a => a.id === avatarId);
    if (!item || level < item.unlockLevel) return;
    state.equippedAvatar = avatarId;
    saveRewardsState(state);
    window.syncPlayerXP(state.totalXp);
  };

  window.syncPlayerXP = function (newXp) {
    const state = loadRewardsState();
    state.totalXp = Math.max(0, Number(newXp) || 0);
    const { level, currentLevelXp, xpPerLevel, totalXp } = calculateLevelFromXp(state.totalXp);
    const rank = getRankForLevel(level);

    let activeTitle = TITLES.find(t => t.id === state.equippedTitle && level >= t.unlockLevel);
    if (!activeTitle) {
      activeTitle = [...TITLES].reverse().find(t => level >= t.unlockLevel) || TITLES[0];
      state.equippedTitle = activeTitle.id;
    }

    let activeAvatar = AVATARS.find(a => a.id === state.equippedAvatar && level >= a.unlockLevel);
    if (!activeAvatar) {
      activeAvatar = [...AVATARS].reverse().find(a => level >= a.unlockLevel) || AVATARS[0];
      state.equippedAvatar = activeAvatar.id;
    }

    saveRewardsState(state);

    const headerTitle = document.getElementById('headerEquippedTitle');
    if (headerTitle) headerTitle.innerText = `NIV. ${level} • ${activeTitle.label}`;

    const headerIcon = document.getElementById('headerAvatarIcon');
    if (headerIcon) headerIcon.className = `fa-solid ${activeAvatar.icon} text-purple-400 text-base`;

    const headerBorder = document.getElementById('headerAvatarBorder');
    if (headerBorder) headerBorder.className = `w-10 h-10 rounded-xl bg-gradient-to-tr ${activeAvatar.border} p-0.5 shadow-lg shadow-purple-950/50`;

    const lvlNumEl = document.getElementById('lockerLevelNum');
    if (lvlNumEl) lvlNumEl.innerText = `NIVEAU ${level}`;

    const rankNameEl = document.getElementById('lockerRankName');
    if (rankNameEl) rankNameEl.innerText = rank.name;

    const activeTitleEl = document.getElementById('lockerActiveTitle');
    if (activeTitleEl) activeTitleEl.innerText = `« ${activeTitle.label} »`;

    const xpTextEl = document.getElementById('lockerXpText');
    if (xpTextEl) xpTextEl.innerText = `${currentLevelXp.toLocaleString('fr-FR')} / ${xpPerLevel.toLocaleString('fr-FR')} XP (${totalXp.toLocaleString('fr-FR')} total)`;

    const xpBarEl = document.getElementById('lockerXpBar');
    if (xpBarEl) xpBarEl.style.width = `${Math.min(100, Math.round((currentLevelXp / xpPerLevel) * 100))}%`;

    const lockerContainer = document.getElementById('rewardsLockerContainer');
    if (lockerContainer) {
      lockerContainer.innerHTML = `
        <div class="glass-card p-5 space-y-3">
          <h3 class="text-xs font-black uppercase text-purple-300 tracking-wider">Titres d'Opérateur</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            ${TITLES.map(t => {
              const unlocked = level >= t.unlockLevel;
              const equipped = state.equippedTitle === t.id;
              return `
                <div class="p-3 rounded-xl bg-slate-950/80 border ${equipped ? 'border-purple-500' : 'border-slate-800'} flex items-center justify-between gap-2">
                  <div>
                    <div class="text-xs font-black text-white">${t.label}</div>
                    <div class="text-[10px] text-slate-400">${unlocked ? t.rarity : `Débloqué Niv. ${t.unlockLevel}`}</div>
                  </div>
                  <button type="button" ${unlocked ? `onclick="equipRewardTitle('${t.id}')"` : 'disabled'} class="px-2.5 py-1 rounded-lg text-[10px] font-extrabold ${equipped ? 'bg-purple-600 text-white' : unlocked ? 'btn-metal text-purple-200' : 'bg-slate-900 text-slate-600 cursor-not-allowed'}">
                    ${equipped ? 'Équipé' : unlocked ? 'Équiper' : 'Verrouillé'}
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="glass-card p-5 space-y-3">
          <h3 class="text-xs font-black uppercase text-pink-300 tracking-wider">Emblèmes d'Avatar</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            ${AVATARS.map(a => {
              const unlocked = level >= a.unlockLevel;
              const equipped = state.equippedAvatar === a.id;
              return `
                <div class="p-3 rounded-xl bg-slate-950/80 border ${equipped ? 'border-pink-500' : 'border-slate-800'} flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-gradient-to-tr ${a.border} p-0.5 shrink-0">
                      <div class="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                        <i class="fa-solid ${a.icon} text-xs text-white"></i>
                      </div>
                    </div>
                    <div>
                      <div class="text-xs font-black text-white">${a.name}</div>
                      <div class="text-[10px] text-slate-400">${unlocked ? 'Débloqué' : `Niveau ${a.unlockLevel} requis`}</div>
                    </div>
                  </div>
                  <button type="button" ${unlocked ? `onclick="equipRewardAvatar('${a.id}')"` : 'disabled'} class="px-2.5 py-1 rounded-lg text-[10px] font-extrabold ${equipped ? 'bg-pink-600 text-white' : unlocked ? 'btn-metal text-pink-200' : 'bg-slate-900 text-slate-600 cursor-not-allowed'}">
                    ${equipped ? 'Équipé' : unlocked ? 'Équiper' : 'Verrouillé'}
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const initialState = loadRewardsState();
    window.syncPlayerXP(initialState.totalXp);
  });
})();
