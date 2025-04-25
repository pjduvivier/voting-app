import React from 'react';
import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Trophy } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { Photo } from '@/types';

interface LeaderboardItemProps {
  photo: Photo;
  rank: number;
}

export default function LeaderboardItem({ photo, rank }: LeaderboardItemProps) {
  // Get medal color based on rank
  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return Colors.gray[400]; // Default
    }
  };

  return (
    <Link href={`/photo/${photo.id}`} asChild>
      <Pressable>
        <View style={styles.container}>
          <View style={styles.rankContainer}>
            {rank <= 3 ? (
              <Trophy size={24} color={getMedalColor(rank)} />
            ) : (
              <Text style={styles.rankText}>{rank}</Text>
            )}
          </View>
          <Image source={{ uri: photo.url }} style={styles.image} />
          <View style={styles.infoContainer}>
            <Text style={styles.title} numberOfLines={1}>{photo.title}</Text>
            <Text style={styles.photographer} numberOfLines={1}>by {photo.photographer}</Text>
          </View>
          <View style={styles.votesContainer}>
            <Text style={styles.votesText}>{photo.votes}</Text>
            <Text style={styles.votesLabel}>votes</Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rankContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: Colors.gray[700],
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: Colors.gray[800],
    marginBottom: 4,
  },
  photographer: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.gray[500],
  },
  votesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 12,
  },
  votesText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.primary[600],
  },
  votesLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.gray[500],
  },
});