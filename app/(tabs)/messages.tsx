import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadows } from '../../src/theme';
import { supabase } from '../../src/lib/supabase';

type Msg = { id:string; sender_id:string; recipient_id:string; body:string; created_at:string };
type Person = { id:string; username:string; display_name:string|null };
type Row = { person:Person; message:Msg|null };

export default function MessagesScreen(){
 const router=useRouter(),insets=useSafeAreaInsets();
 const [rows,setRows]=useState<Row[]>([]);
 const [loading,setLoading]=useState(true),[error,setError]=useState('');
 const load=useCallback(async()=>{
  if(!supabase){setError('Supabase bağlantısı yok.');setLoading(false);return;}
  setLoading(true);
  try{
   const {data:session,error:sessionError}=await supabase.auth.getSession();
   if(sessionError)throw sessionError;
   const uid=session.session?.user.id;
   if(!uid)throw new Error('Oturum bulunamadı.');
   const [messageResult,friendResult]=await Promise.all([
    supabase.from('messages').select('id,sender_id,recipient_id,body,created_at').or('sender_id.eq.'+uid+',recipient_id.eq.'+uid).order('created_at',{ascending:false}).limit(200),
    supabase.from('friendships').select('requester_id,addressee_id').eq('status','accepted').or('requester_id.eq.'+uid+',addressee_id.eq.'+uid)
   ]);
   if(messageResult.error)throw messageResult.error;
   if(friendResult.error)throw friendResult.error;
   const list=(messageResult.data??[]) as Msg[];
   const friendIds=(friendResult.data??[]).map(f=>f.requester_id===uid?f.addressee_id:f.requester_id);
   const conversationIds=list.map(m=>m.sender_id===uid?m.recipient_id:m.sender_id);
   const ids=[...new Set([...friendIds,...conversationIds])];
   if(!ids.length){setRows([]);setError('');return;}
   const {data:profiles,error:profileError}=await supabase.from('profiles').select('id,username,display_name').in('id',ids);
   if(profileError)throw profileError;
   const byId=new Map(((profiles??[]) as Person[]).map(p=>[p.id,p]));
   const latest=new Map<string,Msg>();
   list.forEach(m=>{const id=m.sender_id===uid?m.recipient_id:m.sender_id;if(!latest.has(id))latest.set(id,m);});
   const orderedIds=[...ids].sort((a,b)=>{
    const ta=latest.get(a)?.created_at??'',tb=latest.get(b)?.created_at??'';
    return tb.localeCompare(ta);
   });
   setRows(orderedIds.map(id=>({person:byId.get(id),message:latest.get(id)??null})).filter((x):x is Row=>!!x.person));
   setError('');
  }catch(e){setError(e instanceof Error?e.message:'Mesajlar yüklenemedi.');}
  finally{setLoading(false);}
 },[]);
 useFocusEffect(useCallback(()=>{void load();},[load]));
 return <View style={s.root}><ScrollView contentContainerStyle={{paddingTop:insets.top+18,paddingBottom:40}}>
 <View style={s.header}><View><Text style={s.eyebrow}>STAY CONNECTED</Text><Text style={s.title}>Mesajlar</Text></View><Pressable onPress={load} style={s.refresh}><Ionicons name="refresh" size={18} color={colors.ink}/></Pressable></View>
 {loading?<ActivityIndicator color={colors.primary} style={{marginTop:40}}/>:error?<Text style={s.empty}>{error}</Text>:rows.length===0?<View style={s.emptyCard}><Ionicons name="chatbubbles-outline" size={34} color={colors.primary}/><Text style={s.emptyTitle}>Henüz sohbetin yok</Text><Text style={s.empty}>Kabul edilmiş arkadaşların burada görünecek. Önce arkadaş ekleyebilir veya gelen isteği kabul edebilirsin.</Text><Pressable onPress={()=>router.push('/friends')} style={s.button}><Text style={s.buttonText}>Arkadaşları görüntüle</Text></Pressable></View>:rows.map(({person,message})=><Pressable key={person.id} onPress={()=>router.push({pathname:'/chat/[userId]',params:{userId:person.id}})} style={s.row}><View style={s.avatar}><Text style={s.avatarText}>{(person.display_name||person.username).slice(0,1).toUpperCase()}</Text></View><View style={s.copy}><Text style={s.name}>{person.display_name||person.username}</Text><Text style={s.handle}>@{person.username}</Text><Text numberOfLines={1} style={s.preview}>{message?.body??'Henüz mesaj yok · Sohbet başlat'}</Text></View>{message?<Text style={s.time}>{new Date(message.created_at).toLocaleDateString('tr-TR')}</Text>:<Ionicons name="chevron-forward" size={18} color={colors.muted}/>}</Pressable>)}
 </ScrollView></View>;
}
const s=StyleSheet.create({root:{flex:1,backgroundColor:colors.bg},header:{paddingHorizontal:20,flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:22},eyebrow:{fontSize:9,fontWeight:'800',letterSpacing:1.5,color:colors.primary},title:{fontSize:30,fontWeight:'800',color:colors.ink,marginTop:3},refresh:{width:42,height:42,borderRadius:15,backgroundColor:colors.glassStrong,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:colors.glassBorder},row:{marginHorizontal:16,marginBottom:9,padding:12,borderRadius:radius.lg,backgroundColor:colors.glassStrong,borderWidth:1,borderColor:colors.glassBorder,flexDirection:'row',alignItems:'center',gap:11,...shadows.soft},avatar:{width:46,height:46,borderRadius:16,backgroundColor:colors.primarySoft,alignItems:'center',justifyContent:'center'},avatarText:{fontSize:17,fontWeight:'800',color:colors.primary},copy:{flex:1},name:{fontSize:14,fontWeight:'800',color:colors.ink},handle:{fontSize:10,color:colors.muted,marginTop:2},preview:{fontSize:12,color:colors.muted,marginTop:6},time:{fontSize:10,color:colors.muted},emptyCard:{margin:18,padding:24,borderRadius:radius.xl,backgroundColor:colors.glassStrong,alignItems:'center',gap:10},emptyTitle:{fontSize:17,fontWeight:'800',color:colors.ink},empty:{fontSize:12,color:colors.muted,textAlign:'center',margin:20},button:{marginTop:8,paddingHorizontal:20,paddingVertical:12,borderRadius:14,backgroundColor:colors.primary},buttonText:{fontSize:12,fontWeight:'800',color:'#fff'}});
