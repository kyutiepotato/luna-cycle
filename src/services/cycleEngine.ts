import { addDays, differenceInDays, format, parseISO, isAfter, isBefore } from 'date-fns';
import { CycleEntry, CyclePrediction, CycleStats, PredictedDay, CyclePhase } from '../types';

// ─── Prediction Engine ────────────────────────────────────────────────────────
export class CyclePredictionEngine {
  private cycles: CycleEntry[];
  private averageCycleLength: number;
  private averagePeriodLength: number;

  constructor(cycles: CycleEntry[], defaultCycleLength = 28, defaultPeriodLength = 5) {
    this.cycles = cycles.sort((a, b) =>
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );
    this.averageCycleLength = defaultCycleLength;
    this.averagePeriodLength = defaultPeriodLength;
    this.calculateAverages();
  }

  private calculateAverages(): void {
    if (this.cycles.length < 2) return;

    const cycleLengths: number[] = [];
    const periodLengths: number[] = [];

    for (let i = 1; i < this.cycles.length; i++) {
      const prev = this.cycles[i - 1];
      const curr = this.cycles[i];
      const length = differenceInDays(
        parseISO(curr.start_date),
        parseISO(prev.start_date)
      );
      if (length >= 15 && length <= 60) {
        cycleLengths.push(length);
      }
    }

    this.cycles.forEach(c => {
      if (c.period_length && c.period_length >= 1 && c.period_length <= 15) {
        periodLengths.push(c.period_length);
      } else if (c.start_date && c.end_date) {
        const len = differenceInDays(parseISO(c.end_date), parseISO(c.start_date)) + 1;
        if (len >= 1 && len <= 15) periodLengths.push(len);
      }
    });

    if (cycleLengths.length > 0) {
      // Weighted average - more recent cycles get higher weight
      const weighted = cycleLengths.reduce((sum, len, i) => {
        const weight = (i + 1) / cycleLengths.length;
        return sum + len * weight;
      }, 0);
      const totalWeight = cycleLengths.reduce((sum, _, i) => sum + (i + 1) / cycleLengths.length, 0);
      this.averageCycleLength = Math.round(weighted / totalWeight);
    }

    if (periodLengths.length > 0) {
      this.averagePeriodLength = Math.round(
        periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length
      );
    }
  }

  private calculateConfidence(): number {
    const count = this.cycles.length;
    if (count === 0) return 30;
    if (count === 1) return 45;
    if (count === 2) return 60;
    if (count >= 3 && count < 6) return 72;
    if (count >= 6 && count < 12) return 82;

    // Reduce confidence for irregular cycles
    const stats = this.calculateStats();
    if (stats.cycle_regularity === 'irregular') return Math.min(65, 82);
    if (stats.cycle_regularity === 'slightly_irregular') return Math.min(75, 82);
    return Math.min(92, 75 + count * 2);
  }

  calculateStats(): CycleStats {
    if (this.cycles.length < 2) {
      return {
        average_length: this.averageCycleLength,
        shortest_cycle: this.averageCycleLength,
        longest_cycle: this.averageCycleLength,
        average_period_length: this.averagePeriodLength,
        cycle_regularity: 'regular',
        cycles_tracked: this.cycles.length,
      };
    }

    const lengths: number[] = [];
    for (let i = 1; i < this.cycles.length; i++) {
      const len = differenceInDays(
        parseISO(this.cycles[i].start_date),
        parseISO(this.cycles[i - 1].start_date)
      );
      if (len >= 15 && len <= 60) lengths.push(len);
    }

    if (lengths.length === 0) {
      return {
        average_length: this.averageCycleLength,
        shortest_cycle: this.averageCycleLength,
        longest_cycle: this.averageCycleLength,
        average_period_length: this.averagePeriodLength,
        cycle_regularity: 'regular',
        cycles_tracked: this.cycles.length,
      };
    }

    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avg, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);

    let regularity: 'regular' | 'slightly_irregular' | 'irregular';
    if (stdDev <= 2) regularity = 'regular';
    else if (stdDev <= 5) regularity = 'slightly_irregular';
    else regularity = 'irregular';

