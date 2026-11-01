import { useEffect,useState } from 'react';
import { ActivityIndicator,Image,Pressable,ScrollView,StyleSheet,Text,TextInput,View,Alert } from 'react-native';
import { useLocalSearchParams,useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors,radius,shadows } from '../../src/theme';
import { useApp,type Moment } from '../../src/store/useApp';
import { hoursLeft,isExpired } from '../../src/lib/time';
import { supabase } from '../../src/lib/supabase';

type CommentItem={id:string;body:string;createdAt:string;author:string};
export default function MomentScreen(){
 const{id}=useLocalSearchParams<{id:string}>();const router=useRouter();
 const localMoment=useApp(s=>s.moments.find(x=>x.id===id));
 const [moment,setMoment]=useState<Moment|null>(localMoment??null);
 const [comments,setComments]=useState<CommentItem[]>([]);
 const [message,setMessage]=useState('');const [loading,setLoading]=useState(Boolean(supabase));
 const [sending,setSending]=useState(false);const [error,setError]=useState('');const[now,setNow]=useState(Date.now());
 useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),60000);return()=>clearInterval(timer);},[]);
 useEffect(()=>{let active=true;async function load(){
  if(!supabase||!id){setLoading(false);return;}
  try{
   const {data:row,error:rowError}=await supabase.from('moments').select('id,user_id,storage_path,caption,latitude,longitude,created_at').eq('id',id).maybeSingle();
   if(rowError)throw rowError;
   if(!row){if(active)setMoment(null);return;}
   const [{data:image,error:imageError},{data:profile}]=await Promise.all([
    supabase.storage.from('moments').createSignedUrl(row.storage_path,3600),
    supabase.from('profiles').select('username,display_name').eq('id',row.user_id).maybeSingle()
   ]);
   if(imageError)throw imageError;
   if(active&&image?.signedUrl)setMoment({id:row.id,author:profile?.display_name||profile?.username||'PicRoad kullanıcısı',mine:false,uri:image.signedUrl,caption:row.caption??'',createdAt:new Date(row.created_at).getTime(),latitude:row.latitude,longitude:row.longitude});
   if(active) await loadComments();
  }catch(e){if(active)setError(e instanceof Error?e.message:'Moment yüklenemedi.');}
  finally{if(active)setLoading(false);}
 }
 void load();return()=>{active=false;};
 },[id]);
 const loadComments=async()=>{if(!supabase||!id)return;const {data,error:commentsError}=await supabase.from('moment_comments').select('id,user_id,body,created_at').eq('moment_id',id).order('created_at',{ascending:true}).limit(100);if(commentsError)throw commentsError;const userIds=[...new Set((data??[]).map(c=>c.user_id))];const {data:profiles,error:profilesError}=userIds.length?await supabase.from('profiles').select('id,username,display_name').in('id',userIds):{data:[],error:null};if(profilesError)throw profilesError;const names=new Map((profiles??[]).map(p=>[p.id,p.display_name||p.username||'PicRoad kullanıcısı']));setComments((data??[]).map(c=>({id:c.id,body:c.body,createdAt:c.created_at,author:names.get(c.user_id)||'PicRoad kullanıcısı'})));}
 const sendComment=async()=>{const body=message.trim();if(!body||!supabase||!id)return;setSending(true);try{const {data:{user},error:authError}=await supabase.auth.getUser();if(authError)throw authError;if(!user)throw new Error('Yorum yapmak için giriş yapmalısın.');const {error:insertError}=await supabase.from('moment_comments').insert({moment_id:id,user_id:user.id,body});if(insertError)throw insertError;setMessage('');await loadComments();}catch(e){Alert.alert('Yorum gönderilemedi',e instanceof Error?e.message:'Bir hata oluştu.');}finally{setSending(false);}};
 const showOnMap=()=>{if(!moment)return;router.replace({pathname:'/',params:{focusLat:String(moment.latitude),focusLng:String(moment.longitude),focusMomentId:moment.id}});};
 if(loading)return <View style={s.empty}><ActivityIndicator color={colors.primary}/><Text style={s.emptyText}>Moment yükleniyor...</Text></View>;
 if(!moment||isExpired(moment.createdAt,now))return <View style={s.empty}><View style={s.emptyIcon}><Ionicons name="time-outline" size={24} color={colors.primary}/></View><Text style={s.emptyTitle}>Bu an artık yok.</Text><Text style={s.emptyText}>Fotoğraflar 24 saat sonra kayboluyor.</Text><Pressable onPress={()=>router.back()} style={s.backButton}><Text style={s.backText}>Geri dön</Text></Pressable></View>;
 return <View style={s.root}>
  <View style={s.top}><Pressable onPress={()=>router.back()} style={s.close}><Ionicons name="chevron-back" size={21} color={colors.ink}/></Pressable><Text style={s.screenTitle}>Moment</Text><View style={s.timePill}><Ionicons name="time-outline" size={13} color={colors.primary}/><Text style={s.timeText}>{hoursLeft(moment.createdAt,now)} sa</Text></View></View>
  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
   <View style={s.authorRow}><View style={s.avatar}><Text style={s.avatarText}>{moment.author.slice(0,1).toUpperCase()}</Text></View><View><Text style={s.author}>{moment.author}</Text><Text style={s.meta}>Yürüyüşünden bir an</Text></View></View>
   <View style={s.photoFrame}><Image source={{uri:moment.uri}} style={s.photo} resizeMode="cover"/><View style={s.photoBadge}><Ionicons name="sparkles-outline" size={13} color={colors.ink}/><Text style={s.photoBadgeText}>24 saatlik an</Text></View></View>
   {moment.caption?<Text style={s.caption}>{moment.caption}</Text>:null}
   <Pressable onPress={showOnMap} style={({pressed})=>[s.mapButton,pressed&&{opacity:.85}]}><Ionicons name="map-outline" size={19} color="#fff"/><Text style={s.mapButtonText}>Haritada göster</Text><Ionicons name="arrow-forward" size={16} color="#fff"/></Pressable>
   <View style={s.commentsHead}><Text style={s.commentsTitle}>Yorumlar</Text><Text style={s.commentCount}>{comments.length}</Text></View>
   {error?<Text style={s.error}>{error}</Text>:comments.length===0?<Text style={s.noComments}>Henüz yorum yok. İlk yorumu sen bırak.</Text>:comments.map(c=><View key={c.id} style={s.comment}><View style={s.commentAvatar}><Text style={s.commentAvatarText}>{c.author.slice(0,1).toUpperCase()}</Text></View><View style={s.commentBody}><Text style={s.commentAuthor}>{c.author}</Text><Text style={s.commentText}>{c.body}</Text></View></View>)}
  </ScrollView>
  <View style={s.composer}><TextInput value={message} onChangeText={setMessage} placeholder="Yorumunu yaz..." placeholderTextColor={colors.muted} style={s.input} multiline maxLength={500}/><Pressable disabled={!message.trim()||sending} onPress={sendComment} style={[s.sendButton,(!message.trim()||sending)&&s.sendDisabled]}>{sending?<ActivityIndicator color="#fff" size="small"/>:<Ionicons name="arrow-up" size={19} color="#fff"/>}</Pressable></View>
 </View>;
}
const s=StyleSheet.create({
 root:{flex:1,backgroundColor:colors.bg,paddingTop:12},empty:{flex:1,backgroundColor:colors.bg,alignItems:'center',justifyContent:'center',padding:24,gap:10},emptyIcon:{width:54,height:54,borderRadius:19,backgroundColor:colors.primarySoft,alignItems:'center',justifyContent:'center'},emptyTitle:{fontSize:24,fontWeight:'800',color:colors.ink},emptyText:{marginTop:7,color:colors.muted,textAlign:'center'},backButton:{marginTop:18,paddingHorizontal:22,height:48,borderRadius:radius.pill,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center'},backText:{color:'#fff',fontWeight:'700'},
 top:{height:48,paddingHorizontal:18,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},close:{width:38,height:38,borderRadius:14,backgroundColor:colors.glassStrong,alignItems:'center',justifyContent:'center'},screenTitle:{fontSize:17,fontWeight:'800',color:colors.ink},timePill:{height:32,paddingHorizontal:10,borderRadius:radius.pill,backgroundColor:colors.primarySoft,flexDirection:'row',alignItems:'center',gap:5},timeText:{fontSize:11,fontWeight:'800',color:colors.primary},
 content:{padding:18,paddingBottom:20},authorRow:{flexDirection:'row',alignItems:'center',gap:10,marginBottom:14},avatar:{width:42,height:42,borderRadius:15,backgroundColor:colors.primarySoft,alignItems:'center',justifyContent:'center'},avatarText:{color:colors.primary,fontSize:16,fontWeight:'800'},author:{fontSize:15,fontWeight:'800',color:colors.ink},meta:{marginTop:3,fontSize:11,color:colors.muted},photoFrame:{borderRadius:radius.xl,overflow:'hidden',backgroundColor:colors.line,...shadows.glass},photo:{width:'100%',aspectRatio:1},photoBadge:{position:'absolute',left:12,bottom:12,flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:11,height:31,borderRadius:radius.pill,backgroundColor:'rgba(255,255,255,.82)'},photoBadgeText:{fontSize:11,fontWeight:'700',color:colors.ink},caption:{marginTop:14,fontSize:17,lineHeight:25,fontWeight:'600',color:colors.ink},
 mapButton:{marginTop:16,height:52,paddingHorizontal:17,borderRadius:17,backgroundColor:colors.primary,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:9,...shadows.soft},mapButtonText:{flex:1,fontSize:13,fontWeight:'800',color:'#fff'},commentsHead:{marginTop:25,marginBottom:12,flexDirection:'row',alignItems:'center',gap:8},commentsTitle:{fontSize:18,fontWeight:'800',color:colors.ink},commentCount:{fontSize:11,fontWeight:'800',color:colors.primary,backgroundColor:colors.primarySoft,paddingHorizontal:8,paddingVertical:3,borderRadius:radius.pill},noComments:{paddingVertical:14,fontSize:12,color:colors.muted},error:{fontSize:12,color:'#B42318'},comment:{flexDirection:'row',gap:9,marginBottom:13},commentAvatar:{width:33,height:33,borderRadius:12,backgroundColor:colors.primarySoft,alignItems:'center',justifyContent:'center'},commentAvatarText:{fontSize:12,fontWeight:'800',color:colors.primary},commentBody:{flex:1,padding:11,borderRadius:15,backgroundColor:colors.glassStrong},commentAuthor:{fontSize:11,fontWeight:'800',color:colors.ink},commentText:{marginTop:3,fontSize:13,lineHeight:19,color:colors.ink},composer:{flexDirection:'row',alignItems:'center',gap:9,paddingHorizontal:15,paddingTop:10,paddingBottom:18,borderTopWidth:1,borderTopColor:colors.line,backgroundColor:colors.bg},input:{flex:1,minHeight:44,maxHeight:90,paddingHorizontal:14,paddingVertical:10,borderRadius:16,backgroundColor:colors.glassStrong,color:colors.ink,fontSize:13},sendButton:{width:42,height:42,borderRadius:15,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center'},sendDisabled:{opacity:.4}
});