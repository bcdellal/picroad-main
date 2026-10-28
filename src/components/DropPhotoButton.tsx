import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadows } from '../theme';
import { useApp } from '../store/useApp';

export function DropPhotoButton() {
  const insets = useSafeAreaInsets();
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
        Alert.alert(
          'Kamera izni gerekli',
          p.canAskAgain
            ? 'Fotoğraf bırakmak için kamera iznine ihtiyacımız var.'
            : 'Kamera izni kapalı. Ayarlardan PicRoad için kamerayı açabilirsin.',
        );
        return;
      }

      const r = await ImagePicker.launchCameraAsync({
        quality: 0.6,
        exif: false,
        allowsEditing: false,
      });

      if (!r.canceled && r.assets[0]?.uri) {
        void addMoment(r.assets[0].uri);
      }
    } catch {
      Alert.alert('Fotoğraf açılamadı', 'Kamerayı açarken bir sorun oluştu. Lütfen tekrar dene.');
    }
  }

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { bottom: insets.bottom + 6 }]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fotoğraf bırak"
        onPress={onPress}
        style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
      >
        <View style={styles.icon}>
          <Ionicons name="camera" size={21} color="#FFFFFF" />
        </View>

        <View style={styles.copy}>
          <Text style={styles.eyebrow}>MOMENT</Text>
          <Text style={styles.text}>Fotoğraf bırak</Text>
        </View>

        <View style={styles.arrow}>
          <Ionicons name="arrow-up" size={15} color={colors.primary} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  btn: {
    width: 178,
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.glassBorder,
    ...shadows.glass,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  copy: {
    flex: 1,
    marginLeft: 10,
  },
  eyebrow: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.3,
    marginBottom: 2,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  arrow: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
});
