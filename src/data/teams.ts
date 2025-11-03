export type Player = {
  id: string;
  name: string;
  role: "Batsman" | "Bowler" | "All-rounder" | "Wicket-keeper";
  session?: string;
  avatar?: string;
};

export type DepartmentKey = "csit" | "cce" | "pme" | "eee" | "mathematics";

export type DepartmentTeam = {
  key: DepartmentKey;
  name: string;
  short: string;
  description: string;
  captain?: string;
  coach?: string;
  achievements?: string[];
  players: Player[];
};

export const departments: Record<DepartmentKey, DepartmentTeam> = {
  csit: {
    key: "csit",
    name: "Computer Science & Information Technology",
    short: "CSIT",
    description: "Tech-driven cricketing excellence. Where data meets discipline and passion.",
    captain: undefined,
    coach: undefined,
    achievements: [],
    players: [],
  },
  cce: {
    key: "cce",
    name: "Computer & Communication Engineering",
    short: "CCE",
    description: "Communication, coordination, and classy stroke play.",
    achievements: [],
    players: [],
  },
  pme: {
    key: "pme",
    name: "Power & Mechanical Engineering",
    short: "PME",
    description: "Power hitters with precision mechanics on the field.",
    achievements: [],
    players: [],
  },
  eee: {
    key: "eee",
    name: "Electrical & Electronic Engineering",
    short: "EEE",
    description: "Electrifying pace, charged fielding, and smart tactics.",
    achievements: [],
    players: [],
  },
  mathematics: {
    key: "mathematics",
    name: "Mathematics",
    short: "Mathematics",
    description: "Calculated shots, perfect angles, and strategic gameplay.",
    achievements: [],
    players: [],
  },
};

export const departmentList: DepartmentTeam[] = Object.values(departments);
