import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, Pressable, Platform } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { ArrowLeft, Heart } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { usePhotos } from '@/hooks/usePhotos';

export default function PhotoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { photos, voteForPhoto } = usePhotos();
  const [error, setError] = useState<string | null>(null);
  
  const photo = photos.find(p => p.id === id);
  
  if (!photo) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Photo not found</Text>
      </View>
    );
  }

  const handleVote = async () => {
    try {
      await voteForPhoto(photo.id);
      setError(null); // Clear any previous errors on success
    } catch (err: any) {
      if (err.message.includes('remove your vote from another photo')) {
        setError(err.message);
      } else {
        setError('An error occurred while voting. Please try again.');
      }
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // If we can't go back, navigate to the home screen
      router.replace('/(tabs)');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Unknown date';
    }
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: '',
          headerLeft: () => (
            <Pressable 
              style={styles.backButton} 
              onPress={handleBack}
            >
              <ArrowLeft size={24} color={Colors.gray[800]} />
            </Pressable>
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {photo.url && <Image source={{ uri: photo.url }} style={styles.image} />}
        <View style={styles.detailsContainer}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>{photo.title}</Text>
              <Text style={styles.photographer}>by {photo.photographer}</Text>
            </View>
            <Pressable style={styles.actionButton} onPress={handleVote}>
              <Heart 
                size={24} 
                color={photo.userVoted ? Colors.accent[500] : Colors.gray[700]} 
                fill={photo.userVoted ? Colors.accent[500] : 'transparent'} 
              />
            </Pressable>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{photo.votes}</Text>
              <Text style={styles.statLabel}>Votes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatDate(photo.dateAdded)}</Text>
              <Text style={styles.statLabel}>Date Added</Text>
            </View>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessage}>{error}</Text>
            </View>
          )}
          
          {photo.description && (
            <View style={styles.biographyContainer}>
              <Text style={styles.biographyTitle}>Biography</Text>
              <Text style={styles.biography}>{photo.description}</Text>
            </View>
          )}
          
          <View style={styles.voteButtonContainer}>
            <Pressable 
              style={[
                styles.voteButton,
                photo.userVoted && styles.votedButton
              ]} 
              onPress={handleVote}
            >
              <Heart 
                size={20} 
                color={photo.userVoted ? Colors.white : Colors.primary[600]} 
                fill={photo.userVoted ? Colors.white : 'transparent'} 
              />
              <Text style={[
                styles.voteButtonText,
                photo.userVoted && styles.votedButtonText
              ]}>
                {photo.userVoted ? 'Voted' : 'Vote for this photo'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.error[500],
    textAlign: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    marginTop: Platform.OS === 'ios' ? 0 : 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 400,
    resizeMode: 'cover',
  },
  detailsContainer: {
    padding: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.gray[800],
    marginBottom: 4,
  },
  photographer: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.gray[500],
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: 12,
  },
  statItem: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.gray[800],
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.gray[500],
  },
  errorContainer: {
    backgroundColor: Colors.error[50],
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.error[200],
  },
  errorMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.error[700],
    textAlign: 'center',
  },
  biographyContainer: {
    marginBottom: 24,
  },
  biographyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.gray[800],
    marginBottom: 8,
  },
  biography: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.gray[700],
    lineHeight: 24,
  },
  voteButtonContainer: {
    marginTop: 8,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: Colors.primary[600],
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  votedButton: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.primary[700],
  },
  voteButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.primary[600],
    marginLeft: 8,
  },
  votedButtonText: {
    color: Colors.white,
  },
});