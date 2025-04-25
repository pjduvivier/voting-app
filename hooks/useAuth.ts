import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signupCooldown, setSignupCooldown] = useState(0);
  const [signupSuccess, setSignupSuccess] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (signupCooldown > 0) {
      const timer = setInterval(() => {
        setSignupCooldown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [signupCooldown]);

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      setSignupSuccess(false);
      
      if (signupCooldown > 0) {
        throw new Error(`Please wait ${signupCooldown} seconds before trying again`);
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        if (error.status === 429) {
          setSignupCooldown(40);
          throw new Error(`Please wait 40 seconds before trying again`);
        }
        throw error;
      }

      if (data.user) {
        setSignupSuccess(true);
        // Automatically try to sign in after successful signup
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    }
  };

  return {
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    signupCooldown,
    signupSuccess,
  };
}