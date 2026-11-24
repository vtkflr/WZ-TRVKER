(function () {
  const REWARDS_STATE_KEY = 'WZ_TRACKER_REWARDS_STATE_V1';

  const RANKS = [
    { minLevel: 1, name: 'Recrue', title: 'Opérateur Saison 1', borderClass: 'from-purple-600 via-fuchsia-600 to-pink-500' },
    { minLevel: 2, name: 'Vétéran', title: 'Chasseur de Primes', borderClass: 'from-cyan-500 via-blue-500 to-purple-600' },
    { minLevel: 3, name: 'Élite', title: 'Maître Tactique', borderClass: 'from-emerald-400 via-teal-500 to-cyan-500' },
    { minLevel: 4, name: 'Champion', title: 'Légende de Warzone', borderClass: 'from-amber-400 via-orange-500 to-pink-500' },
    { minLevel: 5, name: 'Iridescent', title: 'Seigneur de Guerre', borderClass: 'from-rose-500 via-fuchsia-500 to-amber-400' }
  ];

  const REWARD_ITEMS = [
    { id: 'r_title_1', type: 'Titre', level: 1, label: 'Opérateur Saison 1', desc: 'Débloqué dès le début de la Saison 1.' },
    { id: 'r_border_1', type: 'Cadre Avatar', level: 1, label: 'Néon Violet & Rose', borderClass: 'from-purple-600 via-fuchsia-600 to-pink-500', desc: 'Cadre standard Warzone Tracker.' },
    { id: 'r_title_2', type: 'Titre', level: 2, label: 'Chasseur de Primes', desc: 'Atteindre 2 500 XP cumulés.' },
    { id: 'r_border_2', type: 'Cadre Avatar', level: 2, label: 'Cyber Cyan', borderClass: 'from-cyan-400 via-sky-500 to-indigo-600', desc: 'Atteindre 2 500 XP cumulés.' },
    { id: 'r_title_3', type: 'Titre', level: 3, label: 'Maître Tactique', desc: 'Atteindre 5 000 XP cumulés.' },
    { id: 'r_border_3', type: 'Cadre Avatar', level: 3, label: 'Émeraude Toxique', borderClass: 'from-emerald-400 via-teal-500 to-cyan-500', desc: 'Atteindre 5 000 XP cumulés.' },
    { id: 'r_title_4', type: 'Titre', level: 4, label: 'Légende de Warzone', desc: 'Atteindre 7 500 XP cumulés.' },
    { id: 'r_border_4', type: 'Cadre Avatar', level: 4, label: 'Or & Braise', borderClass: 'from-amber-400 via-orange-500 to-rose-600', desc: 'Atteindre 7 500 XP cumulés.' },
    { id: 'r_title_5', type: 'Titre', level: 5, label: 'Seigneur de Guerre', desc: 'Atteindre 10 000 XP cumulés.' },
    { id: 'r_border_5', type: 'Cadre Avatar', level: 5, label: 'Prisme Iridescent', borderClass: 'from-rose-500 via-fuchsia-500 to-amber-300', desc: 'Atteindre 10 000 XP cumulés.' }
  ];

  function getState() {
    try {
      const raw = localStorage.getItem(REWARDS_STATE_KEY);
      return raw ? JSON.parse(raw) : { equippedTitle: 'Opérateur Saison 1', equippedBorder: 'from-purple-600 via-fuchsia-600 to-pink-500' };
    } catch (_) {
      return { equippedTitle: 'Opérateur Saison 1', equippedBorder: 'from-purple-600 via-fuchsia-600 to-pink-500' };
    }
  }

  function saveState(st) {
    try { localStorage.setItem(REWARDS_STATE_KEY, JSON.stringify(st)); } catch (_) {}
  }

  window.equipRewardItem = function (kind, value) {
    const st = getState();
    if (kind === 'title') st.equippedTitle = value;
    if (kind === 'border') st.equippedBorder = value;
    saveState(st);
    window.syncPlayerXP(window._lastKnownPlayerXP || 0);
    if (typeof showToast === 'function') showToast('Récompense équipée !', 'success');
  };

  window.syncPlayerXP = function (totalXP) {
    window._lastKnownPlayerXP = Number(totalXP) || 0;
    const xp = window._lastKnownPlayerXP;
    const xpPerLevel = 2500;
    const level = Math.max(1, Math.floor(xp / xpPerLevel) + 1);
    const nextTarget = level * xpPerLevel;
    const progressPct = Math.min(100, Math.round(((xp % xpPerLevel) / xpPerLevel) * 100));

    let rankObj = RANKS[0];
    for (const r of RANKS) {
      if (level >= r.minLevel) rankObj = r;
    }

    const st = getState();
    const headerTitle = document.getElementById('headerEquippedTitle');
    if (headerTitle) {
      headerTitle.innerText = `NIV. ${level} • ${st.equippedTitle || rankObj.title}`;
    }

    const headerBorder = document.getElementById('headerAvatarBorder');
    if (headerBorder) {
      headerBorder.className = `w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr ${st.equippedBorder || rankObj.borderClass} p-0.5 shadow-lg shadow-purple-950/50 shrink-0`;
    }

    const lvlNumEl = document.getElementById('lockerLevelNum');
    const rankNameEl = document.getElementById('lockerRankName');
    const activeTitleEl = document.getElementById('lockerActiveTitle');
    const xpTextEl = document.getElementById('lockerXpText');
    const xpBarEl = document.getElementById('lockerXpBar');

    if (lvlNumEl) lvlNumEl.innerText = `NIVEAU ${level}`;
    if (rankNameEl) rankNameEl.innerText = rankObj.name;
    if (activeTitleEl) activeTitleEl.innerText = `« ${st.equippedTitle || rankObj.title} »`;
    if (xpTextEl) xpTextEl.innerText = `${xp.toLocaleString('fr-FR')} / ${nextTarget.toLocaleString('fr-FR')} XP`;
    if (xpBarEl) xpBarEl.style.width = `${progressPct}%`;

    const locker = document.getElementById('rewardsLockerContainer');
    if (!locker) return;

    locker.innerHTML = `
      <div class="glass-card p-5 space-y-4 border border-slate-800/90">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <h3 class="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <i class="fa-solid fa-medal text-amber-400"></i> Casier de Récompenses (Titres & Cadres XP)
          </h3>
          <span class="text-[11px] font-bold text-slate-400">Débloqués automatiquement avec tes défis</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          ${REWARD_ITEMS.map(item => {
            const unlocked = level >= item.level;
            const isTitle = item.type === 'Titre';
            const isEquipped = isTitle ? (st.equippedTitle === item.label) : (st.equippedBorder === item.borderClass);
            const btnAction = isTitle
              ? `equipRewardItem('title', '${item.label.replace(/'/g, "\'")}')`
              : `equipRewardItem('border', '${item.borderClass}')`;

            return `
              <div class="p-3.5 rounded-xl bg-slate-950/80 border ${unlocked ? (isEquipped ? 'border-pink-500/60' : 'border-purple-500/30') : 'border-slate-800/70 opacity-60'} flex flex-col justify-between gap-2.5">
                <div>
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-900 text-purple-300 border border-slate-800">${item.type} • Niv. ${item.level}</span>
                    ${!isTitle ? `<span class="w-5 h-5 rounded-md bg-gradient-to-tr ${item.borderClass} inline-block border border-white/20"></span>` : ''}
                  </div>
                  <div class="text-xs font-black text-white mt-2">${item.label}</div>
                  <div class="text-[11px] text-slate-400 mt-0.5">${item.desc}</div>
                </div>
                <div>
                  ${unlocked
                    ? `<button type="button" onclick="${btnAction}" class="w-full py-1.5 px-3 rounded-lg text-[11px] font-extrabold uppercase tracking-wider transition ${
                        isEquipped
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-purple-600 hover:bg-purple-500 text-white'
                      }">${isEquipped ? 'Équipé' : 'Équiper'}</button>`
                    : `<div class="w-full py-1.5 px-3 rounded-lg text-[11px] font-bold text-center bg-slate-900 text-slate-500 border border-slate-800"><i class="fa-solid fa-lock mr-1"></i> Niveau ${item.level} requis</div>`
                  }
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  };
})();
