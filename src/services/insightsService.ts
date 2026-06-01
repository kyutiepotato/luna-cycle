import { CyclePrediction, CycleStats, Symptom, MoodType, DayEntry } from '../types';
import { getCycleDay } from './cycleEngine';

interface InsightData {
  prediction?: CyclePrediction;
  stats?: CycleStats;
  recentSymptoms?: string[];
  recentMoods?: MoodType[];
  wellnessData?: {
    avgSleep?: number;
    avgWater?: number;
    avgExercise?: number;
  };
  lastPeriodStart?: string;
}

export interface SmartInsight {
  id: string;
  type: 'tip' | 'pattern' | 'warning' | 'celebration' | 'wellness';
  title: string;
  body: string;
  icon: string;
  color: string;
  actionLabel?: string;
}

// ─── Insight Generation ───────────────────────────────────────────────────────
export function generateInsights(data: InsightData): SmartInsight[] {
  const insights: SmartInsight[] = [];

  if (data.prediction) {
    const phase = data.prediction.cycle_phase;
    const days = data.prediction.days_until_period;

    if (phase === 'menstrual') {
      insights.push({
        id: 'phase-nutrition-menstrual',
        type: 'tip',
        title: 'Nourish your body',
        body: "During your period, focus on iron-rich foods like leafy greens and legumes to replenish what's lost. Warm soups and herbal teas can help ease cramps.",
        icon: 'wellness',
        color: '#FF6B95',
      });
    }

    if (phase === 'follicular') {
      insights.push({
        id: 'phase-energy-follicular',
        type: 'tip',
        title: 'Harness rising energy',
        body: 'Estrogen is climbing - this is your most energetic phase. Great time for new projects, social plans, and higher-intensity workouts.',
        icon: 'exercise',
        color: '#60A5FA',
      });
    }

    if (phase === 'ovulation') {
      insights.push({
        id: 'phase-peak-ovulation',
        type: 'tip',
        title: 'Peak performance window',
        body: "You're at your peak cognitively and physically. Communication comes naturally now - schedule important conversations or presentations.",
        icon: 'ovulation',
        color: '#FCD34D',
      });
    }

    if (phase === 'luteal' || phase === 'pms') {
      insights.push({
        id: 'phase-self-care-luteal',
        type: 'tip',
        title: 'Prioritize self-care',
        body: 'Progesterone is high. Reducing caffeine, adding magnesium-rich foods (dark chocolate, almonds), and gentle movement can ease PMS symptoms.',
        icon: 'mood',
        color: '#C4B5FD',
      });
    }

    if (days > 0 && days <= 3) {
      insights.push({
        id: 'period-approaching',
        type: 'warning',
        title: `Period in ${days} day${days > 1 ? 's' : ''}`,
        body: 'Stock up on supplies and plan for comfort. Consider light exercise, heat packs, and extra rest for the coming days.',
        icon: 'period',
        color: '#FB923C',
        actionLabel: 'Prepare checklist',
      });
    }

    if (data.prediction.is_irregular) {
      insights.push({
        id: 'irregular-cycle-note',
        type: 'pattern',
        title: 'Irregular cycle detected',
        body: 'Your cycles vary more than average. Tracking consistently over 3-6 more cycles will help improve predictions. Stress, diet, and lifestyle can all affect regularity.',
        icon: 'chart',
        color: '#A78BFA',
      });
    }
  }

  if (data.stats) {
    if (data.stats.cycles_tracked >= 3) {
      insights.push({
        id: 'cycles-tracked-milestone',
        type: 'celebration',
        title: `${data.stats.cycles_tracked} cycles tracked!`,
        body: 'Wonderful consistency. Your predictions are becoming more accurate with every cycle you log. Keep going!',
        icon: 'cycle',
        color: '#4ADE80',
      });
    }

    if (data.stats.cycle_regularity === 'regular') {
      insights.push({
        id: 'regular-cycle',
        type: 'celebration',
        title: 'Beautifully regular cycle',
        body: `Your average cycle is ${data.stats.average_length} days with great consistency. This is a positive sign of hormonal balance.`,
        icon: 'cycle',
        color: '#4ADE80',
      });
    }
  }

  if (data.wellnessData) {
    if (data.wellnessData.avgSleep && data.wellnessData.avgSleep < 7) {
      insights.push({
        id: 'sleep-low',
        type: 'warning',
        title: 'Sleep may be affecting your cycle',
        body: "You're averaging under 7 hours. Poor sleep disrupts hormones that regulate your cycle. Aim for 7-9 hours for better hormonal balance.",
        icon: 'sleep',
        color: '#818CF8',
        actionLabel: 'Sleep tips',
      });
    }

    if (data.wellnessData.avgWater && data.wellnessData.avgWater < 6) {
      insights.push({
        id: 'hydration-low',
        type: 'tip',
        title: 'Stay hydrated',
        body: 'Proper hydration reduces bloating and cramps. Aim for 8 glasses daily, especially during your period and the days before.',
        icon: 'water',
        color: '#60A5FA',
        actionLabel: 'Track water',
      });
    }
  }

  if (data.recentSymptoms && data.recentSymptoms.length > 0) {
    const symptomCounts = data.recentSymptoms.reduce((acc, s) => {
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topSymptom = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1])[0];
    if (topSymptom && topSymptom[1] >= 3) {
      const tips: Record<string, string> = {
        cramps: 'Heat therapy and gentle stretching can provide relief. Omega-3 fatty acids and magnesium supplements may help reduce cramp intensity over time.',
        headache: 'Hormonal headaches often occur before periods. Staying hydrated, reducing sodium, and maintaining regular sleep can help prevent them.',
        bloating: 'Reducing salt and carbonated drinks in the days before your period can minimize bloating. Light exercise also helps.',
        fatigue: 'Iron-rich foods during your period, regular sleep, and moderate exercise between periods can boost your energy levels.',
        acne: 'Hormonal acne is common before periods. A gentle skincare routine and reducing dairy may help. Speak to a dermatologist if severe.',
      };

      const tip = tips[topSymptom[0]];
      if (tip) {
        insights.push({
          id: `symptom-tip-${topSymptom[0]}`,
          type: 'pattern',
          title: `Pattern: frequent ${topSymptom[0].replace('_', ' ')}`,
          body: tip,
          icon: 'symptom',
          color: '#F59E0B',
        });
      }
    }
  }

  insights.push({
    id: 'monthly-wellness-check',
    type: 'wellness',
    title: 'Monthly wellness summary',
    body: "You're building valuable health data. The more consistently you track, the better Luna can support your wellbeing with personalized insights.",
    icon: 'chart',
    color: '#EC4899',
    actionLabel: 'View analytics',
  });

  return insights.slice(0, 5);
}

