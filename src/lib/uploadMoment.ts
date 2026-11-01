import { supabase } from './supabase';

export async function uploadMoment(localUri: string, userId: string, momentId: string) {
  if (!supabase) throw new Error('Supabase yapılandırılmamış.');

  const response = await fetch(localUri);
  if (!response.ok) throw new Error('Fotoğraf dosyası okunamadı.');

  const blob = await response.blob();
  const path = `${userId}/${momentId}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from('moments')
    .upload(path, blob, { contentType: 'image/jpeg', upsert: false });

  if (uploadError) throw uploadError;

  const { data, error: signedUrlError } = await supabase.storage
    .from('moments')
    .createSignedUrl(path, 60 * 60 * 24);

  if (signedUrlError || !data?.signedUrl) {
    await supabase.storage.from('moments').remove([path]);
    throw signedUrlError ?? new Error('Fotoğraf bağlantısı oluşturulamadı.');
  }

  return { path, signedUrl: data.signedUrl };
}
