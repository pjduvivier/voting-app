import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Colors from '@/constants/Colors';
import { products } from '../src/stripe-config';
import SubscribeButton from './SubscribeButton';

interface SubscriptionCardProps {
  productId: keyof typeof products;
}

export default function SubscriptionCard({ productId }: SubscriptionCardProps) {
  const product = products[productId];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{product.name}</Text>
      <Text style={styles.description}>{product.description}</Text>
      <View style={styles.buttonContainer}>
        <SubscribeButton productId={productId} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.gray[800],
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.gray[600],
    marginBottom: 24,
  },
  buttonContainer: {
    alignItems: 'center',
  },
});