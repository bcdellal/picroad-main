import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadows } from '../../src/theme';
import { supabase } from '../../src/lib/supabase';
import { useApp, type Moment } from '../../src/store/useApp';
import { hoursLeft } from '../../src/lib/time';

type FeedMoment = Moment & {
  userId: string;
  expiresAt: string;
};

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const localMoments = useApp((s) => s.moments);
  const [feed, setFeed] = useState<FeedMoment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadFeed = useCallback(async () => {
    if (!supabase) {
      setFeed(localMoments.filter((m) => Date.now() - m.createdAt < 24 * 60 * 60 * 1000).map((m) => ({
        ...m,
        userId: 'local',
        expiresAt: new Date(m.createdAt + 24 * 60 * 60 * 1000).toISOString(),
      })));
      setLoading(false);
      return;
    }

    try {
      setError('');
      const { data: rows, error: momentsError } = await supabase
        .from('moments')
        .select('id,user_id,storage_path,caption,latitude,longitude,created_at,expires_at')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (momentsError) throw momentsError;
      const userIds = [...new Set((rows ?? []).map((row) => row.user_id))];
      const { data: profiles, error: profilesError } = userIds.length
        ? await supabase.from('profiles').select('id,username,display_name').in('id', userIds)
        : { data: [], error: null };
      if (profilesError) throw profilesError;

      const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
      const results = await Promise.all((rows ?? []).map(async (row) => {
        const { data, error: imageError } = await supabase.storage
          .from('moments')
          .createSignedUrl(row.storage_path, 60 * 60);
        if (imageError || !data?.signedUrl) return null;
        const profile = profileById.get(row.user_id);
        const name = profile?.display_name || profile?.username || 'PicRoad kullanıcısı';
        return {
          id: row.id,
          userId: row.user_id,
          author: name,
          mine: false,
          uri: data.signedUrl,
          caption: row.caption ?? '',
          createdAt: new Date(row.created_at).getTime(),
          latitude: row.latitude,
          longitude: row.longitude,
          expiresAt: row.expires_at,
        } satisfies FeedMoment;
      }));
      setFeed(results.filter((item): item is FeedMoment => item !== null));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Moment akışı yüklenemedi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [localMoments]);

  useFocusEffect(useCallback(() => {
    void loadFeed();
  }, [loadFeed]));

  const onRefresh = () => {
    setRefreshing(true);
    void loadFeed();
  };

  return (
    <View style={s.root}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={s.top}>
          <View>
            <Text style={s.eyebrow}>PICROAD COMMUNITY</Text>
            <Text style={s.title}>Akış</Text>
            <Text style={s.subtitle}>Arkadaşlarının yolda bıraktığı anlar.</Text>
          </View>
          <View style={s.topIcon}><Ionicons name="sparkles-outline" size={21} color={colors.primary} /></View>
        </View>

        <View style={s.composer}>
          <View style={s.composerAvatar}><Ionicons name="camera-outline" size={19} color={colors.primary} /></View>
          <View style={s.composerCopy}>
            <Text style={s.composerTitle}>Bugün nerelerdeydin?</Text>
            <Text style={s.composerSub}>Bir fotoğraf çek, anını yoluna bırak.</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </View>

        <View style={s.feedHeader}>
          <Text style={s.feedTitle}>Son anlar</Text>
          <Text style={s.feedCount}>{feed.length} MOMENT</Text>
        </View>

        {loading ? (
          <View style={s.stateCard}><ActivityIndicator color={colors.primary} /><Text style={s.stateText}>Anlar yükleniyor...</Text></View>
        ) : error ? (
          <View style={s.stateCard}>
            <Ionicons name="cloud-offline-outline" size={26} color={colors.muted} />
            <Text style={s.stateTitle}>Akış yüklenemedi</Text>
            <Text style={s.stateText}>{error}</Text>
            <Pressable onPress={onRefresh} style={s.retry}><Text style={s.retryText}>Tekrar dene</Text></Pressable>
          </View>
        ) : feed.length === 0 ? (
          <View style={s.emptyCard}>
            <View style={s.emptyIcon}><Ionicons name="images-outline" size={26} color={colors.primary} /></View>
            <Text style={s.emptyTitle}>Hikâyen burada başlayacak.</Text>
            <Text style={s.emptyText}>Henüz akışında bir Moment yok. Yürüyüşe çık, ilk fotoğrafını paylaş veya arkadaşlarını PicRoad'a davet et.</Text>
          </View>
        ) : (
          feed.map((moment) => (
            <View key={moment.id} style={s.post}>
              <View style={s.postHead}>
                <View style={s.avatar}><Text style={s.avatarText}>{moment.author.slice(0, 1).toUpperCase()}</Text></View>
                <View style={s.authorCopy}>
                  <Text style={s.author}>{moment.author}</Text>
                  <Text style={s.timestamp}>{relativeTime(moment.createdAt)} · {hoursLeft(moment.createdAt)} saat kaldı</Text>
                </View>
                <View style={s.more}><Ionicons name="ellipsis-horizontal" size={20} color={colors.muted} /></View>
              </View>
              <Image source={{ uri: moment.uri }} style={s.photo} resizeMode="cover" />
              {moment.caption ? <Text style={s.caption}>{moment.caption}</Text> : null}
              <View style={s.postFoot}>
                <View style={s.locationLabel}><Ionicons name="location-outline" size={14} color={colors.primary} /><Text style={s.locationText}>Bir yürüyüş anısı</Text></View>
                <Text style={s.expiry}>24 SAAT</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function relativeTime(timestamp: number) {
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 1) return 'Az önce';
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} sa önce`;
  return `${Math.floor(hours / 24)} gün önce`;
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  top: { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { fontSize: 9, fontWeight: '800', letterSpacing: 1.7, color: colors.primary },
  title: { marginTop: 3, fontSize: 32, fontWeight: '800', letterSpacing: -1, color: colors.ink },
  subtitle: { marginTop: 3, fontSize: 13, color: colors.muted },
  topIcon: { width: 44, height: 44, borderRadius: 16, backgroundColor: colors.glassStrong, borderWidth: 1, borderColor: colors.glassBorder, alignItems: 'center', justifyContent: 'center' },
  composer: { marginHorizontal: 18, marginTop: 22, padding: 14, borderRadius: radius.lg, backgroundColor: colors.glassStrong, borderWidth: 1, borderColor: colors.glassBorder, flexDirection: 'row', alignItems: 'center', ...shadows.soft },
  composerAvatar: { width: 42, height: 42, borderRadius: 15, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  composerCopy: { flex: 1, marginLeft: 11 },
  composerTitle: { fontSize: 13, fontWeight: '800', color: colors.ink },
  composerSub: { marginTop: 3, fontSize: 11, color: colors.muted },
  feedHeader: { marginTop: 27, marginBottom: 12, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  feedTitle: { fontSize: 19, fontWeight: '800', color: colors.ink },
  feedCount: { fontSize: 9, fontWeight: '800', letterSpacing: 1.1, color: colors.muted },
  post: { marginHorizontal: 14, marginBottom: 16, padding: 10, borderRadius: radius.xl, backgroundColor: colors.glassStrong, borderWidth: 1, borderColor: colors.glassBorder, ...shadows.soft },
  postHead: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingVertical: 5, marginBottom: 10 },
  avatar: { width: 39, height: 39, borderRadius: 15, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.primary, fontSize: 16, fontWeight: '800' },
  authorCopy: { flex: 1, marginLeft: 10 },
  author: { fontSize: 13, fontWeight: '800', color: colors.ink },
  timestamp: { marginTop: 3, fontSize: 10, color: colors.muted },
  more: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  photo: { width: '100%', aspectRatio: 0.92, borderRadius: radius.lg, backgroundColor: colors.line },
  caption: { marginTop: 11, marginHorizontal: 4, fontSize: 13, lineHeight: 20, color: colors.ink },
  postFoot: { marginTop: 12, marginHorizontal: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  locationLabel: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 11, color: colors.muted, fontWeight: '600' },
  expiry: { fontSize: 9, letterSpacing: 1, fontWeight: '800', color: colors.primary },
  stateCard: { marginHorizontal: 18, padding: 28, borderRadius: radius.xl, backgroundColor: colors.glassStrong, alignItems: 'center', gap: 9 },
  stateTitle: { marginTop: 5, fontSize: 16, fontWeight: '800', color: colors.ink },
  stateText: { fontSize: 12, color: colors.muted, textAlign: 'center', lineHeight: 18 },
  retry: { marginTop: 5, paddingHorizontal: 18, paddingVertical: 10, borderRadius: radius.pill, backgroundColor: colors.primarySoft },
  retryText: { fontSize: 12, fontWeight: '800', color: colors.primary },
  emptyCard: { marginHorizontal: 18, padding: 26, borderRadius: radius.xl, backgroundColor: colors.glassStrong, borderWidth: 1, borderColor: colors.glassBorder, alignItems: 'center', ...shadows.soft },
  emptyIcon: { width: 54, height: 54, borderRadius: 19, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { marginTop: 15, fontSize: 17, fontWeight: '800', color: colors.ink },
  emptyText: { marginTop: 7, fontSize: 12, lineHeight: 19, textAlign: 'center', color: colors.muted },
});
