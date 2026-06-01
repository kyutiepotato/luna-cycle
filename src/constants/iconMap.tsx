/**
 * iconMap.tsx
 *
 * Companion icon map for theme constants.
 * Import this wherever you need SVG icons instead of emojis from CYCLE_PHASES,
 * SYMPTOMS_CONFIG, or MOODS_CONFIG.
 *
 * Usage:
 *   import { PhaseIcon, SymptomIcon, MoodIcon } from '../../constants/iconMap';
 *   <PhaseIcon phase="menstrual" size={28} />
 *   <SymptomIcon symptom="cramps" size={22} />
 *   <MoodIcon mood="happy" size={22} />
 */

import React from 'react';
import Svg, {
  Path, Circle, Ellipse, Line, Rect, Polyline, Polygon, G,
} from 'react-native-svg';

// ─── Phase Icons ───────────────────────────────────────────────────────────────

/** 🌸 menstrual — flower */
function PhaseIconMenstrual({ size = 28, color = '#FF6B95' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="2.5" fill={color} />
      <Ellipse cx="17" cy="12" rx="2.5" ry="1.5" transform="rotate(0 17 12)" fill={color} opacity="0.7" />
      <Ellipse cx="14.5" cy="16.33" rx="2.5" ry="1.5" transform="rotate(60 14.5 16.33)" fill={color} opacity="0.7" />
      <Ellipse cx="9.5" cy="16.33" rx="2.5" ry="1.5" transform="rotate(120 9.5 16.33)" fill={color} opacity="0.7" />
      <Ellipse cx="7" cy="12" rx="2.5" ry="1.5" transform="rotate(180 7 12)" fill={color} opacity="0.7" />
      <Ellipse cx="9.5" cy="7.67" rx="2.5" ry="1.5" transform="rotate(240 9.5 7.67)" fill={color} opacity="0.7" />
      <Ellipse cx="14.5" cy="7.67" rx="2.5" ry="1.5" transform="rotate(300 14.5 7.67)" fill={color} opacity="0.7" />
      </Svg>
  );
}

/** 🌱 follicular — seedling */
function PhaseIconFollicular({ size = 28, color = '#7DD3FC' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="12" y1="22" x2="12" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M12 10C12 7 10 4 6 4c0 4 2 7 6 6z" fill={color} opacity="0.8" />
      <Path d="M12 14c0-3 2-5 6-5c0 4-2 6-6 5z" fill={color} opacity="0.6" />
    </Svg>
  );
}

/** ✨ ovulation — sparkle star */
function PhaseIconOvulation({ size = 28, color = '#FCD34D' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2 L13.5 9 L20 12 L13.5 15 L12 22 L10.5 15 L4 12 L10.5 9 Z" fill={color} />
      <Circle cx="19" cy="5" r="1.5" fill={color} opacity="0.5" />
      <Circle cx="5" cy="19" r="1" fill={color} opacity="0.4" />
    </Svg>
  );
}

/** 🌙 luteal — crescent moon */
function PhaseIconLuteal({ size = 28, color = '#C084FC' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill={color} />
      <Circle cx="17" cy="5" r="1.2" fill={color} opacity="0.4" />
    </Svg>
  );
}

/** 🌫️ pms — cloud mist */
function PhaseIconPms({ size = 28, color = '#C4B5FD' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill={color} opacity="0.8" />
      <Line x1="8" y1="23" x2="8" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <Line x1="12" y1="23" x2="12" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <Line x1="16" y1="23" x2="16" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </Svg>
  );
}

export function PhaseIcon({ phase, size = 28, color }: { phase: string; size?: number; color?: string }) {
  switch (phase) {
    case 'menstrual':  return <PhaseIconMenstrual  size={size} color={color ?? '#FF6B95'} />;
    case 'follicular': return <PhaseIconFollicular size={size} color={color ?? '#7DD3FC'} />;
    case 'ovulation':  return <PhaseIconOvulation  size={size} color={color ?? '#FCD34D'} />;
    case 'luteal':     return <PhaseIconLuteal     size={size} color={color ?? '#C084FC'} />;
    case 'pms':        return <PhaseIconPms        size={size} color={color ?? '#C4B5FD'} />;
    default:           return null;
  }
}

// ─── Symptom Icons ─────────────────────────────────────────────────────────────

