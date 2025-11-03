export type BattingLeader = {
  name: string;
  team: "CSIT" | "CCE" | "PME" | "EEE" | "Mathematics";
  runs: number;
  innings: number;
  average: number;
  strikeRate: number;
};

export type BowlingLeader = {
  name: string;
  team: "CSIT" | "CCE" | "PME" | "EEE" | "Mathematics";
  wickets: number;
  innings: number;
  economy: number;
  average: number;
};

export type SeasonLeaderboards = {
  seasonId: string;
  seasonTitle: string;
  batting: BattingLeader[];
  bowling: BowlingLeader[];
};

export const currentLeaderboards: SeasonLeaderboards = {
  seasonId: "cpl-2026",
  seasonTitle: "CPL 2026",
  batting: [
    { name: "A. Rahman", team: "CSIT", runs: 248, innings: 5, average: 62.0, strikeRate: 152.4 },
    { name: "M. Hasan", team: "EEE", runs: 221, innings: 5, average: 55.2, strikeRate: 148.9 },
    { name: "S. Karim", team: "CCE", runs: 198, innings: 5, average: 39.6, strikeRate: 141.3 },
    { name: "R. Islam", team: "PME", runs: 174, innings: 5, average: 34.8, strikeRate: 136.7 },
    { name: "T. Alam", team: "Mathematics", runs: 165, innings: 5, average: 33.0, strikeRate: 132.1 },
  ],
  bowling: [
    { name: "N. Khan", team: "EEE", wickets: 11, innings: 5, economy: 6.8, average: 12.3 },
    { name: "F. Ahmed", team: "CSIT", wickets: 10, innings: 5, economy: 7.2, average: 13.1 },
    { name: "J. Chowdhury", team: "CCE", wickets: 9, innings: 5, economy: 7.0, average: 14.2 },
    { name: "B. Roy", team: "PME", wickets: 8, innings: 5, economy: 7.6, average: 16.9 },
    { name: "K. Saha", team: "Mathematics", wickets: 7, innings: 5, economy: 7.9, average: 18.4 },
  ],
};
