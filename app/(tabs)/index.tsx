import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { usePhotos } from '@/hooks/usePhotos';
import PhotoGrid from '@/components/PhotoGrid';
import Header from '@/components/Header';
import Colors from '@/constants/Colors';

export default function DiscoverScreen() {
  const { 
    photos, 
    loading, 
    error, 
    refreshPhotos, 
    voteForPhoto,
    voteCount,
    isSubscribed
  } = usePhotos();

  return (
    <View style={styles.container}>
      <Header />
      <PhotoGrid
        photos={photos}
        loading={loading}
        error={error}
        onRefresh={refreshPhotos}
        onVote={voteForPhoto}
        voteCount={voteCount}
        isSubscribed={isSubscribed}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
});