import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { authService } from '../services/authService';
import { User, UserProfile } from '../types';
import { db } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
  try {
    let { data } = await db.profiles()
      .select('*')
      .eq('user_id', userId)
      .single();

    // If no profile exists, create one
    if (!data) {
      const { data: newProfile } = await db.profiles()
        .insert({
          user_id: userId,
          name: user?.email?.split('@')[0] || 'Luna User',
          average_cycle_length: 28,
          average_period_length: 5,
        })
        .select()
        .single();
      data = newProfile;
    }

    setProfile(data);
  } catch (e) {
    console.log('Profile load error:', e);
  }
}, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user as any);
        loadProfile(session.user.id);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user as any);
        await loadProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await authService.signIn(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      await authService.signUp(email, password, name);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setProfile(null);
  };

  const forgotPassword = async (email: string) => {
    await authService.forgotPassword(email);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const { data } = await db.profiles()
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .select()
      .single();
    if (data) setProfile(data);
  };

  const refreshProfile = async () => {
    if (user) await loadProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isLoading,
      isAuthenticated: !!user,
      signIn,
      signUp,
      signOut,
      forgotPassword,
      updateProfile,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
