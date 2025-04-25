import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, Platform, Pressable, TextInput, ActivityIndicator } from 'react-native';
import Header from '@/components/Header';
import Colors from '@/constants/Colors';
import { usePhotos } from '@/hooks/usePhotos';
import { LogOut } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'expo-router';

export default function ProfileScreen() {
  const { photos } = usePhotos();
  const { session, loading, error, signIn, signUp, signOut, signupCooldown, signupSuccess } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  
  const votedPhotos = photos.filter(photo => photo.userVoted);

  // Reset form when switching between signup and login
  useEffect(() => {
    setEmail('');
    setPassword('');
    setIsSignUp(false);
  }, [signupSuccess]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
      </View>
    );
  }
  
  if (!session) {
    return (
      <View style={styles.container}>
        <Header title={isSignUp ? "Create Account" : "Sign In"} />
        <View style={styles.authContainer}>
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
          {signupSuccess && !isSignUp && (
            <Text style={styles.successText}>Account created successfully! Please sign in.</Text>
          )}
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Pressable 
            style={[
              styles.authButton,
              (isSignUp && signupCooldown > 0) && styles.authButtonDisabled
            ]}
            disabled={isSignUp && signupCooldown > 0}
            onPress={() => isSignUp ? signUp(email, password) : signIn(email, password)}
          >
            <Text style={styles.authButtonText}>
              {isSignUp 
                ? signupCooldown > 0 
                  ? `Wait ${signupCooldown}s to Sign Up` 
                  : "Sign Up"
                : "Sign In"
              }
            </Text>
          </Pressable>
          <Pressable onPress={() => setIsSignUp(!isSignUp)}>
            <Text style={styles.switchText}>
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const LogoutButton = (
    <Pressable onPress={signOut}>
      <LogOut size={24} color={Colors.gray[700]} />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Header rightElement={LogoutButton} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Image 
            source={{ 
              uri: 'https://bmodel.ch/wp-content/uploads/2023/09/cropped-372068899_3452439348303351_5437177828569484370_n.jpg'
            }} 
            style={styles.avatar} 
          />
          
          <Text style={styles.email}>{session.user.email}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{votedPhotos.length}</Text>
              <Text style={styles.statLabel}>Votes</Text>
            </View>
            <View style={[styles.statItem, styles.statBorder]}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Uploads</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Your Votes</Text>
          {votedPhotos.length > 0 ? (
            <View style={styles.votedPhotosGrid}>
              {votedPhotos.map(photo => (
                <Link key={photo.id} href={`/photo/${photo.id}`} asChild>
                  <Pressable style={styles.votedPhotoContainer}>
                    <Image 
                      source={{ uri: photo.url }} 
                      style={styles.votedPhoto} 
                    />
                    <View style={styles.votedPhotoOverlay}>
                      <Text style={styles.votedPhotoTitle} numberOfLines={2}>
                        {photo.title}
                      </Text>
                    </View>
                  </Pressable>
                </Link>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                You haven't voted for any photos yet.
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Browse the discover tab to find photos you love!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    backgroundColor: Colors.white,
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  email: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: Colors.gray[700],
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.gray[200],
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Colors.gray[800],
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.gray[500],
    marginTop: 4,
  },
  sectionContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Colors.gray[800],
    marginBottom: 16,
  },
  votedPhotosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  votedPhotoContainer: {
    width: '32%',
    aspectRatio: 1,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  votedPhoto: {
    width: '100%',
    height: '100%',
  },
  votedPhotoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
  },
  votedPhotoTitle: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.gray[700],
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.gray[500],
    textAlign: 'center',
  },
  authContainer: {
    padding: 16,
  },
  input: {
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  authButton: {
    backgroundColor: Colors.primary[600],
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  authButtonDisabled: {
    backgroundColor: Colors.gray[400],
  },
  authButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  switchText: {
    color: Colors.primary[600],
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  errorText: {
    color: Colors.error[500],
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Inter-Regular',
  },
  successText: {
    color: Colors.success[500],
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Inter-Regular',
  },
});