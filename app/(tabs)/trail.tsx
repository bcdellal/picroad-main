import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius } from '../../src/theme';
import { useApp } from '../../src/store/useApp';
import { routeKm } from '../../src/lib/geo';
import { isExpired } from '../../src/lib/time';

export default function TrailScreen() {
  const insets = useSafeAreaInsets();
  const { route, moments } = useApp();
  const [now, setNow] = useState(Date.now());
  const mine = moments.filter((m) => m.mine && !isExpired(m.createdAt, now));

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <ScrollView style={s.root} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, paddingBottom: 140 }}>
      <Text style={s.title}>Günün rotası</Text>
      <Text style={s.sub}>Rota verilerin şu an yalnızca bu cihazda tutuluyor.</Text>
      <View style={s.stats}>
        <Stat value={routeKm(route).toFixed(1)} label="km yürüdün" />
        <Stat value={String(mine.length)} label="fotoğraf" />
        <Stat value={String(route.length)} label="iz noktası" />
      </View>
      <Text style={s.section}>Bugünkü anlar</Text>
      {mine.length === 0 && <Text style={s.sub}>Henüz fotoğraf bırakmadın. Aşağıdaki butona bas.</Text>}
      {mine.map((m) => (
        <View key={m.id} style={s.row}>
          <Text style={s.time}>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          <Text style={s.rowText}>{m.caption || 'Fotoğraf'}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return <View style={{ flex: 1 }}><Text style={s.statValue}>{value}</Text><Text style={s.statLabel}>{label}</Text></View>;
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  title: { fontSize: 30, fontWeight: '800', color: colors.ink },
  sub: { marginTop: 6, color: colors.muted, fontSize: 15 },
  stats: { flexDirection: 'row', marginTop: 24, backgroundColor: colors.card, borderRadius: radius.md, padding: 20 },
  statValue: { fontSize: 28, fontWeight: '800', color: colors.ink },
  statLabel: { color: colors.muted, marginTop: 2 },
  section: { marginTop: 28, marginBottom: 8, fontSize: 18, fontWeight: '700', color: colors.ink },
  row: { flexDirection: 'row', gap: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  time: { color: colors.muted, width: 56 },
  rowText: { color: colors.ink, fontWeight: '600' },
});
