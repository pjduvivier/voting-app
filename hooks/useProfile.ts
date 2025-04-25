import { useState } from 'react';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';

export function useProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0];
      }
      return null;
    } catch (err) {
      console.error('Error picking image:', err);
      throw new Error('Failed to pick image. Please try again.');
    }
  };

  const uploadProfilePhoto = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check network connectivity first
      if (Platform.OS === 'web' && typeof window !== 'undefined' && !window.navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      }

      // Verify authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw new Error('Authentication required. Please sign in and try again.');
      if (!user) throw new Error('Not authenticated');

      const pickerResult = await pickImage();
      if (!pickerResult) return null;

      // For web, we need to convert the base64 to a blob
      let file;
      try {
        const response = await fetch(pickerResult.uri);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status} - ${response.statusText}`);
        }
        file = await response.blob();
      } catch (fetchError: any) {
        console.error('Error fetching image:', fetchError);
        if (fetchError.name === 'TypeError' && fetchError.message === 'Failed to fetch') {
          throw new Error('Network error: Unable to load the selected image. Please check your connection and try again.');
        }
        throw new Error('Failed to process the selected image. Please try another image.');
      }

      const fileExt = pickerResult.uri.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `${user.id}/profile.${fileExt}`;

      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: `image/${fileExt}`,
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error('Failed to upload image to storage. Please try again.');
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update the user's profile with the new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        });

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw new Error('Failed to update profile. Please try again.');
      }

      return publicUrl;
    } catch (err: any) {
      console.error('Error uploading profile photo:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    uploadProfilePhoto,
  };
}