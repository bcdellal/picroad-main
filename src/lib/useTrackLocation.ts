import { useEffect } from 'react';
import * as Location from 'expo-location';
import { Linking } from 'react-native';
import { distanceKm } from './geo';
import { useApp } from '../store/useApp';

const MAX_ACCURACY_METERS = 35;
const MAX_SPEED_MPS = 7.5;
const MIN_UPDATE_DISTANCE_METERS = 4;

type AcceptedFix = {
  latitude: number;
  longitude: number;
  timestamp: number;
};

export function useTrackLocation() {
  const updateMe = useApp((s) => s.updateMe);
  const setLocationStatus = useApp((s) => s.setLocationStatus);

  useEffect(() => {
    let subscription: Location.LocationSubscription | undefined;
    let cancelled = false;
    let previous: AcceptedFix | null = null;

    async function start() {
      try {
        setLocationStatus('loading');

        const permission = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;

        if (!permission.granted) {
          setLocationStatus('denied');
          if (!permission.canAskAgain) await Linking.openSettings();
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
            accuracy: Location.Accuracy.BestForNavigation,
            distanceInterval: MIN_UPDATE_DISTANCE_METERS,
            timeInterval: 3000,
            mayShowUserSettingsDialog: true,
          },
          (position) => {
            if (cancelled) return;

            const { latitude, longitude, accuracy, speed } = position.coords;
            if (
              !Number.isFinite(latitude) ||
              !Number.isFinite(longitude) ||
              (accuracy != null && accuracy > MAX_ACCURACY_METERS)
            ) return;

            const current: AcceptedFix = {
              latitude,
              longitude,
              timestamp: position.timestamp,
            };

            if (previous) {
              const elapsedSeconds = (current.timestamp - previous.timestamp) / 1000;
              if (elapsedSeconds <= 0) return;

              const movedMeters = distanceKm(previous, current) * 1000;
              if (movedMeters < MIN_UPDATE_DISTANCE_METERS) return;

              // Use the distance-derived speed as well as the device estimate.
              // A reported speed of zero must not let a GPS teleport through.
              const calculatedSpeed = movedMeters / elapsedSeconds;
              const reportedSpeed = speed != null && speed > 0 ? speed : 0;
              if (Math.max(calculatedSpeed, reportedSpeed) > MAX_SPEED_MPS) return;
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
