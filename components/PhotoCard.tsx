import React from 'react';
import { StyleSheet, Text, View, Image, Pressable, Dimensions } from 'react-native';
import { Heart } from 'lucide-react-native';
import { Link } from 'expo-router';
import Colors from '@/constants/Colors';
import { Photo } from '@/types';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const cardWidth = width > 700 ? width / 2 - 24 : width - 32;

interface PhotoCardProps {
  photo: Photo;
  onVote: (id: string) => void;
  voteCount: number;
  isSubscribed: boolean;
}

export default function PhotoCard({ photo, onVote, voteCount, isSubscribed }: PhotoCardProps) {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handleVotePress = () => {
    scale.value = withSpring(1.1, {}, () => {
      scale.value = withSpring(1);
    });
    onVote(photo.id);
  };

  const showVoteLimit = !isSubscribed && !photo.userVoted && voteCount >= 6;

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <Link href={`/photo/${photo.id}`} asChild>
        <Pressable>
          <Image source={{ uri: photo.url }} style={styles.image} />
          <View style={styles.infoContainer}>
            <View>
              <Text style={styles.title}>{photo.title}</Text>
              <Text style={styles.photographer}>by {photo.photographer}</Text>
            </View>
            <Pressable 
              style={[
                styles.voteButton,
                showVoteLimit && styles.voteButtonDisabled
              ]} 
              onPress={(e) => {
                e.stopPropagation();
                handleVotePress();
              }}
              disabled={showVoteLimit}
            >
              <Heart 
                size={24} 
                color={photo.userVoted ? Colors.accent[500] : Colors.gray[400]}
                fill={photo.userVoted ? Colors.accent[500] : 'transparent'} 
              />
              <Text style={[
                styles.voteCount,
                photo.userVoted && styles.votedText
              ]}>
                {photo.votes}
              </Text>
              {showVoteLimit && (
                <Text style={styles.limitText}>Subscribe to vote more</Text>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Link>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 240,
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.gray[800],
    marginBottom: 4,
  },
  photographer: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.gray[500],
  },
  voteButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  voteButtonDisabled: {
    opacity: 0.5,
  },
  voteCount: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.gray[600],
    marginTop: 4,
  },
  votedText: {
    color: Colors.accent[500],
  },
  limitText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: Colors.gray[500],
    marginTop: 2,
    textAlign: 'center',
  },
});