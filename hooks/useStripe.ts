import { useState } from 'react';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import { products } from '@/src/stripe-config';

export function useStripe() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkNetworkAndSupabase = async () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && !window.navigator.onLine) {
      throw new Error('No internet connection. Please check your network and try again.');
    }

    try {
      // Test Supabase connection
      const { error: authError } = await supabase.auth.getSession();
      if (authError) throw authError;
    } catch (err) {
      throw new Error('Unable to connect to the server. Please try again later.');
    }
  };

  const createCheckoutSession = async (productId: keyof typeof products) => {
    try {
      setLoading(true);
      setError(null);

      // Check network and Supabase connection first
      await checkNetworkAndSupabase();

      const product = products[productId];
      if (!product) {
        throw new Error('Invalid product');
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('Authentication required. Please sign in and try again.');
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: product.priceId,
          success_url: `${window.location.origin}/profile?checkout=success`,
          cancel_url: `${window.location.origin}/profile?checkout=canceled`,
          mode: product.mode,
        }),
      }).catch(err => {
        if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
          throw new Error('Network error: Unable to reach the server. Please check your connection and try again.');
        }
        throw err;
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status} - ${response.statusText}`);
      }

      const { url } = await response.json();
      if (!url) {
        throw new Error('No checkout URL received');
      }

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createCheckoutSession,
  };
}