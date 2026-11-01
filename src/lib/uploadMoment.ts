import { File } from 'expo-file-system';
import { supabase } from './supabase';

export async function uploadMoment(localUri: string, userId: string, momentId: string) {
  if (!supabase) throw new Error('Supabase yapılandırılmamış.');

  // Camera assets are local file URIs. Read them with Expo FileSystem
  // instead of fetch(uri), which can fail for native file:// assets.
  const file = new File(localUri);
  if (!file.exists) {
    throw new Error('Çekilen fotoğrafın geçici dosyası bulunamadı. Lütfen tekrar fotoğraf çek.');
  }

  const fileBytes = await file.bytes();
  if (!fileBytes.length) {
    throw new Error('Fotoğraf dosyası boş görünüyor. Lütfen tekrar çek.');
  }

  const path = `${userId}/${momentId}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from('moments')
    .upload(path, fileBytes, {
      contentType: 'image/jpeg',
      upsert: false,
    });

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
