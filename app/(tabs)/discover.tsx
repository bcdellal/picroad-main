import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadows } from '../../src/theme';
import { useApp } from '../../src/store/useApp';

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const moments = useApp((s) => s.moments);
  return <ScrollView style={s.root} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 18, paddingBottom: 120 }}>
    <Text style={s.eyebrow}>DISCOVER</Text>
    <Text style={s.title}>Çevrendeki izler</Text>
    <Text style={s.sub}>Yürüyüşlerin bıraktığı küçük anları keşfet.</Text>
    <View style={s.hero}><Text style={s.heroTitle}>{moments.length ? 'Şu anda yaşayan anlar var.' : 'Yeni anlar yakında burada.'}</Text><Text style={s.heroText}>{moments.length ? 'Haritadaki momentlere dokunarak keşfetmeye başla.' : 'Yürümeye devam et ve ilk izini bırak.'}</Text></View>
  </ScrollView>;
}
const s=StyleSheet.create({
 root:{flex:1,backgroundColor:colors.bg},eyebrow:{fontSize:10,fontWeight:'800',letterSpacing:1.8,color:colors.primary,marginBottom:6},title:{fontSize:34,fontWeight:'800',letterSpacing:-1.3,color:colors.ink},sub:{marginTop:5,color:colors.muted,fontSize:15,lineHeight:21},hero:{marginTop:24,padding:22,borderRadius:radius.xl,backgroundColor:colors.glass,borderWidth:1,borderColor:colors.glassBorder,...shadows.glass},heroTitle:{fontSize:20,fontWeight:'800',color:colors.ink},heroText:{marginTop:7,fontSize:14,lineHeight:21,color:colors.muted}
});