import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCycle } from '../context/CycleContext';
import { cycleService } from '../services/cycleService';
import { generateInsights, SmartInsight } from '../services/insightsService';
import { SymptomFrequency, MoodTrend } from '../types';

// ─── useCycleInsights ─────────────────────────────────────────────────────────
export function useCycleInsights() {
  const { user } = useAuth();
  const { prediction, stats } = useCycle();
  const [insights, setInsights] = useState<SmartInsight[]>([]);
  const [symptomFreq, setSymptomFreq] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const freq = await cycleService.getSymptomFrequency(user.id, 6);
      setSymptomFreq(freq);

      const topSymptoms = Object.keys(freq);
      const generated = generateInsights({
        prediction: prediction ?? undefined,
        stats: stats ?? undefined,
        recentSymptoms: topSymptoms,
      });
      setInsights(generated);
    } finally {
      setIsLoading(false);
    }
  }, [user, prediction, stats]);

  useEffect(() => { refresh(); }, [refresh]);

  return { insights, symptomFreq, isLoading, refresh };
}

// ─── useWellnessSummary ───────────────────────────────────────────────────────
export function useWellnessSummary(days = 30) {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [averages, setAverages] = useState({
    sleep: 0,
    water: 0,
    exercise: 0,
    activeDays: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    cycleService.getWellnessHistory(user.id, days)
      .then(history => {
        setData(history);
        const withSleep = history.filter(d => d.sleep_hours);
        const withWater = history.filter(d => d.water_intake);
        const withExercise = history.filter(d => d.exercise_minutes);

        setAverages({
          sleep: withSleep.length
            ? parseFloat((withSleep.reduce((s, d) => s + d.sleep_hours, 0) / withSleep.length).toFixed(1))
            : 0,
          water: withWater.length
            ? Math.round(withWater.reduce((s, d) => s + d.water_intake, 0) / withWater.length)
            : 0,
          exercise: withExercise.length
            ? Math.round(withExercise.reduce((s, d) => s + d.exercise_minutes, 0) / withExercise.length)
            : 0,
          activeDays: history.filter(d => (d.exercise_minutes || 0) > 0).length,
        });
      })
      .finally(() => setIsLoading(false));
  }, [user, days]);

  return { data, averages, isLoading };
}

// ─── useSymptomPatterns ───────────────────────────────────────────────────────
export function useSymptomPatterns(months = 3) {
  const { user } = useAuth();
  const [frequency, setFrequency] = useState<Record<string, number>>({});
  const [topSymptoms, setTopSymptoms] = useState<{ symptom: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    cycleService.getSymptomFrequency(user.id, months)
      .then(freq => {
        setFrequency(freq);
        const sorted = Object.entries(freq)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([symptom, count]) => ({ symptom, count }));
        setTopSymptoms(sorted);
      })
      .finally(() => setIsLoading(false));
  }, [user, months]);

  return { frequency, topSymptoms, isLoading };
}

// ─── useMoodTrends ────────────────────────────────────────────────────────────
export function useMoodTrends(days = 90) {
  const { user } = useAuth();
  const [history, setHistory] = useState<{ date: string; moods: string[] }[]>([]);
  const [topMoods, setTopMoods] = useState<{ mood: string; count: number }[]>([]);
  const [positivityScore, setPositivityScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const POSITIVE_MOODS = ['happy', 'calm', 'energetic', 'focused', 'content', 'hopeful'];
  const NEGATIVE_MOODS = ['sad', 'anxious', 'irritable', 'overwhelmed', 'emotional'];

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    cycleService.getMoodHistory(user.id, days)
      .then(data => {
        setHistory(data);

        const counts: Record<string, number> = {};
        let positiveCount = 0;
        let negativeCount = 0;

        data.forEach(({ moods }) => {
          moods.forEach(m => {
            counts[m] = (counts[m] || 0) + 1;
            if (POSITIVE_MOODS.includes(m)) positiveCount++;
            if (NEGATIVE_MOODS.includes(m)) negativeCount++;
          });
        });

        const sorted = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([mood, count]) => ({ mood, count }));
        setTopMoods(sorted);

        const total = positiveCount + negativeCount;
        setPositivityScore(total > 0 ? Math.round((positiveCount / total) * 100) : 50);
      })
      .finally(() => setIsLoading(false));
  }, [user, days]);

  return { history, topMoods, positivityScore, isLoading };
}

// ─── useNotificationSetup ─────────────────────────────────────────────────────
export function useNotificationSetup() {
  const { user } = useAuth();
  const { prediction } = useCycle();

  const setup = useCallback(async () => {
    if (!user || !prediction) return;
    const { notificationService } = await import('../services/notificationService');
    await notificationService.setupAllNotifications(
      {
        period_reminder: true,
        period_reminder_days: 2,
        ovulation_reminder: true,
        fertile_window_reminder: false,
        daily_log_reminder: true,
        daily_log_time: '20:00',
        pms_reminder: true,
        medication_reminders: [],
      },
      prediction
    );
  }, [user, prediction]);

  return { setup };
}
