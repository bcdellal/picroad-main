import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, radius, shadows } from '../theme';
import { useApp } from '../store/useApp';

export function DropPhotoButton() {
  const me = useApp((s) => s.me);
  const addMoment = useApp((s) => s.addMoment);

  async function onPress() {
    if (!me) {
      Alert.alert('Konum bekleniyor', 'Konumun bulununca fotoğraf bırakabilirsin.');
      return;
    }
    try {
      const p = await ImagePicker.requestCameraPermissionsAsync();
      if (!p.granted) {
        Alert.alert('Kamera izni gerekli', p.canAskAgain ? 'Fotoğraf bırakmak için kamera iznine ihtiyacımız var.' : 'Ayarlardan PicRoad için kamerayı açabilirsin.');
        return;
      }
      const r = await ImagePicker.launchCameraAsync({ quality: 0.6, exif: false, allowsEditing: false });
      if (!r.canceled && r.assets[0]?.uri) void addMoment(r.assets[0].uri);
    } catch {
      Alert.alert('Fotoğraf açılamadı', 'Kamerayı açarken bir sorun oluştu. Lütfen tekrar dene.');
    }
  }

  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Fotoğraf bırak" onPress={onPress}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}>
      <View style={styles.icon}><Ionicons name="camera" size={20} color="#FFFFFF" /></View>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>MOMENT</Text>
        <Text style={styles.text}>İz bırak</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    width: 112,
    height: 54,
    marginTop: -3,
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 19,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.glassBorder,
    ...shadows.glass,
  },
  icon: {
    width: 34, height: 34, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.17)',
  },
  copy: { marginLeft: 7, flex: 1 },
  eyebrow: { color: 'rgba(255,255,255,0.65)', fontSize: 7, fontWeight: '800', letterSpacing: 1.1 },
  text: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', marginTop: 2 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.96 }] },
});