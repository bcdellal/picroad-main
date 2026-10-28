import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../../src/theme';
import { useApp } from '../../src/store/useApp';
import { hoursLeft, isExpired } from '../../src/lib/time';

export default function MomentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const m = useApp((s) => s.moments.find((x) => x.id === id));
  const [now, setNow] = useState(Date.now());
  const [message, setMessage] = useState('');
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  if (!m || isExpired(m.createdAt, now)) {
    return <View style={s.empty}><Text style={s.emptyTitle}>Bu an artık yok.</Text><Text style={s.emptyText}>Fotoğraflar 24 saat sonra kayboluyor.</Text><Pressable onPress={() => router.back()} style={s.backButton}><Text style={s.backText}>Geri dön</Text></Pressable></View>;
  }

  return (
    <View style={s.root}>
      <View style={s.top}>
        <Text style={s.author}>{m.author}</Text>
        <Text style={s.left}>{hoursLeft(m.createdAt, now)} saat kaldı</Text>
        <Pressable onPress={() => router.back()} accessibilityLabel="Kapat"><Ionicons name="close" size={26} color={colors.ink} /></Pressable>
      </View>
      <Image source={{ uri: m.uri }} style={s.photo} />
      <Text style={s.caption}>{m.caption || 'Bir an'}</Text>
      <View style={s.row}>
        <TextInput
          style={s.input}
          value={message}
          onChangeText={setMessage}
          placeholder={`${m.author}'e küçük bir merhaba yaz...`}
          placeholderTextColor={colors.muted}
          returnKeyType="send"
          onSubmitEditing={() => setMessage('')}
        />
        <Pressable style={s.heart} onPress={() => setLiked((value) => !value)} accessibilityRole="button" accessibilityLabel={liked ? 'Beğeniyi kaldır' : 'Beğen'}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={24} color={liked ? colors.primary : colors.ink} />
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.card, padding: 20, gap: 16 },
  empty: { flex: 1, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  emptyTitle: { fontSize: 24, fontWeight: '800', color: colors.ink },
  emptyText: { color: colors.muted, textAlign: 'center' },
  backButton: { marginTop: 8, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: colors.primary, borderRadius: radius.pill },
  backText: { color: '#fff', fontWeight: '700' },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  author: { flex: 1, fontSize: 20, fontWeight: '700', color: colors.ink },
  left: { color: colors.primary, backgroundColor: colors.primarySoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, fontWeight: '600', overflow: 'hidden' },
  photo: { width: '100%', aspectRatio: 1, borderRadius: radius.lg },
  caption: { fontSize: 22, fontWeight: '700', color: colors.ink },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  input: { flex: 1, height: 52, borderRadius: radius.pill, backgroundColor: colors.bg, paddingHorizontal: 18, color: colors.ink },
  heart: { width: 52, height: 52, borderRadius: 26, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
});
