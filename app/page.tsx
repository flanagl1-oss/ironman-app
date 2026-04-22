"use client";

import { useEffect, useMemo, useState } from "react";

type Discipline = "Swim" | "Bike" | "Run" | "Strength" | "Rest" | "Other";

type PlannedSession = {
  title: string;
  discipline: Discipline | string;
  minutes: number;
  distance: number;
  distanceUnit: "km" | "m" | "yd";
  effort: string;
  notes: string;
  completed: boolean;
  matchedActivityId: string;
};

type PlannedDay = {
  date: string;
  week: string;
  day: string;
  status: string;
  sessions: PlannedSession[];
};

type ImportedActivity = {
  id: string;
  source: "Strava" | "Polar" | "Manual";
  name: string;
  discipline: string;
  date: string;
  minutes: number;
  distanceKm?: number;
};

const STORAGE_KEY = "ironman703_training_app_v4";
const ACTIVITIES_KEY = "ironman703_imported_activities_v2";

const seedPlan: PlannedDay[] = [
  { date: "2026-04-20", week: "Week 1", day: "Monday", status: "Not Started", sessions: [{ title: "Recovery Day", discipline: "Rest", minutes: 0, distance: 0, distanceUnit: "km", effort: "Rest", notes: "Take it easy; no training. Optional massage, nap, recovery habits.", completed: false, matchedActivityId: "" }] },
  { date: "2026-04-21", week: "Week 1", day: "Tuesday", status: "Not Started", sessions: [{ title: "Swim - Alternating Pull & Build", discipline: "Swim", minutes: 40, distance: 2000, distanceUnit: "yd", effort: "56-78% HR / 80-98% base pace", notes: "WU 500 easy; 3x400 alternating one up one down; CD 300.", completed: false, matchedActivityId: "" }, { title: "Run - Easy run 4 min / 1 min walk", discipline: "Run", minutes: 30, distance: 0, distanceUnit: "km", effort: "65-85% HR / 63-84% pace", notes: "Repeat 4 min run / 1 min walk for full session.", completed: false, matchedActivityId: "" }] },
  { date: "2026-04-22", week: "Week 1", day: "Wednesday", status: "Not Started", sessions: [{ title: "Swim - 70.3 Swim Test Set", discipline: "Swim", minutes: 56, distance: 2800, distanceUnit: "yd", effort: "Test", notes: "WU 200 build + drills; 3x400, 1000 time trial, then easy 100 and 200 cool down.", completed: false, matchedActivityId: "" }, { title: "Bike - Threshold Test", discipline: "Bike", minutes: 90, distance: 0, distanceUnit: "km", effort: "Threshold test", notes: "WU with openers; 30 min time-trial effort. Use avg HR of last 20 min if setting zones.", completed: false, matchedActivityId: "" }] },
  { date: "2026-04-23", week: "Week 1", day: "Thursday", status: "Not Started", sessions: [{ title: "Run - 30 min time trial test", discipline: "Run", minutes: 60, distance: 0, distanceUnit: "km", effort: "Test", notes: "WU 15 mins easy with pickups; 30 min TT on flat course/track; record HR data.", completed: false, matchedActivityId: "" }] },
  { date: "2026-04-24", week: "Week 1", day: "Friday", status: "Not Started", sessions: [{ title: "Swim - Easy mostly pulling", discipline: "Swim", minutes: 30, distance: 0, distanceUnit: "yd", effort: "Easy", notes: "Recovery and light strength/aerobic focus.", completed: false, matchedActivityId: "" }, { title: "Bike - Cadence variance", discipline: "Bike", minutes: 35, distance: 0, distanceUnit: "km", effort: "50-65% HR / 30-70% power", notes: "Z2 with 5 min cadence blocks at 60-70, 80-90 and 110-120 rpm.", completed: false, matchedActivityId: "" }] },
  { date: "2026-04-25", week: "Week 1", day: "Saturday", status: "Not Started", sessions: [{ title: "Bike - Easy ride", discipline: "Bike", minutes: 150, distance: 0, distanceUnit: "km", effort: "50-65% HR / 30-70% power", notes: "Comfortably high rpm aerobic ride; just bank time.", completed: false, matchedActivityId: "" }, { title: "Run - Transition Run Easy", discipline: "Run", minutes: 15, distance: 0, distanceUnit: "km", effort: "65-85% HR / 63-90% pace", notes: "Easy transition run off the bike.", completed: false, matchedActivityId: "" }] },
  { date: "2026-04-26", week: "Week 1", day: "Sunday", status: "Not Started", sessions: [{ title: "Run - Endurance run 5/1", discipline: "Run", minutes: 60, distance: 0, distanceUnit: "km", effort: "65-85% HR / 63-78% pace", notes: "Endurance run using 5/1 run-walk cycle.", completed: false, matchedActivityId: "" }, { title: "Bike - Easy ride", discipline: "Bike", minutes: 30, distance: 0, distanceUnit: "km", effort: "50-65% HR / 30-70% power", notes: "Easy aerobic maintenance ride.", completed: false, matchedActivityId: "" }] },
  { date: "2026-04-27", week: "Week 2", day: "Monday", status: "Not Started", sessions: [{ title: "Recovery Day", discipline: "Rest", minutes: 0, distance: 0, distanceUnit: "km", effort: "Rest", notes: "Take it easy; rest and recovery.", completed: false, matchedActivityId: "" }] },
  { date: "2026-04-28", week: "Week 2", day: "Tuesday", status: "Not Started", sessions: [{ title: "Swim - Alternating Pull & Build", discipline: "Swim", minutes: 56, distance: 2800, distanceUnit: "yd", effort: "56-78% HR / 80-98% base pace", notes: "WU 500 easy; 4x500 alternating pull and build; CD 300.", completed: false, matchedActivityId: "" }, { title: "Bike - Z2 Intervals", discipline: "Bike", minutes: 39, distance: 0, distanceUnit: "km", effort: "50-75% HR / 60-79% power", notes: "WU 5 min spin; 2 sets of 12 min Z2 with 2x45s HR intervals inside; 2 min easy between.", completed: false, matchedActivityId: "" }, { title: "Run - Easy run 4/1", discipline: "Run", minutes: 30, distance: 0, distanceUnit: "km", effort: "65-85% HR / 63-84% pace", notes: "Repeat 4/1 run-walk.", completed: false, matchedActivityId: "" }] },
  { date: "2026-04-29", week: "Week 2", day: "Wednesday", status: "Not Started", sessions: [{ title: "Swim - Recovery Swim", discipline: "Swim", minutes: 60, distance: 3000, distanceUnit: "yd", effort: "Easy", notes: "Pull, drills, walls, kick, and easy back; do not push.", completed: false, matchedActivityId: "" }, { title: "Bike - 10 min Z3 / 5 min Z2 repeated", discipline: "Bike", minutes: 60, distance: 0, distanceUnit: "km", effort: "Tempo", notes: "Warm-up easy, then repeat for duration, cool down 5 min.", completed: false, matchedActivityId: "" }] },
  { date: "2026-04-30", week: "Week 2", day: "Thursday", status: "Not Started", sessions: [{ title: "Run - Easy run 4/1", discipline: "Run", minutes: 40, distance: 0, distanceUnit: "km", effort: "65-85% HR / 63-84% pace", notes: "Repeat 4 min run / 1 min walk.", completed: false, matchedActivityId: "" }] },
  { date: "2026-05-01", week: "Week 2", day: "Friday", status: "Not Started", sessions: [{ title: "Swim - Easy mostly pulling", discipline: "Swim", minutes: 45, distance: 0, distanceUnit: "yd", effort: "Easy", notes: "Recovery and technique.", completed: false, matchedActivityId: "" }, { title: "Bike - Cadence variance", discipline: "Bike", minutes: 35, distance: 0, distanceUnit: "km", effort: "50-65% HR / 30-70% power", notes: "Cadence blocks in Z2.", completed: false, matchedActivityId: "" }] },
  { date: "2026-05-02", week: "Week 2", day: "Saturday", status: "Not Started", sessions: [{ title: "Bike - Easy ride", discipline: "Bike", minutes: 180, distance: 0, distanceUnit: "km", effort: "50-65% HR / 30-70% power", notes: "Comfortably high rpm aerobic ride.", completed: false, matchedActivityId: "" }, { title: "Run - Transition Run Easy", discipline: "Run", minutes: 20, distance: 0, distanceUnit: "km", effort: "65-85% HR / 63-90% pace", notes: "Easy transition run off the bike.", completed: false, matchedActivityId: "" }] },
  { date: "2026-05-03", week: "Week 2", day: "Sunday", status: "Not Started", sessions: [{ title: "Run - Endurance run 6/1", discipline: "Run", minutes: 70, distance: 0, distanceUnit: "km", effort: "65-85% HR / 63-78% pace", notes: "Endurance run using 6/1 run-walk cycle.", completed: false, matchedActivityId: "" }, { title: "Bike - Easy ride", discipline: "Bike", minutes: 45, distance: 0, distanceUnit: "km", effort: "50-65% HR / 30-70% power", notes: "Easy aerobic maintenance ride.", completed: false, matchedActivityId: "" }] },
  { date: "2026-05-04", week: "Week 3", day: "Monday", status: "Not Started", sessions: [{ title: "Run", discipline: "Run", minutes: 53, distance: 0, distanceUnit: "km", effort: "Hard/Threshold", notes: "15' Z2, 3x4' low Z4, 3' Z2, 3x4' low Z4, 5' cool down.", completed: false, matchedActivityId: "" }, { title: "Swim (2200)", discipline: "Swim", minutes: 44, distance: 2200, distanceUnit: "m", effort: "Hard/Threshold", notes: "Pull/drill WU; mixed pull + FS Z3/Z4/Z5 main set; warm down.", completed: false, matchedActivityId: "" }] },
  { date: "2026-05-05", week: "Week 3", day: "Tuesday", status: "Not Started", sessions: [{ title: "Bike", discipline: "Bike", minutes: 63, distance: 0, distanceUnit: "km", effort: "Steady/Endurance", notes: "10'+9'+8'+7' upper Z2 with 1' recoveries.", completed: false, matchedActivityId: "" }, { title: "Strength & Conditioning", discipline: "Strength", minutes: 15, distance: 0, distanceUnit: "km", effort: "Steady/Endurance", notes: "Per coach video.", completed: false, matchedActivityId: "" }] },
  { date: "2026-05-06", week: "Week 3", day: "Wednesday", status: "Not Started", sessions: [{ title: "Swim (2600)", discipline: "Swim", minutes: 52, distance: 2600, distanceUnit: "m", effort: "Hard/Threshold", notes: "Progressive 3x500 sets through Z2-Z5 plus pull.", completed: false, matchedActivityId: "" }] },
  { date: "2026-05-07", week: "Week 3", day: "Thursday", status: "Not Started", sessions: [{ title: "Bike", discipline: "Bike", minutes: 56, distance: 0, distanceUnit: "km", effort: "Mod. Hard/Tempo", notes: "15'+12'+8' upper Z3 with 2' recoveries.", completed: false, matchedActivityId: "" }, { title: "Run Off The Bike", discipline: "Run", minutes: 15, distance: 0, distanceUnit: "km", effort: "Hard/Steady", notes: "First 5' in Z4 then settle into Z2.", completed: false, matchedActivityId: "" }] },
  { date: "2026-05-08", week: "Week 3", day: "Friday", status: "Not Started", sessions: [{ title: "Rest Day", discipline: "Rest", minutes: 0, distance: 0, distanceUnit: "km", effort: "Rest", notes: "Recovery day.", completed: false, matchedActivityId: "" }] },
  { date: "2026-05-09", week: "Week 3", day: "Saturday", status: "Not Started", sessions: [{ title: "Race Practice Bike", discipline: "Bike", minutes: 180, distance: 0, distanceUnit: "km", effort: "Mod. Hard/Tempo", notes: "20' Z2 then 8x(10' Z3 + 5' Z2), cool down.", completed: false, matchedActivityId: "" }, { title: "Run Off The Bike", discipline: "Run", minutes: 20, distance: 0, distanceUnit: "km", effort: "Mod. Hard/Steady", notes: "10' Z3 then Z2 finish.", completed: false, matchedActivityId: "" }] },
  { date: "2026-05-10", week: "Week 3", day: "Sunday", status: "Not Started", sessions: [{ title: "Run", discipline: "Run", minutes: 90, distance: 0, distanceUnit: "km", effort: "Steady/Endurance", notes: "All in Z2.", completed: false, matchedActivityId: "" }, { title: "Open Water Swim (1800)", discipline: "Swim", minutes: 36, distance: 1800, distanceUnit: "m", effort: "Steady/Endurance", notes: "Easy familiarization swim.", completed: false, matchedActivityId: "" }] },
  { date: "2026-05-11", week: "Week 4", day: "Monday", status: "Not Started", sessions: [{ title: "Run", discipline: "Run", minutes: 58, distance: 0, distanceUnit: "km", effort: "Hard/Threshold", notes: "4x4' low Z4, 3' Z2, then 3x4' low Z4.", completed: false, matchedActivityId: "" }, { title: "Swim (2200)", discipline: "Swim", minutes: 44, distance: 2200, distanceUnit: "m", effort: "Hard/Threshold", notes: "Pull/drill WU, 200/100 repeats through Z3-Z5.", completed: false, matchedActivityId: "" }] },
  { date: "2026-05-12", week: "Week 4", day: "Tuesday", status: "Not Started", sessions: [{ title: "Bike", discipline: "Bike", minutes: 57, distance: 0, distanceUnit: "km", effort: "Steady/Endurance", notes: "15'+13'+11' upper Z2 with recoveries.", completed: false, matchedActivityId: "" }, { title: "Strength & Conditioning", discipline: "Strength", minutes: 15, distance: 0, distanceUnit: "km", effort: "Steady/Endurance", notes: "Per coach video.", completed: false, matchedActivityId: "" }] },
  { date: "2026-05-13", week: "Week 4", day: "Wednesday", status: "Not Started", sessions: [{ title: "Swim (2600)", discipline: "Swim", minutes: 52, distance: 2600, distanceUnit: "m", effort: "Hard/Threshold", notes: "400s and 200s in Z4 plus pull.", completed: false, matchedActivityId: "" }] },
  { date: "2026-05-14", week: "Week 4", day: "Thursday", status: "Not Started", sessions: [{ title: "Bike", discipline: "Bike", minutes: 61, distance: 0, distanceUnit: "km", effort: "Mod. Hard/Tempo", notes: "18'+13'+9' upper Z3 with 2' recoveries.", completed: false, matchedActivityId: "" }, { title: "Run Off the Bike", discipline: "Run", minutes: 15, distance: 0, distanceUnit: "km", effort: "Hard/Steady", notes: "First 5' Z4 then settle into Z2.", completed: false, matchedActivityId: "" }] },
  { date: "2026-05-15", week: "Week 4", day: "Friday", status: "Not Started", sessions: [{ title: "Rest Day", discipline: "Rest", minutes: 0, distance: 0, distanceUnit: "km", effort: "Rest", notes: "Rest day.", completed: false, matchedActivityId: "" }] },
  { date: "2026-05-16", week: "Week 4", day: "Saturday", status: "Not Started", sessions: [{ title: "Race Practice Bike", discipline: "Bike", minutes: 195, distance: 0, distanceUnit: "km", effort: "Mod. Hard/Tempo", notes: "35' Z2 then 6x(15' Z3 + 5' Z2), cool down.", completed: false, matchedActivityId: "" }, { title: "Run Off The Bike", discipline: "Run", minutes: 25, distance: 0, distanceUnit: "km", effort: "Mod. Hard/Steady", notes: "5' Z3 then Z2.", completed: false, matchedActivityId: "" }] },
  { date: "2026-05-17", week: "Week 4", day: "Sunday", status: "Not Started", sessions: [{ title: "Run", discipline: "Run", minutes: 95, distance: 0, distanceUnit: "km", effort: "Steady/Endurance", notes: "All in Z2.", completed: false, matchedActivityId: "" }, { title: "Open Water Swim (2200)", discipline: "Swim", minutes: 44, distance: 2200, distanceUnit: "m", effort: "Mod. Hard/Tempo", notes: "2x800 Z3 plus warm up/down.", completed: false, matchedActivityId: "" }] },
  { date: "2026-05-18", week: "Week 5", day: "Monday", status: "Not Started", sessions: [{ title: "Bike", discipline: "Bike", minutes: 60, distance: 0, distanceUnit: "km", effort: "Steady/Endurance", notes: "5x(5' upper Z2 + 3' mid Z2).", completed: false, matchedActivityId: "" }, { title: "Swim", discipline: "Swim", minutes: 48, distance: 2400, distanceUnit: "m", effort: "Hard/Threshold", notes: "Pull/drill WU then mixed Z3-Z5 set.", completed: false, matchedActivityId: "" }] },
  { date: "2026-05-19", week: "Week 5", day: "Tuesday", status: "Not Started", sessions: [{ title: "Run", discipline: "Run", minutes: 63, distance: 0, distanceUnit: "km", effort: "Hard/Threshold", notes: "4x4' low Z4, 3' recovery, then repeat.", completed: false, matchedActivityId: "" }, { title: "Strength & Conditioning", discipline: "Strength", minutes: 15, distance: 0, distanceUnit: "km", effort: "Hard/Threshold", notes: "Per coach video.", completed: false, matchedActivityId: "" }] },
  { date: "2026-05-20", week: "Week 5", day: "Wednesday", status: "Not Started", sessions: [{ title: "Swim (2600)", discipline: "Swim", minutes: 52, distance: 2600, distanceUnit: "m", effort: "Hard/Threshold", notes: "Progressive 3x500 through Z2-Z5 plus pull.", completed: false, matchedActivityId: "" }] },
  { date: "2026-05-21", week: "Week 5", day: "Thursday", status: "Not Started", sessions: [{ title: "Bike", discipline: "Bike", minutes: 66, distance: 0, distanceUnit: "km", effort: "Mod. Hard/Tempo", notes: "20'+15'+10' upper Z3 with 2' recoveries.", completed: false, matchedActivityId: "" }, { title: "Run Off the Bike", discipline: "Run", minutes: 15, distance: 0, distanceUnit: "km", effort: "Hard/Steady", notes: "First 5' Z4 then settle to Z2.", completed: false, matchedActivityId: "" }] },
  { date: "2026-05-22", week: "Week 5", day: "Friday", status: "Not Started", sessions: [{ title: "Rest Day", discipline: "Rest", minutes: 0, distance: 0, distanceUnit: "km", effort: "Rest", notes: "Rest day.", completed: false, matchedActivityId: "" }] },
  { date: "2026-05-23", week: "Week 5", day: "Saturday", status: "Not Started", sessions: [{ title: "Race Practice Bike", discipline: "Bike", minutes: 210, distance: 0, distanceUnit: "km", effort: "Mod. Hard/Tempo", notes: "30' Z2 then 7x(15' Z3 + 5' Z2), cool down.", completed: false, matchedActivityId: "" }, { title: "Run Off the Bike", discipline: "Run", minutes: 30, distance: 0, distanceUnit: "km", effort: "Mod.Hard/Steady", notes: "5' Z3 then Z2.", completed: false, matchedActivityId: "" }] },
  { date: "2026-05-24", week: "Week 5", day: "Sunday", status: "Not Started", sessions: [{ title: "Race Practice Run", discipline: "Run", minutes: 100, distance: 0, distanceUnit: "km", effort: "Steady/Endurance", notes: "All in Z2.", completed: false, matchedActivityId: "" }, { title: "Open Water Swim (2400)", discipline: "Swim", minutes: 48, distance: 2400, distanceUnit: "m", effort: "Mod. Hard/Tempo", notes: "3x700 Z3 plus warm up/down.", completed: false, matchedActivityId: "" }] },
  { date: "2026-05-25", week: "Week 6", day: "Monday", status: "Not Started", sessions: [{ title: "Rest Day", discipline: "Rest", minutes: 0, distance: 0, distanceUnit: "km", effort: "Rest", notes: "Recovery week. Fully recover and absorb training.", completed: false, matchedActivityId: "" }] },
  { date: "2026-05-26", week: "Week 6", day: "Tuesday", status: "Not Started", sessions: [{ title: "Bike", discipline: "Bike", minutes: 52, distance: 0, distanceUnit: "km", effort: "Hard/Threshold", notes: "9x2' upper Z4 to low Z5 with 90s recoveries.", completed: false, matchedActivityId: "" }, { title: "Strength & Conditioning", discipline: "Strength", minutes: 15, distance: 0, distanceUnit: "km", effort: "Hard/Threshold", notes: "Per coach video.", completed: false, matchedActivityId: "" }] },
  { date: "2026-05-27", week: "Week 6", day: "Wednesday", status: "Not Started", sessions: [{ title: "Swim (2100)", discipline: "Swim", minutes: 42, distance: 2100, distanceUnit: "m", effort: "Endurance/Tech", notes: "Drills, pull, kick and technique focus.", completed: false, matchedActivityId: "" }] },
  { date: "2026-05-28", week: "Week 6", day: "Thursday", status: "Not Started", sessions: [{ title: "Run", discipline: "Run", minutes: 35, distance: 0, distanceUnit: "km", effort: "Hard/Threshold", notes: "10' easy, 20' in Z4, 5' easy.", completed: false, matchedActivityId: "" }, { title: "Strength & Conditioning", discipline: "Strength", minutes: 15, distance: 0, distanceUnit: "km", effort: "Hard/Threshold", notes: "Per coach video.", completed: false, matchedActivityId: "" }] },
  { date: "2026-05-29", week: "Week 6", day: "Friday", status: "Not Started", sessions: [{ title: "Rest Day", discipline: "Rest", minutes: 0, distance: 0, distanceUnit: "km", effort: "Rest", notes: "Rest day.", completed: false, matchedActivityId: "" }] },
  { date: "2026-05-30", week: "Week 6", day: "Saturday", status: "Not Started", sessions: [{ title: "Bike", discipline: "Bike", minutes: 120, distance: 0, distanceUnit: "km", effort: "Steady/Endurance", notes: "Easy/steady Z2 ride.", completed: false, matchedActivityId: "" }, { title: "Run Off the Bike", discipline: "Run", minutes: 60, distance: 0, distanceUnit: "km", effort: "Steady/Endurance", notes: "Z2 steady run off the bike.", completed: false, matchedActivityId: "" }] },
  { date: "2026-05-31", week: "Week 6", day: "Sunday", status: "Not Started", sessions: [{ title: "Open Water Swim (2000)", discipline: "Swim", minutes: 44, distance: 2000, distanceUnit: "m", effort: "Mod. Hard/Tempo", notes: "Beach/deep water starts then 1000 steady.", completed: false, matchedActivityId: "" }] },
  { date: "2026-06-01", week: "Week 7", day: "Monday", status: "Not Started", sessions: [{ title: "Run", discipline: "Run", minutes: 52, distance: 0, distanceUnit: "km", effort: "V. Hard/VO2 Max", notes: "90s reps, 3' reps, then 6' in Z4.", completed: false, matchedActivityId: "" }, { title: "Swim", discipline: "Swim", minutes: 40, distance: 2000, distanceUnit: "m", effort: "Endurance/Tech", notes: "Breathing control and drill set.", completed: false, matchedActivityId: "" }] },
  { date: "2026-06-02", week: "Week 7", day: "Tuesday", status: "Not Started", sessions: [{ title: "Bike", discipline: "Bike", minutes: 62, distance: 0, distanceUnit: "km", effort: "Hard/Threshold", notes: "6'+7'+8'+7'+6' in Z4 with recoveries.", completed: false, matchedActivityId: "" }, { title: "Run Off the Bike", discipline: "Run", minutes: 15, distance: 0, distanceUnit: "km", effort: "Hard/Steady", notes: "First 5' Z4 then Z2.", completed: false, matchedActivityId: "" }] },
  { date: "2026-06-03", week: "Week 7", day: "Wednesday", status: "Not Started", sessions: [{ title: "Swim (2800)", discipline: "Swim", minutes: 65, distance: 2800, distanceUnit: "m", effort: "Hard/Threshold", notes: "400s and 200s Z4 set.", completed: false, matchedActivityId: "" }] },
  { date: "2026-06-04", week: "Week 7", day: "Thursday", status: "Not Started", sessions: [{ title: "Bike", discipline: "Bike", minutes: 90, distance: 0, distanceUnit: "km", effort: "Steady/Endurance", notes: "Mostly in Z2.", completed: false, matchedActivityId: "" }, { title: "Strength & Conditioning", discipline: "Strength", minutes: 15, distance: 0, distanceUnit: "km", effort: "Steady/Endurance", notes: "Per coach video.", completed: false, matchedActivityId: "" }] },
  { date: "2026-06-05", week: "Week 7", day: "Friday", status: "Not Started", sessions: [{ title: "Rest Day", discipline: "Rest", minutes: 0, distance: 0, distanceUnit: "km", effort: "Rest", notes: "Rest day.", completed: false, matchedActivityId: "" }] },
  { date: "2026-06-06", week: "Week 7", day: "Saturday", status: "Not Started", sessions: [{ title: "Race Practice Bike", discipline: "Bike", minutes: 168, distance: 0, distanceUnit: "km", effort: "Mod. Hard/Tempo", notes: "1h Z2 then 6x(10' Z3 + 3' Z2), cool down.", completed: false, matchedActivityId: "" }, { title: "Run Off The Bike", discipline: "Run", minutes: 35, distance: 0, distanceUnit: "km", effort: "Mod. Hard/Steady", notes: "5' Z3 then Z2.", completed: false, matchedActivityId: "" }] },
  { date: "2026-06-07", week: "Week 7", day: "Sunday", status: "Not Started", sessions: [{ title: "Run", discipline: "Run", minutes: 105, distance: 0, distanceUnit: "km", effort: "Steady/Endurance", notes: "All in Z2.", completed: false, matchedActivityId: "" }, { title: "Open Water Swim (2800)", discipline: "Swim", minutes: 48, distance: 2800, distanceUnit: "m", effort: "Mod. Hard/Tempo", notes: "3x800 Z3 plus warm up/down.", completed: false, matchedActivityId: "" }] },
  { date: "2026-06-08", week: "Week 8", day: "Monday", status: "Not Started", sessions: [{ title: "Run", discipline: "Run", minutes: 43, distance: 0, distanceUnit: "km", effort: "V. Hard/VO2 Max", notes: "7x2' in Z5 with 2' recoveries.", completed: false, matchedActivityId: "" }, { title: "Swim", discipline: "Swim", minutes: 36, distance: 1800, distanceUnit: "m", effort: "Steady/Endurance", notes: "Steady aerobic swim with pull.", completed: false, matchedActivityId: "" }] },
  { date: "2026-06-09", week: "Week 8", day: "Tuesday", status: "Not Started", sessions: [{ title: "Bike", discipline: "Bike", minutes: 50, distance: 0, distanceUnit: "km", effort: "Hard/Threshold", notes: "5x5' Z4 with 2' recoveries.", completed: false, matchedActivityId: "" }, { title: "Run Off the Bike", discipline: "Run", minutes: 15, distance: 0, distanceUnit: "km", effort: "Hard/Steady", notes: "First 5' Z4 then Z2.", completed: false, matchedActivityId: "" }] },
  { date: "2026-06-10", week: "Week 8", day: "Wednesday", status: "Not Started", sessions: [{ title: "Swim (2600)", discipline: "Swim", minutes: 52, distance: 2600, distanceUnit: "m", effort: "Hard/Threshold", notes: "3x500 through Z2-Z5 plus pull.", completed: false, matchedActivityId: "" }] },
  { date: "2026-06-11", week: "Week 8", day: "Thursday", status: "Not Started", sessions: [{ title: "Bike", discipline: "Bike", minutes: 90, distance: 0, distanceUnit: "km", effort: "Steady/Endurance", notes: "Ride mostly in Z2.", completed: false, matchedActivityId: "" }, { title: "Strength & Conditioning", discipline: "Strength", minutes: 15, distance: 0, distanceUnit: "km", effort: "Steady/Endurance", notes: "Per coach video.", completed: false, matchedActivityId: "" }] },
  { date: "2026-06-12", week: "Week 8", day: "Friday", status: "Not Started", sessions: [{ title: "Rest Day", discipline: "Rest", minutes: 0, distance: 0, distanceUnit: "km", effort: "Rest", notes: "Start of gradual taper.", completed: false, matchedActivityId: "" }] },
  { date: "2026-06-13", week: "Week 8", day: "Saturday", status: "Not Started", sessions: [{ title: "Race Practice Bike", discipline: "Bike", minutes: 122, distance: 0, distanceUnit: "km", effort: "Mod. Hard/Tempo", notes: "30' Z2 then 4x(15' Z3 + 3' Z2), cool down.", completed: false, matchedActivityId: "" }, { title: "Run Off the Bike", discipline: "Run", minutes: 60, distance: 0, distanceUnit: "km", effort: "Mod.Hard/Steady", notes: "15' Z3 then Z2; take gels after 20 and 45 min.", completed: false, matchedActivityId: "" }] },
  { date: "2026-06-14", week: "Week 8", day: "Sunday", status: "Not Started", sessions: [{ title: "Run", discipline: "Run", minutes: 60, distance: 0, distanceUnit: "km", effort: "Steady/Endurance", notes: "Conversational Z1-Z2.", completed: false, matchedActivityId: "" }, { title: "Open Water Swim (3000)", discipline: "Swim", minutes: 56, distance: 3000, distanceUnit: "m", effort: "Mod. Hard/Tempo", notes: "3x900 Z3 plus warm up/down.", completed: false, matchedActivityId: "" }] },
  { date: "2026-06-15", week: "Week 9", day: "Monday", status: "Not Started", sessions: [{ title: "Race Pace Swim", discipline: "Swim", minutes: 38, distance: 1900, distanceUnit: "m", effort: "Mod. Hard/Tempo", notes: "300 easy, 1500 race pace, 100 easy.", completed: false, matchedActivityId: "" }, { title: "Strength & Conditioning", discipline: "Strength", minutes: 15, distance: 0, distanceUnit: "km", effort: "Mod. Hard/Tempo", notes: "Per coach video.", completed: false, matchedActivityId: "" }] },
  { date: "2026-06-16", week: "Week 9", day: "Tuesday", status: "Not Started", sessions: [{ title: "Bike", discipline: "Bike", minutes: 43, distance: 0, distanceUnit: "km", effort: "Hard/Threshold", notes: "4'+5'+6'+5' low Z4 blocks.", completed: false, matchedActivityId: "" }, { title: "Run Off The Bike", discipline: "Run", minutes: 15, distance: 0, distanceUnit: "km", effort: "Steady/Endurance", notes: "All in Z2.", completed: false, matchedActivityId: "" }] },
  { date: "2026-06-17", week: "Week 9", day: "Wednesday", status: "Not Started", sessions: [{ title: "Swim (2400)", discipline: "Swim", minutes: 48, distance: 2400, distanceUnit: "m", effort: "Hard/Threshold", notes: "400s and 200s Z4 set.", completed: false, matchedActivityId: "" }] },
  { date: "2026-06-18", week: "Week 9", day: "Thursday", status: "Not Started", sessions: [{ title: "Run", discipline: "Run", minutes: 38, distance: 0, distanceUnit: "km", effort: "V. Hard/VO2 Max", notes: "3x3' Z5 with 2' recoveries.", completed: false, matchedActivityId: "" }, { title: "Strength & Conditioning", discipline: "Strength", minutes: 15, distance: 0, distanceUnit: "km", effort: "V. Hard/VO2 Max", notes: "Per coach video.", completed: false, matchedActivityId: "" }] },
  { date: "2026-06-19", week: "Week 9", day: "Friday", status: "Not Started", sessions: [{ title: "Rest Day", discipline: "Rest", minutes: 0, distance: 0, distanceUnit: "km", effort: "Rest", notes: "Rest day.", completed: false, matchedActivityId: "" }] },
  { date: "2026-06-20", week: "Week 9", day: "Saturday", status: "Not Started", sessions: [{ title: "Race Practice Bike", discipline: "Bike", minutes: 106, distance: 0, distanceUnit: "km", effort: "Mod. Hard/Tempo", notes: "30' Z2 then 2x20' Z3-low Z4 with 3' recoveries.", completed: false, matchedActivityId: "" }, { title: "Run Off the Bike", discipline: "Run", minutes: 30, distance: 0, distanceUnit: "km", effort: "Mod. Hard/Tempo", notes: "15' Z3 then 15' Z2.", completed: false, matchedActivityId: "" }] },
  { date: "2026-06-21", week: "Week 9", day: "Sunday", status: "Not Started", sessions: [{ title: "Run", discipline: "Run", minutes: 45, distance: 0, distanceUnit: "km", effort: "Steady/Endurance", notes: "Nice and steady in Z2.", completed: false, matchedActivityId: "" }, { title: "Open Water Swim (2800)", discipline: "Swim", minutes: 48, distance: 2800, distanceUnit: "m", effort: "Mod. Hard/Tempo", notes: "3x800 Z3 plus warm up/down.", completed: false, matchedActivityId: "" }] },
  { date: "2026-06-22", week: "Week 10", day: "Monday", status: "Not Started", sessions: [{ title: "Rest Day", discipline: "Rest", minutes: 0, distance: 0, distanceUnit: "km", effort: "Rest", notes: "Double-check logistics and strategies this week.", completed: false, matchedActivityId: "" }] },
  { date: "2026-06-23", week: "Week 10", day: "Tuesday", status: "Not Started", sessions: [{ title: "Bike", discipline: "Bike", minutes: 35, distance: 0, distanceUnit: "km", effort: "Hard/Threshold", notes: "15' Z2, 4x3' Z4 with 1' recoveries, 5' cool down.", completed: false, matchedActivityId: "" }] },
  { date: "2026-06-24", week: "Week 10", day: "Wednesday", status: "Not Started", sessions: [{ title: "Run", discipline: "Run", minutes: 30, distance: 0, distanceUnit: "km", effort: "Hard/Threshold", notes: "15' easy, 10' low Z4, 5' easy.", completed: false, matchedActivityId: "" }, { title: "Swim", discipline: "Swim", minutes: 36, distance: 1800, distanceUnit: "m", effort: "Recovery Swim", notes: "Steady swim with pull and easy warm down.", completed: false, matchedActivityId: "" }] },
  { date: "2026-06-25", week: "Week 10", day: "Thursday", status: "Not Started", sessions: [{ title: "Run", discipline: "Run", minutes: 25, distance: 0, distanceUnit: "km", effort: "Easy Run", notes: "Easy Z2 run, preferably at race venue.", completed: false, matchedActivityId: "" }] },
  { date: "2026-06-26", week: "Week 10", day: "Friday", status: "Not Started", sessions: [{ title: "Bike", discipline: "Bike", minutes: 30, distance: 0, distanceUnit: "km", effort: "Easy Ride", notes: "Race bike check spin in Z2.", completed: false, matchedActivityId: "" }, { title: "Swim", discipline: "Swim", minutes: 30, distance: 1500, distanceUnit: "m", effort: "Easy Swim", notes: "Easy steady swim at race destination if possible.", completed: false, matchedActivityId: "" }] },
  { date: "2026-06-27", week: "Week 10", day: "Saturday", status: "Not Started", sessions: [{ title: "Rest Day", discipline: "Rest", minutes: 0, distance: 0, distanceUnit: "km", effort: "Rest", notes: "Rest day before race.", completed: false, matchedActivityId: "" }] },
  { date: "2026-06-28", week: "Week 10", day: "Sunday", status: "Not Started", sessions: [{ title: "Race Day", discipline: "Other", minutes: 0, distance: 0, distanceUnit: "km", effort: "Race", notes: "Good luck!", completed: false, matchedActivityId: "" }] }
];

