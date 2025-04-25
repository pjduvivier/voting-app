import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import Colors from '@/constants/Colors';
import { useSubscription } from '@/hooks/useSubscription';

export default function SubscriptionStatus() {
  const { subscription, loading, error } = useSubscription();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={Colors.primary[500]} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error loading subscription status</Text>
      </View>
    );
  }

  if (!subscription) {
    return null;
  }

  const isActive = subscription.status === 'active';
  const isPastDue = subscription.status === 'past_due';
  const isCanceled = subscription.status === 'canceled';

  let statusColor = Colors.success[500];
  if (isPastDue) statusColor = Colors.warning[500];
  if (isCanceled) statusColor = Colors.error[500];

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: statusColor }]}>
        <Text style={styles.badgeText}>
          {isActive && 'Active Subscription'}
          {isPastDue && 'Payment Past Due'}
          {isCanceled && 'Subscription Canceled'}
          {!isActive && !isPastDue && !isCanceled && subscription.status}
        </Text>
      </View>
      {subscription.cancel_at_period_end && (
        <Text style={styles.cancelText}>
          Your subscription will end on {new Date(subscription.current_period_end! * 1000).toLocaleDateString()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: Colors.success[500],
  },
  badgeText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  cancelText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.gray[600],
  },
  errorText: {
    color: Colors.error[500],
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
});