import { useEffect } from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme';
import { DropPhotoButton } from '../../src/components/DropPhotoButton';
import { useTrackLocation } from '../../src/lib/useTrackLocation';
import { useApp } from '../../src/store/useApp';

export default function TabsLayout() {
  useTrackLocation();
  const pruneExpiredMoments = useApp((s) => s.pruneExpiredMoments);

  useEffect(() => {
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
          tabBarStyle: { height: 84, paddingBottom: 24, borderTopColor: colors.line },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Map', tabBarIcon: ({ color }) => <Ionicons name="map-outline" size={24} color={color} /> }} />
        <Tabs.Screen name="trail" options={{ title: 'My trail', tabBarIcon: ({ color }) => <Ionicons name="git-branch-outline" size={24} color={color} /> }} />
      </Tabs>
      <DropPhotoButton />
    </View>
  );
}
