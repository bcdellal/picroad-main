import { useEffect } from 'react';
import * as Location from 'expo-location';
import { useApp } from '../store/useApp';

// Uygulama açıkken konumu izler ve rotaya ekler.
// Uygulama kapalıyken takip için sonra expo-task-manager + development build gerekecek.
export function useTrackLocation() {
  const updateMe = useApp((s) => s.updateMe);

  useEffect(() => {
    let sub: Location.LocationSubscription | undefined;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 15 },
        (p) => updateMe({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
      );
    })();
    return () => sub?.remove();
  }, [updateMe]);
}
