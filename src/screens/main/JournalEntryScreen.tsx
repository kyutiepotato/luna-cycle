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

const WRITING_PROMPTS = [
  "How does your body feel today?",
  "What emotions are present for you right now?",
  "What is one thing you're grateful for today?",
  "What does your body need most right now?",
  "How has your energy been this week?",
  "What would feel nurturing to you today?",
];

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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
            <Text style={[styles.backArrow, { color: '#0284C7' }]}>←</Text>
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
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
                  <Text style={{ fontSize: 16 }}>{config.emoji}</Text>
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
              <Text style={{ fontSize: 16 }}>💭</Text>
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
                <Text style={[styles.tagChipText, { color: COLORS.primary[600] }]}>#{tag} ×</Text>
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
  backArrow: { fontSize: 24 },
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
  tagChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.full, borderWidth: 1 },
  tagChipText: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.xs },
  tagInput: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: RADIUS.full, borderWidth: 1, minWidth: 100 },
  tagInputText: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.xs },
  saveBtn: {},
});
