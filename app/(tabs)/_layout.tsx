import { useEffect } from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../src/theme';
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
            height: 82,
            paddingTop: 7,
            paddingBottom: 14,
            backgroundColor: colors.glassStrong,
            borderTopWidth: 1,
            borderTopColor: colors.glassBorder,
            ...shadows.soft,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '700',
          },
        }}
      >
        <Tabs.Screen name="index" options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <Ionicons name="map-outline" size={22} color={color} />,
        }} />
        <Tabs.Screen name="discover" options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => <Ionicons name="compass-outline" size={22} color={color} />,
        }} />
        <Tabs.Screen name="create" options={{
          title: '',
          tabBarButton: () => <DropPhotoButton />,
        }} />
        <Tabs.Screen name="trail" options={{
          title: 'My trail',
          tabBarIcon: ({ color }) => <Ionicons name="git-branch-outline" size={22} color={color} />,
        }} />
        <Tabs.Screen name="profile" options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={22} color={color} />,
        }} />
      </Tabs>
    </View>
  );
}
