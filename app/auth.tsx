import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { colors, radius } from '../src/theme';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    supabase?.auth.getSession().then(({ data }) => {
      if (mounted && data.session) router.replace('/(tabs)');
    });
    return () => { mounted = false; };
  }, []);

  async function submit() {
    if (!supabase) {
      setError('Supabase bağlantısı yapılandırılmamış.');
      return;
    }
    if (!email.trim() || password.length < 6) {
      setError('Geçerli bir e-posta ve en az 6 karakterlik şifre gir.');
      return;
    }

    setLoading(true);
    setError('');
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
      : await supabase.auth.signUp({ email: email.trim(), password });
    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (mode === 'signup' && !result.data.session) {
      setError('Hesabın oluşturuldu. E-postanı doğruladıktan sonra giriş yap.');
      return;
    }

    router.replace('/(tabs)');
  }

  return (
    <View style={s.root}>
      <Text style={s.title}>PicRoad</Text>
      <Text style={s.sub}>{mode === 'login' ? 'Yürüyüşüne geri dön.' : 'Kendi izini bırak.'}</Text>
      <TextInput autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="E-posta" style={s.input} />
      <TextInput secureTextEntry value={password} onChangeText={setPassword} placeholder="Şifre" style={s.input} />
      {!!error && <Text style={s.error}>{error}</Text>}
      <Pressable disabled={loading} onPress={submit} style={s.button}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>{mode === 'login' ? 'Giriş yap' : 'Kayıt ol'}</Text>}
      </Pressable>
      <Pressable onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
        <Text style={s.switch}>{mode === 'login' ? 'Hesabın yok mu? Kayıt ol' : 'Zaten hesabın var mı? Giriş yap'}</Text>
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
