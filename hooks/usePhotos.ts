import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { Photo } from '@/types';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const FREE_VOTE_LIMIT = 6;

export function usePhotos() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkNetworkAndSupabase = async () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && !window.navigator.onLine) {
      throw new Error('No internet connection. Please check your network and try again.');
    }

    try {
      const { error } = await supabase.from('photos').select('count').limit(1).single();
      if (error) {
        throw new Error('Database connection error: ' + error.message);
      }
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        throw new Error('Network error: Unable to reach the database. Please check your connection and try again.');
      }
      throw new Error('Unable to connect to the database. Please try again later.');
    }
  };

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      setError(null);

      await checkNetworkAndSupabase();

      // Get user's votes first
      const { data: { user } } = await supabase.auth.getUser();
      let userVotes: { photo_id: string }[] = [];
      
      if (user) {
        const { data: votes, error: votesError } = await supabase
          .from('user_votes')
          .select('photo_id')
          .eq('user_id', user.id);

        if (votesError) {
          throw new Error('Failed to fetch user votes: ' + votesError.message);
        }
        userVotes = votes || [];
      }

      // Fetch XML data
      const response = await fetch('https://bmodel.ch/CORS/media-urls.xml');
      if (!response.ok) {
        throw new Error('Failed to fetch XML data');
      }
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      const items = Array.from(xmlDoc.getElementsByTagName('item'));

      // Then get all photos
      const { data: photosData, error: photosError } = await supabase
        .from('photos')
        .select('*');

      if (photosError) {
        throw new Error('Failed to fetch photos: ' + photosError.message);
      }

      // Transform the data to match our Photo type
      const transformedPhotos: Photo[] = photosData.map(photo => {
        // Find matching XML item for this photo
        const xmlItem = items.find(item => {
          const link = item.getElementsByTagName('link')[0]?.textContent;
          return link && link.includes(photo.external_id);
        });

        // Get description from XML if available
        const xmlDesc = xmlItem?.getElementsByTagName('desc')[0]?.textContent?.trim() || '';

        return {
          id: photo.id,
          external_id: photo.external_id,
          url: photo.url,
          title: photo.title,
          photographer: photo.photographer,
          description: xmlDesc || photo.description || '',
          votes: photo.votes || 0,
          dateAdded: new Date(photo.date_added).toISOString(),
          userVoted: userVotes.some(vote => vote.photo_id === photo.id)
        };
      });

      // Shuffle the photos client-side
      const shuffledPhotos = shuffleArray(transformedPhotos);
      setPhotos(shuffledPhotos);

    } catch (err: any) {
      console.error('usePhotos › fetchPhotos error:', err);
      setError(err.message ?? 'Unexpected error while loading');
    } finally {
      setLoading(false);
    }
  };

  const voteForPhoto = async (photoId: string) => {
    try {
      await checkNetworkAndSupabase();

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      if (!user) {
        router.push(`/profile?isSignUp=true&from=/photo/${photoId}`);
        return;
      }

      const photo = photos.find(p => p.id === photoId);
      if (!photo) return;

      // If user is trying to remove their vote
      if (photo.userVoted) {
        // Update local state immediately
        setPhotos(prevPhotos =>
          prevPhotos.map(p =>
            p.id === photoId
              ? { ...p, votes: Math.max(0, p.votes - 1), userVoted: false }
              : p
          )
        );

        const { error: transactionError } = await supabase.rpc(
          'remove_vote',
          { photo_id: photoId, user_id: user.id }
        );

        if (transactionError) {
          // Revert local state if server operation failed
          await fetchPhotos();
          throw new Error('Failed to remove vote: ' + transactionError.message);
        }
        
        return;
      }

      // Check vote limit for adding a new vote
      const userVoteCount = photos.filter(p => p.userVoted).length;
      if (userVoteCount >= FREE_VOTE_LIMIT) {
        throw new Error('To vote for this photo, please remove your vote from another photo first.');
      }

      // Update local state immediately
      setPhotos(prevPhotos =>
        prevPhotos.map(p =>
          p.id === photoId
            ? { ...p, votes: p.votes + 1, userVoted: true }
            : p
        )
      );

      // Add the vote
      const { error: transactionError } = await supabase.rpc(
        'add_vote',
        { photo_id: photoId, user_id: user.id }
      );

      if (transactionError) {
        // Revert local state if server operation failed
        await fetchPhotos();
        throw new Error('Failed to add vote: ' + transactionError.message);
      }

      if (Platform.OS !== 'web') {
        import('expo-haptics').then(Haptics => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        });
      }

    } catch (err: any) {
      console.error('Vote error:', err);
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchPhotos();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchPhotos();
    });

    // Subscribe to realtime changes for both photos and user_votes tables
    const photosSubscription = supabase
      .channel('photos_votes_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'photos' 
        }, 
        () => fetchPhotos()
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_votes'
        },
        () => fetchPhotos()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      photosSubscription.unsubscribe();
    };
  }, []);

  return {
    photos,
    loading,
    error,
    refreshPhotos: fetchPhotos,
    voteForPhoto,
    voteCount: photos.filter(p => p.userVoted).length,
    isSubscribed: false,
  };
}