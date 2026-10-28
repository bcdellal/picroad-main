import { useEffect, useState } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../src/lib/supabase';

const LOCAL_AUTH_KEY = 'picroad-local-auth-v1';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const segments = useSegments();

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        if (mounted && !data.session) router.replace('/auth');
        if (mounted) setReady(true);
        return;
      }

      const localAccount = await AsyncStorage.getItem(LOCAL_AUTH_KEY);
      if (mounted && !localAccount) router.replace('/auth');
      if (mounted) setReady(true);
    }

    void checkAuth();

    if (!supabase) return () => { mounted = false; };

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/auth');
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!ready || supabase) return;

    AsyncStorage.getItem(LOCAL_AUTH_KEY).then((account) => {
      const inAuth = segments[0] === 'auth';
      if (!account && !inAuth) router.replace('/auth');
      if (account && inAuth) router.replace('/(tabs)');
    });
  }, [ready, segments]);

  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth" />
      <Stack.Screen name="moment/[id]" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
