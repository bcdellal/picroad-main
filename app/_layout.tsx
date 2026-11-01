import { useEffect, useState } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { supabase } from '../src/lib/supabase';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const segments = useSegments();

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      if (!supabase) {
        if (mounted) router.replace('/auth');
        if (mounted) setReady(true);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (mounted && !data.session) router.replace('/auth');
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
    if (!ready) return;
    const inAuth = segments[0] === 'auth';
    if (!supabase && !inAuth) router.replace('/auth');
  }, [ready, segments]);

  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth" />
      <Stack.Screen name="moment/[id]" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
