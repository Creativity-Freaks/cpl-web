export type MatchStatus = "live" | "upcoming" | "completed";

export type Match = {
  id: string;
  status: MatchStatus;
  startTime: string; // ISO
  venue: string;
  teamA: { name: string; score?: string; overs?: string };
  teamB: { name: string; score?: string; overs?: string };
  toss?: string;
  result?: string; // for completed
  note?: string; // live update note
  // Optional scorecard data
  battingA?: Array<{ name: string; runs: number; balls: number; fours: number; sixes: number; sr: number; howOut?: string }>;
  battingB?: Array<{ name: string; runs: number; balls: number; fours: number; sixes: number; sr: number; howOut?: string }>;
  bowlingA?: Array<{ name: string; overs: string; maidens?: number; runs: number; wickets: number; eco: number }>; // A bowled to B
  bowlingB?: Array<{ name: string; overs: string; maidens?: number; runs: number; wickets: number; eco: number }>; // B bowled to A
  extrasA?: { b: number; lb: number; w: number; nb: number; p: number };
  extrasB?: { b: number; lb: number; w: number; nb: number; p: number };
  fowA?: Array<{ runs: number; wicket: number; over: string; batter: string }>;
  fowB?: Array<{ runs: number; wicket: number; over: string; batter: string }>;
  partnershipsA?: Array<{ bat1: string; bat2: string; runs: number; balls: number }>;
  partnershipsB?: Array<{ bat1: string; bat2: string; runs: number; balls: number }>;
  commentary?: Array<{ over: number; ball: number; text: string; batsman?: string; bowler?: string; runs?: number; wicket?: boolean }>;
  playerOfTheMatch?: { name: string; team: string; performance?: string };
};

export type Tournament = {
  id: string;
  title: string;
  description: string;
  date: string;
  teams: number;
  venue: string;
  status: "Live" | "Upcoming" | "Completed";
  statusColor: string;
  champion?: string;
  runnerUp?: string;
  matches: Match[];
};

// Removed the `getTournament` function as it relied on the deleted `tournaments` constant.
