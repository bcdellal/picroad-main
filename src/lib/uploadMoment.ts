import { supabase } from './supabase';

export async function uploadMoment(localUri: string, userId: string, momentId: string) {
  if (!supabase) throw new Error('Supabase yapılandırılmamış.');
  const response = await fetch(localUri);
  const blob = await response.blob();
  const path = `${userId}/${momentId}.jpg`;
  const { error } = await supabase.storage.from('moments').upload(path, blob, { contentType: 'image/jpeg', upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from('moments').getPublicUrl(path);
  return { path, url: data.publicUrl };
}
