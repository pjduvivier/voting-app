import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Colors from '@/constants/Colors';
import { products } from '../src/stripe-config';
import SubscriptionCard from './SubscriptionCard';
import { useSubscription } from '@/hooks/useSubscription';

export default function SubscriptionPlans() {
  const { subscription, loading } = useSubscription();

  if (loading) {
    return null;
  }

  if (subscription?.status === 'active') {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Subscription Plans</Text>
      <Text style={styles.subtitle}>Choose a plan to start voting</Text>
      {Object.keys(products).map((productId) => (
        <SubscriptionCard
          key={productId}
          productId={productId as keyof typeof products}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.gray[800],
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.gray[600],
    marginBottom: 24,
    textAlign: 'center',
  },
});