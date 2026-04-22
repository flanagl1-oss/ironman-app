
export type Discipline = "Swim" | "Bike" | "Run" | "Strength" | "Rest" | "Other";

export type PlannedSession = {
  title: string;
  discipline: Discipline | string;
  minutes: number;
  effort: string;
  notes: string;
  completed: boolean;
  matchedActivityId: string;
};

export type PlannedDay = {
  date: string;
  week: string;
  day: string;
  sessions: PlannedSession[];
};

export type ImportedActivity = {
  id: string;
  source: "Strava" | "Polar" | "Manual";
  name: string;
  discipline: string;
  date: string;
  minutes: number;
  distanceKm?: number;
};
