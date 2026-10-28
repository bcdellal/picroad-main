import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { colors, radius } from '../src/theme';

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

  return (
    <View style={s.root}>
      <Text style={s.title}>PicRoad</Text>
      <Text style={s.sub}>{mode === 'login' ? 'Yürüyüşüne geri dön.' : 'Kendi izini bırak.'}</Text>

      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        value={username}
        onChangeText={setUsername}
        placeholder="Kullanıcı adı"
        style={s.input}
      />

      <TextInput
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholder="Şifre"
        style={s.input}
      />

      {!!error && <Text style={s.error}>{error}</Text>}

      <Pressable disabled={loading} onPress={submit} style={s.button}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>
          {mode === 'login' ? 'Giriş yap' : 'Kayıt ol'}
        </Text>}
      </Pressable>

      <Pressable onPress={() => {
        setMode(mode === 'login' ? 'signup' : 'login');
        setError('');
      }}>
        <Text style={s.switch}>
          {mode === 'login' ? 'Hesabın yok mu? Kayıt ol' : 'Zaten hesabın var mı? Giriş yap'}
        </Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  root:{flex:1,backgroundColor:colors.bg,padding:24,justifyContent:'center',gap:12},
  title:{fontSize:42,fontWeight:'800',color:colors.ink},
  sub:{fontSize:16,color:colors.muted,marginBottom:12},
  input:{height:54,borderRadius:radius.pill,backgroundColor:colors.card,paddingHorizontal:18,color:colors.ink},
  button:{height:54,borderRadius:radius.pill,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center',marginTop:4},
  buttonText:{color:'#fff',fontSize:17,fontWeight:'700'},
  switch:{textAlign:'center',color:colors.primary,fontWeight:'700',padding:10},
  error:{color:'#C92A2A'},
});
