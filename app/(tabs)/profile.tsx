import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadows } from '../../src/theme';
import { useApp } from '../../src/store/useApp';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { route, moments } = useApp();
  return <ScrollView style={s.root} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 18, paddingBottom: 120 }}>
    <Text style={s.eyebrow}>YOUR PROFILE</Text>
    <View style={s.head}><View style={s.avatar}><Text style={s.avatarText}>P</Text></View><View><Text style={s.name}>PicRoad user</Text><Text style={s.handle}>Kendi izini bırakıyorsun.</Text></View></View>
    <View style={s.stats}><Stat value={String(moments.length)} label="moment"/><Stat value={String(route.length)} label="iz noktası"/></View>
    <View style={s.card}><Text style={s.cardTitle}>Senin yolculuğun</Text><Text style={s.cardText}>Yürüdükçe burada kendi PicRoad hikâyen oluşacak.</Text></View>
  </ScrollView>;
}
function Stat({value,label}:{value:string;label:string}){return <View style={s.stat}><Text style={s.value}>{value}</Text><Text style={s.label}>{label}</Text></View>}
const s=StyleSheet.create({
 root:{flex:1,backgroundColor:colors.bg},eyebrow:{fontSize:10,fontWeight:'800',letterSpacing:1.8,color:colors.primary,marginBottom:14},head:{flexDirection:'row',alignItems:'center',gap:14},avatar:{width:64,height:64,borderRadius:22,backgroundColor:colors.primarySoft,alignItems:'center',justifyContent:'center'},avatarText:{fontSize:24,fontWeight:'800',color:colors.primary},name:{fontSize:22,fontWeight:'800',color:colors.ink},handle:{marginTop:3,fontSize:13,color:colors.muted},stats:{flexDirection:'row',marginTop:24,padding:20,borderRadius:radius.xl,backgroundColor:colors.glassStrong,borderWidth:1,borderColor:colors.glassBorder,...shadows.soft},stat:{flex:1},value:{fontSize:27,fontWeight:'800',color:colors.ink},label:{marginTop:2,fontSize:12,color:colors.muted},card:{marginTop:12,padding:20,borderRadius:radius.xl,backgroundColor:colors.glass,borderWidth:1,borderColor:colors.glassBorder,...shadows.soft},cardTitle:{fontSize:18,fontWeight:'800',color:colors.ink},cardText:{marginTop:7,fontSize:14,lineHeight:21,color:colors.muted}
});