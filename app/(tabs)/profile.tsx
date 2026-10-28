import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadows, type } from '../../src/theme';
import { useApp } from '../../src/store/useApp';
import { routeKm } from '../../src/lib/geo';

const achievements = [
  { icon: 'walk-outline', title: 'First Trace', text: 'İlk izini bıraktın.' },
  { icon: 'moon-outline', title: 'Night Walker', text: 'Gece yürüyüşü keşfi.' },
  { icon: 'compass-outline', title: 'Explorer', text: 'Yeni yollar keşfet.' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { route, moments } = useApp();
  const distance = routeKm(route);

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 18, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.topRow}>
        <View>
          <Text style={s.eyebrow}>YOUR PROFILE</Text>
          <Text style={s.title}>Yolculuğun</Text>
        </View>
        <View style={s.iconButton}><Ionicons name="settings-outline" size={20} color={colors.ink} /></View>
      </View>

      <View style={s.profileCard}>
        <View style={s.avatar}><Text style={s.avatarText}>P</Text></View>
        <View style={s.profileCopy}>
          <Text style={s.name}>PicRoad user</Text>
          <Text style={s.handle}>@picroad_user</Text>
          <Text style={s.bio}>Yürü. Keşfet. İz bırak.</Text>
        </View>
        <View style={s.qr}><Ionicons name="qr-code-outline" size={22} color={colors.ink} /></View>
      </View>

      <View style={s.socialStats}>
        <Stat value={String(route.length)} label="iz noktası" />
        <View style={s.divider} />
        <Stat value={String(moments.length)} label="moment" />
        <View style={s.divider} />
        <Stat value="0" label="arkadaş" />
      </View>

      <View style={s.pcoinCard}>
        <View style={s.pcoinIcon}><Ionicons name="sparkles" size={19} color={colors.primary} /></View>
        <View style={s.pcoinCopy}>
          <Text style={s.cardEyebrow}>PICROAD CURRENCY</Text>
          <Text style={s.pcoinTitle}>1,280 Pcoin</Text>
          <Text style={s.cardText}>Yürüdükçe kazan, avatarını kişiselleştir.</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </View>

      <View style={s.sectionHead}>
        <View><Text style={s.sectionEyebrow}>MY TRACE</Text><Text style={s.sectionTitle}>Bugünkü izin</Text></View>
        <Ionicons name="map-outline" size={20} color={colors.primary} />
      </View>
      <View style={s.traceCard}>
        <View style={s.mapFake}>
          <View style={s.routeLine} />
          <View style={[s.dot, { left: '24%', top: '62%' }]} />
          <View style={[s.dot, { left: '68%', top: '28%' }]} />
          <View style={[s.dot, { left: '82%', top: '60%' }]} />
        </View>
        <View style={s.traceBottom}>
          <View><Text style={s.traceValue}>{distance.toFixed(1)} km</Text><Text style={s.traceMeta}>bugünkü rota</Text></View>
          <View><Text style={s.traceValue}>{moments.length}</Text><Text style={s.traceMeta}>moment</Text></View>
          <View style={s.traceAction}><Text style={s.traceActionText}>Görüntüle</Text></View>
        </View>
      </View>

      <View style={s.sectionHead}>
        <View><Text style={s.sectionEyebrow}>ACHIEVEMENTS</Text><Text style={s.sectionTitle}>Öne çıkanlar</Text></View>
        <Text style={s.link}>3 seçilebilir</Text>
      </View>
      <View style={s.achievements}>
        {achievements.map((item) => (
          <View key={item.title} style={s.achievement}>
            <View style={s.achievementIcon}><Ionicons name={item.icon as any} size={18} color={colors.primary} /></View>
            <View style={s.achievementCopy}><Text style={s.achievementTitle}>{item.title}</Text><Text style={s.achievementText}>{item.text}</Text></View>
          </View>
        ))}
      </View>

      <View style={s.sectionHead}>
        <View><Text style={s.sectionEyebrow}>YOUR MOMENTS</Text><Text style={s.sectionTitle}>Son izlerin</Text></View>
        <Text style={s.link}>{moments.length} moment</Text>
      </View>
      <View style={s.momentsCard}>
        {moments.length ? (
          <Text style={s.cardText}>Son bıraktığın momentler burada keşfedilebilir olacak.</Text>
        ) : (
          <>
            <View style={s.emptyIcon}><Ionicons name="camera-outline" size={20} color={colors.primary} /></View>
            <Text style={s.emptyTitle}>Henüz bir moment yok.</Text>
            <Text style={s.cardText}>Yürürken ortadaki “İz bırak” butonuyla ilk anını oluştur.</Text>
          </>
        )}
      </View>

      <View style={s.friendRow}>
        <View style={s.friendIcon}><Ionicons name="person-add-outline" size={20} color={colors.primary} /></View>
        <View style={s.friendCopy}><Text style={s.friendTitle}>Arkadaş ekle</Text><Text style={s.cardText}>Nickname veya QR ile yeni bir yol arkadaşı bul.</Text></View>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </View>
    </ScrollView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return <View style={s.stat}><Text style={s.value}>{value}</Text><Text style={s.label}>{label}</Text></View>;
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  eyebrow: { fontSize: type.micro, fontWeight: '800', letterSpacing: 1.8, color: colors.primary },
  title: { marginTop: 4, fontSize: type.title, fontWeight: '800', letterSpacing: -1.1, color: colors.ink },
  iconButton: { width: 42, height: 42, borderRadius: 15, backgroundColor: colors.glassStrong, borderWidth: 1, borderColor: colors.glassBorder, alignItems: 'center', justifyContent: 'center', ...shadows.soft },
  profileCard: { marginTop: 20, padding: 18, borderRadius: radius.xl, backgroundColor: colors.glassStrong, borderWidth: 1, borderColor: colors.glassBorder, flexDirection: 'row', alignItems: 'center', ...shadows.glass },
  avatar: { width: 68, height: 68, borderRadius: 23, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 27, fontWeight: '800', color: colors.primary },
  profileCopy: { flex: 1, marginLeft: 14 },
  name: { fontSize: 20, fontWeight: '800', color: colors.ink },
  handle: { marginTop: 2, fontSize: 12, color: colors.muted },
  bio: { marginTop: 8, fontSize: 13, fontWeight: '600', color: colors.ink },
  qr: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  socialStats: { marginTop: 12, padding: 17, borderRadius: radius.lg, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder, flexDirection: 'row', ...shadows.soft },
  stat: { flex: 1, alignItems: 'center' },
  divider: { width: 1, height: 34, backgroundColor: colors.line },
  value: { fontSize: 20, fontWeight: '800', color: colors.ink },
  label: { marginTop: 2, fontSize: 11, color: colors.muted },
  pcoinCard: { marginTop: 12, padding: 16, borderRadius: radius.lg, backgroundColor: colors.primarySoft, flexDirection: 'row', alignItems: 'center' },
  pcoinIcon: { width: 42, height: 42, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.75)', alignItems: 'center', justifyContent: 'center' },
  pcoinCopy: { flex: 1, marginLeft: 11 },
  cardEyebrow: { fontSize: 8, fontWeight: '800', letterSpacing: 1.2, color: colors.primary },
  pcoinTitle: { marginTop: 2, fontSize: 17, fontWeight: '800', color: colors.ink },
  cardText: { marginTop: 3, fontSize: 12, lineHeight: 18, color: colors.muted },
  sectionHead: { marginTop: 28, marginBottom: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionEyebrow: { fontSize: 9, fontWeight: '800', letterSpacing: 1.4, color: colors.primary },
  sectionTitle: { marginTop: 2, fontSize: 19, fontWeight: '800', color: colors.ink },
  link: { fontSize: 11, fontWeight: '700', color: colors.primary },
  traceCard: { borderRadius: radius.xl, backgroundColor: colors.glassStrong, borderWidth: 1, borderColor: colors.glassBorder, overflow: 'hidden', ...shadows.soft },
  mapFake: { height: 150, backgroundColor: '#ECEAF0', position: 'relative', overflow: 'hidden' },
  routeLine: { position: 'absolute', width: '82%', height: 5, borderRadius: 4, backgroundColor: colors.route, left: '10%', top: '47%', transform: [{ rotate: '-20deg' }] },
  dot: { position: 'absolute', width: 11, height: 11, borderRadius: 6, backgroundColor: colors.primary, borderWidth: 2, borderColor: '#FFFFFF' },
  traceBottom: { padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  traceValue: { fontSize: 16, fontWeight: '800', color: colors.ink },
  traceMeta: { marginTop: 2, fontSize: 10, color: colors.muted },
  traceAction: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: colors.primarySoft },
  traceActionText: { fontSize: 11, fontWeight: '800', color: colors.primary },
  achievements: { gap: 9 },
  achievement: { padding: 13, borderRadius: radius.lg, backgroundColor: colors.glassStrong, borderWidth: 1, borderColor: colors.glassBorder, flexDirection: 'row', alignItems: 'center' },
  achievementIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  achievementCopy: { flex: 1, marginLeft: 11 },
  achievementTitle: { fontSize: 14, fontWeight: '800', color: colors.ink },
  achievementText: { marginTop: 2, fontSize: 11, color: colors.muted },
  momentsCard: { minHeight: 105, padding: 18, borderRadius: radius.lg, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder, justifyContent: 'center' },
  emptyIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { marginTop: 9, fontSize: 15, fontWeight: '800', color: colors.ink },
  friendRow: { marginTop: 12, padding: 15, borderRadius: radius.lg, backgroundColor: colors.glassStrong, borderWidth: 1, borderColor: colors.glassBorder, flexDirection: 'row', alignItems: 'center', ...shadows.soft },
  friendIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  friendCopy: { flex: 1, marginLeft: 11 },
  friendTitle: { fontSize: 14, fontWeight: '800', color: colors.ink },
});
