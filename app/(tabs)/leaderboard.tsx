import React, { useMemo } from 'react';
import { StyleSheet, View, FlatList, Platform, Text, ActivityIndicator } from 'react-native';
import { usePhotos } from '@/hooks/usePhotos';
import LeaderboardItem from '@/components/LeaderboardItem';
import Header from '@/components/Header';
import Colors from '@/constants/Colors';

export default function LeaderboardScreen() {
  const { photos, loading, error, refreshPhotos } = usePhotos();
  
  const sortedPhotos = useMemo(() => {
    return [...photos].sort((a, b) => b.votes - a.votes);
  }, [photos]);

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title="Leaderboard" 
        subtitle="Top voted photos" 
      />
      {loading && photos.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
        </View>
      ) : (
        <FlatList
          data={sortedPhotos}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <LeaderboardItem photo={item} rank={index + 1} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onRefresh={refreshPhotos}
          refreshing={loading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  list: {
    padding: 16,
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
});