import { format, parseISO, differenceInDays, addDays, isToday, isYesterday, isTomorrow, formatDistanceToNow } from 'date-fns';

export const dateUtils = {
  today: () => format(new Date(), 'yyyy-MM-dd'),

  formatDisplay: (date: string) => format(parseISO(date), 'MMMM d, yyyy'),

  formatShort: (date: string) => format(parseISO(date), 'MMM d'),

  formatRelative: (date: string): string => {
    const d = parseISO(date);
    if (isToday(d)) return 'Today';
    if (isYesterday(d)) return 'Yesterday';
    if (isTomorrow(d)) return 'Tomorrow';
    const diff = differenceInDays(d, new Date());
    if (diff > 0 && diff <= 7) return `In ${diff} days`;
    if (diff < 0 && diff >= -7) return `${Math.abs(diff)} days ago`;
    return format(d, 'MMM d');
  },

  daysUntil: (date: string): number => {
    return Math.max(0, differenceInDays(parseISO(date), new Date()));
  },

  daysSince: (date: string): number => {
    return Math.max(0, differenceInDays(new Date(), parseISO(date)));
  },

  dateRange: (start: string, end: string): string[] => {
    const dates: string[] = [];
    let current = parseISO(start);
    const endDate = parseISO(end);
    while (current <= endDate) {
      dates.push(format(current, 'yyyy-MM-dd'));
      current = addDays(current, 1);
    }
    return dates;
  },

  monthName: (date: string) => format(parseISO(date), 'MMMM yyyy'),

  cyclePhaseDay: (cycleStart: string): number => {
    return differenceInDays(new Date(), parseISO(cycleStart)) + 1;
  },
};

// ─── Greeting based on time of day ───────────────────────────────────────────
export function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return 'Up late';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

// ─── Format cycle length for display ─────────────────────────────────────────
export function formatCycleSummary(length: number): string {
  if (length < 21) return 'Short cycle';
  if (length <= 35) return 'Regular range';
  return 'Long cycle';
}
