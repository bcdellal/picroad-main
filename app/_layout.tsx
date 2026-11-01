import { useEffect, useState } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { supabase } from '../src/lib/supabase';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const segments = useSegments();

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        if (!supabase) {
          if (mounted) setHasSession(false);
          return;
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (mounted) setHasSession(Boolean(data.session));
      } catch (error) {
        console.warn('PicRoad auth check failed:', error);
        if (mounted) setHasSession(false);
      } finally {
        if (mounted) setReady(true);
      }
    }

    void checkAuth();

    if (!supabase) {
      setReady(true);
      return () => {
        mounted = false;
      };
    }

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setHasSession(Boolean(session));
        setReady(true);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Keep the navigator mounted from the first render. Redirect only after
  // Expo Router has initialized its route state and the auth check completed.
  useEffect(() => {
    if (!ready) return;

    const inAuth = segments[0] === 'auth';
    if (!hasSession && !inAuth) {
      router.replace('/auth');
    } else if (hasSession && inAuth) {
      router.replace('/');
    }
  }, [ready, hasSession, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="moment/[id]" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
