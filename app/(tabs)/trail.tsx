import { useEffect,useState } from 'react';
import { ScrollView,StyleSheet,Text,View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors,radius,shadows } from '../../src/theme';
import { useApp } from '../../src/store/useApp';
import { routeKm } from '../../src/lib/geo';
import { isExpired } from '../../src/lib/time';

export default function TrailScreen(){
 const insets=useSafeAreaInsets();const {route,moments}=useApp();const[now,setNow]=useState(Date.now());const mine=moments.filter(m=>m.mine&&!isExpired(m.createdAt,now));
 useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),60000);return()=>clearInterval(t)},[]);
 return <ScrollView style={s.root} contentContainerStyle={{padding:20,paddingTop:insets.top+18,paddingBottom:140}}>
  <Text style={s.eyebrow}>BUGÜN</Text><Text style={s.title}>Günün rotası</Text><Text style={s.sub}>Yürüyüşünün izi, tek bakışta.</Text>
  <View style={s.hero}><View style={s.heroTop}><View><Text style={s.heroLabel}>TOPLAM MESAFE</Text><Text style={s.heroValue}>{routeKm(route).toFixed(1)}<Text style={s.heroUnit}> km</Text></Text></View><View style={s.heroIcon}><Text style={s.routeGlyph}>⌁</Text></View></View><View style={s.heroLine}/><Text style={s.heroFoot}>{route.length} konum noktası kaydedildi</Text></View>
  <View style={s.stats}><Stat value={String(mine.length)} label="fotoğraf" icon="◌"/><View style={s.statDivider}/><Stat value={String(route.length)} label="iz noktası" icon="·"/></View>
  <Text style={s.section}>Bugünkü anlar</Text>{mine.length===0?<View style={s.empty}><Text style={s.emptyTitle}>Henüz bir an bırakmadın.</Text><Text style={s.emptyText}>Haritadan fotoğraf bırakıp yürüyüşünü kaydetmeye başla.</Text></View>:mine.map(m=><View key={m.id} style={s.row}><View style={s.timePill}><Text style={s.time}>{new Date(m.createdAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</Text></View><View style={s.rowBody}><Text style={s.rowText}>{m.caption||'Fotoğraf bıraktın'}</Text><Text style={s.rowMeta}>24 saatlik an</Text></View></View>)}
 </ScrollView>
}
function Stat({value,label,icon}:{value:string;label:string;icon:string}){return <View style={s.stat}><View style={s.statIcon}><Text style={s.statGlyph}>{icon}</Text></View><View><Text style={s.statValue}>{value}</Text><Text style={s.statLabel}>{label}</Text></View></View>}
const s=StyleSheet.create({
 root:{flex:1,backgroundColor:colors.bg},eyebrow:{fontSize:10,fontWeight:'800',letterSpacing:1.7,color:colors.primary,marginBottom:6},title:{fontSize:32,fontWeight:'800',letterSpacing:-1.1,color:colors.ink},sub:{marginTop:5,color:colors.muted,fontSize:15},
 hero:{marginTop:22,padding:22,borderRadius:radius.xl,backgroundColor:colors.glass,borderWidth:1,borderColor:colors.glassBorder,...shadows.glass},heroTop:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},heroLabel:{fontSize:10,fontWeight:'800',letterSpacing:1.3,color:colors.muted},
 heroValue:{marginTop:5,fontSize:48,lineHeight:54,fontWeight:'800',letterSpacing:-2,color:colors.ink},heroUnit:{fontSize:18,fontWeight:'700',color:colors.muted},heroIcon:{width:52,height:52,borderRadius:19,backgroundColor:colors.primarySoft,alignItems:'center',justifyContent:'center'},routeGlyph:{fontSize:30,color:colors.primary},heroLine:{height:1,backgroundColor:colors.line,marginVertical:15},heroFoot:{fontSize:12,color:colors.muted,fontWeight:'600'},
 stats:{flexDirection:'row',alignItems:'center',marginTop:12,padding:17,borderRadius:radius.lg,backgroundColor:colors.glassStrong,borderWidth:1,borderColor:colors.glassBorder,...shadows.soft},stat:{flex:1,flexDirection:'row',alignItems:'center',gap:11},statIcon:{width:36,height:36,borderRadius:13,backgroundColor:colors.primarySoft,alignItems:'center',justifyContent:'center'},statGlyph:{color:colors.primary,fontSize:19,fontWeight:'700'},statDivider:{width:1,height:30,backgroundColor:colors.line,marginHorizontal:8},statValue:{fontSize:20,fontWeight:'800',color:colors.ink},statLabel:{marginTop:1,color:colors.muted,fontSize:12},
 section:{marginTop:30,marginBottom:12,fontSize:19,fontWeight:'700',color:colors.ink},empty:{padding:20,borderRadius:radius.lg,backgroundColor:colors.glass,borderWidth:1,borderColor:colors.glassBorder},emptyTitle:{fontSize:15,fontWeight:'700',color:colors.ink},emptyText:{marginTop:5,color:colors.muted,fontSize:13,lineHeight:19},
 row:{flexDirection:'row',alignItems:'center',gap:12,marginBottom:10,padding:13,borderRadius:19,backgroundColor:colors.glassStrong,borderWidth:1,borderColor:colors.glassBorder},timePill:{minWidth:55,height:34,borderRadius:12,backgroundColor:colors.primarySoft,alignItems:'center',justifyContent:'center'},time:{color:colors.primary,fontSize:11,fontWeight:'800'},rowBody:{flex:1},rowText:{color:colors.ink,fontSize:14,fontWeight:'600'},rowMeta:{marginTop:3,color:colors.muted,fontSize:11}
});