function sameDate(a: string, b: string) {
  return a.slice(0, 10) === b.slice(0, 10);
}

function normalizeDiscipline(value: string) {
  const v = value.toLowerCase();
  if (v.includes("ride") || v.includes("bike") || v.includes("cycling")) return "Bike";
  if (v.includes("run")) return "Run";
  if (v.includes("swim")) return "Swim";
  if (v.includes("strength") || v.includes("gym")) return "Strength";
  if (v.includes("rest")) return "Rest";
  return "Other";
}

function formatDate(input: string) {
  const d = new Date(input + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function toKm(session: PlannedSession) {
  if (!session.distance) return 0;
  if (session.distanceUnit === "km") return session.distance;
  if (session.distanceUnit === "m") return session.distance / 1000;
  if (session.distanceUnit === "yd") return session.distance * 0.0009144;
  return session.distance;
}

function swimPacePer100m(minutes: number, session: PlannedSession) {
  const meters = session.distanceUnit === "m" ? session.distance : session.distanceUnit === "yd" ? session.distance * 0.9144 : session.distance * 1000;
  if (!minutes || !meters) return "-";
  const pace = minutes / (meters / 100);
  const mins = Math.floor(pace);
  const secs = Math.round((pace - mins) * 60).toString().padStart(2, "0");
  return `${mins}:${secs}/100m`;
}

function runPacePerKm(minutes: number, km: number) {
  if (!minutes || !km) return "-";
  const pace = minutes / km;
  const mins = Math.floor(pace);
  const secs = Math.round((pace - mins) * 60).toString().padStart(2, "0");
  return `${mins}:${secs}/km`;
}

function bikeSpeedKmH(minutes: number, km: number) {
  if (!minutes || !km) return "-";
  return `${(km / (minutes / 60)).toFixed(1)} km/h`;
}

function buildStatus(day: PlannedDay) {
  const trainingSessions = day.sessions.filter((s) => normalizeDiscipline(s.discipline) !== "Rest");
  if (!trainingSessions.length) return "Rest";
  const done = trainingSessions.filter((s) => s.completed).length;
  if (done === 0) return "Not Started";
  if (done === trainingSessions.length) return "Done";
  return "Partial";
}

function getColor(discipline: string) {
  switch (normalizeDiscipline(discipline)) {
    case "Swim": return "#dbeafe";
    case "Bike": return "#dcfce7";
    case "Run": return "#fee2e2";
    case "Strength": return "#fef3c7";
    case "Rest": return "#e5e7eb";
    default: return "#ede9fe";
  }
}

function MiniBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div style={{ height: 10, background: "#e5e7eb", borderRadius: 999 }}>
        <div style={{ width: `${max ? (value / max) * 100 : 0}%`, height: 10, background: color, borderRadius: 999 }} />
      </div>
    </div>
  );
}

