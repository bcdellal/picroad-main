import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { colors } from '../src/theme';

const LOCAL_AUTH_KEY = 'picroad-local-auth-v1';

type LocalAccount = { username: string; password: string };

export default function AuthScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted && data.session) router.replace('/(tabs)');
    });
    return () => { mounted = false; };
  }, []);

  async function submit() {
    const cleanUsername = username.trim().toLowerCase();

    if (!cleanUsername || cleanUsername.length < 3 || password.length < 6) {
      setError('Kullanıcı adı en az 3, şifre en az 6 karakter olmalı.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (supabase) {
        const email = cleanUsername.includes('@') ? cleanUsername : `${cleanUsername}@picroad.local`;
        const result = mode === 'login'
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({
              email,
              password,
              options: { data: { username: cleanUsername } },
            });

        if (result.error) {
          setError(result.error.message);
          return;
        }

        if (mode === 'signup' && !result.data.session) {
          setError('Hesabın oluşturuldu. E-posta doğrulaması gerekiyorsa tamamladıktan sonra giriş yap.');
          return;
        }

        router.replace('/(tabs)');
        return;
      }

      const raw = await AsyncStorage.getItem(LOCAL_AUTH_KEY);
      const account = raw ? (JSON.parse(raw) as LocalAccount) : null;

      if (mode === 'signup') {
        if (account) {
          setError('Bu cihazda zaten bir hesap var. Giriş yap.');
          return;
        }
        await AsyncStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify({
          username: cleanUsername,
          password,
        }));
        router.replace('/(tabs)');
        return;
      }

      if (!account || account.username !== cleanUsername || account.password !== password) {
        setError('Kullanıcı adı veya şifre hatalı.');
        return;
      }

      router.replace('/(tabs)');
    } catch {
      setError('Bir şeyler ters gitti. Tekrar dene.');
    } finally {
      setLoading(false);
    }
  }

  const isLogin = mode === 'login';

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={s.glowOne} />
        <View style={s.glowTwo} />
        <View style={s.glowThree} />
      </View>

      <View style={s.content}>
        <View style={s.brandMark}>
          <View style={s.brandDot} />
        </View>

        <Text style={s.title}>PicRoad</Text>
        <Text style={s.sub}>
          {isLogin ? 'Yürüyüşüne kaldığın yerden devam et.' : 'Kendi izini bırak.'}
        </Text>

        <View style={s.glassCard}>
          <View style={s.segment}>
            <Pressable
              onPress={() => { setMode('login'); setError(''); }}
              style={[s.segmentItem, isLogin && s.segmentActive]}
            >
              <Text style={[s.segmentText, isLogin && s.segmentTextActive]}>Giriş</Text>
            </Pressable>
            <Pressable
              onPress={() => { setMode('signup'); setError(''); }}
              style={[s.segmentItem, !isLogin && s.segmentActive]}
            >
              <Text style={[s.segmentText, !isLogin && s.segmentTextActive]}>Kayıt</Text>
            </Pressable>
          </View>

          <View style={s.field}>
            <Text style={s.label}>KULLANICI ADI</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              value={username}
              onChangeText={setUsername}
              placeholder="kullaniciadi"
              placeholderTextColor="rgba(27,27,47,0.35)"
              style={s.input}
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>ŞİFRE</Text>
            <TextInput
              secureTextEntry
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="rgba(27,27,47,0.35)"
              style={s.input}
            />
          </View>

          {!!error && (
            <View style={s.errorBox}>
              <Text style={s.error}>{error}</Text>
            </View>
          )}

          <Pressable
            disabled={loading}
            onPress={submit}
            style={({ pressed }) => [s.button, pressed && s.buttonPressed]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.buttonText}>{isLogin ? 'Giriş yap' : 'Hesap oluştur'}</Text>
            )}
          </Pressable>
        </View>

        <Text style={s.footer}>Walk. Discover. Leave a trace.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F3F2F8',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  glowOne: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(108,76,228,0.16)',
    top: -80,
    right: -70,
  },
  glowTwo: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(80,180,255,0.12)',
    bottom: -45,
    left: -75,
  },
  glowThree: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.75)',
    top: '25%',
    left: -35,
  },
  brandMark: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#6C4CE4',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  brandDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: 44,
    lineHeight: 48,
    fontWeight: '800',
    letterSpacing: -1.8,
    color: colors.ink,
  },
  sub: {
    marginTop: 7,
    marginBottom: 28,
    fontSize: 16,
    lineHeight: 23,
    color: colors.muted,
  },
  glassCard: {
    padding: 16,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.66)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.92)',
    shadowColor: '#1B1B2F',
    shadowOpacity: 0.08,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 7,
  },
  segment: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 18,
    backgroundColor: 'rgba(27,27,47,0.055)',
    marginBottom: 18,
  },
  segmentItem: {
    flex: 1,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#1B1B2F',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.muted,
  },
  segmentTextActive: {
    color: colors.ink,
    fontWeight: '750',
  },
  field: {
    marginBottom: 13,
  },
  label: {
    marginLeft: 5,
    marginBottom: 7,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: 'rgba(27,27,47,0.48)',
  },
  input: {
    height: 54,
    borderRadius: 17,
    paddingHorizontal: 17,
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    color: colors.ink,
    fontSize: 16,
  },
  errorBox: {
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: 'rgba(201,42,42,0.08)',
  },
  error: {
    color: '#B42318',
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    height: 55,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    shadowColor: colors.primary,
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 9 },
    elevation: 5,
  },
  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }],
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '750',
    letterSpacing: -0.2,
  },
  footer: {
    textAlign: 'center',
    marginTop: 22,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: 'rgba(27,27,47,0.38)',
  },
});
