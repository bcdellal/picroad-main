import { useEffect } from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadows } from '../../src/theme';
import { DropPhotoButton } from '../../src/components/DropPhotoButton';
import { useTrackLocation } from '../../src/lib/useTrackLocation';
import { useApp } from '../../src/store/useApp';

export default function TabsLayout() {
  useTrackLocation();
  const pruneExpiredMoments = useApp((s) => s.pruneExpiredMoments);
  const syncSession = useApp((s) => s.syncSession);

  useEffect(() => {
    void syncSession();
    pruneExpiredMoments();
    const timer = setInterval(pruneExpiredMoments, 60_000);
    return () => clearInterval(timer);
  }, [pruneExpiredMoments]);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: {
            height: 84,
            paddingBottom: 20,
            paddingTop: 8,
            backgroundColor: colors.glassStrong,
            borderTopWidth: 1,
            borderTopColor: colors.glassBorder,
            ...shadows.soft,
          },
          tabBarItemStyle: {
            width: '35%',
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Map',
            tabBarIcon: ({ color }) => (
              <Ionicons name="map-outline" size={23} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="trail"
          options={{
            title: 'My trail',
            tabBarIcon: ({ color }) => (
              <Ionicons name="git-branch-outline" size={23} color={color} />
            ),
          }}
        />
      </Tabs>

      <DropPhotoButton />
    </View>
  );
}
