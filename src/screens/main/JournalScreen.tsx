import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Alert, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../lib/supabase';
import { Screen } from '../../components/common/Screen';
import { Button, EmptyState } from '../../components/common/UIComponents';
import { COLORS, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS, MOODS_CONFIG } from '../../constants/theme';
import { JournalEntry, MoodType } from '../../types';

// ─── Journal List Screen ──────────────────────────────────────────────────────
export default function JournalScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { colors } = useTheme();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadEntries = async () => {
    if (!user) return;
    const { data } = await db.journal()
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(50);
    setEntries(data || []);
    setIsLoading(false);
  };

  useEffect(() => { loadEntries(); }, [user]);

  const handleDelete = (id: string) => {
    Alert.alert('Delete entry', 'Are you sure you want to delete this journal entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await db.journal().delete().eq('id', id);
          loadEntries();
        },
      },
    ]);
  };

  return (
    <Screen padding={false} style={{ backgroundColor: colors.background }}>
      <LinearGradient colors={['#E0F2FE50', colors.background]} style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backArrow, { color: '#0284C7' }]}>←</Text>
        </Pressable>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.text.primary }]}>Journal</Text>
          <Pressable
            onPress={() => navigation.navigate('JournalEntry', { date: format(new Date(), 'yyyy-MM-dd') })}
            style={[styles.newBtn, { backgroundColor: '#0284C7' }]}
          >
            <Text style={styles.newBtnText}>+ New</Text>
          </Pressable>
        </View>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          Your private space to reflect
        </Text>
      </LinearGradient>

      {entries.length === 0 && !isLoading ? (
        <EmptyState
          emoji="📖"
          title="Your journal awaits"
          body="Write about how you're feeling, track patterns, and reflect on your wellness journey."
          action="Write first entry"
          onAction={() => navigation.navigate('JournalEntry', { date: format(new Date(), 'yyyy-MM-dd') })}
        />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={e => e.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <JournalCard
              entry={item}
              onPress={() => navigation.navigate('JournalEntry', { id: item.id })}
              onLongPress={() => handleDelete(item.id)}
            />
          )}
        />
      )}
    </Screen>
  );
}

function JournalCard({ entry, onPress, onLongPress }: { entry: JournalEntry; onPress: () => void; onLongPress: () => void }) {
  const { colors } = useTheme();
  const moodConfig = entry.mood ? MOODS_CONFIG[entry.mood as MoodType] : null;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.journalCard,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
        SHADOWS.sm,
      ]}
    >
      <View style={styles.journalCardHeader}>
        <Text style={[styles.journalDate, { color: colors.text.primary }]}>
          {format(parseISO(entry.date), 'MMMM d, yyyy')}
        </Text>
        {moodConfig && (
          <Text style={{ fontSize: 18 }}>{moodConfig.emoji}</Text>
        )}
      </View>
      <Text style={[styles.journalPreview, { color: colors.text.secondary }]} numberOfLines={3}>
        {entry.content}
      </Text>
      {entry.tags && entry.tags.length > 0 && (
        <View style={styles.tagRow}>
          {entry.tags.slice(0, 3).map(tag => (
            <View key={tag} style={[styles.tag, { backgroundColor: COLORS.primary[50] }]}>
              <Text style={[styles.tagText, { color: COLORS.primary[600] }]}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 60, paddingHorizontal: SPACING[5], paddingBottom: SPACING[4] },
  backBtn: { marginBottom: SPACING[3] },
  backArrow: { fontSize: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontFamily: FONTS.display.semiBold, fontSize: FONT_SIZES['3xl'] },
  subtitle: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.sm },
  newBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.full },
  newBtnText: { fontFamily: FONTS.body.bold, fontSize: FONT_SIZES.sm, color: '#FFFFFF' },
  list: { paddingHorizontal: SPACING[5], paddingBottom: SPACING[8] },
  journalCard: { borderRadius: RADIUS['2xl'], borderWidth: 1, padding: SPACING[4], marginBottom: SPACING[3] },
  journalCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING[2] },
  journalDate: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.sm },
  journalPreview: { fontFamily: FONTS.body.regular, fontSize: FONT_SIZES.base, lineHeight: 22 },
  tagRow: { flexDirection: 'row', gap: 6, marginTop: SPACING[2] },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  tagText: { fontFamily: FONTS.body.medium, fontSize: FONT_SIZES.xs },
});
