import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
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
  return <View style={s.root}>
    {me?<MapView ref={mapRef} style={StyleSheet.absoluteFill} showsUserLocation showsMyLocationButton={false} initialRegion={{...me,latitudeDelta:.01,longitudeDelta:.01}}>
      <Polyline coordinates={route} strokeColor={colors.route} strokeWidth={5}/>
      {moments.map(m=><Marker key={m.id} coordinate={{latitude:m.latitude,longitude:m.longitude}} onPress={()=>router.push('/moment/'+m.id)}><PhotoBubble moment={m}/></Marker>)}
    </MapView>:<View style={s.center}><View style={s.emptyGlass}><View style={s.emptyIcon}><Ionicons name="navigate-outline" size={22} color={colors.primary}/></View><Text style={s.emptyTitle}>Konumun bulunuyor</Text><Text style={s.muted}>{locationStatus==='denied'?'Haritayı kullanmak için konum izni gerekli.':locationStatus==='error'?'Konum alınamadı. Lütfen tekrar dene.':'Birazdan yürüyüşünü haritada göreceksin.'}</Text></View></View>}
    {me&&<Pressable onPress={centerOnMe} style={({pressed})=>[s.locationButton,{top:insets.top+88},pressed&&s.pressed]}><Ionicons name="locate-outline" size={21} color={colors.ink}/></Pressable>}
    <View style={[s.header,{top:insets.top+10}]}>
      <View style={s.brandGlass}><Text style={s.title}>PicRoad</Text><Text style={s.sub}>EXPLORE · CONNECT · LEAVE A TRACE</Text></View>
    </View>
    {me&&<View style={[s.nearby,{bottom:insets.bottom+94}]}>
      <View style={s.nearbyDot}/><View style={s.nearbyCopy}><Text style={s.nearbyEyebrow}>NEARBY MOMENTS</Text><Text style={s.nearbyText}>{moments.length ? `${moments.length} canlı an keşfet` : 'Çevrende henüz bir an yok'}</Text></View>
      <Ionicons name="chevron-forward" size={17} color={colors.muted}/>
    </View>}
  </View>;
}
const s=StyleSheet.create({
 root:{flex:1,backgroundColor:colors.bg},center:{flex:1,alignItems:'center',justifyContent:'center',padding:24,backgroundColor:colors.bg},
 emptyGlass:{width:'100%',maxWidth:340,padding:24,borderRadius:radius.xl,backgroundColor:colors.glass,borderWidth:1,borderColor:colors.glassBorder,alignItems:'center',...shadows.glass},
 emptyIcon:{width:48,height:48,borderRadius:17,backgroundColor:colors.primarySoft,alignItems:'center',justifyContent:'center',marginBottom:14},emptyTitle:{fontSize:18,fontWeight:'700',color:colors.ink,marginBottom:6},muted:{color:colors.muted,fontSize:14,lineHeight:20,textAlign:'center'},
 header:{position:'absolute',left:18},brandGlass:{paddingHorizontal:16,paddingVertical:11,borderRadius:21,backgroundColor:colors.glass,borderWidth:1,borderColor:colors.glassBorder,...shadows.soft},title:{fontSize:23,fontWeight:'800',letterSpacing:-.8,color:colors.ink},sub:{marginTop:4,fontSize:8,fontWeight:'800',letterSpacing:1.15,color:colors.muted},
 locationButton:{position:'absolute',right:18,width:48,height:48,borderRadius:17,backgroundColor:colors.glassStrong,borderWidth:1,borderColor:colors.glassBorder,alignItems:'center',justifyContent:'center',...shadows.soft},pressed:{opacity:.78,transform:[{scale:.96}]},
 nearby:{position:'absolute',left:18,right:18,height:58,borderRadius:20,backgroundColor:colors.glassStrong,borderWidth:1,borderColor:colors.glassBorder,flexDirection:'row',alignItems:'center',paddingHorizontal:13,...shadows.glass},nearbyDot:{width:9,height:9,borderRadius:5,backgroundColor:colors.primary,marginRight:10},nearbyCopy:{flex:1},nearbyEyebrow:{fontSize:8,fontWeight:'800',letterSpacing:1.2,color:colors.primary},nearbyText:{marginTop:2,fontSize:13,fontWeight:'700',color:colors.ink}
});