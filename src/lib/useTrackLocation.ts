import { useEffect } from 'react';
import * as Location from 'expo-location';
import { Linking } from 'react-native';
import { distanceKm } from './geo';
import { useApp } from '../store/useApp';

const MAX_ACCURACY_METERS = 50;
const MAX_SPEED_MPS = 6;
const MIN_UPDATE_DISTANCE_METERS = 8;

export function useTrackLocation() {
  const updateMe = useApp((s) => s.updateMe);
  const setLocationStatus = useApp((s) => s.setLocationStatus);

  useEffect(() => {
    let subscription: Location.LocationSubscription | undefined;
    let cancelled = false;
    let previous: { latitude: number; longitude: number; timestamp: number } | null = null;

    async function start() {
      try {
        setLocationStatus('loading');

        const permission = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;

        if (!permission.granted) {
          setLocationStatus('denied');
          if (!permission.canAskAgain) {
            await Linking.openSettings();
          }
          return;
        }

        const lastKnown = await Location.getLastKnownPositionAsync({
          maxAge: 30_000,
          requiredAccuracy: MAX_ACCURACY_METERS,
        });

        if (!cancelled && lastKnown) {
          previous = {
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
            timestamp: lastKnown.timestamp,
          };
          updateMe({
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
          });
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: MIN_UPDATE_DISTANCE_METERS,
            timeInterval: 5000,
            mayShowUserSettingsDialog: true,
          },
          (position) => {
            const { latitude, longitude, accuracy, speed } = position.coords;
            if (cancelled || (accuracy != null && accuracy > MAX_ACCURACY_METERS)) return;

            const current = {
              latitude,
              longitude,
              timestamp: position.timestamp,
            };

            if (previous) {
              const movedKm = distanceKm(previous, current);
              const elapsedSeconds = Math.max(1, (current.timestamp - previous.timestamp) / 1000);
              const calculatedSpeed = (movedKm * 1000) / elapsedSeconds;
              const reportedSpeed = speed != null && speed >= 0 ? speed : calculatedSpeed;

              if (movedKm * 1000 < MIN_UPDATE_DISTANCE_METERS) return;
              if (reportedSpeed > MAX_SPEED_MPS) return;
            }

            previous = current;
            updateMe({ latitude, longitude });
          },
          () => {
            if (!cancelled) setLocationStatus('error');
          },
        );
      } catch {
        if (!cancelled) setLocationStatus('error');
      }
    }

    void start();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [setLocationStatus, updateMe]);
}