/** ⚡ cramps — lightning bolt */
function SymptomCramps({ size = 22, color = '#F87171' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M13 2L4.09 12.96A1 1 0 0 0 5 14.5h6.5L10 22l9.91-10.96A1 1 0 0 0 19 10H12.5L13 2z"
        fill={color} />
    </Svg>
  );
}

/** 💫 headache — dizzy stars */
function SymptomHeadache({ size = 22, color = '#FB923C' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="13" r="5" stroke={color} strokeWidth="1.5" fill="none" />
      <Path d="M12 2 L12.8 5 L15.5 4 L14 6.5 L16.5 8 L13.5 8.2 L13 11 L11.5 8.5 L8.5 9.5 L10 7 L7.5 5.5 L10.5 5.5 Z"
        fill={color} opacity="0.8" />
    </Svg>
  );
}

/** 💨 bloating — wind / air */
function SymptomBloating({ size = 22, color = '#FBBF24' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9.59 4.59A2 2 0 1 1 11 8H2" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <Path d="M12.59 19.41A2 2 0 1 0 14 16H2" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <Path d="M16.59 11.41A2 2 0 1 1 18 8H2" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/** 🌸 acne — small flower */
function SymptomAcne({ size = 22, color = '#F472B6' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="2" fill={color} />
      <Circle cx="16.5" cy="12" r="1.8" fill={color} opacity="0.6" />
      <Circle cx="13.9" cy="16.28" r="1.8" fill={color} opacity="0.6" />
      <Circle cx="8.15" cy="14.85" r="1.8" fill={color} opacity="0.6" />
      <Circle cx="8.15" cy="9.15" r="1.8" fill={color} opacity="0.6" />
      <Circle cx="13.9" cy="7.72" r="1.8" fill={color} opacity="0.6" />
    </Svg>
  );
}

/** 😴 fatigue — sleeping moon */
function SymptomFatigue({ size = 22, color = '#A78BFA' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill={color} />
      <Path d="M14 7 L16 7 L14 9 L16 9" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" fill="none" />
    </Svg>
  );
}

/** 🌊 nausea — wave */
function SymptomNausea({ size = 22, color = '#34D399' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M2 12 Q5 8 8 12 Q11 16 14 12 Q17 8 20 12 Q21.5 14 22 12"
        stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
      <Path d="M2 17 Q5 13 8 17 Q11 21 14 17 Q17 13 20 17"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" fill="none" />
    </Svg>
  );
}

/** 🦴 back pain / joint pain — spine */
function SymptomBone({ size = 22, color = '#60A5FA' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6.5 8.5a3 3 0 0 1 5-2.24M17.5 8.5a3 3 0 0 0-5-2.24M6.5 15.5a3 3 0 0 0 5 2.24M17.5 15.5a3 3 0 0 1-5 2.24"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <Line x1="12" y1="6.26" x2="12" y2="17.74" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

/** 🎭 mood swings — masks */
function SymptomMoodSwings({ size = 22, color = '#F59E0B' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M2 5c0-1.1.9-2 2-2h7a2 2 0 0 1 2 2v5c0 3-2 5-5.5 5S2 13 2 10V5z"
        fill={color} opacity="0.8" />
      <Path d="M5.5 9 Q6.5 11 8 9" stroke="white" strokeWidth="1" strokeLinecap="round" fill="none" />
      <Path d="M13 9c0-1.1.9-2 2-2h5a2 2 0 0 1 2 2v4c0 2.5-1.8 4.5-4.5 4.5S13 15.5 13 13V9z"
        fill={color} opacity="0.45" />
      <Path d="M15.5 13 Q17 11.5 18.5 13" stroke="white" strokeWidth="1" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/** 💗 breast tenderness — heart */
function SymptomBreastTenderness({ size = 22, color = '#EC4899' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        fill={color} opacity="0.8" />
    </Svg>
  );
}

/** 🌙 insomnia — moon with eye open */
function SymptomInsomnia({ size = 22, color = '#818CF8' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill={color} opacity="0.7" />
      <Circle cx="13" cy="13" r="2" fill="white" opacity="0.7" />
      <Circle cx="13" cy="13" r="0.8" fill={color} />
    </Svg>
  );
}

/** 🔥 hot flashes — flame */
function SymptomHotFlashes({ size = 22, color = '#EF4444' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C12 2 8 7 8 11a4 4 0 0 0 8 0c0-1.5-.8-3-2-4 0 2-1 3-2 3-1 0-2-1-2-2.5C10 5.5 12 2 12 2z"
        fill={color} />
    </Svg>
  );
}

/** 🌀 dizziness — swirl */
function SymptomDizziness({ size = 22, color = '#06B6D4' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3a9 9 0 1 0 9 9" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
      <Path d="M12 7a5 5 0 1 0 5 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" fill="none" />
      <Circle cx="12" cy="12" r="1.5" fill={color} />
    </Svg>
  );
}

/** 🍽️ appetite changes — fork & knife */
function SymptomAppetite({ size = 22, color = '#10B981' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1="18" y1="2" x2="18" y2="22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M14 2v6a4 4 0 0 0 4 4M6 2v4M10 2v4M8 6a4 4 0 0 0 0 8v8"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/** 🌿 digestive issues — leaf */
function SymptomDigestive({ size = 22, color = '#84CC16' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M17 8C8 10 5.9 16.17 3.82 19.82A1 1 0 0 0 5 21c10-5 15-10 13-17z"
        fill={color} stroke={color} strokeWidth="1" strokeLinejoin="round" />
      <Path d="M5 21 Q10 16 13 13" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" fill="none" />
    </Svg>
  );
}

export function SymptomIcon({ symptom, size = 22, color }: { symptom: string; size?: number; color?: string }) {
  switch (symptom) {
    case 'cramps':              return <SymptomCramps           size={size} color={color ?? '#F87171'} />;
    case 'headache':            return <SymptomHeadache         size={size} color={color ?? '#FB923C'} />;
    case 'bloating':            return <SymptomBloating         size={size} color={color ?? '#FBBF24'} />;
    case 'acne':                return <SymptomAcne             size={size} color={color ?? '#F472B6'} />;
    case 'fatigue':             return <SymptomFatigue          size={size} color={color ?? '#A78BFA'} />;
    case 'nausea':              return <SymptomNausea           size={size} color={color ?? '#34D399'} />;
    case 'back_pain':           return <SymptomBone             size={size} color={color ?? '#60A5FA'} />;
    case 'mood_swings':         return <SymptomMoodSwings       size={size} color={color ?? '#F59E0B'} />;
    case 'breast_tenderness':   return <SymptomBreastTenderness size={size} color={color ?? '#EC4899'} />;
    case 'insomnia':            return <SymptomInsomnia         size={size} color={color ?? '#818CF8'} />;
    case 'hot_flashes':         return <SymptomHotFlashes       size={size} color={color ?? '#EF4444'} />;
    case 'dizziness':           return <SymptomDizziness        size={size} color={color ?? '#06B6D4'} />;
    case 'appetite_changes':    return <SymptomAppetite         size={size} color={color ?? '#10B981'} />;
    case 'joint_pain':          return <SymptomBone             size={size} color={color ?? '#6366F1'} />;
    case 'digestive_issues':    return <SymptomDigestive        size={size} color={color ?? '#84CC16'} />;
    default:                    return null;
  }
}

// ─── Mood Icons ────────────────────────────────────────────────────────────────

/** 😊 happy */
function MoodHappy({ size = 22, color = '#FCD34D' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5" />
      <Circle cx="9" cy="10.5" r="1" fill={color} />
      <Circle cx="15" cy="10.5" r="1" fill={color} />
      <Path d="M8.5 14.5 Q12 18 15.5 14.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/** 😌 calm */
function MoodCalm({ size = 22, color = '#86EFAC' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5" />
      <Line x1="9" y1="10.5" x2="11" y2="10.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="13" y1="10.5" x2="15" y2="10.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M9 15 Q12 16.5 15 15" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/** 😢 sad */
function MoodSad({ size = 22, color = '#93C5FD' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5" />
      <Circle cx="9" cy="10.5" r="1" fill={color} />
      <Circle cx="15" cy="10.5" r="1" fill={color} />
      <Path d="M8.5 16 Q12 13 15.5 16" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <Line x1="15" y1="8" x2="15" y2="10" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    </Svg>
  );
}

/** 😰 anxious */
function MoodAnxious({ size = 22, color = '#FCA5A5' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5" />
      <Path d="M8 10 Q9 8.5 10 10" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <Path d="M14 10 Q15 8.5 16 10" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <Path d="M9 15.5 Q10.5 13.5 12 15.5 Q13.5 13.5 15 15.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/** 😠 irritable */
function MoodIrritable({ size = 22, color = '#F87171' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5" />
      <Path d="M8 9.5 L11 10.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M16 9.5 L13 10.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M8.5 16 Q12 13 15.5 16" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/** ⚡ energetic — bolt */
function MoodEnergetic({ size = 22, color = '#FDE68A' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5" />
      <Path d="M13 4L7 13h6l-2 7 8-10h-6l2-6z" fill={color} />
    </Svg>
  );
}

/** 😪 tired */
function MoodTired({ size = 22, color = '#C4B5FD' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5" />
      <Path d="M8 10 Q9.5 11.5 11 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <Path d="M13 10 Q14.5 11.5 16 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <Line x1="9" y1="15" x2="15" y2="15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

/** 🥺 emotional */
function MoodEmotional({ size = 22, color = '#FBCFE8' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" fill={color} opacity="0.4" stroke={color} strokeWidth="1.5" />
      <Circle cx="9" cy="10.5" r="1.2" fill={color} />
      <Circle cx="15" cy="10.5" r="1.2" fill={color} />
      <Path d="M9 15 Q12 17 15 15" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <Path d="M8 8.5 Q9 7 10 8" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.6" fill="none" />
      <Path d="M14 8.5 Q15 7 16 8" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.6" fill="none" />
    </Svg>
  );
}

/** 🎯 focused — target */
function MoodFocused({ size = 22, color = '#6EE7B7' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" fill="none" opacity="0.4" />
      <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6" />
      <Circle cx="12" cy="12" r="2" fill={color} />
    </Svg>
  );
}

/** 🌈 hopeful — arc rainbow */
function MoodHopeful({ size = 22, color = '#BAE6FD' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 17a9 9 0 0 1 18 0" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <Path d="M6 17a6 6 0 0 1 12 0" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round" fill="none" />
      <Path d="M9 17a3 3 0 0 1 6 0" stroke="#F9A8D4" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/** 😵 overwhelmed */
function MoodOverwhelmed({ size = 22, color = '#DDD6FE' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" fill={color} opacity="0.3" stroke={color} strokeWidth="1.5" />
      <Path d="M8 9 L10 11 M10 9 L8 11" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M14 9 L16 11 M16 9 L14 11" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M9 15.5 Q10.5 13.5 12 15.5 Q13.5 13.5 15 15.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/** 🥰 content — smiling with hearts */
function MoodContent({ size = 22, color = '#FDE68A' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5" />
      <Path d="M8.5 14.5 Q12 18 15.5 14.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <Path d="M7 8.5 Q8 7.5 9 8.5 Q8 9.5 7 8.5z" fill="#F472B6" />
      <Path d="M15 8.5 Q16 7.5 17 8.5 Q16 9.5 15 8.5z" fill="#F472B6" />
    </Svg>
  );
}

export function MoodIcon({ mood, size = 22, color }: { mood: string; size?: number; color?: string }) {
  switch (mood) {
    case 'happy':       return <MoodHappy       size={size} color={color ?? '#FCD34D'} />;
    case 'calm':        return <MoodCalm        size={size} color={color ?? '#86EFAC'} />;
    case 'sad':         return <MoodSad         size={size} color={color ?? '#93C5FD'} />;
    case 'anxious':     return <MoodAnxious     size={size} color={color ?? '#FCA5A5'} />;
    case 'irritable':   return <MoodIrritable   size={size} color={color ?? '#F87171'} />;
    case 'energetic':   return <MoodEnergetic   size={size} color={color ?? '#FDE68A'} />;
    case 'tired':       return <MoodTired       size={size} color={color ?? '#C4B5FD'} />;
    case 'emotional':   return <MoodEmotional   size={size} color={color ?? '#FBCFE8'} />;
    case 'focused':     return <MoodFocused     size={size} color={color ?? '#6EE7B7'} />;
    case 'hopeful':     return <MoodHopeful     size={size} color={color ?? '#BAE6FD'} />;
    case 'overwhelmed': return <MoodOverwhelmed size={size} color={color ?? '#DDD6FE'} />;
    case 'content':     return <MoodContent     size={size} color={color ?? '#FDE68A'} />;
    default:            return null;
  }
}