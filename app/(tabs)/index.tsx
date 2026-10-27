import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius } from '../../src/theme';
import { useApp } from '../../src/store/useApp';
import { PhotoBubble } from '../../src/components/PhotoBubble';

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { me, route, moments } = useApp();

  return (
    <View style={s.root}>
      {me ? (
        <MapView
          style={StyleSheet.absoluteFill}
          showsUserLocation
          initialRegion={{ ...me, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
        >
          <Polyline coordinates={route} strokeColor={colors.route} strokeWidth={5} />
          {moments.map((m) => (
            <Marker
              key={m.id}
              coordinate={{ latitude: m.latitude, longitude: m.longitude }}
              onPress={() => router.push(`/moment/${m.id}`)}
            >
              <PhotoBubble moment={m} />
            </Marker>
          ))}
        </MapView>
      ) : (
        <View style={s.center}>
          <Text style={s.muted}>Konumun bulunuyor...</Text>
        </View>
      )}
      <View style={[s.header, { top: insets.top + 8 }]} pointerEvents="none">
        <Text style={s.title}>PicRoad</Text>
        <View style={s.chip}>
          <Text style={s.chipText}>24h, then gone</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { color: colors.muted, fontSize: 16 },
  header: { position: 'absolute', left: 20, gap: 8 },
  title: { fontSize: 32, fontWeight: '800', color: colors.ink },
  chip: { alignSelf: 'flex-start', backgroundColor: '#fff', borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8 },
  chipText: { color: colors.ink, fontWeight: '600' },
});
