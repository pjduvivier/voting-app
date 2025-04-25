import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useSubscription() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<{
    status: string;
    current_period_end: number | null;
    cancel_at_period_end: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setSubscription(null);
          return;
        }

        const { data, error } = await supabase
          .from('stripe_user_subscriptions')
          .select('subscription_status, current_period_end, cancel_at_period_end')
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (data) {
          setSubscription({
            status: data.subscription_status,
            current_period_end: data.current_period_end,
            cancel_at_period_end: data.cancel_at_period_end,
          });
        } else {
          setSubscription(null);
        }
      } catch (err: any) {
        console.error('Error fetching subscription:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchSubscription();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    subscription,
    loading,
    error,
  };
}