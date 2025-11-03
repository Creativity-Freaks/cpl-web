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

export const tournaments: Tournament[] = [
  {
    id: "cpl-2026",
    title: "CSE Premier League 2026",
    description: "The main championship is currently underway",
    date: "December 1 - December 12, 2026",
    teams: 5,
    venue: "PSTU Cricket Ground",
    status: "Live",
    statusColor: "bg-red-500 animate-pulse",
    matches: [
      {
        id: "m1",
        status: "live",
        startTime: new Date().toISOString(),
        venue: "Ground A",
        teamA: { name: "CSIT", score: "142/3", overs: "16.2" },
        teamB: { name: "EEE", score: "--/--", overs: "--" },
        toss: "CSIT won the toss and elected to bat",
        note: "CRR 8.69 • Last over: 1 4 2 6 1 0",
        battingA: [
          { name: "A. Rahman", runs: 68, balls: 39, fours: 7, sixes: 3, sr: 174.4 },
          { name: "B. Hossain", runs: 34, balls: 24, fours: 4, sixes: 1, sr: 141.7 },
          { name: "C. Islam", runs: 21, balls: 15, fours: 2, sixes: 1, sr: 140.0 },
          { name: "D. Karim", runs: 10, balls: 8, fours: 1, sixes: 0, sr: 125.0, howOut: "c sub b Khan" },
          { name: "E. Alam", runs: 5, balls: 6, fours: 0, sixes: 0, sr: 83.3, howOut: "lbw b Khan" },
        ],
        bowlingB: [
          { name: "N. Khan", overs: "4.0", maidens: 0, runs: 28, wickets: 2, eco: 7.00 },
          { name: "R. Ahmed", overs: "3.2", maidens: 0, runs: 31, wickets: 1, eco: 9.30 },
          { name: "S. Roy", overs: "3.0", maidens: 0, runs: 29, wickets: 0, eco: 9.67 },
        ],
        extrasA: { b: 0, lb: 5, w: 7, nb: 2, p: 0 },
        fowA: [
          { runs: 48, wicket: 1, over: "6.2", batter: "D. Karim" },
          { runs: 97, wicket: 2, over: "12.5", batter: "E. Alam" },
          { runs: 130, wicket: 3, over: "15.4", batter: "C. Islam" },
        ],
        partnershipsA: [
          { bat1: "A. Rahman", bat2: "D. Karim", runs: 48, balls: 38 },
          { bat1: "A. Rahman", bat2: "E. Alam", runs: 49, balls: 39 },
          { bat1: "B. Hossain", bat2: "C. Islam", runs: 33, balls: 20 },
        ],
        commentary: [
          { over: 16, ball: 1, text: "Single to mid-wicket", batsman: "B. Hossain", bowler: "R. Ahmed", runs: 1 },
          { over: 16, ball: 2, text: "FOUR! Driven through covers", batsman: "B. Hossain", bowler: "R. Ahmed", runs: 4 },
          { over: 16, ball: 3, text: "Two runs, placed into the gap", batsman: "B. Hossain", bowler: "R. Ahmed", runs: 2 },
          { over: 16, ball: 4, text: "SIX! Lofted over long-on", batsman: "B. Hossain", bowler: "R. Ahmed", runs: 6 },
          { over: 16, ball: 5, text: "Single to deep square", batsman: "B. Hossain", bowler: "R. Ahmed", runs: 1 },
          { over: 16, ball: 6, text: "Dot ball, well bowled yorker", batsman: "B. Hossain", bowler: "R. Ahmed", runs: 0 },
        ],
      },
      {
        id: "m2",
        status: "upcoming",
        startTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
        venue: "Ground B",
        teamA: { name: "CCE" },
        teamB: { name: "Mathematics" },
      },
      {
        id: "m3",
        status: "completed",
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        venue: "Ground A",
        teamA: { name: "PME", score: "168/7", overs: "20" },
        teamB: { name: "CSIT", score: "170/5", overs: "19.3" },
        result: "CSIT won by 5 wickets",
        battingA: [
          { name: "F. Rahim", runs: 57, balls: 42, fours: 6, sixes: 1, sr: 135.7 },
          { name: "G. Das", runs: 33, balls: 27, fours: 3, sixes: 1, sr: 122.2 },
          { name: "H. Uddin", runs: 22, balls: 18, fours: 2, sixes: 1, sr: 122.2 },
        ],
        bowlingB: [
          { name: "F. Ahmed", overs: "4.0", maidens: 0, runs: 36, wickets: 2, eco: 9.00 },
          { name: "M. Rafi", overs: "4.0", maidens: 0, runs: 28, wickets: 2, eco: 7.00 },
        ],
        battingB: [
          { name: "A. Rahman", runs: 71, balls: 44, fours: 7, sixes: 2, sr: 161.4 },
          { name: "I. Kabir", runs: 45, balls: 29, fours: 4, sixes: 2, sr: 155.2 },
        ],
        bowlingA: [
          { name: "J. Hasan", overs: "4.0", maidens: 0, runs: 39, wickets: 2, eco: 9.75 },
          { name: "K. Mahmud", overs: "3.3", maidens: 0, runs: 41, wickets: 1, eco: 11.71 },
        ],
        extrasA: { b: 0, lb: 4, w: 6, nb: 1, p: 0 },
        extrasB: { b: 0, lb: 5, w: 8, nb: 0, p: 0 },
        fowA: [
          { runs: 62, wicket: 1, over: "8.3", batter: "G. Das" },
          { runs: 120, wicket: 2, over: "15.1", batter: "H. Uddin" },
        ],
        fowB: [
          { runs: 89, wicket: 1, over: "11.2", batter: "I. Kabir" },
          { runs: 133, wicket: 2, over: "16.5", batter: "A. Rahman" },
        ],
        partnershipsA: [
          { bat1: "F. Rahim", bat2: "G. Das", runs: 62, balls: 54 },
          { bat1: "F. Rahim", bat2: "H. Uddin", runs: 58, balls: 42 },
        ],
        partnershipsB: [
          { bat1: "A. Rahman", bat2: "I. Kabir", runs: 89, balls: 68 },
          { bat1: "A. Rahman", bat2: "Tail", runs: 44, balls: 27 },
        ],
        commentary: [
          { over: 19, ball: 1, text: "FOUR! Crunched through cover", runs: 4, batsman: "A. Rahman", bowler: "J. Hasan" },
          { over: 19, ball: 2, text: "Two runs, deep mid-wicket", runs: 2, batsman: "A. Rahman", bowler: "J. Hasan" },
          { over: 19, ball: 3, text: "Single to long-on", runs: 1, batsman: "A. Rahman", bowler: "J. Hasan" },
          { over: 19, ball: 4, text: "WICKET! Caught at point", wicket: true, batsman: "I. Kabir", bowler: "J. Hasan" },
          { over: 19, ball: 5, text: "Two runs, scores level", runs: 2, batsman: "New Batter", bowler: "J. Hasan" },
          { over: 19, ball: 6, text: "Single — CSIT win!", runs: 1, batsman: "New Batter", bowler: "J. Hasan" },
        ],
        playerOfTheMatch: { name: "A. Rahman", team: "CSIT", performance: "71 (44) in chase" },
      },
    ],
  },
  {
    id: "cpl-2027",
    title: "CSE Premier League 2027",
    description: "Next season's flagship championship",
    date: "December 2027",
    teams: 5,
    venue: "PSTU Cricket Ground",
    status: "Upcoming",
    statusColor: "bg-accent",
    matches: [],
  },
  // Past seasons (2015 - 2025)
  ...[
    2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015,
  ].map((year) => {
    const id = `cpl-${year}`;
    const champs = ["CSIT", "EEE", "CCE", "PME", "Mathematics"];
    const runnerUps = ["EEE", "CSIT", "PME", "CCE", "CSIT"];
    const idx = (2025 - year) % champs.length;
    return {
      id,
      title: `CSE Premier League ${year}`,
      description: `Season ${year} championship of CSE Premier League`,
      date: `December ${year}`,
      teams: 5,
      venue: "PSTU Cricket Ground",
      status: "Completed" as const,
      statusColor: "bg-muted",
      champion: champs[idx],
      runnerUp: runnerUps[idx],
      matches: [
        {
          id: `${id}-final`,
          status: "completed" as const,
          startTime: new Date(year, 11, 12, 16, 0, 0).toISOString(),
          venue: "Main Ground",
          teamA: { name: champs[idx], score: "--", overs: "20" },
          teamB: { name: runnerUps[idx], score: "--", overs: "20" },
          result: `${champs[idx]} crowned champions` ,
        },
      ],
    } satisfies Tournament;
  }),
];

export const getTournament = (id: string) => tournaments.find((t) => t.id === id);
