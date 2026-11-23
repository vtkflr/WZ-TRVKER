(function () {
  // MODE TEST : mettre à false quand tu voudras que le déblocage dépende uniquement de l'XP / des stats
  const TEST_UNLOCK_ALL = false;

  const REWARDS_STATE_KEY = 'WZ_TRACKER_REWARDS_EQUIPPED_V1';

  const RANKS = [
    { level: 1, minXp: 0, name: 'Recrue' },
    { level: 2, minXp: 2500, name: 'Opérateur' },
    { level: 3, minXp: 6000, name: 'Vétéran' },
    { level: 4, minXp: 11000, name: 'Élite' },
    { level: 5, minXp: 18000, name: 'Maître Prestige' },
    { level: 6, minXp: 27000, name: 'Iridescent' }
  ];

  const FRAMES = [
    {
      id: 'frame_default',
      name: 'Néon Violet (Base)',
      desc: 'Contour dégradé violet & rose standard',
      reqXp: 0,
      badge: 'BASE',
      accent: '#a855f7',
      borderCss: 'background: linear-gradient(135deg, #7c3aed, #d946ef, #ec4899); box-shadow: 0 0 14px rgba(168,85,247,0.45);'
    },
    {
      id: 'frame_gold_top1',
      name: 'Couronne Or Top 1',
      desc: 'Halo doré pulsant des vainqueurs',
      reqXp: 2500,
      badge: 'EFFET PULSE',
      accent: '#f59e0b',
      animClass: 'wz-fx-gold-pulse',
      borderCss: 'background: linear-gradient(135deg, #fde047, #f59e0b, #b45309);'
    },
    {
      id: 'frame_crimson_fury',
      name: 'Fureur Écarlate',
      desc: 'Lueur rouge sang haute intensité',
      reqXp: 6000,
      badge: 'EFFET FEU',
      accent: '#f43f5e',
      animClass: 'wz-fx-crimson',
      borderCss: 'background: linear-gradient(135deg, #fb7185, #e11d48, #881337);'
    },
    {
      id: 'frame_emerald_cyber',
      name: 'Cyber Émeraude',
      desc: 'Cadre tactique vert émeraude & cyan',
      reqXp: 11000,
      badge: 'EFFET CYBER',
      accent: '#10b981',
      animClass: 'wz-fx-emerald',
      borderCss: 'background: linear-gradient(135deg, #34d399, #06b6d4, #047857);'
    },
    {
      id: 'frame_iridescent_prism',
      name: 'Prisme Iridescent',
      desc: 'Rotation arc-en-ciel animée Prestige',
      reqXp: 18000,
      badge: 'ANIMÉ RGB',
      accent: '#38bdf8',
      animClass: 'wz-fx-prism',
      borderCss: 'background: conic-gradient(from 0deg, #a855f7, #ec4899, #f59e0b, #10b981, #38bdf8, #a855f7);'
    },
    {
      id: 'frame_abyss_lightning',
      name: 'Éclair Abyssal',
      desc: 'Double aura électrique violet-cyan',
      reqXp: 27000,
      badge: 'MYTHIQUE',
      accent: '#c084fc',
      animClass: 'wz-fx-abyss',
      borderCss: 'background: linear-gradient(135deg, #22d3ee, #818cf8, #c026d3);'
    }
  ];

  const THEMES = [
    {
      id: 'theme_nebula',
      name: 'Nébuleuse Violette',
      desc: 'Thème sombre violet & rose par défaut',
      reqXp: 0,
      primary: '#7c3aed',
      secondary: '#ec4899',
      glow: 'rgba(124, 58, 237, 0.22)'
    },
    {
      id: 'theme_emerald',
      name: 'Nébulosa Émeraude',
      desc: 'Ambiance émeraude & cyan tactique',
      reqXp: 2500,
      primary: '#10b981',
      secondary: '#06b6d4',
      glow: 'rgba(16, 185, 129, 0.22)'
    },
    {
      id: 'theme_gold',
      name: 'Or Tournoi CMG',
      desc: 'Ambiance dorée & ambre compétitive',
      reqXp: 6000,
      primary: '#f59e0b',
      secondary: '#eab308',
      glow: 'rgba(245, 158, 11, 0.22)'
    },
    {
      id: 'theme_crimson',
      name: 'Crimson Rush',
      desc: 'Ambiance rouge intense & rose néon',
      reqXp: 11000,
      primary: '#e11d48',
      secondary: '#fb7185',
      glow: 'rgba(225, 29, 72, 0.22)'
    },
    {
      id: 'theme_arctic',
      name: 'Glace Arctique',
      desc: 'Ambiance bleu glacier & indigo',
      reqXp: 18000,
      primary: '#0ea5e9',
      secondary: '#6366f1',
      glow: 'rgba(14, 165, 233, 0.22)'
    }
  ];

  const TITLES = [
    { id: 'title_op', label: 'Opérateur Saison 1', reqXp: 0 },
    { id: 'title_shotcaller', label: 'Shotcaller de l’Ombre', reqXp: 2500 },
    { id: 'title_rusher', label: 'Entry Fragger Sans Pitié', reqXp: 6000 },
    { id: 'title_top1', label: 'Chasseur de Top 1', reqXp: 11000 },
    { id: 'title_cmg', label: 'Légende 2v2 Cash-Prize', reqXp: 18000 },
    { id: 'title_demon', label: 'Démon de Résurgence', reqXp: 27000 }
  ];

  let equipped = {
    frameId: 'frame_default',
    themeId: 'theme_nebula',
    titleId: 'title_op'
  };

  let currentTotalXp = 0;

  function loadEquipped() {
    try {
      const raw = localStorage.getItem(REWARDS_STATE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        equipped = { ...equipped, ...parsed };
      }
    } catch (_) {}
  }

  function saveEquipped() {
    try {
      localStorage.setItem(REWARDS_STATE_KEY, JSON.stringify(equipped));
    } catch (_) {}
  }

  function injectEffectsStyles() {
    if (document.getElementById('wzRewardsFxStyles')) return;
    const style = document.createElement('style');
    style.id = 'wzRewardsFxStyles';
    style.textContent = `
      @keyframes wzGoldPulse {
        0%, 100% { box-shadow: 0 0 10px rgba(245,158,11,0.55), 0 0 22px rgba(253,224,71,0.25); transform: scale(1); }
        50% { box-shadow: 0 0 18px rgba(245,158,11,0.95), 0 0 32px rgba(253,224,71,0.55); transform: scale(1.04); }
      }
      @keyframes wzCrimsonGlow {
        0%, 100% { box-shadow: 0 0 12px rgba(225,29,72,0.6), inset 0 0 6px rgba(251,113,133,0.4); }
        50% { box-shadow: 0 0 24px rgba(244,63,94,0.95), 0 0 36px rgba(225,29,72,0.45); }
      }
      @keyframes wzEmeraldScan {
        0%, 100% { box-shadow: 0 0 12px rgba(16,185,129,0.6), 0 0 20px rgba(6,182,212,0.3); }
        50% { box-shadow: 0 0 22px rgba(52,211,153,0.95), 0 0 34px rgba(6,182,212,0.6); }
      }
      @keyframes wzPrismSpin {
        0% { filter: hue-rotate(0deg); box-shadow: 0 0 18px rgba(168,85,247,0.75); }
        50% { filter: hue-rotate(180deg); box-shadow: 0 0 24px rgba(56,189,248,0.85); }
        100% { filter: hue-rotate(360deg); box-shadow: 0 0 18px rgba(168,85,247,0.75); }
      }
      @keyframes wzAbyssShock {
        0%, 100% { box-shadow: 0 0 14px rgba(34,211,238,0.75), 0 0 28px rgba(192,38,211,0.45); }
        50% { box-shadow: 0 0 24px rgba(192,132,252,0.95), 0 0 40px rgba(34,211,238,0.75); }
      }
      .wz-fx-gold-pulse { animation: wzGoldPulse 2.2s infinite ease-in-out; }
      .wz-fx-crimson { animation: wzCrimsonGlow 2s infinite ease-in-out; }
      .wz-fx-emerald { animation: wzEmeraldScan 2.4s infinite ease-in-out; }
      .wz-fx-prism { animation: wzPrismSpin 4s linear infinite; }
      .wz-fx-abyss { animation: wzAbyssShock 1.8s infinite ease-in-out; }
    `;
    document.head.appendChild(style);
  }

  function getLevelInfo(xp) {
    let current = RANKS[0];
    let next = RANKS[1] || null;
    for (let i = 0; i < RANKS.length; i++) {
      if (xp >= RANKS[i].minXp) {
        current = RANKS[i];
        next = RANKS[i + 1] || null;
      }
    }
    return { current, next };
  }

  function computePersonalRecords() {
    const list = Array.isArray(window.matches) ? window.matches : [];
    let maxKills = 0;
    let maxDmg = 0;
    let maxScore = 0;
    let wins = 0;
    let maxTop5Streak = 0;
    let curStreak = 0;

    list.forEach(m => {
      const k = Number(m.kills) || 0;
      const d = Number(m.damage) || 0;
      const s = Number(m.score) || 0;
      const p = Number(m.placement) || 99;
      if (k > maxKills) maxKills = k;
      if (d > maxDmg) maxDmg = d;
      if (s > maxScore) maxScore = s;
      if (p === 1) wins++;
      if (p <= 5) {
        curStreak++;
        if (curStreak > maxTop5Streak) maxTop5Streak = curStreak;
      } else {
        curStreak = 0;
      }
    });

    return { maxKills, maxDmg, maxScore, wins, maxTop5Streak };
  }

  function applyEquippedVisuals() {
    injectEffectsStyles();
    const { current } = getLevelInfo(currentTotalXp);

    const avatarBorder = document.getElementById('headerAvatarBorder');
    let frame = FRAMES.find(f => f.id === equipped.frameId) || FRAMES[0];
    if (!TEST_UNLOCK_ALL && currentTotalXp < frame.reqXp) {
      frame = FRAMES[0];
      equipped.frameId = frame.id;
    }
    if (avatarBorder && frame) {
      avatarBorder.className = `w-10 h-10 sm:w-11 sm:h-11 rounded-xl p-0.5 shrink-0 transition-all duration-300 ${frame.animClass || ''}`;
      avatarBorder.setAttribute('style', frame.borderCss);
    }

    let titleObj = TITLES.find(t => t.id === equipped.titleId) || TITLES[0];
    if (!TEST_UNLOCK_ALL && currentTotalXp < titleObj.reqXp) {
      titleObj = TITLES[0];
      equipped.titleId = titleObj.id;
    }
    const hdrTitle = document.getElementById('headerEquippedTitle');
    if (hdrTitle && titleObj) {
      hdrTitle.innerText = `NIV. ${current.level} • ${titleObj.label}`;
    }
    const lockerTitle = document.getElementById('lockerActiveTitle');
    if (lockerTitle && titleObj) {
      lockerTitle.innerText = `« ${titleObj.label} »`;
    }

    let theme = THEMES.find(t => t.id === equipped.themeId) || THEMES[0];
    if (!TEST_UNLOCK_ALL && currentTotalXp < theme.reqXp) {
      theme = THEMES[0];
      equipped.themeId = theme.id;
    }
    if (theme) {
      const ambient = document.querySelector('.bg-ambient-glow');
      if (ambient) {
        ambient.style.background = `radial-gradient(circle at 20% 15%, ${theme.glow}, transparent 55%), radial-gradient(circle at 80% 80%, ${theme.glow}, transparent 55%)`;
      }
      document.querySelectorAll('.btn-accent').forEach(btn => {
        btn.style.background = `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`;
      });
    }
  }

  window.equipRewardItem = function (type, id) {
    if (!TEST_UNLOCK_ALL) {
      if (type === 'frame') {
        const it = FRAMES.find(x => x.id === id);
        if (!it || currentTotalXp < it.reqXp) return;
      }
      if (type === 'theme') {
        const it = THEMES.find(x => x.id === id);
        if (!it || currentTotalXp < it.reqXp) return;
      }
      if (type === 'title') {
        const it = TITLES.find(x => x.id === id);
        if (!it || currentTotalXp < it.reqXp) return;
      }
    }
    if (type === 'frame') equipped.frameId = id;
    if (type === 'theme') equipped.themeId = id;
    if (type === 'title') equipped.titleId = id;
    saveEquipped();
    applyEquippedVisuals();
    renderRewardsLocker();
    if (typeof window.showToast === 'function') {
      window.showToast('Récompense équipée !', 'success');
    }
  };

  function renderRewardsLocker() {
    const container = document.getElementById('rewardsLockerContainer');
    if (!container) return;

    const records = computePersonalRecords();

    const badges = [
      {
        name: 'Carnage 20+ Kills',
        desc: `Record actuel : ${records.maxKills} kills`,
        unlocked: TEST_UNLOCK_ALL || records.maxKills >= 20,
        color: '#ec4899',
        icon: 'fa-skull'
      },
      {
        name: 'Artillerie 8 000+ Dégâts',
        desc: `Record actuel : ${records.maxDmg.toLocaleString('fr-FR')} dégâts`,
        unlocked: TEST_UNLOCK_ALL || records.maxDmg >= 8000,
        color: '#38bdf8',
        icon: 'fa-fire'
      },
      {
        name: 'Série Top 5 x3',
        desc: `Meilleure série : ${records.maxTop5Streak} Top 5 d’affilée`,
        unlocked: TEST_UNLOCK_ALL || records.maxTop5Streak >= 3,
        color: '#10b981',
        icon: 'fa-bolt'
      },
      {
        name: 'Roi du Top 1',
        desc: `Victoires totales : ${records.wins} Top 1`,
        unlocked: TEST_UNLOCK_ALL || records.wins >= 5,
        color: '#f59e0b',
        icon: 'fa-crown'
      }
    ];

    container.innerHTML = `
      ${TEST_UNLOCK_ALL ? `
        <div class="px-4 py-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-between gap-2">
          <span class="text-xs font-extrabold text-amber-300 uppercase tracking-wider">
            <i class="fa-solid fa-flask mr-1.5"></i> Mode Test actif : Toutes les récompenses sont déverrouillées
          </span>
          <span class="text-[11px] font-bold text-amber-200/80">Clique sur un cadre, thème ou titre pour l'équiper</span>
        </div>
      ` : ''}

      <div class="glass-card rounded-2xl p-5 border border-slate-800/90 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <i class="fa-solid fa-wand-magic-sparkles text-purple-400"></i> Cadres d'Avatar & Effets
            </h3>
            <p class="text-xs text-slate-400">Personnalise le contour animé du logo en haut de l'écran</p>
          </div>
          <span class="text-xs font-bold text-emerald-400">${FRAMES.filter(f => TEST_UNLOCK_ALL || currentTotalXp >= f.reqXp).length} / ${FRAMES.length} débloqués</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          ${FRAMES.map(f => {
            const unlocked = TEST_UNLOCK_ALL || currentTotalXp >= f.reqXp;
            const isEquipped = equipped.frameId === f.id;
            return `
              <div class="p-4 rounded-2xl bg-slate-950/85 border ${isEquipped ? 'border-emerald-400/70' : 'border-slate-800'} flex items-center justify-between gap-3 transition">
                <div class="flex items-center gap-3.5">
                  <div class="w-12 h-12 rounded-xl p-0.5 shrink-0 ${f.animClass || ''}" style="${f.borderCss}">
                    <div class="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-white font-black text-xs">
                      WZ
                    </div>
                  </div>
                  <div>
                    <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-700" style="color:${f.accent}">${f.badge}</span>
                    <div class="text-sm font-black text-white mt-1">${f.name}</div>
                    <div class="text-[11px] text-slate-400">${f.desc}</div>
                  </div>
                </div>
                <button type="button"
                  ${unlocked ? `onclick="equipRewardItem('frame', '${f.id}')"` : 'disabled'}
                  class="px-3 py-1.5 rounded-xl text-xs font-extrabold shrink-0 transition ${
                    isEquipped
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : unlocked
                        ? 'bg-purple-600 hover:bg-purple-500 text-white'
                        : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                  }">
                  ${isEquipped ? 'Équipé' : unlocked ? 'Équiper' : `${f.reqXp} XP`}
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="glass-card rounded-2xl p-5 border border-slate-800/90 space-y-4">
        <div>
          <h3 class="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
            <i class="fa-solid fa-palette text-pink-400"></i> Thèmes & Lueurs de l'Interface
          </h3>
          <p class="text-xs text-slate-400">Change les couleurs d'accentuation et la lueur de fond du site</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          ${THEMES.map(t => {
            const unlocked = TEST_UNLOCK_ALL || currentTotalXp >= t.reqXp;
            const isEquipped = equipped.themeId === t.id;
            return `
              <div class="p-4 rounded-2xl bg-slate-950/85 border ${isEquipped ? 'border-emerald-400/70' : 'border-slate-800'} flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl shrink-0 border border-white/15" style="background: linear-gradient(135deg, ${t.primary}, ${t.secondary});"></div>
                  <div>
                    <div class="text-sm font-black text-white">${t.name}</div>
                    <div class="text-[11px] text-slate-400">${t.desc}</div>
                  </div>
                </div>
                <button type="button"
                  ${unlocked ? `onclick="equipRewardItem('theme', '${t.id}')"` : 'disabled'}
                  class="px-3 py-1.5 rounded-xl text-xs font-extrabold shrink-0 transition ${
                    isEquipped
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : unlocked
                        ? 'bg-purple-600 hover:bg-purple-500 text-white'
                        : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                  }">
                  ${isEquipped ? 'Actif' : unlocked ? 'Activer' : `${t.reqXp} XP`}
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="glass-card rounded-2xl p-5 border border-slate-800/90 space-y-4">
        <div>
          <h3 class="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
            <i class="fa-solid fa-id-badge text-amber-400"></i> Titres de Profil
          </h3>
          <p class="text-xs text-slate-400">Affiché directement sous le logo Warzone Tracker</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          ${TITLES.map(ti => {
            const unlocked = TEST_UNLOCK_ALL || currentTotalXp >= ti.reqXp;
            const isEquipped = equipped.titleId === ti.id;
            return `
              <div class="p-3.5 rounded-2xl bg-slate-950/85 border ${isEquipped ? 'border-emerald-400/70' : 'border-slate-800'} flex items-center justify-between gap-2">
                <span class="text-xs font-black text-purple-200 uppercase tracking-wider">« ${ti.label} »</span>
                <button type="button"
                  ${unlocked ? `onclick="equipRewardItem('title', '${ti.id}')"` : 'disabled'}
                  class="px-3 py-1 rounded-lg text-[11px] font-extrabold shrink-0 ${
                    isEquipped
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : unlocked
                        ? 'bg-purple-600 hover:bg-purple-500 text-white'
                        : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                  }">
                  ${isEquipped ? 'Équipé' : unlocked ? 'Porter' : `${ti.reqXp} XP`}
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="glass-card rounded-2xl p-5 border border-slate-800/90 space-y-4">
        <div>
          <h3 class="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
            <i class="fa-solid fa-medal text-cyan-400"></i> Médailles de Records & Séries
          </h3>
          <p class="text-xs text-slate-400">Suivi automatique de tes meilleures performances</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          ${badges.map(b => `
            <div class="p-4 rounded-2xl bg-slate-950/85 border border-slate-800 space-y-2">
              <div class="flex items-center justify-between">
                <span class="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-900 border border-slate-700" style="color:${b.color}">
                  <i class="fa-solid ${b.icon}"></i>
                </span>
                <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded ${b.unlocked ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-slate-900 text-slate-500 border border-slate-800'}">
                  ${b.unlocked ? 'DÉBLOQUÉ' : 'VERROUILLÉ'}
                </span>
              </div>
              <div class="text-sm font-black text-white">${b.name}</div>
              <div class="text-[11px] text-slate-400">${b.desc}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  window.syncPlayerXP = function (totalXp) {
    currentTotalXp = Number(totalXp) || 0;
    const { current, next } = getLevelInfo(currentTotalXp);

    const lvlEl = document.getElementById('lockerLevelNum');
    const rankEl = document.getElementById('lockerRankName');
    const xpTextEl = document.getElementById('lockerXpText');
    const xpBarEl = document.getElementById('lockerXpBar');

    if (lvlEl) lvlEl.innerText = `NIVEAU ${current.level}`;
    if (rankEl) rankEl.innerText = current.name;

    if (next) {
      const span = next.minXp - current.minXp;
      const prog = Math.max(0, currentTotalXp - current.minXp);
      const pct = Math.min(100, Math.round((prog / span) * 100));
      if (xpTextEl) xpTextEl.innerText = `${currentTotalXp.toLocaleString('fr-FR')} / ${next.minXp.toLocaleString('fr-FR')} XP`;
      if (xpBarEl) xpBarEl.style.width = `${pct}%`;
    } else {
      if (xpTextEl) xpTextEl.innerText = `${currentTotalXp.toLocaleString('fr-FR')} XP (MAX)`;
      if (xpBarEl) xpBarEl.style.width = '100%';
    }

    applyEquippedVisuals();
    renderRewardsLocker();
  };

  loadEquipped();
  window.addEventListener('DOMContentLoaded', () => {
    applyEquippedVisuals();
    renderRewardsLocker();
  });
})();
