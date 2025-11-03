export type Standing = {
  team: "CSIT" | "CCE" | "PME" | "EEE" | "Mathematics";
  played: number;
  won: number;
  lost: number;
  nrr: number; // Net Run Rate
  points: number;
  last5: ("W" | "L")[]; // latest first
};

export type SeasonStanding = {
  seasonId: string; // e.g. cpl-2026
  seasonTitle: string; // e.g. CPL 2026
  table: Standing[];
};

export const currentStandings: SeasonStanding = {
  seasonId: "cpl-2026",
  seasonTitle: "CPL 2026",
  table: [
    { team: "CSIT", played: 4, won: 3, lost: 1, nrr: 0.812, points: 6, last5: ["W","W","L","W"] },
    { team: "EEE", played: 4, won: 3, lost: 1, nrr: 0.543, points: 6, last5: ["W","L","W","W"] },
    { team: "CCE", played: 4, won: 2, lost: 2, nrr: 0.103, points: 4, last5: ["L","W","L","W"] },
    { team: "PME", played: 4, won: 1, lost: 3, nrr: -0.485, points: 2, last5: ["L","W","L","L"] },
    { team: "Mathematics", played: 4, won: 1, lost: 3, nrr: -0.901, points: 2, last5: ["W","L","L","L"] },
  ],
};
