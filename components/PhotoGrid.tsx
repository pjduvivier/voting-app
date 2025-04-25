import React from 'react';
import { StyleSheet, View, FlatList, Text, ActivityIndicator, RefreshControl } from 'react-native';
import PhotoCard from './PhotoCard';
import { Photo } from '@/types';
import Colors from '@/constants/Colors';

interface PhotoGridProps {
  photos: Photo[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onVote: (id: string) => void;
  voteCount: number;
  isSubscribed: boolean;
}

export default function PhotoGrid({ 
  photos, 
  loading, 
  error, 
  onRefresh, 
  onVote,
  voteCount,
  isSubscribed
}: PhotoGridProps) {
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (loading && photos.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
      </View>
    );
  }

  return (
    <FlatList
      data={photos}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <PhotoCard 
          photo={item} 
          onVote={onVote}
          voteCount={voteCount}
          isSubscribed={isSubscribed}
        />
      )}
      contentContainerStyle={styles.grid}
      numColumns={1}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={onRefresh}
          colors={[Colors.primary[500]]}
          tintColor={Colors.primary[500]}
        />
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No photos available</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  grid: {
    padding: 16,
    alignItems: 'center',
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
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.gray[500],
    textAlign: 'center',
  },
});