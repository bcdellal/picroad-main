import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme';
import { supabase } from '../../src/lib/supabase';
type Msg={id:string;sender_id:string;recipient_id:string;body:string;created_at:string};
type Person={id:string;username:string;display_name:string|null};
export default function ChatScreen(){
 const {userId}=useLocalSearchParams<{userId:string}>(),router=useRouter(),insets=useSafeAreaInsets();
 const [me,setMe]=useState(''),[person,setPerson]=useState<Person|null>(null),[messages,setMessages]=useState<Msg[]>([]),[draft,setDraft]=useState(''),[loading,setLoading]=useState(true),[sending,setSending]=useState(false),[error,setError]=useState('');
 const load=useCallback(async()=>{
  if(!supabase||!userId)return;
  try{
   const {data:session}=await supabase.auth.getSession(),uid=session.session?.user.id;if(!uid)throw new Error('Oturum bulunamadı.');setMe(uid);
   const filter='and(sender_id.eq.'+uid+',recipient_id.eq.'+userId+'),and(sender_id.eq.'+userId+',recipient_id.eq.'+uid+')';
   const [p,m]=await Promise.all([supabase.from('profiles').select('id,username,display_name').eq('id',userId).single(),supabase.from('messages').select('id,sender_id,recipient_id,body,created_at').or(filter).order('created_at',{ascending:true}).limit(300)]);
   if(p.error)throw p.error;if(m.error)throw m.error;setPerson(p.data as Person);setMessages((m.data??[]) as Msg[]);setError('');
  }catch(e){setError(e instanceof Error?e.message:'Sohbet yüklenemedi.');}
  finally{setLoading(false);}
 },[userId]);
 useEffect(()=>{void load();},[load]);
 const send=async()=>{const body=draft.trim();if(!body||!supabase||!me||sending)return;setSending(true);try{const {error:e}=await supabase.from('messages').insert({sender_id:me,recipient_id:userId,body});if(e)throw e;setDraft('');await load();}catch(e){setError(e instanceof Error?e.message:'Mesaj gönderilemedi.');}finally{setSending(false);}};
 return <KeyboardAvoidingView style={s.root} behavior={Platform.OS==='ios'?'padding':undefined} keyboardVerticalOffset={8}>
 <View style={[s.header,{paddingTop:insets.top+8}]}><Pressable onPress={()=>router.back()} style={s.back}><Ionicons name="chevron-back" size={22} color={colors.ink}/></Pressable><View style={{flex:1}}><Text style={s.name}>{person?.display_name||person?.username||'Sohbet'}</Text>{person?<Text style={s.handle}>@{person.username}</Text>:null}</View></View>
 {loading?<ActivityIndicator color={colors.primary} style={{flex:1}}/>:<ScrollView style={{flex:1}} contentContainerStyle={s.messages}>{error?<Text style={s.error}>{error}</Text>:null}{messages.map(m=><View key={m.id} style={[s.bubble,m.sender_id===me?s.mine:s.theirs]}><Text style={[s.body,m.sender_id===me&&s.mineText]}>{m.body}</Text><Text style={[s.time,m.sender_id===me&&s.mineText]}>{new Date(m.created_at).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}</Text></View>)}</ScrollView>}
 <View style={[s.composer,{paddingBottom:Math.max(insets.bottom,12)}]}><TextInput value={draft} onChangeText={setDraft} placeholder="Mesajını yaz..." placeholderTextColor={colors.muted} style={s.input} multiline maxLength={2000}/><Pressable onPress={send} disabled={!draft.trim()||sending} style={[s.send,(!draft.trim()||sending)&&{opacity:.45}]}>{sending?<ActivityIndicator color="#fff"/>:<Ionicons name="send" size={18} color="#fff"/>}</Pressable></View>
 </KeyboardAvoidingView>;
}
const s=StyleSheet.create({root:{flex:1,backgroundColor:colors.bg},header:{paddingHorizontal:16,paddingBottom:13,flexDirection:'row',alignItems:'center',gap:12,borderBottomWidth:1,borderBottomColor:colors.line},back:{width:40,height:40,borderRadius:14,backgroundColor:colors.glassStrong,alignItems:'center',justifyContent:'center'},name:{fontSize:16,fontWeight:'800',color:colors.ink},handle:{fontSize:10,color:colors.muted,marginTop:2},messages:{padding:15,gap:10},bubble:{maxWidth:'82%',padding:12,borderRadius:17},mine:{alignSelf:'flex-end',backgroundColor:colors.primary,borderBottomRightRadius:5},theirs:{alignSelf:'flex-start',backgroundColor:colors.glassStrong,borderWidth:1,borderColor:colors.glassBorder,borderBottomLeftRadius:5},body:{fontSize:14,color:colors.ink,lineHeight:20},mineText:{color:'#fff'},time:{fontSize:9,color:colors.muted,marginTop:5,textAlign:'right'},composer:{paddingHorizontal:12,paddingTop:10,flexDirection:'row',alignItems:'flex-end',gap:9,borderTopWidth:1,borderTopColor:colors.line},input:{flex:1,maxHeight:110,minHeight:44,paddingHorizontal:14,paddingVertical:10,borderRadius:16,backgroundColor:colors.glassStrong,color:colors.ink,fontSize:14},send:{width:44,height:44,borderRadius:15,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center'},error:{color:'#C44',textAlign:'center',padding:15}});