export default function Page() {
  const [plan, setPlan] = useState<PlannedDay[]>(seedPlan);
  const [activities, setActivities] = useState<ImportedActivity[]>([]);
  const [tab, setTab] = useState<"dashboard" | "calendar" | "day" | "master" | "sync">("dashboard");
  const [selectedDate, setSelectedDate] = useState(seedPlan[0].date);
  const [importText, setImportText] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedActivities = localStorage.getItem(ACTIVITIES_KEY);
    if (saved) setPlan(JSON.parse(saved));
    if (savedActivities) setActivities(JSON.parse(savedActivities));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  }, [plan]);

  useEffect(() => {
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
  }, [activities]);

  const weeks = useMemo(() => {
    const grouped = new Map<string, PlannedDay[]>();
    for (const day of plan) {
      if (!grouped.has(day.week)) grouped.set(day.week, []);
      grouped.get(day.week)!.push(day);
    }
    return Array.from(grouped.entries()).map(([week, days]) => ({ week, days }));
  }, [plan]);

  const selectedDay = useMemo(() => plan.find((d) => d.date === selectedDate) ?? plan[0], [plan, selectedDate]);

  const weeklyStats = useMemo(() => {
    return weeks.map(({ week, days }) => {
      const sessions = days.flatMap((d) => d.sessions);
      const swimMin = sessions.filter((s) => normalizeDiscipline(s.discipline) === "Swim").reduce((a, b) => a + b.minutes, 0);
      const bikeMin = sessions.filter((s) => normalizeDiscipline(s.discipline) === "Bike").reduce((a, b) => a + b.minutes, 0);
      const runMin = sessions.filter((s) => normalizeDiscipline(s.discipline) === "Run").reduce((a, b) => a + b.minutes, 0);
      const swimKm = sessions.filter((s) => normalizeDiscipline(s.discipline) === "Swim").reduce((a, b) => a + toKm(b), 0);
      const bikeKm = sessions.filter((s) => normalizeDiscipline(s.discipline) === "Bike").reduce((a, b) => a + toKm(b), 0);
      const runKm = sessions.filter((s) => normalizeDiscipline(s.discipline) === "Run").reduce((a, b) => a + toKm(b), 0);
      const done = sessions.filter((s) => s.completed && normalizeDiscipline(s.discipline) !== "Rest").length;
      const planned = sessions.filter((s) => normalizeDiscipline(s.discipline) !== "Rest").length;
      return { week, swimMin, bikeMin, runMin, swimKm, bikeKm, runKm, done, planned };
    });
  }, [weeks]);

  const maxima = useMemo(() => ({
    swimMin: Math.max(...weeklyStats.map((w) => w.swimMin), 1),
    bikeMin: Math.max(...weeklyStats.map((w) => w.bikeMin), 1),
    runMin: Math.max(...weeklyStats.map((w) => w.runMin), 1),
    swimKm: Math.max(...weeklyStats.map((w) => w.swimKm), 1),
    bikeKm: Math.max(...weeklyStats.map((w) => w.bikeKm), 1),
    runKm: Math.max(...weeklyStats.map((w) => w.runKm), 1),
  }), [weeklyStats]);

  function updateSession(dayDate: string, sessionIndex: number, patch: Partial<PlannedSession>) {
    setPlan((prev) => prev.map((day) => {
      if (day.date !== dayDate) return day;
      const sessions = day.sessions.map((s, idx) => idx === sessionIndex ? { ...s, ...patch } : s);
      return { ...day, sessions, status: buildStatus({ ...day, sessions }) };
    }));
  }

