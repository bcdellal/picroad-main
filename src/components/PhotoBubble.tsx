import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadows } from '../theme';
import { hoursLeft } from '../lib/time';
import type { Moment } from '../store/useApp';

export function PhotoBubble({ moment }: { moment: Moment }) {
  return (
    <View style={s.wrap}>
      <View style={s.frame}>
        <Image source={{ uri: moment.uri }} style={s.img} />
        <View style={s.badge}><Text style={s.badgeText}>{hoursLeft(moment.createdAt)}h</Text></View>
      </View>
      <View style={s.name}><Text style={s.nameText}>{moment.author}</Text></View>
    </View>
  );
}
const s=StyleSheet.create({
  wrap:{alignItems:'center'},
  frame:{borderRadius:radius.md,borderWidth:3,borderColor:'#fff',backgroundColor:'#fff',...shadows.soft},
  img:{width:58,height:58,borderRadius:radius.sm},
  badge:{position:'absolute',top:-7,right:-7,backgroundColor:colors.primary,borderRadius:radius.pill,paddingHorizontal:6,paddingVertical:3},
  badgeText:{color:'#fff',fontSize:10,fontWeight:'800'},
  name:{marginTop:4,backgroundColor:'rgba(255,255,255,.9)',borderRadius:radius.pill,paddingHorizontal:8,paddingVertical:3},
  nameText:{color:colors.ink,fontSize:10,fontWeight:'700'},
});