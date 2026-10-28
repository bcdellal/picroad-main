import { useEffect,useState } from 'react';
import { ScrollView,StyleSheet,Text,View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors,radius,shadows,type } from '../../src/theme';
import { useApp } from '../../src/store/useApp';
import { routeKm } from '../../src/lib/geo';
import { isExpired } from '../../src/lib/time';

export default function TrailScreen(){
 const insets=useSafeAreaInsets();const {route,moments}=useApp();const[now,setNow]=useState(Date.now());const mine=moments.filter(m=>m.mine&&!isExpired(m.createdAt,now));
 useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),60000);return()=>clearInterval(t)},[]);
 return <ScrollView style={s.root} contentContainerStyle={{padding:20,paddingTop:insets.top+18,paddingBottom:120}}>
  <Text style={s.eyebrow}>YOUR JOURNEY</Text><Text style={s.title}>Bugünün izi</Text><Text style={s.sub}>Yürüdükçe haritada bir hikâye bırakıyorsun.</Text>
  <View style={s.hero}><Text style={s.heroLabel}>TOPLAM MESAFE</Text><Text style={s.heroValue}>{routeKm(route).toFixed(1)}<Text style={s.heroUnit}> km</Text></Text><View style={s.heroLine}/><Text style={s.heroFoot}>{route.length} konum noktası · bugün</Text></View>
  <View style={s.stats}><Stat value={String(mine.length)} label="moment" icon="camera-outline"/><View style={s.statDivider}/><Stat value={String(route.length)} label="iz noktası" icon="footsteps-outline"/></View>
  <Text style={s.section}>Bugünkü anlar</Text>{mine.length===0?<View style={s.empty}><Text style={s.emptyTitle}>Henüz bir iz bırakmadın.</Text><Text style={s.emptyText}>Ortadaki kamera butonuna dokun ve yürüyüşünden bir moment bırak.</Text></View>:mine.map(m=><View key={m.id} style={s.row}><View style={s.timePill}><Text style={s.time}>{new Date(m.createdAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</Text></View><View style={s.rowBody}><Text style={s.rowText}>{m.caption||'Bir moment bıraktın'}</Text><Text style={s.rowMeta}>24 saatlik an</Text></View></View>)}
 </ScrollView>
}
function Stat({value,label,icon}:{value:string;label:string;icon:any}){return <View style={s.stat}><View style={s.statIcon}><Ion name={icon}/></View><View><Text style={s.statValue}>{value}</Text><Text style={s.statLabel}>{label}</Text></View></View>}
function Ion({name}:{name:any}){const{Ionicons}=require('@expo/vector-icons');return <Ionicons name={name} size={17} color={colors.primary}/>}
const s=StyleSheet.create({
 root:{flex:1,backgroundColor:colors.bg},eyebrow:{fontSize:type.micro,fontWeight:'800',letterSpacing:1.8,color:colors.primary,marginBottom:6},title:{fontSize:type.display,fontWeight:'800',letterSpacing:-1.3,color:colors.ink},sub:{marginTop:5,color:colors.muted,fontSize:type.body,lineHeight:21},
 hero:{marginTop:22,padding:23,borderRadius:radius.xl,backgroundColor:colors.glass,borderWidth:1,borderColor:colors.glassBorder,...shadows.glass},heroLabel:{fontSize:9,fontWeight:'800',letterSpacing:1.5,color:colors.muted},heroValue:{marginTop:4,fontSize:52,lineHeight:57,fontWeight:'800',letterSpacing:-2.2,color:colors.ink},heroUnit:{fontSize:18,fontWeight:'700',color:colors.muted},heroLine:{height:1,backgroundColor:colors.line,marginVertical:15},heroFoot:{fontSize:12,color:colors.muted,fontWeight:'600'},
 stats:{flexDirection:'row',alignItems:'center',marginTop:12,padding:17,borderRadius:radius.lg,backgroundColor:colors.glassStrong,borderWidth:1,borderColor:colors.glassBorder,...shadows.soft},stat:{flex:1,flexDirection:'row',alignItems:'center',gap:10},statIcon:{width:36,height:36,borderRadius:13,backgroundColor:colors.primarySoft,alignItems:'center',justifyContent:'center'},statDivider:{width:1,height:30,backgroundColor:colors.line,marginHorizontal:8},statValue:{fontSize:20,fontWeight:'800',color:colors.ink},statLabel:{marginTop:1,color:colors.muted,fontSize:11},section:{marginTop:30,marginBottom:12,fontSize:19,fontWeight:'750',color:colors.ink},
 empty:{padding:20,borderRadius:radius.lg,backgroundColor:colors.glass,borderWidth:1,borderColor:colors.glassBorder},emptyTitle:{fontSize:15,fontWeight:'700',color:colors.ink},emptyText:{marginTop:5,color:colors.muted,fontSize:13,lineHeight:19},
 row:{flexDirection:'row',alignItems:'center',gap:12,marginBottom:10,padding:13,borderRadius:19,backgroundColor:colors.glassStrong,borderWidth:1,borderColor:colors.glassBorder},timePill:{minWidth:55,height:34,borderRadius:12,backgroundColor:colors.primarySoft,alignItems:'center',justifyContent:'center'},time:{color:colors.primary,fontSize:11,fontWeight:'800'},rowBody:{flex:1},rowText:{color:colors.ink,fontSize:14,fontWeight:'600'},rowMeta:{marginTop:3,color:colors.muted,fontSize:11}
});