export function getDailyAffirmation(phase?: string): string {
  const affirmations: Record<string, string[]> = {
    menstrual: [
      "Your body is doing something remarkable. Rest is not laziness - it's wisdom.",
      'You are allowed to slow down. Ease and softness are your guides today.',
      'This is a time of release and renewal. Honor what your body needs.',
    ],
    follicular: [
      'New energy is rising within you. What will you create with it?',
      'You are beginning again, fresh and full of possibility.',
      'Your curiosity and creativity are at their peak. Follow where they lead.',
    ],
    ovulation: [
      'You radiate warmth and connection. The world benefits from your presence.',
      'At your most vibrant - share your light generously today.',
      'Trust your instincts. Your intuition is especially clear right now.',
    ],
    luteal: [
      "Your sensitivity is a gift. It's okay to feel deeply.",
      'This is a time for completion and reflection. What needs to close?',
      'Nourish yourself with what truly restores you.',
    ],
    pms: [
      'Your body is preparing for release. Be extra gentle with yourself.',
      'What you feel is real and valid. Rest, nourish, breathe.',
      'This too shall pass. Tomorrow you may feel lighter.',
    ],
  };

  const phaseAffirmations = affirmations[phase || 'follicular'] || affirmations.follicular;
  return phaseAffirmations[Math.floor(Math.random() * phaseAffirmations.length)];
}