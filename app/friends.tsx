import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadows } from '../src/theme';
import { supabase } from '../src/lib/supabase';

type Profile = { id: string; username: string; display_name: string | null };
type Friendship = { id: string; requester_id: string; addressee_id: string; status: 'pending' | 'accepted' };

export default function FriendsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [friends, setFriends] = useState<Profile[]>([]);
  const [incoming, setIncoming] = useState<Array<{ friendship: Friendship; profile: Profile }>>([]);
  const [outgoing, setOutgoing] = useState<Array<{ friendship: Friendship; profile: Profile }>>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    if (!supabase) { setLoading(false); setMessage('Supabase bağlantısı bulunamadı.'); return; }
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const currentUserId = sessionData.session?.user.id;
      if (!currentUserId) { setMessage('Arkadaşlarını görmek için giriş yapmalısın.'); setLoading(false); return; }
      setUserId(currentUserId);
      const { data: rows, error } = await supabase.from('friendships').select('id,requester_id,addressee_id,status').or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`).order('created_at', { ascending: false });
      if (error) throw error;
      const friendships = (rows ?? []) as Friendship[];
      const otherIds = [...new Set(friendships.map(f => f.requester_id === currentUserId ? f.addressee_id : f.requester_id))];
      const { data: profiles, error: profilesError } = otherIds.length
        ? await supabase.from('profiles').select('id,username,display_name').in('id', otherIds)
        : { data: [], error: null };
      if (profilesError) throw profilesError;
      const byId = new Map(((profiles ?? []) as Profile[]).map(p => [p.id, p]));
      const accepted = friendships.filter(f => f.status === 'accepted').map(f => byId.get(f.requester_id === currentUserId ? f.addressee_id : f.requester_id)).filter((p): p is Profile => Boolean(p));
      const received = friendships.filter(f => f.status === 'pending' && f.addressee_id === currentUserId).map(f => ({ friendship: f, profile: byId.get(f.requester_id)! })).filter(x => Boolean(x.profile));
      const sent = friendships.filter(f => f.status === 'pending' && f.requester_id === currentUserId).map(f => ({ friendship: f, profile: byId.get(f.addressee_id)! })).filter(x => Boolean(x.profile));
      setFriends(accepted); setIncoming(received); setOutgoing(sent); setMessage('');
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Arkadaşlar yüklenemedi.'); }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const searchUsers = async () => {
    const term = query.trim().replace(/^@/, '');
    if (!term || !supabase) return;
    setSearching(true); setMessage('');
    try {
      const { data, error } = await supabase.from('profiles').select('id,username,display_name').ilike('username', `%${term}%`).neq('id', userId).limit(20);
      if (error) throw error;
      setResults((data ?? []) as Profile[]);
      if (!data?.length) setMessage('Bu kullanıcı adıyla eşleşen kimse bulunamadı.');
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Arama yapılamadı.'); }
    finally { setSearching(false); }
  };

  const sendRequest = async (target: Profile) => {
    if (!supabase) return;
    setBusyId(target.id); setMessage('');
    try {
      const { data: existing, error: existingError } = await supabase.from('friendships').select('id,status').or(`and(requester_id.eq.${userId},addressee_id.eq.${target.id}),and(requester_id.eq.${target.id},addressee_id.eq.${userId})`).limit(1);
      if (existingError) throw existingError;
      if (existing?.length) { setMessage(existing[0].status === 'accepted' ? 'Zaten arkadaşsınız.' : 'Bu kişiyle bekleyen bir arkadaşlık isteğiniz var.'); return; }
      const { error } = await supabase.from('friendships').insert({ requester_id: userId, addressee_id: target.id, status: 'pending' });
      if (error) throw error;
      setResults(prev => prev.filter(p => p.id !== target.id));
      setMessage('Arkadaşlık isteği gönderildi.');
      await load();
    } catch (e) { setMessage(e instanceof Error ? e.message : 'İstek gönderilemedi.'); }
    finally { setBusyId(''); }
  };

  const respond = async (item: { friendship: Friendship; profile: Profile }, accept: boolean) => {
    if (!supabase) return;
    setBusyId(item.friendship.id); setMessage('');
    try {
      const result = accept
        ? await supabase.from('friendships').update({ status: 'accepted', updated_at: new Date().toISOString() }).eq('id', item.friendship.id).eq('addressee_id', userId)
        : await supabase.from('friendships').delete().eq('id', item.friendship.id).eq('addressee_id', userId);
      if (result.error) throw result.error;
      await load();
    } catch (e) { setMessage(e instanceof Error ? e.message : 'İşlem tamamlanamadı.'); }
    finally { setBusyId(''); }
  };

  return <View style={s.root}>
    <ScrollView contentContainerStyle={{ paddingTop: insets.top + 14, paddingBottom: insets.bottom + 36 }} keyboardShouldPersistTaps="handled">
      <View style={s.header}><Pressable onPress={() => router.back()} style={s.back}><Ionicons name="chevron-back" size={22} color={colors.ink}/></Pressable><View style={{flex:1}}><Text style={s.eyebrow}>YOUR PEOPLE</Text><Text style={s.title}>Arkadaşlar</Text></View><View style={s.count}><Text style={s.countText}>{friends.length}</Text></View></View>
      <View style={s.searchCard}><View style={s.searchLine}><Ionicons name="search" size={18} color={colors.muted}/><TextInput value={query} onChangeText={setQuery} placeholder="Kullanıcı adı ara..." placeholderTextColor={colors.muted} autoCapitalize="none" autoCorrect={false} style={s.input} onSubmitEditing={searchUsers}/><Pressable onPress={searchUsers} disabled={searching || !query.trim()} style={s.searchButton}>{searching?<ActivityIndicator color="#fff" size="small"/>:<Ionicons name="arrow-forward" size={18} color="#fff"/>}</Pressable></View><Text style={s.helper}>PicRoad kullanıcı adlarıyla yol arkadaşlarını bul.</Text></View>
      {message ? <Text style={s.message}>{message}</Text> : null}
      {results.length>0?<Section title="ARAMA SONUÇLARI" count={results.length}>{results.map(p=><UserRow key={p.id} profile={p} action={busyId===p.id?'...':'Ekle'} onPress={()=>sendRequest(p)} disabled={busyId===p.id}/>)}</Section>:null}
      {loading?<ActivityIndicator style={{marginTop:35}} color={colors.primary}/>:<>
        <Section title="GELEN İSTEKLER" count={incoming.length}>{incoming.length?incoming.map(item=><UserRow key={item.friendship.id} profile={item.profile} action={busyId===item.friendship.id?'...':'Kabul et'} secondary="Reddet" onPress={()=>respond(item,true)} onSecondary={()=>respond(item,false)} disabled={busyId===item.friendship.id}/>):<Empty text="Şimdilik gelen arkadaşlık isteğin yok."/>}</Section>
        <Section title="GÖNDERİLEN İSTEKLER" count={outgoing.length}>{outgoing.length?outgoing.map(item=><UserRow key={item.friendship.id} profile={item.profile} action="Beklemede" disabled/>):<Empty text="Bekleyen gönderilmiş isteğin yok."/>}</Section>
        <Section title="ARKADAŞLARIN" count={friends.length}>{friends.length?friends.map(p=><UserRow key={p.id} profile={p} action="Arkadaş" disabled/>):<Empty text="Henüz arkadaşın yok. Kullanıcı adıyla arayıp ilk isteğini gönder."/>}</Section>
      </>}
    </ScrollView>
  </View>;
}

function Section({title,count,children}:{title:string;count:number;children:React.ReactNode}) { return <View style={s.section}><View style={s.sectionHead}><Text style={s.sectionTitle}>{title}</Text><Text style={s.sectionCount}>{count}</Text></View>{children}</View>; }
function UserRow({profile,action,secondary,onPress,onSecondary,disabled}:{profile:Profile;action:string;secondary?:string;onPress?:()=>void;onSecondary?:()=>void;disabled?:boolean}) { return <View style={s.userRow}><View style={s.avatar}><Text style={s.avatarText}>{(profile.display_name||profile.username).slice(0,1).toUpperCase()}</Text></View><View style={s.userCopy}><Text style={s.userName}>{profile.display_name||profile.username}</Text><Text style={s.userHandle}>@{profile.username}</Text></View>{secondary?<Pressable onPress={onSecondary} style={s.secondaryButton}><Text style={s.secondaryText}>{secondary}</Text></Pressable>:null}<Pressable onPress={onPress} disabled={disabled||!onPress} style={[s.actionButton,disabled&&s.disabled]}><Text style={s.actionText}>{action}</Text></Pressable></View>; }
function Empty({text}:{text:string}) { return <View style={s.empty}><Text style={s.emptyText}>{text}</Text></View>; }
const s=StyleSheet.create({
 root:{flex:1,backgroundColor:colors.bg},header:{paddingHorizontal:18,flexDirection:'row',alignItems:'center',gap:12},back:{width:42,height:42,borderRadius:15,backgroundColor:colors.glassStrong,borderWidth:1,borderColor:colors.glassBorder,alignItems:'center',justifyContent:'center'},eyebrow:{fontSize:9,fontWeight:'800',letterSpacing:1.6,color:colors.primary},title:{marginTop:3,fontSize:29,fontWeight:'800',letterSpacing:-.8,color:colors.ink},count:{minWidth:38,height:38,paddingHorizontal:10,borderRadius:14,backgroundColor:colors.primarySoft,alignItems:'center',justifyContent:'center'},countText:{fontSize:14,fontWeight:'800',color:colors.primary},
 searchCard:{marginHorizontal:16,marginTop:22,padding:13,borderRadius:radius.xl,backgroundColor:colors.glassStrong,borderWidth:1,borderColor:colors.glassBorder,...shadows.soft},searchLine:{height:48,flexDirection:'row',alignItems:'center',gap:9},input:{flex:1,fontSize:14,color:colors.ink,paddingVertical:8},searchButton:{width:40,height:40,borderRadius:14,backgroundColor:colors.primary,alignItems:'center',justifyContent:'center'},helper:{marginTop:6,fontSize:11,color:colors.muted},message:{marginHorizontal:20,marginTop:12,fontSize:12,color:colors.primary,lineHeight:18},
 section:{marginTop:25,paddingHorizontal:16},sectionHead:{marginBottom:10,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},sectionTitle:{fontSize:10,fontWeight:'900',letterSpacing:1.3,color:colors.muted},sectionCount:{fontSize:11,fontWeight:'800',color:colors.primary},userRow:{minHeight:66,padding:10,marginBottom:8,borderRadius:radius.lg,backgroundColor:colors.glassStrong,borderWidth:1,borderColor:colors.glassBorder,flexDirection:'row',alignItems:'center',gap:9},avatar:{width:42,height:42,borderRadius:15,backgroundColor:colors.primarySoft,alignItems:'center',justifyContent:'center'},avatarText:{fontSize:16,fontWeight:'800',color:colors.primary},userCopy:{flex:1},userName:{fontSize:13,fontWeight:'800',color:colors.ink},userHandle:{marginTop:3,fontSize:10,color:colors.muted},actionButton:{paddingHorizontal:12,paddingVertical:9,borderRadius:12,backgroundColor:colors.primary},actionText:{fontSize:10,fontWeight:'800',color:'#fff'},secondaryButton:{paddingHorizontal:10,paddingVertical:9,borderRadius:12,backgroundColor:colors.line},secondaryText:{fontSize:10,fontWeight:'800',color:colors.ink},disabled:{backgroundColor:colors.primarySoft},empty:{padding:15,borderRadius:radius.lg,backgroundColor:colors.glass},emptyText:{fontSize:12,color:colors.muted,lineHeight:18}
});
