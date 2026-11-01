import { File } from 'expo-file-system';
import { supabase } from './supabase';

export async function uploadMoment(localUri: string, userId: string, momentId: string) {
  if (!supabase) throw new Error('Supabase yapılandırılmamış.');

  // Read native camera file URIs with Expo FileSystem.
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

  // Do not request a signed URL here. Storage SELECT policy checks the
  // moments table row, which is inserted by addMoment immediately afterwards.
  return { path };
}
