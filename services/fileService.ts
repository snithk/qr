
import { supabase } from './supabaseClient';
import { ShareResult } from '../types';

export const uploadFile = async (file: File): Promise<ShareResult> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  try {
    const { data, error } = await supabase.storage
      .from('files')
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('files')
      .getPublicUrl(filePath);

    // Note: Supabase Storage doesn't have auto-expiry by default in the same way file.io does,
    // but you can implement it via Edge Functions or assume it's permanent for now.
    // For this demo, we'll return a 24h expiry date just to satisfy the interface.

    // Insert record into database
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      await supabase.from('user_uploads').insert({
        user_id: userData.user.id,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        file_path: filePath,
        public_url: publicUrl
      });
    }

    return {
      url: publicUrl,
      expiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      key: data.path
    };
  } catch (error: any) {
    console.error('Upload error:', error.message);
    if (error.message && error.message.includes('Bucket not found')) {
      throw new Error("Storage bucket 'files' not found. Please create a public bucket named 'files' in your Supabase project dashboard.");
    }
    if (error.message && error.message.includes('row-level security policy')) {
      console.error("Supabase RLS Error. Run this SQL in Supabase Editor:\n" +
        "CREATE POLICY \"Public Access\" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'files');\n" +
        "CREATE POLICY \"Public Read\" ON storage.objects FOR SELECT TO public USING (bucket_id = 'files');");
      throw new Error("Upload Failed: Permission denied. Please check the browser console for the SQL command to fix your Supabase policies.");
    }
    throw new Error(error.message || 'Upload failed');
  }
};

export const getUserFiles = async () => {
  const { data, error } = await supabase
    .from('user_uploads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};
