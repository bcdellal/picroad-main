import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadows } from '../../src/theme';
import { supabase } from '../../src/lib/supabase';

type Msg = { id:string; sender_id:string; recipient_id:string; body:string; created_at:string };
type Person = { id:string; username:string; display_name:string|null };
export default function MessagesScreen(){
 const router=useRouter(),insets=useSafeAreaInsets();
 const [rows,setRows]=useState<Array<{person:Person;message:Msg}>>([]);
 const [loading,setLoading]=useState(true),[error,setError]=useState('');
 const load=useCallback(async()=>{
  if(!supabase){setError('Supabase bağlantısı yok.');setLoading(false);return;}
  try{
   const {data:session}=await supabase.auth.getSession(),uid=session.session?.user.id;
   if(!uid)throw new Error('Oturum bulunamadı.');
   const {data:messages,error:me}=await supabase.from('messages').select('id,sender_id,recipient_id,body,created_at').or('sender_id.eq.'+uid+',recipient_id.eq.'+uid).order('created_at',{ascending:false}).limit(100);
   if(me)throw me;
   const list=(messages??[]) as Msg[],ids=[...new Set(list.map(m=>m.sender_id===uid?m.recipient_id:m.sender_id))];
   const {data:profiles,error:pe}=ids.length?await supabase.from('profiles').select('id,username,display_name').in('id',ids):{data:[],error:null};
   if(pe)throw pe;
   const byId=new Map(((profiles??[]) as Person[]).map(p=>[p.id,p])),latest=new Map<string,Msg>();
   list.forEach(m=>{const id=m.sender_id===uid?m.recipient_id:m.sender_id;if(!latest.has(id))latest.set(id,m);});
   setRows([...latest.entries()].map(([id,message])=>({person:byId.get(id),message})).filter((x):x is {person:Person;message:Msg}=>!!x.person));setError('');
  }catch(e){setError(e instanceof Error?e.message:'Mesajlar yüklenemedi.');}
  finally{setLoading(false);}
 },[]);
 useFocusEffect(useCallback(()=>{void load();},[load]));
 return <View style={s.root}><ScrollView contentContainerStyle={{paddingTop:insets.top+18,paddingBottom:40}}>
 <View style={s.header}><View><Text style={s.eyebrow}>STAY CONNECTED</Text><Text style={s.title}>Mesajlar</Text></View><Pressable onPress={load} style={s.refresh}><Ionicons name="refresh" size={18} color={colors.ink}/></Pressable></View>
 {loading?<ActivityIndicator color={colors.primary} style={{marginTop:40}}/>:error?<Text style={s.empty}>{error}</Text>:rows.length===0?<View style={s.emptyCard}><Ionicons name="chatbubbles-outline" size={34} color={colors.primary}/><Text style={s.emptyTitle}>Henüz mesajın yok</Text><Text style={s.empty}>Arkadaşlarınla sohbetlerin burada görünecek.</Text><Pressable onPress={()=>router.push('/friends')} style={s.button}><Text style={s.buttonText}>Arkadaş bul</Text></Pressable></View>:rows.map(({person,message})=><Pressable key={person.id} onPress={()=>router.push({pathname:'/chat/[userId]',params:{userId:person.id}})} style={s.row}><View style={s.avatar}><Text style={s.avatarText}>{(person.display_name||person.username).slice(0,1).toUpperCase()}</Text></View><View style={s.copy}><Text style={s.name}>{person.display_name||person.username}</Text><Text style={s.handle}>@{person.username}</Text><Text numberOfLines={1} style={s.preview}>{message.body}</Text></View><Text style={s.time}>{new Date(message.created_at).toLocaleDateString('tr-TR')}</Text></Pressable>)}
 </ScrollView></View>;
}
const s=StyleSheet.create({root:{flex:1,backgroundColor:colors.bg},header:{paddingHorizontal:20,flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:22},eyebrow:{fontSize:9,fontWeight:'800',letterSpacing:1.5,color:colors.primary},title:{fontSize:30,fontWeight:'800',color:colors.ink,marginTop:3},refresh:{width:42,height:42,borderRadius:15,backgroundColor:colors.glassStrong,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:colors.glassBorder},row:{marginHorizontal:16,marginBottom:9,padding:12,borderRadius:radius.lg,backgroundColor:colors.glassStrong,borderWidth:1,borderColor:colors.glassBorder,flexDirection:'row',alignItems:'center',gap:11,...shadows.soft},avatar:{width:46,height:46,borderRadius:16,backgroundColor:colors.primarySoft,alignItems:'center',justifyContent:'center'},avatarText:{fontSize:17,fontWeight:'800',color:colors.primary},copy:{flex:1},name:{fontSize:14,fontWeight:'800',color:colors.ink},handle:{fontSize:10,color:colors.muted,marginTop:2},preview:{fontSize:12,color:colors.muted,marginTop:6},time:{fontSize:10,color:colors.muted},emptyCard:{margin:18,padding:24,borderRadius:radius.xl,backgroundColor:colors.glassStrong,alignItems:'center',gap:10},emptyTitle:{fontSize:17,fontWeight:'800',color:colors.ink},empty:{fontSize:12,color:colors.muted,textAlign:'center',margin:20},button:{marginTop:8,paddingHorizontal:20,paddingVertical:12,borderRadius:14,backgroundColor:colors.primary},buttonText:{fontSize:12,fontWeight:'800',color:'#fff'}});
