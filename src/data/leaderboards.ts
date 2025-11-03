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
