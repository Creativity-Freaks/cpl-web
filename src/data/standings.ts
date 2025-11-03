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
