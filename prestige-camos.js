// 1. Définir les 4 images universelles une seule fois
export const PRESTIGE_CAMOS = [
  {
    id: "pyroclast",
    name: "Pyroclast",
    requirement: "Prestige 1 - Niveau 1",
    description: "Roche volcanique sombre parcourue de fissures de lave orange.",
    image: "images/camos/pyroclast.svg"
  },
  {
    id: "terminus",
    name: "Pyroclast Terminus",
    requirement: "Prestige 1 - Niveau Max",
    description: "Magma incandescente plus dense avec braises animées.",
    image: "images/camos/terminus.svg"
  },
  {
    id: "scatter",
    name: "Pyroclast Scatter",
    requirement: "Maîtrise - Niveau 150",
    description: "Éclats volcaniques cristallisés avec reflets rouge vif.",
    image: "images/camos/scatter.svg"
  },
  {
    id: "cascade",
    name: "Pyroclast Cascade",
    requirement: "Maîtrise - Niveau 250",
    description: "Coulée de lave fluide et lumineuse recouvrant toute l'arme.",
    image: "images/camos/cascade.svg"
  }
];

// 2. Injecter automatiquement ces 4 camouflages dans chaque arme
export function attachPrestigeCamos(weaponsList) {
  return weaponsList.map((weapon) => ({
    ...weapon,
    prestigeCamos: PRESTIGE_CAMOS
  }));
}

if (typeof window !== 'undefined') {
  window.PRESTIGE_CAMOS = PRESTIGE_CAMOS;
  window.attachPrestigeCamos = attachPrestigeCamos;
}
