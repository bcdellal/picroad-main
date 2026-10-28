import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../../src/theme';
import { useApp } from '../../src/store/useApp';
import { PhotoBubble } from '../../src/components/PhotoBubble';

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const { me, route, moments, locationStatus } = useApp();

  useEffect(() => {
    if (!me || !mapRef.current || route.length > 1) return;
    mapRef.current.animateToRegion({ ...me, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 500);
  }, [me, route.length]);

  const centerOnMe = () => {
    if (!me || !mapRef.current) return;
    const region: Region = { ...me, latitudeDelta: 0.01, longitudeDelta: 0.01 };
    mapRef.current.animateToRegion(region, 400);
  };

  return (
    <View style={s.root}>
      {me ? (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          showsUserLocation
          showsMyLocationButton={false}
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
          <Text style={s.muted}>
            {locationStatus === 'denied'
              ? 'Konum izni gerekli.'
              : locationStatus === 'error'
                ? 'Konum alınamadı. Lütfen tekrar dene.'
                : 'Konumun bulunuyor...'}
          </Text>
        </View>
      )}

      {me && (
        <Pressable
          onPress={centerOnMe}
          style={[s.locationButton, { top: insets.top + 92 }]}
          accessibilityRole="button"
          accessibilityLabel="Konumuma git"
        >
          <Ionicons name="locate-outline" size={22} color={colors.ink} />
        </Pressable>
      )}

      <View style={[s.header, { top: insets.top + 8 }]} pointerEvents="none">
        <Text style={s.title}>PicRoad</Text>
        <View style={s.chip}>
          <Text style={s.chipText}>24 saatte kaybolur</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  muted: { color: colors.muted, fontSize: 16, textAlign: 'center' },
  header: { position: 'absolute', left: 20, gap: 8 },
  title: { fontSize: 32, fontWeight: '800', color: colors.ink },
  chip: { alignSelf: 'flex-start', backgroundColor: '#fff', borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8 },
  chipText: { color: colors.ink, fontWeight: '600' },
  locationButton: { position: 'absolute', right: 18, width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 5 },
});