function addSession(dayDate: string) {
  setPlan((prev) =>
    prev.map((day) => {
      if (day.date !== dayDate) return day;

      const newSession: Session = {
        title: "New Session",
        discipline: "Run",
        minutes: 30,
        distance: 0,
        unit: "km", // 👈 IMPORTANT: match your type (unit not distanceUnit)
        actualKm: 0,
        effort: "",
        notes: "",
        completed: false,
      };

      return {
        ...day,
        sessions: [...day.sessions, newSession],
      };
    })
  );
}

  function autoMatchActivities() {
    setPlan((prev) => prev.map((day) => {
      const used = new Set<string>();
      const sessions = day.sessions.map((session) => {
        if (normalizeDiscipline(session.discipline) === "Rest") return session;
        const match = activities.find((activity) => {
          const sameSport = normalizeDiscipline(activity.discipline) === normalizeDiscipline(session.discipline);
          const sameDayMatch = sameDate(activity.date, day.date);
          const closeDuration = Math.abs((activity.minutes || 0) - (session.minutes || 0)) <= 25;
          return sameSport && sameDayMatch && closeDuration && !used.has(activity.id);
        });
        if (!match) return { ...session, matchedActivityId: "" };
        used.add(match.id);
        return { ...session, completed: true, matchedActivityId: match.id };
      });
      return { ...day, sessions, status: buildStatus({ ...day, sessions }) };
    }));
  }

  function parseImportedActivities() {
    try {
      const parsed = JSON.parse(importText) as ImportedActivity[];
      setActivities(parsed);
      setImportText("");
      alert(`Imported ${parsed.length} activities.`);
    } catch {
      alert("Paste a valid JSON array.");
    }
  }

  const styles = {
    shell: {
      minHeight: "100vh",
      background: "#f7f8fa",
      color: "#111827",
      fontFamily: "Inter, Arial, sans-serif",
      padding: 16,
    },
    wrap: { maxWidth: 1320, margin: "0 auto" },
    card: {
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: 18,
      padding: 16,
      boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
      marginBottom: 16,
    },
    button: {
      padding: "10px 14px",
      borderRadius: 999,
      border: "1px solid #d1d5db",
      background: "#ffffff",
      cursor: "pointer" as const,
      fontWeight: 600,
    },
    primary: {
      padding: "10px 14px",
      borderRadius: 999,
      border: "none",
      background: "#fc4c02",
      color: "white",
      cursor: "pointer" as const,
      fontWeight: 700,
    },
    input: {
      width: "100%",
      padding: 10,
      borderRadius: 10,
      border: "1px solid #d1d5db",
      fontSize: 14,
      background: "#fff",
    },
    textarea: {
      width: "100%",
      padding: 10,
      minHeight: 88,
      borderRadius: 10,
      border: "1px solid #d1d5db",
      fontSize: 14,
      background: "#fff",
    },
    small: { color: "#6b7280", fontSize: 13 },
    grid2: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
      gap: 12,
    },
    grid3: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
      gap: 12,
    },
    grid4: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
      gap: 12,
    },
    badge: {
      display: "inline-block",
      padding: "6px 12px",
      borderRadius: 999,
      background: "#fff1eb",
      color: "#fc4c02",
      fontSize: 12,
      fontWeight: 700,
    },
  };

  return (
    <div style={styles.shell}>
      <div style={styles.wrap}>
        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 30 }}>Lara 70.3 Nice Planner</h1>
              <p style={{ ...styles.small, marginTop: 6 }}>10-week editable plan with dashboard, weekly summary, master plan detail, and sync-ready workflow.</p>
            </div>
            <span style={styles.badge}>Race day 28 Jun 2026</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {(["dashboard", "calendar", "day", "master", "sync"] as const).map((name) => (
            <button key={name} style={tab === name ? styles.primary : styles.button} onClick={() => setTab(name)}>
              {name === "master" ? "Master Plan" : name[0].toUpperCase() + name.slice(1)}
            </button>
          ))}
        </div>

        {tab === "dashboard" && (
          <>
            <div style={styles.grid4}>
              <div style={styles.card}><div style={styles.small}>Weeks loaded</div><div style={{ fontSize: 32, fontWeight: 700 }}>10</div></div>
              <div style={styles.card}><div style={styles.small}>Sessions done</div><div style={{ fontSize: 32, fontWeight: 700 }}>{plan.flatMap((d) => d.sessions).filter((s) => s.completed).length}</div></div>
              <div style={styles.card}><div style={styles.small}>Imported activities</div><div style={{ fontSize: 32, fontWeight: 700 }}>{activities.length}</div></div>
              <div style={styles.card}><div style={styles.small}>Selected day total</div><div style={{ fontSize: 32, fontWeight: 700 }}>{selectedDay.sessions.reduce((sum, s) => sum + s.minutes, 0)} min</div></div>
            </div>

            <div style={styles.grid3}>
              <div style={styles.card}>
                <h3 style={{ marginTop: 0 }}>Weekly progression · time</h3>
                {weeklyStats.map((w) => (
                  <div key={w.week} style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 10, marginBottom: 10 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>{w.week}</div>
                    <MiniBar label="Swim min" value={w.swimMin} max={maxima.swimMin} color="#3b82f6" />
                    <MiniBar label="Bike min" value={w.bikeMin} max={maxima.bikeMin} color="#22c55e" />
                    <MiniBar label="Run min" value={w.runMin} max={maxima.runMin} color="#ef4444" />
                  </div>
                ))}
              </div>

              <div style={styles.card}>
                <h3 style={{ marginTop: 0 }}>Weekly progression · distance</h3>
                {weeklyStats.map((w) => (
                  <div key={w.week} style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 10, marginBottom: 10 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>{w.week}</div>
                    <MiniBar label="Swim km" value={Number(w.swimKm.toFixed(1))} max={maxima.swimKm} color="#3b82f6" />
                    <MiniBar label="Bike km" value={Number(w.bikeKm.toFixed(1))} max={maxima.bikeKm} color="#22c55e" />
                    <MiniBar label="Run km" value={Number(w.runKm.toFixed(1))} max={maxima.runKm} color="#ef4444" />
                  </div>
                ))}
              </div>

              <div style={styles.card}>
                <h3 style={{ marginTop: 0 }}>Weekly summary</h3>
                {weeklyStats.map((w) => (
                  <div key={w.week} style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 10, marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <strong>{w.week}</strong>
                      <span style={styles.small}>{w.done}/{w.planned} done</span>
                    </div>
                    <div style={styles.small}>Swim {w.swimMin} min · {w.swimKm.toFixed(1)} km</div>
                    <div style={styles.small}>Bike {w.bikeMin} min · {w.bikeKm.toFixed(1)} km</div>
                    <div style={styles.small}>Run {w.runMin} min · {w.runKm.toFixed(1)} km</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === "calendar" && weeks.map(({ week, days }) => (
          <div key={week} style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <h2 style={{ margin: 0 }}>{week}</h2>
              <div style={styles.small}>{formatDate(days[0].date)} – {formatDate(days[days.length - 1].date)}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
              {days.map((day) => {
                const dayMinutes = day.sessions.reduce((sum, s) => sum + s.minutes, 0);
                const dayDistance = day.sessions.reduce((sum, s) => sum + toKm(s), 0);
                return (
                  <button key={day.date} onClick={() => { setSelectedDate(day.date); setTab("day"); }} style={{ ...styles.button, textAlign: "left", padding: 12, background: selectedDate === day.date ? "#eff6ff" : "white" }}>
                    <div style={{ fontWeight: 600 }}>{day.day}</div>
                    <div style={styles.small}>{formatDate(day.date)}</div>
                    <div style={{ marginTop: 8, fontSize: 13 }}>{dayMinutes} min</div>
                    <div style={styles.small}>{dayDistance.toFixed(1)} km total</div>
                    <div style={styles.small}>{day.status}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {tab === "day" && selectedDay && (
          <>
            <div style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <div>
                  <h2 style={{ margin: 0 }}>{selectedDay.day}</h2>
                  <div style={styles.small}>{formatDate(selectedDay.date)} · {selectedDay.week}</div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={styles.badge}>Daily total {selectedDay.sessions.reduce((sum, s) => sum + s.minutes, 0)} min</span>
                  <button style={styles.button} onClick={() => addSession(selectedDay.date)}>Add session</button>
                </div>
              </div>
            </div>

            {selectedDay.sessions.map((session, idx) => {
              const km = toKm(session);
              const discipline = normalizeDiscipline(session.discipline);
              return (
                <div key={`${selectedDay.date}-${idx}`} style={{ ...styles.card, borderLeft: `8px solid ${getColor(discipline)}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{session.title || "Untitled session"}</div>
                      <div style={styles.small}>{discipline} · {session.minutes} min · {km ? `${km.toFixed(2)} km` : session.distance ? `${session.distance} ${session.distanceUnit}` : "no distance"}</div>
                    </div>
                    <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input type="checkbox" checked={session.completed} onChange={(e) => updateSession(selectedDay.date, idx, { completed: e.target.checked })} />
                      Done
                    </label>
                  </div>

                  <div style={styles.grid2}>
                    <div><div style={styles.small}>Title</div><input style={styles.input} value={session.title} onChange={(e) => updateSession(selectedDay.date, idx, { title: e.target.value })} /></div>
                    <div><div style={styles.small}>Discipline</div><select style={styles.input} value={session.discipline} onChange={(e) => updateSession(selectedDay.date, idx, { discipline: e.target.value as Discipline })}><option>Swim</option><option>Bike</option><option>Run</option><option>Strength</option><option>Rest</option><option>Other</option></select></div>
                    <div><div style={styles.small}>Minutes</div><input style={styles.input} type="number" value={session.minutes} onChange={(e) => updateSession(selectedDay.date, idx, { minutes: Number(e.target.value) || 0 })} /></div>
                    <div><div style={styles.small}>Distance</div><input style={styles.input} type="number" value={session.distance} onChange={(e) => updateSession(selectedDay.date, idx, { distance: Number(e.target.value) || 0 })} /></div>
                    <div><div style={styles.small}>Distance unit</div><select style={styles.input} value={session.distanceUnit} onChange={(e) => updateSession(selectedDay.date, idx, { distanceUnit: e.target.value as "km" | "m" | "yd" })}><option value="km">km</option><option value="m">m</option><option value="yd">yd</option></select></div>
                    <div><div style={styles.small}>Effort</div><input style={styles.input} value={session.effort} onChange={(e) => updateSession(selectedDay.date, idx, { effort: e.target.value })} /></div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <div style={styles.small}>Average metric</div>
                    <div style={{ fontWeight: 600, marginTop: 4 }}>
                      {discipline === "Swim" ? swimPacePer100m(session.minutes, session) : discipline === "Run" ? runPacePerKm(session.minutes, km) : discipline === "Bike" ? bikeSpeedKmH(session.minutes, km) : "-"}
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <div style={styles.small}>Notes</div>
                    <textarea style={styles.textarea} value={session.notes} onChange={(e) => updateSession(selectedDay.date, idx, { notes: e.target.value })} />
                  </div>
                </div>
              );
            })}
          </>
        )}

        {tab === "master" && (
          <div style={styles.card}>
            <h2 style={{ marginTop: 0 }}>Master Plan</h2>
            <p style={{ ...styles.small, marginBottom: 16 }}>Full plan detail by day, with the prescription visible in one place.</p>
            {plan.map((day) => (
              <div key={day.date} style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 12, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                  <div>
                    <strong>{day.week} · {day.day}</strong>
                    <div style={styles.small}>{formatDate(day.date)}</div>
                  </div>
                  <button style={styles.button} onClick={() => { setSelectedDate(day.date); setTab("day"); }}>Open day</button>
                </div>
                {day.sessions.map((session, idx) => (
                  <div key={idx} style={{ background: getColor(session.discipline), borderRadius: 12, padding: 10, marginBottom: 8 }}>
                    <div style={{ fontWeight: 600 }}>{session.title}</div>
                    <div style={styles.small}>{normalizeDiscipline(session.discipline)} · {session.minutes} min · {session.distance ? `${session.distance} ${session.distanceUnit}` : "distance editable"}</div>
                    <div style={{ ...styles.small, marginTop: 4 }}>Effort: {session.effort || "-"}</div>
                    <div style={{ marginTop: 6 }}>{session.notes}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {tab === "sync" && (
          <>
            <div style={styles.card}>
              <h2 style={{ marginTop: 0 }}>Sync</h2>
              <p style={styles.small}>This app now has the full 10-week plan. Real Strava or Polar sync still needs deployed backend routes and API credentials. For now you can import activities as JSON and auto-match them by date, sport, and duration.</p>
            </div>

            <div style={styles.grid2}>
              <div style={styles.card}>
                <h3 style={{ marginTop: 0 }}>Paste imported activities JSON</h3>
                <p style={styles.small}>{`[{"id":"123","source":"Strava","name":"Morning Ride","discipline":"Bike","date":"2026-05-09","minutes":175,"distanceKm":82}]`}</p>
                <textarea style={{ ...styles.textarea, minHeight: 180 }} value={importText} onChange={(e) => setImportText(e.target.value)} />
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  <button style={styles.primary} onClick={parseImportedActivities}>Import activities</button>
                  <button style={styles.button} onClick={autoMatchActivities}>Auto-match to plan</button>
                </div>
              </div>

              <div style={styles.card}>
                <h3 style={{ marginTop: 0 }}>Imported activities</h3>
                {activities.length === 0 ? <p style={styles.small}>No imported activities yet.</p> : activities.map((activity) => (
                  <div key={activity.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 10, marginBottom: 10 }}>
                    <div style={{ fontWeight: 600 }}>{activity.name}</div>
                    <div style={styles.small}>{activity.source} · {normalizeDiscipline(activity.discipline)} · {activity.minutes} min · {activity.distanceKm ? `${activity.distanceKm} km` : ""}</div>
                    <div style={styles.small}>{activity.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
