import React from 'react';
import { StyleSheet, Text, Pressable, ActivityIndicator } from 'react-native';
import Colors from '@/constants/Colors';
import { useStripe } from '@/hooks/useStripe';

interface SubscribeButtonProps {
  productId: string;
}

export default function SubscribeButton({ productId }: SubscribeButtonProps) {
  const { loading, error, createCheckoutSession } = useStripe();

  const handlePress = () => {
    createCheckoutSession(productId as any);
  };

  return (
    <>
      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handlePress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <Text style={styles.buttonText}>Subscribe Now</Text>
        )}
      </Pressable>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary[600],
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  errorText: {
    color: Colors.error[500],
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 8,
    textAlign: 'center',
  },
});