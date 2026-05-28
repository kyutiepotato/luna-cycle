import { supabase, db } from '../lib/supabase';
import { CycleEntry, DayEntry, FlowIntensity, Symptom, MoodType } from '../types';
import { format } from 'date-fns';

export const cycleService = {
  // ─── Cycle Entries ─────────────────────────────────────────────────────────
  async getCycles(userId: string, limit = 24): Promise<CycleEntry[]> {
    const { data, error } = await db.cycles()
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async startPeriod(userId: string, date: string): Promise<CycleEntry> {
    // Close any open cycles first
    const { data: openCycles } = await db.cycles()
      .select('*')
      .eq('user_id', userId)
      .is('end_date', null)
      .order('start_date', { ascending: false })
      .limit(1);

    if (openCycles && openCycles.length > 0) {
      // Close the previous cycle
      await db.cycles()
        .update({ end_date: date })
        .eq('id', openCycles[0].id);
    }

    const { data, error } = await db.cycles()
      .insert({ user_id: userId, start_date: date })
      .select()
      .single();

    if (error) throw error;

    // Also log the day entry
    await cycleService.upsertDayLog(userId, date, { is_period: true, flow: 'medium' });

    return data;
  },

  async endPeriod(userId: string, date: string): Promise<void> {
    const { data: openCycles } = await db.cycles()
      .select('*')
      .eq('user_id', userId)
      .is('end_date', null)
      .order('start_date', { ascending: false })
      .limit(1);

    if (!openCycles || openCycles.length === 0) return;

    const cycle = openCycles[0];
    const { default: { differenceInDays, parseISO } } = await import('date-fns');
    const periodLength = differenceInDays(parseISO(date), parseISO(cycle.start_date)) + 1;

    await db.cycles()
      .update({
        end_date: date,
        period_length: periodLength,
      })
      .eq('id', cycle.id);
  },

  // ─── Day Logs ──────────────────────────────────────────────────────────────
  async getDayLog(userId: string, date: string): Promise<DayEntry | null> {
    const { data, error } = await db.dayLogs()
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async getDayLogs(userId: string, startDate: string, endDate: string): Promise<DayEntry[]> {
    const { data, error } = await db.dayLogs()
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async upsertDayLog(userId: string, date: string, updates: Partial<DayEntry>): Promise<DayEntry> {
    const existing = await cycleService.getDayLog(userId, date);

    if (existing) {
      const { data, error } = await db.dayLogs()
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await db.dayLogs()
        .insert({ user_id: userId, date, ...updates })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  async logFlow(userId: string, date: string, flow: FlowIntensity, isSpotting = false): Promise<DayEntry> {
    return cycleService.upsertDayLog(userId, date, {
      flow,
      is_period: !isSpotting,
      is_spotting: isSpotting,
    });
  },

  async logSymptoms(userId: string, date: string, symptoms: { symptom: Symptom; severity: number }[]): Promise<DayEntry> {
    return cycleService.upsertDayLog(userId, date, { symptoms } as any);
  },

  async logMoods(userId: string, date: string, moods: MoodType[]): Promise<DayEntry> {
    return cycleService.upsertDayLog(userId, date, { moods } as any);
  },

  async logWellness(userId: string, date: string, data: {
    sleep_hours?: number;
    water_intake?: number;
    exercise_minutes?: number;
    temperature?: number;
  }): Promise<DayEntry> {
    return cycleService.upsertDayLog(userId, date, data);
  },

  // ─── Analytics Queries ─────────────────────────────────────────────────────
  async getSymptomFrequency(userId: string, months = 6): Promise<Record<string, number>> {
    const startDate = format(
      new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000),
      'yyyy-MM-dd'
    );

    const { data } = await db.dayLogs()
      .select('symptoms')
      .eq('user_id', userId)
      .gte('date', startDate);

    const frequency: Record<string, number> = {};
    data?.forEach(log => {
      (log.symptoms as any[] || []).forEach((s: any) => {
        const key = typeof s === 'string' ? s : s.symptom;
        frequency[key] = (frequency[key] || 0) + 1;
      });
    });

    return frequency;
  },

  async getMoodHistory(userId: string, days = 90): Promise<{ date: string; moods: MoodType[] }[]> {
    const startDate = format(
      new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      'yyyy-MM-dd'
    );

    const { data } = await db.dayLogs()
      .select('date, moods')
      .eq('user_id', userId)
      .gte('date', startDate)
      .order('date');

    return (data || []).map(d => ({
      date: d.date,
      moods: (d.moods as MoodType[]) || [],
    }));
  },

  async getWellnessHistory(userId: string, days = 30): Promise<DayEntry[]> {
    const startDate = format(
      new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      'yyyy-MM-dd'
    );

    const { data } = await db.dayLogs()
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .order('date');

    return data || [];
  },
};
