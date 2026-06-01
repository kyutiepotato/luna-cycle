import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../lib/supabase';
import { Button } from '../../components/common/UIComponents';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS, MOODS_CONFIG } from '../../constants/theme';
import { MoodType } from '../../types';
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';

// ─── Safe haptics helper (no-op on web) ──────────────────────────────────────
const triggerHaptic = (style: 'light' | 'success' = 'light') => {
  if (Platform.OS === 'web') return;
  if (style === 'success') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } else {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

const WRITING_PROMPTS = [
  "How does your body feel today?",
  "What emotions are present for you right now?",
  "What is one thing you're grateful for today?",
  "What does your body need most right now?",
  "How has your energy been this week?",
  "What would feel nurturing to you today?",
];

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function IconArrowLeft({ size = 24, color = '#0284C7' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M12 5l-7 7 7 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconBubble({ size = 16, color = '#C084A0' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        fill={color} stroke={color} strokeWidth="1" strokeLinejoin="round" />
      <Line x1="8" y1="9" x2="16" y2="9" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <Line x1="8" y1="13" x2="13" y2="13" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
    </Svg>
  );
}

function IconX({ size = 10, color = '#E84B7A' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );
}

// ─── Mood SVG icons ───────────────────────────────────────────────────────────

function MoodFace({ moodKey, size = 18, color = '#C084A0' }: { moodKey: string; size?: number; color?: string }) {
  switch (moodKey) {
    case 'sad':
    case 'overwhelmed':
    case 'emotional':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" fill="none" />
          <Circle cx="9" cy="10" r="1" fill={color} />
          <Circle cx="15" cy="10" r="1" fill={color} />
          <Path d="M8.5 15.5 Q12 12 15.5 15.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </Svg>
      );
    case 'anxious':
    case 'stressed':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" fill="none" />
          <Path d="M8 9.5 Q9 8 10 9.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <Path d="M14 9.5 Q15 8 16 9.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <Path d="M9 14.5 Q12 13 15 14.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </Svg>
      );
    case 'irritable':
    case 'angry':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" fill="none" />
          <Path d="M8 8.5 L10 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <Path d="M16 8.5 L14 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <Circle cx="9" cy="11" r="1" fill={color} />
          <Circle cx="15" cy="11" r="1" fill={color} />
          <Path d="M8.5 15.5 Q12 12 15.5 15.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </Svg>
      );
    case 'energetic':
    case 'excited':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2 L13.5 9 L20 12 L13.5 15 L12 22 L10.5 15 L4 12 L10.5 9 Z" fill={color} />
        </Svg>
      );
    case 'calm':
    case 'focused':
    case 'neutral':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" fill="none" />
          <Circle cx="9" cy="10" r="1" fill={color} />
          <Circle cx="15" cy="10" r="1" fill={color} />
          <Line x1="9" y1="14" x2="15" y2="14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </Svg>
      );
    default: // happy, content, hopeful, tired
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" fill="none" />
          <Circle cx="9" cy="10" r="1" fill={color} />
          <Circle cx="15" cy="10" r="1" fill={color} />
          <Path d="M8.5 14.5 Q12 18 15.5 14.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </Svg>
      );
  }
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function JournalEntryScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const { colors } = useTheme();
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [prompt] = useState(() => WRITING_PROMPTS[Math.floor(Math.random() * WRITING_PROMPTS.length)]);

  const date = route.params?.date || format(new Date(), 'yyyy-MM-dd');
  const entryId = route.params?.id;

  useEffect(() => {
    if (entryId) {
      (async () => {
        const { data } = await db.journal().select('*').eq('id', entryId).single();
        if (data) {
          setContent(data.content);
          if (data.mood) setSelectedMood(data.mood as MoodType);
          if (data.tags) setTags(data.tags);
        }
      })();
    }
  }, [entryId]);

  const handleSave = async () => {
    if (!content.trim()) { Alert.alert('Empty entry', 'Write something before saving.'); return; }
    setIsSaving(true);
    try {
      if (entryId) {
        await db.journal().update({
          content: content.trim(), mood: selectedMood, tags,
          updated_at: new Date().toISOString(),
        }).eq('id', entryId);
      } else {
        await db.journal().insert({
          user_id: user!.id, date, content: content.trim(),
          mood: selectedMood, tags,
        });
      }
      triggerHaptic('success');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save entry.');
    } finally {
      setIsSaving(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '_');
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={[{ flex: 1, backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#E0F2FE50', colors.background]} style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <IconArrowLeft size={24} color="#0284C7" />
          </Pressable>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              {entryId ? 'Edit entry' : 'New entry'}
            </Text>
            <Text style={[styles.date, { color: colors.text.secondary }]}>
              {format(new Date(date), 'MMMM d')}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Mood selector */}
          <Text style={[styles.sectionLabel, { color: colors.text.secondary }]}>How are you feeling?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodScroll}>
            {(Object.keys(MOODS_CONFIG) as MoodType[]).slice(0, 8).map(mood => {
              const config = MOODS_CONFIG[mood];
              const isSelected = selectedMood === mood;
              return (
                <Pressable
                  key={mood}
                  onPress={() => {
                    triggerHaptic('light');
                    setSelectedMood(isSelected ? null : mood);
                  }}
                  style={[
                    styles.moodChip,
                    {
                      backgroundColor: isSelected ? config.color + '40' : colors.surfaceTertiary,
                      borderColor: isSelected ? config.color : colors.border,
                    },
                  ]}
                >
                  <MoodFace moodKey={mood} size={16} color={config.color} />
                  <Text style={[styles.moodChipLabel, { color: isSelected ? '#3A302A' : colors.text.secondary }]}>
                    {config.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Writing prompt */}
          {!content && (
            <Pressable
              onPress={() => setContent(prompt + '\n\n')}
              style={[styles.promptCard, { backgroundColor: COLORS.primary[50], borderColor: COLORS.primary[200] }]}
            >
              <IconBubble size={16} color={COLORS.primary[400]} />
              <Text style={[styles.promptText, { color: COLORS.primary[600] }]}>{prompt}</Text>
              <Text style={[styles.promptHint, { color: COLORS.primary[400] }]}>Tap to use this prompt</Text>
            </Pressable>
          )}

          {/* Text editor */}
          <View style={[styles.editorWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextInput
              value={content}
              onChangeText={setContent}
              multiline
              placeholder="What's on your mind today..."
              placeholderTextColor={colors.text.tertiary}
              style={[styles.editor, { color: colors.text.primary }]}
              textAlignVertical="top"
            />
          </View>

          {/* Word count */}
          <Text style={[styles.wordCount, { color: colors.text.tertiary }]}>
            {content.trim().split(/\s+/).filter(Boolean).length} words
          </Text>

          {/* Tags */}
          <Text style={[styles.sectionLabel, { color: colors.text.secondary }]}>Tags</Text>
          <View style={styles.tagsRow}>
            {tags.map(tag => (
              <Pressable
                key={tag}
                onPress={() => setTags(t => t.filter(x => x !== tag))}
                style={[styles.tagChip, { backgroundColor: COLORS.primary[50], borderColor: COLORS.primary[200] }]}
              >
                <Text style={[styles.tagChipText, { color: COLORS.primary[600] }]}>#{tag}</Text>
                <IconX size={10} color={COLORS.primary[400]} />
              </Pressable>
            ))}
            <View style={[styles.tagInput, { backgroundColor: colors.surfaceTertiary, borderColor: colors.border }]}>
              <TextInput
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={addTag}
                placeholder="Add tag..."
                placeholderTextColor={colors.text.tertiary}
                style={[styles.tagInputText, { color: colors.text.primary }]}
                returnKeyType="done"
              />
            </View>
          </View>

          <Button
            label={entryId ? 'Update entry' : 'Save entry'}
            onPress={handleSave}
            isLoading={isSaving}
            size="lg"
            style={styles.saveBtn}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 60, paddingHorizontal: SPACING[5], paddingBottom: SPACING[4] },
  backBtn: { marginBottom: SPACING[3] },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  title: { fontFamily: FONTS.display.semiBold, fontSize: FONT_SIZES['3xl'] },
  date: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.sm },
  body: { paddingHorizontal: SPACING[5], paddingBottom: SPACING[10] },
  sectionLabel: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.sm, marginBottom: SPACING[2], marginTop: SPACING[4] },
  moodScroll: { marginBottom: SPACING[4] },
  moodChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: RADIUS.full, borderWidth: 1.5, marginRight: 8 },
  moodChipLabel: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.xs },
  promptCard: { borderRadius: RADIUS.xl, borderWidth: 1, padding: SPACING[4], marginBottom: SPACING[4], gap: 4 },
  promptText: { fontFamily: FONTS.display.regular, fontSize: FONT_SIZES.md, lineHeight: 24 },
  promptHint: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs },
  editorWrapper: { borderRadius: RADIUS.xl, borderWidth: 1.5, padding: SPACING[4], minHeight: 220 },
  editor: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.md, lineHeight: 26, minHeight: 200 },
  wordCount: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs, textAlign: 'right', marginTop: SPACING[1] },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING[5] },
  tagChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.full, borderWidth: 1 },
  tagChipText: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.xs },
  tagInput: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: RADIUS.full, borderWidth: 1, minWidth: 100 },
  tagInputText: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs },
  saveBtn: {},
});