    return {
      average_length: Math.round(avg),
      shortest_cycle: Math.min(...lengths),
      longest_cycle: Math.max(...lengths),
      average_period_length: this.averagePeriodLength,
      cycle_regularity: regularity,
      cycles_tracked: this.cycles.length,
    };
  }

  predictNextCycle(referenceDate?: string): CyclePrediction {
    const today = new Date();
    const lastCycle = this.cycles[this.cycles.length - 1];

    let nextPeriodStart: Date;

    if (lastCycle) {
      const lastStart = parseISO(lastCycle.start_date);
      nextPeriodStart = addDays(lastStart, this.averageCycleLength);

      // If predicted date is in the past, recalculate from today
      if (isBefore(nextPeriodStart, today)) {
        const daysSinceLastPeriod = differenceInDays(today, lastStart);
        const cyclesElapsed = Math.floor(daysSinceLastPeriod / this.averageCycleLength);
        nextPeriodStart = addDays(lastStart, (cyclesElapsed + 1) * this.averageCycleLength);
      }
    } else {
      // No data - predict 28 days from today
      nextPeriodStart = addDays(today, 28);
    }

    const nextPeriodEnd = addDays(nextPeriodStart, this.averagePeriodLength - 1);
    const ovulationDate = addDays(nextPeriodStart, -(14)); // ~14 days before next period
    const fertileWindowStart = addDays(ovulationDate, -5);
    const fertileWindowEnd = addDays(ovulationDate, 1);
    const pmsStart = addDays(nextPeriodStart, -5);
    const daysUntilPeriod = Math.max(0, differenceInDays(nextPeriodStart, today));

    // Determine current phase
    const phase = this.getCurrentPhase(today, nextPeriodStart);

    return {
      next_period_start: format(nextPeriodStart, 'yyyy-MM-dd'),
      next_period_end: format(nextPeriodEnd, 'yyyy-MM-dd'),
      ovulation_date: format(ovulationDate, 'yyyy-MM-dd'),
      fertile_window_start: format(fertileWindowStart, 'yyyy-MM-dd'),
      fertile_window_end: format(fertileWindowEnd, 'yyyy-MM-dd'),
      pms_start: format(pmsStart, 'yyyy-MM-dd'),
      confidence: this.calculateConfidence(),
      cycle_phase: phase,
      days_until_period: daysUntilPeriod,
      is_irregular: this.calculateStats().cycle_regularity === 'irregular',
    };
  }

  private getCurrentPhase(today: Date, nextPeriodStart: Date): CyclePhase {
    const lastCycle = this.cycles[this.cycles.length - 1];
    if (!lastCycle) return 'follicular';

    const lastStart = parseISO(lastCycle.start_date);
    const dayOfCycle = differenceInDays(today, lastStart) + 1;
    const ovulationDay = Math.round(this.averageCycleLength / 2) - 2;

    if (dayOfCycle <= this.averagePeriodLength) return 'menstrual';
    if (dayOfCycle < ovulationDay - 1) return 'follicular';
    if (dayOfCycle <= ovulationDay + 1) return 'ovulation';

    const pmsStart = this.averageCycleLength - 5;
    if (dayOfCycle >= pmsStart) return 'pms';
    return 'luteal';
  }

  generatePredictedDays(months = 3): PredictedDay[] {
    const prediction = this.predictNextCycle();
    const days: PredictedDay[] = [];
    const confidence = this.calculateConfidence();

    for (let m = 0; m < months; m++) {
      const offset = m * this.averageCycleLength;
      const periodStart = addDays(parseISO(prediction.next_period_start), offset);

      // Period days
      for (let d = 0; d < this.averagePeriodLength; d++) {
        days.push({
          date: format(addDays(periodStart, d), 'yyyy-MM-dd'),
          type: 'period',
          confidence: confidence - m * 5,
        });
      }

      // PMS days
      const pmsStart = addDays(periodStart, -5);
      for (let d = 0; d < 5; d++) {
        days.push({
          date: format(addDays(pmsStart, d), 'yyyy-MM-dd'),
          type: 'pms',
          confidence: confidence - m * 5 - 5,
        });
      }

      // Fertile window
      const ovulation = addDays(periodStart, -(14 - offset * 0)); // relative to this cycle
      const fertileStart = addDays(ovulation, -5);
      for (let d = 0; d < 7; d++) {
        days.push({
          date: format(addDays(fertileStart, d), 'yyyy-MM-dd'),
          type: d === 5 ? 'ovulation' : 'fertile',
          confidence: confidence - m * 8,
        });
      }
    }

    return days;
  }
}

// ─── Standalone helpers ───────────────────────────────────────────────────────
export function getCycleDay(lastPeriodStart: string): number {
  return differenceInDays(new Date(), parseISO(lastPeriodStart)) + 1;
}

export function getPhaseMessage(phase: CyclePhase, daysUntilPeriod: number): string {
  switch (phase) {
    case 'menstrual':
      return 'Be gentle with yourself today 🌸';
    case 'follicular':
      return 'Your energy is rising ✨';
    case 'ovulation':
      return 'Peak vitality — you\'re glowing 🌟';
    case 'luteal':
      return 'Time to slow down and reflect 🌙';
    case 'pms':
      return `Period in ~${daysUntilPeriod} day${daysUntilPeriod !== 1 ? 's' : ''}. Be kind to yourself 💜`;
    default:
      return 'Track your cycle to unlock insights';
  }
}
