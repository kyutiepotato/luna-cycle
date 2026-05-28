import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { cycleService } from '../services/cycleService';
import { CyclePredictionEngine } from '../services/cycleEngine';
import { CycleEntry, DayEntry, CyclePrediction, CycleStats, FlowIntensity, Symptom, MoodType } from '../types';
import { useAuth } from './AuthContext';
import { format } from 'date-fns';

interface CycleContextType {
  cycles: CycleEntry[];
  todayLog: DayEntry | null;
  prediction: CyclePrediction | null;
  stats: CycleStats | null;
  isLoading: boolean;
  isOnPeriod: boolean;
  loadCycles: () => Promise<void>;
  loadTodayLog: () => Promise<void>;
  startPeriod: (date?: string) => Promise<void>;
  endPeriod: (date?: string) => Promise<void>;
  logFlow: (flow: FlowIntensity, date?: string) => Promise<void>;
  logSymptoms: (symptoms: { symptom: Symptom; severity: number }[], date?: string) => Promise<void>;
  logMoods: (moods: MoodType[], date?: string) => Promise<void>;
  logWellness: (data: { sleep_hours?: number; water_intake?: number; exercise_minutes?: number }, date?: string) => Promise<void>;
  getDayLog: (date: string) => Promise<DayEntry | null>;
  getDayLogs: (start: string, end: string) => Promise<DayEntry[]>;
  refreshAll: () => Promise<void>;
}

const CycleContext = createContext<CycleContextType | undefined>(undefined);

export function CycleProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [cycles, setCycles] = useState<CycleEntry[]>([]);
  const [todayLog, setTodayLog] = useState<DayEntry | null>(null);
  const [prediction, setPrediction] = useState<CyclePrediction | null>(null);
  const [stats, setStats] = useState<CycleStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const recalculatePredictions = useCallback((cycleData: CycleEntry[]) => {
    const engine = new CyclePredictionEngine(cycleData);
    setPrediction(engine.predictNextCycle());
    setStats(engine.calculateStats());
  }, []);

  const loadCycles = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await cycleService.getCycles(user.id);
      setCycles(data);
      recalculatePredictions(data);
    } finally {
      setIsLoading(false);
    }
  }, [user, recalculatePredictions]);

  const loadTodayLog = useCallback(async () => {
    if (!user) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    const log = await cycleService.getDayLog(user.id, today);
    setTodayLog(log);
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadCycles();
      loadTodayLog();
    }
  }, [isAuthenticated, user]);

  const today = () => format(new Date(), 'yyyy-MM-dd');

  const startPeriod = async (date = today()) => {
    if (!user) return;
    await cycleService.startPeriod(user.id, date);
    await loadCycles();
    await loadTodayLog();
  };

  const endPeriod = async (date = today()) => {
    if (!user) return;
    await cycleService.endPeriod(user.id, date);
    await loadCycles();
  };

  const logFlow = async (flow: FlowIntensity, date = today()) => {
    if (!user) return;
    await cycleService.logFlow(user.id, date, flow);
    await loadTodayLog();
  };

  const logSymptoms = async (symptoms: { symptom: Symptom; severity: number }[], date = today()) => {
    if (!user) return;
    await cycleService.logSymptoms(user.id, date, symptoms);
    await loadTodayLog();
  };

  const logMoods = async (moods: MoodType[], date = today()) => {
    if (!user) return;
    await cycleService.logMoods(user.id, date, moods);
    await loadTodayLog();
  };

  const logWellness = async (data: any, date = today()) => {
    if (!user) return;
    await cycleService.logWellness(user.id, date, data);
    await loadTodayLog();
  };

  const getDayLog = async (date: string) => {
    if (!user) return null;
    return cycleService.getDayLog(user.id, date);
  };

  const getDayLogs = async (start: string, end: string) => {
    if (!user) return [];
    return cycleService.getDayLogs(user.id, start, end);
  };

  const refreshAll = async () => {
    await loadCycles();
    await loadTodayLog();
  };

  const isOnPeriod = todayLog?.is_period ?? false;

  return (
    <CycleContext.Provider value={{
      cycles,
      todayLog,
      prediction,
      stats,
      isLoading,
      isOnPeriod,
      loadCycles,
      loadTodayLog,
      startPeriod,
      endPeriod,
      logFlow,
      logSymptoms,
      logMoods,
      logWellness,
      getDayLog,
      getDayLogs,
      refreshAll,
    }}>
      {children}
    </CycleContext.Provider>
  );
}

export function useCycle() {
  const ctx = useContext(CycleContext);
  if (!ctx) throw new Error('useCycle must be used within CycleProvider');
  return ctx;
}
