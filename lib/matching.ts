
import { ImportedActivity, PlannedDay } from "./types";

export function normalizeDiscipline(value: string) {
  const v = value.toLowerCase();
  if (v.includes("bike") || v.includes("ride") || v.includes("cycling")) return "Bike";
  if (v.includes("run")) return "Run";
  if (v.includes("swim")) return "Swim";
  if (v.includes("strength") || v.includes("gym")) return "Strength";
  if (v.includes("rest")) return "Rest";
  return "Other";
}

export function autoMatch(plan: PlannedDay[], activities: ImportedActivity[]) {
  return plan.map((day) => {
    const used = new Set<string>();
    const sessions = day.sessions.map((session) => {
      if (normalizeDiscipline(session.discipline) === "Rest") return session;
      const match = activities.find((a) => {
        if (used.has(a.id)) return false;
        const sameDate = a.date.slice(0, 10) === day.date;
        const sameDiscipline = normalizeDiscipline(a.discipline) === normalizeDiscipline(session.discipline);
        const closeDuration = Math.abs((a.minutes ?? 0) - (session.minutes ?? 0)) <= 25;
        return sameDate && sameDiscipline && closeDuration;
      });
      if (!match) return session;
      used.add(match.id);
      return { ...session, completed: true, matchedActivityId: match.id };
    });
    return { ...day, sessions };
  });
}
