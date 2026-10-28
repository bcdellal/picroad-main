import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius } from '../theme';
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
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Kamera izni gerekli',
          permission.canAskAgain
            ? 'Fotoğraf bırakmak için kamera iznine ihtiyacımız var.'
            : 'Kamera izni kapalı. Ayarlardan PicRoad için kamerayı açabilirsin.',
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.6,
        exif: false,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        addMoment(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Fotoğraf açılamadı', 'Kamerayı açarken bir sorun oluştu. Lütfen tekrar dene.');
    }
  }

  return (
    <View pointerEvents="box-none" style={[s.wrap, { bottom: insets.bottom + 10 }]}>
      <Pressable
        onPress={onPress}
        style={s.btn}
        accessibilityRole="button"
        accessibilityLabel="Fotoğraf bırak"
      >
        <Ionicons name="camera-outline" size={22} color="#fff" />
        <Text style={s.text}>Fotoğraf bırak</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    height: 56,
    borderRadius: radius.pill,
    elevation: 6,
  },
  text: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
