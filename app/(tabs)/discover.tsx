import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadows, type } from '../../src/theme';
import { useApp } from '../../src/store/useApp';

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const moments = useApp((s) => s.moments);

  return (
    <ScrollView style={s.root} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 18, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      <Text style={s.eyebrow}>DISCOVER</Text>
      <Text style={s.title}>Dünyandaki izler</Text>
      <Text style={s.sub}>Arkadaşlarının ve çevrendeki insanların bıraktığı anları keşfet.</Text>

      <View style={s.hero}>
        <View style={s.heroIcon}><Ionicons name="compass-outline" size={22} color={colors.primary} /></View>
        <Text style={s.heroEyebrow}>LIVE MOMENTS</Text>
        <Text style={s.heroTitle}>{moments.length ? moments.length + ' canlı moment keşfedilmeyi bekliyor.' : 'Henüz keşfedilecek bir moment yok.'}</Text>
        <Text style={s.heroText}>{moments.length ? 'Haritadan bir fotoğraf balonuna dokunarak o anı açabilirsin.' : 'Arkadaşlarını ekle, yürümeye başla ve ilk izleri birlikte oluştur.'}</Text>
      </View>

      <View style={s.quickRow}>
        <View style={s.quickCard}><View style={s.quickIcon}><Ionicons name="people-outline" size={18} color={colors.primary} /></View><Text style={s.quickTitle}>Arkadaşlar</Text><Text style={s.quickText}>Nickname veya QR ile ekle.</Text></View>
        <View style={s.quickCard}><View style={s.quickIcon}><Ionicons name="map-outline" size={18} color={colors.primary} /></View><Text style={s.quickTitle}>Yakınında</Text><Text style={s.quickText}>Şehrindeki izleri keşfet.</Text></View>
      </View>

      <View style={s.sectionHead}><Text style={s.sectionEyebrow}>HOW IT WORKS</Text><Text style={s.sectionTitle}>PicRoad'un fikri</Text></View>
      <View style={s.storyCard}>
        <Step icon="walk-outline" title="Yürü" text="Rotan günlük hikâyenin başlangıcı." />
        <Step icon="camera-outline" title="İz bırak" text="Yoldayken çektiğin anı konumuna bırak." />
        <Step icon="people-outline" title="Paylaş" text="Arkadaşlarınla aynı yolu birlikte keşfet." />
      </View>
    </ScrollView>
  );
}

function Step({ icon, title, text }: { icon: any; title: string; text: string }) {
  return <View style={s.step}><View style={s.stepIcon}><Ionicons name={icon} size={18} color={colors.primary} /></View><View style={s.stepCopy}><Text style={s.stepTitle}>{title}</Text><Text style={s.stepText}>{text}</Text></View></View>;
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  eyebrow: { fontSize: type.micro, fontWeight: '800', letterSpacing: 1.8, color: colors.primary },
  title: { marginTop: 4, fontSize: type.display, fontWeight: '800', letterSpacing: -1.3, color: colors.ink },
  sub: { marginTop: 5, color: colors.muted, fontSize: type.body, lineHeight: 21 },
  hero: { marginTop: 24, padding: 22, borderRadius: radius.xl, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder, ...shadows.glass },
  heroIcon: { width: 48, height: 48, borderRadius: 17, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  heroEyebrow: { fontSize: 9, fontWeight: '800', letterSpacing: 1.4, color: colors.primary },
  heroTitle: { marginTop: 5, fontSize: 20, lineHeight: 26, fontWeight: '800', color: colors.ink },
  heroText: { marginTop: 7, fontSize: 13, lineHeight: 20, color: colors.muted },
  quickRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  quickCard: { flex: 1, padding: 16, borderRadius: radius.lg, backgroundColor: colors.glassStrong, borderWidth: 1, borderColor: colors.glassBorder, ...shadows.soft },
  quickIcon: { width: 36, height: 36, borderRadius: 13, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  quickTitle: { marginTop: 11, fontSize: 14, fontWeight: '800', color: colors.ink },
  quickText: { marginTop: 3, fontSize: 11, lineHeight: 16, color: colors.muted },
  sectionHead: { marginTop: 28, marginBottom: 11 },
  sectionEyebrow: { fontSize: 9, fontWeight: '800', letterSpacing: 1.4, color: colors.primary },
  sectionTitle: { marginTop: 2, fontSize: 19, fontWeight: '800', color: colors.ink },
  storyCard: { padding: 15, borderRadius: radius.xl, backgroundColor: colors.glassStrong, borderWidth: 1, borderColor: colors.glassBorder, ...shadows.soft },
  step: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7 },
  stepIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  stepCopy: { flex: 1, marginLeft: 11 },
  stepTitle: { fontSize: 14, fontWeight: '800', color: colors.ink },
  stepText: { marginTop: 2, fontSize: 11, lineHeight: 17, color: colors.muted },
});
