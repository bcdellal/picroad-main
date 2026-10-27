import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';
import { hoursLeft } from '../lib/time';
import type { Moment } from '../store/useApp';

export function PhotoBubble({ moment }: { moment: Moment }) {
  return (
    <View style={s.wrap}>
      <View style={s.frame}>
        <Image source={{ uri: moment.uri }} style={s.img} />
        <View style={s.badge}>
          <Text style={s.badgeText}>{hoursLeft(moment.createdAt)}h</Text>
        </View>
      </View>
      <View style={s.name}>
        <Text style={s.nameText}>{moment.author}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: 'center' },
  frame: { borderRadius: radius.md, borderWidth: 3, borderColor: '#fff', backgroundColor: '#fff', elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  img: { width: 56, height: 56, borderRadius: radius.sm },
  badge: { position: 'absolute', top: -8, right: -8, backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  name: { marginTop: 4, backgroundColor: '#fff', borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  nameText: { color: colors.ink, fontSize: 12, fontWeight: '600' },
});
