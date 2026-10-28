import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadows } from '../../src/theme';
import { useApp } from '../../src/store/useApp';
import { PhotoBubble } from '../../src/components/PhotoBubble';

export default function MapScreen() {
 const router=useRouter(); const insets=useSafeAreaInsets(); const mapRef=useRef<MapView>(null);
 const {me,route,moments,locationStatus}=useApp();
 useEffect(()=>{if(!me||!mapRef.current||route.length>1)return;mapRef.current.animateToRegion({...me,latitudeDelta:.01,longitudeDelta:.01},500)},[me,route.length]);
 const centerOnMe=()=>{if(me&&mapRef.current)mapRef.current.animateToRegion({...me,latitudeDelta:.01,longitudeDelta:.01},400)};
 return <View style={s.root}>{me?<MapView ref={mapRef} style={StyleSheet.absoluteFill} showsUserLocation showsMyLocationButton={false} initialRegion={{...me,latitudeDelta:.01,longitudeDelta:.01}}>
  <Polyline coordinates={route} strokeColor={colors.route} strokeWidth={5}/>{moments.map(m=><Marker key={m.id} coordinate={{latitude:m.latitude,longitude:m.longitude}} onPress={()=>router.push(`/moment/${m.id}`)}><PhotoBubble moment={m}/></Marker>)}
 </MapView>:<View style={s.center}><View style={s.emptyGlass}><View style={s.emptyIcon}><Ionicons name="navigate-outline" size={22} color={colors.primary}/></View><Text style={s.emptyTitle}>Konumun bulunuyor</Text><Text style={s.muted}>{locationStatus==='denied'?'Haritayı kullanmak için konum izni gerekli.':locationStatus==='error'?'Konum alınamadı. Lütfen tekrar dene.':'Birazdan yürüyüşünü haritada göreceksin.'}</Text></View></View>}
 {me&&<Pressable onPress={centerOnMe} style={({pressed})=>[s.locationButton,{top:insets.top+92},pressed&&s.pressed]}><Ionicons name="locate-outline" size={22} color={colors.ink}/></Pressable>}
 <View style={[s.header,{top:insets.top+10}]} pointerEvents="none"><View style={s.brandGlass}><Text style={s.title}>PicRoad</Text><View style={s.divider}/><Text style={s.chipText}>24 saatte kaybolur</Text></View></View>
 </View>;
}
const s=StyleSheet.create({
 root:{flex:1,backgroundColor:colors.bg},center:{flex:1,alignItems:'center',justifyContent:'center',padding:24,backgroundColor:colors.bg},
 emptyGlass:{width:'100%',maxWidth:340,padding:24,borderRadius:radius.xl,backgroundColor:colors.glass,borderWidth:1,borderColor:colors.glassBorder,alignItems:'center',...shadows.glass},
 emptyIcon:{width:48,height:48,borderRadius:17,backgroundColor:colors.primarySoft,alignItems:'center',justifyContent:'center',marginBottom:14},emptyTitle:{fontSize:18,fontWeight:'700',color:colors.ink,marginBottom:6},muted:{color:colors.muted,fontSize:14,lineHeight:20,textAlign:'center'},
 header:{position:'absolute',left:18},brandGlass:{minWidth:190,paddingHorizontal:16,paddingVertical:12,borderRadius:22,backgroundColor:colors.glass,borderWidth:1,borderColor:colors.glassBorder,...shadows.soft},
 title:{fontSize:24,fontWeight:'800',letterSpacing:-.7,color:colors.ink},divider:{width:28,height:2,borderRadius:1,backgroundColor:colors.primary,marginTop:7,marginBottom:5},chipText:{color:colors.muted,fontSize:12,fontWeight:'600'},
 locationButton:{position:'absolute',right:18,width:50,height:50,borderRadius:18,backgroundColor:colors.glassStrong,borderWidth:1,borderColor:colors.glassBorder,alignItems:'center',justifyContent:'center',...shadows.soft},pressed:{opacity:.75,transform:[{scale:.96}]}
});